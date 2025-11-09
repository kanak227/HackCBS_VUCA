import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useWallet } from '@solana/wallet-adapter-react'
import { useEffect, useState } from 'react'
import Button from '../components/Button'
import Card from '../components/Card'
import { challengesApi, leaderboardApi } from '../utils/api'
import { Brain, Coins, Shield, TrendingUp } from 'lucide-react'

const Landing = () => {
  const { publicKey } = useWallet()
  const [stats, setStats] = useState({
    activeChallenges: 0,
    totalRewards: 0,
    contributors: 0,
    modelsSubmitted: 0,
  })
  const [loadingStats, setLoadingStats] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setLoadingStats(true)
      // Fetch real stats
      const [challengesData, leaderboardData] = await Promise.all([
        challengesApi.list('active').catch(() => ({ challenges: [], total: 0 })),
        leaderboardApi.get(0, 100).catch(() => ({ entries: [], total: 0 })),
      ])

      const activeChallenges = challengesData.challenges?.length || 0
      const contributors = leaderboardData.entries?.length || 0
      const totalRewards = leaderboardData.entries?.reduce(
        (sum: number, entry: any) => sum + (entry.total_rewards || 0),
        0
      ) || 0

      // Get total submissions from challenges
      const modelsSubmitted = challengesData.challenges?.reduce(
        (sum: number, challenge: any) => sum + (challenge.total_submissions || 0),
        0
      ) || 0

      setStats({
        activeChallenges,
        totalRewards: totalRewards.toFixed(2),
        contributors,
        modelsSubmitted,
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoadingStats(false)
    }
  }

  const features = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: 'AI Fine-Tuning Challenges',
      description: 'Companies post AI model fine-tuning challenges. Contributors submit improved models and earn rewards.',
    },
    {
      icon: <Coins className="w-8 h-8" />,
      title: 'Blockchain Rewards',
      description: 'All rewards are distributed automatically via Solana blockchain. Transparent, secure, and instant payouts.',
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Automated Evaluation',
      description: 'Models are evaluated using Gemini API. Fair, automated, and transparent evaluation process.',
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: 'Leaderboard & Reputation',
      description: 'Build your reputation as an AI model contributor. Climb the leaderboard and earn more rewards.',
    },
  ]

  const displayStats = [
    { label: 'Active Challenges', value: loadingStats ? '...' : `${stats.activeChallenges}` },
    { label: 'Total Rewards', value: loadingStats ? '...' : `${stats.totalRewards} SOL` },
    { label: 'Contributors', value: loadingStats ? '...' : `${stats.contributors}` },
    { label: 'Models Submitted', value: loadingStats ? '...' : `${stats.modelsSubmitted}` },
  ]

  return (
    <div className="min-h-screen bg-gradient-dark pt-0">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="w-full h-full bg-gradient-to-br from-cyber-cyan/10 via-cyber-purple/10 to-cyber-magenta/10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,240,255,0.1),transparent_50%)]" />
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-cyber-darker/50 to-cyber-darker z-10" />
        
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-20 text-center px-4"
        >
          <h1 className="text-6xl md:text-8xl font-orbitron font-bold mb-6 text-gradient">
            FlexAI
          </h1>
          <p className="text-2xl md:text-3xl font-space text-gray-300 mb-4">
            Decentralized AI Fine-Tuning Marketplace
          </p>
          <p className="text-lg md:text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Companies post challenges. Contributors submit improved models. Blockchain handles rewards.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {!publicKey ? (
              <Button variant="primary" className="text-lg px-8 py-4">
                Connect Wallet
              </Button>
            ) : (
              <Link to="/challenges">
                <Button variant="primary" className="text-lg px-8 py-4">
                  View Challenges
                </Button>
              </Link>
            )}
            <Link to="/challenges">
              <Button variant="outline" className="text-lg px-8 py-4">
                Browse Challenges
              </Button>
            </Link>
            <Link to="/leaderboard">
              <Button variant="secondary" className="text-lg px-8 py-4">
                View Leaderboard
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {displayStats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="text-center">
                <div className="text-3xl font-orbitron font-bold text-cyber-cyan mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-4xl font-orbitron font-bold text-center mb-12 text-gradient"
        >
          How FlexAI Works
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <div className="text-cyber-cyan mb-4">{feature.icon}</div>
                <h3 className="text-xl font-orbitron font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400 font-inter">{feature.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container mx-auto px-4 py-20">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-4xl font-orbitron font-bold text-center mb-12 text-gradient"
        >
          Workflow
        </motion.h2>
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: '1', title: 'Company Posts Challenge', desc: 'Post AI fine-tuning challenge with reward pool' },
              { step: '2', title: 'Contributors Submit Models', desc: 'Fine-tune models and submit improved versions' },
              { step: '3', title: 'Automated Evaluation', desc: 'Gemini API evaluates models automatically' },
              { step: '4', title: 'Rewards Distributed', desc: 'Blockchain releases rewards to approved contributors' },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
              >
                <Card className="text-center h-full">
                  <div className="w-12 h-12 bg-cyber-cyan text-cyber-darker rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-lg font-orbitron font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-400">{item.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="cyber-card text-center max-w-3xl mx-auto"
        >
          <h2 className="text-4xl font-orbitron font-bold mb-4 text-gradient">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join the decentralized AI fine-tuning marketplace and earn rewards for your contributions
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/challenges">
              <Button variant="primary" className="text-lg px-8 py-4">
                Browse Challenges
              </Button>
            </Link>
            <Link to="/leaderboard">
              <Button variant="secondary" className="text-lg px-8 py-4">
                View Leaderboard
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  )
}

export default Landing