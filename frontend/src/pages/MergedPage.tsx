import React from 'react'
import { useMerged } from '@/hooks/useMerged'
import { ErrorState } from '@/components/common/EmptyState'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency, formatDate, isOverdue } from '@/lib/utils'
import { motion } from 'framer-motion'
import { ClipboardList, DollarSign, CheckCircle2, Clock } from 'lucide-react'

export function MergedPage() {
  const { data, isLoading, isError, refetch } = useMerged()

  if (isError) return (
    <div className="p-6">
      <ErrorState title="Could not load merged view" message="Backend error fetching merged data." onRetry={refetch} />
    </div>
  )

  const deals = data?.deals || []

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Merged View</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Deals with their linked work orders</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)}
        </div>
      ) : (
        <div className="space-y-4">
          {deals.map((deal, i) => {
            const wos = deal.workOrders || []
            const doneCount = wos.filter((w) => w.status === 'Done').length
            const completionPct = wos.length > 0 ? Math.round((doneCount / wos.length) * 100) : null
            const overdueWOs = wos.filter((w) => isOverdue(w.due_date, w.status))

            return (
              <motion.div
                key={deal.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <CardTitle className="text-base">{deal.name}</CardTitle>
                        <CardDescription>{deal.company} · {deal.owner}</CardDescription>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <StatusBadge status={deal.status} type="deal" />
                        {deal.deal_value !== null && (
                          <span className="text-sm font-semibold text-primary">
                            {formatCurrency(deal.deal_value)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Completion bar */}
                    {wos.length > 0 && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                          <span className="flex items-center gap-1.5">
                            <ClipboardList className="w-3 h-3" />
                            {wos.length} work order{wos.length !== 1 ? 's' : ''}
                            {overdueWOs.length > 0 && (
                              <Badge variant="destructive" className="text-[10px] px-1.5 py-0">{overdueWOs.length} overdue</Badge>
                            )}
                          </span>
                          {completionPct !== null && (
                            <span className="font-medium">{completionPct}% done</span>
                          )}
                        </div>
                        {completionPct !== null && <Progress value={completionPct} className="h-1.5" />}
                      </div>
                    )}
                  </CardHeader>

                  {wos.length > 0 && (
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {wos.map((wo) => (
                          <div key={wo.id} className="flex items-start justify-between p-2.5 rounded-lg bg-muted/40 border border-border/50 gap-2">
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-foreground truncate">{wo.name}</p>
                              <p className="text-[10px] text-muted-foreground mt-0.5">{wo.assigned_to}</p>
                              {wo.due_date && (
                                <p className={`text-[10px] flex items-center gap-1 mt-0.5 ${isOverdue(wo.due_date, wo.status) ? 'text-red-500' : 'text-muted-foreground'}`}>
                                  <Clock className="w-2.5 h-2.5" />{formatDate(wo.due_date)}
                                </p>
                              )}
                            </div>
                            <StatusBadge status={wo.status} type="workorder" />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
