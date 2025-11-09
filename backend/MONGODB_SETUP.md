# MongoDB Setup Guide for FlexAI

## Overview

FlexAI now uses **MongoDB** as the primary database for storing all data.

## Prerequisites

### Install MongoDB

**Ubuntu/Debian:**
```bash
# Import MongoDB public GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Update and install
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

**Using Docker (Recommended):**
```bash
docker run -d \
  --name mongodb \
  -p 27017:27017 \
  -v mongodb_data:/data/db \
  mongo:7.0
```

**Using MongoDB Atlas (Cloud - Free tier available):**
1. Sign up at https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get connection string
4. Update `MONGODB_URL` in `.env`

## Configuration

### Update .env File

Edit `backend/.env`:

```env
# MongoDB Configuration (Primary Database)
MONGODB_URL=mongodb://localhost:27017
MONGODB_DB_NAME=flexai

# For MongoDB Atlas (Cloud):
# MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
# MONGODB_DB_NAME=flexai

# For MongoDB with authentication:
# MONGODB_URL=mongodb://username:password@localhost:27017/flexai?authSource=admin
```

### Connection Strings

**Local MongoDB (no auth):**
```
mongodb://localhost:27017
```

**Local MongoDB (with auth):**
```
mongodb://username:password@localhost:27017/flexai?authSource=admin
```

**MongoDB Atlas (cloud):**
```
mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
```

## Database Structure

MongoDB collections (equivalent to SQL tables):

- `challenges` - AI fine-tuning challenges
- `submissions` - Model submissions
- `evaluations` - Model evaluation results
- `contributor_reputations` - Contributor stats
- `rewards` - Reward distribution records
- `users` - User accounts

## Indexes

Indexes are automatically created on startup for:
- `challenge_id` (unique)
- `contributor_address`
- `status`
- `deadline`
- And more for optimal performance

## Migration from SQLite/PostgreSQL

If you have existing data in SQLite/PostgreSQL:

1. **Export data** from old database
2. **Import to MongoDB** using migration script (to be created)
3. **Update .env** to use MongoDB

## Testing Connection

```bash
cd backend
source venv/bin/activate
python -c "
import asyncio
from app.db.mongodb import MongoDB
from app.core.config import settings

async def test():
    await MongoDB.connect()
    db = MongoDB.get_database()
    result = await db.command('ping')
    print('✓ MongoDB connection successful!')
    await MongoDB.disconnect()

asyncio.run(test())
"
```

## Running with MongoDB

```bash
cd backend
source venv/bin/activate
python main.py
```

The application will:
1. Connect to MongoDB on startup
2. Create indexes automatically
3. Use MongoDB for all data operations

## MongoDB Compass (GUI)

Install MongoDB Compass for visual database management:
- Download: https://www.mongodb.com/try/download/compass
- Connect to: `mongodb://localhost:27017`
- View and edit data visually

## Troubleshooting

### Connection Failed
```bash
# Check if MongoDB is running
sudo systemctl status mongod

# Check MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log

# Test connection
mongosh mongodb://localhost:27017
```

### Authentication Issues
- Check username/password in connection string
- Verify `authSource` parameter
- Check MongoDB user permissions

### Port Already in Use
```bash
# Check what's using port 27017
sudo lsof -i :27017

# Change MongoDB port in mongod.conf
# Then update MONGODB_URL in .env
```

## Production Considerations

1. **Enable Authentication**
   ```bash
   # Create admin user
   mongosh admin --eval "db.createUser({user: 'admin', pwd: 'password', roles: ['root']})"
   ```

2. **Use MongoDB Atlas** for managed hosting

3. **Enable Replication** for high availability

4. **Set up Backups** regularly

5. **Monitor Performance** using MongoDB monitoring tools

## Next Steps

1. ✅ Install MongoDB
2. ✅ Update `.env` with MongoDB URL
3. ✅ Start backend (will auto-connect)
4. ✅ Create dummy data (will use MongoDB)
5. ✅ Verify data in MongoDB Compass

## Resources

- MongoDB Docs: https://docs.mongodb.com/
- MongoDB Atlas: https://www.mongodb.com/cloud/atlas
- Motor (Python Driver): https://motor.readthedocs.io/
- PyMongo: https://pymongo.readthedocs.io/

