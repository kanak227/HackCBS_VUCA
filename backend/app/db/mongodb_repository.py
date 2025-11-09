"""
MongoDB Repository - Data access layer for MongoDB
"""
from typing import List, Optional, Dict, Any
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from app.db.mongodb_models import (
    ChallengeModel, SubmissionModel, EvaluationModel,
    ContributorReputationModel, RewardModel, UserModel
)

class ChallengeRepository:
    """Repository for Challenge operations"""
    
    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db.challenges
    
    async def create(self, challenge: ChallengeModel) -> ChallengeModel:
        """Create a new challenge"""
        challenge_dict = challenge.dict(by_alias=True, exclude={"id"})
        result = await self.collection.insert_one(challenge_dict)
        challenge.id = result.inserted_id
        return challenge
    
    async def get_by_id(self, challenge_id: str) -> Optional[Dict]:
        """Get challenge by challenge_id"""
        return await self.collection.find_one({"challenge_id": challenge_id})
    
    async def list(self, status: Optional[str] = None, skip: int = 0, limit: int = 100) -> List[Dict]:
        """List challenges with optional status filter"""
        query = {}
        if status:
            query["status"] = status
        
        # Filter out expired challenges
        query["deadline"] = {"$gt": datetime.utcnow()}
        
        cursor = self.collection.find(query).sort("created_at", -1).skip(skip).limit(limit)
        return await cursor.to_list(length=limit)
    
    async def count(self, status: Optional[str] = None) -> int:
        """Count challenges"""
        query = {}
        if status:
            query["status"] = status
        query["deadline"] = {"$gt": datetime.utcnow()}
        return await self.collection.count_documents(query)
    
    async def update(self, challenge_id: str, update_data: Dict) -> bool:
        """Update challenge"""
        update_data["updated_at"] = datetime.utcnow()
        result = await self.collection.update_one(
            {"challenge_id": challenge_id},
            {"$set": update_data}
        )
        return result.modified_count > 0

class SubmissionRepository:
    """Repository for Submission operations"""
    
    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db.submissions
    
    async def create(self, submission: SubmissionModel) -> SubmissionModel:
        """Create a new submission"""
        submission_dict = submission.dict(by_alias=True, exclude={"id"})
        result = await self.collection.insert_one(submission_dict)
        submission.id = result.inserted_id
        return submission
    
    async def get_by_id(self, submission_id: str) -> Optional[Dict]:
        """Get submission by ObjectId"""
        if ObjectId.is_valid(submission_id):
            return await self.collection.find_one({"_id": ObjectId(submission_id)})
        return None
    
    async def list(self, challenge_id: Optional[str] = None, 
                   contributor_address: Optional[str] = None,
                   status: Optional[str] = None,
                   skip: int = 0, limit: int = 100) -> List[Dict]:
        """List submissions with filters"""
        query = {}
        if challenge_id:
            query["challenge_id"] = challenge_id
        if contributor_address:
            query["contributor_address"] = contributor_address
        if status:
            query["status"] = status
        
        cursor = self.collection.find(query).sort("submitted_at", -1).skip(skip).limit(limit)
        return await cursor.to_list(length=limit)
    
    async def update(self, submission_id: str, update_data: Dict) -> bool:
        """Update submission"""
        if ObjectId.is_valid(submission_id):
            result = await self.collection.update_one(
                {"_id": ObjectId(submission_id)},
                {"$set": update_data}
            )
            return result.modified_count > 0
        return False

class EvaluationRepository:
    """Repository for Evaluation operations"""
    
    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db.evaluations
    
    async def create(self, evaluation: EvaluationModel) -> EvaluationModel:
        """Create a new evaluation"""
        evaluation_dict = evaluation.dict(by_alias=True, exclude={"id"})
        result = await self.collection.insert_one(evaluation_dict)
        evaluation.id = result.inserted_id
        return evaluation
    
    async def get_by_submission_id(self, submission_id: str) -> Optional[Dict]:
        """Get evaluation by submission_id"""
        return await self.collection.find_one({"submission_id": submission_id})

class ContributorReputationRepository:
    """Repository for Contributor Reputation operations"""
    
    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db.contributor_reputations
    
    async def get_or_create(self, contributor_address: str) -> Dict:
        """Get or create reputation for contributor"""
        reputation = await self.collection.find_one({"contributor_address": contributor_address})
        if not reputation:
            reputation = {
                "contributor_address": contributor_address,
                "total_approved": 0,
                "total_rejected": 0,
                "total_rewards": 0.0,
                "rank": 0,
                "reputation_score": 0.0,
                "created_at": datetime.utcnow()
            }
            result = await self.collection.insert_one(reputation)
            reputation["_id"] = result.inserted_id
        return reputation
    
    async def update(self, contributor_address: str, update_data: Dict) -> bool:
        """Update contributor reputation"""
        update_data["updated_at"] = datetime.utcnow()
        result = await self.collection.update_one(
            {"contributor_address": contributor_address},
            {"$set": update_data}
        )
        return result.modified_count > 0
    
    async def get_leaderboard(self, skip: int = 0, limit: int = 100) -> List[Dict]:
        """Get leaderboard sorted by reputation score"""
        # Calculate reputation score for all
        async for rep in self.collection.find({}):
            score = (rep.get("total_approved", 0) * 10) - (rep.get("total_rejected", 0) * 2) + (rep.get("total_rewards", 0) * 0.1)
            await self.collection.update_one(
                {"_id": rep["_id"]},
                {"$set": {"reputation_score": score}}
            )
        
        cursor = self.collection.find({}).sort("reputation_score", -1).skip(skip).limit(limit)
        results = await cursor.to_list(length=limit)
        
        # Update ranks
        for idx, rep in enumerate(results, start=skip + 1):
            await self.collection.update_one(
                {"_id": rep["_id"]},
                {"$set": {"rank": idx}}
            )
            rep["rank"] = idx
        
        return results

class RewardRepository:
    """Repository for Reward operations"""
    
    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db.rewards
    
    async def create(self, reward: RewardModel) -> RewardModel:
        """Create a new reward"""
        reward_dict = reward.dict(by_alias=True, exclude={"id"})
        result = await self.collection.insert_one(reward_dict)
        reward.id = result.inserted_id
        return reward

