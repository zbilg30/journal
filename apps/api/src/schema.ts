import { builder } from './builder'
import {
  addSetup,
  addTrade,
  getMonthlyJournal,
  getSetups,
  type MonthlyJournalResult,
  type MonthlySummary,
  type Setup,
  type TradeAttachment,
  type TradeDay,
} from './data'

type SetupStats = NonNullable<Setup['stats']>

function requireUserId(userId: string | null): string {
  if (!userId) {
    throw new Error('Not authenticated')
  }

  return userId
}

const SetupStatsRef = builder.objectRef<SetupStats>('SetupStats').implement({
  fields: (t) => ({
    winRate: t.exposeFloat('winRate'),
    avgR: t.exposeFloat('avgR'),
    sample: t.exposeInt('sample'),
  }),
})

const SetupRef = builder.objectRef<Setup>('Setup').implement({
  fields: (t) => ({
    id: t.exposeID('id'),
    name: t.exposeString('name'),
    bias: t.exposeString('bias'),
    description: t.exposeString('description'),
    focusTag: t.exposeString('focusTag', { nullable: true }),
    lastExecuted: t.exposeString('lastExecuted', { nullable: true }),
    stats: t.field({
      type: SetupStatsRef,
      nullable: true,
      resolve: (setup) => setup.stats ?? null,
    }),
  }),
})

const TradeAttachmentRef = builder.objectRef<TradeAttachment>('TradeAttachment').implement({
  fields: (t) => ({
    id: t.exposeID('id'),
    bucket: t.exposeString('bucket'),
    path: t.exposeString('path'),
    contentType: t.exposeString('contentType', { nullable: true }),
    sortOrder: t.exposeInt('sortOrder', { nullable: true }),
  }),
})

const TradeAttachmentInput = builder.inputType('TradeAttachmentInput', {
  fields: (t) => ({
    bucket: t.string({ required: true }),
    path: t.string({ required: true }),
    contentType: t.string(),
    sortOrder: t.int(),
  }),
})

const TradeDayRef = builder.objectRef<TradeDay>('TradeDay').implement({
  fields: (t) => ({
    id: t.exposeID('id'),
    date: t.exposeString('date'),
    month: t.exposeString('month'),
    net: t.exposeFloat('net'),
    trades: t.exposeInt('trades'),
    pair: t.exposeString('pair'),
    rr: t.exposeFloat('rr', { nullable: true }),
    direction: t.exposeString('direction'),
    session: t.exposeString('session', { nullable: true }),
    closedBy: t.exposeString('closedBy'),
    riskPercent: t.exposeFloat('riskPercent', { nullable: true }),
    emotion: t.exposeString('emotion', { nullable: true }),
    withPlan: t.exposeBoolean('withPlan'),
    description: t.exposeString('description', { nullable: true }),
    setupId: t.exposeID('setupId', { nullable: true }),
    attachments: t.field({
      type: [TradeAttachmentRef],
      resolve: (trade) => trade.attachments ?? [],
    }),
  }),
})

const MonthlySummaryRef = builder.objectRef<MonthlySummary>('MonthlySummary').implement({
  fields: (t) => ({
    month: t.exposeString('month'),
    net: t.exposeFloat('net'),
    tradeCount: t.exposeInt('tradeCount'),
    activeDays: t.exposeInt('activeDays'),
    grossProfit: t.exposeFloat('grossProfit'),
    grossLoss: t.exposeFloat('grossLoss'),
  }),
})

const MonthlyJournalRef = builder.objectRef<MonthlyJournalResult>('MonthlyJournal').implement({
  fields: (t) => ({
    month: t.exposeString('month'),
    summary: t.field({
      type: MonthlySummaryRef,
      resolve: (journal) => journal.summary,
    }),
    days: t.field({
      type: [TradeDayRef],
      resolve: (journal) => journal.days,
    }),
  }),
})

const AddSetupInput = builder.inputType('AddSetupInput', {
  fields: (t) => ({
    name: t.string({ required: true }),
    bias: t.string({ required: true }),
    description: t.string({ required: true }),
    lastExecuted: t.string(),
  }),
})

const AddTradeInput = builder.inputType('AddTradeInput', {
  fields: (t) => ({
    date: t.string({ required: true }),
    month: t.string(),
    net: t.float({ required: true }),
    trades: t.int({ required: true }),
    pair: t.string({ required: true }),
    rr: t.float(),
    direction: t.string({ required: true }),
    session: t.string(),
    closedBy: t.string({ required: true }),
    riskPercent: t.float(),
    emotion: t.string(),
    withPlan: t.boolean({ required: true }),
    description: t.string({ required: false }),
    setupId: t.id(),
    attachments: t.field({
      type: [TradeAttachmentInput],
    }),
  }),
})

builder.queryFields((t) => ({
  setups: t.field({
    type: [SetupRef],
    resolve: (_root, _args, { userId }) => getSetups(requireUserId(userId)),
  }),
  monthlyJournal: t.field({
    type: MonthlyJournalRef,
    args: {
      month: t.arg.string({ required: true }),
    },
    resolve: (_parent, args, { userId }) => getMonthlyJournal(requireUserId(userId), args.month),
  }),
}))

builder.mutationFields((t) => ({
  addSetup: t.field({
    type: SetupRef,
    args: {
      input: t.arg({ type: AddSetupInput, required: true }),
    },
    resolve: (_parent, { input }, { userId }) =>
      addSetup(requireUserId(userId), {
        ...input,
        lastExecuted: input.lastExecuted ?? undefined,
      }),
  }),
  addTrade: t.field({
    type: TradeDayRef,
    args: {
      input: t.arg({ type: AddTradeInput, required: true }),
    },
    resolve: (_parent, { input }, { userId }) => addTrade(requireUserId(userId), {
      ...input,
      month: input.month ?? input.date.slice(0, 7),
      rr: input.rr ?? undefined,
      session: input.session ?? undefined,
      riskPercent: input.riskPercent ?? undefined,
      emotion: input.emotion ?? undefined,
      description: input.description ?? undefined,
      setupId: input.setupId ?? undefined,
      direction: input.direction === 'short' ? 'short' : 'long',
      closedBy:
        input.closedBy === 'sl'
          ? 'sl'
          : input.closedBy === 'manual'
            ? 'manual'
            : 'tp',
      attachments: (input.attachments ?? []).map((attachment, index) => ({
        bucket: attachment.bucket,
        path: attachment.path,
        contentType: attachment.contentType ?? undefined,
        sortOrder: attachment.sortOrder ?? index,
      })),
    }),
  }),
}))

export const schema = builder.toSchema()
