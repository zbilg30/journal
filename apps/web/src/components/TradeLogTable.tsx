import { cn } from '@/lib/utils'

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
})

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

export type TradeLogEntry = {
  id: string
  date: string
  pair: string
  direction: 'long' | 'short'
  trades: number
  net: number
  rr?: number | null
  riskPercent?: number | null
  session?: string
  closedBy: 'tp' | 'sl' | 'manual'
  emotion?: string
  withPlan: boolean
  setupName?: string
}

type TradeLogTableProps = {
  entries: TradeLogEntry[]
  monthLabel: string
}

function formatDisplayDate(value: string): string {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return value
  }
  return dateFormatter.format(parsed)
}

export function TradeLogTable({ entries, monthLabel }: TradeLogTableProps) {
  return (
    <section className="rounded-[32px] border border-border bg-card p-6 shadow-lg">
      <div className="flex flex-col gap-4">
        <header className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground/70">
            Trade Log
          </span>
          <h2 className="text-lg font-semibold tracking-tight text-foreground">{monthLabel}</h2>
          <p className="text-xs text-muted-foreground">
            Review every trade captured this period. Use it to spot patterns and opportunities for refinement.
          </p>
        </header>

        {entries.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border/60 bg-muted/20 px-4 py-6 text-center text-sm text-muted-foreground">
            No trades recorded for {monthLabel} yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full table-fixed border-separate border-spacing-y-2 text-sm">
              <thead>
                <tr className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <th className="px-3 text-left">Date</th>
                  <th className="px-3 text-left">Pair</th>
                  <th className="px-3 text-left">Direction</th>
                  <th className="px-3 text-right">Trades</th>
                  <th className="px-3 text-right">Net</th>
                  <th className="px-3 text-right">RR</th>
                  <th className="px-3 text-right">Risk %</th>
                  <th className="px-3 text-left">Session</th>
                  <th className="px-3 text-left">Closed By</th>
                  <th className="px-3 text-left">Emotion</th>
                  <th className="px-3 text-left">Setup</th>
                  <th className="px-3 text-left">With Plan</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr
                    key={entry.id}
                    className="rounded-xl border border-border/60 bg-background/80 text-foreground shadow-sm"
                  >
                    <td className="px-3 py-3 align-middle text-sm font-medium text-muted-foreground">
                      {formatDisplayDate(entry.date)}
                    </td>
                    <td className="px-3 py-3 align-middle font-semibold uppercase tracking-wide text-foreground">
                      {entry.pair}
                    </td>
                    <td className="px-3 py-3 align-middle capitalize text-muted-foreground">
                      {entry.direction}
                    </td>
                    <td className="px-3 py-3 align-middle text-right font-semibold text-foreground">
                      {entry.trades}
                    </td>
                    <td
                      className={cn(
                        'px-3 py-3 align-middle text-right font-semibold',
                        entry.net > 0
                          ? 'text-emerald-300'
                          : entry.net < 0
                            ? 'text-rose-300'
                            : 'text-foreground',
                      )}
                    >
                      {currencyFormatter.format(entry.net)}
                    </td>
                    <td className="px-3 py-3 align-middle text-right text-muted-foreground">
                      {entry.rr != null ? `${entry.rr}R` : '—'}
                    </td>
                    <td className="px-3 py-3 align-middle text-right text-muted-foreground">
                      {entry.riskPercent != null ? `${entry.riskPercent}%` : '—'}
                    </td>
                    <td className="px-3 py-3 align-middle text-muted-foreground">
                      {entry.session ?? '—'}
                    </td>
                    <td className="px-3 py-3 align-middle text-muted-foreground">
                      {entry.closedBy.toUpperCase()}
                    </td>
                    <td className="px-3 py-3 align-middle text-muted-foreground">
                      {entry.emotion ?? '—'}
                    </td>
                    <td className="px-3 py-3 align-middle text-muted-foreground">
                      {entry.setupName ?? '—'}
                    </td>
                    <td className="px-3 py-3 align-middle text-muted-foreground">
                      {entry.withPlan ? 'Yes' : 'No'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}
