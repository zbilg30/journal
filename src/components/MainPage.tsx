import { Fragment, useMemo, useState } from 'react'
import type { Session } from '@supabase/supabase-js'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabaseClient'

type CalendarDay = {
  id: string
  dayNumber?: number
  isCurrentMonth: boolean
  highlight?: 'positive' | 'negative'
  valueLabel?: string
  tradesLabel?: string
}

type CalendarWeek = {
  id: string
  label: string
  total: number
  tradingDays: number
  tone: 'positive' | 'negative' | 'neutral'
  days: CalendarDay[]
}

type TradeDayData = {
  net: number
  trades: number
}

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

const monthLabelFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  year: 'numeric',
})

const tradingJournalData: Record<string, Record<string, TradeDayData>> = {
  '2025-04': {
    '2025-04-04': { net: 2934, trades: 2 },
    '2025-04-09': { net: 4727, trades: 4 },
    '2025-04-17': { net: -1571, trades: 4 },
    '2025-04-25': { net: 123, trades: 2 },
  },
}

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

function formatTradesLabel(trades: number) {
  return trades === 1 ? '1 trade' : `${trades} trades`
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

function buildCalendarWeeks(activeDate: Date) {
  const monthKey = getMonthKey(activeDate)
  const monthData = tradingJournalData[monthKey] ?? {}

  const firstOfMonth = new Date(activeDate.getFullYear(), activeDate.getMonth(), 1)
  const lastOfMonth = new Date(activeDate.getFullYear(), activeDate.getMonth() + 1, 0)

  const startOfCalendar = new Date(firstOfMonth)
  startOfCalendar.setDate(firstOfMonth.getDate() - firstOfMonth.getDay())

  const endOfCalendar = new Date(lastOfMonth)
  endOfCalendar.setDate(lastOfMonth.getDate() + (6 - lastOfMonth.getDay()))

  const weeks: CalendarWeek[] = []
  let current = new Date(startOfCalendar)
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
        tradesLabel = formatTradesLabel(tradeData.trades)
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

  const monthTotals = Object.values(monthData).reduce(
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


const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function CalendarGlyph({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      height="16"
      viewBox="0 0 16 16"
      width="16"
      aria-hidden
    >
      <path
        d="M4.5 2.5v1m7-1v1m-8 2h9m-10 7.5h11A1.5 1.5 0 0 0 15 11.5v-7A1.5 1.5 0 0 0 13.5 3h-11A1.5 1.5 0 0 0 1 4.5v7A1.5 1.5 0 0 0 2.5 13Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function DayCell({ day }: { day: CalendarDay }) {
  const numberLabel = day.dayNumber?.toString().padStart(2, '0') ?? ''
  const isHighlighted = Boolean(day.highlight)
  const dayNumberClasses = cn(
    'text-sm font-semibold',
    day.isCurrentMonth ? 'text-foreground/70' : 'text-muted-foreground/50',
  )
  const tradesLabelClasses = cn(
    'block text-[11px] font-medium',
    day.highlight === 'positive'
      ? 'text-emerald-600/80'
      : day.highlight === 'negative'
        ? 'text-rose-500/80'
        : 'text-muted-foreground/60',
  )

  return (
    <div
      className={cn(
        'flex aspect-square flex-col justify-between rounded-2xl border border-transparent bg-white/60 p-3 text-xs font-medium text-muted-foreground shadow-sm shadow-black/[0.02]',
        !day.isCurrentMonth && 'bg-muted/30 text-muted-foreground/60 shadow-none',
        !isHighlighted && day.isCurrentMonth && 'bg-muted/20',
        day.highlight === 'positive' && 'border-emerald-200 bg-emerald-50 text-emerald-700 shadow-none',
        day.highlight === 'negative' && 'border-rose-200 bg-rose-50 text-rose-600 shadow-none',
      )}
    >
      <span className={dayNumberClasses}>{numberLabel}</span>
      {day.valueLabel ? (
        <div className="space-y-1 text-xs font-semibold">
          <span className="flex items-center gap-1">
            {isHighlighted && (
              <CalendarGlyph
                className={cn(
                  'h-4 w-4',
                  day.highlight === 'positive' ? 'text-emerald-500' : 'text-rose-400',
                )}
              />
            )}
            <span>{day.valueLabel}</span>
          </span>
          <span className={tradesLabelClasses}>{day.tradesLabel}</span>
        </div>
      ) : (
        <span aria-hidden className="text-[11px] font-medium text-transparent">
          placeholder
        </span>
      )}
    </div>
  )
}

function WeekSummary({ week }: { week: CalendarWeek }) {
  const summaryLabel = week.tradingDays === 1 ? '1 day' : `${week.tradingDays} days`

  return (
    <div
      className={cn(
        'flex h-full flex-col justify-between rounded-2xl border border-transparent bg-white/70 p-4 text-sm shadow-sm shadow-black/[0.02]',
        week.tone === 'positive' && 'border-emerald-200 text-emerald-700',
        week.tone === 'negative' && 'border-rose-200 text-rose-600',
        week.tone === 'neutral' && 'border-muted text-foreground/70',
      )}
    >
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{week.label}</span>
      <div className="space-y-1">
        <p className="text-xl font-semibold tracking-tight">
          {currencyFormatter.format(week.total)}
        </p>
        <span className="text-xs font-medium text-muted-foreground/70">{summaryLabel}</span>
      </div>
    </div>
  )
}

type MainPageProps = {
  session: Session
}

export function MainPage({ session }: MainPageProps) {
  const [activeMonth, setActiveMonth] = useState(() => new Date(2025, 3, 1))
  const { weeks, monthlySummary } = useMemo(() => buildCalendarWeeks(activeMonth), [activeMonth])
  const monthLabel = monthLabelFormatter.format(activeMonth)

  const handleSignOut = async () => {
    if (!supabase) return

    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error('Failed to sign out', error)
    }
  }

  const handlePreviousMonth = () => {
    setActiveMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setActiveMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }

  const monthNetLabel = monthlySummary.net === 0
    ? currencyFormatter.format(0)
    : `${monthlySummary.net > 0 ? '+' : '-'}${currencyFormatter.format(Math.abs(monthlySummary.net))}`

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#ede7ff] via-white to-[#ffd9f4] px-4 py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-primary">
              Journal Trading
            </span>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Monthly Overview</h1>
            <p className="text-sm text-muted-foreground">
              Signed in as <span className="font-medium text-foreground">{session.user.email ?? 'your account'}</span>
            </p>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            Sign out
          </Button>
        </header>

        <section className="rounded-[32px] bg-white/80 p-6 shadow-xl shadow-purple-400/25 ring-1 ring-black/5 backdrop-blur">
          <div className="flex flex-wrap items-center gap-3 pb-6">
            <div className="flex items-center gap-2">
              <button
                className="flex h-9 w-9 items-center justify-center rounded-full border border-muted bg-white text-muted-foreground shadow-sm"
                type="button"
                aria-label="Previous month"
                onClick={handlePreviousMonth}
              >
                <span aria-hidden>&lt;</span>
              </button>
              <span className="text-lg font-semibold tracking-tight text-foreground">{monthLabel}</span>
              <button
                className="flex h-9 w-9 items-center justify-center rounded-full border border-muted bg-white text-muted-foreground shadow-sm"
                type="button"
                aria-label="Next month"
                onClick={handleNextMonth}
              >
                <span aria-hidden>&gt;</span>
              </button>
            </div>

            <Button size="sm" variant="secondary">
              Add trade
            </Button>

            <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-600">
              <span>Monthly stats:</span>
              <span>{monthNetLabel}</span>
            </div>

            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <span className="rounded-full border border-muted/60 bg-muted/40 px-3 py-1">{monthlySummary.activeDays} days</span>
              <span className="rounded-full border border-muted/60 bg-muted/40 px-3 py-1">{monthlySummary.tradeCount} trades</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-8 gap-3 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {dayNames.map((day) => (
                <span key={day} className="col-span-1">
                  {day}
                </span>
              ))}
              <span className="col-span-1" />
            </div>

            <div className="grid grid-cols-8 gap-3">
              {weeks.map((week) => (
                <Fragment key={week.id}>
                  <div className="col-span-7 grid grid-cols-7 gap-3">
                    {week.days.map((day) => (
                      <DayCell key={day.id} day={day} />
                    ))}
                  </div>
                  <div className="col-span-1">
                    <WeekSummary week={week} />
                  </div>
                </Fragment>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
