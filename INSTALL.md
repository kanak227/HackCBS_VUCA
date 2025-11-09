# FlexAI Installation Guide

## Quick Setup

### Prerequisites

You need to install these system packages first:

```bash
# Install Python venv support
sudo apt install python3-venv python3-pip

# Install Node.js and npm
# Option 1: Using nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18

# Option 2: Using apt
sudo apt install nodejs npm

# Install PostgreSQL (optional - can use SQLite for testing)
sudo apt install postgresql postgresql-contrib
```

### Automated Setup

Run the setup scripts:

```bash
# Make scripts executable
chmod +x setup_backend.sh setup_frontend.sh

# Setup backend
./setup_backend.sh

# Setup frontend
./setup_frontend.sh
```

### Manual Setup

#### Backend

```bash
# Create virtual environment
cd backend
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env with your configuration

# Create dummy data (optional)
python scripts/create_dummy_data.py

# Run backend
python main.py
```

#### Frontend

```bash
# Install dependencies
npm install --legacy-peer-deps

# Create .env file
echo "VITE_API_URL=http://localhost:8000" > .env

# Run frontend
npm run dev
```

## Database Setup

### Option 1: PostgreSQL (Recommended for Production)

```bash
# Create database
sudo -u postgres createdb flexai_db
sudo -u postgres createuser flexai_user
sudo -u postgres psql -c "ALTER USER flexai_user WITH PASSWORD 'flexai_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE flexai_db TO flexai_user;"
```

Update `backend/.env`:
```env
DATABASE_URL=postgresql://flexai_user:flexai_password@localhost:5432/flexai_db
```

### Option 2: SQLite (For Testing)

Update `backend/app/db/database.py` to use SQLite:
```python
DATABASE_URL = "sqlite:///./flexai.db"
```

## Running the Application

### Start Backend

```bash
cd backend
source venv/bin/activate
python main.py
```

Backend will run on: `http://localhost:8000`

### Start Frontend

```bash
npm run dev
```

Frontend will run on: `http://localhost:5173`

## Troubleshooting

### Python venv issues

```bash
sudo apt install python3.12-venv
```

### Node.js version issues

```bash
# Use nvm to install Node.js 18+
nvm install 18
nvm use 18
```

### npm install issues

```bash
# Clear cache
npm cache clean --force

# Use legacy peer deps
npm install --legacy-peer-deps
```

### Database connection issues

- Check PostgreSQL is running: `sudo systemctl status postgresql`
- Verify database credentials in `.env`
- Check firewall settings

## Environment Variables

### Backend (.env)

```env
DATABASE_URL=postgresql://user:password@localhost:5432/flexai_db
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_PRIVATE_KEY=your_private_key
PROGRAM_ID=FlexAIPr0gramID1111111111111111111111
GEMINI_API_KEY=your_gemini_key (optional)
SECRET_KEY=your_secret_key
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:8000
```

## Next Steps

1. ✅ Install system dependencies
2. ✅ Run setup scripts
3. ✅ Configure environment variables
4. ✅ Create dummy data
5. ✅ Start backend and frontend
6. ✅ Visit http://localhost:5173

## Solana Program Deployment (Optional)

```bash
cd backend/programs/sentinel
anchor build
anchor deploy --provider.cluster devnet
```

Update `PROGRAM_ID` in `backend/.env` with the deployed program ID.

