# Frontend Quick Start

## Current Status

- ✅ Backend: Running on http://localhost:8000
- ❌ Frontend: Needs Node.js installation

## Install Node.js

### Method 1: Using nvm (Recommended - No sudo)

**If you have curl:**
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18
```

**If you don't have curl, download manually:**
```bash
# Download nvm install script
wget https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh
bash install.sh
source ~/.bashrc
nvm install 18
nvm use 18
```

### Method 2: Using system package manager (Requires sudo)

```bash
sudo apt update
sudo apt install -y nodejs npm

# Verify
node --version
npm --version
```

### Method 3: Download Node.js binary

1. Visit: https://nodejs.org/
2. Download Linux binary (x64)
3. Extract and add to PATH

## After Installing Node.js

### Step 1: Install Dependencies

```bash
cd /home/mayank/Downloads/HackCBS_VUCA
npm install --legacy-peer-deps
```

### Step 2: Create .env File

```bash
echo "VITE_API_URL=http://localhost:8000" > .env
```

### Step 3: Start Frontend

```bash
npm run dev
```

## Quick Commands

```bash
# Check if Node.js is installed
node --version

# If not installed, install it (choose one method above)

# Then setup frontend
cd /home/mayank/Downloads/HackCBS_VUCA
npm install --legacy-peer-deps
echo "VITE_API_URL=http://localhost:8000" > .env
npm run dev
```

## Access Points

Once running:
- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs

