import { createOpenAI } from '@ai-sdk/openai'
import { createYoga } from 'graphql-yoga'
import { streamText, type CoreMessage } from 'ai'
import { schema } from './schema'
import { supabase, resolvedEnv } from './supabase'
const OPENAI_API_KEY = resolvedEnv.OPENAI_API_KEY ?? null
const openai = OPENAI_API_KEY
  ? createOpenAI({ apiKey: OPENAI_API_KEY })
  : null

const SYSTEM_PROMPT = [
  'You are an AI trading copilot for forex futures traders.',
  'Answer with practical, concise guidance grounded in forex futures concepts, strategies, journal insights, and risk management.',
  'If a request is unrelated to forex futures trading, reply that you can only help with that domain.'
].join(' ')

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

function withCors(response: Response): Response {
  const headers = new Headers(response.headers)
  for (const [key, value] of Object.entries(CORS_HEADERS)) {
    headers.set(key, value)
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}

function toCoreMessages(messages: unknown[]): CoreMessage[] {
  if (!Array.isArray(messages)) {
    return []
  }

  const sanitized: CoreMessage[] = []

  for (const message of messages) {
    if (!message || typeof message !== 'object') {
      continue
    }

    const role = (message as { role?: string }).role
    if (role !== 'system' && role !== 'user' && role !== 'assistant') {
      continue
    }

    const parts = Array.isArray((message as { parts?: unknown[] }).parts)
      ? ((message as { parts?: unknown[] }).parts as Array<Record<string, unknown>>)
      : []

    const textParts = parts
      // `reasoning` and other experimental parts break message conversion; keep text only.
      .filter((part) => part && typeof part === 'object' && (part as { type?: string }).type === 'text')
      .map((part) => {
        const text = (part as { text?: unknown }).text
        return typeof text === 'string' ? text.trim() : ''
      })
      .filter((text) => text.length > 0)

    if (textParts.length === 0) {
      const content = (message as { content?: unknown }).content
      if (typeof content === 'string' && content.trim().length > 0) {
        textParts.push(content.trim())
      }
    }

    if (textParts.length === 0) {
      continue
    }

    sanitized.push({
      role,
      content: textParts.join('\n'),
    })
  }

  return sanitized
}

async function handleChatRequest(request: Request): Promise<Response> {
  if (!openai) {
    return withCors(new Response(JSON.stringify({ error: 'Chat assistant is not configured.' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    }))
  }
  const body= await request.json();
  const {messages, UserId: userId} = body;
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return withCors(new Response(JSON.stringify({ error: 'Messages are required.' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    }))
  }
  const coreMessages = toCoreMessages(messages)

  if (coreMessages.length === 0) {
    return withCors(new Response(JSON.stringify({ error: 'No valid text messages were provided.' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    }))
  }
  const result = streamText({
    model: openai('gpt-5'), // vision-capable
    messages: coreMessages,
    system: SYSTEM_PROMPT,
  });
  return withCors(result.toUIMessageStreamResponse())

}

const yoga = createYoga({
  schema,
  graphqlEndpoint: '/graphql',
  context: async ({ request }) => {
    const authHeader = request.headers.get('authorization') ?? ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice('Bearer '.length).trim() : null

    if (!token) {
      return { userId: null }
    }

    const { data, error } = await supabase.auth.getUser(token)
    if (error || !data.user) {
      return { userId: null }
    }

    return { userId: data.user.id }
  },
})

const port = Number(Bun.env.PORT ?? 4000)

Bun.serve({
  port,
  fetch: async (request, server) => {
    const url = new URL(request.url)
    if (url.pathname === '/api/chat') {
      if (request.method === 'OPTIONS') {
        return withCors(new Response(null, { status: 204 }))
      }

      if (request.method === 'POST') {
        return handleChatRequest(request)
      }

      return withCors(new Response('Method Not Allowed', { status: 405 }))
    }

    return yoga.fetch(request, server)
  },
})

console.log(`🚀 GraphQL API ready at http://localhost:${port}/graphql`)
