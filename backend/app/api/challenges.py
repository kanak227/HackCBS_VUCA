"""
Challenges API Routes
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
from datetime import datetime, timedelta
import uuid

from app.db.database import get_db
from app.db.models import Challenge, Submission
from app.services.flexai_solana_service import flexai_solana_service
from pydantic import BaseModel, Field

router = APIRouter()

# Pydantic models
class ChallengeCreate(BaseModel):
    title: str
    description: str
    company_name: str
    creator_address: str
    baseline_model_hash: str
    baseline_accuracy: float = Field(..., ge=0.0, le=1.0)
    reward_amount: float = Field(..., gt=0)
    reward_token_mint: Optional[str] = None
    deadline: datetime

class ChallengeResponse(BaseModel):
    id: int
    challenge_id: str
    title: str
    description: str
    company_name: str
    creator_address: str
    baseline_model_hash: str
    baseline_accuracy: float
    reward_amount: float
    reward_token_mint: Optional[str]
    deadline: datetime
    status: str
    total_submissions: int
    approved_submissions: int
    solana_tx_hash: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

class ChallengeListResponse(BaseModel):
    challenges: List[ChallengeResponse]
    total: int

@router.post("/", response_model=ChallengeResponse, status_code=status.HTTP_201_CREATED)
async def create_challenge(challenge_data: ChallengeCreate, db: Session = Depends(get_db)):
    """Create a new AI fine-tuning challenge"""
    try:
        # Generate unique challenge ID
        challenge_id = str(uuid.uuid4())
        
        # Create challenge on blockchain
        try:
            tx_hash = await flexai_solana_service.create_challenge(
                challenge_id=challenge_id,
                creator_address=challenge_data.creator_address,
                reward_amount=challenge_data.reward_amount,
                deadline=challenge_data.deadline,
                baseline_accuracy=challenge_data.baseline_accuracy,
                token_mint=challenge_data.reward_token_mint
            )
        except Exception as e:
            # If blockchain transaction fails, still create DB record
            # In production, you might want to fail here
            tx_hash = None
            print(f"Blockchain transaction failed: {e}")
        
        # Create database record
        db_challenge = Challenge(
            challenge_id=challenge_id,
            title=challenge_data.title,
            description=challenge_data.description,
            company_name=challenge_data.company_name,
            creator_address=challenge_data.creator_address,
            baseline_model_hash=challenge_data.baseline_model_hash,
            baseline_accuracy=challenge_data.baseline_accuracy,
            reward_amount=challenge_data.reward_amount,
            reward_token_mint=challenge_data.reward_token_mint,
            deadline=challenge_data.deadline,
            status="active",
            solana_tx_hash=tx_hash
        )
        
        db.add(db_challenge)
        db.commit()
        db.refresh(db_challenge)
        
        return db_challenge
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating challenge: {str(e)}"
        )

@router.get("/", response_model=ChallengeListResponse)
async def list_challenges(
    status_filter: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """List all challenges"""
    try:
        query = db.query(Challenge)
        
        if status_filter:
            query = query.filter(Challenge.status == status_filter)
        
        # Filter out expired challenges
        now = datetime.utcnow()
        query = query.filter(Challenge.deadline > now)
        
        total = query.count()
        challenges = query.order_by(desc(Challenge.created_at)).offset(skip).limit(limit).all()
        
        return ChallengeListResponse(challenges=challenges, total=total)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error listing challenges: {str(e)}"
        )

@router.get("/{challenge_id}", response_model=ChallengeResponse)
async def get_challenge(challenge_id: str, db: Session = Depends(get_db)):
    """Get a specific challenge by ID"""
    try:
        challenge = db.query(Challenge).filter(Challenge.challenge_id == challenge_id).first()
        if not challenge:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Challenge not found"
            )
        return challenge
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting challenge: {str(e)}"
        )

@router.get("/{challenge_id}/submissions")
async def get_challenge_submissions(challenge_id: str, db: Session = Depends(get_db)):
    """Get all submissions for a challenge"""
    try:
        challenge = db.query(Challenge).filter(Challenge.challenge_id == challenge_id).first()
        if not challenge:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Challenge not found"
            )
        
        submissions = db.query(Submission).filter(Submission.challenge_id == challenge.id).all()
        return {"submissions": submissions, "total": len(submissions)}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting submissions: {str(e)}"
        )
