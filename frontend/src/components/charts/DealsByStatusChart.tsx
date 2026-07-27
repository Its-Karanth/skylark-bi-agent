import React from 'react'
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { stringToColor } from '@/lib/utils'

interface ChartData { name: string; value: number }

interface DealsByStatusChartProps {
  distribution: Record<string, number>
}

const CUSTOM_TOOLTIP = ({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: ChartData }> }) => {
  if (active && payload && payload.length) {
    const item = payload[0]
    return (
      <div className="bg-popover border border-border rounded-xl px-3 py-2 shadow-2xl text-sm">
        <p className="font-semibold text-foreground">{item.name}</p>
        <p className="text-muted-foreground">{item.value} deals</p>
      </div>
    )
  }
  return null
}

export function DealsByStatusChart({ distribution }: DealsByStatusChartProps) {
  const data: ChartData[] = Object.entries(distribution)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  if (data.length === 0) return <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">No data</div>

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={3}
          dataKey="value"
          animationBegin={0}
          animationDuration={800}
        >
          {data.map((entry, i) => (
            <Cell key={entry.name} fill={stringToColor(entry.name)} stroke="transparent" />
          ))}
        </Pie>
        <Tooltip content={<CUSTOM_TOOLTIP />} />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(value) => <span className="text-xs text-muted-foreground">{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
