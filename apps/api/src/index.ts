import { createYoga } from 'graphql-yoga'

import { schema } from './schema'

const yoga = createYoga({
  schema,
  graphqlEndpoint: '/graphql',
})

const port = Number(Bun.env.PORT ?? 4000)

Bun.serve({
  port,
  fetch: yoga.fetch,
})

console.log(`🚀 GraphQL API ready at http://localhost:${port}/graphql`)
