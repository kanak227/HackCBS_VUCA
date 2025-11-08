"""
Analytics API - Real on-chain data analytics
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime, timedelta
from collections import defaultdict

from app.db.database import get_db
from app.db.models import TrainingSession, Contribution, Reward
from app.services.solana_service import SolanaService

router = APIRouter()

@router.get("/dashboard")
async def get_dashboard_stats(db: Session = Depends(get_db)):
    """Get real-time dashboard statistics from blockchain and database"""
    solana_service = SolanaService()
    
    # Get on-chain data
    onchain_sessions = await solana_service.get_training_sessions_onchain()
    onchain_contributions = await solana_service.get_contributions_onchain("")
    onchain_rewards = await solana_service.get_rewards_onchain()
    
    # Get database data
    db_sessions = db.query(TrainingSession).all()
    db_contributions = db.query(Contribution).all()
    db_rewards = db.query(Reward).filter(Reward.status == "completed").all()
    
    # Calculate totals
    total_sessions = len(set(s.session_id for s in db_sessions)) + len(set(s.get("session_id") for s in onchain_sessions if s.get("session_id")))
    total_contributions = len(db_contributions) + len(onchain_contributions)
    total_rewards_distributed = sum(r.amount for r in db_rewards) + sum(r.get("amount", 0) for r in onchain_rewards)
    
    # Active sessions
    active_sessions = len([s for s in db_sessions if s.status == "active"]) + len([s for s in onchain_sessions if s.get("status") == 1])
    
    # Unique contributors
    contributors = set()
    contributors.update(c.contributor_address for c in db_contributions)
    contributors.update(c.get("contributor") for c in onchain_contributions if c.get("contributor"))
    
    return {
        "total_sessions": total_sessions,
        "active_sessions": active_sessions,
        "total_contributions": total_contributions,
        "unique_contributors": len(contributors),
        "total_rewards_distributed": total_rewards_distributed,
        "source": "blockchain + database",
        "timestamp": datetime.utcnow().isoformat()
    }

@router.get("/network-stats")
async def get_network_stats():
    """Get network-wide statistics from blockchain"""
    solana_service = SolanaService()
    
    # Get all on-chain data
    sessions = await solana_service.get_training_sessions_onchain()
    contributions = await solana_service.get_contributions_onchain("")
    rewards = await solana_service.get_rewards_onchain()
    
    # Calculate statistics
    total_sessions = len(sessions)
    total_contributions = len(contributions)
    total_rewards = sum(r.get("amount", 0) for r in rewards)
    
    # Unique contributors
    contributors = set()
    contributors.update(c.get("contributor") for c in contributions if c.get("contributor"))
    contributors.update(r.get("contributor") for r in rewards if r.get("contributor"))
    
    # Sessions by status
    sessions_by_status = defaultdict(int)
    for s in sessions:
        status = s.get("status", 0)
        if status == 0:
            sessions_by_status["pending"] += 1
        elif status == 1:
            sessions_by_status["active"] += 1
        elif status == 2:
            sessions_by_status["completed"] += 1
    
    return {
        "total_sessions": total_sessions,
        "total_contributions": total_contributions,
        "total_rewards_distributed": total_rewards,
        "unique_contributors": len(contributors),
        "sessions_by_status": dict(sessions_by_status),
        "source": "blockchain",
        "timestamp": datetime.utcnow().isoformat()
    }

@router.get("/rewards-timeline")
async def get_rewards_timeline(
    days: int = 30,
    db: Session = Depends(get_db)
):
    """Get rewards distribution over time"""
    solana_service = SolanaService()
    
    # Get on-chain rewards
    onchain_rewards = await solana_service.get_rewards_onchain()
    
    # Get database rewards
    db_rewards = db.query(Reward).filter(
        Reward.status == "completed",
        Reward.created_at >= datetime.utcnow() - timedelta(days=days)
    ).all()
    
    # Group by date
    timeline = defaultdict(float)
    
    # Database rewards
    for reward in db_rewards:
        date = reward.created_at.date() if reward.created_at else datetime.utcnow().date()
        timeline[date.isoformat()] += reward.amount
    
    # On-chain rewards (approximate by current date if no timestamp)
    for reward in onchain_rewards:
        date = datetime.utcnow().date()  # Approximate
        timeline[date.isoformat()] += reward.get("amount", 0)
    
    return {
        "timeline": dict(timeline),
        "days": days,
        "source": "blockchain + database"
    }

@router.get("/contributor-activity")
async def get_contributor_activity(
    address: Optional[str] = None,
    days: int = 30
):
    """Get contributor activity statistics"""
    solana_service = SolanaService()
    
    # Get contributions
    contributions = await solana_service.get_contributions_onchain("")
    if address:
        contributions = [c for c in contributions if c.get("contributor") == address]
    
    # Get rewards
    rewards = await solana_service.get_rewards_onchain(address)
    
    # Group by contributor
    activity = defaultdict(lambda: {
        "contributions": 0,
        "rewards": 0.0,
        "sessions": set()
    })
    
    for contrib in contributions:
        addr = contrib.get("contributor")
        if addr:
            activity[addr]["contributions"] += 1
            session = contrib.get("session")
            if session:
                activity[addr]["sessions"].add(session)
    
    for reward in rewards:
        addr = reward.get("contributor")
        if addr:
            activity[addr]["rewards"] += reward.get("amount", 0)
    
    # Format response
    result = []
    for addr, data in activity.items():
        result.append({
            "contributor_address": addr,
            "contributions_count": data["contributions"],
            "total_rewards": data["rewards"],
            "sessions_participated": len(data["sessions"])
        })
    
    return {
        "activity": sorted(result, key=lambda x: x["contributions_count"], reverse=True),
        "source": "blockchain"
    }

