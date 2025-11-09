import { Link, useLocation } from 'react-router-dom'
import { useWallet } from '@solana/wallet-adapter-react'
import { motion } from 'framer-motion'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { Shield, LogOut } from 'lucide-react'

const ModeratorNavbar = () => {
  const location = useLocation()
  const { publicKey, disconnect } = useWallet()

  const navItems = [
    { path: '/moderator', label: 'Dashboard' },
    { path: '/moderator/submissions', label: 'Pending Submissions' },
    { path: '/moderator/create-challenge', label: 'Create Challenge' },
  ]

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="glass fixed top-0 left-0 right-0 z-50 border-b border-red-500/20"
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/moderator" className="flex items-center space-x-2">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg flex items-center justify-center"
            >
              <Shield className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <span className="text-2xl font-orbitron font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                Moderator Panel
              </span>
              <div className="text-xs text-gray-400 font-space">Admin Access Only</div>
            </div>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`relative font-space font-medium transition-colors ${
                  location.pathname === item.path
                    ? 'text-red-400'
                    : 'text-gray-300 hover:text-red-400'
                }`}
              >
                {item.label}
                {location.pathname === item.path && (
                  <motion.div
                    layoutId="underline"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-red-500 to-orange-500"
                  />
                )}
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            {publicKey && (
              <div className="hidden md:block text-sm text-gray-400 font-mono">
                <div className="text-xs text-gray-500 mb-0.5">Moderator:</div>
                {publicKey.toString().slice(0, 6)}...{publicKey.toString().slice(-4)}
              </div>
            )}
            <div className="wallet-adapter-button-trigger">
              <WalletMultiButton className="!bg-gradient-to-r !from-red-500 !to-orange-500 !rounded-lg !font-orbitron" />
            </div>
            <Link
              to="/"
              onClick={() => disconnect()}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
              title="Exit Moderator Panel"
            >
              <LogOut className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </motion.nav>
  )
}

export default ModeratorNavbar


