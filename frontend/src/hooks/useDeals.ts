import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchDeals } from '@/api/client'

export const DEALS_QUERY_KEY = ['deals'] as const

export function useDeals() {
  return useQuery({
    queryKey: DEALS_QUERY_KEY,
    queryFn: fetchDeals,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  })
}

export function useRefreshDeals() {
  const qc = useQueryClient()
  return () => qc.invalidateQueries({ queryKey: DEALS_QUERY_KEY })
}
