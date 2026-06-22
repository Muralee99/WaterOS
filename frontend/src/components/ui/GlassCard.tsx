import { motion } from 'framer-motion'
import { cn } from '@/utils/cn'
import type { CSSProperties, ReactNode } from 'react'

interface GlassCardProps {
  children: ReactNode
  className?: string
  style?: CSSProperties
  hover?: boolean
  glow?: 'blue' | 'cyan' | 'red' | 'green' | 'none'
  onClick?: () => void
}

export function GlassCard({ children, className, style, hover = false, glow = 'none', onClick }: GlassCardProps) {
  const glowClass = {
    blue: 'glow-blue',
    cyan: 'glow-cyan',
    red: 'glow-red',
    green: 'shadow-[0_0_20px_rgba(16,185,129,0.3)]',
    none: '',
  }[glow]

  return (
    <motion.div
      whileHover={hover ? { scale: 1.01, y: -1 } : undefined}
      onClick={onClick}
      style={style}
      className={cn(
        'glass rounded-xl',
        glowClass,
        hover && 'glass-hover cursor-pointer',
        className
      )}
    >
      {children}
    </motion.div>
  )
}
