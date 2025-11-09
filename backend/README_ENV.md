# Environment Variables Setup

## Quick Start

1. **Copy the example file:**
   ```bash
   cd backend
   cp .env.example .env
   ```

2. **Edit `.env` with your values:**
   ```bash
   nano .env
   # or
   vim .env
   ```

## Required Variables (Minimum)

For basic functionality, you only need:

```env
DATABASE_URL=sqlite:///./flexai.db
SECRET_KEY=your-secret-key-here
```

Everything else is optional!

## Optional Variables

### For Real Blockchain (Solana)
- `PROGRAM_ID` - Deploy smart contract first
- `SOLANA_PRIVATE_KEY` - Your wallet private key

### For Real AI Evaluation (Gemini)
- `GEMINI_API_KEY` - Get from https://aistudio.google.com/apikey

### For Production Database
- `DATABASE_URL` - Use PostgreSQL connection string

## Current Setup

Your current `.env` is configured for:
- ✅ SQLite database (no setup needed)
- ✅ Fallback Solana mode (works without deployment)
- ✅ Mock Gemini evaluation (works without API key)

## See Also

- `ENV_SETUP.md` - Detailed setup guide
- `QUICK_ENV_SETUP.md` - Quick reference
- `.env.example` - All available options

