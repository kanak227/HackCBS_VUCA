"""
Create dummy data for FlexAI testing
"""
import asyncio
import sys
from pathlib import Path
from datetime import datetime, timedelta

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))

from sqlalchemy.orm import Session
from app.db.database import SessionLocal, engine
from app.db.models import Base, Challenge, Submission, Evaluation, ContributorReputation, User
from app.db import models

# Create tables
Base.metadata.create_all(bind=engine)

def create_dummy_data():
    """Create dummy challenges, submissions, and evaluations"""
    db = SessionLocal()
    
    try:
        # Create dummy challenges
        challenges_data = [
            {
                "challenge_id": "challenge-001",
                "title": "Image Classification Model Fine-tuning",
                "description": "Improve the accuracy of our image classification model for medical imaging. Current baseline achieves 78% accuracy on test set.",
                "company_name": "MedTech AI",
                "creator_address": "Creator1Address1111111111111111111111111",
                "baseline_model_hash": "baseline_hash_001",
                "baseline_accuracy": 0.78,
                "reward_amount": 0.05,
                "reward_token_mint": None,
                "deadline": datetime.utcnow() + timedelta(days=30),
                "status": "active",
                "solana_tx_hash": "dummy_tx_hash_001"
            },
            {
                "challenge_id": "challenge-002",
                "title": "NLP Sentiment Analysis Improvement",
                "description": "Enhance our sentiment analysis model for social media text. Baseline F1 score is 0.82. Target: 0.90+ F1 score.",
                "company_name": "SocialAI Inc",
                "creator_address": "Creator2Address2222222222222222222222222",
                "baseline_model_hash": "baseline_hash_002",
                "baseline_accuracy": 0.82,
                "reward_amount": 0.05,
                "reward_token_mint": None,
                "deadline": datetime.utcnow() + timedelta(days=45),
                "status": "active",
                "solana_tx_hash": "dummy_tx_hash_002"
            },
            {
                "challenge_id": "challenge-003",
                "title": "Fraud Detection Model Optimization",
                "description": "Optimize our fraud detection model for financial transactions. Current precision: 0.85, recall: 0.75. Need better balance.",
                "company_name": "FinanceGuard",
                "creator_address": "Creator3Address3333333333333333333333333",
                "baseline_model_hash": "baseline_hash_003",
                "baseline_accuracy": 0.80,
                "reward_amount": 0.05,
                "reward_token_mint": None,
                "deadline": datetime.utcnow() + timedelta(days=60),
                "status": "active",
                "solana_tx_hash": "dummy_tx_hash_003"
            },
        ]
        
        challenges = []
        for challenge_data in challenges_data:
            challenge = Challenge(**challenge_data)
            db.add(challenge)
            challenges.append(challenge)
        
        db.commit()
        
        # Create dummy contributors
        contributor_addresses = [
            "Contributor1Address1111111111111111111111111",
            "Contributor2Address2222222222222222222222222",
            "Contributor3Address3333333333333333333333333",
            "Contributor4Address4444444444444444444444444",
        ]
        
        # Create dummy submissions
        import random
        submissions_data = []
        for challenge in challenges:
            num_submissions = random.randint(2, 4)
            for i in range(num_submissions):
                contributor = random.choice(contributor_addresses)
                # Generate accuracy that's likely better than baseline
                accuracy = challenge.baseline_accuracy + random.uniform(0.01, 0.12)
                accuracy = min(0.99, accuracy)
                
                submission = Submission(
                    challenge_id=challenge.id,
                    contributor_address=contributor,
                    model_hash=f"model_hash_{challenge.challenge_id}_{i}",
                    model_ipfs_hash=f"Qm{random.randint(100000, 999999)}",
                    metadata_ipfs_hash=f"Qm{random.randint(100000, 999999)}",
                    accuracy=accuracy,
                    status=random.choice(["pending", "approved", "rejected"]),
                    submitted_at=datetime.utcnow() - timedelta(days=random.randint(1, 10)),
                    solana_tx_hash=f"submission_tx_{challenge.challenge_id}_{i}"
                )
                
                if submission.status == "approved":
                    submission.approved_at = submission.submitted_at + timedelta(hours=random.randint(1, 24))
                    submission.reward_amount = challenge.reward_amount
                    submission.reward_tx_hash = f"reward_tx_{challenge.challenge_id}_{i}"
                elif submission.status == "rejected":
                    submission.rejected_at = submission.submitted_at + timedelta(hours=random.randint(1, 24))
                    submission.rejection_reason = random.choice([
                        "Accuracy below threshold",
                        "Model architecture not suitable",
                        "Evaluation failed",
                    ])
                
                db.add(submission)
                submissions_data.append((submission, challenge))
        
        db.commit()
        
        # Create dummy evaluations
        for submission, challenge in submissions_data:
            if submission.accuracy:
                evaluation = Evaluation(
                    challenge_id=challenge.id,
                    submission_id=submission.id,
                    accuracy=submission.accuracy,
                    precision=submission.accuracy + random.uniform(-0.05, 0.05),
                    recall=submission.accuracy + random.uniform(-0.05, 0.05),
                    f1_score=submission.accuracy + random.uniform(-0.03, 0.03),
                    loss=1.0 - submission.accuracy + random.uniform(-0.1, 0.1),
                    evaluation_metrics={
                        "accuracy": submission.accuracy,
                        "improvement": submission.accuracy - challenge.baseline_accuracy,
                    },
                    evaluation_report=f"Mock evaluation report for submission {submission.id}",
                    evaluated_at=submission.submitted_at + timedelta(minutes=random.randint(5, 60))
                )
                db.add(evaluation)
        
        db.commit()
        
        # Create dummy contributor reputations
        for contributor in contributor_addresses:
            contributor_submissions = [s for s, _ in submissions_data if s.contributor_address == contributor]
            approved_count = len([s for s in contributor_submissions if s.status == "approved"])
            rejected_count = len([s for s in contributor_submissions if s.status == "rejected"])
            total_rewards = sum([s.reward_amount for s in contributor_submissions if s.status == "approved"])
            
            reputation = ContributorReputation(
                contributor_address=contributor,
                total_approved=approved_count,
                total_rejected=rejected_count,
                total_rewards=total_rewards,
                reputation_score=(approved_count * 10) - (rejected_count * 2) + (total_rewards * 0.1),
                rank=0
            )
            db.add(reputation)
        
        db.commit()
        
        print("✅ Dummy data created successfully!")
        print(f"   - {len(challenges)} challenges")
        print(f"   - {len(submissions_data)} submissions")
        print(f"   - {len(contributor_addresses)} contributors")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error creating dummy data: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    create_dummy_data()
