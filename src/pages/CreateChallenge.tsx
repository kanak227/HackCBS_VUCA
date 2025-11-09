import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import Card from '../components/Card'
import Button from '../components/Button'
import { challengesApi } from '../utils/api'
import { Plus, Calendar, Coins, Target, FileText } from 'lucide-react'

const CreateChallenge = () => {
  const { publicKey } = useWallet()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    company_name: '',
    baseline_model_hash: '',
    baseline_accuracy: 0.85,
    reward_amount: 0.05,
    reward_token_mint: '',
    deadline: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Prevent double submission
    if (loading) {
      return
    }
    
    if (!publicKey) {
      alert('Please connect your wallet first')
      return
    }

    if (!formData.deadline) {
      alert('Please select a deadline')
      return
    }

    // Validate reward amount
    const rewardAmount = typeof formData.reward_amount === 'number' ? formData.reward_amount : parseFloat(String(formData.reward_amount)) || 0
    
    if (rewardAmount > 0.05) {
      alert('Reward amount cannot exceed 0.05 SOL. Please enter a value between 0.01 and 0.05 SOL.')
      return
    }

    if (rewardAmount < 0.01) {
      alert('Reward amount must be at least 0.01 SOL.')
      return
    }

    try {
      setLoading(true)
      
      const challenge = await challengesApi.create({
        title: formData.title,
        description: formData.description,
        company_name: formData.company_name,
        creator_address: publicKey.toString(),
        baseline_model_hash: formData.baseline_model_hash,
        baseline_accuracy: typeof formData.baseline_accuracy === 'number' ? formData.baseline_accuracy : parseFloat(String(formData.baseline_accuracy)) || 0.85,
        reward_amount: rewardAmount,
        reward_token_mint: formData.reward_token_mint || undefined,
        deadline: new Date(formData.deadline).toISOString(),
      })

      alert(`Challenge created successfully!\nChallenge ID: ${challenge.challenge_id}`)
      navigate('/moderator')
    } catch (error: any) {
      console.error('Error creating challenge:', error)
      const errorMessage = error?.response?.data?.detail || error?.message || 'Unknown error occurred'
      alert(`Error creating challenge: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    let processedValue: string | number = value
    
    if (name === 'baseline_accuracy' || name === 'reward_amount') {
      // Handle empty string
      if (value === '' || value === '.') {
        processedValue = name === 'reward_amount' ? 0.05 : 0.85
      } else {
        const numValue = parseFloat(value)
        if (isNaN(numValue)) {
          // Keep current value if invalid
          return
        }
        
        // Clamp reward amount to max 0.05 and min 0.01
        if (name === 'reward_amount') {
          if (numValue > 0.05) {
            processedValue = 0.05
          } else if (numValue < 0.01 && numValue > 0) {
            processedValue = 0.01
          } else {
            processedValue = numValue
          }
        } else {
          // Clamp baseline accuracy to 0-1
          if (numValue > 1) {
            processedValue = 1
          } else if (numValue < 0) {
            processedValue = 0
          } else {
            processedValue = numValue
          }
        }
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }))
  }

  // Set minimum date to today
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto"
      >
        <div className="mb-8">
          <h1 className="text-4xl font-orbitron font-bold mb-2 bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
            Create New Challenge
          </h1>
          <p className="text-gray-400">
            Create a new AI fine-tuning challenge for contributors to participate in.
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {/* Title */}
            <div>
              <label className="block text-sm font-space font-medium text-gray-300 mb-2">
                Challenge Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-cyber-dark border border-gray-700 rounded-lg text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-colors"
                placeholder="e.g., Improve Image Classification Accuracy"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-space font-medium text-gray-300 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={5}
                className="w-full px-4 py-3 bg-cyber-dark border border-gray-700 rounded-lg text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-colors resize-none"
                placeholder="Describe the challenge, requirements, dataset, and evaluation criteria..."
              />
            </div>

            {/* Company Name */}
            <div>
              <label className="block text-sm font-space font-medium text-gray-300 mb-2">
                Company/Organization Name *
              </label>
              <input
                type="text"
                name="company_name"
                value={formData.company_name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-cyber-dark border border-gray-700 rounded-lg text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-colors"
                placeholder="e.g., TechCorp AI"
              />
            </div>

            {/* Baseline Model Hash */}
            <div>
              <label className="block text-sm font-space font-medium text-gray-300 mb-2">
                Baseline Model Hash *
              </label>
              <input
                type="text"
                name="baseline_model_hash"
                value={formData.baseline_model_hash}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-cyber-dark border border-gray-700 rounded-lg text-white font-mono text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-colors"
                placeholder="Hash of the baseline model"
              />
            </div>

            {/* Baseline Accuracy */}
            <div>
              <label className="block text-sm font-space font-medium text-gray-300 mb-2">
                Baseline Accuracy * (0.0 - 1.0)
              </label>
              <input
                type="number"
                name="baseline_accuracy"
                value={formData.baseline_accuracy}
                onChange={handleChange}
                required
                min="0"
                max="1"
                step="0.01"
                className="w-full px-4 py-3 bg-cyber-dark border border-gray-700 rounded-lg text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-colors"
                placeholder="0.85"
              />
            </div>

            {/* Reward Amount */}
            <div>
              <label className="block text-sm font-space font-medium text-gray-300 mb-2">
                Reward Amount (SOL) * (Max: 0.05 SOL)
              </label>
              <input
                type="number"
                name="reward_amount"
                value={formData.reward_amount}
                onChange={handleChange}
                required
                min="0.01"
                max="0.05"
                step="0.01"
                className="w-full px-4 py-3 bg-cyber-dark border border-gray-700 rounded-lg text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-colors"
                placeholder="0.05"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter amount between 0.01 and 0.05 SOL (maximum allowed)
              </p>
            </div>

            {/* Reward Token Mint (Optional) */}
            <div>
              <label className="block text-sm font-space font-medium text-gray-300 mb-2">
                Reward Token Mint (Optional)
              </label>
              <input
                type="text"
                name="reward_token_mint"
                value={formData.reward_token_mint}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-cyber-dark border border-gray-700 rounded-lg text-white font-mono text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-colors"
                placeholder="SPL token mint address (leave empty for SOL)"
              />
            </div>

            {/* Deadline */}
            <div>
              <label className="block text-sm font-space font-medium text-gray-300 mb-2">
                Deadline *
              </label>
              <input
                type="datetime-local"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                required
                min={today}
                className="w-full px-4 py-3 bg-cyber-dark border border-gray-700 rounded-lg text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-colors"
              />
            </div>

            {/* Info Box */}
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <p className="text-sm text-red-400">
                💡 <strong>Note:</strong> Contributors can submit multiple models to this challenge. Each submission will be evaluated independently, and rewards will be distributed to approved submissions.
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <Button
                type="submit"
                variant="primary"
                disabled={loading || !formData.title.trim() || !formData.description.trim() || !formData.company_name.trim() || !formData.baseline_model_hash.trim() || !formData.deadline}
                className="flex-1 !bg-gradient-to-r !from-red-500 !to-orange-500 hover:!from-red-600 hover:!to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Creating Challenge...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2 inline" />
                    Create Challenge
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/moderator')}
                className="!border-red-500 !text-red-400 hover:!bg-red-500/10"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </motion.div>
    </div>
  )
}

export default CreateChallenge

