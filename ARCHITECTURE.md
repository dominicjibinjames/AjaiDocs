# Architecture

AjaiDocs is a Next.js 15 App Router product. The editor is a client-side TipTap island. Everything else is a small set of Route Handlers over Prisma.

## Why this shape

The brief asked for depth in create/edit, import, sharing, and persistence — not a Google Docs clone. The quality bar was smoothness: keystrokes must never wait on a serverless function.

```
Browser
  login / docs list (RSC)
  editor (TipTap, client only)
    debounce 800ms → PATCH JSON
API
  auth, documents, share, import
Prisma
  SQLite locally, Neon Postgres on Vercel
```

## Priorities

1. **Typing stays local.** TipTap holds the document in memory. Autosave is debounced and coalesced. Failed saves leave the text in the tab and offer retry.
2. **Obvious sharing.** Home is two lists, not one dump. Viewers see a banner and a disabled toolbar. Missing access returns 404 so titles do not leak.
3. **Import that is product-relevant.** A file becomes a new document. Parsers are pure functions (txt / marked+HTML / mammoth) so they are unit-tested without the database.
4. **Reviewer setup in minutes.** Local SQLite plus seeded accounts. Neon is documented for Vercel because `/tmp` SQLite does not survive serverless.

## Data

- `User` / `Session` — cookie holds an unhashed token; the database stores SHA-256(token)
- `Document` — title + TipTap JSON
- `Share` — unique `(documentId, userId)` with `VIEW` or `EDIT`

Access is one function, `canAccess`, used by both the UI and the API.

## Save protocol

Last write wins. Two tabs on the same document are allowed; the last successful PATCH is kept. No Yjs or websocket layer — those add latency and fight Vercel’s request/response model.

## Import pipeline

Type and size checks → parse → TipTap JSON → create document titled from a sanitized filename. Empty or image-only `.docx` files still create a document and return a warning.

## What we deprioritized

Realtime collaboration, comments, history, offline, folders, and binary attachments. Those would dilute the timebox without making the core loop better.
