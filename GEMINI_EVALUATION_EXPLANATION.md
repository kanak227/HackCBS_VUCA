# Gemini API Evaluation - Current Implementation & Issues

## 🔍 Current Implementation

### What Users Upload:
1. **Model File** (e.g., `.h5`, `.pt`, `.onnx`, `.pkl`) - OR IPFS hash
2. **Metadata File** (JSON with model info) - OR IPFS hash

### What Happens:
1. User uploads files on frontend (`SubmitModel.tsx`)
2. Frontend calculates SHA-256 hash of files
3. **Only the hash is sent to backend** (files are NOT uploaded)
4. Backend receives hash and calls Gemini API
5. Gemini receives: `challenge_id`, `model_hash`, `baseline_accuracy`, `metadata_hash`
6. **Gemini cannot actually evaluate the model** - it only gets text/hashes
7. System falls back to **mock evaluation** (generates random metrics)

## ❌ The Problem

**Gemini API is a text/LLM API** - it cannot:
- Load actual ML model files
- Run inference on test datasets
- Calculate real accuracy/precision/recall metrics
- Evaluate model performance

**Current flow is broken:**
```
User uploads model file → Hash calculated → Only hash sent to backend → 
Gemini gets hash (text) → Cannot evaluate → Uses mock results
```

## ✅ What's Needed for Real Evaluation

### Option 1: Use Actual ML Evaluation Framework
1. **Upload files to IPFS/storage** (not just hash)
2. **Download model from IPFS** on backend
3. **Load model** using appropriate framework (TensorFlow, PyTorch, etc.)
4. **Load test dataset** for the challenge
5. **Run inference** on test set
6. **Calculate real metrics** (accuracy, precision, recall, F1)
7. Store results in database

### Option 2: Use Gemini for Metadata Analysis Only
- Use Gemini to analyze model metadata (architecture, hyperparameters)
- Provide recommendations/insights
- But still need real ML framework for actual evaluation

### Option 3: Hybrid Approach
- Use real ML framework for metrics calculation
- Use Gemini to generate evaluation reports/insights
- Combine both for comprehensive evaluation

## 📊 What Users Get from Challenges

### Rewards:
- **SOL tokens** (if submission approved)
- Amount specified in challenge (e.g., 1.0 SOL)

### Reputation:
- **Reputation score** increases with approved submissions
- **Leaderboard ranking** based on total rewards/approvals
- **Total approved/rejected** counts

### Evaluation Results:
- **Accuracy** (currently mock)
- **Precision** (currently mock)
- **Recall** (currently mock)
- **F1 Score** (currently mock)
- **Loss** (currently mock)
- **Evaluation report** (currently mock)

## 🔧 Recommended Fix

### For Production:
1. **Implement file upload to IPFS** (Pinata, Web3.Storage, etc.)
2. **Store IPFS hash** in database
3. **Create evaluation service** that:
   - Downloads model from IPFS
   - Loads appropriate ML framework
   - Runs on challenge test dataset
   - Calculates real metrics
4. **Use Gemini optionally** for:
   - Generating evaluation reports
   - Analyzing model architecture
   - Providing insights

### Current Workaround:
- System uses **mock evaluation** which generates realistic-looking metrics
- Works for testing/demo purposes
- Not suitable for production

## 📝 Code Locations

- **Frontend Upload**: `src/pages/SubmitModel.tsx`
- **Backend Submission**: `backend/app/api/submissions.py` (line 122)
- **Gemini Service**: `backend/app/services/gemini_service.py`
- **Mock Evaluation**: `backend/app/services/gemini_service.py` (line 151)

