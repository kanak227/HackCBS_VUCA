"""
MongoDB Models (Pydantic schemas for document structure)
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from bson import ObjectId

class PyObjectId(ObjectId):
    """Custom ObjectId for Pydantic v2"""
    @classmethod
    def __get_pydantic_core_schema__(cls, source_type, handler):
        from pydantic_core import core_schema
        return core_schema.json_or_python_schema(
            json_schema=core_schema.str_schema(),
            python_schema=core_schema.union_schema([
                core_schema.is_instance_schema(ObjectId),
                core_schema.chain_schema([
                    core_schema.str_schema(),
                    core_schema.no_info_plain_validator_function(cls.validate),
                ])
            ]),
            serialization=core_schema.plain_serializer_function_ser_schema(
                lambda x: str(x)
            ),
        )
    
    @classmethod
    def validate(cls, v):
        if isinstance(v, ObjectId):
            return v
        if isinstance(v, str):
            if ObjectId.is_valid(v):
                return ObjectId(v)
            raise ValueError("Invalid ObjectId string")
        raise ValueError("Invalid ObjectId type")

class ChallengeModel(BaseModel):
    """Challenge document model"""
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    challenge_id: str = Field(..., unique=True)
    title: str
    description: str
    company_name: str
    creator_address: str
    baseline_model_hash: str
    baseline_accuracy: float
    reward_amount: float
    reward_token_mint: Optional[str] = None
    deadline: datetime
    status: str = "active"  # active, closed, expired
    total_submissions: int = 0
    approved_submissions: int = 0
    solana_tx_hash: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None
    closed_at: Optional[datetime] = None
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class SubmissionModel(BaseModel):
    """Submission document model"""
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    challenge_id: str  # Reference to challenge_id (not ObjectId)
    contributor_address: str
    model_hash: str
    model_ipfs_hash: Optional[str] = None
    metadata_ipfs_hash: Optional[str] = None
    accuracy: Optional[float] = None
    status: str = "pending"  # pending, approved, rejected
    submitted_at: datetime = Field(default_factory=datetime.utcnow)
    approved_at: Optional[datetime] = None
    rejected_at: Optional[datetime] = None
    rejection_reason: Optional[str] = None
    solana_tx_hash: Optional[str] = None
    reward_tx_hash: Optional[str] = None
    reward_amount: float = 0.0
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class EvaluationModel(BaseModel):
    """Evaluation document model"""
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    challenge_id: str
    submission_id: str  # Reference to submission_id
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    loss: float
    evaluation_metrics: Dict[str, Any] = {}
    evaluation_report: Optional[str] = None
    gemini_job_id: Optional[str] = None
    evaluated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class ContributorReputationModel(BaseModel):
    """Contributor reputation model"""
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    contributor_address: str = Field(..., unique=True)
    total_approved: int = 0
    total_rejected: int = 0
    total_rewards: float = 0.0
    rank: int = 0
    reputation_score: float = 0.0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class RewardModel(BaseModel):
    """Reward document model"""
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    contributor_address: str
    challenge_id: str
    submission_id: Optional[str] = None
    amount: float
    token_amount: float
    token_mint: Optional[str] = None
    solana_tx_hash: Optional[str] = None
    status: str = "pending"  # pending, completed, failed
    created_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class UserModel(BaseModel):
    """User document model"""
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    email: str = Field(..., unique=True)
    wallet_address: Optional[str] = None
    auth0_id: Optional[str] = None
    name: Optional[str] = None
    role: str = "contributor"  # contributor, company, moderator, admin
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

