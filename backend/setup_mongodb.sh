#!/bin/bash

# MongoDB Setup Script for FlexAI
# This script helps set up MongoDB for the FlexAI project

set -e

echo "🔧 MongoDB Setup for FlexAI"
echo "============================"
echo ""

# Check if Docker is installed
if command -v docker &> /dev/null; then
    echo "✅ Docker is installed"
    
    # Check if MongoDB container already exists
    if docker ps -a --format '{{.Names}}' | grep -q "^mongodb$"; then
        echo "📦 MongoDB container already exists"
        
        # Check if it's running
        if docker ps --format '{{.Names}}' | grep -q "^mongodb$"; then
            echo "✅ MongoDB container is already running"
            echo "   Connection string: mongodb://localhost:27017"
        else
            echo "🔄 Starting MongoDB container..."
            docker start mongodb
            sleep 2
            echo "✅ MongoDB container started"
            echo "   Connection string: mongodb://localhost:27017"
        fi
    else
        echo "📦 Creating new MongoDB container..."
        docker run -d \
            --name mongodb \
            -p 27017:27017 \
            -v mongodb_data:/data/db \
            --restart unless-stopped \
            mongo:7.0
        
        sleep 3
        echo "✅ MongoDB container created and started"
        echo "   Connection string: mongodb://localhost:27017"
        echo "   Database name: flexai"
    fi
    
    echo ""
    echo "✅ MongoDB is ready!"
    echo ""
    echo "📝 Next steps:"
    echo "   1. Update .env file with:"
    echo "      MONGODB_URL=mongodb://localhost:27017"
    echo "      MONGODB_DB_NAME=flexai"
    echo ""
    echo "   2. Restart your backend server"
    echo ""
    echo "   3. Test connection:"
    echo "      python3 -m app.db.test_mongodb"
    echo ""
    
elif command -v mongod &> /dev/null; then
    echo "✅ MongoDB is installed locally"
    
    # Check if MongoDB is running
    if systemctl is-active --quiet mongod 2>/dev/null || pgrep -x mongod > /dev/null; then
        echo "✅ MongoDB is running"
        echo "   Connection string: mongodb://localhost:27017"
    else
        echo "⚠️  MongoDB is not running"
        echo "   Starting MongoDB..."
        
        if systemctl start mongod 2>/dev/null; then
            echo "✅ MongoDB started via systemd"
        elif sudo systemctl start mongod 2>/dev/null; then
            echo "✅ MongoDB started via systemd (with sudo)"
        else
            echo "❌ Could not start MongoDB automatically"
            echo "   Please start MongoDB manually:"
            echo "   sudo systemctl start mongod"
            echo "   or"
            echo "   mongod --dbpath /var/lib/mongodb"
        fi
    fi
    
    echo ""
    echo "✅ MongoDB is ready!"
    echo ""
    echo "📝 Next steps:"
    echo "   1. Update .env file with:"
    echo "      MONGODB_URL=mongodb://localhost:27017"
    echo "      MONGODB_DB_NAME=flexai"
    echo ""
    echo "   2. Restart your backend server"
    echo ""
    
else
    echo "❌ MongoDB is not installed"
    echo ""
    echo "📦 Installing MongoDB using Docker (recommended)..."
    echo ""
    
    if command -v docker &> /dev/null; then
        echo "✅ Docker is available"
        echo "📦 Creating MongoDB container..."
        docker run -d \
            --name mongodb \
            -p 27017:27017 \
            -v mongodb_data:/data/db \
            --restart unless-stopped \
            mongo:7.0
        
        sleep 3
        echo "✅ MongoDB container created and started"
        echo "   Connection string: mongodb://localhost:27017"
        echo "   Database name: flexai"
        echo ""
        echo "📝 Next steps:"
        echo "   1. Update .env file with:"
        echo "      MONGODB_URL=mongodb://localhost:27017"
        echo "      MONGODB_DB_NAME=flexai"
        echo ""
        echo "   2. Restart your backend server"
        echo ""
    else
        echo "❌ Docker is not installed"
        echo ""
        echo "Please install MongoDB using one of these methods:"
        echo ""
        echo "Option 1: Install Docker (recommended)"
        echo "   sudo apt-get update"
        echo "   sudo apt-get install -y docker.io"
        echo "   sudo systemctl start docker"
        echo "   sudo systemctl enable docker"
        echo "   Then run this script again"
        echo ""
        echo "Option 2: Install MongoDB locally"
        echo "   See: backend/MONGODB_SETUP.md"
        echo ""
        echo "Option 3: Use MongoDB Atlas (cloud)"
        echo "   1. Sign up at https://www.mongodb.com/cloud/atlas"
        echo "   2. Create a free cluster"
        echo "   3. Get connection string"
        echo "   4. Update .env with:"
        echo "      MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority"
        echo "      MONGODB_DB_NAME=flexai"
        echo ""
        exit 1
    fi
fi

echo ""
echo "🎉 MongoDB setup complete!"
echo ""

