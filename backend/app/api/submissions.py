"""
Submissions API Routes
"""
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
from datetime import datetime
import hashlib
import uuid

from app.db.database import get_db
from app.db.models import Challenge, Submission, Evaluation, ContributorReputation
from app.services.flexai_solana_service import flexai_solana_service
from app.services.gemini_service import gemini_service
from pydantic import BaseModel, Field

router = APIRouter()

# Pydantic models
class SubmissionCreate(BaseModel):
    challenge_id: str
    contributor_address: str
    model_ipfs_hash: Optional[str] = None
    metadata_ipfs_hash: Optional[str] = None
    model_file_hash: Optional[str] = None  # Hash of uploaded model file

class SubmissionResponse(BaseModel):
    id: int
    challenge_id: int
    contributor_address: str
    model_hash: str
    model_ipfs_hash: Optional[str]
    metadata_ipfs_hash: Optional[str]
    accuracy: Optional[float]
    status: str
    submitted_at: datetime
    approved_at: Optional[datetime]
    rejected_at: Optional[datetime]
    rejection_reason: Optional[str]
    solana_tx_hash: Optional[str]
    reward_tx_hash: Optional[str]
    reward_amount: float
    
    class Config:
        from_attributes = True

class SubmissionWithChallengeResponse(SubmissionResponse):
    challenge_title: Optional[str] = None
    challenge_reward_amount: Optional[float] = None
    challenge_id_string: Optional[str] = None

@router.post("/", response_model=SubmissionResponse, status_code=status.HTTP_201_CREATED)
async def submit_model(
    submission_data: SubmissionCreate,
    db: Session = Depends(get_db)
):
    """Submit a fine-tuned model for a challenge"""
    try:
        # Get challenge
        challenge = db.query(Challenge).filter(Challenge.challenge_id == submission_data.challenge_id).first()
        if not challenge:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Challenge not found"
            )
        
        # Check if challenge is still active
        if challenge.status != "active":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Challenge is not active"
            )
        
        # Check deadline
        if datetime.utcnow() > challenge.deadline:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Challenge deadline has passed"
            )
        
        # Generate model hash
        model_hash = submission_data.model_file_hash or submission_data.model_ipfs_hash or str(uuid.uuid4())
        if len(model_hash) > 64:
            model_hash = hashlib.sha256(model_hash.encode()).hexdigest()
        
        # Generate metadata hash
        metadata_hash = submission_data.metadata_ipfs_hash or str(uuid.uuid4())
        if len(metadata_hash) > 64:
            metadata_hash = hashlib.sha256(metadata_hash.encode()).hexdigest()
        
        # Submit to blockchain
        try:
            tx_hash = await flexai_solana_service.submit_model(
                challenge_id=submission_data.challenge_id,
                contributor_address=submission_data.contributor_address,
                model_hash=model_hash,
                accuracy=0.0,  # Will be updated after evaluation
                metadata_hash=metadata_hash
            )
        except Exception as e:
            tx_hash = None
            print(f"Blockchain transaction failed: {e}")
        
        # Create database record
        db_submission = Submission(
            challenge_id=challenge.id,
            contributor_address=submission_data.contributor_address,
            model_hash=model_hash,
            model_ipfs_hash=submission_data.model_ipfs_hash,
            metadata_ipfs_hash=submission_data.metadata_ipfs_hash,
            status="pending",
            solana_tx_hash=tx_hash
        )
        
        db.add(db_submission)
        db.commit()
        db.refresh(db_submission)
        
        # Trigger evaluation (async)
        try:
            evaluation_result = await gemini_service.evaluate_model(
                challenge_id=submission_data.challenge_id,
                model_hash=model_hash,
                baseline_accuracy=challenge.baseline_accuracy
            )
            
            # Create evaluation record
            db_evaluation = Evaluation(
                challenge_id=challenge.id,
                submission_id=db_submission.id,
                accuracy=evaluation_result["accuracy"],
                precision=evaluation_result["precision"],
                recall=evaluation_result["recall"],
                f1_score=evaluation_result["f1_score"],
                loss=evaluation_result["loss"],
                evaluation_metrics=evaluation_result,
                evaluation_report=evaluation_result["report"]
            )
            
            # Update submission with accuracy
            db_submission.accuracy = evaluation_result["accuracy"]
            
            db.add(db_evaluation)
            db.commit()
        except Exception as e:
            print(f"Error evaluating model: {e}")
            # Continue without evaluation
        
        return db_submission
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error submitting model: {str(e)}"
        )

@router.get("/", response_model=List[SubmissionResponse])
async def list_submissions(
    challenge_id: Optional[str] = None,
    contributor_address: Optional[str] = None,
    status_filter: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    include_challenge: bool = False,
    db: Session = Depends(get_db)
):
    """List all submissions"""
    try:
        query = db.query(Submission)
        
        if challenge_id:
            challenge = db.query(Challenge).filter(Challenge.challenge_id == challenge_id).first()
            if challenge:
                query = query.filter(Submission.challenge_id == challenge.id)
        
        if contributor_address:
            query = query.filter(Submission.contributor_address == contributor_address)
        
        if status_filter:
            query = query.filter(Submission.status == status_filter)
        
        submissions = query.order_by(desc(Submission.submitted_at)).offset(skip).limit(limit).all()
        
        # If include_challenge is True, add challenge info
        if include_challenge:
            result = []
            for submission in submissions:
                challenge = db.query(Challenge).filter(Challenge.id == submission.challenge_id).first()
                submission_dict = {
                    **submission.__dict__,
                    "challenge_title": challenge.title if challenge else None,
                    "challenge_reward_amount": challenge.reward_amount if challenge else None,
                    "challenge_id_string": challenge.challenge_id if challenge else None,
                }
                result.append(submission_dict)
            return result
        
        return submissions
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error listing submissions: {str(e)}"
        )

@router.get("/{submission_id}", response_model=SubmissionResponse)
async def get_submission(submission_id: int, db: Session = Depends(get_db)):
    """Get a specific submission"""
    try:
        submission = db.query(Submission).filter(Submission.id == submission_id).first()
        if not submission:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Submission not found"
            )
        return submission
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting submission: {str(e)}"
        )
