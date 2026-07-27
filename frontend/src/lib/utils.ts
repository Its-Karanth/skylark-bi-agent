import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Merge Tailwind classes safely */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Format a number as currency in Rupees (₹) */
export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value)
}

/** Format a number with commas */
export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—'
  return new Intl.NumberFormat('en-US').format(value)
}

/** Format ISO date string to readable format */
export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  try {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return dateStr
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return dateStr
  }
}

/** Returns true if a date string is in the past */
export function isOverdue(dateStr: string | null | undefined, status?: string): boolean {
  if (!dateStr) return false
  if (status === 'Done' || status === 'Cancelled') return false
  return new Date(dateStr) < new Date()
}

/** Truncate text to n characters */
export function truncate(text: string, n: number): string {
  return text.length > n ? text.slice(0, n) + '…' : text
}

/** Get status color class based on status string */
export function getStatusColor(status: string): string {
  const s = status.toLowerCase()
  if (s.includes('won') || s.includes('done') || s.includes('completed')) return 'text-emerald-500'
  if (s.includes('lost') || s.includes('cancelled') || s.includes('blocked')) return 'text-red-500'
  if (s.includes('progress')) return 'text-blue-500'
  if (s.includes('review')) return 'text-purple-500'
  if (s.includes('on hold') || s.includes('paused')) return 'text-amber-500'
  if (s.includes('proposal')) return 'text-cyan-500'
  if (s.includes('negotiation')) return 'text-orange-500'
  if (s.includes('lead') || s.includes('new')) return 'text-slate-400'
  return 'text-muted-foreground'
}

/** Get priority color class */
export function getPriorityColor(priority: string): string {
  const p = priority.toLowerCase()
  if (p === 'critical') return 'text-red-500'
  if (p === 'high') return 'text-orange-500'
  if (p === 'medium') return 'text-amber-500'
  if (p === 'low') return 'text-emerald-500'
  return 'text-muted-foreground'
}

/** Generate a consistent color for a string (for charts) */
const CHART_COLORS = [
  '#6366f1', '#8b5cf6', '#06b6d4', '#10b981',
  '#f59e0b', '#ef4444', '#ec4899', '#84cc16',
  '#f97316', '#14b8a6', '#a855f7', '#3b82f6',
]
export function stringToColor(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return CHART_COLORS[Math.abs(hash) % CHART_COLORS.length]
}
