import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
  type MouseEvent,
} from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

export type AddTradeInput = {
  date: string
  pair: string
  rr?: number | null
  direction: 'long' | 'short'
  session?: string
  closedBy: 'tp' | 'sl' | 'manual'
  net: number
  trades: number
  riskPercent?: number | null
  emotion?: string
  withPlan: boolean
  description?: string
  setupId?: string
}

type FormState = {
  date: string
  pair: string
  rr: string
  direction: 'long' | 'short'
  session: string
  closedBy: 'tp' | 'sl' | 'manual'
  net: string
  trades: string
  riskPercent: string
  emotion: string
  withPlan: boolean
  description: string
  setupId: string
}

type AddTradeDialogProps = {
  open: boolean
  onOpenChange: (nextOpen: boolean) => void
  onSubmit: (data: AddTradeInput) => Promise<void> | void
  defaultDate?: string
  availablePairs: string[]
  availableSetups: { id: string; name: string }[]
}

const emptyForm: FormState = {
  date: '',
  pair: '',
  rr: '',
  direction: 'long',
  session: '',
  closedBy: 'tp',
  net: '',
  trades: '',
  riskPercent: '',
  emotion: '',
  withPlan: false,
  description: '',
  setupId: '',
}

export function AddTradeDialog({
  open,
  onOpenChange,
  onSubmit,
  defaultDate,
  availablePairs,
  availableSetups,
}: AddTradeDialogProps) {
  const [formState, setFormState] = useState<FormState>(emptyForm)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const resolvedDefaultDate = useMemo(() => defaultDate ?? '', [defaultDate])

  useEffect(() => {
    if (!open) return

    setFormState((prev) => ({
      ...prev,
      date: resolvedDefaultDate || prev.date,
      pair: availablePairs[0] ?? prev.pair,
      setupId: availableSetups[0]?.id ?? prev.setupId,
    }))
    setError(null)
  }, [availablePairs, availableSetups, open, resolvedDefaultDate])

  useEffect(() => {
    if (!open) {
      setFormState(emptyForm)
      setError(null)
    }
  }, [open])

  if (!open) {
    return null
  }

  const handleInputChange = (field: keyof FormState) => (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value
    setFormState((prev) => ({ ...prev, [field]: value }))
  }

  const handleSelectChange = (field: keyof FormState) => (event: ChangeEvent<HTMLSelectElement>) => {
    setFormState((prev) => ({ ...prev, [field]: event.target.value as FormState[typeof field] }))
  }

  const handleTextAreaChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setFormState((prev) => ({ ...prev, description: event.target.value }))
  }

  const handleClose = () => {
    if (isSubmitting) return
    onOpenChange(false)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!formState.date) {
      setError('Select a trade date.')
      return
    }

    if (!formState.pair) {
      setError('Choose a pair for the trade.')
      return
    }

    const parsedNet = Number(formState.net)
    if (Number.isNaN(parsedNet)) {
      setError('PNL must be a number (use negative values for losses).')
      return
    }

    const parsedTrades = Number.parseInt(formState.trades, 10)
    if (Number.isNaN(parsedTrades) || parsedTrades <= 0) {
      setError('Number of trades must be a positive integer.')
      return
    }

    const parsedRr = formState.rr ? Number(formState.rr) : null
    if (formState.rr && Number.isNaN(parsedRr)) {
      setError('Risk to reward must be numeric (e.g. 2.5).')
      return
    }

    const parsedRiskPct = formState.riskPercent ? Number(formState.riskPercent) : null
    if (formState.riskPercent && Number.isNaN(parsedRiskPct)) {
      setError('Risk % must be numeric.')
      return
    }

    setError(null)
    setIsSubmitting(true)

    try {
      await onSubmit({
        date: formState.date,
        pair: formState.pair,
        rr: parsedRr,
        direction: formState.direction,
        session: formState.session || undefined,
        closedBy: formState.closedBy,
        net: parsedNet,
        trades: parsedTrades,
        riskPercent: parsedRiskPct,
        emotion: formState.emotion || undefined,
        withPlan: formState.withPlan,
        description: formState.description || undefined,
        setupId: formState.setupId || undefined,
      })
      onOpenChange(false)
    } catch (submitError) {
      console.error('Failed to add trade', submitError)
      setError('Could not save trade. Try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOverlayClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      handleClose()
    }
  }

  return (
    <div
      aria-modal
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-10 backdrop-blur-sm"
      onClick={handleOverlayClick}
      role="dialog"
    >
      <div
        className="relative w-full max-w-2xl rounded-3xl border border-border/60 bg-card/95 p-6 shadow-2xl shadow-black/40"
        role="document"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">Add Trade</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Capture the context for the trade so the monthly overview stays accurate.
            </p>
          </div>
          <button
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border/80 bg-muted/40 text-muted-foreground transition hover:bg-muted/60"
            onClick={handleClose}
            type="button"
          >
            <span aria-hidden>×</span>
          </button>
        </div>

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="trade-date">Trade date</Label>
              <Input
                id="trade-date"
                type="date"
                value={formState.date}
                onChange={handleInputChange('date')}
                max={new Date().toISOString().slice(0, 10)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="trade-pair">Pair</Label>
              <select
                id="trade-pair"
                className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={formState.pair}
                onChange={handleSelectChange('pair')}
                required
              >
                <option value="" disabled>
                  {availablePairs.length ? 'Select pair' : 'No pairs available'}
                </option>
                {availablePairs.map((pair) => (
                  <option key={pair} value={pair}>
                    {pair}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="trade-net">PNL (USD)</Label>
              <Input
                id="trade-net"
                type="number"
                inputMode="decimal"
                placeholder="e.g. 1525 or -320"
                value={formState.net}
                onChange={handleInputChange('net')}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="trade-rr">Risk to reward</Label>
              <Input
                id="trade-rr"
                type="number"
                inputMode="decimal"
                min={0}
                step="0.1"
                placeholder="e.g. 2"
                value={formState.rr}
                onChange={handleInputChange('rr')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="trade-setup">Setup</Label>
              <select
                id="trade-setup"
                className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={formState.setupId}
                onChange={handleSelectChange('setupId')}
              >
                <option value="">No setup selected</option>
                {availableSetups.map((setup) => (
                  <option key={setup.id} value={setup.id}>
                    {setup.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="trade-direction">Direction</Label>
              <select
                id="trade-direction"
                className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={formState.direction}
                onChange={handleSelectChange('direction')}
              >
                <option value="long">Long</option>
                <option value="short">Short</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="trade-session">Session</Label>
              <select
                id="trade-session"
                className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={formState.session}
                onChange={handleSelectChange('session')}
              >
                <option value="">Select session</option>
                <option value="asia">Asia</option>
                <option value="london">London</option>
                <option value="new-york">New York</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="trade-closedby">Closed by</Label>
              <select
                id="trade-closedby"
                className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={formState.closedBy}
                onChange={handleSelectChange('closedBy')}
              >
                <option value="tp">Take Profit</option>
                <option value="sl">Stop Loss</option>
                <option value="manual">Manual</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="trade-risk">Risk %</Label>
              <Input
                id="trade-risk"
                type="number"
                inputMode="decimal"
                min={0}
                step="0.1"
                placeholder="e.g. 0.5"
                value={formState.riskPercent}
                onChange={handleInputChange('riskPercent')}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="trade-count">Trades taken</Label>
              <Input
                id="trade-count"
                type="number"
                inputMode="numeric"
                min={1}
                step={1}
                placeholder="e.g. 4"
                value={formState.trades}
                onChange={handleInputChange('trades')}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="trade-emotion">Emotion</Label>
              <Input
                id="trade-emotion"
                placeholder="e.g. Focused, Hesitant"
                value={formState.emotion}
                onChange={handleInputChange('emotion')}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="trade-description">Notes</Label>
            <textarea
              id="trade-description"
              className="min-h-[96px] w-full resize-y rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="What did you see? What will you repeat or avoid?"
              value={formState.description}
              onChange={handleTextAreaChange}
            />
          </div>

          <div className="flex items-center justify-between rounded-2xl bg-muted/40 px-4 py-3">
            <div>
              <span className="text-sm font-medium text-foreground">Followed plan?</span>
              <p className="text-xs text-muted-foreground">Mark this if the setup matched your playbook rules.</p>
            </div>
            <label className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border border-input"
                checked={formState.withPlan}
                onChange={handleInputChange('withPlan')}
              />
              With plan
            </label>
          </div>

          {error ? (
            <p className="rounded-md border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs font-medium text-rose-200">
              {error}
            </p>
          ) : null}

          <div className="flex items-center justify-end gap-2">
            <Button type="button" variant="ghost" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button className={cn('min-w-24')} disabled={isSubmitting || (!availablePairs.length && !formState.pair)}>
              {isSubmitting ? 'Saving…' : 'Save trade'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
