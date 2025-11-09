import { Link, useLocation } from 'react-router-dom'
import { useWallet } from '@solana/wallet-adapter-react'
import { motion } from 'framer-motion'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'

const Navbar = () => {
  const location = useLocation()
  const { publicKey } = useWallet()

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/challenges', label: 'Challenges' },
    { path: '/leaderboard', label: 'Leaderboard' },
    { path: '/dashboard', label: 'My Dashboard' },
  ]

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="glass fixed top-0 left-0 right-0 z-50 border-b border-cyber-cyan/20"
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="w-10 h-10 bg-gradient-cyber rounded-lg"
            />
            <span className="text-2xl font-orbitron font-bold text-gradient">
              FlexAI
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`relative font-space font-medium transition-colors ${
                  location.pathname === item.path
                    ? 'text-cyber-cyan'
                    : 'text-gray-300 hover:text-cyber-cyan'
                }`}
              >
                {item.label}
                {location.pathname === item.path && (
                  <motion.div
                    layoutId="underline"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-cyber"
                  />
                )}
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            {publicKey && (
              <div className="hidden md:block text-sm text-gray-400 font-mono">
                {publicKey.toString().slice(0, 4)}...{publicKey.toString().slice(-4)}
              </div>
            )}
            <div className="wallet-adapter-button-trigger">
              <WalletMultiButton className="!bg-gradient-cyber !rounded-lg !font-orbitron" />
            </div>
          </div>
        </div>
      </div>
    </motion.nav>
  )
}

export default Navbar

