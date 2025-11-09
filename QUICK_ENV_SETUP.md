# Quick .env Setup Guide

## 🎯 What You Need to Configure

### 1. Solana PROGRAM_ID (Currently Falling Back)

**Current Issue:** Using placeholder ID that's invalid

**Quick Fix Options:**

#### Option A: Keep Fallback Mode (Easiest)
```env
# In backend/.env, leave PROGRAM_ID empty or as-is
PROGRAM_ID=
```
✅ Works immediately, uses simple SOL transfers

#### Option B: Deploy Your Own Program
```bash
# 1. Install Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

# 2. Install Anchor
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install latest
avm use latest

# 3. Build and deploy
cd backend/programs/sentinel
anchor build
anchor deploy --provider.cluster devnet

# 4. Copy the Program ID from output and add to .env
PROGRAM_ID=YourProgramIDFromDeployment
```

#### Option C: Use Test Mode (No Deployment)
```env
# Just leave it empty - fallback mode works fine
PROGRAM_ID=
```

---

### 2. Gemini API Key (Currently Using Mock)

**Current Issue:** Using mock evaluation instead of real AI

**Quick Fix:**

#### Step 1: Get Free API Key
1. Visit: https://aistudio.google.com/apikey
2. Sign in with Google
3. Click "Create API Key"
4. Copy the key

#### Step 2: Add to .env
```env
GEMINI_API_KEY=paste_your_key_here
```

#### Step 3: Restart Backend
```bash
cd backend
source venv/bin/activate
python main.py
```

**Or keep mock mode:**
```env
# Leave empty to continue using mock evaluation
GEMINI_API_KEY=
```

---

## 📝 Minimal .env Configuration

Edit `backend/.env`:

```env
# Database (already set)
DATABASE_URL=sqlite:///./flexai.db

# Solana - Option 1: Fallback mode (works now)
PROGRAM_ID=
SOLANA_PRIVATE_KEY=

# Solana - Option 2: Real deployment (after deploying program)
# PROGRAM_ID=YourDeployedProgramID
# SOLANA_PRIVATE_KEY=your_base58_key

# Gemini - Option 1: Mock mode (works now)
GEMINI_API_KEY=

# Gemini - Option 2: Real API (get key from https://aistudio.google.com/apikey)
# GEMINI_API_KEY=your_gemini_api_key_here

# Security (already set)
SECRET_KEY=dev-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS (already set)
CORS_ORIGINS=["http://localhost:3000","http://localhost:5173"]
```

---

## ✅ Current Status

- **PROGRAM_ID**: Using fallback mode ✅ (works fine)
- **Gemini API**: Using mock evaluation ✅ (works fine)

**Both work without configuration!** You only need to configure if you want:
- Real blockchain transactions (deploy program)
- Real AI evaluation (get Gemini key)

---

## 🚀 Quick Actions

### To Enable Real Gemini Evaluation:
1. Get key: https://aistudio.google.com/apikey
2. Add to `.env`: `GEMINI_API_KEY=your_key`
3. Restart backend

### To Enable Real Blockchain:
1. Deploy program (see Option B above)
2. Add to `.env`: `PROGRAM_ID=your_program_id`
3. Restart backend

### To Keep Current Setup:
✅ Do nothing - it works as-is!

---

## 🔍 Verify Configuration

After updating `.env`, check the logs when starting backend:

```bash
cd backend
source venv/bin/activate
python main.py
```

**Look for:**
- `Invalid PROGRAM_ID '...', using fallback mode` = Fallback mode (OK)
- `Program ID: <id>` = Real program (if deployed)
- `Gemini API key not configured. Using mock evaluation.` = Mock mode (OK)
- `Gemini API configured` = Real API (if key added)

---

## 💡 Recommendation

**For Development/Testing:**
- Keep fallback mode (PROGRAM_ID empty)
- Add Gemini API key for real evaluation
- This gives you real AI evaluation without blockchain complexity

**For Production:**
- Deploy Solana program
- Add Gemini API key
- Use real blockchain + real AI

