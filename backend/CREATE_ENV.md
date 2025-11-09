# How to Create and Configure .env File

## Quick Steps

### 1. Copy the Example File

```bash
cd backend
cp env.example .env
```

### 2. Edit .env File

```bash
# Using nano (simple editor)
nano .env

# Or using vim
vim .env

# Or using any text editor
code .env  # VS Code
gedit .env  # GNOME Text Editor
```

## Essential Configuration

### Minimum Required (Works Out of the Box)

The `.env` file already has working defaults! You can use it as-is for development:

```env
# Database - MongoDB (Primary)
MONGODB_URL=mongodb://localhost:27017
MONGODB_DB_NAME=flexai

# Security (change in production!)
SECRET_KEY=dev-secret-key-change-in-production-please-use-random-hex
```

### Optional: Add Real Services

#### For Real Gemini AI Evaluation

1. Get free API key: https://aistudio.google.com/apikey
2. Add to `.env`:
```env
GEMINI_API_KEY=your_actual_api_key_here
```

#### For Real Solana Blockchain

1. Deploy smart contract (see ENV_SETUP.md)
2. Add to `.env`:
```env
PROGRAM_ID=YourDeployedProgramIDHere
SOLANA_PRIVATE_KEY=your_base58_private_key
```

## Configuration Checklist

### ✅ Must Configure (for production)

- [ ] `SECRET_KEY` - Generate secure random key
- [ ] `MONGODB_URL` - Your MongoDB connection string
- [ ] `MONGODB_DB_NAME` - Your database name

### ⚙️ Optional (works with defaults)

- [ ] `GEMINI_API_KEY` - For real AI evaluation
- [ ] `PROGRAM_ID` - For real blockchain transactions
- [ ] `SOLANA_PRIVATE_KEY` - For server-side signing
- [ ] `AUTH0_*` - For Auth0 authentication
- [ ] `AWS_*` - For S3 storage

## Generate Secure SECRET_KEY

```bash
# Generate a secure random key
openssl rand -hex 32

# Or using Python
python3 -c "import secrets; print(secrets.token_hex(32))"
```

Then update in `.env`:
```env
SECRET_KEY=your_generated_key_here
```

## MongoDB Connection Strings

### Local MongoDB (No Authentication)
```env
MONGODB_URL=mongodb://localhost:27017
```

### Local MongoDB (With Authentication)
```env
MONGODB_URL=mongodb://username:password@localhost:27017/flexai?authSource=admin
```

### MongoDB Atlas (Cloud)
```env
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB_NAME=flexai
```

## Example .env File

Here's a complete example with all common settings:

```env
# ============================================
# Database - MongoDB (Primary)
# ============================================
MONGODB_URL=mongodb://localhost:27017
MONGODB_DB_NAME=flexai

# ============================================
# Solana Blockchain
# ============================================
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_WS_URL=wss://api.devnet.solana.com
PROGRAM_ID=
SOLANA_PRIVATE_KEY=
TOKEN_MINT=

# ============================================
# Gemini API
# ============================================
GEMINI_API_KEY=
GEMINI_MODEL=gemini-pro

# ============================================
# Security
# ============================================
SECRET_KEY=dev-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# ============================================
# CORS
# ============================================
CORS_ORIGINS=["http://localhost:3000","http://localhost:5173"]

# ============================================
# Server
# ============================================
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=True
```

## Verify Configuration

After creating `.env`, test it:

```bash
cd backend
source venv/bin/activate
python -c "
from app.core.config import settings
print('MongoDB URL:', settings.MONGODB_URL)
print('Database Name:', settings.MONGODB_DB_NAME)
print('Secret Key:', settings.SECRET_KEY[:20] + '...')
"
```

## Important Notes

1. **Never commit `.env` to git** - It contains secrets!
2. **Use different keys for dev/prod** - Never use production keys in development
3. **Keep backups** - But store them securely
4. **Rotate keys regularly** - Especially in production

## Troubleshooting

### .env file not being read?

- Check file is named exactly `.env` (with the dot)
- Check it's in the `backend/` directory
- Check file permissions: `chmod 600 .env`

### Variables not updating?

- Restart the backend server
- Check for typos in variable names
- Verify no extra spaces around `=`

### MongoDB connection fails?

- Check MongoDB is running: `sudo systemctl status mongod`
- Verify connection string format
- Check firewall settings

## Next Steps

1. ✅ Copy `env.example` to `.env`
2. ✅ Edit `.env` with your values
3. ✅ Generate secure `SECRET_KEY`
4. ✅ Configure MongoDB URL
5. ✅ (Optional) Add Gemini API key
6. ✅ (Optional) Configure Solana program
7. ✅ Start backend: `python main.py`

