# MongoDB Quick Setup Guide

## Option 1: Docker (Recommended - Easiest)

### Step 1: Start MongoDB Container
```bash
cd backend
sudo docker run -d --name mongodb -p 27017:27017 -v mongodb_data:/data/db --restart unless-stopped mongo:7.0
```

### Step 2: Verify MongoDB is Running
```bash
sudo docker ps | grep mongo
```

### Step 3: Update .env File
Create or update `backend/.env`:
```bash
MONGODB_URL=mongodb://localhost:27017
MONGODB_DB_NAME=flexai
```

### Step 4: Test Connection
```bash
cd backend
python3 test_mongodb_connection.py
```

### Step 5: Restart Backend
Your backend will automatically connect to MongoDB on startup.

---

## Option 2: MongoDB Atlas (Cloud - Free)

### Step 1: Create Account
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up for free account
3. Create a free cluster

### Step 2: Get Connection String
1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string

### Step 3: Update .env File
```bash
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB_NAME=flexai
```

### Step 4: Test Connection
```bash
cd backend
python3 test_mongodb_connection.py
```

---

## Option 3: Local Installation

### Install MongoDB (Ubuntu/Debian)
```bash
# Import MongoDB public GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Update packages
sudo apt-get update

# Install MongoDB
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Verify
sudo systemctl status mongod
```

### Update .env File
```bash
MONGODB_URL=mongodb://localhost:27017
MONGODB_DB_NAME=flexai
```

---

## Quick Commands

### Start MongoDB (Docker)
```bash
sudo docker start mongodb
```

### Stop MongoDB (Docker)
```bash
sudo docker stop mongodb
```

### Check MongoDB Status (Docker)
```bash
sudo docker ps | grep mongo
```

### View MongoDB Logs (Docker)
```bash
sudo docker logs mongodb
```

### Restart MongoDB (Docker)
```bash
sudo docker restart mongodb
```

### Test MongoDB Connection
```bash
cd backend
python3 test_mongodb_connection.py
```

---

## Troubleshooting

### MongoDB Connection Failed
1. **Check if MongoDB is running:**
   ```bash
   sudo docker ps | grep mongo
   # or
   sudo systemctl status mongod
   ```

2. **Check MongoDB URL in .env:**
   ```bash
   cat backend/.env | grep MONGODB
   ```

3. **Test connection manually:**
   ```bash
   cd backend
   python3 test_mongodb_connection.py
   ```

### Docker Permission Denied
Add your user to docker group:
```bash
sudo usermod -aG docker $USER
# Log out and log back in
```

Or use sudo:
```bash
sudo docker start mongodb
```

### Port Already in Use
If port 27017 is already in use:
```bash
# Find process using port 27017
sudo lsof -i :27017

# Or use different port
sudo docker run -d --name mongodb -p 27018:27017 mongo:7.0
# Then update .env: MONGODB_URL=mongodb://localhost:27018
```

---

## Verify Setup

### 1. Check MongoDB is Running
```bash
sudo docker ps | grep mongo
```

### 2. Test Connection
```bash
cd backend
python3 test_mongodb_connection.py
```

### 3. Check Backend Logs
When you start the backend, you should see:
```
✅ Connected to MongoDB: flexai
```

### 4. Check Database
```bash
# Using mongosh (if installed)
mongosh mongodb://localhost:27017

# Or using Docker
sudo docker exec -it mongodb mongosh
```

---

## Next Steps

1. ✅ MongoDB is running
2. ✅ .env file is configured
3. ✅ Connection test passed
4. ✅ Backend is connected to MongoDB
5. ✅ Ready to use FlexAI!

---

## Need Help?

- MongoDB Docs: https://docs.mongodb.com/
- MongoDB Atlas: https://www.mongodb.com/cloud/atlas
- Docker Docs: https://docs.docker.com/

