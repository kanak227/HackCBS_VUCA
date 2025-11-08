import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface ButtonProps {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'outline'
  className?: string
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
}

const Button = ({
  children,
  onClick,
  variant = 'primary',
  className = '',
  disabled = false,
  type = 'button',
}: ButtonProps) => {
  const baseClasses = 'px-6 py-3 rounded-lg font-orbitron font-semibold transition-all duration-300'
  
  const variants = {
    primary: 'cyber-button',
    secondary: 'px-6 py-3 bg-cyber-purple/20 border border-cyber-purple text-cyber-purple rounded-lg hover:bg-cyber-purple/30 hover:shadow-cyber-glow-purple',
    outline: 'px-6 py-3 border-2 border-cyber-cyan text-cyber-cyan rounded-lg hover:bg-cyber-cyan/10 hover:shadow-cyber-glow',
  }

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      className={`${baseClasses} ${variants[variant]} ${className}`}
    >
      {children}
    </motion.button>
  )
}

export default Button

