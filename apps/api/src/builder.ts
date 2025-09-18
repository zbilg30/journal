import SchemaBuilder from '@pothos/core'

export type GraphQLContext = {
  userId: string | null
}

export const builder = new SchemaBuilder<{ Context: GraphQLContext }>({})

builder.queryType({})
builder.mutationType({})
