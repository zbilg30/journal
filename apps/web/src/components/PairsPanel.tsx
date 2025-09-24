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
  onAddPair: (symbol: string) => Promise<void> | void
  onUpdatePair: (id: string, symbol: string) => Promise<void> | void
  onRemovePair: (id: string) => Promise<void> | void
}

export function PairsPanel({
  title = 'Pairs In Play',
  pairs,
  onAddPair,
  onUpdatePair,
  onRemovePair,
}: PairsPanelProps) {
  const [symbol, setSymbol] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [globalError, setGlobalError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [editError, setEditError] = useState<string | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isRemovingId, setIsRemovingId] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmedSymbol = symbol.trim().toUpperCase()
    if (!trimmedSymbol) {
      setFormError('Enter a valid pair symbol, e.g. EURUSD.')
      return
    }

    const existing = pairs.some((pair) => pair.symbol.toUpperCase() === trimmedSymbol)
    if (existing) {
      setFormError('That pair is already tracked.')
      return
    }

    setIsSubmitting(true)
    setFormError(null)
    setGlobalError(null)

    try {
      await onAddPair(trimmedSymbol)
      setSymbol('')
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Could not add pair. Try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const startEditing = (id: string, currentSymbol: string) => {
    setEditingId(id)
    setEditValue(currentSymbol)
    setEditError(null)
    setGlobalError(null)
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditValue('')
    setEditError(null)
  }

  const handleUpdate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!editingId) return

    const trimmedSymbol = editValue.trim().toUpperCase()
    if (!trimmedSymbol) {
      setEditError('Enter a valid pair symbol, e.g. EURUSD.')
      return
    }

    const exists = pairs.some(
      (pair) => pair.symbol.toUpperCase() === trimmedSymbol && pair.id !== editingId,
    )
    if (exists) {
      setEditError('That pair is already tracked.')
      return
    }

    setIsUpdating(true)
    setEditError(null)
    setGlobalError(null)

    try {
      await onUpdatePair(editingId, trimmedSymbol)
      cancelEditing()
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Could not update pair. Try again.')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleRemove = async (id: string) => {
    setIsRemovingId(id)
    setGlobalError(null)

    try {
      await onRemovePair(id)
    } catch (err) {
      setGlobalError(err instanceof Error ? err.message : 'Could not remove pair. Try again.')
    } finally {
      setIsRemovingId(null)
    }
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

        {globalError ? (
          <p className="rounded-md border border-amber-400/40 bg-amber-400/10 px-3 py-2 text-xs font-medium text-amber-100">
            {globalError}
          </p>
        ) : null}

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
                {editingId === pair.id ? (
                  <form className="flex flex-col gap-3" onSubmit={handleUpdate}>
                    <div className="flex items-center gap-3">
                      <Input
                        aria-label="Pair symbol"
                        value={editValue}
                        onChange={(event) => {
                          setEditValue(event.target.value)
                          if (editError) setEditError(null)
                        }}
                      />
                      <div className="flex items-center gap-2">
                        <Button size="sm" type="submit" disabled={isUpdating}>
                          Save
                        </Button>
                        <Button
                          size="sm"
                          type="button"
                          variant="ghost"
                          onClick={cancelEditing}
                          disabled={isUpdating}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                    {editError ? (
                      <p className="rounded-md border border-amber-400/40 bg-amber-400/10 px-3 py-2 text-xs font-medium text-amber-100">
                        {editError}
                      </p>
                    ) : null}
                  </form>
                ) : (
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="text-sm font-semibold tracking-tight text-foreground">{pair.symbol}</h3>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-xs text-muted-foreground hover:text-primary"
                        onClick={() => startEditing(pair.id, pair.symbol)}
                      >
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-xs text-muted-foreground hover:text-destructive"
                        onClick={() => handleRemove(pair.id)}
                        disabled={isRemovingId === pair.id}
                      >
                        {isRemovingId === pair.id ? 'Removing…' : 'Remove'}
                      </Button>
                    </div>
                  </div>
                )}
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
                if (formError) setFormError(null)
              }}
            />
          </div>

          {formError ? (
            <p className="rounded-md border border-amber-400/40 bg-amber-400/10 px-3 py-2 text-xs font-medium text-amber-100">
              {formError}
            </p>
          ) : null}

          <div className="flex justify-end">
            <Button size="sm" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Adding…' : 'Add pair'}
            </Button>
          </div>
        </form>
      </div>
    </section>
  )
}
