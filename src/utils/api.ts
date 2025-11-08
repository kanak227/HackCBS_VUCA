const API_BASE_URL = 'http://localhost:8000'  // Backend API URL

// Real API client using fetch
export const api = {
  get: async (url: string) => {
    const response = await fetch(`${API_BASE_URL}${url}`)
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`)
    }
    return response.json()
  },
  post: async (url: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`)
    }
    return response.json()
  },
}

// Real API functions - connected to backend
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
  
  startTraining: async (sessionId: string, roundId: number) => {
    return await api.post(`/api/training/aggregate/${sessionId}/${roundId}`, {})
  },
  
  getContributorStats: async (walletAddress: string) => {
    return await api.get(`/api/contributors/stats/${walletAddress}`)
  },
  
  joinTraining: async (sessionId: string, contributorAddress: string) => {
    return await api.post('/api/training/join_training', {
      session_id: sessionId,
      contributor_address: contributorAddress,
    })
  },
  
  submitUpdate: async (data: {
    session_id: string
    round_id: number
    contributor_address: string
    gradient_hash: string
    commitment_hash: string
    nonce: string
    accuracy: number
    privacy_score: number
    encrypted_gradients: string
  }) => {
    return await api.post('/api/training/submit_update', data)
  },
}

export const trainerAPI = {
  deployModel: async (modelArchitecture: any, params: {
    trainerAddress: string
    rounds: number
    budgetPerContributor: number
    complexityLevel: string
  }) => {
    return await api.post('/api/training/register_model', {
      model_architecture: modelArchitecture,
      trainer_address: params.trainerAddress,
      total_rounds: params.rounds,
      reward_per_contributor: params.budgetPerContributor,
      min_contributors: 3,
      accuracy_threshold: 0.8,
    })
  },
  
  getTrainingStats: async (sessionId: string) => {
    return await api.get(`/api/training/sessions/${sessionId}`)
  },
  
  getOnchainSessions: async (trainerAddress?: string) => {
    const url = trainerAddress 
      ? `/api/training/sessions/onchain?trainer_address=${trainerAddress}`
      : '/api/training/sessions/onchain'
    return await api.get(url)
  },
  
  getSessionContributions: async (sessionId: string) => {
    return await api.get(`/api/training/sessions/${sessionId}/contributions`)
  },
}

export const rewardsAPI = {
  getTransactions: async (walletAddress: string) => {
    return await api.get(`/api/solana/transactions/${walletAddress}`)
  },
  
  claimRewards: async (sessionId: string, roundId: number) => {
    return await api.post('/api/rewards/distribute', {
      session_id: sessionId,
      round_id: roundId,
    })
  },
  
  getLeaderboard: async (type: 'accuracy' | 'rounds' | 'privacy' = 'accuracy') => {
    return await api.get(`/api/contributors/leaderboard?metric=${type}&limit=100`)
  },
  
  getContributorRewards: async (address: string) => {
    return await api.get(`/api/rewards/contributor/${address}`)
  },
  
  getRewardsLeaderboard: async () => {
    return await api.get('/api/rewards/leaderboard?limit=100')
  },
}

export const solanaAPI = {
  getBalance: async (address: string) => {
    return await api.get(`/api/solana/balance/${address}`)
  },
  
  getTokenBalance: async (address: string, tokenMint?: string) => {
    const url = tokenMint
      ? `/api/solana/token-balance/${address}?token_mint=${tokenMint}`
      : `/api/solana/token-balance/${address}`
    return await api.get(url)
  },
  
  getTransaction: async (txHash: string) => {
    return await api.get(`/api/solana/transaction/${txHash}`)
  },
  
  getAddressTransactions: async (address: string, limit: number = 50) => {
    return await api.get(`/api/solana/transactions/${address}?limit=${limit}`)
  },
}

export const analyticsAPI = {
  getDashboard: async () => {
    return await api.get('/api/analytics/dashboard')
  },
  
  getNetworkStats: async () => {
    return await api.get('/api/analytics/network-stats')
  },
  
  getRewardsTimeline: async (days: number = 30) => {
    return await api.get(`/api/analytics/rewards-timeline?days=${days}`)
  },
  
  getContributorActivity: async (address?: string, days: number = 30) => {
    const url = address
      ? `/api/analytics/contributor-activity?address=${address}&days=${days}`
      : `/api/analytics/contributor-activity?days=${days}`
    return await api.get(url)
  },
}
