import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchWorkOrders } from '@/api/client'

export const WORKORDERS_QUERY_KEY = ['workorders'] as const

export function useWorkOrders() {
  return useQuery({
    queryKey: WORKORDERS_QUERY_KEY,
    queryFn: fetchWorkOrders,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  })
}

export function useRefreshWorkOrders() {
  const qc = useQueryClient()
  return () => qc.invalidateQueries({ queryKey: WORKORDERS_QUERY_KEY })
}
