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
    
    # Database
    DATABASE_URL: str = "postgresql://sentinel_user:sentinel_password@localhost:5432/sentinel_db"
    
    # Solana Configuration
    SOLANA_RPC_URL: str = "https://api.devnet.solana.com"
    SOLANA_WS_URL: str = "wss://api.devnet.solana.com"
    SOLANA_PRIVATE_KEY: str = ""
    PROGRAM_ID: str = ""
    
    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:5173"]
    
    # Privacy Configuration
    LDP_EPSILON: float = 1.0
    NOISE_SCALE: float = 0.1
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Model Configuration
    MODEL_STORAGE_PATH: str = "./models"
    MAX_ROUNDS: int = 100
    MIN_CONTRIBUTORS: int = 3
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()

