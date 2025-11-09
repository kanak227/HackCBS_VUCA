"""
MongoDB database configuration and connection
"""
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import MongoClient
from typing import Optional
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

class MongoDB:
    """MongoDB database connection manager"""
    
    client: Optional[AsyncIOMotorClient] = None
    database = None
    
    @classmethod
    async def connect(cls):
        """Connect to MongoDB"""
        try:
            # Handle MongoDB Atlas connection with proper SSL
            connection_kwargs = {
                "serverSelectionTimeoutMS": 5000,
                "connectTimeoutMS": 5000,
            }
            
            # For MongoDB Atlas (mongodb+srv), add SSL requirements
            if "mongodb+srv" in settings.MONGODB_URL or "mongodb.net" in settings.MONGODB_URL:
                connection_kwargs["tls"] = True
                connection_kwargs["tlsAllowInvalidCertificates"] = False
            
            cls.client = AsyncIOMotorClient(
                settings.MONGODB_URL,
                **connection_kwargs
            )
            # Test connection
            await cls.client.admin.command('ping')
            cls.database = cls.client[settings.MONGODB_DB_NAME]
            logger.info(f"✅ Connected to MongoDB: {settings.MONGODB_DB_NAME}")
            
            # Create indexes
            await cls.create_indexes()
            
        except Exception as e:
            logger.warning(f"⚠️  Failed to connect to MongoDB: {e}")
            logger.warning("⚠️  Server will start but MongoDB features will not work.")
            logger.warning("⚠️  Please check MONGODB_URL in .env file")
            logger.warning("⚠️  For local MongoDB: mongodb://localhost:27017")
            # Don't raise - allow server to start without MongoDB
            # The API routes will handle this gracefully
            cls.client = None
            cls.database = None
    
    @classmethod
    async def disconnect(cls):
        """Disconnect from MongoDB"""
        if cls.client:
            cls.client.close()
            logger.info("Disconnected from MongoDB")
    
    @classmethod
    async def create_indexes(cls):
        """Create database indexes for better performance"""
        if not cls.database:
            return
        
        try:
            # Challenges indexes
            await cls.database.challenges.create_index("challenge_id", unique=True)
            await cls.database.challenges.create_index("status")
            await cls.database.challenges.create_index("creator_address")
            await cls.database.challenges.create_index("deadline")
            
            # Submissions indexes
            await cls.database.submissions.create_index("challenge_id")
            await cls.database.submissions.create_index("contributor_address")
            await cls.database.submissions.create_index("status")
            await cls.database.submissions.create_index([("challenge_id", 1), ("contributor_address", 1)], unique=True)
            
            # Evaluations indexes
            await cls.database.evaluations.create_index("challenge_id")
            await cls.database.evaluations.create_index("submission_id", unique=True)
            
            # Contributor reputations indexes
            await cls.database.contributor_reputations.create_index("contributor_address", unique=True)
            await cls.database.contributor_reputations.create_index("reputation_score")
            
            # Rewards indexes
            await cls.database.rewards.create_index("contributor_address")
            await cls.database.rewards.create_index("challenge_id")
            await cls.database.rewards.create_index("status")
            await cls.database.rewards.create_index("solana_tx_hash")
            
            # Users indexes
            await cls.database.users.create_index("email", unique=True)
            await cls.database.users.create_index("wallet_address")
            await cls.database.users.create_index("auth0_id", unique=True, sparse=True)
            
            logger.info("MongoDB indexes created successfully")
        except Exception as e:
            logger.warning(f"Error creating indexes: {e}")
    
    @classmethod
    def get_database(cls):
        """Get database instance"""
        if not cls.database:
            raise RuntimeError(
                "MongoDB not connected. "
                "Please check MONGODB_URL in .env file and ensure MongoDB is running."
            )
        return cls.database

# Database dependency for FastAPI
async def get_database():
    """Dependency for getting database instance"""
    db = MongoDB.get_database()
    try:
        yield db
    finally:
        pass  # Connection is managed globally

