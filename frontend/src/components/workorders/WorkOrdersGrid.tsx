import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Search, Clock, CheckCircle2, AlertTriangle, Zap } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDate, formatNumber, isOverdue, cn } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'
import type { WorkOrder } from '@/types'

interface WorkOrdersGridProps {
  workOrders: WorkOrder[]
  isLoading?: boolean
}

function WorkOrderCard({ wo, index }: { wo: WorkOrder; index: number }) {
  const overdue = isOverdue(wo.due_date, wo.status)
  const efficiency = wo.estimated_hours && wo.actual_hours
    ? Math.round((wo.actual_hours / wo.estimated_hours) * 100)
    : null
  const progressPct = wo.status === 'Done' ? 100 : wo.status === 'In Progress' ? 50 : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.3 }}
      className={cn(
        'rounded-xl border bg-card p-4 flex flex-col gap-3 hover:shadow-md transition-all',
        overdue && 'border-red-500/40 bg-red-500/5',
        wo.priority === 'Critical' && !overdue && 'border-red-400/30',
        wo.status === 'Done' && 'border-emerald-500/30 bg-emerald-500/5 opacity-80',
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-foreground leading-tight line-clamp-2 flex-1">
          {wo.name}
        </p>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <StatusBadge status={wo.status} type="workorder" />
          {wo.priority && wo.priority !== 'Unknown' && (
            <StatusBadge status={wo.priority} type="priority" />
          )}
        </div>
      </div>

      {/* Progress bar */}
      <Progress value={progressPct} className="h-1" />

      {/* Meta */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
        {wo.assigned_to && wo.assigned_to !== 'Unknown' && (
          <div className="flex items-center gap-1.5 col-span-2">
            <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-[8px] font-bold text-primary">{wo.assigned_to[0]}</span>
            </div>
            <span className="truncate">{wo.assigned_to}</span>
          </div>
        )}
        {wo.deal_reference && wo.deal_reference !== 'Unknown' && (
          <div className="col-span-2 truncate">
            <span className="text-primary/80">Deal:</span> {wo.deal_reference}
          </div>
        )}
        {wo.due_date && (
          <div className={cn('flex items-center gap-1', overdue && 'text-red-500 font-medium')}>
            <Clock className="w-3 h-3" />
            {overdue ? '⚠ ' : ''}{formatDate(wo.due_date)}
          </div>
        )}
        {wo.estimated_hours !== null && (
          <div className="flex items-center gap-1">
            <Zap className="w-3 h-3" />
            {formatNumber(wo.estimated_hours)}h est.
            {efficiency !== null && (
              <span className={cn('ml-1', efficiency > 100 ? 'text-red-500' : 'text-emerald-500')}>
                ({efficiency}%)
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}

export function WorkOrdersGrid({ workOrders, isLoading }: WorkOrdersGridProps) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'overdue' | 'critical' | 'in-progress' | 'done'>('all')

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return workOrders.filter((wo) => {
      const matchSearch =
        !q ||
        wo.name?.toLowerCase().includes(q) ||
        wo.assigned_to?.toLowerCase().includes(q) ||
        wo.deal_reference?.toLowerCase().includes(q)

      const matchFilter =
        filter === 'all' ||
        (filter === 'overdue' && isOverdue(wo.due_date, wo.status)) ||
        (filter === 'critical' && wo.priority === 'Critical') ||
        (filter === 'in-progress' && wo.status === 'In Progress') ||
        (filter === 'done' && wo.status === 'Done')

      return matchSearch && matchFilter
    })
  }, [workOrders, search, filter])

  const filters: Array<{ key: typeof filter; label: string; icon: React.ReactNode }> = [
    { key: 'all', label: 'All', icon: null },
    { key: 'overdue', label: 'Overdue', icon: <AlertTriangle className="w-3 h-3" /> },
    { key: 'critical', label: 'Critical', icon: <Zap className="w-3 h-3" /> },
    { key: 'in-progress', label: 'In Progress', icon: <Clock className="w-3 h-3" /> },
    { key: 'done', label: 'Done', icon: <CheckCircle2 className="w-3 h-3" /> },
  ]

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-40 rounded-xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Search work orders…"
            className="pl-8 h-8 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-1 flex-wrap">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                'flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all border',
                f.key === filter
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-transparent border-border text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              {f.icon}{f.label}
            </button>
          ))}
        </div>
        <span className="text-xs text-muted-foreground ml-auto">
          {filtered.length} order{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground text-sm">No work orders match your filters</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((wo, i) => (
            <WorkOrderCard key={wo.id} wo={wo} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}
