import type { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  schema: './apps/api/schema.graphql',
  documents: ['apps/web/src/graphql/**/*.ts'],
  generates: {
    './apps/web/src/generated/graphql.ts': {
      plugins: ['typescript', 'typescript-operations', 'typed-document-node'],
    },
  },
}

export default config
