import React from 'react'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from 'recharts'
import { format, parseISO, startOfMonth } from 'date-fns'
import type { Deal } from '@/types'

interface MonthlyTrendsChartProps {
  deals: Deal[]
}

const CUSTOM_TOOLTIP = ({ active, payload, label }: { active?: boolean; payload?: Array<{ dataKey: string; value: number; color: string }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover border border-border rounded-xl px-3 py-2.5 shadow-2xl text-sm space-y-1">
        <p className="font-semibold text-foreground">{label}</p>
        {payload.map((p) => (
          <p key={p.dataKey} style={{ color: p.color }} className="text-xs">
            {p.dataKey === 'deals' ? 'New Deals' : 'Won Deals'}: {p.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export function MonthlyTrendsChart({ deals }: MonthlyTrendsChartProps) {
  // Group deals by month created
  const monthMap: Record<string, { deals: number; won: number }> = {}

  deals.forEach((d) => {
    const dateStr = d.created_at || d.close_date
    if (!dateStr) return
    try {
      const month = format(startOfMonth(parseISO(dateStr)), 'MMM yyyy')
      if (!monthMap[month]) monthMap[month] = { deals: 0, won: 0 }
      monthMap[month].deals++
      if (d.status === 'Won') monthMap[month].won++
    } catch { /* skip invalid dates */ }
  })

  const data = Object.entries(monthMap)
    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
    .slice(-12)
    .map(([month, vals]) => ({ month, ...vals }))

  if (data.length === 0) return <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">No monthly data</div>

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} width={30} />
        <Tooltip content={<CUSTOM_TOOLTIP />} />
        <Legend iconType="circle" iconSize={8} formatter={(v) => <span className="text-xs text-muted-foreground">{v === 'deals' ? 'New Deals' : 'Won'}</span>} />
        <Line type="monotone" dataKey="deals" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} animationDuration={800} />
        <Line type="monotone" dataKey="won" stroke="#10b981" strokeWidth={2} dot={false} animationDuration={800} />
      </LineChart>
    </ResponsiveContainer>
  )
}
