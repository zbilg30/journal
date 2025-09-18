import { cacheExchange, createClient, fetchExchange } from 'urql'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/graphql'

let authToken: string | null = null

export function setGraphqlAuthToken(token: string | null) {
  authToken = token
}

export const graphqlClient = createClient({
  url: API_URL,
  requestPolicy: 'cache-and-network',
  exchanges: [cacheExchange, fetchExchange],
  fetchOptions: () => {
    if (!authToken) {
      return {}
    }

    return {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    }
  },
})
