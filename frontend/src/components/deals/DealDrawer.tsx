import React from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { formatCurrency, formatDate, cn } from '@/lib/utils'
import { Building2, User, Calendar, Tag, DollarSign, ClipboardList, AlertTriangle } from 'lucide-react'
import type { Deal } from '@/types'

interface DealDrawerProps {
  deal: Deal | null
  open: boolean
  onClose: () => void
}

function Field({ label, value, icon }: { label: string; value: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      {icon && <span className="text-muted-foreground mt-0.5 flex-shrink-0">{icon}</span>}
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-0.5">{label}</p>
        <div className="text-sm text-foreground">{value || '—'}</div>
      </div>
    </div>
  )
}

export function DealDrawer({ deal, open, onClose }: DealDrawerProps) {
  if (!deal) return null

  const linkedWorkOrders = deal.workOrders || []
  const hasIssues = deal._dataIssues && deal._dataIssues.length > 0

  const completedWO = linkedWorkOrders.filter((w) => w.status === 'Done').length
  const completionPct = linkedWorkOrders.length > 0
    ? Math.round((completedWO / linkedWorkOrders.length) * 100)
    : null

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-xl flex flex-col p-0">
        {/* Header */}
        <div className="px-6 pt-8 pb-5 border-b border-border">
          <SheetHeader>
            <div className="flex items-start justify-between gap-3 pr-6">
              <div className="min-w-0">
                <SheetTitle className="text-lg leading-tight mb-1.5">{deal.name}</SheetTitle>
                <SheetDescription className="text-sm">
                  {deal.company}
                </SheetDescription>
              </div>
              <div className="flex-shrink-0 mt-1">
                <StatusBadge status={deal.status} type="deal" />
              </div>
            </div>

            {/* Revenue highlight */}
            {deal.deal_value !== null && (
              <div className="mt-4 p-4 rounded-xl bg-primary/8 border border-primary/15">
                <p className="text-xs font-medium text-primary/80 uppercase tracking-wider mb-1">Deal Value</p>
                <p className="text-2xl font-bold text-primary">{formatCurrency(deal.deal_value)}</p>
              </div>
            )}
          </SheetHeader>
        </div>

        <ScrollArea className="flex-1">
          <div className="px-6 py-4 space-y-1">
            {/* Data quality alert */}
            {hasIssues && (
              <div className="mb-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/25 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mb-1">Data Quality Issues</p>
                  <ul className="space-y-0.5">
                    {deal._dataIssues.map((issue, i) => (
                      <li key={i} className="text-xs text-amber-700 dark:text-amber-300">• {issue}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Core fields */}
            <Field label="Owner" value={deal.owner} icon={<User className="w-3.5 h-3.5" />} />
            <Separator />
            <Field label="Stage" value={
              <span className="flex items-center gap-2">
                {deal.stage}
                {deal.priority && deal.priority !== 'Unknown' && (
                  <StatusBadge status={deal.priority} type="priority" />
                )}
              </span>
            } icon={<Tag className="w-3.5 h-3.5" />} />
            <Separator />
            <Field label="Industry" value={deal.industry} icon={<Building2 className="w-3.5 h-3.5" />} />
            <Separator />
            <Field label="Close Date" value={formatDate(deal.close_date)} icon={<Calendar className="w-3.5 h-3.5" />} />
            <Separator />
            <Field label="Created" value={formatDate(deal.created_at)} icon={<Calendar className="w-3.5 h-3.5" />} />
            {deal.notes && deal.notes !== 'Unknown' && (
              <>
                <Separator />
                <Field label="Notes" value={<p className="text-sm text-muted-foreground leading-relaxed">{deal.notes}</p>} />
              </>
            )}

            {/* Linked Work Orders */}
            {linkedWorkOrders.length > 0 && (
              <div className="mt-5">
                <Separator className="mb-4" />
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <ClipboardList className="w-4 h-4 text-muted-foreground" />
                    <p className="text-sm font-semibold text-foreground">
                      Linked Work Orders ({linkedWorkOrders.length})
                    </p>
                  </div>
                  {completionPct !== null && (
                    <Badge variant="outline" className="text-xs">{completionPct}% done</Badge>
                  )}
                </div>

                {completionPct !== null && (
                  <Progress value={completionPct} className="mb-4 h-1.5" />
                )}

                <div className="space-y-2">
                  {linkedWorkOrders.map((wo) => (
                    <div key={wo.id} className="p-3 rounded-lg border border-border bg-muted/30 flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{wo.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {wo.assigned_to} · Due: {formatDate(wo.due_date)}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <StatusBadge status={wo.status} type="workorder" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
