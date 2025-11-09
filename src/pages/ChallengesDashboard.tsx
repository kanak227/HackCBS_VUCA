import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useWallet } from '@solana/wallet-adapter-react'
import Card from '../components/Card'
import Button from '../components/Button'
import { challengesApi, Challenge } from '../utils/api'
import { Trophy, Clock, Users, Coins } from 'lucide-react'

const ChallengesDashboard = () => {
  const { publicKey } = useWallet()
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadChallenges()
  }, [])

  const loadChallenges = async () => {
    try {
      setLoading(true)
      const data = await challengesApi.list('active')
      setChallenges(data.challenges)
    } catch (error) {
      console.error('Error loading challenges:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatTimeRemaining = (deadline: string) => {
    const now = new Date()
    const deadlineDate = new Date(deadline)
    const diff = deadlineDate.getTime() - now.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    
    if (days > 0) return `${days}d ${hours}h remaining`
    if (hours > 0) return `${hours}h remaining`
    return 'Expired'
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="text-cyber-cyan text-xl">Loading challenges...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-orbitron font-bold text-gradient">Active Challenges</h1>
      </div>

      {challenges.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-gray-400 text-lg">No active challenges at the moment.</p>
          <p className="text-gray-500 mt-2">Check back later for new AI fine-tuning challenges!</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {challenges.map((challenge) => (
            <Link key={challenge.id} to={`/challenges/${challenge.challenge_id}`}>
              <Card className="h-full hover:border-cyber-cyan transition-colors cursor-pointer">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-orbitron font-semibold text-cyber-cyan">
                    {challenge.title}
                  </h3>
                  <span className="px-2 py-1 bg-cyber-darker text-cyber-cyan text-xs rounded">
                    {challenge.status}
                  </span>
                </div>
                
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                  {challenge.description}
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-300">
                    <Users className="w-4 h-4 mr-2" />
                    <span>{challenge.total_submissions} submissions</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-300">
                    <Trophy className="w-4 h-4 mr-2" />
                    <span>Baseline: {(challenge.baseline_accuracy * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-300">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>{formatTimeRemaining(challenge.deadline)}</span>
                  </div>
                  <div className="flex items-center text-sm text-cyber-cyan font-semibold">
                    <Coins className="w-4 h-4 mr-2" />
                    <span>{challenge.reward_amount} SOL Reward</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-cyber-darker">
                  <p className="text-xs text-gray-500">By {challenge.company_name}</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default ChallengesDashboard
