import { Canvas } from '@react-three/fiber'
import { OrbitControls, Sphere, Line } from '@react-three/drei'
import { useMemo } from 'react'
import * as THREE from 'three'

const Node = ({ position, color }: { position: [number, number, number]; color: string }) => {
  return (
    <group position={position}>
      <Sphere args={[0.1, 32, 32]}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
        />
      </Sphere>
      <pointLight color={color} intensity={0.5} distance={2} />
    </group>
  )
}

const Connection = ({
  start,
  end,
  color,
}: {
  start: [number, number, number]
  end: [number, number, number]
  color: string
}) => {
  const points = useMemo(() => [start, end], [start, end])
  return (
    <Line
      points={points}
      color={color}
      lineWidth={1}
      opacity={0.3}
    />
  )
}

const NeuralNetwork3D = () => {
  const nodes = useMemo(() => {
    const nodeCount = 20
    const nodes: Array<{ position: [number, number, number]; color: string }> = []
    const colors = ['#00f0ff', '#b026ff', '#ff00ff']
    
    for (let i = 0; i < nodeCount; i++) {
      const angle = (i / nodeCount) * Math.PI * 2
      const radius = 2 + Math.random() * 1
      const height = (Math.random() - 0.5) * 3
      nodes.push({
        position: [
          Math.cos(angle) * radius,
          height,
          Math.sin(angle) * radius,
        ],
        color: colors[Math.floor(Math.random() * colors.length)],
      })
    }
    return nodes
  }, [])

  const connections = useMemo(() => {
    const conns: Array<{ start: [number, number, number]; end: [number, number, number]; color: string }> = []
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (Math.random() > 0.7) {
          const distance = new THREE.Vector3(...nodes[i].position).distanceTo(
            new THREE.Vector3(...nodes[j].position)
          )
          if (distance < 2.5) {
            conns.push({
              start: nodes[i].position,
              end: nodes[j].position,
              color: nodes[i].color,
            })
          }
        }
      }
    }
    return conns
  }, [nodes])

  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      {nodes.map((node, i) => (
        <Node key={i} position={node.position} color={node.color} />
      ))}
      {connections.map((conn, i) => (
        <Connection key={i} start={conn.start} end={conn.end} color={conn.color} />
      ))}
      <OrbitControls enableZoom={true} enablePan={true} enableRotate={true} />
    </Canvas>
  )
}

export default NeuralNetwork3D

