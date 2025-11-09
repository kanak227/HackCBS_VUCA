#!/bin/bash
# Check MongoDB Status (No sudo required)

echo "🔍 MongoDB Status Check"
echo "======================"
echo ""

# Check Docker MongoDB
echo "1. Docker MongoDB Container:"
if docker ps -a 2>/dev/null | grep -q mongo; then
    docker ps -a | grep mongo
    echo "   ✅ MongoDB container found"
    if docker ps 2>/dev/null | grep -q mongo; then
        echo "   ✅ Container is RUNNING"
    else
        echo "   ⚠️  Container exists but is NOT running"
        echo "   Start it with: docker start mongodb"
    fi
else
    echo "   ❌ No MongoDB Docker container found"
fi
echo ""

# Check local MongoDB port
echo "2. Local MongoDB (port 27017):"
if command -v netstat &> /dev/null; then
    if netstat -an 2>/dev/null | grep -q ":27017"; then
        echo "   ✅ Port 27017 is in use (MongoDB might be running)"
        netstat -an 2>/dev/null | grep ":27017" | head -2
    else
        echo "   ❌ Port 27017 not in use (MongoDB not running locally)"
    fi
elif command -v ss &> /dev/null; then
    if ss -an 2>/dev/null | grep -q ":27017"; then
        echo "   ✅ Port 27017 is in use (MongoDB might be running)"
        ss -an 2>/dev/null | grep ":27017" | head -2
    else
        echo "   ❌ Port 27017 not in use (MongoDB not running locally)"
    fi
else
    echo "   ⚠️  Cannot check port (netstat/ss not available)"
fi
echo ""

# Check MongoDB Atlas connection
echo "3. MongoDB Atlas Connection:"
echo "   (Check your .env file for MONGODB_URL)"
if [ -f .env ]; then
    if grep -q "mongodb+srv" .env 2>/dev/null; then
        echo "   ✅ Using MongoDB Atlas (cloud)"
        echo "   Connection string: $(grep MONGODB_URL .env | cut -d'=' -f2 | cut -d'@' -f2 | cut -d'/' -f1)"
    elif grep -q "mongodb://localhost" .env 2>/dev/null; then
        echo "   ✅ Using local MongoDB"
    else
        echo "   ⚠️  MongoDB URL not found in .env"
    fi
else
    echo "   ⚠️  .env file not found"
fi
echo ""

# Summary
echo "📋 Summary:"
echo "   - For LOCAL MongoDB: Use Docker or install MongoDB locally"
echo "   - For MongoDB Atlas: Just fix connection string in .env"
echo "   - Current issue: SSL handshake error (fix connection string)"
echo ""

