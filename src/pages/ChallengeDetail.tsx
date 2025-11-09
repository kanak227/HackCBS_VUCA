import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useWallet } from '@solana/wallet-adapter-react'
import Card from '../components/Card'
import Button from '../components/Button'
import { challengesApi, Challenge, Submission } from '../utils/api'
import { Clock, Users, ArrowLeft, Upload, TrendingUp } from 'lucide-react'

const ChallengeDetail = () => {
  const { challengeId } = useParams<{ challengeId: string }>()
  const { publicKey } = useWallet()
  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (challengeId) {
      loadChallenge()
      loadSubmissions()
    }
  }, [challengeId])

  const loadChallenge = async () => {
    if (!challengeId) return
    try {
      const data = await challengesApi.get(challengeId)
      setChallenge(data)
    } catch (error) {
      console.error('Error loading challenge:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadSubmissions = async () => {
    if (!challengeId) return
    try {
      const data = await challengesApi.getSubmissions(challengeId)
      setSubmissions(data.submissions)
    } catch (error) {
      console.error('Error loading submissions:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="text-cyber-cyan text-xl">Loading challenge...</div>
      </div>
    )
  }

  if (!challenge) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <Card>
          <p className="text-gray-400">Challenge not found</p>
          <Link to="/challenges">
            <Button variant="primary" className="mt-4">Back to Challenges</Button>
          </Link>
        </Card>
      </div>
    )
  }

  const userSubmission = publicKey
    ? submissions.find((s) => s.contributor_address === publicKey.toString())
    : null

  return (
    <div className="container mx-auto px-4 py-12">
      <Link to="/challenges">
        <Button variant="outline" className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Challenges
        </Button>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-3xl font-orbitron font-bold text-gradient">
                {challenge.title}
              </h1>
              <span className="px-3 py-1 bg-cyber-darker text-cyber-cyan text-sm rounded">
                {challenge.status}
              </span>
            </div>

            <p className="text-gray-300 mb-6">{challenge.description}</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-cyber-darker p-4 rounded">
                <div className="text-cyber-cyan text-sm mb-1">Baseline Accuracy</div>
                <div className="text-2xl font-bold">
                  {(challenge.baseline_accuracy * 100).toFixed(1)}%
                </div>
              </div>
              <div className="bg-cyber-darker p-4 rounded">
                <div className="text-cyber-cyan text-sm mb-1">Reward</div>
                <div className="text-2xl font-bold">{challenge.reward_amount} SOL</div>
              </div>
              <div className="bg-cyber-darker p-4 rounded">
                <div className="text-cyber-cyan text-sm mb-1">Submissions</div>
                <div className="text-2xl font-bold">{challenge.total_submissions}</div>
              </div>
              <div className="bg-cyber-darker p-4 rounded">
                <div className="text-cyber-cyan text-sm mb-1">Approved</div>
                <div className="text-2xl font-bold">{challenge.approved_submissions}</div>
              </div>
            </div>

            <div className="border-t border-cyber-darker pt-4">
              <div className="flex items-center text-sm text-gray-400 mb-2">
                <Clock className="w-4 h-4 mr-2" />
                <span>Deadline: {formatDate(challenge.deadline)}</span>
              </div>
              <div className="flex items-center text-sm text-gray-400">
                <Users className="w-4 h-4 mr-2" />
                <span>Company: {challenge.company_name}</span>
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="text-xl font-orbitron font-semibold mb-4">Submissions</h2>
            {submissions.length === 0 ? (
              <p className="text-gray-400">No submissions yet.</p>
            ) : (
              <div className="space-y-4">
                {submissions.map((submission) => (
                  <div
                    key={submission.id}
                    className="bg-cyber-darker p-4 rounded border border-cyber-darker hover:border-cyber-cyan transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="text-sm text-gray-400">
                          {submission.contributor_address.slice(0, 8)}...
                          {submission.contributor_address.slice(-8)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatDate(submission.submitted_at)}
                        </div>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs rounded ${
                          submission.status === 'approved'
                            ? 'bg-green-900 text-green-300'
                            : submission.status === 'rejected'
                            ? 'bg-red-900 text-red-300'
                            : 'bg-yellow-900 text-yellow-300'
                        }`}
                      >
                        {submission.status}
                      </span>
                    </div>
                    {submission.accuracy !== null && (
                      <div className="flex items-center text-cyber-cyan mt-2">
                        <TrendingUp className="w-4 h-4 mr-2" />
                        <span>Accuracy: {(submission.accuracy * 100).toFixed(2)}%</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div>
          <Card className="sticky top-4">
            <h2 className="text-xl font-orbitron font-semibold mb-4">Actions</h2>
            {!publicKey ? (
              <div className="text-center py-4">
                <p className="text-gray-400 mb-4">Connect your wallet to submit a model</p>
              </div>
            ) : userSubmission ? (
              <div className="text-center py-4">
                <p className="text-gray-300 mb-2">You've already submitted a model</p>
                <p className="text-sm text-gray-400 mb-4">Status: {userSubmission.status}</p>
                {userSubmission.accuracy !== null && (
                  <p className="text-cyber-cyan font-semibold">
                    Your Accuracy: {(userSubmission.accuracy * 100).toFixed(2)}%
                  </p>
                )}
              </div>
            ) : (
              <Link to={`/challenges/${challengeId}/submit`}>
                <Button variant="primary" className="w-full">
                  <Upload className="w-4 h-4 mr-2" />
                  Submit Model
                </Button>
              </Link>
            )}

            <div className="mt-6 pt-6 border-t border-cyber-darker">
              <h3 className="text-sm font-semibold mb-2">Challenge Info</h3>
              <div className="text-xs text-gray-400 space-y-1">
                <div>Challenge ID: {challenge.challenge_id.slice(0, 16)}...</div>
                {challenge.solana_tx_hash && (
                  <div>
                    TX: {challenge.solana_tx_hash.slice(0, 16)}...
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default ChallengeDetail
