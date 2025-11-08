"""
Training API endpoints for federated learning coordination
"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
from collections import defaultdict
from pydantic import BaseModel
from datetime import datetime
import uuid
import json

from app.db.database import get_db
from app.db.models import TrainingSession, TrainingRound, Contribution, ModelCheckpoint
from app.core.security import EncryptionService, LocalDifferentialPrivacy, CommitmentHash
from app.services.federated_learning import FederatedLearningService
from app.services.solana_service import SolanaService

router = APIRouter()

# Request/Response models
class TrainingSessionCreate(BaseModel):
    model_architecture: dict
    trainer_address: str
    total_rounds: int
    min_contributors: int = 3
    reward_per_contributor: float = 100.0
    accuracy_threshold: float = 0.8

class TrainingSessionResponse(BaseModel):
    session_id: str
    model_hash: str
    status: str
    current_round: int
    total_rounds: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class JoinTrainingRequest(BaseModel):
    session_id: str
    contributor_address: str

class SubmitUpdateRequest(BaseModel):
    session_id: str
    round_id: int
    contributor_address: str
    gradient_hash: str
    commitment_hash: str
    nonce: str
    accuracy: float
    privacy_score: float
    encrypted_gradients: str  # Base64 encoded

@router.post("/register_model", response_model=TrainingSessionResponse)
async def register_model(
    request: TrainingSessionCreate,
    db: Session = Depends(get_db)
):
    """Register a new model training session - REAL SOLANA TRANSACTION"""
    try:
        # Generate session ID
        session_id = str(uuid.uuid4())
        
        # Create model hash
        import hashlib
        model_str = json.dumps(request.model_architecture, sort_keys=True)
        model_hash = hashlib.sha256(model_str.encode()).hexdigest()
        
        # Create training session
        session = TrainingSession(
            session_id=session_id,
            model_hash=model_hash,
            model_architecture=model_str,
            trainer_address=request.trainer_address,
            total_rounds=request.total_rounds,
            min_contributors=request.min_contributors,
            reward_per_contributor=request.reward_per_contributor,
            accuracy_threshold=request.accuracy_threshold,
            status="pending"
        )
        
        db.add(session)
        db.commit()
        db.refresh(session)
        
        # Register on Solana blockchain (REAL TRANSACTION)
        solana_service = SolanaService()
        try:
            tx_hash = await solana_service.register_training_session(
                session_id=session_id,
                trainer_address=request.trainer_address,
                model_hash=model_hash,
                total_rounds=request.total_rounds
            )
            # Store transaction hash in session
            session.status = "active"
            db.commit()
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=500, detail=f"Solana registration failed: {str(e)}")
        
        return TrainingSessionResponse(
            session_id=session.session_id,
            model_hash=session.model_hash,
            status=session.status,
            current_round=session.current_round,
            total_rounds=session.total_rounds,
            created_at=session.created_at
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/join_training")
async def join_training(
    request: JoinTrainingRequest,
    db: Session = Depends(get_db)
):
    """Contributor joins a training session"""
    session = db.query(TrainingSession).filter(
        TrainingSession.session_id == request.session_id
    ).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Training session not found")
    
    if session.status != "active" and session.status != "pending":
        raise HTTPException(status_code=400, detail="Session is not accepting contributors")
    
    # Log contributor join (could add to a contributors table)
    return {
        "session_id": session.session_id,
        "status": "joined",
        "current_round": session.current_round,
        "message": "Successfully joined training session"
    }

@router.post("/submit_update")
async def submit_update(
    request: SubmitUpdateRequest,
    db: Session = Depends(get_db)
):
    """Submit encrypted gradient update - REAL SOLANA TRANSACTION"""
    # Verify session and round
    session = db.query(TrainingSession).filter(
        TrainingSession.session_id == request.session_id
    ).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Training session not found")
    
    round_obj = db.query(TrainingRound).filter(
        TrainingRound.session_id == session.id,
        TrainingRound.round_number == request.round_id
    ).first()
    
    if not round_obj:
        raise HTTPException(status_code=404, detail="Training round not found")
    
    # Create contribution record
    contribution = Contribution(
        session_id=session.id,
        round_id=round_obj.id,
        contributor_address=request.contributor_address,
        gradient_hash=request.gradient_hash,
        commitment_hash=request.commitment_hash,
        nonce=request.nonce,
        accuracy=request.accuracy,
        privacy_score=request.privacy_score,
        encrypted_gradients=request.encrypted_gradients,
        status="pending"
    )
    
    db.add(contribution)
    
    # Update round contributor count
    round_obj.contributors_count += 1
    db.commit()
    
    # Log contribution on Solana (REAL TRANSACTION)
    solana_service = SolanaService()
    try:
        tx_hash = await solana_service.log_contribution(
            session_id=request.session_id,
            contributor_address=request.contributor_address,
            round_id=request.round_id,
            gradient_hash=request.gradient_hash
        )
        contribution.solana_tx_hash = tx_hash
        contribution.status = "verified"
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Solana logging failed: {str(e)}")
    
    return {
        "contribution_id": contribution.id,
        "status": "submitted",
        "solana_tx_hash": contribution.solana_tx_hash
    }

@router.post("/aggregate/{session_id}/{round_id}")
async def aggregate_updates(
    session_id: str,
    round_id: int,
    db: Session = Depends(get_db)
):
    """Aggregate gradient updates for a round"""
    # Get session and round
    session = db.query(TrainingSession).filter(
        TrainingSession.session_id == session_id
    ).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    round_obj = db.query(TrainingRound).filter(
        TrainingRound.session_id == session.id,
        TrainingRound.round_number == round_id
    ).first()
    
    if not round_obj:
        raise HTTPException(status_code=404, detail="Round not found")
    
    # Get all contributions for this round
    contributions = db.query(Contribution).filter(
        Contribution.round_id == round_obj.id,
        Contribution.status == "pending"
    ).all()
    
    if len(contributions) < session.min_contributors:
        raise HTTPException(
            status_code=400,
            detail=f"Not enough contributors. Need {session.min_contributors}, got {len(contributions)}"
        )
    
    # Aggregate using federated learning service
    fl_service = FederatedLearningService()
    aggregated_model = await fl_service.aggregate_gradients(
        contributions=contributions,
        session=session
    )
    
    # Update round status
    round_obj.status = "completed"
    round_obj.aggregated_model_hash = aggregated_model["model_hash"]
    round_obj.accuracy = aggregated_model["accuracy"]
    round_obj.completed_at = datetime.utcnow()
    
    # Update session
    session.current_round += 1
    if session.current_round >= session.total_rounds:
        session.status = "completed"
    
    db.commit()
    
    return {
        "session_id": session_id,
        "round_id": round_id,
        "aggregated_model_hash": aggregated_model["model_hash"],
        "accuracy": aggregated_model["accuracy"],
        "contributors_count": len(contributions)
    }

@router.get("/sessions/{session_id}")
async def get_session(
    session_id: str,
    db: Session = Depends(get_db)
):
    """Get training session details from database and on-chain"""
    # Get from database
    session = db.query(TrainingSession).filter(
        TrainingSession.session_id == session_id
    ).first()
    
    # Also try to get from on-chain
    solana_service = SolanaService()
    onchain_sessions = await solana_service.get_training_sessions_onchain()
    onchain_session = next((s for s in onchain_sessions if s.get("session_id") == session_id), None)
    
    if session:
        return {
            "session_id": session.session_id,
            "model_hash": session.model_hash,
            "status": session.status,
            "current_round": session.current_round,
            "total_rounds": session.total_rounds,
            "trainer_address": session.trainer_address,
            "created_at": session.created_at,
            "source": "database"
        }
    elif onchain_session:
        return {
            **onchain_session,
            "source": "onchain"
        }
    else:
        raise HTTPException(status_code=404, detail="Session not found")

@router.get("/sessions")
async def list_sessions(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """List all training sessions from database and on-chain"""
    # Get from database
    db_sessions = db.query(TrainingSession).offset(skip).limit(limit).all()
    
    # Also fetch from on-chain
    solana_service = SolanaService()
    onchain_sessions = await solana_service.get_training_sessions_onchain()
    
    # Merge and return
    sessions_list = []
    
    # Add database sessions
    for s in db_sessions:
        sessions_list.append({
            "session_id": s.session_id,
            "model_hash": s.model_hash,
            "status": s.status,
            "current_round": s.current_round,
            "total_rounds": s.total_rounds,
            "trainer_address": s.trainer_address,
            "created_at": s.created_at,
            "source": "database"
        })
    
    # Add on-chain sessions (avoid duplicates)
    existing_ids = {s["session_id"] for s in sessions_list if s.get("session_id")}
    for onchain in onchain_sessions:
        if onchain.get("session_id") and onchain["session_id"] not in existing_ids:
            sessions_list.append({
                **onchain,
                "source": "onchain"
            })
    
    return sessions_list

@router.get("/sessions/onchain")
async def get_onchain_sessions(
    trainer_address: Optional[str] = None
):
    """Get training sessions directly from blockchain"""
    solana_service = SolanaService()
    sessions = await solana_service.get_training_sessions_onchain(trainer_address)
    return {
        "sessions": sessions,
        "count": len(sessions),
        "source": "blockchain"
    }

@router.get("/sessions/{session_id}/contributions")
async def get_session_contributions(
    session_id: str,
    db: Session = Depends(get_db)
):
    """Get contributions for a session from database and on-chain"""
    # Get from database
    session = db.query(TrainingSession).filter(
        TrainingSession.session_id == session_id
    ).first()
    
    db_contributions = []
    if session:
        db_contributions = db.query(Contribution).filter(
            Contribution.session_id == session.id
        ).all()
    
    # Get from on-chain
    solana_service = SolanaService()
    onchain_contributions = await solana_service.get_contributions_onchain(session_id)
    
    # Combine and return
    contributions = []
    
    # Database contributions
    for c in db_contributions:
        contributions.append({
            "contributor_address": c.contributor_address,
            "round_id": c.round_id,
            "gradient_hash": c.gradient_hash,
            "accuracy": c.accuracy,
            "privacy_score": c.privacy_score,
            "status": c.status,
            "solana_tx_hash": c.solana_tx_hash,
            "created_at": c.created_at,
            "source": "database"
        })
    
    # On-chain contributions
    existing_hashes = {c["gradient_hash"] for c in contributions if c.get("gradient_hash")}
    for onchain in onchain_contributions:
        if onchain.get("gradient_hash") and onchain["gradient_hash"] not in existing_hashes:
            contributions.append({
                **onchain,
                "source": "onchain"
            })
    
    return {
        "session_id": session_id,
        "contributions": contributions,
        "count": len(contributions)
    }
