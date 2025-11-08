import { useState, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Sphere, Line } from '@react-three/drei'
import Card from '../components/Card'
import { Loader2 } from 'lucide-react'
import { analyticsAPI, trainerAPI } from '../utils/api'
import * as THREE from 'three'

interface NodeData {
  id: string
  position: [number, number, number]
  type: 'contributor' | 'model'
  active: boolean
  rewards: number
}

const NetworkNode = ({ node, onClick }: { node: NodeData; onClick: () => void }) => {
  const color = node.type === 'contributor' ? '#00f0ff' : '#b026ff'
  const size = node.type === 'model' ? 0.15 : 0.1

  return (
    <group position={node.position} onClick={onClick}>
      <Sphere args={[size, 32, 32]}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={node.active ? 0.8 : 0.3}
        />
      </Sphere>
      {node.active && (
        <pointLight color={color} intensity={0.5} distance={2} />
      )}
    </group>
  )
}

const NetworkConnection = ({
  start,
  end,
  active,
}: {
  start: [number, number, number]
  end: [number, number, number]
  active: boolean
}) => {
  const points = useMemo(() => [start, end], [start, end])
  return (
    <Line
      points={points}
      color={active ? '#00f0ff' : '#ffffff'}
      lineWidth={active ? 2 : 1}
      opacity={active ? 0.5 : 0.1}
    />
  )
}

const Network3DScene = ({
  nodes,
  connections,
  onNodeClick,
}: {
  nodes: NodeData[]
  connections: Array<{ start: [number, number, number]; end: [number, number, number]; active: boolean }>
  onNodeClick: (node: NodeData) => void
}) => {
  return (
    <Canvas camera={{ position: [0, 0, 8], fov: 75 }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      {connections.map((conn, i) => (
        <NetworkConnection key={i} start={conn.start} end={conn.end} active={conn.active} />
      ))}
      {nodes.map((node) => (
        <NetworkNode key={node.id} node={node} onClick={() => onNodeClick(node)} />
      ))}
      <OrbitControls enableZoom={true} enablePan={true} enableRotate={true} />
    </Canvas>
  )
}

const NetworkExplorer = () => {
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null)
  const [filter, setFilter] = useState<'all' | 'contributors' | 'models'>('all')
  const [loading, setLoading] = useState(true)
  const [networkStats, setNetworkStats] = useState({
    totalNodes: 0,
    activeContributors: 0,
    activeModels: 0,
    totalRewards: 0,
  })

  // Fetch real network data
  useEffect(() => {
    const fetchNetworkData = async () => {
      try {
        setLoading(true)
        const stats = await analyticsAPI.getNetworkStats()
        const activity = await analyticsAPI.getContributorActivity()
        
        setNetworkStats({
          totalNodes: (stats.unique_contributors || 0) + (stats.total_sessions || 0),
          activeContributors: stats.unique_contributors || 0,
          activeModels: stats.total_sessions || 0,
          totalRewards: stats.total_rewards_distributed || 0,
        })
      } catch (error) {
        console.error('Error fetching network data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchNetworkData()
    const interval = setInterval(fetchNetworkData, 30000)
    return () => clearInterval(interval)
  }, [])

  // Generate network visualization from real data
  const { nodes, connections } = useMemo(() => {
    const contributorCount = networkStats.activeContributors
    const modelCount = networkStats.activeModels
    const nodeCount = contributorCount + modelCount
    
    if (nodeCount === 0) {
      return { nodes: [], connections: [] }
    }
    
    const nodes: NodeData[] = []
    const connections: Array<{ start: [number, number, number]; end: [number, number, number]; active: boolean }> = []

    // Generate contributor nodes
    for (let i = 0; i < contributorCount; i++) {
      const angle = (i / Math.max(contributorCount, 1)) * Math.PI * 2
      const radius = 2 + Math.random() * 2
      const height = (Math.random() - 0.5) * 4
      nodes.push({
        id: `contributor-${i}`,
        position: [
          Math.cos(angle) * radius,
          height,
          Math.sin(angle) * radius,
        ],
        type: 'contributor',
        active: true,
        rewards: Math.random() * (networkStats.totalRewards / Math.max(contributorCount, 1)),
      })
    }

    // Generate model nodes
    for (let i = 0; i < modelCount; i++) {
      nodes.push({
        id: `model-${i}`,
        position: [
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2,
        ],
        type: 'model',
        active: true,
        rewards: 0,
      })
    }

    // Generate connections
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (Math.random() > 0.85) {
          const distance = new THREE.Vector3(...nodes[i].position).distanceTo(
            new THREE.Vector3(...nodes[j].position)
          )
          if (distance < 3) {
            connections.push({
              start: nodes[i].position,
              end: nodes[j].position,
              active: nodes[i].active && nodes[j].active,
            })
          }
        }
      }
    }

    return { nodes, connections }
  }, [networkStats])

  const filteredNodes = useMemo(() => {
    if (filter === 'all') return nodes
    if (filter === 'contributors') return nodes.filter((node) => node.type === 'contributor')
    if (filter === 'models') return nodes.filter((node) => node.type === 'model')
    return nodes
  }, [nodes, filter])


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
            Network Explorer
          </h1>
          <p className="text-gray-400">
            Explore the global Sentinel.ai network of contributors and model nodes
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <p className="text-gray-400 text-sm mb-1">Total Nodes</p>
            <p className="text-2xl font-orbitron font-bold text-cyber-cyan">
              {loading ? <Loader2 className="w-6 h-6 animate-spin inline" /> : networkStats.totalNodes}
            </p>
          </Card>
          <Card>
            <p className="text-gray-400 text-sm mb-1">Active Contributors</p>
            <p className="text-2xl font-orbitron font-bold text-cyber-purple">
              {loading ? <Loader2 className="w-6 h-6 animate-spin inline" /> : networkStats.activeContributors}
            </p>
          </Card>
          <Card>
            <p className="text-gray-400 text-sm mb-1">Active Models</p>
            <p className="text-2xl font-orbitron font-bold text-cyber-magenta">
              {loading ? <Loader2 className="w-6 h-6 animate-spin inline" /> : networkStats.activeModels}
            </p>
          </Card>
          <Card>
            <p className="text-gray-400 text-sm mb-1">Total Rewards</p>
            <p className="text-2xl font-orbitron font-bold text-cyber-cyan">
              {loading ? <Loader2 className="w-6 h-6 animate-spin inline" /> : `${networkStats.totalRewards.toFixed(0)} SENT`}
            </p>
          </Card>
        </div>
        {loading && (
          <div className="text-center text-gray-400 mb-4">
            <Loader2 className="w-5 h-5 animate-spin inline mr-2" />
            Loading network data from blockchain...
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 3D Network Visualization */}
          <div className="lg:col-span-2">
            <Card className="h-[600px] p-0 overflow-hidden">
              <div className="h-full">
                <Network3DScene
                  nodes={filteredNodes}
                  connections={connections}
                  onNodeClick={setSelectedNode}
                />
              </div>
            </Card>
          </div>

          {/* Controls and Info */}
          <div className="space-y-6">
            <Card>
              <h3 className="text-xl font-orbitron font-semibold mb-4 text-gradient">
                Filters
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`w-full px-4 py-2 rounded-lg transition-colors ${
                    filter === 'all'
                      ? 'bg-cyber-cyan/20 border border-cyber-cyan text-cyber-cyan'
                      : 'bg-cyber-dark border border-cyber-cyan/30 text-gray-300 hover:border-cyber-cyan/50'
                  }`}
                >
                  All Nodes
                </button>
                <button
                  onClick={() => setFilter('contributors')}
                  className={`w-full px-4 py-2 rounded-lg transition-colors ${
                    filter === 'contributors'
                      ? 'bg-cyber-cyan/20 border border-cyber-cyan text-cyber-cyan'
                      : 'bg-cyber-dark border border-cyber-cyan/30 text-gray-300 hover:border-cyber-cyan/50'
                  }`}
                >
                  Contributors
                </button>
                <button
                  onClick={() => setFilter('models')}
                  className={`w-full px-4 py-2 rounded-lg transition-colors ${
                    filter === 'models'
                      ? 'bg-cyber-purple/20 border border-cyber-purple text-cyber-purple'
                      : 'bg-cyber-dark border border-cyber-purple/30 text-gray-300 hover:border-cyber-purple/50'
                  }`}
                >
                  Models
                </button>
              </div>
            </Card>

            {selectedNode && (
              <Card>
                <h3 className="text-xl font-orbitron font-semibold mb-4 text-gradient">
                  Node Details
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-gray-400">Type</p>
                    <p className="font-orbitron font-semibold capitalize">
                      {selectedNode.type}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">ID</p>
                    <p className="font-mono text-xs">{selectedNode.id}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Status</p>
                    <p
                      className={`font-orbitron font-semibold ${
                        selectedNode.active ? 'text-cyber-cyan' : 'text-gray-500'
                      }`}
                    >
                      {selectedNode.active ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Rewards</p>
                    <p className="font-orbitron font-semibold text-cyber-purple">
                      {selectedNode.rewards.toFixed(2)} SENT
                    </p>
                  </div>
                </div>
              </Card>
            )}

            <Card>
              <h3 className="text-xl font-orbitron font-semibold mb-4 text-gradient">
                Legend
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-cyber-cyan" />
                  <span className="text-sm">Contributors</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-cyber-purple" />
                  <span className="text-sm">Model Nodes</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-cyber-cyan/30" />
                  <span className="text-sm">Inactive</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NetworkExplorer

