#!/bin/bash

# Sentinel.ai Backend Setup Script

echo "🚀 Setting up Sentinel.ai Backend..."

# Create virtual environment
echo "📦 Creating virtual environment..."
python3 -m venv venv
source venv/bin/activate

# Install dependencies
echo "📥 Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "⚠️  Please edit .env with your configuration"
fi

# Create models directory
echo "📁 Creating directories..."
mkdir -p models
mkdir -p logs

# Set up PostgreSQL database
echo "🗄️  Setting up database..."
echo "Please ensure PostgreSQL is running and create the database:"
echo "  createdb sentinel_db"
echo "  Or update DATABASE_URL in .env"

# Run database migrations
echo "🔄 Running database migrations..."
alembic upgrade head

# Install Anchor (for Solana programs)
echo "⚓ Installing Anchor (if not already installed)..."
if ! command -v anchor &> /dev/null; then
    echo "Please install Anchor: https://www.anchor-lang.com/docs/installation"
fi

echo "✅ Setup complete!"
echo "📚 Next steps:"
echo "  1. Edit .env with your configuration"
echo "  2. Set up PostgreSQL database"
echo "  3. Deploy Solana programs: cd programs/sentinel && anchor build && anchor deploy"
echo "  4. Update PROGRAM_ID in .env"
echo "  5. Run: uvicorn main:app --reload"

