import React from 'react'
import { WorkOrdersGrid } from '@/components/workorders/WorkOrdersGrid'
import { ErrorState } from '@/components/common/EmptyState'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useWorkOrders } from '@/hooks/useWorkOrders'
import { KPICard } from '@/components/dashboard/KPICard'
import { Clock, CheckCircle2, AlertTriangle, Zap } from 'lucide-react'

export function WorkOrdersPage() {
  const woQ = useWorkOrders()
  const summary = woQ.data?.summary
  const efficiency = woQ.data?.efficiency

  if (woQ.isError) {
    return (
      <div className="p-6">
        <ErrorState
          title="Could not load work orders"
          message="Ensure the backend is running and monday.com Work Orders Board ID is correct."
          onRetry={() => woQ.refetch()}
        />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Work Orders</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Operational execution tracking</p>
        </div>
        {efficiency?.note && (
          <Badge variant="warning" className="text-xs max-w-xs text-left whitespace-normal">
            ⚠ {efficiency.note}
          </Badge>
        )}
      </div>

      {/* Mini KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KPICard title="Total" value={summary?.total ?? 0} icon={<Zap className="w-4 h-4" />} color="blue" format="number" index={0} isLoading={woQ.isLoading} />
        <KPICard title="Completed" value={summary?.done ?? 0} icon={<CheckCircle2 className="w-4 h-4" />} color="green" format="number" index={1} isLoading={woQ.isLoading} />
        <KPICard title="Overdue" value={summary?.overdue ?? 0} icon={<Clock className="w-4 h-4" />} color="red" format="number" index={2} isLoading={woQ.isLoading} />
        <KPICard title="Blocked" value={summary?.blocked ?? 0} icon={<AlertTriangle className="w-4 h-4" />} color="amber" format="number" index={3} isLoading={woQ.isLoading} />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Work Orders</CardTitle>
          <CardDescription>Filter by status or priority · Cards highlighted in red are overdue</CardDescription>
        </CardHeader>
        <CardContent>
          <WorkOrdersGrid
            workOrders={woQ.data?.workOrders || []}
            isLoading={woQ.isLoading}
          />
        </CardContent>
      </Card>
    </div>
  )
}
