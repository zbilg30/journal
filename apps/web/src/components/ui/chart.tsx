"use client"

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { cn } from '@/lib/utils'

type ChartConfigItem = {
  label: string
  color?: string
}

export type ChartConfig = Record<string, ChartConfigItem>

type ChartContainerProps = {
  children: React.ReactNode
  className?: string
  config: ChartConfig
}

export function ChartContainer({ children, className, config }: ChartContainerProps) {
  return (
    <div
      className={cn(
        'relative flex w-full min-w-0 flex-col gap-4 rounded-3xl border border-border/60 bg-card/70 p-4 shadow-sm shadow-black/30',
        className,
      )}
      data-recharts-config={JSON.stringify(config)}
    >
      {children}
    </div>
  )
}

export {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
}
