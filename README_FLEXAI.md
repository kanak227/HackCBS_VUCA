# FlexAI - Decentralized AI Fine-Tuning Challenge Marketplace

FlexAI is a decentralized marketplace where companies post AI fine-tuning challenges, contributors submit improved models, and blockchain handles reward payouts automatically.

## 🏗️ Tech Stack

- **Frontend**: React + TailwindCSS + Vite
- **Backend**: Python (FastAPI)
- **Database**: PostgreSQL (with MongoDB support available)
- **Blockchain**: Solana (Smart Contracts in Rust/Anchor)
- **Storage**: IPFS (for models + metadata)
- **AI Integration**: Gemini API (for model evaluation)
- **Auth**: JWT-based (Auth0/OAuth ready)
- **Payments**: Solana blockchain (SOL or SPL tokens)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Python 3.10+
- PostgreSQL
- Solana CLI (for smart contract deployment)
- Rust & Anchor (for smart contract development)

### Backend Setup

1. **Install dependencies**:
```bash
cd backend
pip install -r requirements.txt
```

2. **Configure environment**:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Set up database**:
```bash
# Create PostgreSQL database
createdb flexai_db

# Run migrations (tables are created automatically on startup)
```

4. **Create dummy data** (optional):
```bash
python scripts/create_dummy_data.py
```

5. **Start backend server**:
```bash
python main.py
# Or with uvicorn:
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup

1. **Install dependencies**:
```bash
npm install
```

2. **Configure environment**:
```bash
# Create .env file
VITE_API_URL=http://localhost:8000
```

3. **Start development server**:
```bash
npm run dev
```

### Solana Smart Contract Setup

1. **Install Anchor**:
```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install Anchor
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install latest
avm use latest
```

2. **Build and deploy**:
```bash
cd backend/programs/sentinel
anchor build
anchor deploy --provider.cluster devnet
```

3. **Update PROGRAM_ID** in backend `.env`:
```env
PROGRAM_ID=your_deployed_program_id_here
```

## 📁 Project Structure

```
HackCBS_VUCA/
├── backend/
│   ├── app/
│   │   ├── api/              # API routes
│   │   │   ├── challenges.py
│   │   │   ├── submissions.py
│   │   │   ├── admin.py
│   │   │   ├── leaderboard.py
│   │   │   └── auth.py
│   │   ├── core/             # Core configuration
│   │   ├── db/               # Database models
│   │   └── services/         # Business logic
│   │       ├── flexai_solana_service.py
│   │       └── gemini_service.py
│   ├── programs/
│   │   └── sentinel/         # Solana smart contract
│   │       └── src/
│   │           └── lib.rs
│   └── scripts/
│       └── create_dummy_data.py
├── src/
│   ├── pages/                # React pages
│   │   ├── Landing.tsx
│   │   ├── ChallengesDashboard.tsx
│   │   ├── ChallengeDetail.tsx
│   │   ├── SubmitModel.tsx
│   │   └── LeaderboardPage.tsx
│   ├── components/           # React components
│   └── utils/                # Utilities
│       └── api.ts
└── README_FLEXAI.md
```

## ⚙️ Features

### For Companies
- Post AI fine-tuning challenges with reward pools
- Set baseline accuracy requirements
- Automatically receive improved model submissions
- Review and approve submissions through admin panel

### For Contributors
- Browse active challenges
- Submit fine-tuned models
- Automatic evaluation via Gemini API
- Earn rewards for approved submissions
- Build reputation on leaderboard

### Blockchain Integration
- Challenge creation logged on Solana
- Model submissions recorded on-chain
- Automatic reward distribution via smart contracts
- Transparent reputation tracking

## 🔐 Environment Variables

### Backend (.env)

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/flexai_db

# Solana
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_PRIVATE_KEY=your_private_key_base58
PROGRAM_ID=your_program_id
TOKEN_MINT=your_spl_token_mint

# Gemini API
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-pro

# Security
SECRET_KEY=your_secret_key
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:8000
```

## 📡 API Endpoints

### Challenges
- `GET /api/challenges` - List all challenges
- `GET /api/challenges/{challenge_id}` - Get challenge details
- `POST /api/challenges/` - Create a new challenge
- `GET /api/challenges/{challenge_id}/submissions` - Get challenge submissions

### Submissions
- `GET /api/submissions` - List all submissions
- `GET /api/submissions/{submission_id}` - Get submission details
- `POST /api/submissions/` - Submit a model

### Admin
- `POST /api/admin/approve` - Approve a submission
- `POST /api/admin/reject` - Reject a submission

### Leaderboard
- `GET /api/leaderboard` - Get leaderboard
- `GET /api/leaderboard/contributor/{address}` - Get contributor stats

## 🧪 Testing

### Create Dummy Data
```bash
python backend/scripts/create_dummy_data.py
```

### Test API
```bash
# Start backend
python backend/main.py

# Test endpoints
curl http://localhost:8000/api/challenges
```

## 🚀 Deployment

### Backend (Render/Heroku)
1. Set environment variables
2. Deploy PostgreSQL database
3. Deploy FastAPI application

### Frontend (Vercel)
1. Set environment variables
2. Deploy React application

### Solana Program
1. Build program: `anchor build`
2. Deploy to devnet: `anchor deploy --provider.cluster devnet`
3. Deploy to mainnet: `anchor deploy --provider.cluster mainnet`

## 📝 Workflow

1. **Company posts challenge** → Blockchain logs challenge + reward pool
2. **Contributor submits model** → Model uploaded to IPFS, submission recorded on-chain
3. **Backend evaluates model** → Gemini API evaluates model performance
4. **Moderator approves** → Blockchain releases reward to contributor
5. **Frontend displays** → Success message + transaction hash

## 🔧 Troubleshooting

### Backend won't start
- Check database connection
- Verify environment variables
- Check Solana RPC URL

### Frontend can't connect to backend
- Verify `VITE_API_URL` in frontend .env
- Check CORS settings in backend
- Ensure backend is running

### Solana transactions failing
- Verify PROGRAM_ID is set correctly
- Check wallet has sufficient SOL
- Verify network (devnet vs mainnet)

## 📄 License

MIT

## 🤝 Contributing

Contributions welcome! Please open an issue or submit a pull request.

## 📧 Contact

For questions or support, please open an issue on GitHub.
