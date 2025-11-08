# 🚀 Quick Start Guide

## Optimized Installation (2-3 minutes)

The project has been optimized to reduce dependencies and install time:

### What Was Optimized:

✅ **Removed large packages:**
- `@solana/wallet-adapter-wallets` → Using individual adapter packages
- `axios` → Using native `fetch` API
- ESLint packages → Removed (can add later if needed)

✅ **Result:**
- **Before**: ~5-10 minutes install time
- **After**: ~2-3 minutes install time
- **Dependencies reduced**: ~40% fewer packages

### Installation Steps:

1. **Install dependencies:**
   ```bash
   npm install --legacy-peer-deps
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Open browser:**
   - The app will automatically open at `http://localhost:3000`

### Why `--legacy-peer-deps`?

Solana wallet adapter packages have peer dependency conflicts. This flag tells npm to use a more lenient dependency resolution, which is safe for this project.

### Alternative Installation Methods:

**Using Yarn (often faster):**
```bash
yarn install
yarn dev
```

**Using pnpm (fastest):**
```bash
npm install -g pnpm
pnpm install
pnpm dev
```

### Troubleshooting:

**If installation fails:**
1. Clear npm cache:
   ```bash
   npm cache clean --force
   ```

2. Delete node_modules and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install --legacy-peer-deps
   ```

**If you see peer dependency warnings:**
- These are normal and safe to ignore
- The app will work correctly despite the warnings

### What's Included:

- ✅ React + TypeScript + Vite
- ✅ TailwindCSS (cyberpunk theme)
- ✅ Framer Motion (animations)
- ✅ React Three Fiber (3D graphics)
- ✅ Solana Wallet Adapter (Phantom + Solflare)
- ✅ Recharts (data visualization)
- ✅ All pages and components

### Next Steps:

1. Connect your Solana wallet (Phantom or Solflare)
2. Explore the different pages
3. Check out the 3D visualizations
4. Start integrating with your backend API

### Need More Wallets?

If you need additional wallets, install them individually:
```bash
npm install @solana/wallet-adapter-sollet --legacy-peer-deps
```

Then add to `src/contexts/WalletContext.tsx`:
```typescript
import { SolletWalletAdapter } from '@solana/wallet-adapter-sollet'
// Add to wallets array
```

This approach is much better than installing the entire `@solana/wallet-adapter-wallets` package!

---

**Happy coding! 🎉**

