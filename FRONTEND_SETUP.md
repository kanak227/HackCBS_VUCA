# Frontend Setup Guide

## Current Status

- ✅ Backend: Running on http://localhost:8000
- ⚠️ Frontend: Needs Node.js installation

## Quick Setup

### Step 1: Install Node.js

**Option A: Using nvm (Recommended - No sudo needed)**

```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Reload shell
source ~/.bashrc

# Install Node.js 18
nvm install 18
nvm use 18

# Verify
node --version
npm --version
```

**Option B: Using system package manager (Requires sudo)**

```bash
sudo apt update
sudo apt install -y nodejs npm

# Verify
node --version
npm --version
```

### Step 2: Install Frontend Dependencies

```bash
cd /home/mayank/Downloads/HackCBS_VUCA
npm install --legacy-peer-deps
```

### Step 3: Create Frontend .env File

```bash
echo "VITE_API_URL=http://localhost:8000" > .env
```

### Step 4: Start Frontend

```bash
npm run dev
```

Frontend will be available at: **http://localhost:5173**

## Complete Setup Script

```bash
# Install Node.js (if not installed)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18

# Install dependencies
cd /home/mayank/Downloads/HackCBS_VUCA
npm install --legacy-peer-deps

# Create .env
echo "VITE_API_URL=http://localhost:8000" > .env

# Start frontend
npm run dev
```

## Troubleshooting

### npm install fails

```bash
# Clear cache
npm cache clean --force

# Use legacy peer deps
npm install --legacy-peer-deps

# Or try with yarn
npm install -g yarn
yarn install
```

### Port 5173 already in use

```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9

# Or change port in vite.config.ts
```

### Cannot connect to backend

- Check backend is running: `curl http://localhost:8000/health`
- Verify `VITE_API_URL` in `.env` matches backend URL
- Check CORS settings in backend

## Running Both Backend and Frontend

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate
python main.py
```

**Terminal 2 - Frontend:**
```bash
cd /home/mayank/Downloads/HackCBS_VUCA
npm run dev
```

## Access Points

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs

