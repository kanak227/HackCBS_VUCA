import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useWallet } from '@solana/wallet-adapter-react'
import Button from '../components/Button'
import Card from '../components/Card'
import NeuralNetwork3D from '../components/NeuralNetwork3D'
import { Shield, Zap, Coins, Brain } from 'lucide-react'

const Landing = () => {
  const { publicKey } = useWallet()

  const features = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Privacy-Preserving Training',
      description: 'Your data stays private while contributing to AI model training through federated learning.',
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Blockchain-Secured',
      description: 'All transactions and model updates are verified on the Solana blockchain for maximum security.',
    },
    {
      icon: <Coins className="w-8 h-8" />,
      title: 'Reward Token Incentives',
      description: 'Earn crypto rewards for contributing data and computational resources to train AI models.',
    },
    {
      icon: <Brain className="w-8 h-8" />,
      title: 'Decentralized Network',
      description: 'Join a global network of contributors working together to build better AI models.',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-dark">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <NeuralNetwork3D />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-cyber-darker/50 to-cyber-darker z-10" />
        
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-20 text-center px-4"
        >
          <h1 className="text-6xl md:text-8xl font-orbitron font-bold mb-6 text-gradient">
            Sentinel.ai
          </h1>
          <p className="text-2xl md:text-3xl font-space text-gray-300 mb-8">
            Train AI Models Securely. Earn Rewards. Powered by Solana.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {!publicKey ? (
              <Button variant="primary" className="text-lg px-8 py-4">
                Connect Wallet
              </Button>
            ) : (
              <Link to="/contributor">
                <Button variant="primary" className="text-lg px-8 py-4">
                  Start Contributing
                </Button>
              </Link>
            )}
            <Link to="/trainer">
              <Button variant="outline" className="text-lg px-8 py-4">
                Train a Model
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-4xl font-orbitron font-bold text-center mb-12 text-gradient"
        >
          Why Choose Sentinel.ai?
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

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="cyber-card text-center max-w-3xl mx-auto"
        >
          <h2 className="text-4xl font-orbitron font-bold mb-4 text-gradient">
            Ready to Start?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of contributors training the next generation of AI models
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contributor">
              <Button variant="primary" className="text-lg px-8 py-4">
                Become a Contributor
              </Button>
            </Link>
            <Link to="/trainer">
              <Button variant="secondary" className="text-lg px-8 py-4">
                Deploy a Model
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  )
}

export default Landing

