import { nanoid } from 'nanoid'

export type Setup = {
  id: string
  name: string
  bias: string
  description: string
  focusTag?: string
  lastExecuted?: string
  stats?: {
    winRate: number
    avgR: number
    sample: number
  }
}

export type TradeDay = {
  id: string
  date: string
  month: string
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

export type MonthlyJournal = {
  month: string
  days: TradeDay[]
}

export type MonthlySummary = {
  month: string
  net: number
  tradeCount: number
  activeDays: number
  grossProfit: number
  grossLoss: number
}

export type MonthlyJournalResult = MonthlyJournal & {
  summary: MonthlySummary
}

const initialSetups: Setup[] = [
  {
    id: 'opening-range',
    name: 'Opening Range Breakout',
    bias: 'Long bias over prior day high',
    description: 'Wait for 15m balance break with volume acceleration and VWAP reclaim.',
    lastExecuted: 'Apr 25',
    focusTag: 'Active',
    stats: {
      winRate: 64,
      avgR: 1.9,
      sample: 28,
    },
  },
  {
    id: 'failed-auction-fade',
    name: 'Failed Auction Fade',
    bias: 'Short bias into resistance',
    description: 'Fade single prints after exhaustion wick and cumulative delta divergence.',
    lastExecuted: 'Apr 23',
    focusTag: 'High Conviction',
    stats: {
      winRate: 58,
      avgR: 2.3,
      sample: 19,
    },
  },
  {
    id: 'opening-drive-scrap',
    name: 'Opening Drive Scrap',
    bias: 'Counter-trend scalp',
    description: 'Engage only if liquidity stack and 1m order flow confirm absorption.',
    lastExecuted: 'Apr 18',
    focusTag: 'Review Notes',
    stats: {
      winRate: 42,
      avgR: 1.1,
      sample: 14,
    },
  },
]

const initialJournal: Record<string, TradeDay[]> = {
  '2025-04': [
    {
      id: 'trade-2025-04-04',
      date: '2025-04-04',
      month: '2025-04',
      net: 2934,
      trades: 2,
      pair: 'EURUSD',
      rr: 2.1,
      direction: 'long',
      session: 'london',
      closedBy: 'tp',
      riskPercent: 0.5,
      emotion: 'Focused',
      withPlan: true,
      description: 'Executed ORB with VWAP reclaim.',
      setupId: 'opening-range',
    },
    {
      id: 'trade-2025-04-09',
      date: '2025-04-09',
      month: '2025-04',
      net: 4727,
      trades: 4,
      pair: 'USDJPY',
      rr: 3.4,
      direction: 'long',
      session: 'new-york',
      closedBy: 'tp',
      riskPercent: 0.75,
      emotion: 'Confident',
      withPlan: true,
      description: 'Continuation breakout on NY open.',
      setupId: 'failed-auction-fade',
    },
    {
      id: 'trade-2025-04-17',
      date: '2025-04-17',
      month: '2025-04',
      net: -1571,
      trades: 4,
      pair: 'GBPUSD',
      rr: 0.6,
      direction: 'short',
      session: 'london',
      closedBy: 'sl',
      riskPercent: 0.5,
      emotion: 'Frustrated',
      withPlan: false,
      description: 'Forced trade outside plan after fake-out.',
      setupId: 'opening-drive-scrap',
    },
    {
      id: 'trade-2025-04-25',
      date: '2025-04-25',
      month: '2025-04',
      net: 123,
      trades: 2,
      pair: 'EURUSD',
      rr: 1.2,
      direction: 'short',
      session: 'new-york',
      closedBy: 'manual',
      riskPercent: 0.25,
      emotion: 'Neutral',
      withPlan: true,
      description: 'Partial fill; exited ahead of weekend news.',
      setupId: 'opening-range',
    },
  ],
}

export const db = {
  setups: [...initialSetups],
  journal: { ...initialJournal },
}

export function addSetup(setup: Omit<Setup, 'id'>) {
  const next: Setup = { ...setup, id: nanoid(12) }
  db.setups.push(next)
  return next
}

export function addTrade(trade: Omit<TradeDay, 'id'>) {
  const month = trade.month ?? trade.date.slice(0, 7)
  const next: TradeDay = { ...trade, month, id: nanoid(12) }
  if (!db.journal[month]) {
    db.journal[month] = []
  }
  db.journal[month].push(next)
  return next
}

export function getSetups() {
  return db.setups
}

export function getMonthlyJournal(month: string): MonthlyJournalResult {
  const days = [...(db.journal[month] ?? [])]

  const summary = days.reduce<MonthlySummary>(
    (acc, day) => {
      acc.net += day.net
      acc.tradeCount += day.trades
      acc.activeDays += 1
      if (day.net > 0) acc.grossProfit += day.net
      if (day.net < 0) acc.grossLoss += Math.abs(day.net)
      return acc
    },
    { month, net: 0, tradeCount: 0, activeDays: 0, grossProfit: 0, grossLoss: 0 },
  )

  return {
    month,
    days,
    summary,
  }
}
