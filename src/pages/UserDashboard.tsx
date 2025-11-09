import { useEffect, useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { motion } from 'framer-motion'
import Card from '../components/Card'
import Button from '../components/Button'
import { submissionsApi, challengesApi, Submission, Challenge } from '../utils/api'
import { CheckCircle, XCircle, Clock, ExternalLink, TrendingUp, Award, FileText, Coins } from 'lucide-react'
import { Link } from 'react-router-dom'

interface SubmissionWithChallenge extends Submission {
  challenge?: Challenge
}

const UserDashboard = () => {
  const { publicKey } = useWallet()
  const [mySubmissions, setMySubmissions] = useState<SubmissionWithChallenge[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalSubmissions: 0,
    approvedSubmissions: 0,
    rejectedSubmissions: 0,
    pendingSubmissions: 0,
    totalRewards: 0,
  })

  useEffect(() => {
    if (publicKey) {
      loadUserData()
    } else {
      setLoading(false)
    }
  }, [publicKey])

  const loadUserData = async () => {
    if (!publicKey) return

    try {
      setLoading(true)
      const address = publicKey.toString()
      
      // Fetch user's submissions
      const submissions = await submissionsApi.list({ 
        contributor_address: address 
      })

      // Fetch challenge details for each submission
      const submissionsWithChallenges = await Promise.all(
        submissions.map(async (submission: any) => {
          try {
            let challenge: Challenge | undefined
            const challengeId = submission.challenge_id_string || submission.challenge_id?.toString()
            if (challengeId) {
              try {
                challenge = await challengesApi.get(challengeId)
              } catch (e) {
                console.warn(`Could not load challenge ${challengeId}`)
              }
            }
            return { ...submission, challenge }
          } catch (error) {
            return submission
          }
        })
      )

      setMySubmissions(submissionsWithChallenges)

      // Calculate stats
      const approved = submissions.filter(s => s.status === 'approved').length
      const rejected = submissions.filter(s => s.status === 'rejected').length
      const pending = submissions.filter(s => s.status === 'pending').length
      const totalRewards = submissions
        .filter(s => s.status === 'approved')
        .reduce((sum, s) => sum + (s.reward_amount || 0), 0)

      setStats({
        totalSubmissions: submissions.length,
        approvedSubmissions: approved,
        rejectedSubmissions: rejected,
        pendingSubmissions: pending,
        totalRewards,
      })
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setLoading(false)
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-space flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Approved
          </span>
        )
      case 'rejected':
        return (
          <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm font-space flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            Rejected
          </span>
        )
      case 'pending':
        return (
          <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm font-space flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        )
      default:
        return <span className="px-3 py-1 bg-gray-500/20 text-gray-400 rounded-full text-sm">{status}</span>
    }
  }

  if (!publicKey) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <Card className="max-w-md mx-auto">
          <h2 className="text-2xl font-orbitron font-bold mb-4 text-gradient">
            User Dashboard
          </h2>
          <p className="text-gray-400 mb-6">
            Please connect your wallet to view your submissions and rewards
          </p>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="text-cyber-cyan text-xl">Loading your dashboard...</div>
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
        <h1 className="text-4xl font-orbitron font-bold mb-4 text-gradient">
          My Dashboard
        </h1>
        <p className="text-gray-400">
          View your submissions, rewards, and transaction history
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <Card className="text-center">
          <div className="text-3xl font-orbitron font-bold text-cyber-cyan mb-2">
            {stats.totalSubmissions}
          </div>
          <div className="text-sm text-gray-400">Total Submissions</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-orbitron font-bold text-green-400 mb-2">
            {stats.approvedSubmissions}
          </div>
          <div className="text-sm text-gray-400">Approved</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-orbitron font-bold text-yellow-400 mb-2">
            {stats.pendingSubmissions}
          </div>
          <div className="text-sm text-gray-400">Pending</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-orbitron font-bold text-red-400 mb-2">
            {stats.rejectedSubmissions}
          </div>
          <div className="text-sm text-gray-400">Rejected</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-orbitron font-bold text-cyber-purple mb-2 flex items-center justify-center gap-1">
            <Coins className="w-6 h-6" />
            {stats.totalRewards.toFixed(2)}
          </div>
          <div className="text-sm text-gray-400">Total Rewards (SOL)</div>
        </Card>
      </div>

      {/* Submissions List */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-orbitron font-semibold text-gradient">
            My Submissions
          </h2>
          <Link to="/challenges">
            <Button variant="primary" className="text-sm">
              Browse Challenges
            </Button>
          </Link>
        </div>

        {mySubmissions.length === 0 ? (
          <Card className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-orbitron font-semibold mb-2">No Submissions Yet</h3>
            <p className="text-gray-400 mb-4">Start participating by submitting models to challenges</p>
            <Link to="/challenges">
              <Button variant="primary">Browse Challenges</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {mySubmissions.map((submission) => (
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
                            <Link 
                              to={`/challenges/${submission.challenge.challenge_id}`}
                              className="text-cyber-cyan hover:text-cyber-purple font-space mb-1 block"
                            >
                              Challenge: {submission.challenge.title}
                            </Link>
                          )}
                        </div>
                        {getStatusBadge(submission.status)}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {submission.accuracy !== null && (
                          <div className="flex items-center gap-2 text-gray-400">
                            <TrendingUp className="w-4 h-4" />
                            <span>Accuracy: {(submission.accuracy * 100).toFixed(2)}%</span>
                          </div>
                        )}
                        
                        {submission.status === 'approved' && submission.reward_amount > 0 && (
                          <div className="flex items-center gap-2 text-green-400">
                            <Award className="w-4 h-4" />
                            <span className="font-semibold">Reward: {submission.reward_amount} SOL</span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2 text-gray-400">
                          <Clock className="w-4 h-4" />
                          <span>Submitted: {formatDate(submission.submitted_at)}</span>
                        </div>

                        {submission.approved_at && (
                          <div className="flex items-center gap-2 text-green-400">
                            <CheckCircle className="w-4 h-4" />
                            <span>Approved: {formatDate(submission.approved_at)}</span>
                          </div>
                        )}

                        {submission.rejected_at && (
                          <div className="flex items-center gap-2 text-red-400">
                            <XCircle className="w-4 h-4" />
                            <span>Rejected: {formatDate(submission.rejected_at)}</span>
                          </div>
                        )}
                      </div>

                      {submission.rejection_reason && (
                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded">
                          <p className="text-sm text-red-400">
                            <strong>Rejection Reason:</strong> {submission.rejection_reason}
                          </p>
                        </div>
                      )}

                      <div className="mb-4">
                        <p className="text-sm text-gray-500 mb-1">Model Hash:</p>
                        <p className="font-mono text-xs text-gray-400 break-all">
                          {submission.model_hash}
                        </p>
                      </div>

                      {submission.reward_tx_hash && (
                        <div className="mb-4">
                          <a
                            href={`https://solscan.io/tx/${submission.reward_tx_hash}?cluster=testnet`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-cyber-cyan hover:text-cyber-purple text-sm"
                          >
                            <ExternalLink className="w-4 h-4" />
                            View Reward Transaction
                          </a>
                        </div>
                      )}

                      {submission.solana_tx_hash && (
                        <div>
                          <a
                            href={`https://solscan.io/tx/${submission.solana_tx_hash}?cluster=testnet`}
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
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default UserDashboard

