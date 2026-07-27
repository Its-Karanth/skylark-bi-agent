import React from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell
} from 'recharts'
import { stringToColor } from '@/lib/utils'
import type { Deal } from '@/types'

interface DealsByIndustryChartProps {
  deals: Deal[]
}

const CUSTOM_TOOLTIP = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover border border-border rounded-xl px-3 py-2 shadow-2xl text-sm">
        <p className="font-semibold text-foreground">{label}</p>
        <p className="text-muted-foreground">{payload[0].value} deals</p>
      </div>
    )
  }
  return null
}

export function DealsByIndustryChart({ deals }: DealsByIndustryChartProps) {
  const industryMap: Record<string, number> = {}
  deals.forEach((d) => {
    const ind = d.industry && d.industry !== 'Unknown' ? d.industry : 'Other'
    industryMap[ind] = (industryMap[ind] || 0) + 1
  })

  const data = Object.entries(industryMap)
    .map(([industry, count]) => ({ industry, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  if (data.length === 0) return <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">No industry data</div>

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
        <YAxis
          type="category"
          dataKey="industry"
          tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
          axisLine={false}
          tickLine={false}
          width={90}
        />
        <Tooltip content={<CUSTOM_TOOLTIP />} cursor={{ fill: 'hsl(var(--muted)/0.5)' }} />
        <Bar dataKey="count" radius={[0, 6, 6, 0]} animationDuration={800}>
          {data.map((entry) => (
            <Cell key={entry.industry} fill={stringToColor(entry.industry)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
