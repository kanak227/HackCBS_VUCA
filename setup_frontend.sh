#!/bin/bash

# FlexAI Frontend Setup Script

echo "🚀 Setting up FlexAI Frontend..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed."
    echo "💡 Installing Node.js..."
    
    # Try to install Node.js using nvm or provide instructions
    if command -v curl &> /dev/null; then
        echo "📥 Installing Node.js using nvm..."
        curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
        export NVM_DIR="$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
        nvm install 18
        nvm use 18
    else
        echo "❌ Please install Node.js 18+ first:"
        echo "   Visit: https://nodejs.org/ or use: sudo apt install nodejs npm"
        exit 1
    fi
fi

NODE_VERSION=$(node --version)
echo "✓ Node.js version: $NODE_VERSION"

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed."
    echo "💡 Try: sudo apt install npm"
    exit 1
fi

NPM_VERSION=$(npm --version)
echo "✓ npm version: $NPM_VERSION"

# Install dependencies
echo "📥 Installing frontend dependencies..."
npm install --legacy-peer-deps

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
VITE_API_URL=http://localhost:8000
EOF
    echo "✓ .env file created."
fi

echo "✅ Frontend setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Update .env with your API URL if different"
echo "2. Run: npm run dev"
echo ""
echo "💡 The frontend will be available at: http://localhost:5173"

