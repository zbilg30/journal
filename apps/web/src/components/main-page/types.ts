import type { ReactNode } from 'react'

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

export type TradingJournalData = Record<string, Record<string, TradeDayData>>

export type TradeStats = {
  grossProfit: number
  grossLoss: number
  positiveTradeCount: number
  negativeTradeCount: number
}

export type SummaryMetric = {
  label: string
  value: string
  helper?: string
  trendLabel?: string
  trendTone?: 'positive' | 'negative' | 'neutral'
  children?: ReactNode
}
