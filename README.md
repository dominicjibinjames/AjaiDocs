# AjaiDocs

A lightweight collaborative document editor for internal teams. Create, format, import, share, and reopen documents without waiting on the network while you type.

## Demo accounts

Password for every account: `demo1234`

| Email | Name | Suggested review role |
| --- | --- | --- |
| `alice@ajaia.dev` | Alice Chen | Owner |
| `bob@ajaia.dev` | Bob Rivera | Editor on the seeded welcome doc |
| `carol@ajaia.dev` | Carol Nguyen | Viewer on the seeded welcome doc |

## Supported file import

- `.txt`
- `.md`
- `.docx`

Maximum size: **2 MB**. Other types are rejected in the UI and by the API.

## Local setup

Requires Node.js 20+.

```bash
npm install
npm run setup
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in as Alice.

`npm run setup` generates the Prisma client, creates a local SQLite database at `prisma/dev.db`, and seeds the demo users plus sample documents.

To reset demo data:

```bash
npm run db:reset
```

## Tests

```bash
npm test
npx playwright install chromium
npm run test:e2e
```

Unit tests cover access control and import parsing. Playwright covers login, create, format, refresh, and sharing.

## What works

- Create, rename, edit, autosave, reopen, and delete owned documents
- Bold, italic, underline, H1, H2, body, bullets, numbered lists
- Import `.txt`, `.md`, and `.docx` into a new editable document
- Owner / view / edit sharing, with owned vs shared lists
- Persistence across refresh (SQLite locally, Neon Postgres on Vercel)

## Intentionally not built

Realtime cursors, comments, version history, offline mode, folders, image attachments, SSO, and public secret links.

## Deploy on Vercel

Local `npm run dev` stays on SQLite (`prisma/schema.prisma` + `DATABASE_URL=file:./dev.db`).  
GitHub → Vercel automatically uses `prisma/schema.postgres.prisma` when `VERCEL=1`.

1. Connect a Neon (or Prisma Postgres) database to the Vercel project.
2. Set Production `DATABASE_URL` to the **pooled** `postgresql://…` URL.
3. Push to GitHub. The Vercel build generates the Postgres client and runs `prisma db push`.
4. After the first deploy, seed demo users once (then local Prisma is restored to SQLite):

```bash
DATABASE_URL="your-neon-pooled-url" npm run db:seed:prod
```

## Scripts

- `npm run dev` — Next.js with Turbopack
- `npm run build` / `npm start` — production server
- `npm test` — Vitest
- `npm run test:e2e` — Playwright
