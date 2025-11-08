"""
Database models for Sentinel.ai
"""
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base

class TrainingSession(Base):
    """Model training session"""
    __tablename__ = "training_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, unique=True, index=True)
    model_hash = Column(String, index=True)
    model_architecture = Column(Text)  # JSON string
    trainer_address = Column(String)  # Solana wallet address
    status = Column(String, default="pending")  # pending, active, completed, failed
    current_round = Column(Integer, default=0)
    total_rounds = Column(Integer)
    min_contributors = Column(Integer, default=3)
    reward_per_contributor = Column(Float, default=0.0)
    accuracy_threshold = Column(Float, default=0.8)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    contributions = relationship("Contribution", back_populates="session")
    rounds = relationship("TrainingRound", back_populates="session")

class TrainingRound(Base):
    """Individual training round within a session"""
    __tablename__ = "training_rounds"
    
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("training_sessions.id"))
    round_number = Column(Integer)
    status = Column(String, default="pending")  # pending, aggregating, completed
    aggregated_model_hash = Column(String)
    accuracy = Column(Float)
    contributors_count = Column(Integer, default=0)
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True))
    
    # Relationships
    session = relationship("TrainingSession", back_populates="rounds")
    contributions = relationship("Contribution", back_populates="round")

class Contribution(Base):
    """Contributor's gradient update"""
    __tablename__ = "contributions"
    
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("training_sessions.id"))
    round_id = Column(Integer, ForeignKey("training_rounds.id"))
    contributor_address = Column(String, index=True)  # Solana wallet address
    gradient_hash = Column(String)  # Hash of encrypted gradients
    commitment_hash = Column(String)  # Commitment for verification
    nonce = Column(String)  # Nonce for commitment
    accuracy = Column(Float)  # Local model accuracy
    privacy_score = Column(Float, default=1.0)  # LDP epsilon used
    encrypted_gradients = Column(Text)  # Base64 encoded encrypted gradients
    status = Column(String, default="pending")  # pending, verified, aggregated, rewarded
    solana_tx_hash = Column(String)  # Transaction hash on Solana
    reward_amount = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    session = relationship("TrainingSession", back_populates="contributions")
    round = relationship("TrainingRound", back_populates="contributions")

class Reward(Base):
    """Reward distribution record"""
    __tablename__ = "rewards"
    
    id = Column(Integer, primary_key=True, index=True)
    contributor_address = Column(String, index=True)
    session_id = Column(Integer, ForeignKey("training_sessions.id"))
    round_id = Column(Integer, ForeignKey("training_rounds.id"))
    amount = Column(Float)
    token_amount = Column(Float)  # SPL token amount
    solana_tx_hash = Column(String, index=True)
    status = Column(String, default="pending")  # pending, completed, failed
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True))

class ModelCheckpoint(Base):
    """Model checkpoints for aggregation"""
    __tablename__ = "model_checkpoints"
    
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("training_sessions.id"))
    round_id = Column(Integer, ForeignKey("training_rounds.id"))
    checkpoint_type = Column(String)  # aggregated, contributor
    model_hash = Column(String, index=True)
    model_weights = Column(Text)  # Base64 encoded model weights
    accuracy = Column(Float)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

