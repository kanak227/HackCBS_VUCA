# Sentinel.ai - Decentralized AI Training Platform

A futuristic, immersive frontend for Sentinel.ai, a decentralized federated learning platform built on Solana blockchain.

## 🚀 Features

- **Landing Page** - Animated 3D neural network visualization with wallet connection
- **Contributor Dashboard** - Upload data, track contributions, view rewards and metrics
- **Model Trainer Dashboard** - Deploy ML models, configure training parameters, monitor progress
- **Network Explorer** - Interactive 3D map of contributors and model nodes
- **Rewards & Tokens** - View transactions, claim rewards, and compete on leaderboards

## 🛠️ Tech Stack

- **React** + **TypeScript** + **Vite**
- **TailwindCSS** - Cyberpunk dark theme with neon colors
- **Framer Motion** - Smooth animations and transitions
- **React Three Fiber** - 3D visualizations
- **Solana Wallet Adapter** - Wallet integration
- **Recharts** - Data visualization
- **React Router** - Navigation

## 📦 Installation

1. Install dependencies (optimized - faster install):
```bash
npm install --legacy-peer-deps
```

**Note**: The `--legacy-peer-deps` flag helps avoid dependency conflicts with Solana packages. Installation is optimized to be faster by:
- Using individual wallet adapters instead of the large `@solana/wallet-adapter-wallets` package
- Using native `fetch` instead of `axios`
- Removing unnecessary ESLint dependencies

2. Start development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## 🎨 Design

- **Theme**: Dark mode cyberpunk (neon cyan, purple, magenta gradients)
- **Aesthetic**: Glassmorphism panels, soft glow buttons, animated data particles
- **Fonts**: Space Grotesk, Orbitron, Inter
- **UX**: Smooth transitions, glowing borders, dynamic charts, motion effects

## 🔗 Integration

- **API Base URL**: `https://api.sentinelai.network` (mock for now)
- **Solana Network**: Devnet (configurable in `WalletContext.tsx`)
- **Wallet Adapters**: Phantom, Solflare (optimized - individual packages for faster install)

## 📝 Notes

- Wallet connection is required for contributor and trainer dashboards
- Transactions are currently mocked - integrate with your Solana program in production
- 3D visualizations use React Three Fiber and Drei
- All data is currently mock data - connect to your backend API

## 🚧 Development

This is a frontend-only implementation. To complete the integration:

1. Connect to your Solana program for actual transactions
2. Integrate with your backend API for real data
3. Add IPFS integration for model/data storage
4. Implement actual federated learning logic
5. Add authentication and user management

## 📄 License

MIT

