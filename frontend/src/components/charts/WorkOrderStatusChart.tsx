import React from 'react'
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { stringToColor } from '@/lib/utils'

interface WorkOrderStatusChartProps {
  distribution: Record<string, number>
}

const CUSTOM_TOOLTIP = ({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number }> }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover border border-border rounded-xl px-3 py-2 shadow-2xl text-sm">
        <p className="font-semibold text-foreground">{payload[0].name}</p>
        <p className="text-muted-foreground">{payload[0].value} orders</p>
      </div>
    )
  }
  return null
}

export function WorkOrderStatusChart({ distribution }: WorkOrderStatusChartProps) {
  const data = Object.entries(distribution)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value }))

  if (data.length === 0) return <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">No data</div>

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          outerRadius={80}
          paddingAngle={3}
          dataKey="value"
          animationBegin={0}
          animationDuration={800}
        >
          {data.map((entry) => (
            <Cell key={entry.name} fill={stringToColor(entry.name)} stroke="transparent" />
          ))}
        </Pie>
        <Tooltip content={<CUSTOM_TOOLTIP />} />
        <Legend iconType="circle" iconSize={8} formatter={(v) => <span className="text-xs text-muted-foreground">{v}</span>} />
      </PieChart>
    </ResponsiveContainer>
  )
}
