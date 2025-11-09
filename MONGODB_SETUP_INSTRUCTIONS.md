# MongoDB Setup Instructions for FlexAI

## Quick Setup (Choose One Method)

### Method 1: Docker (Recommended) ⭐

**Step 1: Start MongoDB Container**
```bash
sudo docker run -d --name mongodb -p 27017:27017 -v mongodb_data:/data/db --restart unless-stopped mongo:7.0
```

**Step 2: Verify MongoDB is Running**
```bash
sudo docker ps | grep mongo
```

**Step 3: Update .env File**
Edit `backend/.env` and ensure these lines are present:
```bash
MONGODB_URL=mongodb://localhost:27017
MONGODB_DB_NAME=flexai
```

**Step 4: Test Connection**
```bash
cd backend
source venv/bin/activate  # or .venv/bin/activate
python3 test_mongodb_connection.py
```

**Step 5: Restart Backend**
Your backend will automatically connect to MongoDB on startup.

---

### Method 2: MongoDB Atlas (Cloud - Free) ☁️

**Step 1: Create Account**
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up for free account
3. Create a free cluster (M0 tier)

**Step 2: Get Connection String**
1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)

**Step 3: Update .env File**
Edit `backend/.env`:
```bash
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB_NAME=flexai
```

**Step 4: Test Connection**
```bash
cd backend
source venv/bin/activate
python3 test_mongodb_connection.py
```

---

## Verify Setup

### 1. Check MongoDB is Running (Docker)
```bash
sudo docker ps | grep mongo
```

### 2. Test Connection
```bash
cd backend
source venv/bin/activate
python3 test_mongodb_connection.py
```

Expected output:
```
✅ Connected to MongoDB!
📊 Database: flexai
🎉 MongoDB connection test passed!
```

### 3. Check Backend Logs
When you start the backend, you should see:
```
✅ Connected to MongoDB: flexai
MongoDB indexes created successfully
```

---

## Common Issues & Solutions

### Issue 1: Docker Permission Denied
**Solution:**
```bash
# Option A: Use sudo
sudo docker start mongodb

# Option B: Add user to docker group (recommended)
sudo usermod -aG docker $USER
# Then log out and log back in
```

### Issue 2: Port 27017 Already in Use
**Solution:**
```bash
# Find what's using the port
sudo lsof -i :27017

# Or use different port
sudo docker run -d --name mongodb -p 27018:27017 mongo:7.0
# Update .env: MONGODB_URL=mongodb://localhost:27018
```

### Issue 3: MongoDB Connection Failed
**Check:**
1. MongoDB is running: `sudo docker ps | grep mongo`
2. .env file has correct URL: `cat backend/.env | grep MONGODB`
3. Network connectivity
4. MongoDB logs: `sudo docker logs mongodb`

### Issue 4: Module Not Found (pydantic_settings)
**Solution:**
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
```

---

## MongoDB Integration Status

### ✅ Already Integrated:
- MongoDB connection manager (`app/db/mongodb.py`)
- MongoDB models (`app/db/mongodb_models.py`)
- MongoDB repository (`app/db/mongodb_repository.py`)
- Connection lifecycle in `main.py`
- Automatic index creation

### ⚠️ Currently Using:
- API routes are using SQLAlchemy (SQLite) for now
- MongoDB infrastructure is ready but not yet used in routes

### 🔄 Migration Path:
The MongoDB infrastructure is ready. API routes can be migrated to use MongoDB repositories when needed.

---

## Useful Commands

### Start MongoDB
```bash
sudo docker start mongodb
```

### Stop MongoDB
```bash
sudo docker stop mongodb
```

### Restart MongoDB
```bash
sudo docker restart mongodb
```

### View MongoDB Logs
```bash
sudo docker logs mongodb
```

### Access MongoDB Shell
```bash
sudo docker exec -it mongodb mongosh
```

### Remove MongoDB Container
```bash
sudo docker stop mongodb
sudo docker rm mongodb
```

---

## Next Steps

1. ✅ Set up MongoDB (Docker or Atlas)
2. ✅ Update .env file with MONGODB_URL
3. ✅ Test connection
4. ✅ Restart backend server
5. ✅ Verify MongoDB connection in backend logs
6. ✅ Ready to use!

---

## Need Help?

- See `backend/MONGODB_QUICK_SETUP.md` for detailed instructions
- Check backend logs for connection errors
- Test connection: `python3 backend/test_mongodb_connection.py`
- MongoDB Docs: https://docs.mongodb.com/
- MongoDB Atlas: https://www.mongodb.com/cloud/atlas

