"""
Leaderboard API Routes
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from typing import List
from app.db.database import get_db
from app.db.models import ContributorReputation
from pydantic import BaseModel

router = APIRouter()

# Pydantic models
class LeaderboardEntry(BaseModel):
    contributor_address: str
    total_approved: int
    total_rejected: int
    total_rewards: float
    rank: int
    reputation_score: float
    
    class Config:
        from_attributes = True

class LeaderboardResponse(BaseModel):
    entries: List[LeaderboardEntry]
    total: int

@router.get("/", response_model=LeaderboardResponse)
async def get_leaderboard(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get leaderboard of top contributors"""
    try:
        # Calculate reputation scores and ranks
        # Reputation score = (total_approved * 10) - (total_rejected * 2) + (total_rewards * 0.1)
        query = db.query(
            ContributorReputation,
            (
                (ContributorReputation.total_approved * 10) -
                (ContributorReputation.total_rejected * 2) +
                (ContributorReputation.total_rewards * 0.1)
            ).label('calculated_score')
        ).order_by(desc('calculated_score'))
        
        total = query.count()
        results = query.offset(skip).limit(limit).all()
        
        entries = []
        for idx, (reputation, score) in enumerate(results, start=skip + 1):
            # Update reputation score and rank in database
            reputation.reputation_score = float(score)
            reputation.rank = idx
            entries.append(LeaderboardEntry(
                contributor_address=reputation.contributor_address,
                total_approved=reputation.total_approved,
                total_rejected=reputation.total_rejected,
                total_rewards=reputation.total_rewards,
                rank=idx,
                reputation_score=float(score)
            ))
        
        db.commit()
        
        return LeaderboardResponse(entries=entries, total=total)
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting leaderboard: {str(e)}"
        )

@router.get("/contributor/{contributor_address}")
async def get_contributor_stats(contributor_address: str, db: Session = Depends(get_db)):
    """Get stats for a specific contributor"""
    try:
        reputation = db.query(ContributorReputation).filter(
            ContributorReputation.contributor_address == contributor_address
        ).first()
        
        if not reputation:
            return {
                "contributor_address": contributor_address,
                "total_approved": 0,
                "total_rejected": 0,
                "total_rewards": 0.0,
                "rank": 0,
                "reputation_score": 0.0
            }
        
        return {
            "contributor_address": reputation.contributor_address,
            "total_approved": reputation.total_approved,
            "total_rejected": reputation.total_rejected,
            "total_rewards": reputation.total_rewards,
            "rank": reputation.rank,
            "reputation_score": reputation.reputation_score
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting contributor stats: {str(e)}"
        )
