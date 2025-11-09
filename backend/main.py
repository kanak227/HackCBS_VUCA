"""
Sentinel.ai Backend - Main FastAPI Application
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
from contextlib import asynccontextmanager

from app.api import challenges, submissions, admin, leaderboard, auth
from app.core.config import settings
from app.db.mongodb import MongoDB

# MongoDB connection lifecycle
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await MongoDB.connect()
    yield
    # Shutdown
    await MongoDB.disconnect()

app = FastAPI(
    title="FlexAI API",
    description="Decentralized AI Fine-tuning Challenge Marketplace",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(challenges.router, prefix="/api/challenges", tags=["Challenges"])
app.include_router(submissions.router, prefix="/api/submissions", tags=["Submissions"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
app.include_router(leaderboard.router, prefix="/api/leaderboard", tags=["Leaderboard"])

@app.get("/")
async def root():
    return {
        "message": "FlexAI Backend API",
        "version": "1.0.0",
        "description": "Decentralized AI Fine-tuning Challenge Marketplace",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=settings.DEBUG
    )

