#!/bin/bash
# Quick MongoDB Start Script

echo "🔧 Starting MongoDB for FlexAI"
echo "=============================="
echo ""

# Check if MongoDB container exists
if sudo docker ps -a --format '{{.Names}}' | grep -q "^mongodb$"; then
    echo "✅ MongoDB container found"
    
    # Check if it's running
    if sudo docker ps --format '{{.Names}}' | grep -q "^mongodb$"; then
        echo "✅ MongoDB is already running"
        echo "   Connection: mongodb://localhost:27017"
    else
        echo "🔄 Starting MongoDB container..."
        sudo docker start mongodb
        sleep 2
        echo "✅ MongoDB started"
        echo "   Connection: mongodb://localhost:27017"
    fi
else
    echo "📦 Creating MongoDB container..."
    sudo docker run -d --name mongodb -p 27017:27017 -v mongodb_data:/data/db --restart unless-stopped mongo:7.0
    sleep 3
    echo "✅ MongoDB container created and started"
    echo "   Connection: mongodb://localhost:27017"
fi

echo ""
echo "✅ MongoDB is ready!"
echo ""
echo "📝 Next steps:"
echo "   1. Ensure .env has: MONGODB_URL=mongodb://localhost:27017"
echo "   2. Test: cd backend && python3 test_mongodb_connection.py"
echo "   3. Start backend server"
echo ""
