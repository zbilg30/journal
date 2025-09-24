import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

export type TradeEntry = {
  id?: string
  date: string
  net: number
  trades: number
  pair: string
  rr?: number | null
  direction: 'long' | 'short'
  session?: string
  closedBy: 'tp' | 'sl' | 'manual'
  riskPercent?: number | null
  emotion?: string
  withPlan: boolean
  description?: string
  setupId?: string
}

export type AggregatedTradeDay = {
  totalNet: number
  totalTrades: number
  entries: TradeEntry[]
}

export type CalendarDay = {
  id: string
  dayNumber?: number
  isCurrentMonth: boolean
  highlight?: 'positive' | 'negative'
  valueLabel?: string
  tradesLabel?: string
}

export type CalendarWeek = {
  id: string
  label: string
  total: number
  tradingDays: number
  tone: 'positive' | 'negative' | 'neutral'
  days: CalendarDay[]
}

export type CalendarMonthlySummary = {
  net: number
  tradeCount: number
  activeDays: number
}

type CalendarSectionProps = {
  isMobileView: boolean
  periodLabel: string
  onPrevious: () => void
  onNext: () => void
  onAddTrade: () => void
  monthNetLabel: string
  monthlySummary: CalendarMonthlySummary
  mobileDay: CalendarDay
  activeWeek?: CalendarWeek
  activeDay?: AggregatedTradeDay
  setupNameMap: Record<string, string>
  weeks: CalendarWeek[]
}

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function CalendarGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" height="16" viewBox="0 0 16 16" width="16" aria-hidden>
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
    'text-xs font-semibold sm:text-sm',
  )
  const tradesLabelClasses = cn(
    'block text-[10px] font-medium sm:text-[11px]',
    day.highlight === 'positive'
      ? 'text-emerald-700 dark:text-emerald-300'
      : day.highlight === 'negative'
        ? 'text-red-700 dark:text-rose-300'
        : 'text-muted-foreground',
  )

  return (
    <div
      className={cn(
        'flex aspect-square flex-col justify-between rounded-xl border border-border bg-card p-2 text-[11px] font-medium text-muted-foreground shadow-sm sm:rounded-2xl sm:p-3 sm:text-xs',
        !day.isCurrentMonth && 'border-border/20 bg-background/20 text-muted-foreground/50 shadow-none',
        !isHighlighted && day.isCurrentMonth && 'bg-card/40',
        day.highlight === 'positive' && 'border-emerald-400/60 bg-emerald-400/10  shadow-none',
        day.highlight === 'negative' && 'border-rose-500/60 bg-rose-500/10 text-rose-100 shadow-none',
      )}
    >
      <span className={dayNumberClasses}>{numberLabel}</span>
      {day.valueLabel ? (
        <div className="space-y-1 font-semibold">
          <span className="flex items-center gap-1 text-xs sm:text-sm">
            {isHighlighted && (
              <CalendarGlyph
                className={cn(
                  'h-3.5 w-3.5 sm:h-4 sm:w-4',
                  day.highlight === 'positive' ? 'text-emerald-600 dark:text-emerald-500' : 'text-red-600 dark:text-rose-400',
                )}
              />
            )}
            <span
              className={cn(
                'text-foreground',
                day.highlight === 'positive' && 'text-emerald-600 dark:text-emerald-500',
                day.highlight === 'negative' && 'text-red-600 dark:text-rose-400',
              )}
            >
              {day.valueLabel}
            </span>
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

function WeekSummary({ week, className }: { week: CalendarWeek; className?: string }) {
  const summaryLabel = week.tradingDays === 1 ? '1 day' : `${week.tradingDays} days`

  return (
    <div
      className={cn(
        'flex flex-col justify-between gap-3 rounded-2xl border border-border bg-card p-4 text-sm shadow-sm sm:flex-row sm:items-center lg:h-full lg:flex-col',
        week.tone === 'positive' && 'border-emerald-400/60 bg-emerald-400/10 text-emerald-800 dark:text-emerald-200',
        week.tone === 'negative' && 'border-rose-500/60 bg-rose-500/10 text-red-800 dark:text-rose-200',
        week.tone === 'neutral' && 'text-muted-foreground',
        className,
      )}
    >
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{week.label}</span>
      <div className="space-y-1 text-left lg:text-right">
        <p className="text-lg font-semibold tracking-tight sm:text-xl">
          {currencyFormatter.format(week.total)}
        </p>
        <span className="text-xs font-medium text-muted-foreground/70">{summaryLabel}</span>
      </div>
    </div>
  )
}

export function CalendarSection({
  isMobileView,
  periodLabel,
  onPrevious,
  onNext,
  onAddTrade,
  monthNetLabel,
  monthlySummary,
  mobileDay,
  activeWeek,
  activeDay,
  setupNameMap,
  weeks,
}: CalendarSectionProps) {
  return (
    <section className="rounded-[32px] border border-border bg-card p-6 shadow-xl backdrop-blur">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <button
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-muted text-muted-foreground shadow-sm transition hover:bg-muted/80"
            type="button"
            aria-label={isMobileView ? 'Previous day' : 'Previous month'}
            onClick={onPrevious}
          >
            <span aria-hidden>&lt;</span>
          </button>
          <span className="text-lg font-semibold tracking-tight text-foreground">{periodLabel}</span>
          <button
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-muted text-muted-foreground shadow-sm transition hover:bg-muted/80"
            type="button"
            aria-label={isMobileView ? 'Next day' : 'Next month'}
            onClick={onNext}
          >
            <span aria-hidden>&gt;</span>
          </button>
        </div>

        <Button size="sm" variant="secondary" onClick={onAddTrade}>
          Add trade
        </Button>

        <div className="flex items-center gap-2 rounded-full border border-emerald-500/50 bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-200">
          <span>Monthly stats:</span>
          <span>{monthNetLabel}</span>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <span className="rounded-full border border-border bg-muted px-3 py-1">{monthlySummary.activeDays} days</span>
          <span className="rounded-full border border-border bg-muted px-3 py-1">{monthlySummary.tradeCount} trades</span>
        </div>
      </div>

      <div className="mt-6 space-y-5">
        {isMobileView ? (
          <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch sm:gap-4">
              <div className="mx-auto w-28 sm:mx-0 sm:w-32">
                <DayCell day={mobileDay} />
              </div>
              {activeWeek ? <WeekSummary className="w-full" week={activeWeek} /> : null}
            </div>

            <div className="rounded-3xl border border-border/60 bg-card/80 p-4 text-sm shadow-sm shadow-black/30">
              {activeDay ? (
                <div className="space-y-4">
                  <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Net P&amp;L</dt>
                      <dd className="text-sm font-semibold text-foreground">{currencyFormatter.format(activeDay.totalNet)}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Trades</dt>
                      <dd className="text-sm font-semibold text-foreground">{activeDay.totalTrades}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Entries</dt>
                      <dd className="text-sm font-semibold text-foreground">{activeDay.entries.length}</dd>
                    </div>
                  </dl>

                  <div className="space-y-3">
                    {activeDay.entries.map((entry, index) => {
                      const entryKey = entry.id ?? `${entry.date}-${index}`
                      return (
                        <article
                          key={entryKey}
                          className="space-y-3 rounded-2xl border border-border/50 bg-muted/25 px-4 py-3 text-sm shadow-sm"
                        >
                          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div className="flex items-center justify-between gap-3">
                              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Net</dt>
                              <dd
                                className={cn(
                                  'text-sm font-semibold',
                                  entry.net > 0
                                    ? 'text-emerald-400'
                                    : entry.net < 0
                                      ? 'text-rose-300'
                                      : 'text-foreground',
                                )}
                              >
                                {currencyFormatter.format(entry.net)}
                              </dd>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Pair</dt>
                              <dd className="text-sm font-semibold text-foreground">{entry.pair}</dd>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Direction</dt>
                              <dd className="text-sm font-semibold text-foreground">{entry.direction === 'long' ? 'Long' : 'Short'}</dd>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Trades</dt>
                              <dd className="text-sm font-semibold text-foreground">{entry.trades}</dd>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Closed By</dt>
                              <dd className="text-sm font-semibold text-foreground">{entry.closedBy.toUpperCase()}</dd>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">RR</dt>
                              <dd className="text-sm font-semibold text-foreground">{entry.rr != null ? `${entry.rr}R` : '—'}</dd>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Risk %</dt>
                              <dd className="text-sm font-semibold text-foreground">{entry.riskPercent != null ? `${entry.riskPercent}%` : '—'}</dd>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Session</dt>
                              <dd className="text-sm font-semibold text-foreground">{entry.session ?? '—'}</dd>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Emotion</dt>
                              <dd className="text-sm font-semibold text-foreground">{entry.emotion ?? '—'}</dd>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Setup</dt>
                              <dd className="text-sm font-semibold text-foreground">
                                {entry.setupId ? setupNameMap[entry.setupId] ?? entry.setupId : '—'}
                              </dd>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">With Plan</dt>
                              <dd className="text-sm font-semibold text-foreground">{entry.withPlan ? 'Yes' : 'No'}</dd>
                            </div>
                          </dl>

                          {entry.description ? (
                            <div className="rounded-2xl border border-border/50 bg-card/40 px-4 py-3 text-sm text-muted-foreground">
                              {entry.description}
                            </div>
                          ) : null}
                        </article>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No trades logged for this day.</p>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="hidden grid-cols-8 gap-3 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground lg:grid">
              {dayNames.map((day) => (
                <span key={day} className="col-span-1">
                  {day}
                </span>
              ))}
              <span className="col-span-1" />
            </div>

            <div className="space-y-6 lg:space-y-4">
              {weeks.map((week) => (
                <div key={week.id} className="grid gap-3 lg:grid-cols-8">
                  <div className="grid grid-cols-7 gap-1 sm:gap-2 lg:col-span-7 lg:gap-3">
                    {week.days.map((day) => (
                      <DayCell key={day.id} day={day} />
                    ))}
                  </div>
                  <div className="lg:col-span-1">
                    <WeekSummary className="lg:h-full" week={week} />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  )
}
