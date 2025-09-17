import { Button } from '@/components/ui/button'

export type TradingSetup = {
  id: string
  name: string
  bias: string
  description: string
  lastExecuted?: string
  stats?: {
    winRate: number
    avgR: number
    sample: number
  }
  focusTag?: string
}

export const defaultTradingSetups: TradingSetup[] = []

function SetupCard({ setup }: { setup: TradingSetup }) {
  const stats = setup.stats
  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-muted/40 bg-white/80 p-4 text-sm shadow-sm shadow-black/[0.03]">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold tracking-tight text-foreground">{setup.name}</h3>
          <p className="text-xs font-medium text-muted-foreground/70">{setup.bias}</p>
        </div>
        {setup.focusTag ? (
          <span className="whitespace-nowrap rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary">
            {setup.focusTag}
          </span>
        ) : null}
      </div>
      <p className="text-xs leading-relaxed text-muted-foreground">{setup.description}</p>
      {stats ? (
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/70">
          <span>Win {stats.winRate}%</span>
          <span>Avg R {stats.avgR.toFixed(1)}x</span>
          <span>{stats.sample} trades</span>
        </div>
      ) : (
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground/60">Stats coming soon</p>
      )}
      <span className="text-[11px] font-medium text-muted-foreground/60">
        Last executed {setup.lastExecuted ?? '—'}
      </span>
    </article>
  )
}

type SetupsPanelProps = {
  setups?: TradingSetup[]
  onAddSetup?: () => void
}

export function SetupsPanel({ setups = defaultTradingSetups, onAddSetup }: SetupsPanelProps) {
  return (
    <section className="rounded-[32px] border border-muted/40 bg-gradient-to-br from-white/80 via-white to-primary/10 p-6 shadow-inner shadow-purple-200/30">
      <div className="flex flex-col gap-5">
        <div className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground/70">
            Playbook
          </span>
          <h2 className="text-lg font-semibold tracking-tight text-foreground">Today&apos;s Setups</h2>
          <p className="text-xs text-muted-foreground">
            Keep your execution aligned with the setups you know cold. Review the plan before taking new risk.
          </p>
        </div>

        <div className="space-y-3">
          {setups.length ? (
            setups.map((setup) => <SetupCard key={setup.id} setup={setup} />)
          ) : (
            <p className="rounded-2xl border border-dashed border-muted/50 bg-white/60 px-4 py-6 text-center text-sm text-muted-foreground">
              You haven&apos;t created any setups yet. Add one to document the rules you execute against.
            </p>
          )}
        </div>

        <Button className="w-full" size="sm" variant="outline" onClick={onAddSetup} disabled={!onAddSetup}>
          Add new setup
        </Button>
      </div>
    </section>
  )
}
