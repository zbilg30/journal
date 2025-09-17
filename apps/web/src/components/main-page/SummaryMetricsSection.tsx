import type { ReactNode } from 'react'

import {
  ChartContainer,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from '@/components/ui/chart'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import type { TradeStats } from './types'

type SummaryMetricsSectionProps = {
  lastImportLabel: string
  monthNetLabel: string
  netTrendLabel?: string
  netPositive: boolean
  totalTrades: number
  expectancyLabel: string
  profitFactorLabel: string
  profitFactorChartData: { name: string; value: number; fill: string }[]
  profitFactorChartConfig: Record<string, { label: string; color: string }>
  tradeStats: TradeStats
  averageWinLabel: string
  averageLossLabel: string
  winLossRatio: string | null
  onStartDay?: () => void
  onResync?: () => void
  formatPreciseCurrency: (value: number) => string
}

type SummaryMetricCardProps = {
  label: string
  value: string
  helper?: string
  trendLabel?: string
  trendTone?: 'positive' | 'negative' | 'neutral'
  children?: ReactNode
}

function SummaryMetricCard({ label, value, helper, trendLabel, trendTone = 'neutral', children }: SummaryMetricCardProps) {
  const trendClasses =
    trendTone === 'positive'
      ? 'text-emerald-600'
      : trendTone === 'negative'
        ? 'text-rose-500'
        : 'text-muted-foreground'

  return (
    <article className="flex flex-col justify-between gap-3 rounded-3xl border border-muted/50 bg-white/90 p-5 shadow-sm shadow-black/[0.04]">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
          <p className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">{value}</p>
        </div>
        {trendLabel ? <span className={cn('text-xs font-semibold', trendClasses)}>{trendLabel}</span> : null}
      </div>
      {helper ? <p className="text-xs text-muted-foreground">{helper}</p> : null}
      {children}
    </article>
  )
}

export function SummaryMetricsSection({
  lastImportLabel,
  monthNetLabel,
  netTrendLabel,
  netPositive,
  totalTrades,
  expectancyLabel,
  profitFactorLabel,
  profitFactorChartData,
  profitFactorChartConfig,
  tradeStats,
  averageWinLabel,
  averageLossLabel,
  winLossRatio,
  onStartDay,
  onResync,
  formatPreciseCurrency,
}: SummaryMetricsSectionProps) {
  return (
    <section className="rounded-[36px] border border-muted/40 bg-white/90 p-6 shadow-lg shadow-purple-400/20">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Last import</span>
          <p className="text-sm font-semibold text-foreground/80">{lastImportLabel}</p>
          <button
            className="text-xs font-semibold text-primary hover:underline"
            type="button"
            onClick={onResync}
          >
            Resync
          </button>
        </div>
        <Button size="sm" variant="secondary" onClick={onStartDay}>
          Start my day
        </Button>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryMetricCard
          helper="Month-to-date net performance"
          label="Net P&L"
          trendLabel={netTrendLabel}
          trendTone={netPositive ? 'positive' : 'negative'}
          value={monthNetLabel}
        />

        <SummaryMetricCard helper="Average profit per trade" label="Trade Expectancy" value={expectancyLabel}>
          <span className="text-[11px] font-medium text-muted-foreground">
            Based on {totalTrades} {totalTrades === 1 ? 'trade' : 'trades'} this period
          </span>
        </SummaryMetricCard>

        <SummaryMetricCard helper="Gross profit versus gross loss" label="Profit Factor" value={profitFactorLabel}>
          {profitFactorChartData.length ? (
            <ChartContainer
              className="flex items-center justify-between gap-4 border-none bg-transparent p-0 shadow-none"
              config={profitFactorChartConfig}
            >
              <div className="h-16 w-16">
                <ResponsiveContainer>
                  <RadialBarChart
                    barCategoryGap={0}
                    data={profitFactorChartData}
                    endAngle={360}
                    innerRadius="40%"
                    outerRadius="100%"
                    startAngle={90}
                  >
                    <RechartsTooltip
                      contentStyle={{ borderRadius: 12, borderColor: 'rgba(0,0,0,0.08)' }}
                      formatter={(value: number, name: string) => [formatPreciseCurrency(value), name]}
                    />
                    <RadialBar background dataKey="value" cornerRadius={16} />
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p>
                  Gross profit{' '}
                  <span className="font-semibold text-emerald-600">{formatPreciseCurrency(tradeStats.grossProfit)}</span>
                </p>
                <p>
                  Gross loss{' '}
                  <span className="font-semibold text-rose-500">{tradeStats.grossLoss > 0 ? formatPreciseCurrency(-tradeStats.grossLoss) : '—'}</span>
                </p>
              </div>
            </ChartContainer>
          ) : (
            <p className="text-xs text-muted-foreground">No realized profits or losses this period.</p>
          )}
        </SummaryMetricCard>

        <SummaryMetricCard helper="Average win vs. loss per trade" label="Avg win/loss trade" value={winLossRatio ?? '—'}>
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-emerald-600">{averageWinLabel}</span>
            <span className="text-rose-500">{averageLossLabel}</span>
          </div>
        </SummaryMetricCard>
      </div>
    </section>
  )
}
