"""
Rewards API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List

from app.db.database import get_db
from app.db.models import Reward, Contribution, TrainingSession
from app.services.solana_service import SolanaService

router = APIRouter()

class DistributeRewardsRequest(BaseModel):
    session_id: str
    round_id: int

class RewardResponse(BaseModel):
    contributor_address: str
    amount: float
    token_amount: float
    solana_tx_hash: str
    status: str

@router.post("/distribute")
async def distribute_rewards(
    request: DistributeRewardsRequest,
    db: Session = Depends(get_db)
):
    """Distribute rewards for a completed round"""
    # Get session
    session = db.query(TrainingSession).filter(
        TrainingSession.session_id == request.session_id
    ).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Get contributions for this round
    contributions = db.query(Contribution).join(
        TrainingSession
    ).filter(
        TrainingSession.session_id == request.session_id,
        Contribution.status == "verified"
    ).all()
    
    if not contributions:
        raise HTTPException(status_code=404, detail="No contributions found")
    
    # Distribute rewards via Solana
    solana_service = SolanaService()
    rewards = []
    
    for contribution in contributions:
        # Calculate reward based on accuracy and privacy score
        base_reward = session.reward_per_contributor
        accuracy_multiplier = contribution.accuracy / session.accuracy_threshold
        privacy_multiplier = contribution.privacy_score  # Lower epsilon = higher reward
        reward_amount = base_reward * accuracy_multiplier * privacy_multiplier
        
        try:
            # Distribute on Solana
            tx_hash = await solana_service.distribute_reward(
                contributor_address=contribution.contributor_address,
                amount=reward_amount,
                session_id=request.session_id,
                round_id=request.round_id
            )
            
            # Create reward record
            reward = Reward(
                contributor_address=contribution.contributor_address,
                session_id=session.id,
                round_id=request.round_id,
                amount=reward_amount,
                token_amount=reward_amount,  # 1:1 for now
                solana_tx_hash=tx_hash,
                status="completed"
            )
            
            db.add(reward)
            contribution.status = "rewarded"
            contribution.reward_amount = reward_amount
            db.commit()
            
            rewards.append({
                "contributor_address": contribution.contributor_address,
                "amount": reward_amount,
                "token_amount": reward_amount,
                "solana_tx_hash": tx_hash,
                "status": "completed"
            })
        except Exception as e:
            print(f"Reward distribution failed for {contribution.contributor_address}: {e}")
            continue
    
    return {
        "session_id": request.session_id,
        "round_id": request.round_id,
        "rewards_distributed": len(rewards),
        "rewards": rewards
    }

@router.get("/contributor/{address}")
async def get_contributor_rewards(
    address: str,
    db: Session = Depends(get_db)
):
    """Get all rewards for a contributor from database and on-chain"""
    # Get from database
    db_rewards = db.query(Reward).filter(
        Reward.contributor_address == address
    ).all()
    
    # Get from on-chain
    solana_service = SolanaService()
    onchain_rewards = await solana_service.get_rewards_onchain(address)
    
    # Combine rewards
    all_rewards = []
    
    # Database rewards
    for r in db_rewards:
        all_rewards.append({
            "session_id": r.session_id,
            "round_id": r.round_id,
            "amount": r.amount,
            "token_amount": r.token_amount,
            "solana_tx_hash": r.solana_tx_hash,
            "status": r.status,
            "created_at": r.created_at,
            "source": "database"
        })
    
    # On-chain rewards (avoid duplicates by tx hash)
    existing_txs = {r["solana_tx_hash"] for r in all_rewards if r.get("solana_tx_hash")}
    for onchain in onchain_rewards:
        tx_hash = onchain.get("solana_tx_hash") or onchain.get("tx_hash")
        if tx_hash and tx_hash not in existing_txs:
            all_rewards.append({
                **onchain,
                "source": "onchain"
            })
    
    total_rewards = sum(r["amount"] for r in all_rewards)
    total_tokens = sum(r.get("token_amount", r.get("amount", 0)) for r in all_rewards)
    
    return {
        "contributor_address": address,
        "total_rewards": total_rewards,
        "total_tokens": total_tokens,
        "rewards_count": len(all_rewards),
        "rewards": all_rewards
    }

@router.get("/leaderboard")
async def get_leaderboard(
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get rewards leaderboard from database and on-chain"""
    from sqlalchemy import func
    from collections import defaultdict
    
    # Get from database
    db_leaderboard = db.query(
        Reward.contributor_address,
        func.sum(Reward.amount).label("total_rewards"),
        func.count(Reward.id).label("contributions_count")
    ).filter(
        Reward.status == "completed"
    ).group_by(
        Reward.contributor_address
    ).all()
    
    # Get from on-chain
    solana_service = SolanaService()
    onchain_rewards = await solana_service.get_rewards_onchain()
    
    # Aggregate on-chain rewards
    onchain_totals = defaultdict(lambda: {"total_rewards": 0.0, "contributions_count": 0})
    for reward in onchain_rewards:
        addr = reward.get("contributor")
        if addr:
            onchain_totals[addr]["total_rewards"] += reward.get("amount", 0)
            onchain_totals[addr]["contributions_count"] += 1
    
    # Merge data
    leaderboard_dict = defaultdict(lambda: {"total_rewards": 0.0, "contributions_count": 0})
    
    # Add database data
    for item in db_leaderboard:
        leaderboard_dict[item.contributor_address]["total_rewards"] += float(item.total_rewards)
        leaderboard_dict[item.contributor_address]["contributions_count"] += item.contributions_count
    
    # Add on-chain data
    for addr, data in onchain_totals.items():
        leaderboard_dict[addr]["total_rewards"] += data["total_rewards"]
        leaderboard_dict[addr]["contributions_count"] += data["contributions_count"]
    
    # Sort and format
    leaderboard = sorted(
        [
            {
                "contributor_address": addr,
                "total_rewards": data["total_rewards"],
                "contributions_count": data["contributions_count"]
            }
            for addr, data in leaderboard_dict.items()
        ],
        key=lambda x: x["total_rewards"],
        reverse=True
    )[:limit]
    
    return [
        {
            "rank": idx + 1,
            **item
        }
        for idx, item in enumerate(leaderboard)
    ]

