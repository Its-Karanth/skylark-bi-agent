import React from 'react'
import { motion } from 'framer-motion'
import {
  Handshake, TrendingUp, Trophy, XCircle, BarChart2,
  Zap, ClipboardList, Clock, CheckCircle2, AlertTriangle, Target,
  IndianRupee, Sparkles, ArrowUpRight
} from 'lucide-react'
import { KPICard } from '@/components/dashboard/KPICard'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { DealsByStatusChart } from '@/components/charts/DealsByStatusChart'
import { RevenueByStageChart } from '@/components/charts/RevenueByStageChart'
import { WorkOrderStatusChart } from '@/components/charts/WorkOrderStatusChart'
import { MonthlyTrendsChart } from '@/components/charts/MonthlyTrendsChart'
import { ErrorState } from '@/components/common/EmptyState'
import { Skeleton } from '@/components/ui/skeleton'
import { useDeals } from '@/hooks/useDeals'
import { useWorkOrders } from '@/hooks/useWorkOrders'
import { Link } from 'react-router-dom'

export function DashboardPage() {
  const dealsQ = useDeals()
  const woQ = useWorkOrders()

  const deals = dealsQ.data?.deals || []
  const dealsSummary = dealsQ.data?.summary
  const woSummary = woQ.data?.summary

  const kpiLoading = dealsQ.isLoading || woQ.isLoading

  if (dealsQ.isError && woQ.isError) {
    return (
      <div className="p-6">
        <ErrorState
          title="Could not load data"
          message="Backend is unreachable. Make sure the Express server is running on port 3000."
          onRetry={() => { dealsQ.refetch(); woQ.refetch() }}
        />
      </div>
    )
  }

  const kpis = [
    { title: 'Total Deals', value: dealsSummary?.total ?? 0, icon: <Handshake className="w-5 h-5" />, color: 'blue' as const, format: 'number' as const },
    { title: 'Open Deals', value: dealsSummary?.open ?? 0, icon: <Target className="w-5 h-5" />, color: 'cyan' as const, format: 'number' as const },
    { title: 'Won Deals', value: dealsSummary?.won ?? 0, icon: <Trophy className="w-5 h-5" />, color: 'green' as const, format: 'number' as const },
    { title: 'Lost Deals', value: dealsSummary?.lost ?? 0, icon: <XCircle className="w-5 h-5" />, color: 'red' as const, format: 'number' as const },
    { title: 'Won Revenue', value: dealsSummary?.totalWonRevenue ?? 0, icon: <IndianRupee className="w-5 h-5" />, color: 'green' as const, format: 'currency' as const },
    { title: 'Avg Deal Value', value: dealsSummary?.averageDealValue ?? 0, icon: <BarChart2 className="w-5 h-5" />, color: 'purple' as const, format: 'currency' as const },
    { title: 'Win Rate', value: dealsSummary?.winRate ?? '0%', icon: <TrendingUp className="w-5 h-5" />, color: 'amber' as const, format: 'raw' as const },
    { title: 'Total Work Orders', value: woSummary?.total ?? 0, icon: <ClipboardList className="w-5 h-5" />, color: 'blue' as const, format: 'number' as const },
    { title: 'In Progress', value: woSummary?.inProgress ?? 0, icon: <Zap className="w-5 h-5" />, color: 'cyan' as const, format: 'number' as const },
    { title: 'Completed', value: woSummary?.done ?? 0, icon: <CheckCircle2 className="w-5 h-5" />, color: 'green' as const, format: 'number' as const },
    { title: 'Overdue Orders', value: woSummary?.overdue ?? 0, icon: <AlertTriangle className="w-5 h-5" />, color: 'red' as const, format: 'number' as const },
    { title: 'Critical Overdue', value: woSummary?.criticalOverdue ?? 0, icon: <Clock className="w-5 h-5" />, color: 'red' as const, format: 'number' as const },
  ]

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Hero Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-900/60 via-indigo-900/40 to-slate-900/80 border border-violet-500/30 p-6 md:p-8 shadow-2xl backdrop-blur-2xl"
      >
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 rounded-full bg-gradient-to-br from-violet-500/20 via-cyan-500/10 to-transparent blur-2xl pointer-events-none animate-pulse-glow" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/20 border border-violet-500/40 text-violet-300 text-xs font-bold uppercase tracking-widest shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Skylark Business Intelligence
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
              Revenue & Operational Intelligence
            </h1>
            <p className="text-slate-300 text-sm md:text-base max-w-2xl leading-relaxed">
              Real-time GraphQL synchronization with monday.com. Ask <strong className="text-cyan-300 font-semibold">ARIA AI</strong> for instant founder-level business insights.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <Link
              to="/ai"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Sparkles className="w-4 h-4 text-cyan-300" />
              Ask ARIA AI
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </motion.div>

      {/* KPI grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-violet-500 animate-ping" />
            Executive Dashboard KPIs
          </h2>
          <span className="text-xs font-medium text-muted-foreground">Currency: INR (₹)</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {kpis.map((kpi, i) => (
            <KPICard key={kpi.title} {...kpi} index={i} isLoading={kpiLoading} />
          ))}
        </div>
      </div>

      {/* Charts section 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
          <Card className="glass-card overflow-hidden">
            <CardHeader className="pb-2 border-b border-border/40">
              <CardTitle className="text-base font-bold flex items-center justify-between">
                <span>Deals by Status</span>
                <span className="text-xs font-normal text-muted-foreground">Pipeline Stages</span>
              </CardTitle>
              <CardDescription>Distribution across active deal states</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              {dealsQ.isLoading
                ? <Skeleton className="h-[220px] w-full rounded-xl" />
                : <DealsByStatusChart distribution={dealsSummary?.statusDistribution || {}} />
              }
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.25 }}>
          <Card className="glass-card overflow-hidden">
            <CardHeader className="pb-2 border-b border-border/40">
              <CardTitle className="text-base font-bold flex items-center justify-between">
                <span>Revenue by Stage</span>
                <span className="text-xs font-semibold text-emerald-400">Values in ₹</span>
              </CardTitle>
              <CardDescription>Pipeline valuation categorized by sales stage</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              {dealsQ.isLoading
                ? <Skeleton className="h-[220px] w-full rounded-xl" />
                : <RevenueByStageChart deals={deals} />
              }
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts section 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }}>
          <Card className="glass-card overflow-hidden">
            <CardHeader className="pb-2 border-b border-border/40">
              <CardTitle className="text-base font-bold">Work Order Execution</CardTitle>
              <CardDescription>Status breakdown of operations & engineering tasks</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              {woQ.isLoading
                ? <Skeleton className="h-[200px] w-full rounded-xl" />
                : <WorkOrderStatusChart distribution={woSummary?.statusDistribution || {}} />
              }
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.35 }}>
          <Card className="glass-card overflow-hidden">
            <CardHeader className="pb-2 border-b border-border/40">
              <CardTitle className="text-base font-bold">Monthly Deal Velocity</CardTitle>
              <CardDescription>Comparison of new deal arrivals vs won deals</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              {dealsQ.isLoading
                ? <Skeleton className="h-[220px] w-full rounded-xl" />
                : <MonthlyTrendsChart deals={deals} />
              }
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
