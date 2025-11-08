"""
Contributors API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.db.database import get_db
from app.db.models import Contribution, TrainingSession

router = APIRouter()

@router.get("/stats/{address}")
async def get_contributor_stats(
    address: str,
    db: Session = Depends(get_db)
):
    """Get contributor statistics from database and on-chain"""
    from app.services.solana_service import SolanaService
    
    # Get from database
    db_contributions = db.query(Contribution).filter(
        Contribution.contributor_address == address
    ).all()
    
    # Get from on-chain
    solana_service = SolanaService()
    onchain_contributions = await solana_service.get_contributions_onchain("")
    onchain_rewards = await solana_service.get_rewards_onchain(address)
    
    # Filter on-chain contributions by address
    onchain_contribs = [c for c in onchain_contributions if c.get("contributor") == address]
    
    # Combine contributions
    all_contributions = []
    
    # Database contributions
    for c in db_contributions:
        all_contributions.append({
            "session_id": c.session.session_id if c.session else None,
            "round_id": c.round_id,
            "accuracy": c.accuracy,
            "privacy_score": c.privacy_score,
            "reward_amount": c.reward_amount,
            "status": c.status,
            "solana_tx_hash": c.solana_tx_hash,
            "created_at": c.created_at,
            "source": "database"
        })
    
    # On-chain contributions
    existing_hashes = {c.get("gradient_hash") for c in all_contributions if c.get("gradient_hash")}
    for onchain in onchain_contribs:
        if onchain.get("gradient_hash") and onchain["gradient_hash"] not in existing_hashes:
            all_contributions.append({
                **onchain,
                "source": "onchain"
            })
    
    # Calculate statistics
    total_contributions = len(all_contributions)
    total_rewards = sum(c.get("reward_amount", 0) for c in all_contributions)
    total_rewards += sum(r.get("amount", 0) for r in onchain_rewards)
    
    accuracies = [c.get("accuracy", 0) for c in all_contributions if c.get("accuracy")]
    avg_accuracy = sum(accuracies) / len(accuracies) if accuracies else 0
    
    privacy_scores = [c.get("privacy_score", 0) for c in all_contributions if c.get("privacy_score")]
    avg_privacy_score = sum(privacy_scores) / len(privacy_scores) if privacy_scores else 0
    
    # Get unique sessions
    session_ids = set(c.get("session_id") for c in all_contributions if c.get("session_id"))
    
    # Get real wallet balance
    sol_balance = await solana_service.get_wallet_balance(address)
    token_balance = await solana_service.get_token_balance(address)
    
    return {
        "contributor_address": address,
        "total_contributions": total_contributions,
        "total_rewards": total_rewards,
        "average_accuracy": avg_accuracy,
        "average_privacy_score": avg_privacy_score,
        "sessions_participated": len(session_ids),
        "sol_balance": sol_balance,
        "token_balance": token_balance,
        "contributions": all_contributions,
        "onchain_rewards": onchain_rewards
    }

@router.get("/leaderboard")
async def get_contributor_leaderboard(
    metric: str = "accuracy",  # accuracy, privacy, contributions
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get contributor leaderboard"""
    if metric == "accuracy":
        leaderboard = db.query(
            Contribution.contributor_address,
            func.avg(Contribution.accuracy).label("avg_accuracy"),
            func.count(Contribution.id).label("contributions_count")
        ).group_by(
            Contribution.contributor_address
        ).order_by(
            func.avg(Contribution.accuracy).desc()
        ).limit(limit).all()
        
        return [
            {
                "rank": idx + 1,
                "contributor_address": item.contributor_address,
                "metric_value": float(item.avg_accuracy),
                "contributions_count": item.contributions_count
            }
            for idx, item in enumerate(leaderboard)
        ]
    elif metric == "privacy":
        leaderboard = db.query(
            Contribution.contributor_address,
            func.avg(Contribution.privacy_score).label("avg_privacy"),
            func.count(Contribution.id).label("contributions_count")
        ).group_by(
            Contribution.contributor_address
        ).order_by(
            func.avg(Contribution.privacy_score).desc()
        ).limit(limit).all()
        
        return [
            {
                "rank": idx + 1,
                "contributor_address": item.contributor_address,
                "metric_value": float(item.avg_privacy),
                "contributions_count": item.contributions_count
            }
            for idx, item in enumerate(leaderboard)
        ]
    else:  # contributions
        leaderboard = db.query(
            Contribution.contributor_address,
            func.count(Contribution.id).label("contributions_count"),
            func.avg(Contribution.accuracy).label("avg_accuracy")
        ).group_by(
            Contribution.contributor_address
        ).order_by(
            func.count(Contribution.id).desc()
        ).limit(limit).all()
        
        return [
            {
                "rank": idx + 1,
                "contributor_address": item.contributor_address,
                "metric_value": item.contributions_count,
                "avg_accuracy": float(item.avg_accuracy)
            }
            for idx, item in enumerate(leaderboard)
        ]

