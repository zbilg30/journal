import type { DocumentNode } from 'graphql'

export type TypedDocumentNode<Result = Record<string, unknown>, Variables = Record<string, unknown>> = DocumentNode & {
  readonly __resultType?: Result
  readonly __variablesType?: Variables
}
