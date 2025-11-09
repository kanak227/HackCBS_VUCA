#!/bin/bash
# Start Frontend Script

cd /home/mayank/Downloads/HackCBS_VUCA

# Load nvm if available
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Use Node.js 18 if nvm is available
if command -v nvm &> /dev/null; then
    nvm use 18
fi

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found!"
    echo ""
    echo "Please install Node.js first:"
    echo "  ./install_nodejs.sh"
    exit 1
fi

echo "✅ Node.js: $(node --version)"
echo "✅ npm: $(npm --version)"
echo ""

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📥 Installing dependencies..."
    npm install --legacy-peer-deps
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."
    echo "VITE_API_URL=http://localhost:8000" > .env
fi

echo "🚀 Starting frontend..."
echo "📋 Frontend will be available at: http://localhost:5173"
echo ""

npm run dev

