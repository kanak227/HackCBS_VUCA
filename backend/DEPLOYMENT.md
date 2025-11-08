# Deployment Guide

## Prerequisites

1. **Python 3.9+**
2. **PostgreSQL 12+**
3. **Solana CLI** (for smart contract deployment)
4. **Anchor Framework** (for Solana programs)

## Setup Steps

### 1. Database Setup

```bash
# Create PostgreSQL database
createdb sentinel_db

# Create user (optional)
createuser sentinel_user
psql sentinel_db -c "ALTER USER sentinel_user WITH PASSWORD 'your_password';"
psql sentinel_db -c "GRANT ALL PRIVILEGES ON DATABASE sentinel_db TO sentinel_user;"
```

### 2. Backend Setup

```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Run migrations
alembic upgrade head
```

### 3. Solana Program Deployment

```bash
# Install Anchor (if not already installed)
# See: https://www.anchor-lang.com/docs/installation

# Navigate to program directory
cd programs/sentinel

# Build program
anchor build

# Deploy to devnet
anchor deploy --provider.cluster devnet

# Note the Program ID from deployment output
# Update PROGRAM_ID in backend/.env
```

### 4. Run Server

```bash
# Development
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Production (with gunicorn)
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

## Environment Variables

Key environment variables to configure:

- `DATABASE_URL`: PostgreSQL connection string
- `SOLANA_RPC_URL`: Solana RPC endpoint
- `SOLANA_PRIVATE_KEY`: Private key for signing transactions
- `PROGRAM_ID`: Deployed Solana program ID
- `SECRET_KEY`: Secret key for JWT tokens
- `LDP_EPSILON`: Local differential privacy parameter

## API Documentation

Once running, access:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Testing

```bash
# Run all tests
pytest tests/

# Run with coverage
pytest --cov=app tests/

# Run simulation
python tests/simulate_fl.py
```

## Production Considerations

1. **Use environment variables** for all secrets
2. **Enable HTTPS** with reverse proxy (nginx)
3. **Set up database backups**
4. **Monitor logs** and errors
5. **Use connection pooling** for database
6. **Enable rate limiting** for API endpoints
7. **Set up monitoring** (Prometheus, Grafana)

## Docker Deployment

```dockerfile
# Dockerfile example
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## Troubleshooting

### Database Connection Issues
- Check PostgreSQL is running
- Verify DATABASE_URL format
- Check firewall rules

### Solana RPC Issues
- Verify RPC URL is accessible
- Check network connectivity
- Use alternative RPC providers if needed

### Migration Issues
- Ensure database is created
- Check Alembic version
- Run: `alembic upgrade head`

