# Sentinel.ai Backend

Decentralized federated learning backend integrated with Solana blockchain.

## 🏗️ Architecture

```
Frontend (React) 
    ↓
Backend API (FastAPI)
    ↓
Federated Learning Engine
    ↓
Solana Smart Contracts (Anchor)
    ↓
Blockchain Ledger
```

## 📦 Components

1. **Federated Learning Core** - Model aggregation and coordination
2. **Solana Smart Contracts** - Training, rewards, and validation
3. **API Gateway** - RESTful endpoints for coordination
4. **Database Layer** - PostgreSQL for metadata
5. **Privacy & Security** - LDP, encryption, ZKPs

## 🚀 Setup

1. **Install dependencies:**
```bash
pip install -r requirements.txt
```

2. **Set up PostgreSQL:**
```bash
createdb sentinel_db
```

3. **Configure environment:**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Run database migrations:**
```bash
alembic upgrade head
```

5. **Start the server:**
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## 📝 API Documentation

Once running, visit:
- API Docs: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 🔗 Solana Integration

1. **Deploy smart contracts:**
```bash
cd programs/sentinel
anchor build
anchor deploy
```

2. **Update PROGRAM_ID in .env**

## 🧪 Testing

```bash
pytest tests/
```

