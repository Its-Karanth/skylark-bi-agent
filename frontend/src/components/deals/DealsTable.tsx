import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Search, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Filter } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency, formatDate, isOverdue, cn } from '@/lib/utils'
import type { Deal } from '@/types'

interface DealsTableProps {
  deals: Deal[]
  isLoading?: boolean
  onRowClick?: (deal: Deal) => void
}

type SortKey = keyof Deal
type SortDir = 'asc' | 'desc'

const PAGE_SIZE = 15

export function DealsTable({ deals, isLoading, onRowClick }: DealsTableProps) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [page, setPage] = useState(1)

  // Unique statuses for filter
  const statuses = useMemo(() => {
    const s = new Set<string>()
    deals.forEach((d) => d.status && s.add(d.status))
    return ['all', ...Array.from(s).sort()]
  }, [deals])

  // Filter + sort
  const filtered = useMemo(() => {
    let result = deals.filter((d) => {
      const q = search.toLowerCase()
      const matchSearch =
        !q ||
        d.name?.toLowerCase().includes(q) ||
        d.company?.toLowerCase().includes(q) ||
        d.owner?.toLowerCase().includes(q) ||
        d.industry?.toLowerCase().includes(q) ||
        d.stage?.toLowerCase().includes(q)
      const matchStatus = statusFilter === 'all' || d.status === statusFilter
      return matchSearch && matchStatus
    })

    result = result.sort((a, b) => {
      const av = a[sortKey] ?? ''
      const bv = b[sortKey] ?? ''
      const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true })
      return sortDir === 'asc' ? cmp : -cmp
    })

    return result
  }, [deals, search, statusFilter, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(key); setSortDir('asc') }
    setPage(1)
  }

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ChevronUp className="w-3 h-3 opacity-20" />
    return sortDir === 'asc'
      ? <ChevronUp className="w-3 h-3 text-primary" />
      : <ChevronDown className="w-3 h-3 text-primary" />
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-lg" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Search deals…"
            className="pl-8 h-8 text-sm"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          />
        </div>

        {/* Status filter buttons */}
        <div className="flex items-center gap-1 flex-wrap">
          {statuses.slice(0, 8).map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1) }}
              className={cn(
                'px-2.5 py-1 rounded-lg text-xs font-medium transition-all border',
                s === statusFilter
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-transparent border-border text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              {s === 'all' ? 'All' : s}
            </button>
          ))}
        </div>

        <span className="text-xs text-muted-foreground ml-auto">
          {filtered.length} deal{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border">
              <TableHead className="cursor-pointer" onClick={() => toggleSort('name')}>
                <span className="flex items-center gap-1">Name <SortIcon col="name" /></span>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => toggleSort('company')}>
                <span className="flex items-center gap-1">Company <SortIcon col="company" /></span>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="cursor-pointer" onClick={() => toggleSort('stage')}>
                <span className="flex items-center gap-1">Stage <SortIcon col="stage" /></span>
              </TableHead>
              <TableHead className="cursor-pointer text-right" onClick={() => toggleSort('deal_value')}>
                <span className="flex items-center justify-end gap-1">Value <SortIcon col="deal_value" /></span>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => toggleSort('close_date')}>
                <span className="flex items-center gap-1">Close Date <SortIcon col="close_date" /></span>
              </TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Industry</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paged.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-muted-foreground text-sm">
                  No deals match your filters
                </TableCell>
              </TableRow>
            ) : (
              paged.map((deal, i) => (
                <motion.tr
                  key={deal.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  onClick={() => onRowClick?.(deal)}
                  className="border-b border-border/50 transition-colors hover:bg-muted/40 cursor-pointer"
                >
                  <TableCell className="font-medium text-foreground max-w-[180px]">
                    <span className="truncate block" title={deal.name}>{deal.name}</span>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm max-w-[140px]">
                    <span className="truncate block">{deal.company}</span>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={deal.status} type="deal" />
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    <span className="truncate block max-w-[120px]" title={deal.stage}>{deal.stage}</span>
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {formatCurrency(deal.deal_value)}
                  </TableCell>
                  <TableCell className={cn(
                    'text-sm',
                    isOverdue(deal.close_date, deal.status) ? 'text-red-500 font-medium' : 'text-muted-foreground'
                  )}>
                    {formatDate(deal.close_date)}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{deal.owner}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{deal.industry}</TableCell>
                </motion.tr>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = page <= 3 ? i + 1 : page - 2 + i
              if (pageNum < 1 || pageNum > totalPages) return null
              return (
                <Button
                  key={pageNum}
                  variant={pageNum === page ? 'default' : 'ghost'}
                  size="icon"
                  className="w-8 h-8"
                  onClick={() => setPage(pageNum)}
                >
                  <span className="text-xs">{pageNum}</span>
                </Button>
              )
            })}
            <Button variant="outline" size="icon" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
