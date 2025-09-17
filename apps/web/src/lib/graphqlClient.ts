import { cacheExchange, createClient,  fetchExchange } from 'urql'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/graphql'

export const graphqlClient = createClient({
  url: API_URL,
  requestPolicy: 'cache-and-network',
  exchanges: [ cacheExchange, fetchExchange],
})
