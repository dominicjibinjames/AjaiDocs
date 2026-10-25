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

The app is production-ready locally. A public URL needs your Vercel login plus a free Neon database (serverless filesystems cannot keep SQLite).

1. `npx vercel login`
2. Create a free [Neon](https://neon.tech) project and copy the **pooled** connection string.
3. Replace `prisma/schema.prisma` with `prisma/schema.postgres.prisma` (same models, Postgres provider).
4. In Vercel, set:
   - `DATABASE_URL` to the Neon pooled URL
   - `SESSION_SECRET` to a long random string
5. `npx vercel --prod`. After the first deploy, run the seed once:

```bash
DATABASE_URL="your-neon-url" npm run db:seed
```

SQLite is the local default so reviewers do not need Docker. It is not used on Vercel because serverless filesystems are not durable.

## Scripts

- `npm run dev` — Next.js with Turbopack
- `npm run build` / `npm start` — production server
- `npm test` — Vitest
- `npm run test:e2e` — Playwright
