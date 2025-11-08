import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useWallet } from '@solana/wallet-adapter-react'
import Card from '../components/Card'
import Chart from '../components/Chart'
import Button from '../components/Button'
import { Trophy, Coins, TrendingUp, Award, Loader2, ExternalLink } from 'lucide-react'
import { rewardsAPI, solanaAPI, analyticsAPI } from '../utils/api'

interface Transaction {
  transaction_hash: string
  status: string
  amount?: number
  block_time?: number
  fee?: number
  explorer_url?: string
}

interface LeaderboardEntry {
  rank: number
  contributor_address: string
  total_rewards?: number
  contributions_count?: number
  metric_value?: number
  avg_accuracy?: number
}

const RewardsPage = () => {
  const { publicKey } = useWallet()
  const [leaderboardType, setLeaderboardType] = useState<'accuracy' | 'rounds' | 'privacy'>('accuracy')
  const [loading, setLoading] = useState(true)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [rewardHistoryData, setRewardHistoryData] = useState<any[]>([])
  const [totalRewards, setTotalRewards] = useState(0)
  const [pendingRewards, setPendingRewards] = useState(0)
  const [userRank, setUserRank] = useState<number | null>(null)

  // Fetch real on-chain data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch transactions if wallet connected
        if (publicKey) {
          const address = publicKey.toString()
          
          // Get real transactions from blockchain
          const txs = await solanaAPI.getAddressTransactions(address, 50)
          setTransactions(
            (txs.transactions || []).map((tx: any) => ({
              transaction_hash: tx.transaction_hash,
              status: tx.status,
              amount: tx.amount,
              block_time: tx.block_time,
              fee: tx.fee,
              explorer_url: tx.explorer_url || `https://solscan.io/tx/${tx.transaction_hash}`,
            }))
          )

          // Get contributor rewards
          const rewards = await rewardsAPI.getContributorRewards(address)
          setTotalRewards(rewards.total_rewards || 0)
          setPendingRewards(
            rewards.rewards?.filter((r: any) => r.status === 'pending').reduce((sum: number, r: any) => sum + (r.amount || 0), 0) || 0
          )
        }

        // Fetch leaderboard
        const leaderboardData = await rewardsAPI.getLeaderboard()
        setLeaderboard(leaderboardData || [])

        // Find user rank
        if (publicKey) {
          const address = publicKey.toString()
          const rank = leaderboardData?.findIndex((entry: any) => entry.contributor_address === address)
          setUserRank(rank !== undefined && rank >= 0 ? rank + 1 : null)
        }

        // Fetch reward history
        const timeline = await analyticsAPI.getRewardsTimeline(30)
        const historyData = Object.entries(timeline.timeline || {})
          .slice(-5)
          .map(([date, amount]: [string, any], idx) => ({
            name: `Week ${idx + 1}`,
            rewards: amount,
          }))
        setRewardHistoryData(historyData)
      } catch (error) {
        console.error('Error fetching rewards data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [publicKey, leaderboardType])

  const handleClaimRewards = async () => {
    if (!publicKey) return

    try {
      // This would need session_id and round_id - for now show message
      alert('Please use the training interface to claim rewards for completed rounds.')
    } catch (error) {
      console.error('Error claiming rewards:', error)
      alert('Error claiming rewards. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-dark pt-24 pb-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-orbitron font-bold mb-2 text-gradient">
            Rewards & Tokens
          </h1>
          <p className="text-gray-400">
            View your rewards, transactions, and compete on the leaderboard
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Total Rewards</p>
                <p className="text-2xl font-orbitron font-bold text-cyber-cyan">
                  {totalRewards} SENT
                </p>
              </div>
              <Coins className="w-10 h-10 text-cyber-cyan" />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Pending Rewards</p>
                <p className="text-2xl font-orbitron font-bold text-cyber-purple">
                  {pendingRewards} SENT
                </p>
              </div>
              <TrendingUp className="w-10 h-10 text-cyber-purple" />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Your Rank</p>
                <p className="text-2xl font-orbitron font-bold text-cyber-magenta">
                  {loading ? (
                    <Loader2 className="w-6 h-6 animate-spin inline" />
                  ) : userRank ? (
                    `#${userRank}`
                  ) : (
                    'N/A'
                  )}
                </p>
              </div>
              <Trophy className="w-10 h-10 text-cyber-magenta" />
            </div>
          </Card>
          {loading && (
            <div className="col-span-3 text-center text-gray-400">
              <Loader2 className="w-6 h-6 animate-spin inline mr-2" />
              Loading on-chain data...
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Reward History Chart */}
          <Card>
            <h3 className="text-xl font-orbitron font-semibold mb-4 text-gradient">
              Reward History
            </h3>
            <Chart data={rewardHistoryData} type="area" dataKey="rewards" name="Rewards (SENT)" />
          </Card>

          {/* Claim Rewards */}
          <Card>
            <h3 className="text-xl font-orbitron font-semibold mb-4 text-gradient">
              Claim Rewards
            </h3>
            <p className="text-gray-400 mb-6">
              Claim your accumulated rewards from contributing to federated learning rounds.
            </p>
            <div className="space-y-4">
              <div>
                <p className="text-gray-400 text-sm mb-2">Available to Claim</p>
                <p className="text-3xl font-orbitron font-bold text-cyber-cyan">
                  {pendingRewards} SENT
                </p>
              </div>
              <Button
                variant="primary"
                onClick={handleClaimRewards}
                disabled={!publicKey || pendingRewards === 0}
                className="w-full"
              >
                Claim Rewards
              </Button>
            </div>
          </Card>
        </div>

        {/* Transactions */}
        <Card className="mb-8">
          <h3 className="text-xl font-orbitron font-semibold mb-4 text-gradient">
            Recent Transactions
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-cyber-cyan/20">
                  <th className="text-left py-3 px-4 text-gray-400 font-orbitron">Type</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-orbitron">Amount</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-orbitron">Date</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-orbitron">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-gray-400">
                      <Loader2 className="w-6 h-6 animate-spin inline mr-2" />
                      Loading transactions from blockchain...
                    </td>
                  </tr>
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-gray-400">
                      No transactions found
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx, idx) => (
                    <tr key={tx.transaction_hash || idx} className="border-b border-cyber-cyan/10 hover:bg-cyber-cyan/5">
                      <td className="py-3 px-4">
                        <a
                          href={tx.explorer_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyber-cyan hover:underline flex items-center gap-1"
                        >
                          {tx.transaction_hash?.slice(0, 8)}...
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                      <td className="py-3 px-4 font-orbitron text-cyber-cyan">
                        {tx.amount ? `${tx.amount.toFixed(2)} SENT` : 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-gray-400">
                        {tx.block_time ? new Date(tx.block_time * 1000).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-orbitron ${
                            tx.status === 'confirmed' || tx.status === 'success'
                              ? 'bg-cyber-cyan/20 text-cyber-cyan'
                              : 'bg-cyber-purple/20 text-cyber-purple'
                          }`}
                        >
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Leaderboard */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-orbitron font-semibold text-gradient">
              Rewards Leaderboard
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setLeaderboardType('accuracy')
                  // Fetch accuracy leaderboard
                }}
                className={`px-4 py-2 rounded-lg text-sm font-orbitron transition-colors ${
                  leaderboardType === 'accuracy'
                    ? 'bg-cyber-cyan/20 border border-cyber-cyan text-cyber-cyan'
                    : 'bg-cyber-dark border border-cyber-cyan/30 text-gray-300 hover:border-cyber-cyan/50'
                }`}
              >
                Rewards
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-cyber-cyan/20">
                  <th className="text-left py-3 px-4 text-gray-400 font-orbitron">Rank</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-orbitron">Address</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-orbitron">Total Rewards</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-orbitron">Contributions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-400">
                      <Loader2 className="w-6 h-6 animate-spin inline mr-2" />
                      Loading leaderboard from blockchain...
                    </td>
                  </tr>
                ) : leaderboard.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-400">
                      No leaderboard data available
                    </td>
                  </tr>
                ) : (
                  leaderboard.map((entry) => (
                    <tr
                      key={entry.contributor_address}
                      className={`border-b border-cyber-cyan/10 hover:bg-cyber-cyan/5 ${
                        publicKey && entry.contributor_address === publicKey.toString()
                          ? 'bg-cyber-cyan/10'
                          : ''
                      }`}
                    >
                      <td className="py-3 px-4">
                        {entry.rank === 1 && <Trophy className="w-5 h-5 text-yellow-400 inline mr-2" />}
                        {entry.rank === 2 && <Award className="w-5 h-5 text-gray-400 inline mr-2" />}
                        {entry.rank === 3 && <Award className="w-5 h-5 text-orange-400 inline mr-2" />}
                        <span className="font-orbitron font-bold">#{entry.rank}</span>
                      </td>
                      <td className="py-3 px-4 font-mono text-sm">
                        <a
                          href={`https://solscan.io/account/${entry.contributor_address}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyber-cyan hover:underline flex items-center gap-1"
                        >
                          {entry.contributor_address.slice(0, 4)}...{entry.contributor_address.slice(-4)}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                      <td className="py-3 px-4 font-orbitron text-cyber-purple">
                        {entry.total_rewards ? `${entry.total_rewards.toFixed(2)} SENT` : '0 SENT'}
                      </td>
                      <td className="py-3 px-4 font-orbitron text-cyber-cyan">
                        {entry.contributions_count || 0}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default RewardsPage

