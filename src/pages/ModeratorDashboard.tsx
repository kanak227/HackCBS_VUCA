import { useEffect, useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { motion } from 'framer-motion'
import Card from '../components/Card'
import Button from '../components/Button'
import { submissionsApi, adminApi, challengesApi, Submission, Challenge } from '../utils/api'
import { CheckCircle, XCircle, Clock, ExternalLink, TrendingUp, User, Award } from 'lucide-react'

interface SubmissionWithChallenge extends Submission {
  challenge?: Challenge
}

const ModeratorDashboard = () => {
  const { publicKey } = useWallet()
  const [pendingSubmissions, setPendingSubmissions] = useState<SubmissionWithChallenge[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<number | null>(null)
  const [rejectReason, setRejectReason] = useState<{ [key: number]: string }>({})
  const [showRejectModal, setShowRejectModal] = useState<number | null>(null)

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
    if (!publicKey) {
      alert('Please connect your wallet first')
      return
    }

    try {
      setProcessingId(submissionId)
      
      // Check if submission exists and has contributor address
      const submission = pendingSubmissions.find(s => s.id === submissionId)
      if (!submission) {
        alert('Submission not found')
        return
      }

      if (!submission.contributor_address) {
        alert('Error: Contributor wallet address not found. Cannot distribute reward.')
        return
      }

      // Show processing message
      const processingMsg = `Processing approval...\n\nThis will:\n1. Update submission status to 'approved'\n2. Send ${submission.challenge?.reward_amount || 'reward'} SOL to contributor wallet\n3. Update contributor reputation\n\nPlease wait...`
      
      const result = await adminApi.approve(submissionId, publicKey.toString())
      
      if (result.reward_tx_hash) {
        const successMsg = `✅ Submission Approved & Reward Distributed!\n\n` +
          `📊 Submission ID: ${result.submission_id}\n` +
          `💰 Reward Amount: ${result.reward_amount} SOL\n` +
          `🔗 Transaction Hash: ${result.reward_tx_hash}\n\n` +
          `✅ The reward has been sent to the contributor's wallet address:\n${submission.contributor_address}\n\n` +
          `View on Solscan: https://solscan.io/tx/${result.reward_tx_hash}`
        alert(successMsg)
      } else {
        alert(`⚠️ Submission Approved (Database Updated)\n\n` +
          `💰 Reward Amount: ${result.reward_amount} SOL\n\n` +
          `⚠️ Blockchain transaction is pending or failed.\n` +
          `The submission status has been updated, but the reward transfer may need manual processing.`)
      }
      
      // Reload submissions
      await loadPendingSubmissions()
    } catch (error: any) {
      const errorMsg = error.message || 'Unknown error'
      if (errorMsg.includes('not found') || errorMsg.includes('wallet')) {
        alert(`❌ Error: Contributor wallet not found or not registered.\n\n${errorMsg}\n\nPlease ensure the contributor has a connected wallet.`)
      } else {
        alert(`Error approving submission: ${errorMsg}`)
      }
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
            <div className="w-20 h-20 bg-gradient-cyber rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-orbitron font-bold mb-4 text-gradient">
              Moderator Dashboard
            </h2>
            <p className="text-gray-400 mb-2">
              Wallet connection required
            </p>
            <p className="text-sm text-gray-500 mb-6">
              You must connect your wallet to approve submissions and distribute rewards via blockchain
            </p>
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-4">
              <p className="text-sm text-yellow-400">
                ⚠️ Moderator actions require wallet signature for blockchain transactions
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
        <div className="text-cyber-cyan text-xl">Loading pending submissions...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-orbitron font-bold mb-2 text-gradient">
              Moderator Dashboard
            </h1>
            <p className="text-gray-400">
              Review and approve/reject model submissions. Approved submissions trigger automatic blockchain reward distribution.
            </p>
          </div>
          {publicKey && (
            <div className="text-right">
              <div className="text-sm text-gray-500 mb-1">Connected Wallet</div>
              <div className="font-mono text-sm text-cyber-cyan">
                {publicKey.toString().slice(0, 6)}...{publicKey.toString().slice(-4)}
              </div>
            </div>
          )}
        </div>
        <div className="bg-cyber-cyan/10 border border-cyber-cyan/30 rounded-lg p-4 mb-6">
          <p className="text-sm text-cyber-cyan">
            💡 <strong>How it works:</strong> When you approve a submission, a blockchain transaction automatically sends the reward SOL to the contributor's wallet. The transaction hash is recorded for transparency.
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
              <Card className="hover:border-cyber-cyan/50">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-orbitron font-semibold mb-2">
                          Submission #{submission.id}
                        </h3>
                        {submission.challenge && (
                          <p className="text-cyber-cyan font-space mb-1">
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
                        <span className="font-mono text-sm">
                          {submission.contributor_address.slice(0, 8)}...
                          {submission.contributor_address.slice(-8)}
                        </span>
                      </div>
                      
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
                          className="flex items-center gap-2 text-cyber-cyan hover:text-cyber-purple text-sm"
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
                      disabled={processingId === submission.id}
                      className="w-full"
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
                      className="w-full"
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
  )
}

export default ModeratorDashboard

