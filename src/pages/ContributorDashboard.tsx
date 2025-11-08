import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useWallet } from '@solana/wallet-adapter-react'
import Card from '../components/Card'
import Chart from '../components/Chart'
import Button from '../components/Button'
import Modal from '../components/Modal'
import { Upload, TrendingUp, Shield, Coins, Database, Loader2 } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { contributorAPI, solanaAPI, analyticsAPI } from '../utils/api'

const ContributorDashboard = () => {
  const { publicKey } = useWallet()
  const [balance, setBalance] = useState(0)
  const [tokenBalance, setTokenBalance] = useState(0)
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(true)
  const [metrics, setMetrics] = useState({
    totalDataContributed: '0 GB',
    rewardsEarned: '0 SENT',
    federatedRounds: 0,
    privacyScore: 0,
  })
  const [rewardData, setRewardData] = useState<any[]>([])
  const [contributionData, setContributionData] = useState<any[]>([])

  // Fetch real data from blockchain
  useEffect(() => {
    if (!publicKey) {
      setLoading(false)
      return
    }

    const fetchData = async () => {
      try {
        setLoading(true)
        const address = publicKey.toString()

        // Fetch real balances
        const solBalance = await solanaAPI.getBalance(address)
        setBalance(solBalance.balance || 0)

        const tokenBal = await solanaAPI.getTokenBalance(address)
        setTokenBalance(tokenBal.balance || 0)

        // Fetch real contributor stats
        const stats = await contributorAPI.getContributorStats(address)
        
        setMetrics({
          totalDataContributed: `${(stats.total_contributions * 0.1).toFixed(1)} GB`, // Estimate
          rewardsEarned: `${stats.total_rewards?.toFixed(2) || 0} SENT`,
          federatedRounds: stats.total_contributions || 0,
          privacyScore: Math.round((stats.average_privacy_score || 0) * 100),
        })

        // Fetch rewards timeline
        const timeline = await analyticsAPI.getRewardsTimeline(30)
        const timelineData = Object.entries(timeline.timeline || {}).map(([date, amount]: [string, any]) => ({
          name: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          rewards: amount,
        }))
        setRewardData(timelineData)

        // Process contributions for quality chart
        if (stats.contributions && stats.contributions.length > 0) {
          const qualityData = stats.contributions.slice(0, 7).map((contrib: any, idx: number) => ({
            name: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][idx] || `Day ${idx + 1}`,
            quality: Math.round((contrib.accuracy || 0) * 100),
          }))
          setContributionData(qualityData)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [publicKey])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      setUploadedFiles(acceptedFiles)
    },
    accept: {
      'application/json': ['.json'],
      'text/csv': ['.csv'],
      'application/octet-stream': ['.bin'],
    },
  })

  const handleStartTraining = async () => {
    if (!publicKey) return
    
    try {
      // Mock transaction - in real app, this would call your Solana program
      console.log('Starting training with files:', uploadedFiles)
      // Simulate transaction
      alert('Training job started! This would trigger a Solana transaction in production.')
      setUploadModalOpen(false)
      setUploadedFiles([])
    } catch (error) {
      console.error('Error starting training:', error)
    }
  }

  if (!publicKey) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <Card className="text-center max-w-md">
          <h2 className="text-2xl font-orbitron font-bold mb-4 text-gradient">
            Wallet Not Connected
          </h2>
          <p className="text-gray-400 mb-6">
            Please connect your wallet to view your contributor dashboard
          </p>
        </Card>
      </div>
    )
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
            Contributor Dashboard
          </h1>
          <p className="text-gray-400 font-mono text-sm">
            {publicKey.toString()}
          </p>
          <div className="flex gap-4 mt-2">
            <p className="text-cyber-cyan">
              Balance: {balance.toFixed(4)} SOL
            </p>
            <p className="text-cyber-purple">
              Tokens: {tokenBalance.toFixed(2)} SENT
            </p>
          </div>
          {loading && (
            <div className="flex items-center gap-2 text-gray-400 mt-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Loading on-chain data...</span>
            </div>
          )}
        </motion.div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Total Data</p>
                <p className="text-2xl font-orbitron font-bold text-cyber-cyan">
                  {metrics.totalDataContributed}
                </p>
              </div>
              <Database className="w-10 h-10 text-cyber-cyan" />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Rewards Earned</p>
                <p className="text-2xl font-orbitron font-bold text-cyber-purple">
                  {metrics.rewardsEarned}
                </p>
              </div>
              <Coins className="w-10 h-10 text-cyber-purple" />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Federated Rounds</p>
                <p className="text-2xl font-orbitron font-bold text-cyber-magenta">
                  {metrics.federatedRounds}
                </p>
              </div>
              <TrendingUp className="w-10 h-10 text-cyber-magenta" />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Privacy Score</p>
                <p className="text-2xl font-orbitron font-bold text-cyber-cyan">
                  {metrics.privacyScore}%
                </p>
              </div>
              <Shield className="w-10 h-10 text-cyber-cyan" />
            </div>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <h3 className="text-xl font-orbitron font-semibold mb-4 text-gradient">
              Reward Growth
            </h3>
            <Chart data={rewardData} type="area" dataKey="rewards" name="Rewards (SENT)" />
          </Card>

          <Card>
            <h3 className="text-xl font-orbitron font-semibold mb-4 text-gradient">
              Contribution Quality
            </h3>
            <Chart data={contributionData} type="line" dataKey="quality" name="Quality Score" color="#b026ff" />
          </Card>
        </div>

        {/* Actions */}
        <Card>
          <h3 className="text-xl font-orbitron font-semibold mb-4 text-gradient">
            Upload Data for Federated Training
          </h3>
          <p className="text-gray-400 mb-6">
            Upload your local data files to contribute to federated learning. Your data remains private and secure.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              variant="primary"
              onClick={() => setUploadModalOpen(true)}
              className="flex items-center gap-2"
            >
              <Upload className="w-5 h-5" />
              Upload Data
            </Button>
            <Button
              variant="secondary"
              onClick={handleStartTraining}
              disabled={uploadedFiles.length === 0}
            >
              Start Training
            </Button>
          </div>
        </Card>
      </div>

      {/* Upload Modal */}
      <Modal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        title="Upload Training Data"
      >
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-cyber-cyan bg-cyber-cyan/10'
              : 'border-cyber-cyan/30 hover:border-cyber-cyan/50'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="w-16 h-16 mx-auto mb-4 text-cyber-cyan" />
          {isDragActive ? (
            <p className="text-cyber-cyan font-space">Drop the files here...</p>
          ) : (
            <>
              <p className="text-gray-300 mb-2 font-space">
                Drag & drop files here, or click to select
              </p>
              <p className="text-gray-500 text-sm">
                Supported formats: JSON, CSV, Binary
              </p>
            </>
          )}
        </div>
        {uploadedFiles.length > 0 && (
          <div className="mt-4">
            <h4 className="font-orbitron font-semibold mb-2">Uploaded Files:</h4>
            <ul className="space-y-2">
              {uploadedFiles.map((file, index) => (
                <li key={index} className="text-sm text-gray-400 font-mono">
                  {file.name} ({(file.size / 1024).toFixed(2)} KB)
                </li>
              ))}
            </ul>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default ContributorDashboard

