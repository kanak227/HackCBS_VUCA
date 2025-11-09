# FlexAI - Quick Start Guide

## ✅ Setup Complete!

The backend is fully set up and ready to run. Here's how to start it:

## 🚀 Running the Backend

```bash
cd /home/mayank/Downloads/HackCBS_VUCA/backend
source venv/bin/activate
python main.py
```

The backend will start on: **http://localhost:8000**

## 📡 API Endpoints

Once the backend is running, you can access:

- **API Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health
- **Challenges**: http://localhost:8000/api/challenges
- **Leaderboard**: http://localhost:8000/api/leaderboard

## 🧪 Test the API

```bash
# List challenges
curl http://localhost:8000/api/challenges

# Get leaderboard
curl http://localhost:8000/api/leaderboard

# Get a specific challenge
curl http://localhost:8000/api/challenges/challenge-001
```

## 📊 Database

The SQLite database is at: `backend/flexai.db`

It contains:
- 3 challenges
- 10 submissions
- 4 contributors

## 🌐 Frontend Setup (Optional)

To run the frontend, you need Node.js:

```bash
# Install Node.js using nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18

# Install frontend dependencies
cd /home/mayank/Downloads/HackCBS_VUCA
npm install --legacy-peer-deps

# Create .env file
echo "VITE_API_URL=http://localhost:8000" > .env

# Start frontend
npm run dev
```

Frontend will be available at: **http://localhost:5173**

## 📝 Current Status

### ✅ Backend
- Virtual environment: ✅ Created
- Dependencies: ✅ Installed
- Database: ✅ SQLite with dummy data
- Server: ✅ Ready to run

### ⚠️ Frontend
- Node.js: ❌ Not installed (see instructions above)
- Dependencies: ❌ Not installed (requires Node.js)

## 🎯 Quick Commands

```bash
# Start backend
cd backend && source venv/bin/activate && python main.py

# Test API (in another terminal)
curl http://localhost:8000/api/challenges

# View database
cd backend && sqlite3 flexai.db "SELECT * FROM challenges;"
```

## 💡 Notes

- Backend uses SQLite (no PostgreSQL setup needed)
- Solana integration uses fallback mode (works without deployed program)
- Gemini API uses mock evaluation (works without API key)
- All dummy data is pre-loaded

## 🐛 Troubleshooting

### Backend won't start
- Make sure virtual environment is activated: `source venv/bin/activate`
- Check if port 8000 is available: `lsof -i :8000`

### Database issues
- Database file: `backend/flexai.db`
- Recreate dummy data: `python scripts/create_dummy_data.py`

### API not responding
- Check backend is running: `curl http://localhost:8000/health`
- Check logs in terminal where backend is running

## 📚 Documentation

- API Documentation: http://localhost:8000/docs (when backend is running)
- Setup Guide: See `SETUP_COMPLETE.md`
- Installation: See `INSTALL.md`

## 🎉 You're Ready!

The backend is fully functional. You can:
1. Start the backend server
2. Test API endpoints
3. View API documentation
4. Install Node.js to run the frontend (optional)

Enjoy building with FlexAI! 🚀

