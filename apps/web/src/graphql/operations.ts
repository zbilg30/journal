import { gql } from 'urql'

export const GetSetupsDocument = gql`
  query GetSetups {
    setups {
      id
      name
      bias
      description
      focusTag
      lastExecuted
      stats {
        winRate
        avgR
        sample
      }
    }
  }
`

export const MonthlyJournalDocument = gql`
  query MonthlyJournal($month: String!) {
    monthlyJournal(month: $month) {
      month
      summary {
        month
        net
        tradeCount
        activeDays
        grossProfit
        grossLoss
      }
      days {
        id
        date
        month
        net
        trades
        pair
        rr
        direction
        session
        closedBy
        riskPercent
        emotion
        withPlan
        description
        setupId
      }
    }
  }
`

export const AddSetupDocument = gql`
  mutation AddSetup($input: AddSetupInput!) {
    addSetup(input: $input) {
      id
      name
      bias
      description
      focusTag
      lastExecuted
    }
  }
`

export const AddTradeDocument = gql`
  mutation AddTrade($input: AddTradeInput!) {
    addTrade(input: $input) {
      id
      date
      month
      net
      trades
      pair
      rr
      direction
      session
      closedBy
      riskPercent
      emotion
      withPlan
      description
      setupId
    }
  }
`
