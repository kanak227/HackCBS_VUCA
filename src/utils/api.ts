const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export interface Challenge {
  id: number
  challenge_id: string
  title: string
  description: string
  company_name: string
  creator_address: string
  baseline_model_hash: string
  baseline_accuracy: number
  reward_amount: number
  reward_token_mint: string | null
  deadline: string
  status: string
  total_submissions: number
  approved_submissions: number
  solana_tx_hash: string | null
  created_at: string
}

export interface Submission {
  id: number
  challenge_id: number | string
  contributor_address: string
  model_hash: string
  model_ipfs_hash: string | null
  metadata_ipfs_hash: string | null
  accuracy: number | null
  status: string
  submitted_at: string
  approved_at: string | null
  rejected_at: string | null
  rejection_reason: string | null
  solana_tx_hash: string | null
  reward_tx_hash: string | null
  reward_amount: number
}

export interface LeaderboardEntry {
  contributor_address: string
  total_approved: number
  total_rejected: number
  total_rewards: number
  rank: number
  reputation_score: number
}

// Challenges API
export const challengesApi = {
  list: async (status?: string): Promise<{ challenges: Challenge[]; total: number }> => {
    const params = new URLSearchParams()
    if (status) params.append('status_filter', status)
    // Add cache-busting to ensure fresh data
    params.append('_t', Date.now().toString())
    const response = await fetch(`${API_BASE_URL}/api/challenges?${params}`)
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Failed to fetch challenges:', response.status, errorText)
      throw new Error(`Failed to fetch challenges: ${response.status}`)
    }
    return response.json()
  },

  get: async (challengeId: string): Promise<Challenge> => {
    const response = await fetch(`${API_BASE_URL}/api/challenges/${challengeId}`)
    if (!response.ok) throw new Error('Failed to fetch challenge')
    return response.json()
  },

  create: async (challenge: {
    title: string
    description: string
    company_name: string
    creator_address: string
    baseline_model_hash: string
    baseline_accuracy: number
    reward_amount: number
    reward_token_mint?: string
    deadline: string
  }): Promise<Challenge> => {
    const response = await fetch(`${API_BASE_URL}/api/challenges/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(challenge),
    })
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMessage = errorData.detail || errorData.message || `Failed to create challenge: ${response.status} ${response.statusText}`
      const error = new Error(errorMessage)
      ;(error as any).response = { data: errorData, status: response.status }
      throw error
    }
    return response.json()
  },

  getSubmissions: async (challengeId: string): Promise<{ submissions: Submission[]; total: number }> => {
    const response = await fetch(`${API_BASE_URL}/api/challenges/${challengeId}/submissions`)
    if (!response.ok) throw new Error('Failed to fetch submissions')
    return response.json()
  },
}

// Submissions API
export const submissionsApi = {
  list: async (params?: {
    challenge_id?: string
    contributor_address?: string
    status_filter?: string
    include_challenge?: boolean
  }): Promise<Submission[]> => {
    const queryParams = new URLSearchParams()
    if (params?.challenge_id) queryParams.append('challenge_id', params.challenge_id)
    if (params?.contributor_address) queryParams.append('contributor_address', params.contributor_address)
    if (params?.status_filter) queryParams.append('status_filter', params.status_filter)
    if (params?.include_challenge) queryParams.append('include_challenge', 'true')
    
    const response = await fetch(`${API_BASE_URL}/api/submissions?${queryParams}`)
    if (!response.ok) throw new Error('Failed to fetch submissions')
    return response.json()
  },

  get: async (submissionId: number): Promise<Submission> => {
    const response = await fetch(`${API_BASE_URL}/api/submissions/${submissionId}`)
    if (!response.ok) throw new Error('Failed to fetch submission')
    return response.json()
  },

  create: async (submission: {
    challenge_id: string
    contributor_address: string
    model_ipfs_hash?: string
    metadata_ipfs_hash?: string
    model_file_hash?: string
  }): Promise<Submission> => {
    const response = await fetch(`${API_BASE_URL}/api/submissions/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submission),
    })
    if (!response.ok) throw new Error('Failed to create submission')
    return response.json()
  },
}

// Admin API
export const adminApi = {
  approve: async (submissionId: number, moderatorAddress: string, rewardTxHash?: string): Promise<{
    message: string
    submission_id: number
    reward_tx_hash: string | null
    reward_amount: number
  }> => {
    const response = await fetch(`${API_BASE_URL}/api/admin/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        submission_id: submissionId, 
        moderator_address: moderatorAddress,
        reward_tx_hash: rewardTxHash,
      }),
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to approve submission')
    }
    return response.json()
  },

  reject: async (submissionId: number, moderatorAddress: string, reason: string): Promise<{
    message: string
    submission_id: number
    reason: string
  }> => {
    const response = await fetch(`${API_BASE_URL}/api/admin/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ submission_id: submissionId, moderator_address: moderatorAddress, reason }),
    })
    if (!response.ok) throw new Error('Failed to reject submission')
    return response.json()
  },
}

// Leaderboard API
export const leaderboardApi = {
  get: async (skip = 0, limit = 100): Promise<{ entries: LeaderboardEntry[]; total: number }> => {
    const response = await fetch(`${API_BASE_URL}/api/leaderboard?skip=${skip}&limit=${limit}`)
    if (!response.ok) throw new Error('Failed to fetch leaderboard')
    return response.json()
  },

  getContributor: async (contributorAddress: string): Promise<{
    contributor_address: string
    total_approved: number
    total_rejected: number
    total_rewards: number
    rank: number
    reputation_score: number
  }> => {
    const response = await fetch(`${API_BASE_URL}/api/leaderboard/contributor/${contributorAddress}`)
    if (!response.ok) throw new Error('Failed to fetch contributor stats')
    return response.json()
  },
}

// Legacy API exports (for old pages that haven't been updated)
export const contributorAPI = {
  uploadData: async (files: File[]) => {
    const formData = new FormData()
    files.forEach(file => formData.append('files', file))
    const response = await fetch(`${API_BASE_URL}/api/training/upload`, {
      method: 'POST',
      body: formData,
    })
    if (!response.ok) throw new Error('Upload failed')
    return response.json()
  },
  
  getContributorStats: async (walletAddress: string) => {
    return await fetch(`${API_BASE_URL}/api/contributors/stats/${walletAddress}`).then(r => r.json())
  },
}

export const trainerAPI = {
  deployModel: async (modelArchitecture: any, params: any) => {
    return await fetch(`${API_BASE_URL}/api/training/register_model`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model_architecture: modelArchitecture,
        trainer_address: params.trainerAddress,
        total_rounds: params.rounds,
        reward_per_contributor: params.budgetPerContributor,
      }),
    }).then(r => r.json())
  },
  
  getTrainingStats: async (sessionId: string) => {
    return await fetch(`${API_BASE_URL}/api/training/sessions/${sessionId}`).then(r => r.json())
  },
}

export const rewardsAPI = {
  getTransactions: async (walletAddress: string) => {
    return await fetch(`${API_BASE_URL}/api/solana/transactions/${walletAddress}`).then(r => r.json())
  },
  
  getLeaderboard: async () => {
    return await fetch(`${API_BASE_URL}/api/rewards/leaderboard?limit=100`).then(r => r.json())
  },
}

export const solanaAPI = {
  getBalance: async (address: string) => {
    return await fetch(`${API_BASE_URL}/api/solana/balance/${address}`).then(r => r.json())
  },
  
  getTokenBalance: async (address: string) => {
    return await fetch(`${API_BASE_URL}/api/solana/token-balance/${address}`).then(r => r.json())
  },
}

export const analyticsAPI = {
  getDashboard: async () => {
    return await fetch(`${API_BASE_URL}/api/analytics/dashboard`).then(r => r.json())
  },
  
  getNetworkStats: async () => {
    return await fetch(`${API_BASE_URL}/api/analytics/network-stats`).then(r => r.json())
  },
}