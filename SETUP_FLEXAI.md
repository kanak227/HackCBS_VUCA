# FlexAI Setup Guide

## Quick Setup Instructions

### 1. Backend Setup

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
# Create .env file with:
# DATABASE_URL=postgresql://user:password@localhost:5432/flexai_db
# SOLANA_RPC_URL=https://api.devnet.solana.com
# SOLANA_PRIVATE_KEY=your_private_key
# PROGRAM_ID=FlexAIPr0gramID1111111111111111111111
# GEMINI_API_KEY=your_gemini_key (optional)

# Create database
createdb flexai_db

# Create dummy data (optional)
python scripts/create_dummy_data.py

# Run backend
python main.py
```

### 2. Frontend Setup

```bash
# Install dependencies
npm install

# Create .env file with:
# VITE_API_URL=http://localhost:8000

# Run frontend
npm run dev
```

### 3. Solana Program Setup (Optional)

```bash
cd backend/programs/sentinel

# Build program
anchor build

# Deploy to devnet
anchor deploy --provider.cluster devnet

# Update PROGRAM_ID in backend .env
```

## Features Implemented

✅ **Backend**
- Challenge CRUD operations
- Model submission system
- Gemini API integration for evaluation
- Admin approval/rejection system
- Leaderboard with reputation scoring
- Solana blockchain integration
- Authentication (JWT-based)

✅ **Frontend**
- Landing page
- Challenges dashboard
- Challenge detail page
- Model submission page
- Leaderboard page
- Wallet integration (Solana)

✅ **Blockchain**
- Solana smart contract for challenges
- Model submission on-chain
- Reward distribution
- Reputation tracking

✅ **Database**
- PostgreSQL models for challenges, submissions, evaluations
- Contributor reputation tracking
- Reward distribution records

## API Endpoints

- `GET /api/challenges` - List challenges
- `GET /api/challenges/{id}` - Get challenge details
- `POST /api/challenges` - Create challenge
- `POST /api/submissions` - Submit model
- `GET /api/submissions` - List submissions
- `POST /api/admin/approve` - Approve submission
- `POST /api/admin/reject` - Reject submission
- `GET /api/leaderboard` - Get leaderboard

## Testing

1. Start backend: `python backend/main.py`
2. Start frontend: `npm run dev`
3. Create dummy data: `python backend/scripts/create_dummy_data.py`
4. Visit: `http://localhost:5173`

## Notes

- Gemini API key is optional - mock evaluation will be used if not provided
- Solana transactions will use fallback if PROGRAM_ID is not configured
- All blockchain operations are on Solana devnet by default
- MongoDB support is configured but PostgreSQL is used as primary database
