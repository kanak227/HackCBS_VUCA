import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, Clock, ExternalLink, ArrowRight, Loader } from 'lucide-react'
import Card from './Card'

interface TransactionModalProps {
  isOpen: boolean
  onClose: () => void
  transaction: {
    signature?: string
    fromAddress: string
    toAddress: string
    amount: number
    status: 'pending' | 'signing' | 'sending' | 'confirming' | 'confirmed' | 'failed'
    error?: string
  }
}

const TransactionModal = ({ isOpen, onClose, transaction }: TransactionModalProps) => {
  const [elapsedTime, setElapsedTime] = useState(0)

  useEffect(() => {
    if (!isOpen) {
      setElapsedTime(0)
      return
    }

    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [isOpen])

  const formatAddress = (address: string) => {
    if (!address) return 'N/A'
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const getStatusIcon = () => {
    switch (transaction.status) {
      case 'pending':
      case 'signing':
        return <Clock className="w-8 h-8 text-yellow-400 animate-pulse" />
      case 'sending':
      case 'confirming':
        return <Loader className="w-8 h-8 text-blue-400 animate-spin" />
      case 'confirmed':
        return <CheckCircle className="w-8 h-8 text-green-400" />
      case 'failed':
        return <X className="w-8 h-8 text-red-400" />
      default:
        return <Clock className="w-8 h-8 text-gray-400" />
    }
  }

  const getStatusText = () => {
    switch (transaction.status) {
      case 'pending':
        return 'Preparing Transaction...'
      case 'signing':
        return 'Signing Transaction...'
      case 'sending':
        return 'Sending to Blockchain...'
      case 'confirming':
        return 'Confirming Transaction...'
      case 'confirmed':
        return 'Transaction Confirmed!'
      case 'failed':
        return 'Transaction Failed'
      default:
        return 'Processing...'
    }
  }

  const getStatusColor = () => {
    switch (transaction.status) {
      case 'pending':
      case 'signing':
        return 'text-yellow-400'
      case 'sending':
      case 'confirming':
        return 'text-blue-400'
      case 'confirmed':
        return 'text-green-400'
      case 'failed':
        return 'text-red-400'
      default:
        return 'text-gray-400'
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="w-full max-w-2xl mx-4"
        >
          <Card className="relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="p-6">
              {/* Header */}
              <div className="text-center mb-6">
                <div className="flex justify-center mb-4">{getStatusIcon()}</div>
                <h2 className="text-2xl font-orbitron font-bold mb-2 bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                  Blockchain Transaction
                </h2>
                <p className={`text-lg font-space ${getStatusColor()}`}>
                  {getStatusText()}
                </p>
                {elapsedTime > 0 && (
                  <p className="text-sm text-gray-500 mt-2">
                    Elapsed: {elapsedTime}s
                  </p>
                )}
              </div>

              {/* Transaction Details */}
              <div className="space-y-4 mb-6">
                {/* Amount */}
                <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/30 rounded-lg p-4">
                  <div className="text-center">
                    <div className="text-sm text-gray-400 mb-1">Transferring</div>
                    <div className="text-3xl font-orbitron font-bold text-red-400">
                      {transaction.amount} SOL
                    </div>
                  </div>
                </div>

                {/* From/To */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-cyber-dark rounded-lg border border-gray-700">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">From (Moderator)</div>
                      <div className="font-mono text-sm text-red-400">
                        {formatAddress(transaction.fromAddress)}
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-500" />
                    <div>
                      <div className="text-xs text-gray-500 mb-1">To (Contributor)</div>
                      <div className="font-mono text-sm text-green-400">
                        {formatAddress(transaction.toAddress)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Transaction Signature */}
                {transaction.signature && (
                  <div className="p-3 bg-cyber-dark rounded-lg border border-gray-700">
                    <div className="text-xs text-gray-500 mb-2">Transaction Signature</div>
                    <div className="flex items-center justify-between">
                      <div className="font-mono text-xs text-cyber-cyan break-all">
                        {transaction.signature}
                      </div>
                      <a
                        href={`https://solscan.io/tx/${transaction.signature}?cluster=testnet`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-blue-400 hover:text-blue-300 transition-colors"
                        title="View on Solscan (Testnet)"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {transaction.status === 'failed' && transaction.error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <div className="text-sm text-red-400">{transaction.error}</div>
                  </div>
                )}

                {/* Progress Steps */}
                <div className="space-y-2">
                  <div className="text-xs text-gray-500 mb-2">Transaction Progress</div>
                  {['pending', 'signing', 'sending', 'confirming', 'confirmed'].map((step, index) => {
                    const stepStatus = transaction.status
                    const isActive = step === stepStatus
                    const isCompleted = ['signing', 'sending', 'confirming', 'confirmed'].indexOf(stepStatus) > index
                    const isCurrent = isActive || isCompleted

                    return (
                      <div key={step} className="flex items-center space-x-2">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            isCompleted
                              ? 'bg-green-400'
                              : isActive
                              ? 'bg-blue-400 animate-pulse'
                              : 'bg-gray-600'
                          }`}
                        />
                        <span
                          className={`text-xs ${
                            isCurrent ? 'text-white' : 'text-gray-500'
                          }`}
                        >
                          {step.charAt(0).toUpperCase() + step.slice(1)}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Actions */}
              {transaction.status === 'confirmed' && (
                <div className="flex gap-3">
                  <a
                    href={`https://solscan.io/tx/${transaction.signature}?cluster=testnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg text-white font-orbitron text-center hover:from-red-600 hover:to-orange-600 transition-colors"
                  >
                    View on Solscan (Testnet)
                  </a>
                  <button
                    onClick={onClose}
                    className="px-4 py-2 bg-gray-700 rounded-lg text-white font-orbitron hover:bg-gray-600 transition-colors"
                  >
                    Close
                  </button>
                </div>
              )}

              {transaction.status === 'failed' && (
                <button
                  onClick={onClose}
                  className="w-full px-4 py-2 bg-gray-700 rounded-lg text-white font-orbitron hover:bg-gray-600 transition-colors"
                >
                  Close
                </button>
              )}
            </div>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default TransactionModal

