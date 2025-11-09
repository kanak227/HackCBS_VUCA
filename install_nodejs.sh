#!/bin/bash
echo "🚀 Node.js Installation Guide"
echo "============================="
echo ""

# Check if Node.js is already installed
if command -v node &> /dev/null; then
    echo "✅ Node.js is already installed!"
    echo "   Version: $(node --version)"
    echo "   npm: $(npm --version)"
    exit 0
fi

echo "❌ Node.js is not installed"
echo ""
echo "Please choose an installation method:"
echo ""
echo "Method 1: Using nvm (Recommended)"
echo "-----------------------------------"
echo "Run these commands:"
echo ""
if command -v wget &> /dev/null; then
    echo "  wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash"
else
    echo "  # Download install script first, then:"
    echo "  bash install.sh"
fi
echo "  source ~/.bashrc"
echo "  nvm install 18"
echo "  nvm use 18"
echo ""
echo "Method 2: Using apt (Requires sudo)"
echo "-----------------------------------"
echo "  sudo apt update"
echo "  sudo apt install -y nodejs npm"
echo ""
echo "Method 3: Manual download"
echo "-------------------------"
echo "  1. Visit: https://nodejs.org/"
echo "  2. Download Linux x64 binary"
echo "  3. Extract and add to PATH"
echo ""
echo "After installation, run:"
echo "  cd /home/mayank/Downloads/HackCBS_VUCA"
echo "  npm install --legacy-peer-deps"
echo "  echo 'VITE_API_URL=http://localhost:8000' > .env"
echo "  npm run dev"
