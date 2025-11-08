# On-Chain Setup Guide - Real Blockchain Integration

## 🚀 Overview

This guide explains how to set up the backend for **real on-chain transactions** and data fetching from the Solana blockchain.

## ⚙️ Configuration

### 1. Environment Variables

Update `backend/.env` with real values:

```env
# Solana Configuration
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com  # or devnet
SOLANA_WS_URL=wss://api.mainnet-beta.solana.com
SOLANA_PRIVATE_KEY=your_base58_private_key_here
PROGRAM_ID=your_deployed_program_id_here

# For devnet testing
# SOLANA_RPC_URL=https://api.devnet.solana.com
# SOLANA_WS_URL=wss://api.devnet.solana.com
```

### 2. Generate Keypair

```bash
# Install Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

# Generate keypair
solana-keygen new --outfile ~/.config/solana/keypair.json

# Get public key
solana address

# Get private key (base58)
cat ~/.config/solana/keypair.json | jq -r '.[:32]' | base58
```

### 3. Deploy Smart Contract

```bash
cd backend/programs/sentinel

# Build program
anchor build

# Deploy to devnet
anchor deploy --provider.cluster devnet

# Copy Program ID from output
# Update PROGRAM_ID in .env
```

## 📡 Real RPC Endpoints

### Mainnet
- RPC: `https://api.mainnet-beta.solana.com`
- Alternative: Use Helius, QuickNode, or other RPC providers for better performance

### Devnet
- RPC: `https://api.devnet.solana.com`
- Good for testing

### Custom RPC Provider
```env
SOLANA_RPC_URL=https://your-rpc-provider.com
```

## 🔐 Transaction Signing

### Server-Side Signing
- Requires `SOLANA_PRIVATE_KEY` in `.env`
- Keypair is loaded on service initialization
- All transactions are signed automatically

### Client-Side Signing (Recommended)
- Frontend uses wallet adapter
- Transactions are signed by user's wallet
- More secure - private keys never leave user's device

## 💰 Funding Wallet

### For Devnet
```bash
# Airdrop SOL to your wallet
solana airdrop 2 $(solana address) --url devnet
```

### For Mainnet
- Transfer SOL from exchange or another wallet
- Minimum 0.1 SOL recommended for transactions

## 🧪 Testing Real Transactions

### 1. Test Balance Query
```bash
curl http://localhost:8000/api/solana/balance/YOUR_WALLET_ADDRESS
```

### 2. Test Transaction
```bash
curl -X POST http://localhost:8000/api/solana/transaction \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "test-session",
    "transaction_type": "register",
    "data": {
      "trainer_address": "YOUR_ADDRESS",
      "model_hash": "test-hash",
      "total_rounds": 10
    }
  }'
```

### 3. Verify on Solana Explorer
- Visit: https://solscan.io/tx/{transaction_hash}
- Or: https://explorer.solana.com/tx/{transaction_hash}

## 📊 Real Data Fetching

All endpoints now fetch **real data** from blockchain:

### Training Sessions
- `GET /api/training/sessions/onchain` - Fetch from blockchain
- `GET /api/training/sessions` - Combined database + blockchain

### Contributions
- `GET /api/training/sessions/{session_id}/contributions` - Real on-chain data

### Rewards
- `GET /api/rewards/contributor/{address}` - Real rewards from blockchain
- `GET /api/rewards/leaderboard` - Combined data

### Analytics
- `GET /api/analytics/dashboard` - Real-time stats
- `GET /api/analytics/network-stats` - Network-wide statistics

## 🔍 Monitoring Transactions

### Transaction Status
```bash
# Get transaction details
curl http://localhost:8000/api/solana/transaction/{tx_hash}
```

### Address Transactions
```bash
# Get all transactions for an address
curl http://localhost:8000/api/solana/transactions/{address}
```

## ⚠️ Important Notes

1. **Private Keys**: Never commit private keys to git
2. **RPC Limits**: Free RPC endpoints have rate limits
3. **Transaction Fees**: Each transaction costs ~0.000005 SOL
4. **Confirmation Time**: Transactions take ~400ms to confirm
5. **Network**: Start with devnet, then move to mainnet

## 🐛 Troubleshooting

### Transaction Failures
- Check wallet balance (need SOL for fees)
- Verify PROGRAM_ID is correct
- Check RPC endpoint is accessible
- Review transaction logs

### RPC Errors
- Switch to different RPC provider
- Check network connectivity
- Verify RPC URL is correct

### Balance Queries
- Verify wallet address is correct
- Check RPC endpoint is responding
- Ensure address has transactions (new addresses may not show)

## 🚀 Production Checklist

- [ ] Deploy smart contract to mainnet
- [ ] Update PROGRAM_ID in .env
- [ ] Set SOLANA_RPC_URL to mainnet
- [ ] Fund wallet with SOL
- [ ] Test all endpoints
- [ ] Monitor transaction success rates
- [ ] Set up RPC provider (Helius, QuickNode)
- [ ] Configure error logging
- [ ] Set up transaction monitoring

## 📚 Resources

- [Solana Docs](https://docs.solana.com/)
- [Anchor Framework](https://www.anchor-lang.com/)
- [Solana Explorer](https://explorer.solana.com/)
- [Solscan](https://solscan.io/)

## 🎯 Next Steps

1. Deploy smart contract
2. Update environment variables
3. Test real transactions
4. Monitor on-chain data
5. Integrate with frontend

---

**All data is now REAL and fetched from the blockchain! 🎉**

