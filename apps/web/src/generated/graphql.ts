import type{ TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type AddSetupInput = {
  bias: Scalars['String']['input'];
  description: Scalars['String']['input'];
  lastExecuted?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
};

export type AddTradeInput = {
  attachments?: InputMaybe<Array<TradeAttachmentInput>>;
  closedBy: Scalars['String']['input'];
  date: Scalars['String']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  direction: Scalars['String']['input'];
  emotion?: InputMaybe<Scalars['String']['input']>;
  month?: InputMaybe<Scalars['String']['input']>;
  net: Scalars['Float']['input'];
  pair: Scalars['String']['input'];
  riskPercent?: InputMaybe<Scalars['Float']['input']>;
  rr?: InputMaybe<Scalars['Float']['input']>;
  session?: InputMaybe<Scalars['String']['input']>;
  setupId?: InputMaybe<Scalars['ID']['input']>;
  trades: Scalars['Int']['input'];
  withPlan: Scalars['Boolean']['input'];
};

export type MonthlyJournal = {
  __typename?: 'MonthlyJournal';
  days?: Maybe<Array<TradeDay>>;
  month?: Maybe<Scalars['String']['output']>;
  summary?: Maybe<MonthlySummary>;
};

export type MonthlySummary = {
  __typename?: 'MonthlySummary';
  activeDays?: Maybe<Scalars['Int']['output']>;
  grossLoss?: Maybe<Scalars['Float']['output']>;
  grossProfit?: Maybe<Scalars['Float']['output']>;
  month?: Maybe<Scalars['String']['output']>;
  net?: Maybe<Scalars['Float']['output']>;
  tradeCount?: Maybe<Scalars['Int']['output']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  addSetup?: Maybe<Setup>;
  addTrade?: Maybe<TradeDay>;
};


export type MutationAddSetupArgs = {
  input: AddSetupInput;
};


export type MutationAddTradeArgs = {
  input: AddTradeInput;
};

export type Query = {
  __typename?: 'Query';
  monthlyJournal?: Maybe<MonthlyJournal>;
  setups?: Maybe<Array<Setup>>;
};


export type QueryMonthlyJournalArgs = {
  month: Scalars['String']['input'];
};

export type Setup = {
  __typename?: 'Setup';
  bias?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  focusTag?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  lastExecuted?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  stats?: Maybe<SetupStats>;
};

export type SetupStats = {
  __typename?: 'SetupStats';
  avgR?: Maybe<Scalars['Float']['output']>;
  sample?: Maybe<Scalars['Int']['output']>;
  winRate?: Maybe<Scalars['Float']['output']>;
};

export type TradeAttachment = {
  __typename?: 'TradeAttachment';
  bucket?: Maybe<Scalars['String']['output']>;
  contentType?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  path?: Maybe<Scalars['String']['output']>;
  sortOrder?: Maybe<Scalars['Int']['output']>;
};

export type TradeAttachmentInput = {
  bucket: Scalars['String']['input'];
  contentType?: InputMaybe<Scalars['String']['input']>;
  path: Scalars['String']['input'];
  sortOrder?: InputMaybe<Scalars['Int']['input']>;
};

export type TradeDay = {
  __typename?: 'TradeDay';
  attachments?: Maybe<Array<TradeAttachment>>;
  closedBy?: Maybe<Scalars['String']['output']>;
  date?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  direction?: Maybe<Scalars['String']['output']>;
  emotion?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  month?: Maybe<Scalars['String']['output']>;
  net?: Maybe<Scalars['Float']['output']>;
  pair?: Maybe<Scalars['String']['output']>;
  riskPercent?: Maybe<Scalars['Float']['output']>;
  rr?: Maybe<Scalars['Float']['output']>;
  session?: Maybe<Scalars['String']['output']>;
  setupId?: Maybe<Scalars['ID']['output']>;
  trades?: Maybe<Scalars['Int']['output']>;
  withPlan?: Maybe<Scalars['Boolean']['output']>;
};

export type GetSetupsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetSetupsQuery = { __typename?: 'Query', setups?: Array<{ __typename?: 'Setup', id?: string | null, name?: string | null, bias?: string | null, description?: string | null, focusTag?: string | null, lastExecuted?: string | null, stats?: { __typename?: 'SetupStats', winRate?: number | null, avgR?: number | null, sample?: number | null } | null }> | null };

export type MonthlyJournalQueryVariables = Exact<{
  month: Scalars['String']['input'];
}>;


export type MonthlyJournalQuery = { __typename?: 'Query', monthlyJournal?: { __typename?: 'MonthlyJournal', month?: string | null, summary?: { __typename?: 'MonthlySummary', month?: string | null, net?: number | null, tradeCount?: number | null, activeDays?: number | null, grossProfit?: number | null, grossLoss?: number | null } | null, days?: Array<{ __typename?: 'TradeDay', id?: string | null, date?: string | null, month?: string | null, net?: number | null, trades?: number | null, pair?: string | null, rr?: number | null, direction?: string | null, session?: string | null, closedBy?: string | null, riskPercent?: number | null, emotion?: string | null, withPlan?: boolean | null, description?: string | null, setupId?: string | null }> | null } | null };

export type AddSetupMutationVariables = Exact<{
  input: AddSetupInput;
}>;


export type AddSetupMutation = { __typename?: 'Mutation', addSetup?: { __typename?: 'Setup', id?: string | null, name?: string | null, bias?: string | null, description?: string | null, focusTag?: string | null, lastExecuted?: string | null } | null };

export type AddTradeMutationVariables = Exact<{
  input: AddTradeInput;
}>;


export type AddTradeMutation = { __typename?: 'Mutation', addTrade?: { __typename?: 'TradeDay', id?: string | null, date?: string | null, month?: string | null, net?: number | null, trades?: number | null, pair?: string | null, rr?: number | null, direction?: string | null, session?: string | null, closedBy?: string | null, riskPercent?: number | null, emotion?: string | null, withPlan?: boolean | null, description?: string | null, setupId?: string | null } | null };


export const GetSetupsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetSetups"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setups"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"bias"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"focusTag"}},{"kind":"Field","name":{"kind":"Name","value":"lastExecuted"}},{"kind":"Field","name":{"kind":"Name","value":"stats"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"winRate"}},{"kind":"Field","name":{"kind":"Name","value":"avgR"}},{"kind":"Field","name":{"kind":"Name","value":"sample"}}]}}]}}]}}]} as unknown as DocumentNode<GetSetupsQuery, GetSetupsQueryVariables>;
export const MonthlyJournalDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MonthlyJournal"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"month"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"monthlyJournal"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"month"},"value":{"kind":"Variable","name":{"kind":"Name","value":"month"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"month"}},{"kind":"Field","name":{"kind":"Name","value":"summary"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"month"}},{"kind":"Field","name":{"kind":"Name","value":"net"}},{"kind":"Field","name":{"kind":"Name","value":"tradeCount"}},{"kind":"Field","name":{"kind":"Name","value":"activeDays"}},{"kind":"Field","name":{"kind":"Name","value":"grossProfit"}},{"kind":"Field","name":{"kind":"Name","value":"grossLoss"}}]}},{"kind":"Field","name":{"kind":"Name","value":"days"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"month"}},{"kind":"Field","name":{"kind":"Name","value":"net"}},{"kind":"Field","name":{"kind":"Name","value":"trades"}},{"kind":"Field","name":{"kind":"Name","value":"pair"}},{"kind":"Field","name":{"kind":"Name","value":"rr"}},{"kind":"Field","name":{"kind":"Name","value":"direction"}},{"kind":"Field","name":{"kind":"Name","value":"session"}},{"kind":"Field","name":{"kind":"Name","value":"closedBy"}},{"kind":"Field","name":{"kind":"Name","value":"riskPercent"}},{"kind":"Field","name":{"kind":"Name","value":"emotion"}},{"kind":"Field","name":{"kind":"Name","value":"withPlan"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"setupId"}}]}}]}}]}}]} as unknown as DocumentNode<MonthlyJournalQuery, MonthlyJournalQueryVariables>;
export const AddSetupDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AddSetup"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AddSetupInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addSetup"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"bias"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"focusTag"}},{"kind":"Field","name":{"kind":"Name","value":"lastExecuted"}}]}}]}}]} as unknown as DocumentNode<AddSetupMutation, AddSetupMutationVariables>;
export const AddTradeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AddTrade"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AddTradeInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addTrade"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"month"}},{"kind":"Field","name":{"kind":"Name","value":"net"}},{"kind":"Field","name":{"kind":"Name","value":"trades"}},{"kind":"Field","name":{"kind":"Name","value":"pair"}},{"kind":"Field","name":{"kind":"Name","value":"rr"}},{"kind":"Field","name":{"kind":"Name","value":"direction"}},{"kind":"Field","name":{"kind":"Name","value":"session"}},{"kind":"Field","name":{"kind":"Name","value":"closedBy"}},{"kind":"Field","name":{"kind":"Name","value":"riskPercent"}},{"kind":"Field","name":{"kind":"Name","value":"emotion"}},{"kind":"Field","name":{"kind":"Name","value":"withPlan"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"setupId"}}]}}]}}]} as unknown as DocumentNode<AddTradeMutation, AddTradeMutationVariables>;