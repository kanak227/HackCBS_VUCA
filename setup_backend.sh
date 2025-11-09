#!/bin/bash

# FlexAI Backend Setup Script

echo "🚀 Setting up FlexAI Backend..."

# Check Python version
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.10+ first."
    exit 1
fi

PYTHON_VERSION=$(python3 --version | cut -d' ' -f2 | cut -d'.' -f1,2)
echo "✓ Python version: $(python3 --version)"

# Create virtual environment if it doesn't exist
if [ ! -d "backend/venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv backend/venv || {
        echo "❌ Failed to create virtual environment."
        echo "💡 Try: sudo apt install python3-venv"
        exit 1
    }
fi

# Activate virtual environment
echo "🔌 Activating virtual environment..."
source backend/venv/bin/activate

# Upgrade pip
echo "⬆️  Upgrading pip..."
pip install --upgrade pip

# Install dependencies
echo "📥 Installing backend dependencies..."
cd backend
pip install -r requirements.txt

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from template..."
    cat > .env << EOF
# Database
DATABASE_URL=postgresql://flexai_user:flexai_password@localhost:5432/flexai_db

# Solana Configuration
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_WS_URL=wss://api.devnet.solana.com
SOLANA_PRIVATE_KEY=
PROGRAM_ID=FlexAIPr0gramID1111111111111111111111
TOKEN_MINT=

# CORS
CORS_ORIGINS=["http://localhost:3000","http://localhost:5173"]

# Security
SECRET_KEY=$(openssl rand -hex 32)
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
    echo "✓ .env file created. Please update with your values."
fi

cd ..

echo "✅ Backend setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Update backend/.env with your configuration"
echo "2. Set up PostgreSQL database (or use SQLite for testing)"
echo "3. Run: source backend/venv/bin/activate && cd backend && python main.py"
echo ""
echo "💡 To create dummy data:"
echo "   source backend/venv/bin/activate && cd backend && python scripts/create_dummy_data.py"

