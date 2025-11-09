# MongoDB Connection Fix

## Current Issue

MongoDB Atlas connection is failing with SSL handshake errors.

## Solutions

### Option 1: Fix MongoDB Atlas Connection String

Your current connection string might be missing the database name or have incorrect format.

**Current (in .env):**
```env
MONGODB_URL=mongodb+srv://mayank:kanak@cluster0.nj3tr35.mongodb.net/?appName=Cluster0
```

**Should be:**
```env
MONGODB_URL=mongodb+srv://mayank:kanak@cluster0.nj3tr35.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB_NAME=flexai
```

**Or with database in URL:**
```env
MONGODB_URL=mongodb+srv://mayank:kanak@cluster0.nj3tr35.mongodb.net/flexai?retryWrites=true&w=majority
MONGODB_DB_NAME=flexai
```

### Option 2: Use Local MongoDB (Easiest)

**Install with Docker:**
```bash
docker run -d --name mongodb -p 27017:27017 mongo:7.0
```

**Update .env:**
```env
MONGODB_URL=mongodb://localhost:27017
MONGODB_DB_NAME=flexai
```

### Option 3: Check MongoDB Atlas Settings

1. **Network Access:**
   - Go to MongoDB Atlas Dashboard
   - Network Access → Add IP Address
   - Add `0.0.0.0/0` for testing (or your server IP)

2. **Database User:**
   - Verify username/password are correct
   - Check user has read/write permissions

3. **Connection String:**
   - Get fresh connection string from Atlas
   - Use "Connect" → "Connect your application"
   - Copy the connection string

### Option 4: Test Connection

```bash
cd backend
source venv/bin/activate
python -c "
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

async def test():
    try:
        client = AsyncIOMotorClient(settings.MONGODB_URL)
        await client.admin.command('ping')
        print('✅ MongoDB connection successful!')
        client.close()
    except Exception as e:
        print(f'❌ Connection failed: {e}')

asyncio.run(test())
"
```

## Current Status

✅ **Server starts successfully** even if MongoDB connection fails
⚠️ **MongoDB features won't work** until connection is fixed
✅ **API routes work** (using SQLAlchemy for now)

## Quick Fix

For quick testing, use local MongoDB:

```bash
# Start MongoDB
docker run -d --name mongodb -p 27017:27017 mongo:7.0

# Update .env
MONGODB_URL=mongodb://localhost:27017
MONGODB_DB_NAME=flexai

# Restart backend
python main.py
```

