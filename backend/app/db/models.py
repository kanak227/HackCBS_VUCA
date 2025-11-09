"""
Database models for FlexAI
"""
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey, JSON, BigInteger
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base

class Challenge(Base):
    """AI fine-tuning challenge posted by companies"""
    __tablename__ = "challenges"
    
    id = Column(Integer, primary_key=True, index=True)
    challenge_id = Column(String, unique=True, index=True)  # Unique challenge identifier
    title = Column(String, index=True)
    description = Column(Text)
    company_name = Column(String)
    creator_address = Column(String, index=True)  # Solana wallet address
    baseline_model_hash = Column(String)  # Hash of baseline model
    baseline_accuracy = Column(Float)  # Baseline model accuracy
    reward_amount = Column(Float)  # Reward amount in tokens/SOL
    reward_token_mint = Column(String)  # SPL token mint address (optional)
    deadline = Column(DateTime(timezone=True))
    status = Column(String, default="active")  # active, closed, expired
    total_submissions = Column(Integer, default=0)
    approved_submissions = Column(Integer, default=0)
    solana_tx_hash = Column(String, index=True)  # Transaction hash for challenge creation
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    closed_at = Column(DateTime(timezone=True))
    
    # Relationships
    submissions = relationship("Submission", back_populates="challenge")
    evaluations = relationship("Evaluation", back_populates="challenge")

class Submission(Base):
    """Model submission by contributors"""
    __tablename__ = "submissions"
    
    id = Column(Integer, primary_key=True, index=True)
    challenge_id = Column(Integer, ForeignKey("challenges.id"))
    contributor_address = Column(String, index=True)  # Solana wallet address
    model_hash = Column(String, index=True)  # Hash of the fine-tuned model
    model_ipfs_hash = Column(String)  # IPFS hash for model storage
    metadata_ipfs_hash = Column(String)  # IPFS hash for model metadata
    accuracy = Column(Float)  # Model accuracy from evaluation
    status = Column(String, default="pending")  # pending, approved, rejected
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())
    approved_at = Column(DateTime(timezone=True))
    rejected_at = Column(DateTime(timezone=True))
    rejection_reason = Column(Text)
    solana_tx_hash = Column(String, index=True)  # Transaction hash for submission
    reward_tx_hash = Column(String)  # Transaction hash for reward payout
    reward_amount = Column(Float, default=0.0)
    
    # Relationships
    challenge = relationship("Challenge", back_populates="submissions")
    evaluation = relationship("Evaluation", back_populates="submission", uselist=False)

class Evaluation(Base):
    """Model evaluation results from Gemini API"""
    __tablename__ = "evaluations"
    
    id = Column(Integer, primary_key=True, index=True)
    challenge_id = Column(Integer, ForeignKey("challenges.id"))
    submission_id = Column(Integer, ForeignKey("submissions.id"), unique=True)
    accuracy = Column(Float)
    precision = Column(Float)
    recall = Column(Float)
    f1_score = Column(Float)
    loss = Column(Float)
    evaluation_metrics = Column(JSON)  # Additional metrics as JSON
    evaluation_report = Column(Text)  # Detailed evaluation report
    gemini_job_id = Column(String)  # Gemini API job ID
    evaluated_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    challenge = relationship("Challenge", back_populates="evaluations")
    submission = relationship("Submission", back_populates="evaluation")

class ContributorReputation(Base):
    """Contributor reputation and stats"""
    __tablename__ = "contributor_reputations"
    
    id = Column(Integer, primary_key=True, index=True)
    contributor_address = Column(String, unique=True, index=True)  # Solana wallet address
    total_approved = Column(Integer, default=0)
    total_rejected = Column(Integer, default=0)
    total_rewards = Column(Float, default=0.0)
    rank = Column(Integer, default=0)
    reputation_score = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class Reward(Base):
    """Reward distribution record"""
    __tablename__ = "rewards"
    
    id = Column(Integer, primary_key=True, index=True)
    contributor_address = Column(String, index=True)
    challenge_id = Column(Integer, ForeignKey("challenges.id"))
    submission_id = Column(Integer, ForeignKey("submissions.id"))
    amount = Column(Float)
    token_amount = Column(Float)  # SPL token amount
    token_mint = Column(String)  # SPL token mint address
    solana_tx_hash = Column(String, index=True)
    status = Column(String, default="pending")  # pending, completed, failed
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True))

class User(Base):
    """User accounts (for Auth0/OAuth integration)"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    wallet_address = Column(String, index=True)  # Solana wallet address
    auth0_id = Column(String, unique=True, index=True)
    name = Column(String)
    role = Column(String, default="contributor")  # contributor, company, moderator, admin
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())