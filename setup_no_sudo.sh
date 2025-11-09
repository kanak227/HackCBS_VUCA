#!/bin/bash

# FlexAI Setup Script (No Sudo Required)
# This script sets up the project using SQLite (no PostgreSQL needed)
# and provides instructions for Node.js installation

set -e

echo "🚀 FlexAI Setup (No Sudo Required)"
echo "===================================="
echo ""

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.10+ first."
    exit 1
fi

echo "✓ Python 3 found: $(python3 --version)"

# Check if we can create venv
if ! python3 -c "import ensurepip" 2>/dev/null; then
    echo "⚠️  Python venv support not available."
    echo "💡 You need to install: sudo apt install python3-venv"
    echo ""
    echo "Alternatively, we can try installing packages in user mode..."
    echo "Installing packages using --user flag..."
    INSTALL_MODE="--user"
else
    INSTALL_MODE=""
    # Try to create venv
    if python3 -m venv backend/venv 2>/dev/null; then
        echo "✓ Virtual environment created"
        source backend/venv/bin/activate
        pip install --upgrade pip
    else
        echo "⚠️  Could not create venv, using --user installation"
        INSTALL_MODE="--user"
    fi
fi

# Install backend dependencies
echo ""
echo "📥 Installing backend dependencies..."
cd backend

if [ -n "$INSTALL_MODE" ]; then
    python3 -m pip install $INSTALL_MODE --upgrade pip
    python3 -m pip install $INSTALL_MODE -r requirements.txt
else
    pip install -r requirements.txt
fi

# Create .env file with SQLite
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."
    cat > .env << 'EOF'
# Database (Using SQLite - no setup required)
DATABASE_URL=sqlite:///./flexai.db

# Solana Configuration
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_WS_URL=wss://api.devnet.solana.com
SOLANA_PRIVATE_KEY=
PROGRAM_ID=FlexAIPr0gramID1111111111111111111111
TOKEN_MINT=

# CORS
CORS_ORIGINS=["http://localhost:3000","http://localhost:5173"]

# Security
SECRET_KEY=dev-secret-key-change-in-production-$(date +%s)
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Gemini API (optional - will use mock if not provided)
GEMINI_API_KEY=
GEMINI_MODEL=gemini-pro

# Storage
IPFS_GATEWAY=https://ipfs.io/ipfs/
AWS_S3_BUCKET=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
EOF
    echo "✓ .env file created with SQLite configuration"
fi

cd ..

# Update database.py to use SQLite
echo "📝 Updating database configuration for SQLite..."
cat > backend/app/db/database.py << 'EOF'
"""
Database configuration and session management
"""
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
import os

# Use SQLite if DATABASE_URL is not set or points to SQLite
database_url = settings.DATABASE_URL
if database_url.startswith("sqlite"):
    # SQLite configuration
    engine = create_engine(
        database_url,
        connect_args={"check_same_thread": False},  # Needed for SQLite
        pool_pre_ping=True
    )
else:
    # PostgreSQL configuration
    engine = create_engine(
        database_url,
        pool_pre_ping=True,
        pool_size=10,
        max_overflow=20
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    """Dependency for getting database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
EOF

echo "✓ Database configuration updated"

echo ""
echo "✅ Backend setup complete!"
echo ""

# Check Node.js
echo "🔍 Checking Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✓ Node.js found: $NODE_VERSION"
    
    if command -v npm &> /dev/null; then
        echo "✓ npm found: $(npm --version)"
        echo ""
        echo "📥 Installing frontend dependencies..."
        npm install --legacy-peer-deps
        
        # Create frontend .env
        if [ ! -f ".env" ]; then
            echo "VITE_API_URL=http://localhost:8000" > .env
            echo "✓ Frontend .env created"
        fi
        
        echo ""
        echo "✅ Frontend setup complete!"
    else
        echo "⚠️  npm not found. Please install npm."
    fi
else
    echo "⚠️  Node.js not found."
    echo ""
    echo "📋 To install Node.js (choose one method):"
    echo ""
    echo "Method 1: Using nvm (recommended, no sudo needed)"
    echo "  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash"
    echo "  source ~/.bashrc"
    echo "  nvm install 18"
    echo "  nvm use 18"
    echo "  Then run: npm install --legacy-peer-deps"
    echo ""
    echo "Method 2: Using system package manager (requires sudo)"
    echo "  sudo apt install nodejs npm"
    echo ""
fi

echo ""
echo "📋 Next Steps:"
echo "=============="
echo ""
echo "1. Start Backend:"
if [ -d "backend/venv" ]; then
    echo "   cd backend"
    echo "   source venv/bin/activate"
    echo "   python main.py"
else
    echo "   cd backend"
    echo "   python3 main.py"
fi
echo ""
echo "2. Create Dummy Data (optional):"
if [ -d "backend/venv" ]; then
    echo "   cd backend"
    echo "   source venv/bin/activate"
    echo "   python scripts/create_dummy_data.py"
else
    echo "   cd backend"
    echo "   python3 scripts/create_dummy_data.py"
fi
echo ""
echo "3. Start Frontend (if Node.js is installed):"
echo "   npm run dev"
echo ""
echo "4. Visit: http://localhost:5173"
echo ""

