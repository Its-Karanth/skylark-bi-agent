import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchMerged } from '@/api/client'

export const MERGED_QUERY_KEY = ['merged'] as const

export function useMerged() {
  return useQuery({
    queryKey: MERGED_QUERY_KEY,
    queryFn: fetchMerged,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  })
}

export function useRefreshMerged() {
  const qc = useQueryClient()
  return () => qc.invalidateQueries({ queryKey: MERGED_QUERY_KEY })
}
