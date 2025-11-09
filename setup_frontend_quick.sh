#!/bin/bash
echo "🚀 Frontend Setup Script"
echo "========================"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found"
    echo ""
    echo "Installing Node.js using nvm..."
    
    # Install nvm
    if [ ! -d "$HOME/.nvm" ]; then
        curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
        export NVM_DIR="$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    else
        export NVM_DIR="$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    fi
    
    # Install Node.js 18
    nvm install 18
    nvm use 18
    echo "✅ Node.js installed: $(node --version)"
else
    echo "✅ Node.js found: $(node --version)"
fi

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found"
    exit 1
else
    echo "✅ npm found: $(npm --version)"
fi

# Install dependencies
echo ""
echo "📥 Installing frontend dependencies..."
npm install --legacy-peer-deps

# Create .env file
if [ ! -f ".env" ]; then
    echo ""
    echo "📝 Creating .env file..."
    echo "VITE_API_URL=http://localhost:8000" > .env
    echo "✅ .env file created"
fi

echo ""
echo "✅ Frontend setup complete!"
echo ""
echo "🚀 To start frontend:"
echo "   npm run dev"
echo ""
echo "📋 Frontend will be available at: http://localhost:5173"
