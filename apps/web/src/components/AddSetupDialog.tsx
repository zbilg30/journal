import { useEffect, useState, type ChangeEvent, type FormEvent, type MouseEvent } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

export type AddSetupInput = {
  name: string
  bias: string
  description: string
}

type FormState = {
  name: string
  bias: string
  description: string
}

type AddSetupDialogProps = {
  open: boolean
  onOpenChange: (nextOpen: boolean) => void
  onSubmit: (data: AddSetupInput) => Promise<void> | void
}

const emptyForm: FormState = {
  name: '',
  bias: '',
  description: '',
}

export function AddSetupDialog({ open, onOpenChange, onSubmit }: AddSetupDialogProps) {
  const [formState, setFormState] = useState<FormState>(emptyForm)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!open) {
      setFormState(emptyForm)
      setError(null)
    }
  }, [open])

  if (!open) {
    return null
  }

  const handleInputChange = (field: keyof FormState) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormState((prev) => ({ ...prev, [field]: event.target.value }))
  }

  const handleClose = () => {
    if (isSubmitting) return
    onOpenChange(false)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!formState.name.trim()) {
      setError('Name is required.')
      return
    }

    if (!formState.bias.trim()) {
      setError('Add a quick bias reminder.')
      return
    }

    if (!formState.description.trim()) {
      setError('Write a brief description of the setup rules.')
      return
    }

    setError(null)
    setIsSubmitting(true)

    try {
      await onSubmit({
        name: formState.name.trim(),
        bias: formState.bias.trim(),
        description: formState.description.trim(),
      })
      onOpenChange(false)
    } catch (submitError) {
      console.error('Failed to add setup', submitError)
      setError('Could not create setup. Try again.')
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-10 backdrop-blur-sm"
      onClick={handleOverlayClick}
      role="dialog"
    >
      <div
        className="relative w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl"
        role="document"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">Add Setup</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Document the criteria and stats for a setup you actively execute.
            </p>
          </div>
          <button
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-muted text-muted-foreground transition hover:bg-muted/80"
            onClick={handleClose}
            type="button"
          >
            <span aria-hidden>×</span>
          </button>
        </div>

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="setup-name">Setup name</Label>
            <Input
              id="setup-name"
              placeholder="Opening Range Breakout"
              value={formState.name}
              onChange={handleInputChange('name')}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="setup-bias">Bias / conditions</Label>
            <Input
              id="setup-bias"
              placeholder="Long bias over prior day high"
              value={formState.bias}
              onChange={handleInputChange('bias')}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="setup-description">Execution checklist</Label>
            <textarea
              id="setup-description"
              className="min-h-[120px] w-full resize-y rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Outline the trigger, confirmation, and management rules."
              value={formState.description}
              onChange={handleInputChange('description')}
              required
            />
          </div>

          {error ? (
            <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">
              {error}
            </p>
          ) : null}

          <div className="flex items-center justify-end gap-2">
            <Button type="button" variant="ghost" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button className={cn('min-w-24')} disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : 'Save setup'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
