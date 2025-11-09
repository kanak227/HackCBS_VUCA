# FlexAI - Decentralized AI Fine-tuning Challenge Marketplace

A blockchain-powered marketplace where AI enthusiasts can participate in fine-tuning challenges, submit models, and earn SOL rewards. Built on Solana with a modern React frontend and FastAPI backend.

## 🎯 Overview

FlexAI is a decentralized platform that connects challenge creators (moderators) with AI model contributors. Contributors submit fine-tuned models for challenges, moderators review and approve submissions, and rewards are automatically distributed via Solana blockchain transactions.

## ✨ Features

### For Contributors (Users)
- **Browse Active Challenges**: View all available AI fine-tuning challenges
- **Submit Models**: Upload fine-tuned models for challenges
- **Multiple Submissions**: Submit multiple models to improve results
- **Track Submissions**: View submission status, evaluation metrics, and rewards
- **Leaderboard**: Compete with other contributors
- **Real-time Rewards**: Receive SOL directly to your wallet upon approval
- **Transaction History**: View all blockchain transactions

### For Moderators
- **Create Challenges**: Define new AI fine-tuning challenges with rewards
- **Review Submissions**: Approve or reject submitted models
- **Blockchain Transactions**: Send SOL rewards directly from wallet
- **Real-time Feedback**: See transaction status and Solscan links
- **Separate Dashboard**: Dedicated moderator interface

## 🛠️ Tech Stack

### Frontend
- **React 18** + **TypeScript** + **Vite**
- **TailwindCSS** - Modern cyberpunk-themed UI
- **Framer Motion** - Smooth animations
- **Solana Wallet Adapter** - Wallet integration (Phantom, Solflare)
- **React Router** - Navigation
- **Recharts** - Data visualization

### Backend
- **FastAPI** - Python web framework
- **MongoDB** - Primary database (with Motor async driver)
- **SQLAlchemy** - ORM for legacy SQL support
- **Solana Web3.js** - Blockchain integration
- **Gemini API** - Model evaluation (optional)
- **Pydantic** - Data validation

### Blockchain
- **Solana Testnet** - Network for transactions
- **Anchor Framework** - Smart contract development
- **Direct SOL Transfers** - Real blockchain transactions

## 📋 Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.12+
- **MongoDB** (local or Atlas)
- **Solana Wallet** (Phantom or Solflare) with testnet SOL

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd HackCBS_VUCA
```

### 2. Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp env.example .env
# Edit .env with your MongoDB URL and other settings
```

### 3. MongoDB Setup

**Option A: Local MongoDB (Docker)**
```bash
sudo docker run -d --name mongodb -p 27017:27017 mongo:7.0
```

**Option B: MongoDB Atlas (Cloud)**
1. Sign up at https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get connection string
4. Update `.env` with your MongoDB URL

**Test Connection:**
```bash
cd backend
source venv/bin/activate
python3 test_mongodb_connection.py
```

### 4. Frontend Setup

```bash
# From project root
npm install --legacy-peer-deps

# Start development server
npm run dev
```

### 5. Start Backend

```bash
cd backend
source venv/bin/activate
python3 -m uvicorn main:app --reload
```

### 6. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## ⚙️ Configuration

### Environment Variables (.env)

Create `backend/.env` from `backend/env.example`:

```bash
# MongoDB (Required)
MONGODB_URL=mongodb://localhost:27017
MONGODB_DB_NAME=flexai

# For MongoDB Atlas:
# MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority

# Solana Configuration
SOLANA_RPC_URL=https://api.testnet.solana.com
SOLANA_WS_URL=wss://api.testnet.solana.com
PROGRAM_ID=  # Optional - leave empty for fallback mode

# Gemini API (Optional - for model evaluation)
GEMINI_API_KEY=  # Leave empty for mock evaluation

# API Configuration
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=True

# CORS
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Frontend Configuration

The frontend automatically connects to `http://localhost:8000`. To change the API URL, set:
```bash
VITE_API_URL=http://your-backend-url:8000
```

## 🎮 Usage

### For Contributors

1. **Connect Wallet**: Click "Connect Wallet" and select Phantom or Solflare
2. **Browse Challenges**: Go to "Challenges" to see active challenges
3. **View Challenge Details**: Click on a challenge to see requirements
4. **Submit Model**: Click "Submit Model" and upload your model file
5. **Track Status**: Check "My Dashboard" for submission status
6. **Receive Rewards**: Approved submissions automatically send SOL to your wallet

### For Moderators

1. **Access Moderator Panel**: Go to `/moderator` route
2. **Connect Wallet**: Connect your moderator wallet (different from contributor wallet)
3. **Create Challenge**: Click "Create Challenge" and fill in details
   - Title, description, company name
   - Baseline model hash and accuracy
   - Reward amount (max 0.05 SOL)
   - Deadline
4. **Review Submissions**: View pending submissions in dashboard
5. **Approve/Reject**: 
   - Approve: Transaction modal shows real-time blockchain transfer
   - SOL is sent directly from your wallet to contributor
   - Transaction appears on Solscan (testnet)
6. **View Transactions**: All transactions are logged with Solscan links

## 🔗 Key Routes

### User Routes
- `/` - Landing page
- `/challenges` - Browse active challenges
- `/challenges/:id` - Challenge details
- `/challenges/:id/submit` - Submit model
- `/leaderboard` - Contributor leaderboard
- `/dashboard` - User dashboard (submissions & rewards)

### Moderator Routes
- `/moderator` - Moderator dashboard
- `/moderator/submissions` - Pending submissions
- `/moderator/create-challenge` - Create new challenge

## 🗄️ Database

### MongoDB Collections
- `challenges` - Challenge definitions
- `submissions` - Model submissions
- `evaluations` - Model evaluation results
- `contributor_reputations` - Contributor stats
- `rewards` - Reward records
- `users` - User accounts

### Indexes
All collections have appropriate indexes for performance:
- Challenge lookups by ID, status, deadline
- Submission lookups by challenge, contributor
- Reputation lookups by address

## 🔐 Security Features

- **Wallet Separation**: Moderator and contributor wallets must be different
- **Transaction Verification**: All blockchain transactions are verified
- **Input Validation**: Frontend and backend validation
- **Error Handling**: Comprehensive error handling and user feedback

## 🌐 Blockchain Integration

### Solana Testnet
- All transactions use Solana Testnet
- Real SOL transfers (testnet SOL)
- Transaction verification on blockchain
- Solscan links for all transactions

### Getting Testnet SOL
1. Visit https://faucet.solana.com
2. Enter your wallet address
3. Request testnet SOL

### Transaction Flow
1. Moderator approves submission
2. Frontend constructs SOL transfer transaction
3. Moderator wallet signs transaction
4. Transaction sent to Solana testnet
5. Transaction verified on blockchain
6. Database updated with transaction hash
7. Contributor receives SOL in wallet

## 📊 API Endpoints

### Challenges
- `GET /api/challenges` - List challenges
- `GET /api/challenges/{id}` - Get challenge details
- `POST /api/challenges` - Create challenge (moderator)

### Submissions
- `GET /api/submissions` - List submissions
- `POST /api/submissions` - Submit model
- `GET /api/submissions/{id}` - Get submission details

### Admin
- `POST /api/admin/approve` - Approve submission
- `POST /api/admin/reject` - Reject submission

### Leaderboard
- `GET /api/leaderboard` - Get leaderboard
- `GET /api/leaderboard/contributor/{address}` - Get contributor stats

## 🧪 Testing

### Test MongoDB Connection
```bash
cd backend
source venv/bin/activate
python3 test_mongodb_connection.py
```

### Create Dummy Data
```bash
cd backend
source venv/bin/activate
python3 scripts/create_dummy_data.py
```

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Check MongoDB is running: `sudo docker ps | grep mongo`
- Verify connection string in `.env`
- Test connection: `python3 backend/test_mongodb_connection.py`

### Frontend Not Loading
- Check Node.js version: `node --version` (should be 18+)
- Clear cache: `rm -rf node_modules && npm install`
- Check console for errors

### Blockchain Transactions Failing
- Ensure wallet has testnet SOL
- Check wallet is on testnet network
- Verify both wallets are different (moderator vs contributor)
- Check browser console for detailed errors

### Challenges Not Appearing
- Challenges auto-refresh every 5 seconds
- Check backend logs for errors
- Verify challenge status is "active"
- Ensure deadline is in the future

## 📝 Project Structure

```
HackCBS_VUCA/
├── backend/
│   ├── app/
│   │   ├── api/          # API routes
│   │   ├── core/         # Configuration
│   │   ├── db/           # Database models & MongoDB
│   │   └── services/     # Business logic
│   ├── programs/         # Solana smart contracts
│   ├── scripts/          # Utility scripts
│   └── main.py           # FastAPI application
├── src/
│   ├── components/       # React components
│   ├── pages/           # Page components
│   ├── contexts/        # React contexts
│   └── utils/           # Utilities
└── README.md
```

## 🚀 Deployment

### Backend
```bash
cd backend
source venv/bin/activate
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000
```

### Frontend
```bash
npm run build
# Serve dist/ directory with your web server
```

## 📄 License

MIT

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

For issues and questions:
- Check the troubleshooting section
- Review backend logs
- Check browser console for frontend errors
- Verify MongoDB and Solana connections

---

**Built with ❤️ for the decentralized AI community**
