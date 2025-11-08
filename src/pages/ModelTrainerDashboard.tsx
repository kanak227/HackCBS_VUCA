import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useWallet } from '@solana/wallet-adapter-react'
import Card from '../components/Card'
import Chart from '../components/Chart'
import Button from '../components/Button'
import Modal from '../components/Modal'
import { Upload, Settings, Users, TrendingUp, Coins, Loader2 } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { trainerAPI, analyticsAPI } from '../utils/api'

const ModelTrainerDashboard = () => {
  const { publicKey } = useWallet()
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [trainingParams, setTrainingParams] = useState({
    rounds: 10,
    budgetPerContributor: 100,
    complexityLevel: 'medium',
  })
  const [modelFile, setModelFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [sessions, setSessions] = useState<any[]>([])
  const [selectedSession, setSelectedSession] = useState<any>(null)
  const [stats, setStats] = useState({
    activeContributors: 0,
    accuracy: 0,
    totalRewardsDistributed: '0 SENT',
    currentRound: 0,
  })
  const [accuracyData, setAccuracyData] = useState<any[]>([])
  const [rewardDistributionData, setRewardDistributionData] = useState<any[]>([])

  // Fetch real training sessions
  useEffect(() => {
    const fetchSessions = async () => {
      if (!publicKey) return
      
      try {
        setLoading(true)
        const address = publicKey.toString()
        const onchainSessions = await trainerAPI.getOnchainSessions(address)
        setSessions(onchainSessions.sessions || [])
        
        // Get network stats
        const networkStats = await analyticsAPI.getNetworkStats()
        setStats({
          activeContributors: networkStats.unique_contributors || 0,
          accuracy: 0, // Would need to calculate from contributions
          totalRewardsDistributed: `${networkStats.total_rewards_distributed?.toFixed(2) || 0} SENT`,
          currentRound: 0,
        })
      } catch (error) {
        console.error('Error fetching sessions:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSessions()
    const interval = setInterval(fetchSessions, 30000)
    return () => clearInterval(interval)
  }, [publicKey])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setModelFile(acceptedFiles[0])
      }
    },
    accept: {
      'application/octet-stream': ['.h5', '.pt', '.onnx'],
      'application/json': ['.json'],
    },
    multiple: false,
  })

  const handleDeployTraining = async () => {
    if (!publicKey || !modelFile) return

    try {
      setLoading(true)
      
      // Read model architecture (simplified - would parse actual model file)
      const modelArchitecture = {
        type: trainingParams.complexityLevel,
        layers: [],
        // In production, parse actual model file
      }
      
      // Deploy via real API - this will create a real Solana transaction
      const result = await trainerAPI.deployModel(modelArchitecture, {
        trainerAddress: publicKey.toString(),
        rounds: trainingParams.rounds,
        budgetPerContributor: trainingParams.budgetPerContributor,
        complexityLevel: trainingParams.complexityLevel,
      })
      
      alert(`Training job deployed! Session ID: ${result.session_id}\nTransaction: ${result.solana_tx_hash || 'Pending'}`)
      setUploadModalOpen(false)
      setModelFile(null)
      
      // Refresh sessions
      const onchainSessions = await trainerAPI.getOnchainSessions(publicKey.toString())
      setSessions(onchainSessions.sessions || [])
    } catch (error: any) {
      console.error('Error deploying training:', error)
      alert(`Error deploying training: ${error.message || 'Unknown error'}`)
    } finally {
      setLoading(false)
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
            Please connect your wallet to deploy model training jobs
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
            Model Trainer Dashboard
          </h1>
          <p className="text-gray-400">
            Deploy and manage your AI model training jobs on the Sentinel.ai network
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Active Contributors</p>
                <p className="text-2xl font-orbitron font-bold text-cyber-cyan">
                  {stats.activeContributors}
                </p>
              </div>
              <Users className="w-10 h-10 text-cyber-cyan" />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Accuracy</p>
                <p className="text-2xl font-orbitron font-bold text-cyber-purple">
                  {stats.accuracy}%
                </p>
              </div>
              <TrendingUp className="w-10 h-10 text-cyber-purple" />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Rewards Distributed</p>
                <p className="text-2xl font-orbitron font-bold text-cyber-magenta">
                  {stats.totalRewardsDistributed}
                </p>
              </div>
              <Coins className="w-10 h-10 text-cyber-magenta" />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Current Round</p>
                <p className="text-2xl font-orbitron font-bold text-cyber-cyan">
                  {stats.currentRound}/{trainingParams.rounds}
                </p>
              </div>
              <Settings className="w-10 h-10 text-cyber-cyan" />
            </div>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <h3 className="text-xl font-orbitron font-semibold mb-4 text-gradient">
              Accuracy Progress
            </h3>
            <Chart data={accuracyData} type="line" dataKey="accuracy" name="Accuracy %" />
          </Card>

          <Card>
            <h3 className="text-xl font-orbitron font-semibold mb-4 text-gradient">
              Reward Distribution
            </h3>
            <Chart data={rewardDistributionData} type="bar" dataKey="rewards" name="Rewards (SENT)" color="#b026ff" />
          </Card>
        </div>

        {/* Deploy Model */}
        <Card>
          <h3 className="text-xl font-orbitron font-semibold mb-4 text-gradient">
            Deploy New Training Job
          </h3>
          <p className="text-gray-400 mb-6">
            Upload your ML model architecture and configure training parameters to start a federated learning job.
          </p>
          <Button
            variant="primary"
            onClick={() => setUploadModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Upload className="w-5 h-5" />
            Upload Model & Deploy
          </Button>
        </Card>
      </div>

      {/* Deploy Modal */}
      <Modal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        title="Deploy Model Training Job"
      >
        <div className="space-y-6">
          {/* Model Upload */}
          <div>
            <label className="block text-sm font-orbitron font-semibold mb-2">
              Model Architecture File
            </label>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? 'border-cyber-cyan bg-cyber-cyan/10'
                  : 'border-cyber-cyan/30 hover:border-cyber-cyan/50'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="w-12 h-12 mx-auto mb-3 text-cyber-cyan" />
              {isDragActive ? (
                <p className="text-cyber-cyan">Drop the file here...</p>
              ) : (
                <>
                  <p className="text-gray-300 mb-1">
                    {modelFile ? modelFile.name : 'Drag & drop or click to select'}
                  </p>
                  <p className="text-gray-500 text-sm">
                    Supported: .h5, .pt, .onnx
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Training Parameters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-orbitron font-semibold mb-2">
                Number of Rounds
              </label>
              <input
                type="number"
                value={trainingParams.rounds}
                onChange={(e) => setTrainingParams({ ...trainingParams, rounds: parseInt(e.target.value) })}
                className="w-full px-4 py-2 bg-cyber-dark border border-cyber-cyan/30 rounded-lg text-white focus:outline-none focus:border-cyber-cyan"
                min="1"
                max="100"
              />
            </div>

            <div>
              <label className="block text-sm font-orbitron font-semibold mb-2">
                Budget per Contributor (SENT)
              </label>
              <input
                type="number"
                value={trainingParams.budgetPerContributor}
                onChange={(e) => setTrainingParams({ ...trainingParams, budgetPerContributor: parseInt(e.target.value) })}
                className="w-full px-4 py-2 bg-cyber-dark border border-cyber-cyan/30 rounded-lg text-white focus:outline-none focus:border-cyber-cyan"
                min="1"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-orbitron font-semibold mb-2">
                Model Complexity Level
              </label>
              <select
                value={trainingParams.complexityLevel}
                onChange={(e) => setTrainingParams({ ...trainingParams, complexityLevel: e.target.value })}
                className="w-full px-4 py-2 bg-cyber-dark border border-cyber-cyan/30 rounded-lg text-white focus:outline-none focus:border-cyber-cyan"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <Button
            variant="primary"
            onClick={handleDeployTraining}
            disabled={!modelFile}
            className="w-full"
          >
            Deploy Training Job
          </Button>
        </div>
      </Modal>
    </div>
  )
}

export default ModelTrainerDashboard

