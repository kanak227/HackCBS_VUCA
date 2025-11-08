# Integration Guide - Frontend + Backend

## Overview

This guide explains how to integrate the React frontend with the FastAPI backend.

## Backend API Base URL

Update the frontend API configuration:

```typescript
// src/utils/api.ts
const API_BASE_URL = 'http://localhost:8000'  // Backend URL
```

## API Endpoints

### Training Endpoints

#### Register Model
```typescript
POST /api/training/register_model
Body: {
  model_architecture: object,
  trainer_address: string,
  total_rounds: number,
  min_contributors: number,
  reward_per_contributor: number,
  accuracy_threshold: number
}
```

#### Join Training
```typescript
POST /api/training/join_training
Body: {
  session_id: string,
  contributor_address: string
}
```

#### Submit Update
```typescript
POST /api/training/submit_update
Body: {
  session_id: string,
  round_id: number,
  contributor_address: string,
  gradient_hash: string,
  commitment_hash: string,
  nonce: string,
  accuracy: number,
  privacy_score: number,
  encrypted_gradients: string
}
```

#### Aggregate
```typescript
POST /api/training/aggregate/{session_id}/{round_id}
```

### Rewards Endpoints

#### Distribute Rewards
```typescript
POST /api/rewards/distribute
Body: {
  session_id: string,
  round_id: number
}
```

#### Get Contributor Rewards
```typescript
GET /api/rewards/contributor/{address}
```

#### Leaderboard
```typescript
GET /api/rewards/leaderboard?limit=100
```

### Solana Endpoints

#### Execute Transaction
```typescript
POST /api/solana/transaction
Body: {
  session_id: string,
  transaction_type: "register" | "contribute" | "reward",
  data: object
}
```

#### Get Balance
```typescript
GET /api/solana/balance/{address}
```

#### Get Token Balance
```typescript
GET /api/solana/token-balance/{address}
```

### Contributors Endpoints

#### Get Stats
```typescript
GET /api/contributors/stats/{address}
```

#### Leaderboard
```typescript
GET /api/contributors/leaderboard?metric=accuracy&limit=100
```

## Frontend Integration

### Update API Client

```typescript
// src/utils/api.ts
import { api } from './api'

export const contributorAPI = {
  uploadData: async (files: File[]) => {
    const formData = new FormData()
    files.forEach(file => formData.append('files', file))
    return await api.post('/training/upload', formData)
  },
  
  startTraining: async (sessionId: string) => {
    return await api.post(`/training/aggregate/${sessionId}/1`)
  },
  
  getContributorStats: async (walletAddress: string) => {
    return await api.get(`/contributors/stats/${walletAddress}`)
  },
}

export const trainerAPI = {
  deployModel: async (modelFile: File, params: {
    rounds: number
    budgetPerContributor: number
    complexityLevel: string
  }) => {
    // Read model architecture
    const modelArchitecture = await readModelArchitecture(modelFile)
    
    return await api.post('/training/register_model', {
      model_architecture: modelArchitecture,
      trainer_address: params.trainerAddress,
      total_rounds: params.rounds,
      reward_per_contributor: params.budgetPerContributor,
    })
  },
  
  getTrainingStats: async (sessionId: string) => {
    return await api.get(`/training/sessions/${sessionId}`)
  },
}

export const rewardsAPI = {
  getTransactions: async (walletAddress: string) => {
    return await api.get(`/rewards/contributor/${walletAddress}`)
  },
  
  claimRewards: async (walletAddress: string) => {
    return await api.post('/rewards/distribute', {
      session_id: 'session-id',
      round_id: 1
    })
  },
  
  getLeaderboard: async (type: 'accuracy' | 'rounds' | 'privacy') => {
    return await api.get(`/contributors/leaderboard?metric=${type}`)
  },
}
```

## CORS Configuration

The backend is configured to accept requests from:
- `http://localhost:3000` (React dev server)
- `http://localhost:5173` (Vite dev server)

Update `CORS_ORIGINS` in `backend/app/core/config.py` for production.

## Environment Setup

### Backend (.env)
```env
DATABASE_URL=postgresql://user:password@localhost:5432/sentinel_db
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_PRIVATE_KEY=your_private_key
PROGRAM_ID=your_program_id
API_HOST=0.0.0.0
API_PORT=8000
```

### Frontend
Update `src/utils/api.ts` with the backend URL.

## Testing Integration

1. **Start Backend:**
```bash
cd backend
uvicorn main:app --reload
```

2. **Start Frontend:**
```bash
npm run dev
```

3. **Test API:**
- Visit http://localhost:8000/docs for API documentation
- Test endpoints from the frontend
- Check browser console for errors

## Error Handling

Handle API errors in the frontend:

```typescript
try {
  const response = await api.post('/training/register_model', data)
  // Handle success
} catch (error) {
  if (error.response) {
    // API error
    console.error('API Error:', error.response.data)
  } else {
    // Network error
    console.error('Network Error:', error.message)
  }
}
```

## WebSocket Support (Future)

For real-time updates, consider adding WebSocket support:

```python
# backend/app/api/websocket.py
from fastapi import WebSocket

@app.websocket("/ws/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    await websocket.accept()
    # Send real-time updates
```

## Production Deployment

1. **Backend:**
   - Use gunicorn with uvicorn workers
   - Set up reverse proxy (nginx)
   - Enable HTTPS
   - Configure CORS for production domain

2. **Frontend:**
   - Update API_BASE_URL to production backend
   - Build for production: `npm run build`
   - Deploy to CDN or static hosting

## Monitoring

- Monitor API endpoints
- Track error rates
- Monitor database performance
- Track Solana transaction success rates

## Security Considerations

- Use HTTPS in production
- Validate all inputs
- Implement rate limiting
- Use authentication tokens
- Encrypt sensitive data
- Validate Solana transactions

