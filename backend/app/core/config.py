"""
Application Configuration
"""
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # API Configuration
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    DEBUG: bool = True
    
    # Database - MongoDB (Primary)
    MONGODB_URL: str = "mongodb://localhost:27017"
    MONGODB_DB_NAME: str = "flexai"
    
    # Legacy SQL database (optional, for migration)
    DATABASE_URL: str = "sqlite:///./flexai.db"
    
    # Solana Configuration
    SOLANA_RPC_URL: str = "https://api.testnet.solana.com"
    SOLANA_WS_URL: str = "wss://api.testnet.solana.com"
    SOLANA_PRIVATE_KEY: str = ""
    PROGRAM_ID: str = "FlexAIPr0gramID1111111111111111111111"
    TOKEN_MINT: str = ""  # SPL token mint address for rewards
    
    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:5173"]
    
    # Privacy Configuration
    LDP_EPSILON: float = 1.0
    NOISE_SCALE: float = 0.1
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Auth0 Configuration
    AUTH0_DOMAIN: str = ""
    AUTH0_CLIENT_ID: str = ""
    AUTH0_CLIENT_SECRET: str = ""
    AUTH0_AUDIENCE: str = ""
    
    # Gemini API Configuration
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-pro"
    
    # Storage Configuration
    IPFS_GATEWAY: str = "https://ipfs.io/ipfs/"
    AWS_S3_BUCKET: str = ""
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    
    # Model Configuration
    MODEL_STORAGE_PATH: str = "./models"
    MAX_ROUNDS: int = 100
    MIN_CONTRIBUTORS: int = 3
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()

