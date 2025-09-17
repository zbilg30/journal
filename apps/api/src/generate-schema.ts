import { writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { printSchema } from 'graphql'

import { schema } from './schema'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outputPath = resolve(__dirname, '../schema.graphql')

writeFileSync(outputPath, printSchema(schema))

console.log(`Schema written to ${outputPath}`)
