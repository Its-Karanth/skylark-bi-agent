import React from 'react'
import { Badge } from '@/components/ui/badge'

interface StatusBadgeProps {
  status: string
  type?: 'deal' | 'workorder' | 'priority'
}

function getVariant(status: string, type: string): 'success' | 'destructive' | 'info' | 'warning' | 'purple' | 'ghost' | 'outline' {
  const s = status.toLowerCase()
  if (type === 'priority') {
    if (s === 'critical') return 'destructive'
    if (s === 'high') return 'warning'
    if (s === 'medium') return 'info'
    if (s === 'low') return 'success'
    return 'ghost'
  }
  // status
  if (s.includes('won') || s === 'done' || s === 'completed') return 'success'
  if (s === 'lost' || s === 'cancelled' || s === 'blocked') return 'destructive'
  if (s.includes('progress')) return 'info'
  if (s === 'in review') return 'purple'
  if (s.includes('on hold') || s === 'paused') return 'warning'
  if (s === 'proposal sent') return 'info'
  if (s === 'negotiation') return 'warning'
  return 'ghost'
}

export function StatusBadge({ status, type = 'deal' }: StatusBadgeProps) {
  const variant = getVariant(status, type)
  return (
    <Badge variant={variant} className="font-medium text-xs">
      {status}
    </Badge>
  )
}
