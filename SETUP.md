# Sentinel.ai Frontend - Setup Guide

## Prerequisites

- Node.js 18+ and npm
- A Solana wallet (Phantom, Solflare, or Torus)

## Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Start development server:**
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Navbar.tsx      # Navigation bar with wallet connection
│   ├── Card.tsx        # Glassmorphism card component
│   ├── Button.tsx      # Cyberpunk-styled button
│   ├── Chart.tsx       # Recharts wrapper
│   ├── Modal.tsx       # Modal dialog
│   └── NeuralNetwork3D.tsx  # 3D neural network visualization
├── contexts/           # React contexts
│   └── WalletContext.tsx  # Solana wallet adapter context
├── pages/              # Page components
│   ├── Landing.tsx     # Landing page
│   ├── ContributorDashboard.tsx  # Contributor dashboard
│   ├── ModelTrainerDashboard.tsx # Model trainer dashboard
│   ├── NetworkExplorer.tsx       # Network explorer with 3D map
│   └── RewardsPage.tsx          # Rewards and leaderboard
├── utils/              # Utility functions
│   └── api.ts          # API client (mock implementation)
└── App.tsx             # Main app component with routing
```

## Features

### 🏠 Landing Page
- Animated 3D neural network visualization
- Wallet connection
- Feature cards
- Call-to-action buttons

### 👤 Contributor Dashboard
- Wallet address and balance display
- Metrics: data contributed, rewards, rounds, privacy score
- Charts: reward growth, contribution quality
- Data upload with drag & drop
- Start training button

### 🤖 Model Trainer Dashboard
- Model architecture upload (.h5, .pt, .onnx)
- Training parameters configuration
- Real-time stats: active contributors, accuracy, rewards
- Charts: accuracy progress, reward distribution

### 🌐 Network Explorer
- Interactive 3D map of network nodes
- Filter by contributors/models
- Node details panel
- Network statistics

### 💰 Rewards Page
- Transaction history
- Reward claim functionality
- Leaderboards (accuracy, rounds, privacy)
- Reward history chart

## Configuration

### Solana Network
Edit `src/contexts/WalletContext.tsx` to change the Solana network:
- `WalletAdapterNetwork.Devnet` - Development network
- `WalletAdapterNetwork.Mainnet` - Main network
- `WalletAdapterNetwork.Testnet` - Test network

### API Endpoint
Edit `src/utils/api.ts` to change the API base URL:
```typescript
const API_BASE_URL = 'https://api.sentinelai.network'
```

## Styling

The project uses TailwindCSS with a custom cyberpunk theme:
- Colors: `cyber-cyan`, `cyber-purple`, `cyber-magenta`
- Fonts: Space Grotesk, Orbitron, Inter
- Effects: Glassmorphism, glow effects, gradients

Customize themes in `tailwind.config.js` and `src/index.css`.

## Development

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Lint
```bash
npm run lint
```

## Integration

### Backend API
1. Update `src/utils/api.ts` with your actual API endpoints
2. Replace mock data in pages with API calls
3. Add authentication headers if needed

### Solana Smart Contracts
1. Deploy your Solana program
2. Update transaction calls in pages to use your program
3. Add program ID to environment variables

### IPFS/Storage
1. Integrate IPFS for model/data storage
2. Update upload functions to use IPFS
3. Store IPFS hashes on-chain

## Troubleshooting

### Wallet Connection Issues
- Ensure you have a wallet extension installed
- Check browser console for errors
- Verify Solana network configuration

### 3D Visualization Issues
- Check browser WebGL support
- Reduce node count in NetworkExplorer if performance is slow
- Update Three.js version if needed

### Build Errors
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version: `node --version` (should be 18+)
- Verify TypeScript version compatibility

## Next Steps

1. Connect to your backend API
2. Integrate Solana smart contracts
3. Add IPFS for file storage
4. Implement authentication
5. Add error handling and loading states
6. Optimize 3D visualizations
7. Add unit and integration tests

## Support

For issues or questions, please check the main README.md or create an issue in the repository.

