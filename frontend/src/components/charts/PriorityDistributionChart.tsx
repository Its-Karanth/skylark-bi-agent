import React from 'react'
import {
  RadialBarChart, RadialBar, Legend, ResponsiveContainer, Tooltip
} from 'recharts'
import { stringToColor } from '@/lib/utils'

interface PriorityDistributionChartProps {
  distribution: Record<string, number>
}

const ORDER = ['Critical', 'High', 'Medium', 'Low', 'Unknown']

const COLORS: Record<string, string> = {
  Critical: '#ef4444',
  High: '#f97316',
  Medium: '#f59e0b',
  Low: '#10b981',
  Unknown: '#94a3b8',
}

const CUSTOM_TOOLTIP = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: { name: string; value: number } }> }) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload
    return (
      <div className="bg-popover border border-border rounded-xl px-3 py-2 shadow-2xl text-sm">
        <p className="font-semibold text-foreground">{item.name}</p>
        <p className="text-muted-foreground">{item.value} items</p>
      </div>
    )
  }
  return null
}

export function PriorityDistributionChart({ distribution }: PriorityDistributionChartProps) {
  const total = Object.values(distribution).reduce((s, v) => s + v, 0)
  if (total === 0) return <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">No priority data</div>

  const data = ORDER
    .filter((p) => distribution[p] > 0)
    .map((name) => ({
      name,
      value: distribution[name] || 0,
      fill: COLORS[name] || stringToColor(name),
    }))

  return (
    <ResponsiveContainer width="100%" height={200}>
      <RadialBarChart
        cx="50%"
        cy="50%"
        innerRadius={20}
        outerRadius={80}
        barSize={12}
        data={data}
        startAngle={90}
        endAngle={-270}
      >
        <RadialBar dataKey="value" background={{ fill: 'hsl(var(--muted))' }} animationDuration={800} />
        <Tooltip content={<CUSTOM_TOOLTIP />} />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(v) => <span className="text-xs text-muted-foreground">{v}</span>}
        />
      </RadialBarChart>
    </ResponsiveContainer>
  )
}
