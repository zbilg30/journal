import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

export type TradeDayData = {
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
  activeTrade?: TradeDayData
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
    day.isCurrentMonth ? 'text-foreground/70' : 'text-muted-foreground/50',
  )
  const tradesLabelClasses = cn(
    'block text-[10px] font-medium sm:text-[11px]',
    day.highlight === 'positive'
      ? 'text-emerald-600/80'
      : day.highlight === 'negative'
        ? 'text-rose-500/80'
        : 'text-muted-foreground/60',
  )

  return (
    <div
      className={cn(
        'flex aspect-square flex-col justify-between rounded-xl border border-transparent bg-white/60 p-2 text-[11px] font-medium text-muted-foreground shadow-sm shadow-black/[0.02] sm:rounded-2xl sm:p-3 sm:text-xs',
        !day.isCurrentMonth && 'bg-muted/30 text-muted-foreground/60 shadow-none',
        !isHighlighted && day.isCurrentMonth && 'bg-muted/20',
        day.highlight === 'positive' && 'border-emerald-200 bg-emerald-50 text-emerald-700 shadow-none',
        day.highlight === 'negative' && 'border-rose-200 bg-rose-50 text-rose-600 shadow-none',
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

function WeekSummary({ week, className }: { week: CalendarWeek; className?: string }) {
  const summaryLabel = week.tradingDays === 1 ? '1 day' : `${week.tradingDays} days`

  return (
    <div
      className={cn(
        'flex flex-col justify-between gap-3 rounded-2xl border border-transparent bg-white/70 p-4 text-sm shadow-sm shadow-black/[0.02] sm:flex-row sm:items-center lg:h-full lg:flex-col',
        week.tone === 'positive' && 'border-emerald-200 text-emerald-700',
        week.tone === 'negative' && 'border-rose-200 text-rose-600',
        week.tone === 'neutral' && 'border-muted text-foreground/70',
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
  activeTrade,
  setupNameMap,
  weeks,
}: CalendarSectionProps) {
  return (
    <section className="rounded-[32px] bg-white/80 p-6 shadow-xl shadow-purple-400/25 ring-1 ring-black/5 backdrop-blur">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <button
            className="flex h-9 w-9 items-center justify-center rounded-full border border-muted bg-white text-muted-foreground shadow-sm"
            type="button"
            aria-label={isMobileView ? 'Previous day' : 'Previous month'}
            onClick={onPrevious}
          >
            <span aria-hidden>&lt;</span>
          </button>
          <span className="text-lg font-semibold tracking-tight text-foreground">{periodLabel}</span>
          <button
            className="flex h-9 w-9 items-center justify-center rounded-full border border-muted bg-white text-muted-foreground shadow-sm"
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

        <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-600">
          <span>Monthly stats:</span>
          <span>{monthNetLabel}</span>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <span className="rounded-full border border-muted/60 bg-muted/40 px-3 py-1">{monthlySummary.activeDays} days</span>
          <span className="rounded-full border border-muted/60 bg-muted/40 px-3 py-1">{monthlySummary.tradeCount} trades</span>
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

            <div className="rounded-3xl border border-muted/40 bg-white/90 p-4 text-sm shadow-sm shadow-black/[0.02]">
              {activeTrade ? (
                <div className="space-y-4">
                  <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Pair</dt>
                      <dd className="text-sm font-semibold text-foreground">{activeTrade.pair}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Direction</dt>
                      <dd className="text-sm font-semibold text-foreground">{activeTrade.direction === 'long' ? 'Long' : 'Short'}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Trades</dt>
                      <dd className="text-sm font-semibold text-foreground">{activeTrade.trades}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Closed By</dt>
                      <dd className="text-sm font-semibold text-foreground">{activeTrade.closedBy.toUpperCase()}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">RR</dt>
                      <dd className="text-sm font-semibold text-foreground">{activeTrade.rr != null ? `${activeTrade.rr}R` : '—'}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Risk %</dt>
                      <dd className="text-sm font-semibold text-foreground">{activeTrade.riskPercent != null ? `${activeTrade.riskPercent}%` : '—'}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Session</dt>
                      <dd className="text-sm font-semibold text-foreground">{activeTrade.session ?? '—'}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Emotion</dt>
                      <dd className="text-sm font-semibold text-foreground">{activeTrade.emotion ?? '—'}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Setup</dt>
                      <dd className="text-sm font-semibold text-foreground">
                        {activeTrade.setupId ? setupNameMap[activeTrade.setupId] ?? activeTrade.setupId : '—'}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">With Plan</dt>
                      <dd className="text-sm font-semibold text-foreground">{activeTrade.withPlan ? 'Yes' : 'No'}</dd>
                    </div>
                  </dl>

                  {activeTrade.description ? (
                    <div className="rounded-2xl border border-muted/50 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
                      {activeTrade.description}
                    </div>
                  ) : null}
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
