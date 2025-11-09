import { useEffect, useState } from 'react'
import Card from '../components/Card'
import { leaderboardApi, LeaderboardEntry } from '../utils/api'
import { Trophy, Medal, Award, TrendingUp } from 'lucide-react'

const LeaderboardPage = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLeaderboard()
  }, [])

  const loadLeaderboard = async () => {
    try {
      setLoading(true)
      const data = await leaderboardApi.get(0, 100)
      setEntries(data.entries)
    } catch (error) {
      console.error('Error loading leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-500" />
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />
    if (rank === 3) return <Award className="w-6 h-6 text-orange-600" />
    return <span className="text-gray-500 font-bold">{rank}</span>
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-6)}`
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="text-cyber-cyan text-xl">Loading leaderboard...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-orbitron font-bold text-gradient mb-4">
          Leaderboard
        </h1>
        <p className="text-gray-400">
          Top contributors ranked by reputation score
        </p>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-cyber-darker">
                <th className="text-left py-4 px-4 text-sm font-semibold text-cyber-cyan">Rank</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-cyber-cyan">Contributor</th>
                <th className="text-right py-4 px-4 text-sm font-semibold text-cyber-cyan">Approved</th>
                <th className="text-right py-4 px-4 text-sm font-semibold text-cyber-cyan">Rejected</th>
                <th className="text-right py-4 px-4 text-sm font-semibold text-cyber-cyan">Total Rewards</th>
                <th className="text-right py-4 px-4 text-sm font-semibold text-cyber-cyan">Reputation Score</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, index) => (
                <tr
                  key={entry.contributor_address}
                  className={`border-b border-cyber-darker hover:bg-cyber-darker/50 transition-colors ${
                    index < 3 ? 'bg-cyber-darker/30' : ''
                  }`}
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center">
                      {getRankIcon(entry.rank)}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="font-mono text-sm">{formatAddress(entry.contributor_address)}</div>
                  </td>
                  <td className="py-4 px-4 text-right text-green-400 font-semibold">
                    {entry.total_approved}
                  </td>
                  <td className="py-4 px-4 text-right text-red-400">
                    {entry.total_rejected}
                  </td>
                  <td className="py-4 px-4 text-right text-cyber-cyan font-semibold">
                    {entry.total_rewards.toFixed(2)} SOL
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end">
                      <TrendingUp className="w-4 h-4 mr-2 text-cyber-cyan" />
                      <span className="font-semibold">{entry.reputation_score.toFixed(1)}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {entries.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">No contributors yet.</p>
          </div>
        )}
      </Card>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="text-center">
          <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
          <div className="text-2xl font-bold mb-1">#1</div>
          <div className="text-sm text-gray-400">Top Contributor</div>
        </Card>
        <Card className="text-center">
          <TrendingUp className="w-8 h-8 text-cyber-cyan mx-auto mb-2" />
          <div className="text-2xl font-bold mb-1">{entries.length}</div>
          <div className="text-sm text-gray-400">Total Contributors</div>
        </Card>
        <Card className="text-center">
          <Award className="w-8 h-8 text-orange-500 mx-auto mb-2" />
          <div className="text-2xl font-bold mb-1">
            {entries.reduce((sum, e) => sum + e.total_rewards, 0).toFixed(1)}
          </div>
          <div className="text-sm text-gray-400">Total Rewards Distributed</div>
        </Card>
      </div>
    </div>
  )
}

export default LeaderboardPage
