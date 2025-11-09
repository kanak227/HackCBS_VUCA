"""
Admin API Routes - For moderators to approve/reject submissions
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime

from app.db.database import get_db
from app.db.models import Challenge, Submission, Evaluation, ContributorReputation, Reward
from app.services.flexai_solana_service import flexai_solana_service
from pydantic import BaseModel

router = APIRouter()

# Pydantic models
class ApprovalRequest(BaseModel):
    submission_id: int
    moderator_address: str

class RejectionRequest(BaseModel):
    submission_id: int
    moderator_address: str
    reason: str

@router.post("/approve", status_code=status.HTTP_200_OK)
async def approve_submission(
    approval_data: ApprovalRequest,
    db: Session = Depends(get_db)
):
    """Approve a model submission and release reward"""
    try:
        # Get submission
        submission = db.query(Submission).filter(Submission.id == approval_data.submission_id).first()
        if not submission:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Submission not found"
            )
        
        if submission.status != "pending":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Submission already {submission.status}"
            )
        
        # Get challenge
        challenge = db.query(Challenge).filter(Challenge.id == submission.challenge_id).first()
        if not challenge:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Challenge not found"
            )
        
        # Get evaluation
        evaluation = db.query(Evaluation).filter(Evaluation.submission_id == submission.id).first()
        if not evaluation:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Submission has not been evaluated yet"
            )
        
        # Approve on blockchain
        try:
            reward_tx_hash = await flexai_solana_service.approve_model(
                challenge_id=challenge.challenge_id,
                contributor_address=submission.contributor_address,
                reward_amount=challenge.reward_amount
            )
        except Exception as e:
            reward_tx_hash = None
            print(f"Blockchain approval failed: {e}")
        
        # Update submission
        submission.status = "approved"
        submission.approved_at = datetime.utcnow()
        submission.reward_tx_hash = reward_tx_hash
        submission.reward_amount = challenge.reward_amount
        
        # Update challenge stats
        challenge.approved_submissions += 1
        
        # Update or create contributor reputation
        reputation = db.query(ContributorReputation).filter(
            ContributorReputation.contributor_address == submission.contributor_address
        ).first()
        
        if not reputation:
            reputation = ContributorReputation(
                contributor_address=submission.contributor_address,
                total_approved=1,
                total_rewards=challenge.reward_amount
            )
            db.add(reputation)
        else:
            reputation.total_approved += 1
            reputation.total_rewards += challenge.reward_amount
        
        # Create reward record
        reward = Reward(
            contributor_address=submission.contributor_address,
            challenge_id=challenge.id,
            submission_id=submission.id,
            amount=challenge.reward_amount,
            token_amount=challenge.reward_amount,
            token_mint=challenge.reward_token_mint,
            solana_tx_hash=reward_tx_hash,
            status="completed" if reward_tx_hash else "pending"
        )
        
        if reward_tx_hash:
            reward.completed_at = datetime.utcnow()
        
        db.add(reward)
        db.commit()
        db.refresh(submission)
        
        return {
            "message": "Submission approved successfully",
            "submission_id": submission.id,
            "reward_tx_hash": reward_tx_hash,
            "reward_amount": challenge.reward_amount
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error approving submission: {str(e)}"
        )

@router.post("/reject", status_code=status.HTTP_200_OK)
async def reject_submission(
    rejection_data: RejectionRequest,
    db: Session = Depends(get_db)
):
    """Reject a model submission"""
    try:
        # Get submission
        submission = db.query(Submission).filter(Submission.id == rejection_data.submission_id).first()
        if not submission:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Submission not found"
            )
        
        if submission.status != "pending":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Submission already {submission.status}"
            )
        
        # Update submission
        submission.status = "rejected"
        submission.rejected_at = datetime.utcnow()
        submission.rejection_reason = rejection_data.reason
        
        # Update contributor reputation
        reputation = db.query(ContributorReputation).filter(
            ContributorReputation.contributor_address == submission.contributor_address
        ).first()
        
        if not reputation:
            reputation = ContributorReputation(
                contributor_address=submission.contributor_address,
                total_rejected=1
            )
            db.add(reputation)
        else:
            reputation.total_rejected += 1
        
        db.commit()
        db.refresh(submission)
        
        return {
            "message": "Submission rejected",
            "submission_id": submission.id,
            "reason": rejection_data.reason
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error rejecting submission: {str(e)}"
        )
