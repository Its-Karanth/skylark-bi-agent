import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { DealsByStatusChart } from '@/components/charts/DealsByStatusChart'
import { RevenueByStageChart } from '@/components/charts/RevenueByStageChart'
import { DealsByIndustryChart } from '@/components/charts/DealsByIndustryChart'
import { WorkOrderStatusChart } from '@/components/charts/WorkOrderStatusChart'
import { PriorityDistributionChart } from '@/components/charts/PriorityDistributionChart'
import { MonthlyTrendsChart } from '@/components/charts/MonthlyTrendsChart'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/common/EmptyState'
import { useDeals } from '@/hooks/useDeals'
import { useWorkOrders } from '@/hooks/useWorkOrders'

export function AnalyticsPage() {
  const dealsQ = useDeals()
  const woQ = useWorkOrders()

  const deals = dealsQ.data?.deals || []
  const dealsSummary = dealsQ.data?.summary
  const woSummary = woQ.data?.summary

  if (dealsQ.isError) {
    return (
      <div className="p-6">
        <ErrorState title="Analytics unavailable" message="Could not fetch data from the backend." onRetry={() => { dealsQ.refetch(); woQ.refetch() }} />
      </div>
    )
  }

  const ChartCard = ({ title, desc, children, loading }: { title: string; desc: string; children: React.ReactNode; loading: boolean }) => (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{desc}</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? <Skeleton className="h-[220px] w-full rounded-xl" /> : children}
      </CardContent>
    </Card>
  )

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Deep-dive charts powered by live monday.com data</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Deals by Status" desc="Distribution of deals across pipeline statuses" loading={dealsQ.isLoading}>
          <DealsByStatusChart distribution={dealsSummary?.statusDistribution || {}} />
        </ChartCard>

        <ChartCard title="Revenue by Stage" desc="Pipeline value grouped by deal stage" loading={dealsQ.isLoading}>
          <RevenueByStageChart deals={deals} />
        </ChartCard>

        <ChartCard title="Deals by Industry" desc="Volume of deals per industry vertical" loading={dealsQ.isLoading}>
          <DealsByIndustryChart deals={deals} />
        </ChartCard>

        <ChartCard title="Work Order Status" desc="Execution status distribution" loading={woQ.isLoading}>
          <WorkOrderStatusChart distribution={woSummary?.statusDistribution || {}} />
        </ChartCard>

        <ChartCard title="Priority Distribution" desc="Work order priority breakdown" loading={woQ.isLoading}>
          <PriorityDistributionChart distribution={woSummary?.priorityDistribution || {}} />
        </ChartCard>

        <ChartCard title="Monthly Deal Trends" desc="New deals and won deals over time" loading={dealsQ.isLoading}>
          <MonthlyTrendsChart deals={deals} />
        </ChartCard>
      </div>
    </div>
  )
}
