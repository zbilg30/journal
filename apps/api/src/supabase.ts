import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

type EnvShape = Record<string, string | undefined>

function parseEnvFile(content: string): EnvShape {
  const result: EnvShape = {}
  for (const rawLine of content.split(/\r?\n/)) {
    let line = rawLine.trim()
    if (!line || line.startsWith('#')) continue
    if (line.startsWith('export ')) {
      line = line.slice('export '.length)
    }
    const equalsIndex = line.indexOf('=')
    if (equalsIndex === -1) continue
    const key = line.slice(0, equalsIndex).trim()
    const valueRaw = line.slice(equalsIndex + 1).trim()
    if (!key) continue

    const isQuoted =
      (valueRaw.startsWith('"') && valueRaw.endsWith('"')) ||
      (valueRaw.startsWith("'") && valueRaw.endsWith("'"))
    const value = isQuoted ? valueRaw.slice(1, -1) : valueRaw

    result[key] = value
  }
  return result
}

function loadNearestEnvFile(): EnvShape {
  try {
    const startDir = dirname(fileURLToPath(import.meta.url))
    const visited = new Set<string>()
    let currentDir: string | undefined = startDir

    while (currentDir && !visited.has(currentDir)) {
      visited.add(currentDir)
      const candidate = join(currentDir, '.env')
      if (existsSync(candidate)) {
        const content = readFileSync(candidate, 'utf8')
        return parseEnvFile(content)
      }
      const parent = dirname(currentDir)
      if (parent === currentDir) break
      currentDir = parent
    }
  } catch {
    // Ignore filesystem errors and fall back to runtime env vars only.
  }
  return {}
}

const envSources: EnvShape[] = []

const fileEnv = loadNearestEnvFile()
if (Object.keys(fileEnv).length > 0) {
  envSources.push(fileEnv)
}

const bunEnv = (globalThis as { Bun?: { env: EnvShape } }).Bun?.env
if (bunEnv) envSources.push(bunEnv)

const processEnv = (globalThis as { process?: { env?: EnvShape } }).process?.env
if (processEnv) envSources.push(processEnv)

const env = Object.assign({}, ...envSources)
export const resolvedEnv: EnvShape = env

const SUPABASE_URL = env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY
const SUPABASE_KEY = SUPABASE_SERVICE_ROLE_KEY ?? env.SUPABASE_ANON_KEY
if (!SUPABASE_URL) {
  throw new Error('Missing SUPABASE_URL environment variable')
}

if (!SUPABASE_KEY) {
  throw new Error(
    'Missing Supabase credentials. Set SUPABASE_SERVICE_ROLE_KEY (preferred) or SUPABASE_ANON_KEY.',
  )
}

export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY)
