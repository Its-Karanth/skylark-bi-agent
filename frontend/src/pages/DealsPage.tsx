import React, { useState } from 'react'
import { DealsTable } from '@/components/deals/DealsTable'
import { DealDrawer } from '@/components/deals/DealDrawer'
import { ErrorState } from '@/components/common/EmptyState'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useDeals } from '@/hooks/useDeals'
import { useMerged } from '@/hooks/useMerged'
import type { Deal } from '@/types'

export function DealsPage() {
  const dealsQ = useDeals()
  const mergedQ = useMerged()
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null)

  // Use merged data so the drawer can show linked work orders
  const mergedDealsMap = new Map(
    (mergedQ.data?.deals || []).map((d) => [d.id, d])
  )

  const deals = dealsQ.data?.deals || []
  const dq = dealsQ.data?.dataQuality

  if (dealsQ.isError) {
    return (
      <div className="p-6">
        <ErrorState
          title="Could not load deals"
          message="Ensure the backend is running and monday.com Board ID is correct."
          onRetry={() => dealsQ.refetch()}
        />
      </div>
    )
  }

  const handleRowClick = (deal: Deal) => {
    // Prefer merged version (has work orders attached)
    const enriched = mergedDealsMap.get(deal.id) || deal
    setSelectedDeal(enriched)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Deals</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Live deal pipeline from monday.com
          </p>
        </div>
        {dq && dq.recordsWithIssues > 0 && (
          <Badge variant="warning" className="text-xs">
            ⚠ {dq.recordsWithIssues} data quality issue{dq.recordsWithIssues !== 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Deal Pipeline</CardTitle>
          <CardDescription>Click a row to view details and linked work orders</CardDescription>
        </CardHeader>
        <CardContent>
          <DealsTable
            deals={deals}
            isLoading={dealsQ.isLoading}
            onRowClick={handleRowClick}
          />
        </CardContent>
      </Card>

      <DealDrawer
        deal={selectedDeal}
        open={!!selectedDeal}
        onClose={() => setSelectedDeal(null)}
      />
    </div>
  )
}
