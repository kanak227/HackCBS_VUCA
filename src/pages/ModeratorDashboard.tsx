import { useEffect, useState } from 'react'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { motion } from 'framer-motion'
import Card from '../components/Card'
import Button from '../components/Button'
import TransactionModal from '../components/TransactionModal'
import { submissionsApi, adminApi, challengesApi, Submission, Challenge } from '../utils/api'
import { CheckCircle, XCircle, Clock, ExternalLink, TrendingUp, User, Award } from 'lucide-react'

interface SubmissionWithChallenge extends Submission {
  challenge?: Challenge
}

const ModeratorDashboard = () => {
  const { publicKey, signTransaction, sendTransaction } = useWallet()
  const { connection } = useConnection()
  const [pendingSubmissions, setPendingSubmissions] = useState<SubmissionWithChallenge[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<number | null>(null)
  const [rejectReason, setRejectReason] = useState<{ [key: number]: string }>({})
  const [showRejectModal, setShowRejectModal] = useState<number | null>(null)
  const [transactionModal, setTransactionModal] = useState<{
    isOpen: boolean
    transaction: {
      signature?: string
      fromAddress: string
      toAddress: string
      amount: number
      status: 'pending' | 'signing' | 'sending' | 'confirming' | 'confirmed' | 'failed'
      error?: string
    }
  }>({
    isOpen: false,
    transaction: {
      fromAddress: '',
      toAddress: '',
      amount: 0,
      status: 'pending',
    },
  })

  useEffect(() => {
    if (publicKey) {
      loadPendingSubmissions()
    }
  }, [publicKey])

  const loadPendingSubmissions = async () => {
    try {
      setLoading(true)
      // Fetch submissions with challenge info included
      const submissions = await submissionsApi.list({ status_filter: 'pending', include_challenge: true })
      
      // Fetch challenge details for each submission using challenge_id_string if available
      const submissionsWithChallenges = await Promise.all(
        submissions.map(async (submission: any) => {
          try {
            let challenge: Challenge | undefined
            // Try to get challenge using challenge_id_string if available, otherwise try challenge_id
            const challengeId = submission.challenge_id_string || submission.challenge_id?.toString()
            if (challengeId) {
              try {
                challenge = await challengesApi.get(challengeId)
              } catch (e) {
                // If challenge lookup fails, we'll just show submission without challenge details
                console.warn(`Could not load challenge ${challengeId} for submission ${submission.id}`)
              }
            }
            return { ...submission, challenge }
          } catch (error) {
            console.error(`Error loading challenge for submission ${submission.id}:`, error)
            return submission
          }
        })
      )
      
      setPendingSubmissions(submissionsWithChallenges)
    } catch (error) {
      console.error('Error loading pending submissions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (submissionId: number) => {
    if (!publicKey || !signTransaction || !sendTransaction) {
      alert('Please connect your moderator wallet first')
      return
    }

    const submission = pendingSubmissions.find((s) => s.id === submissionId)
    if (!submission) {
      alert('Submission not found')
      return
    }

    // Validate wallet separation
    if (submission.contributor_address.toLowerCase() === publicKey.toString().toLowerCase()) {
      alert('❌ Cannot approve your own submission!\n\nYour moderator wallet must be different from the contributor wallet.')
      return
    }

    const moderatorAddress = publicKey.toString()
    const rewardAmount = submission.challenge?.reward_amount || 0

    // Open transaction modal
    setTransactionModal({
      isOpen: true,
      transaction: {
        fromAddress: moderatorAddress,
        toAddress: submission.contributor_address,
        amount: rewardAmount,
        status: 'pending',
      },
    })

    try {
      setProcessingId(submissionId)
      
      // Update status to signing
      setTransactionModal((prev) => ({
        ...prev,
        transaction: { ...prev.transaction, status: 'signing' },
      }))

      // Create the actual SOL transfer transaction
      const contributorPubkey = new PublicKey(submission.contributor_address)
      const rewardLamports = Math.floor(rewardAmount * LAMPORTS_PER_SOL)

      // Get recent blockhash
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed')

      // Create transfer instruction
      const transferInstruction = SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: contributorPubkey,
        lamports: rewardLamports,
      })

      // Create transaction
      const transaction = new Transaction({
        feePayer: publicKey,
        blockhash: blockhash,
        lastValidBlockHeight: lastValidBlockHeight,
      }).add(transferInstruction)

      // Sign transaction with moderator's wallet
      const signedTransaction = await signTransaction(transaction)

      // Update status to sending
      setTransactionModal((prev) => ({
        ...prev,
        transaction: { ...prev.transaction, status: 'sending' },
      }))

      // Send transaction to blockchain
      const signature = await sendTransaction(signedTransaction, connection, {
        skipPreflight: false,
        maxRetries: 3,
      })

      // Update modal with transaction signature
      setTransactionModal((prev) => ({
        ...prev,
        transaction: {
          ...prev.transaction,
          signature: signature,
          status: 'confirming',
        },
      }))

      // Wait for confirmation
      await connection.confirmTransaction(
        {
          signature: signature,
          blockhash: blockhash,
          lastValidBlockHeight: lastValidBlockHeight,
        },
        'confirmed'
      )

      // Update status to confirmed
      setTransactionModal((prev) => ({
        ...prev,
        transaction: { ...prev.transaction, status: 'confirmed' },
      }))

      // Now update the database via API with the transaction hash
      try {
        await adminApi.approve(submissionId, moderatorAddress, signature)
      } catch (dbError: any) {
        console.error('Database update failed:', dbError)
        // Transaction already succeeded on blockchain, so we continue
      }

      // Reload submissions after a delay
      setTimeout(async () => {
        await loadPendingSubmissions()
      }, 1000)
    } catch (error: any) {
      console.error('Transaction error:', error)
      const errorMsg = error.message || 'Unknown error'
      setTransactionModal((prev) => ({
        ...prev,
        transaction: {
          ...prev.transaction,
          status: 'failed',
          error: errorMsg.includes('User rejected')
            ? 'Transaction was cancelled. Please try again and approve the transaction in your wallet.'
            : errorMsg.includes('insufficient funds')
            ? 'Insufficient SOL balance. Please ensure your moderator wallet has enough SOL to cover the reward and transaction fees.'
            : errorMsg,
        },
      }))
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (submissionId: number) => {
    if (!publicKey) {
      alert('Please connect your wallet first')
      return
    }

    const reason = rejectReason[submissionId] || 'No reason provided'
    if (!reason.trim()) {
      alert('Please provide a rejection reason')
      return
    }

    try {
      setProcessingId(submissionId)
      await adminApi.reject(submissionId, publicKey.toString(), reason)
      
      alert('Submission rejected')
      
      // Reload submissions
      await loadPendingSubmissions()
      setShowRejectModal(null)
      setRejectReason({ ...rejectReason, [submissionId]: '' })
    } catch (error: any) {
      alert(`Error rejecting submission: ${error.message || 'Unknown error'}`)
    } finally {
      setProcessingId(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (!publicKey) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <Card className="max-w-md mx-auto">
          <div className="mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-orange-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-orbitron font-bold mb-4 bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
              Moderator Access Required
            </h2>
            <p className="text-gray-400 mb-2">
              Moderator wallet connection required
            </p>
            <p className="text-sm text-gray-500 mb-6">
              You must connect your moderator wallet to access the moderator panel and approve submissions
            </p>
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4">
              <p className="text-sm text-red-400">
                ⚠️ This is a moderator-only area. Moderator actions require wallet signature for blockchain transactions.
              </p>
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
              <p className="text-xs text-yellow-400">
                🔒 Your moderator wallet must be different from contributor wallets
              </p>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="text-red-400 text-xl">Loading pending submissions...</div>
      </div>
    )
  }

  return (
    <>
      <TransactionModal
        isOpen={transactionModal.isOpen}
        onClose={() => {
          setTransactionModal({ ...transactionModal, isOpen: false })
          // Reload submissions when modal closes if transaction was successful
          if (transactionModal.transaction.status === 'confirmed') {
            loadPendingSubmissions()
          }
        }}
        transaction={transactionModal.transaction}
      />
      <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-orbitron font-bold mb-2 bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
              Moderator Dashboard
            </h1>
            <p className="text-gray-400">
              Review and approve/reject model submissions. Approved submissions trigger automatic blockchain reward distribution.
            </p>
          </div>
          {publicKey && (
            <div className="text-right">
              <div className="text-sm text-gray-500 mb-1">Moderator Wallet</div>
              <div className="font-mono text-sm text-red-400">
                {publicKey.toString().slice(0, 6)}...{publicKey.toString().slice(-4)}
              </div>
              <div className="text-xs text-gray-500 mt-1">(Must be different from contributor wallets)</div>
            </div>
          )}
        </div>
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
          <p className="text-sm text-red-400 mb-2">
            💡 <strong>How it works:</strong> When you approve a submission, a blockchain transaction automatically sends the reward SOL to the contributor's wallet. The transaction hash is recorded for transparency.
          </p>
          <p className="text-xs text-red-400/80 mt-2">
            ⚠️ <strong>Important:</strong> Your moderator wallet must be different from the contributor's wallet. The system will validate this before processing approvals.
          </p>
        </div>
      </motion.div>

      {pendingSubmissions.length === 0 ? (
        <Card className="text-center py-12">
          <Clock className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-orbitron font-semibold mb-2">No Pending Submissions</h3>
          <p className="text-gray-400">All submissions have been reviewed.</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {pendingSubmissions.map((submission) => (
            <motion.div
              key={submission.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="hover:border-red-500/50">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-orbitron font-semibold mb-2">
                          Submission #{submission.id}
                        </h3>
                        {submission.challenge && (
                          <p className="text-red-400 font-space mb-1">
                            Challenge: {submission.challenge.title}
                          </p>
                        )}
                      </div>
                      <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm font-space">
                        Pending Review
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-gray-400">
                        <User className="w-4 h-4" />
                        <div>
                          <div className="text-xs text-gray-500 mb-0.5">Contributor Wallet:</div>
                          <span className="font-mono text-sm">
                            {submission.contributor_address.slice(0, 8)}...
                            {submission.contributor_address.slice(-8)}
                          </span>
                        </div>
                      </div>
                      
                      {publicKey && submission.contributor_address.toLowerCase() === publicKey.toString().toLowerCase() && (
                        <div className="col-span-2 p-2 bg-red-500/10 border border-red-500/30 rounded text-xs text-red-400">
                          ⚠️ Warning: This is your own submission. You cannot approve your own submissions as a moderator.
                        </div>
                      )}
                      
                      {submission.accuracy !== null && (
                        <div className="flex items-center gap-2 text-gray-400">
                          <TrendingUp className="w-4 h-4" />
                          <span>Accuracy: {(submission.accuracy * 100).toFixed(2)}%</span>
                        </div>
                      )}
                      
                      {submission.challenge && (
                        <div className="flex items-center gap-2 text-gray-400">
                          <Award className="w-4 h-4" />
                          <span>Reward: {submission.challenge.reward_amount} SOL</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 text-gray-400">
                        <Clock className="w-4 h-4" />
                        <span>Submitted: {formatDate(submission.submitted_at)}</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm text-gray-500 mb-1">Model Hash:</p>
                      <p className="font-mono text-xs text-gray-400 break-all">
                        {submission.model_hash}
                      </p>
                    </div>

                    {submission.model_ipfs_hash && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-500 mb-1">IPFS Hash:</p>
                        <p className="font-mono text-xs text-gray-400 break-all">
                          {submission.model_ipfs_hash}
                        </p>
                      </div>
                    )}

                    {submission.solana_tx_hash && (
                      <div className="mb-4">
                        <a
                          href={`https://solscan.io/tx/${submission.solana_tx_hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-red-400 hover:text-orange-400 text-sm"
                        >
                          <ExternalLink className="w-4 h-4" />
                          View Submission Transaction
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-3 md:min-w-[200px]">
                    <Button
                      variant="primary"
                      onClick={() => handleApprove(submission.id)}
                      disabled={processingId === submission.id || (publicKey && submission.contributor_address.toLowerCase() === publicKey.toString().toLowerCase())}
                      className="w-full !bg-gradient-to-r !from-red-500 !to-orange-500 hover:!from-red-600 hover:!to-orange-600"
                    >
                      {processingId === submission.id ? (
                        <>
                          <Clock className="w-4 h-4 mr-2 inline animate-spin" />
                          Processing Transaction...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2 inline" />
                          Approve & Send Reward
                        </>
                      )}
                    </Button>
                    {submission.challenge && (
                      <div className="text-xs text-gray-500 mt-2 text-center">
                        Will send {submission.challenge.reward_amount} SOL to contributor
                      </div>
                    )}
                    
                    <Button
                      variant="outline"
                      onClick={() => setShowRejectModal(submission.id)}
                      disabled={processingId === submission.id}
                      className="w-full !border-red-500 !text-red-400 hover:!bg-red-500/10"
                    >
                      <XCircle className="w-4 h-4 mr-2 inline" />
                      Reject
                    </Button>
                  </div>
                </div>

                {/* Reject Modal */}
                {showRejectModal === submission.id && (
                  <div className="mt-4 p-4 bg-cyber-dark rounded-lg border border-red-500/30">
                    <p className="text-sm text-gray-400 mb-2">Rejection Reason:</p>
                    <textarea
                      value={rejectReason[submission.id] || ''}
                      onChange={(e) =>
                        setRejectReason({ ...rejectReason, [submission.id]: e.target.value })
                      }
                      placeholder="Enter reason for rejection..."
                      className="w-full p-2 bg-cyber-darker border border-gray-700 rounded text-white text-sm mb-3"
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => handleReject(submission.id)}
                        disabled={processingId === submission.id}
                        className="flex-1"
                      >
                        Confirm Reject
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setShowRejectModal(null)
                          setRejectReason({ ...rejectReason, [submission.id]: '' })
                        }}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
    </>
  )
}

export default ModeratorDashboard

