import React, { useState, useRef, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Sun, Moon, RefreshCw, Search, Wifi, WifiOff, User, X, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useTheme } from '@/context/ThemeContext'
import { useHealth } from '@/hooks/useHealth'
import { useDeals } from '@/hooks/useDeals'
import { useWorkOrders } from '@/hooks/useWorkOrders'
import { useMerged } from '@/hooks/useMerged'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import type { Deal, WorkOrder } from '@/types'

interface SearchResult {
  type: 'deal' | 'workorder'
  id: string
  primary: string
  secondary: string
}

interface TopbarProps {
  onSearchResult?: (result: SearchResult) => void
}

export function Topbar({ onSearchResult }: TopbarProps) {
  const { toggleTheme, isDark } = useTheme()
  const { data: health, isError: isOffline } = useHealth()
  const dealsQuery = useDeals()
  const workordersQuery = useWorkOrders()
  const qc = useQueryClient()

  const [isRefreshing, setIsRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [showSearch, setShowSearch] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  // Global refresh
  const handleRefresh = async () => {
    setIsRefreshing(true)
    await qc.invalidateQueries()
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  // Global search across deals, companies, work orders
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults([])
      return
    }
    const q = searchQuery.toLowerCase()
    const results: SearchResult[] = []

    const deals: Deal[] = dealsQuery.data?.deals || []
    deals.forEach((d) => {
      if (
        d.name?.toLowerCase().includes(q) ||
        d.company?.toLowerCase().includes(q) ||
        d.owner?.toLowerCase().includes(q) ||
        d.industry?.toLowerCase().includes(q)
      ) {
        results.push({
          type: 'deal',
          id: d.id,
          primary: d.name,
          secondary: `${d.company} · ${d.status}`,
        })
      }
    })

    const workOrders: WorkOrder[] = workordersQuery.data?.workOrders || []
    workOrders.forEach((w) => {
      if (
        w.name?.toLowerCase().includes(q) ||
        w.deal_reference?.toLowerCase().includes(q) ||
        w.assigned_to?.toLowerCase().includes(q)
      ) {
        results.push({
          type: 'workorder',
          id: w.id,
          primary: w.name,
          secondary: `${w.assigned_to} · ${w.status}`,
        })
      }
    })

    setSearchResults(results.slice(0, 8))
  }, [searchQuery, dealsQuery.data, workordersQuery.data])

  // Close search on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearch(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const isOnline = !isOffline && health?.status === 'ok'

  return (
    <TooltipProvider>
      <header className="sticky top-0 z-20 flex items-center justify-between h-16 px-6 border-b border-border/80 bg-background/70 backdrop-blur-2xl flex-shrink-0 gap-4 shadow-sm">
        {/* Search */}
        <div ref={searchRef} className="relative flex-1 max-w-md">
          <div className="relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none" />
            <Input
              placeholder="Search deals, clients, engineers, work orders…"
              className="pl-10 pr-8 h-9 text-sm bg-card/60 border-border/80 focus-visible:ring-primary/30 focus-visible:border-primary/60 rounded-xl transition-all shadow-inner"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setShowSearch(true)
              }}
              onFocus={() => setShowSearch(true)}
            />
            {searchQuery && (
              <button
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded-md transition-colors"
                onClick={() => { setSearchQuery(''); setSearchResults([]) }}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Search dropdown */}
          <AnimatePresence>
            {showSearch && searchResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                className="absolute top-12 left-0 right-0 z-50 bg-card/95 border border-border/80 rounded-2xl shadow-2xl backdrop-blur-xl overflow-hidden"
              >
                <div className="px-3 py-2 text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider border-b border-border/50">
                  Search Results
                </div>
                <div className="max-h-80 overflow-y-auto p-1.5 space-y-1">
                  {searchResults.map((r) => (
                    <button
                      key={r.id}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-accent/80 text-left transition-colors group"
                      onClick={() => {
                        onSearchResult?.(r)
                        setShowSearch(false)
                      }}
                    >
                      <span className={cn(
                        'text-[10px] font-bold px-2 py-0.5 rounded-lg uppercase tracking-wider shadow-xs',
                        r.type === 'deal' ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                      )}>
                        {r.type === 'deal' ? 'Deal' : 'Order'}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">{r.primary}</p>
                        <p className="text-xs text-muted-foreground truncate">{r.secondary}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          {/* Connection status badge */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border transition-all duration-300 shadow-sm cursor-default',
                isOnline
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 shadow-emerald-500/10'
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30 shadow-rose-500/10'
              )}>
                <span className={cn(
                  'w-2 h-2 rounded-full',
                  isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                )} />
                {isOnline ? 'Monday Live' : 'Offline'}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              {isOnline
                ? `Monday.com API connected — uptime: ${health?.uptime?.human}`
                : 'Cannot reach Express backend server'}
            </TooltipContent>
          </Tooltip>

          {/* Refresh button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="w-9 h-9 rounded-xl border-border/80 hover:bg-accent hover:border-primary/40 transition-all active:scale-95"
              >
                <RefreshCw className={cn('w-4 h-4 text-muted-foreground', isRefreshing && 'animate-spin text-primary')} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Refresh live data</TooltipContent>
          </Tooltip>

          {/* Dark / Light Mode Toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={toggleTheme}
                className="w-9 h-9 rounded-xl border-border/80 hover:bg-accent hover:border-primary/40 transition-all active:scale-95"
              >
                <AnimatePresence mode="wait" initial={false}>
                  {isDark ? (
                    <motion.div key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                      <Sun className="w-4 h-4 text-amber-400" />
                    </motion.div>
                  ) : (
                    <motion.div key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                      <Moon className="w-4 h-4 text-indigo-600" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </TooltipTrigger>
            <TooltipContent>{isDark ? 'Switch to Light' : 'Switch to Dark'}</TooltipContent>
          </Tooltip>

          {/* Avatar button */}
          <div className="relative group ml-1 cursor-pointer">
            <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-violet-600 to-indigo-500 blur-xs opacity-70 group-hover:opacity-100 transition duration-300" />
            <div className="relative w-9 h-9 rounded-full bg-slate-900 border border-white/20 flex items-center justify-center text-white font-bold text-xs shadow-md">
              <User className="w-4 h-4 text-indigo-300" />
            </div>
          </div>
        </div>
      </header>
    </TooltipProvider>
  )
}
