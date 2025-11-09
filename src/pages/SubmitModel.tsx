import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useWallet } from '@solana/wallet-adapter-react'
import Card from '../components/Card'
import Button from '../components/Button'
import { challengesApi, submissionsApi } from '../utils/api'
import { ArrowLeft, Upload, CheckCircle } from 'lucide-react'

const SubmitModel = () => {
  const { challengeId } = useParams<{ challengeId: string }>()
  const { publicKey } = useWallet()
  const navigate = useNavigate()
  const [challenge, setChallenge] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [modelFile, setModelFile] = useState<File | null>(null)
  const [metadataFile, setMetadataFile] = useState<File | null>(null)
  const [modelIpfsHash, setModelIpfsHash] = useState('')
  const [metadataIpfsHash, setMetadataIpfsHash] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!publicKey) {
      navigate('/challenges')
      return
    }
    if (challengeId) {
      loadChallenge()
    }
  }, [challengeId, publicKey, navigate])

  const loadChallenge = async () => {
    if (!challengeId) return
    try {
      const data = await challengesApi.get(challengeId)
      setChallenge(data)
    } catch (error) {
      console.error('Error loading challenge:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleModelFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setModelFile(e.target.files[0])
    }
  }

  const handleMetadataFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setMetadataFile(e.target.files[0])
    }
  }

  const calculateFileHash = async (file: File): Promise<string> => {
    // Simplified hash calculation - in production, use proper IPFS upload
    const buffer = await file.arrayBuffer()
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    return hashHex
  }

  const handleSubmit = async () => {
    if (!challengeId || !publicKey) return

    try {
      setSubmitting(true)

      // Calculate file hashes (in production, upload to IPFS)
      let modelHash = ''

      if (modelFile) {
        modelHash = await calculateFileHash(modelFile)
      } else if (modelIpfsHash) {
        modelHash = modelIpfsHash
      }

      // Create submission
      await submissionsApi.create({
        challenge_id: challengeId,
        contributor_address: publicKey.toString(),
        model_ipfs_hash: modelIpfsHash || undefined,
        metadata_ipfs_hash: metadataIpfsHash || undefined,
        model_file_hash: modelHash || undefined,
      })

      setSuccess(true)
      
      // Redirect to challenge detail after a delay
      setTimeout(() => {
        navigate(`/challenges/${challengeId}`)
      }, 2000)
    } catch (error) {
      console.error('Error submitting model:', error)
      alert('Failed to submit model. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="text-cyber-cyan text-xl">Loading...</div>
      </div>
    )
  }

  if (!challenge) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <Card>
          <p className="text-gray-400">Challenge not found</p>
          <Link to="/challenges">
            <Button variant="primary" className="mt-4">Back to Challenges</Button>
          </Link>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="container mx-auto px-4 py-20">
        <Card className="text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-orbitron font-bold mb-2">Model Submitted!</h2>
          <p className="text-gray-400 mb-4">
            Your model has been submitted and is being evaluated.
          </p>
          <Link to={`/challenges/${challengeId}`}>
            <Button variant="primary">View Challenge</Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <Link to={`/challenges/${challengeId}`}>
        <Button variant="outline" className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Challenge
        </Button>
      </Link>

      <Card>
        <h1 className="text-3xl font-orbitron font-bold text-gradient mb-2">
          Submit Model
        </h1>
        <p className="text-gray-400 mb-6">{challenge.title}</p>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-2">
              Model File (or IPFS Hash)
            </label>
            <input
              type="file"
              onChange={handleModelFileChange}
              className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-cyber-cyan file:text-cyber-darker hover:file:bg-cyber-cyan/80"
            />
            <p className="text-xs text-gray-500 mt-2">
              Or enter IPFS hash if model is already uploaded
            </p>
            <input
              type="text"
              value={modelIpfsHash}
              onChange={(e) => setModelIpfsHash(e.target.value)}
              placeholder="Qm..."
              className="mt-2 w-full px-4 py-2 bg-cyber-darker border border-cyber-darker rounded text-white focus:outline-none focus:border-cyber-cyan"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              Metadata File (or IPFS Hash)
            </label>
            <input
              type="file"
              onChange={handleMetadataFileChange}
              className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-cyber-cyan file:text-cyber-darker hover:file:bg-cyber-cyan/80"
            />
            <p className="text-xs text-gray-500 mt-2">
              Or enter IPFS hash if metadata is already uploaded
            </p>
            <input
              type="text"
              value={metadataIpfsHash}
              onChange={(e) => setMetadataIpfsHash(e.target.value)}
              placeholder="Qm..."
              className="mt-2 w-full px-4 py-2 bg-cyber-darker border border-cyber-darker rounded text-white focus:outline-none focus:border-cyber-cyan"
            />
          </div>

          <div className="bg-cyber-darker p-4 rounded">
            <h3 className="text-sm font-semibold mb-2">Submission Requirements</h3>
            <ul className="text-xs text-gray-400 space-y-1">
              <li>• Model must improve upon baseline accuracy: {(challenge.baseline_accuracy * 100).toFixed(1)}%</li>
              <li>• Model will be evaluated using Gemini API</li>
              <li>• Reward: {challenge.reward_amount} SOL</li>
              <li>• Deadline: {new Date(challenge.deadline).toLocaleDateString()}</li>
            </ul>
          </div>

          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={submitting || (!modelFile && !modelIpfsHash)}
            className="w-full"
          >
            {submitting ? (
              'Submitting...'
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Submit Model
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  )
}

export default SubmitModel
