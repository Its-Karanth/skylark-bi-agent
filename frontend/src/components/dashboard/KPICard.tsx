import React from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn, formatCurrency, formatNumber } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

interface KPICardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ReactNode
  trend?: 'up' | 'down' | 'neutral'
  trendLabel?: string
  format?: 'currency' | 'number' | 'percent' | 'raw'
  color?: 'blue' | 'green' | 'red' | 'amber' | 'purple' | 'cyan'
  index?: number
  isLoading?: boolean
}

const colorStyles = {
  blue: {
    bg: 'bg-indigo-500/10 dark:bg-indigo-500/15',
    text: 'text-indigo-600 dark:text-indigo-400',
    glow: 'shadow-indigo-500/10 group-hover:shadow-indigo-500/25',
    border: 'group-hover:border-indigo-500/40',
    badge: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border-indigo-500/20',
  },
  green: {
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
    text: 'text-emerald-600 dark:text-emerald-400',
    glow: 'shadow-emerald-500/10 group-hover:shadow-emerald-500/25',
    border: 'group-hover:border-emerald-500/40',
    badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/20',
  },
  red: {
    bg: 'bg-rose-500/10 dark:bg-rose-500/15',
    text: 'text-rose-600 dark:text-rose-400',
    glow: 'shadow-rose-500/10 group-hover:shadow-rose-500/25',
    border: 'group-hover:border-rose-500/40',
    badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-300 border-rose-500/20',
  },
  amber: {
    bg: 'bg-amber-500/10 dark:bg-amber-500/15',
    text: 'text-amber-600 dark:text-amber-400',
    glow: 'shadow-amber-500/10 group-hover:shadow-amber-500/25',
    border: 'group-hover:border-amber-500/40',
    badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-300 border-amber-500/20',
  },
  purple: {
    bg: 'bg-purple-500/10 dark:bg-purple-500/15',
    text: 'text-purple-600 dark:text-purple-400',
    glow: 'shadow-purple-500/10 group-hover:shadow-purple-500/25',
    border: 'group-hover:border-purple-500/40',
    badge: 'bg-purple-500/10 text-purple-600 dark:text-purple-300 border-purple-500/20',
  },
  cyan: {
    bg: 'bg-cyan-500/10 dark:bg-cyan-500/15',
    text: 'text-cyan-600 dark:text-cyan-400',
    glow: 'shadow-cyan-500/10 group-hover:shadow-cyan-500/25',
    border: 'group-hover:border-cyan-500/40',
    badge: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 border-cyan-500/20',
  },
}

export function KPICard({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendLabel,
  format = 'raw',
  color = 'blue',
  index = 0,
  isLoading = false,
}: KPICardProps) {
  const style = colorStyles[color] || colorStyles.blue

  const formattedValue = () => {
    if (isLoading) return ''
    if (format === 'currency') return formatCurrency(Number(value))
    if (format === 'number') return formatNumber(Number(value))
    return String(value)
  }

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border/60 bg-card/60 p-5 backdrop-blur-md">
        <div className="flex items-start justify-between mb-3">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <Skeleton className="w-16 h-5 rounded-full" />
        </div>
        <Skeleton className="w-24 h-7 rounded-lg mb-1.5" />
        <Skeleton className="w-32 h-4 rounded-md" />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4, scale: 1.02 }}
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-border/70 bg-card/80 p-5 backdrop-blur-xl',
        'shadow-lg transition-all duration-300 cursor-default',
        style.glow,
        style.border
      )}
    >
      {/* Top accent glow line */}
      <div className={cn('absolute top-0 left-0 right-0 h-1 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300', 
        color === 'green' ? 'from-emerald-500 to-teal-400' :
        color === 'purple' ? 'from-purple-500 to-pink-500' :
        color === 'red' ? 'from-rose-500 to-amber-500' :
        color === 'amber' ? 'from-amber-400 to-orange-500' :
        color === 'cyan' ? 'from-cyan-400 to-blue-500' : 'from-indigo-500 to-violet-500'
      )} />

      <div className="flex items-start justify-between mb-3">
        {/* Icon Container */}
        <div className={cn(
          'w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-inner',
          style.bg,
          style.text
        )}>
          {icon}
        </div>

        {/* Trend badge */}
        {trend && trendLabel ? (
          <span className={cn(
            'flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full border shadow-sm',
            trend === 'up' && 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
            trend === 'down' && 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30',
            trend === 'neutral' && 'bg-muted text-muted-foreground border-border',
          )}>
            {trend === 'up' && <TrendingUp className="w-3 h-3" />}
            {trend === 'down' && <TrendingDown className="w-3 h-3" />}
            {trend === 'neutral' && <Minus className="w-3 h-3" />}
            {trendLabel}
          </span>
        ) : (
          <span className={cn('text-[11px] font-medium px-2 py-0.5 rounded-full border', style.badge)}>
            {format === 'currency' ? 'Revenue' : 'Metric'}
          </span>
        )}
      </div>

      {/* Value */}
      <p className={cn(
        "text-2xl lg:text-3xl font-extrabold tracking-tight tabular-nums transition-colors duration-300",
        format === 'currency' ? 'gradient-text' : 'text-foreground'
      )}>
        {formattedValue()}
      </p>

      {/* Title & subtitle */}
      <p className="text-sm font-semibold text-muted-foreground mt-1 group-hover:text-foreground transition-colors">
        {title}
      </p>
      {subtitle && <p className="text-xs text-muted-foreground/70 mt-0.5">{subtitle}</p>}
    </motion.div>
  )
}
