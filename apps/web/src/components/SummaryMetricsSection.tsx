import { useMemo, type ReactNode } from 'react'

import {
  ChartContainer,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from '@/components/ui/chart'
import { cn } from '@/lib/utils'
import type { CalendarMonthlySummary, TradeDayData } from '@/components/CalendarSection'
import { Button } from '@/components/ui/button'

const preciseCurrencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
})

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

const dayLabelFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
})

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

type SummaryMetricsSectionProps = {
  monthData: Record<string, TradeDayData>
  monthlySummary: CalendarMonthlySummary
}

const profitFactorChartConfig = {
  profit: { label: 'Profit', color: '#34d399' },
  loss: { label: 'Loss', color: '#f87171' },
}

export function SummaryMetricsSection({ monthData, monthlySummary }: SummaryMetricsSectionProps) {
  const tradeStats = useMemo(() => {
    let grossProfit = 0
    let grossLoss = 0
    let positiveTradeCount = 0
    let negativeTradeCount = 0

    Object.values(monthData).forEach((day) => {
      if (day.net > 0) {
        grossProfit += day.net
        positiveTradeCount += day.trades
      } else if (day.net < 0) {
        grossLoss += Math.abs(day.net)
        negativeTradeCount += day.trades
      }
    })

    return {
      grossProfit,
      grossLoss,
      positiveTradeCount,
      negativeTradeCount,
    }
  }, [monthData])

  const totalTrades = monthlySummary.tradeCount
  const expectancyValue = totalTrades > 0 ? monthlySummary.net / totalTrades : 0
  const expectancyLabel = totalTrades > 0 ? preciseCurrencyFormatter.format(expectancyValue) : '—'

  const profitFactorValue = tradeStats.grossLoss > 0 ? tradeStats.grossProfit / tradeStats.grossLoss : null
  const profitFactorLabel = profitFactorValue ? profitFactorValue.toFixed(2) : '—'

  const averageWin = tradeStats.positiveTradeCount > 0 ? tradeStats.grossProfit / tradeStats.positiveTradeCount : 0
  const averageLoss = tradeStats.negativeTradeCount > 0 ? tradeStats.grossLoss / tradeStats.negativeTradeCount : 0

  const averageWinLabel = tradeStats.positiveTradeCount > 0 ? preciseCurrencyFormatter.format(averageWin) : '—'
  const averageLossLabel = tradeStats.negativeTradeCount > 0 ? preciseCurrencyFormatter.format(-averageLoss) : '—'
  const winLossRatio = averageLoss > 0 ? (averageWin / averageLoss).toFixed(2) : null

  const netTrendLabel = tradeStats.grossLoss > 0 ? preciseCurrencyFormatter.format(-tradeStats.grossLoss) : undefined

  const profitFactorChartData = useMemo(() => {
    const total = tradeStats.grossProfit + tradeStats.grossLoss
    if (total <= 0) return []

    return [
      { name: 'Profit', value: tradeStats.grossProfit, fill: '#34d399' },
      { name: 'Loss', value: tradeStats.grossLoss, fill: '#f87171' },
    ]
  }, [tradeStats])

  return (
    <section className="rounded-[36px] border border-muted/40 bg-white/90 p-6 shadow-lg shadow-purple-400/20">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Last import</span>
          <p className="text-sm font-semibold text-foreground/80">{dayLabelFormatter.format(new Date())}</p>
          <button className="text-xs font-semibold text-primary hover:underline" type="button">
            Resync
          </button>
        </div>
        <Button size="sm" variant="secondary">
          Start my day
        </Button>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryMetricCard
          helper="Month-to-date net performance"
          label="Net P&L"
          trendLabel={netTrendLabel}
          trendTone={monthlySummary.net >= 0 ? 'positive' : 'negative'}
          value={currencyFormatter.format(monthlySummary.net)}
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
                      formatter={(value: number, name: string) => [preciseCurrencyFormatter.format(value), name]}
                    />
                    <RadialBar background dataKey="value" cornerRadius={16} />
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p>
                  Gross profit{' '}
                  <span className="font-semibold text-emerald-600">
                    {preciseCurrencyFormatter.format(tradeStats.grossProfit)}
                  </span>
                </p>
                <p>
                  Gross loss{' '}
                  <span className="font-semibold text-rose-500">
                    {tradeStats.grossLoss > 0 ? preciseCurrencyFormatter.format(-tradeStats.grossLoss) : '—'}
                  </span>
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
