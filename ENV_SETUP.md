# Environment Variables Setup Guide

## 📋 Overview

This guide explains how to configure the `.env` file for:
1. **Solana PROGRAM_ID** (currently using fallback mode)
2. **Gemini API Key** (currently using mock evaluation)

## 🔧 Location

Edit the file: `backend/.env`

---

## 1️⃣ Solana PROGRAM_ID Setup

### Current Status
- ❌ Using fallback mode (placeholder ID is invalid)
- ✅ Can work without it (fallback transactions)
- ✅ For full functionality, deploy the smart contract

### Option A: Deploy Your Own Program (Recommended)

#### Step 1: Install Solana CLI
```bash
# Install Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

# Verify installation
solana --version

# Set to devnet (for testing)
solana config set --url devnet
```

#### Step 2: Install Anchor Framework
```bash
# Install Rust (if not installed)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env

# Install Anchor
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install latest
avm use latest

# Verify
anchor --version
```

#### Step 3: Generate Keypair (if needed)
```bash
# Generate a new keypair
solana-keygen new --outfile ~/.config/solana/keypair.json

# Get your wallet address
solana address

# Get private key in base58 format (for SOLANA_PRIVATE_KEY)
cat ~/.config/solana/keypair.json | base58
```

#### Step 4: Fund Your Wallet (for devnet)
```bash
# Airdrop SOL to your wallet (devnet only)
solana airdrop 2 $(solana address) --url devnet
```

#### Step 5: Build and Deploy Program
```bash
cd backend/programs/sentinel

# Update Anchor.toml with your keypair path
# Edit Anchor.toml and set: wallet = "~/.config/solana/keypair.json"

# Build the program
anchor build

# Deploy to devnet
anchor deploy --provider.cluster devnet
```

#### Step 6: Get Program ID
After deployment, you'll see output like:
```
Deploying cluster: https://api.devnet.solana.com
Upgrade authority: YourWalletAddress...
Deploying program "sentinel"...
Program Id: **YOUR_PROGRAM_ID_HERE**
```

#### Step 7: Update .env
```env
PROGRAM_ID=YOUR_PROGRAM_ID_HERE
SOLANA_PRIVATE_KEY=your_base58_private_key_here
```

### Option B: Use Without Deployment (Current Mode)

The system works in **fallback mode** without a deployed program:
- ✅ All features work
- ✅ Uses simple SOL transfers as proof
- ⚠️ Not using the full smart contract features

**To keep using fallback mode:**
```env
# Leave PROGRAM_ID empty or use placeholder
PROGRAM_ID=
# Or keep the placeholder (will use fallback)
PROGRAM_ID=FlexAIPr0gramID1111111111111111111111
```

### Option C: Use a Test Program ID (For Testing)

You can use any valid Solana address format (44 characters, base58):
```env
# Example valid format (but not a real deployed program)
PROGRAM_ID=11111111111111111111111111111111
```

**Note:** This won't work for actual transactions, but won't cause errors.

---

## 2️⃣ Gemini API Key Setup

### Current Status
- ❌ Using mock evaluation (works but not real AI evaluation)
- ✅ Can work without it (mock results)
- ✅ For real AI evaluation, get a Gemini API key

### Step 1: Get Gemini API Key

1. **Visit Google AI Studio**
   - Go to: https://aistudio.google.com/apikey
   - Sign in with your Google account

2. **Create API Key**
   - Click "Create API Key"
   - Select or create a Google Cloud project
   - Copy the generated API key

3. **Free Tier Limits**
   - Free tier: 15 requests per minute
   - Free tier: 1,500 requests per day
   - Perfect for testing and development

### Step 2: Update .env

```env
GEMINI_API_KEY=your_actual_api_key_here
GEMINI_MODEL=gemini-pro
```

### Step 3: Verify Setup

After adding the key, restart the backend:
```bash
cd backend
source venv/bin/activate
python main.py
```

You should see:
```
✓ Gemini API configured
```

Instead of:
```
⚠️ Gemini API key not configured. Using mock evaluation.
```

### Option: Continue with Mock Evaluation

If you don't want to use Gemini API:
```env
# Leave empty to use mock evaluation
GEMINI_API_KEY=
```

Mock evaluation:
- ✅ Works without API key
- ✅ Generates realistic test data
- ⚠️ Not real AI evaluation
- ✅ Perfect for development/testing

---

## 📝 Complete .env Example

Here's a complete `.env` file with all options:

```env
# ============================================
# Database Configuration
# ============================================
DATABASE_URL=sqlite:///./flexai.db
# Or for PostgreSQL:
# DATABASE_URL=postgresql://user:password@localhost:5432/flexai_db

# ============================================
# Solana Configuration
# ============================================
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_WS_URL=wss://api.devnet.solana.com

# Option 1: Deploy program and use real PROGRAM_ID
PROGRAM_ID=YourDeployedProgramIDHere44chars
SOLANA_PRIVATE_KEY=your_base58_private_key_here

# Option 2: Use fallback mode (leave PROGRAM_ID empty or placeholder)
# PROGRAM_ID=
# SOLANA_PRIVATE_KEY=

TOKEN_MINT=

# ============================================
# Gemini API Configuration
# ============================================
# Option 1: Use real Gemini API
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-pro

# Option 2: Use mock evaluation (leave empty)
# GEMINI_API_KEY=
# GEMINI_MODEL=gemini-pro

# ============================================
# Security Configuration
# ============================================
SECRET_KEY=your-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# ============================================
# CORS Configuration
# ============================================
CORS_ORIGINS=["http://localhost:3000","http://localhost:5173"]

# ============================================
# Storage Configuration (Optional)
# ============================================
IPFS_GATEWAY=https://ipfs.io/ipfs/
AWS_S3_BUCKET=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
```

---

## 🎯 Quick Setup Scenarios

### Scenario 1: Development/Testing (No Setup Needed)
```env
PROGRAM_ID=
GEMINI_API_KEY=
```
✅ Works immediately with fallback/mock modes

### Scenario 2: Testing with Real Gemini API
```env
PROGRAM_ID=
GEMINI_API_KEY=your_gemini_key_here
```
✅ Real AI evaluation, fallback blockchain

### Scenario 3: Testing with Real Blockchain
```env
PROGRAM_ID=your_deployed_program_id
SOLANA_PRIVATE_KEY=your_private_key
GEMINI_API_KEY=
```
✅ Real blockchain, mock evaluation

### Scenario 4: Full Production Setup
```env
PROGRAM_ID=your_deployed_program_id
SOLANA_PRIVATE_KEY=your_private_key
GEMINI_API_KEY=your_gemini_key_here
```
✅ Everything real

---

## 🔍 Verification

### Check PROGRAM_ID
```bash
cd backend
source venv/bin/activate
python -c "
from app.services.flexai_solana_service import flexai_solana_service
print('Program ID:', flexai_solana_service.program_id)
print('Mode:', 'Real' if flexai_solana_service.program_id else 'Fallback')
"
```

### Check Gemini API
```bash
cd backend
source venv/bin/activate
python -c "
from app.services.gemini_service import gemini_service
print('Gemini API:', 'Configured' if gemini_service.model else 'Mock mode')
"
```

### Test Backend Startup
```bash
cd backend
source venv/bin/activate
python main.py
```

Look for these messages:
- ✅ `Program ID: <your_id>` or `using fallback mode`
- ✅ `Gemini API configured` or `Using mock evaluation`

---

## 📚 Additional Resources

### Solana Resources
- Solana Docs: https://docs.solana.com/
- Anchor Docs: https://www.anchor-lang.com/
- Solana CLI: https://docs.solana.com/cli

### Gemini API Resources
- Gemini API Docs: https://ai.google.dev/docs
- API Key: https://aistudio.google.com/apikey
- Pricing: https://ai.google.dev/pricing

### Help
- Check logs: Look at backend terminal output
- API Docs: http://localhost:8000/docs
- Test endpoints: Use curl or Postman

---

## ⚠️ Important Notes

1. **PROGRAM_ID Format**
   - Must be 44 characters (base58)
   - Must be a valid Solana address
   - Empty string = fallback mode

2. **SOLANA_PRIVATE_KEY Format**
   - Base58 encoded
   - 64 bytes when decoded
   - Keep it secret!

3. **GEMINI_API_KEY**
   - Free tier available
   - Rate limits apply
   - Keep it secret!

4. **Security**
   - Never commit `.env` to git
   - Use different keys for dev/prod
   - Rotate keys regularly

---

## 🚀 Next Steps

1. **For Development**: Keep current setup (fallback + mock)
2. **For Testing**: Add Gemini API key
3. **For Production**: Deploy program + add Gemini key

The system works in all modes! Choose what fits your needs.

