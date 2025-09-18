import { useState, type FormEvent } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

export type TradingPair = {
  id: string
  symbol: string
}

type PairsPanelProps = {
  title?: string
  pairs: TradingPair[]
  onAddPair: (symbol: string) => void
  onRemovePair: (id: string) => void
}

export function PairsPanel({ title = "Pairs In Play", pairs, onAddPair, onRemovePair }: PairsPanelProps) {
  const [symbol, setSymbol] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmedSymbol = symbol.trim().toUpperCase()
    if (!trimmedSymbol) {
      setError('Enter a valid pair symbol, e.g. EURUSD.')
      return
    }

    const existing = pairs.some((pair) => pair.symbol.toUpperCase() === trimmedSymbol)
    if (existing) {
      setError('That pair is already tracked.')
      return
    }

    onAddPair(trimmedSymbol)
    setSymbol('')
    setError(null)
  }

  const handleRemove = (id: string) => {
    onRemovePair(id)
  }

  const hasPairs = pairs.length > 0

  return (
    <section className="rounded-[32px] border border-border/50 bg-card/70 p-6 shadow-xl shadow-black/40 backdrop-blur">
      <div className="flex flex-col gap-6">
        <header className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground/70">Watchlist</span>
          <h2 className="text-lg font-semibold tracking-tight text-foreground">{title}</h2>
          <p className="text-xs text-muted-foreground">
            Track the currency pairs you&apos;re focused on today. Remove ones that are off-plan.
          </p>
        </header>

        <div
          className={cn(
            'grid gap-3',
            !hasPairs && 'border border-dashed border-border/50 bg-muted/20 p-6 text-center'
          )}
          aria-live="polite"
        >
          {hasPairs ? (
            pairs.map((pair) => (
              <article
                key={pair.id}
                className="flex flex-col gap-2 rounded-2xl border border-border/40 bg-card/80 p-4 text-sm shadow-sm shadow-black/30"
              >
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-sm font-semibold tracking-tight text-foreground">{pair.symbol}</h3>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-xs text-muted-foreground hover:text-destructive"
                    onClick={() => handleRemove(pair.id)}
                  >
                    Remove
                  </Button>
                </div>
              </article>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No pairs yet. Add the ones you plan to trade.</p>
          )}
        </div>

        <form
          className="space-y-4 rounded-2xl border border-border/50 bg-card/70 p-4 shadow-inner shadow-black/30"
          onSubmit={handleSubmit}
        >
          <div className="grid gap-2">
            <Label htmlFor="pair-symbol">Pair symbol</Label>
            <Input
              id="pair-symbol"
              placeholder="e.g. EURUSD"
              value={symbol}
              autoComplete="off"
              onChange={(event) => {
                setSymbol(event.target.value)
                if (error) setError(null)
              }}
            />
          </div>

          {error ? (
            <p className="rounded-md border border-amber-400/40 bg-amber-400/10 px-3 py-2 text-xs font-medium text-amber-200">
              {error}
            </p>
          ) : null}

          <div className="flex justify-end">
            <Button size="sm" type="submit">
              Add pair
            </Button>
          </div>
        </form>
      </div>
    </section>
  )
}
