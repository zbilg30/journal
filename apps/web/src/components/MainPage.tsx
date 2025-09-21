import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { useMutation, useQuery } from 'urql'

import { AddSetupDialog, type AddSetupInput } from '@/components/AddSetupDialog'
import { AddTradeDialog, type AddTradeInput } from '@/components/AddTradeDialog'
import {
  CalendarSection,
  type CalendarDay,
  type CalendarMonthlySummary,
  type CalendarWeek,
  type TradeDayData,
} from '@/components/CalendarSection'
import { PairsPanel, type TradingPair } from '@/components/PairsPanel'
import { SetupsPanel, type TradingSetup } from '@/components/SetupsPanel'
import { ThemeSwitcher } from '@/components/ThemeSwitcher'
import {
  ChartContainer,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from '@/components/ui/chart'
import {
  AddSetupDocument,
  AddTradeDocument,
  GetSetupsDocument,
  MonthlyJournalDocument,
  type GetSetupsQuery,
  type MonthlyJournalQuery,
} from '@/generated/graphql'
//@ts-expect-error ignore
type SetupLike = GetSetupsQuery['setups'][number]

function normalizeSetup(apiSetup: SetupLike): TradingSetup | null {
  if (!apiSetup.id || !apiSetup.name || !apiSetup.bias || !apiSetup.description) {
    return null
  }

  return {
    id: apiSetup.id,
    name: apiSetup.name,
    bias: apiSetup.bias,
    description: apiSetup.description,
    focusTag: apiSetup.focusTag ?? undefined,
    lastExecuted: apiSetup.lastExecuted ?? undefined,
    stats: apiSetup.stats
      ? {
          winRate: apiSetup.stats.winRate,
          avgR: apiSetup.stats.avgR,
          sample: apiSetup.stats.sample,
        }
      : undefined,
  }
}

//@ts-expect-error ignore
type TradeDayLike = MonthlyJournalQuery['monthlyJournal']["days"][number]

function normalizeTradeDay(step: TradeDayLike | null | undefined): TradeDayData | null {
  if (!step.date || typeof step.net !== 'number' || typeof step.trades !== 'number' || !step.pair) {
    return null
  }

  const direction = step.direction === 'short' ? 'short' : 'long'
  const closedBy: TradeDayData['closedBy'] = step.closedBy === 'manual' ? 'manual' : step.closedBy === 'sl' ? 'sl' : 'tp'

  return {
    net: step.net,
    trades: step.trades,
    pair: step.pair,
    rr: step.rr ?? undefined,
    direction,
    session: step.session ?? undefined,
    closedBy,
    riskPercent: step.riskPercent ?? undefined,
    emotion: step.emotion ?? undefined,
    withPlan: Boolean(step.withPlan),
    description: step.description ?? undefined,
    setupId: step.setupId ?? undefined,
  }
}
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabaseClient'
import { Chatbot } from '@/components/Chatbot'

type TradingJournalData = Record<string, Record<string, TradeDayData>>

const defaultTradingPairs: TradingPair[] = [
  { id: 'eurusd', symbol: 'EURUSD' },
  { id: 'usdjpy', symbol: 'USDJPY' },
  { id: 'gbpusd', symbol: 'GBPUSD' },
]

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

const monthLabelFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  year: 'numeric',
})

const dayLabelFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
})

function getMonthKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

function formatIsoDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatTradeMetaLabel(trade: TradeDayData, setupNameById: Record<string, string>) {
  const directionLabel = trade.direction === 'long' ? 'Long' : 'Short'
  const setupLabel = trade.setupId ? setupNameById[trade.setupId] : undefined
  return setupLabel ? `${trade.pair} • ${directionLabel} • ${setupLabel}` : `${trade.pair} • ${directionLabel}`
}

function formatCompactCurrency(value: number) {
  const abs = Math.abs(value)
  if (abs >= 1000) {
    const truncated = Math.floor(abs / 100) / 10
    const display = Number.isInteger(truncated) ? truncated.toFixed(0) : truncated.toFixed(1)
    return `${value < 0 ? '-' : ''}$${display}K`
  }

  return `${value < 0 ? '-' : ''}$${abs.toLocaleString('en-US')}`
}

function buildCalendarWeeks(
  activeDate: Date,
  tradingJournalData: TradingJournalData,
  setupNameById: Record<string, string>,
): { weeks: CalendarWeek[]; monthlySummary: CalendarMonthlySummary } {
  const monthKey = getMonthKey(activeDate)
  const monthData = tradingJournalData[monthKey] ?? {}

  const firstOfMonth = new Date(activeDate.getFullYear(), activeDate.getMonth(), 1)
  const lastOfMonth = new Date(activeDate.getFullYear(), activeDate.getMonth() + 1, 0)

  const startOfCalendar = new Date(firstOfMonth)
  startOfCalendar.setDate(firstOfMonth.getDate() - firstOfMonth.getDay())

  const endOfCalendar = new Date(lastOfMonth)
  endOfCalendar.setDate(lastOfMonth.getDate() + (6 - lastOfMonth.getDay()))

  const weeks: CalendarWeek[] = []
  const current = new Date(startOfCalendar)
  let weekIndex = 1

  while (current <= endOfCalendar) {
    const days: CalendarDay[] = []
    let weekNet = 0
    let weekActiveDays = 0

    for (let i = 0; i < 7; i += 1) {
      const currentDate = new Date(current)
      const isoKey = formatIsoDate(currentDate)
      const isCurrentMonth = currentDate.getMonth() === activeDate.getMonth()
      const tradeData = monthData[isoKey]

      let highlight: CalendarDay['highlight']
      let valueLabel: string | undefined
      let tradesLabel: string | undefined

      if (tradeData) {
        highlight = tradeData.net > 0 ? 'positive' : tradeData.net < 0 ? 'negative' : undefined
        valueLabel = formatCompactCurrency(tradeData.net)
        tradesLabel = formatTradeMetaLabel(tradeData, setupNameById)
        weekNet += tradeData.net
        weekActiveDays += 1
      }

      days.push({
        id: isoKey,
        dayNumber: isCurrentMonth ? currentDate.getDate() : undefined,
        isCurrentMonth,
        highlight,
        valueLabel,
        tradesLabel,
      })

      current.setDate(current.getDate() + 1)
    }

    const tone: CalendarWeek['tone'] = weekNet > 0 ? 'positive' : weekNet < 0 ? 'negative' : 'neutral'

    weeks.push({
      id: `week-${weekIndex}`,
      label: `Week ${weekIndex}`,
      total: weekNet,
      tradingDays: weekActiveDays,
      tone,
      days,
    })

    weekIndex += 1
  }

  const monthTotals = Object.values(monthData).reduce<CalendarMonthlySummary>(
    (acc, { net, trades }) => {
      acc.net += net
      acc.tradeCount += trades
      acc.activeDays += 1
      return acc
    },
    { net: 0, tradeCount: 0, activeDays: 0 },
  )

  return { weeks, monthlySummary: monthTotals }
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
      ? 'text-emerald-300'
      : trendTone === 'negative'
        ? 'text-rose-300'
        : 'text-muted-foreground'

  return (
    <article className="flex flex-col justify-between gap-3 rounded-3xl border border-border bg-card p-5 shadow-sm">
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

type MainPageProps = {
  session: Session
}

export function MainPage({ session }: MainPageProps) {
  const [activeMonth, setActiveMonth] = useState(() => new Date(2025, 3, 1))
  const [activeDate, setActiveDate] = useState(() => new Date(2025, 3, 1))
  const [journalData, setJournalData] = useState<TradingJournalData>({})
  const [isAddTradeOpen, setIsAddTradeOpen] = useState(false)
  const [isAddSetupOpen, setIsAddSetupOpen] = useState(false)
  const [tradingPairs, setTradingPairs] = useState<TradingPair[]>(defaultTradingPairs)
  const [setups, setSetups] = useState<TradingSetup[]>([])
  const [isMobileView, setIsMobileView] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(max-width: 1023px)').matches
  })

  const monthKey = useMemo(() => getMonthKey(activeMonth), [activeMonth])

  const [{ data: setupsQueryData }] = useQuery({ query: GetSetupsDocument })
  const [{ data: journalQueryData }] = useQuery({
    query: MonthlyJournalDocument,
    variables: { month: monthKey },
  })

  const [, executeAddSetup] = useMutation(AddSetupDocument)
  const [, executeAddTrade] = useMutation(AddTradeDocument)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(max-width: 1023px)')

    const handleChange = (event: MediaQueryListEvent) => {
      setIsMobileView(event.matches)
    }

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange)
    } else {
      mediaQuery.addListener(handleChange)
    }

    setIsMobileView(mediaQuery.matches)

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange)
      } else {
        mediaQuery.removeListener(handleChange)
      }
    }
  }, [])

  useEffect(() => {
    if (setupsQueryData?.setups) {
      const mapped: TradingSetup[] = setupsQueryData.setups
        .map(normalizeSetup)
        .filter((setup): setup is TradingSetup => Boolean(setup))
      setSetups(mapped)
    }
  }, [setupsQueryData])

  useEffect(() => {
    if (!journalQueryData?.monthlyJournal) {
      if (Object.keys(journalData).length !== 0) {
        setJournalData({})
      }
      return
    }

    const { month, days } = journalQueryData.monthlyJournal
    if (!month) return

    const nextMonthData = (Array.isArray(days) ? days : []).reduce<Record<string, TradeDayData>>((acc, day) => {
      const normalized = normalizeTradeDay(day)
      if (!normalized || !day?.date) return acc
      acc[day.date] = normalized
      return acc
    }, {})

    setJournalData((prev) => ({
      ...prev,
      [month]: nextMonthData,
    }))
  }, [journalQueryData, journalData])

  const setupNameMap = useMemo(
    () =>
      setups.reduce<Record<string, string>>((acc, setup) => {
        acc[setup.id] = setup.name
        return acc
      }, {}),
    [setups],
  )

  const { weeks, monthlySummary } = useMemo(
    () => buildCalendarWeeks(activeMonth, journalData, setupNameMap),
    [activeMonth, journalData, setupNameMap],
  )
  const monthLabel = monthLabelFormatter.format(activeMonth)
  const periodLabel = isMobileView ? dayLabelFormatter.format(activeDate) : monthLabel

  const handleSignOut = async () => {
    if (!supabase) return

    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error('Failed to sign out', error)
    }
  }

  const shiftActiveDay = useCallback((delta: number) => {
    setActiveDate((prev) => {
      const next = new Date(prev)
      next.setDate(prev.getDate() + delta)
      return next
    })
  }, [])

  const handlePrevious = useCallback(() => {
    if (isMobileView) {
      shiftActiveDay(-1)
      return
    }
    setActiveMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }, [isMobileView, shiftActiveDay])

  const handleNext = useCallback(() => {
    if (isMobileView) {
      shiftActiveDay(1)
      return
    }
    setActiveMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }, [isMobileView, shiftActiveDay])

  const handleOpenAddTrade = useCallback(() => {
    setIsAddTradeOpen(true)
  }, [])

  const monthNetLabel = monthlySummary.net === 0
    ? currencyFormatter.format(0)
    : `${monthlySummary.net > 0 ? '+' : '-'}${currencyFormatter.format(Math.abs(monthlySummary.net))}`

  const monthData = useMemo(() => journalData[monthKey] ?? {}, [journalData, monthKey])

  const chatContextSummary = useMemo(() => {
    const entries = Object.entries(monthData)
    if (!entries.length) {
      return `No trades have been logged for ${monthKey}.`
    }

    let winningDays = 0
    let losingDays = 0
    let flatDays = 0
    let bestDay: { date: string; net: number } | null = null
    let worstDay: { date: string; net: number } | null = null

    entries.forEach(([date, trade]) => {
      if (trade.net > 0) winningDays += 1
      else if (trade.net < 0) losingDays += 1
      else flatDays += 1

      if (!bestDay || trade.net > bestDay.net) {
        bestDay = { date, net: trade.net }
      }
      if (!worstDay || trade.net < worstDay.net) {
        worstDay = { date, net: trade.net }
      }
    })

    const formatDayLabel = (iso: string | undefined, value: number | undefined) => {
      if (!iso || typeof value !== 'number') return 'N/A'
      const displayDate = dayLabelFormatter.format(new Date(iso))
      return `${displayDate} (${currencyFormatter.format(value)})`
    }

    const setupNames = setups.length ? setups.map((setup) => setup.name).join(', ') : 'None recorded'
    const pairSymbols = tradingPairs.length ? tradingPairs.map((pair) => pair.symbol).join(', ') : 'None tracked'

    return [
      `Month ${monthKey}: net ${currencyFormatter.format(monthlySummary.net)}, trades ${monthlySummary.tradeCount}, active days ${monthlySummary.activeDays}.`,
      `Winning days: ${winningDays}, losing days: ${losingDays}, flat days: ${flatDays}.`,
      //@ts-expect-error ignore
      `Best day: ${formatDayLabel(bestDay?.date, bestDay?.net)}.`,
      //@ts-expect-error ignore
      `Toughest day: ${formatDayLabel(worstDay?.date, worstDay?.net)}.`,
      `Tracked setups: ${setupNames}. Active pairs: ${pairSymbols}.`,
    ].join(' ')
  }, [monthData, monthKey, monthlySummary, setups, tradingPairs])

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

  const activeDayIso = useMemo(() => formatIsoDate(activeDate), [activeDate])
  const activeMonthKey = useMemo(() => getMonthKey(activeDate), [activeDate])
  const activeTrade = journalData[activeMonthKey]?.[activeDayIso]

  const mobileDay: CalendarDay = useMemo(() => {
    const highlight = activeTrade
      ? activeTrade.net > 0
        ? 'positive'
        : activeTrade.net < 0
          ? 'negative'
          : undefined
      : undefined

    return {
      id: activeDayIso,
      dayNumber: activeDate.getDate(),
      isCurrentMonth: true,
      highlight,
      valueLabel: activeTrade ? formatCompactCurrency(activeTrade.net) : '$0',
      tradesLabel: activeTrade ? formatTradeMetaLabel(activeTrade, setupNameMap) : 'No trades',
    }
  }, [activeDate, activeDayIso, activeTrade, setupNameMap])

  const activeWeek = useMemo(
    () => weeks.find((week) => week.days.some((day) => day.id === activeDayIso)),
    [weeks, activeDayIso],
  )

  useEffect(() => {
    if (!isMobileView) return

    setActiveMonth((prev) => {
      if (
        prev.getFullYear() === activeDate.getFullYear() &&
        prev.getMonth() === activeDate.getMonth()
      ) {
        return prev
      }

      return new Date(activeDate.getFullYear(), activeDate.getMonth(), 1)
    })
  }, [activeDate, isMobileView])

  useEffect(() => {
    if (isMobileView) return

    setActiveDate((prev) => {
      if (
        prev.getFullYear() === activeMonth.getFullYear() &&
        prev.getMonth() === activeMonth.getMonth()
      ) {
        return prev
      }

      return new Date(activeMonth.getFullYear(), activeMonth.getMonth(), 1)
    })
  }, [activeMonth, isMobileView])

  const defaultAddTradeDate = useMemo(() => {
    if (isMobileView) {
      return formatIsoDate(activeDate)
    }

    const today = new Date()
    const sameMonth =
      today.getFullYear() === activeMonth.getFullYear() && today.getMonth() === activeMonth.getMonth()
    return formatIsoDate(sameMonth ? today : activeMonth)
  }, [activeDate, activeMonth, isMobileView])

  const handleAddPair = (symbol: string) => {
    const id = `${symbol}-${Date.now()}`
    setTradingPairs((prev) => [...prev, { id, symbol }])
  }

  const handleRemovePair = (id: string) => {
    setTradingPairs((prev) => prev.filter((pair) => pair.id !== id))
  }

  const handleCreateSetup = async (input: AddSetupInput) => {
    const { data, error } = await executeAddSetup({ input })
    if (error) {
      console.error('Failed to create setup', error)
    }

    const normalizedFromServer = data?.addSetup ? normalizeSetup(data.addSetup) : null
    const fallback: TradingSetup = {
      id: `setup-${Date.now().toString(36)}`,
      name: input.name,
      bias: input.bias,
      description: input.description,
      focusTag: undefined,
      stats: undefined,
    }

    const nextSetup = normalizedFromServer ?? fallback

    setSetups((prev) => {
      if (prev.some((setup) => setup.id === nextSetup.id)) {
        return prev
      }
      return [...prev, nextSetup]
    })
  }

  const handleCreateTrade = async ({
    date,
    net,
    trades,
    pair,
    rr,
    direction,
    session,
    closedBy,
    riskPercent,
    emotion,
    withPlan,
    description,
    setupId,
  }: AddTradeInput) => {
    const { data, error } = await executeAddTrade({
      input: {
        date,
        month: date.slice(0, 7),
        net,
        trades,
        pair,
        rr,
        direction,
        session,
        closedBy,
        riskPercent,
        emotion,
        withPlan,
        description,
        setupId,
      },
    })

    if (error) {
      console.error('Failed to create trade', error)
    }

    const normalizedFromServer = data?.addTrade
      ? normalizeTradeDay(data.addTrade)
      : normalizeTradeDay({
          date,
          net,
          trades,
          pair,
          rr,
          direction,
          session,
          closedBy,
          riskPercent,
          emotion,
          withPlan,
          description,
          setupId,
        })

    if (!normalizedFromServer) {
      return
    }

    const month = date.slice(0, 7)

    setJournalData((prev) => {
      const nextMonthData = {
        ...(prev[month] ?? {}),
        [date]: normalizedFromServer,
      }

      return {
        ...prev,
        [month]: nextMonthData,
      }
    })

    setActiveMonth((prev) => {
      const parsedDate = new Date(date)
      const sameMonth =
        parsedDate.getFullYear() === prev.getFullYear() && parsedDate.getMonth() === prev.getMonth()
      if (sameMonth) return prev
      return new Date(parsedDate.getFullYear(), parsedDate.getMonth(), 1)
    })
  }

  const profitFactorChartConfig = {
    profit: { label: 'Profit', color: '#34d399' },
    loss: { label: 'Loss', color: '#f87171' },
  }

  return (
    <main className="min-h-screen bg-background px-4 py-10 text-foreground">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="inline-flex items-center rounded-full border border-border bg-muted px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">
              Journal Trading
            </span>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Monthly Overview</h1>
            <p className="text-sm text-muted-foreground">
              Signed in as <span className="font-medium text-foreground">{session.user.email ?? 'your account'}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ThemeSwitcher />
            <Button variant="outline" onClick={handleSignOut}>
              Sign out
            </Button>
          </div>
        </header>
        <section className="rounded-[36px] border border-border bg-card p-6 shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Last import</span>
              <p className="text-sm font-semibold text-foreground">{dayLabelFormatter.format(new Date())}</p>
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

            <SummaryMetricCard
              helper="Average profit per trade"
              label="Trade Expectancy"
              value={expectancyLabel}
            >
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
                          contentStyle={{
                            borderRadius: 12,
                            borderColor: 'rgba(148, 163, 184, 0.25)',
                            backgroundColor: 'rgba(17, 21, 29, 0.95)',
                            color: '#e5e7eb',
                          }}
                          formatter={(value: number, name: string) => [preciseCurrencyFormatter.format(value), name]}
                        />
                        <RadialBar background dataKey="value" cornerRadius={16} />
                      </RadialBarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <p>
                      Gross profit{' '}
                      <span className="font-semibold text-emerald-300">
                        {preciseCurrencyFormatter.format(tradeStats.grossProfit)}
                      </span>
                    </p>
                    <p>
                      Gross loss{' '}
                      <span className="font-semibold text-rose-300">
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
                <span className="text-emerald-300">{averageWinLabel}</span>
                <span className="text-rose-300">{averageLossLabel}</span>
              </div>
            </SummaryMetricCard>
          </div>
        </section>

        <CalendarSection
          activeTrade={activeTrade}
          activeWeek={activeWeek}
          isMobileView={isMobileView}
          mobileDay={mobileDay}
          monthNetLabel={monthNetLabel}
          monthlySummary={monthlySummary}
          onAddTrade={handleOpenAddTrade}
          onNext={handleNext}
          onPrevious={handlePrevious}
          periodLabel={periodLabel}
          setupNameMap={setupNameMap}
          weeks={weeks}
        />

        <SetupsPanel setups={setups} onAddSetup={() => setIsAddSetupOpen(true)} />

        <PairsPanel onAddPair={handleAddPair} onRemovePair={handleRemovePair} pairs={tradingPairs} />

        <AddTradeDialog
          defaultDate={defaultAddTradeDate}
          availablePairs={tradingPairs.map((pair) => pair.symbol)}
          availableSetups={setups.map(({ id, name }) => ({ id, name }))}
          onOpenChange={setIsAddTradeOpen}
          onSubmit={handleCreateTrade}
          open={isAddTradeOpen}
        />
        <AddSetupDialog onOpenChange={setIsAddSetupOpen} onSubmit={handleCreateSetup} open={isAddSetupOpen} />
      </div>
      {/* @ts-expect-error ignore */}
      <Chatbot contextSummary={chatContextSummary} />
    </main>
  )
}
