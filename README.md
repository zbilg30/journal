# Journal Trading Monorepo

This repository is managed with Turborepo and pnpm workspaces.

## Structure

- `apps/web` – Vite + React trading journal application (URQL client)
- `apps/api` – Bun + GraphQL Yoga API (Pothos code-first schema)
- `packages/*` – shared packages (add as the project grows)

## Getting Started

```bash
pnpm install
pnpm install
pnpm dev
```

- `pnpm dev` – runs all development servers (`turbo dev`)
- `pnpm build` – builds all apps/packages
- `pnpm lint` – lints the workspace
- `pnpm codegen` – regenerates GraphQL types & client bindings

Use Turborepo tasks from individual apps (e.g. `pnpm --filter web dev`) for focused development.

### Environment

Create a `.env` in the repo root:

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_API_URL=http://localhost:4000/graphql
```
