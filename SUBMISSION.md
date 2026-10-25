# Submission

This folder contains the AjaiDocs take-home.

## Included

- Source code (Next.js 15, TipTap, Prisma)
- [README.md](README.md) — local setup, demo accounts, supported file types, deploy notes
- [ARCHITECTURE.md](ARCHITECTURE.md) — priorities and design decisions
- [AI_WORKFLOW.md](AI_WORKFLOW.md) — AI usage note
- [WALKTHROUGH_URL.txt](WALKTHROUGH_URL.txt) — walkthrough video URL (record and paste before sending)
- Unit tests in `tests/unit`
- Playwright coverage in `tests/e2e`

## Review quickly

1. Open the live URL (see README after deploy) or run `npm install && npm run setup && npm run dev`
2. Sign in as `alice@ajaia.dev` / `demo1234`
3. Create or open a document, format text, refresh
4. Import a `.md` file
5. Share with `bob@ajaia.dev` as an editor
6. Sign in as Bob, then Carol (view-only on the seeded welcome doc)

## Working

- Document create, rename, rich-text edit, autosave, reopen, delete (owner)
- File import: `.txt`, `.md`, `.docx` (2 MB cap)
- Sharing: owner, view, edit; owned vs shared lists
- Persistence after refresh
- Automated tests for access control, import, and the main user flow

## Incomplete / next 2–4 hours

- Live Vercel URL — CLI is not logged in on this machine. After `npx vercel login`, attach a Neon `DATABASE_URL` and `SESSION_SECRET`, deploy, then run `npm run db:seed` against Neon.
- Walkthrough video (3–5 minutes) — record from `npm run dev` and paste the URL into `WALKTHROUGH_URL.txt`
- Optional polish: public view-only links, conflict banner when two tabs overwrite

## Intentionally deprioritized

Realtime cursors, comments, version history, folders, images, SSO.
