import type { PostgrestError } from '@supabase/supabase-js'

import { supabase } from './supabase'

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

type SetupRow = {
  id: string
  name: string
  bias: string
  description: string
  focus_tag: string | null
  last_executed: string | null
  stats_win_rate: string | number | null
  stats_avg_r: string | number | null
  stats_sample: number | null
  user_id: string | null
}

type TradeDayRow = {
  id: string
  trade_date: string
  month: string
  net: string | number
  trades: number
  pair: string
  rr: string | number | null
  direction: 'long' | 'short'
  session: string | null
  closed_by: 'tp' | 'sl' | 'manual'
  risk_percent: string | number | null
  emotion: string | null
  with_plan: boolean
  description: string | null
  setup_id: string | null
  user_id: string | null
}

type MonthlySummaryRow = {
  user_id: string | null
  month: string
  net: string | number
  trade_count: number
  active_days: number
  gross_profit: string | number
  gross_loss: string | number
}

function toNumber(value: string | number | null): number | null {
  if (value === null || value === undefined) return null
  if (typeof value === 'number') return value
  if (value.trim() === '') return null
  return Number(value)
}

function normalizeIsoDate(value: string | undefined): string | null {
  if (!value) return null

  const trimmed = value.trim()
  if (!trimmed) return null

  let parsed = new Date(trimmed)

  if (Number.isNaN(parsed.getTime())) {
    parsed = new Date(`${trimmed}T00:00:00`)
  }

  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid date format. Expected ISO date string but received: ${value}`)
  }

  return parsed.toISOString().slice(0, 10)
}

function assertNoError(error: PostgrestError | null, action: string): void {
  if (error) {
    throw new Error(`Supabase ${action} error: ${error.message}`)
  }
}

function mapSetup(row: SetupRow): Setup {
  const statsWinRate = toNumber(row.stats_win_rate)
  const statsAvgR = toNumber(row.stats_avg_r)
  const statsSample = row.stats_sample ?? null

  if (statsWinRate !== null && statsAvgR !== null && statsSample !== null) {
    return {
      id: row.id,
      name: row.name,
      bias: row.bias,
      description: row.description,
      focusTag: row.focus_tag ?? undefined,
      lastExecuted: row.last_executed ?? undefined,
      stats: {
        winRate: statsWinRate,
        avgR: statsAvgR,
        sample: statsSample,
      },
    }
  }

  return {
    id: row.id,
    name: row.name,
    bias: row.bias,
    description: row.description,
    focusTag: row.focus_tag ?? undefined,
    lastExecuted: row.last_executed ?? undefined,
  }
}

function mapTradeDay(row: TradeDayRow): TradeDay {
  const date = row.trade_date
  const month = date.slice(0, 7)

  return {
    id: row.id,
    date,
    month,
    net: toNumber(row.net) ?? 0,
    trades: row.trades,
    pair: row.pair,
    rr: toNumber(row.rr),
    direction: row.direction,
    session: row.session ?? undefined,
    closedBy: row.closed_by,
    riskPercent: toNumber(row.risk_percent),
    emotion: row.emotion ?? undefined,
    withPlan: row.with_plan,
    description: row.description ?? undefined,
    setupId: row.setup_id ?? undefined,
  }
}

function fallbackSummary(month: string, days: TradeDay[]): MonthlySummary {
  return days.reduce<MonthlySummary>(
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
}

function mapMonthlySummary(
  month: string,
  row: MonthlySummaryRow | undefined,
  days: TradeDay[],
): MonthlySummary {
  if (!row) {
    return fallbackSummary(month, days)
  }

  return {
    month,
    net: toNumber(row.net) ?? 0,
    tradeCount: row.trade_count,
    activeDays: row.active_days,
    grossProfit: toNumber(row.gross_profit) ?? 0,
    grossLoss: toNumber(row.gross_loss) ?? 0,
  }
}

function getMonthRange(month: string): { start: string; end: string } {
  const [year, monthPart] = month.split('-').map(Number)
  if (!year || !monthPart) {
    throw new Error(`Invalid month format: ${month}. Expected YYYY-MM.`)
  }
  const startDate = new Date(Date.UTC(year, monthPart - 1, 1))
  const endDate = new Date(Date.UTC(year, monthPart, 1))
  const start = startDate.toISOString().slice(0, 10)
  const end = endDate.toISOString().slice(0, 10)
  return { start, end }
}

export async function addSetup(userId: string, setup: Omit<Setup, 'id'>) {
  const payload = {
    name: setup.name,
    bias: setup.bias,
    description: setup.description,
    focus_tag: setup.focusTag ?? null,
    last_executed: normalizeIsoDate(setup.lastExecuted),
    stats_win_rate: setup.stats?.winRate ?? null,
    stats_avg_r: setup.stats?.avgR ?? null,
    stats_sample: setup.stats?.sample ?? null,
    user_id: userId,
  }

  const { data, error } = await supabase
    .from('setups')
    .insert(payload)
    .select()
    .single()

  assertNoError(error, 'insert setup')

  if (!data) {
    throw new Error('Supabase did not return created setup')
  }

  return mapSetup(data)
}

export async function addTrade(userId: string, trade: Omit<TradeDay, 'id'>) {
  const month = trade.month ?? trade.date.slice(0, 7)
  const payload = {
    trade_date: trade.date,
    month,
    net: trade.net,
    trades: trade.trades,
    pair: trade.pair,
    rr: trade.rr ?? null,
    direction: trade.direction,
    session: trade.session ?? null,
    closed_by: trade.closedBy,
    risk_percent: trade.riskPercent ?? null,
    emotion: trade.emotion ?? null,
    with_plan: trade.withPlan,
    description: trade.description ?? null,
    setup_id: trade.setupId ?? null,
    user_id: userId,
  }

  const { data, error } = await supabase
    .from('trade_days')
    .insert(payload)
    .select()
    .single()

  assertNoError(error, 'insert trade')

  if (!data) {
    throw new Error('Supabase did not return created trade row')
  }

  return mapTradeDay(data)
}

export async function getSetups(userId: string) {
  const { data, error } = await supabase
    .from('setups')
    .select('*')
    .eq('user_id', userId)
    .order('inserted_at', { ascending: false })

  assertNoError(error, 'fetch setups')

  return (data ?? []).map(mapSetup)
}

export async function getMonthlyJournal(
  userId: string,
  month: string,
): Promise<MonthlyJournalResult> {
  const { start, end } = getMonthRange(month)

  const [{ data: dayRows, error: dayError }, { data: summaryRow, error: summaryError }] =
    await Promise.all([
      supabase
        .from('trade_days')
        .select('*')
        .gte('trade_date', start)
        .lt('trade_date', end)
        .eq('user_id', userId)
        .order('trade_date', { ascending: true }),
      supabase
        .from('monthly_trade_summary')
        .select('*')
        .eq('month', month)
        .eq('user_id', userId)
        .maybeSingle(),
    ])

  assertNoError(dayError, 'fetch trade days')
  assertNoError(summaryError, 'fetch monthly summary')

  const days = (dayRows ?? []).map(mapTradeDay)
  const summary = mapMonthlySummary(month, summaryRow ?? undefined, days)

  return { month, days, summary }
}
