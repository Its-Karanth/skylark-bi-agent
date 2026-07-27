import React from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid
} from 'recharts'
import { formatCurrency, stringToColor } from '@/lib/utils'
import type { Deal } from '@/types'

interface RevenueByStageChartProps {
  deals: Deal[]
}

const CUSTOM_TOOLTIP = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover border border-border rounded-xl px-3 py-2 shadow-2xl text-sm">
        <p className="font-semibold text-foreground">{label}</p>
        <p className="text-primary">{formatCurrency(payload[0].value)}</p>
      </div>
    )
  }
  return null
}

export function RevenueByStageChart({ deals }: RevenueByStageChartProps) {
  const stageMap: Record<string, number> = {}
  deals.forEach((d) => {
    if (d.deal_value && d.stage && d.stage !== 'Unknown') {
      stageMap[d.stage] = (stageMap[d.stage] || 0) + d.deal_value
    }
  })

  const data = Object.entries(stageMap)
    .map(([stage, value]) => ({ stage, value: Math.round(value) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8)

  if (data.length === 0) return <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">No revenue data</div>

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis
          dataKey="stage"
          tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
          axisLine={false}
          tickLine={false}
          angle={-30}
          textAnchor="end"
          height={50}
        />
        <YAxis
          tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
          tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
          axisLine={false}
          tickLine={false}
          width={50}
        />
        <Tooltip content={<CUSTOM_TOOLTIP />} cursor={{ fill: 'hsl(var(--muted)/0.5)' }} />
        <Bar dataKey="value" radius={[6, 6, 0, 0]} animationDuration={800}>
          {data.map((entry, i) => (
            <Cell key={entry.stage} fill={stringToColor(entry.stage)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
