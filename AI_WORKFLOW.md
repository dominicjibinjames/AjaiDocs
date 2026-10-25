# AI workflow note

## Tools

Cursor agent (Composer) for planning, scaffolding, implementation, and tests.

## Where AI materially sped up the work

- Turning the take-home brief into a scoped product plan (UI, access model, phase gates)
- Boilerplate for Prisma models, Route Handlers, and TipTap toolbar wiring
- First-pass unit and Playwright coverage so the share/import edges were not left to memory

## What I changed or rejected

- Rejected live multiplayer / Yjs. The brief asked for sharing, not realtime. Websockets would add lag on Vercel.
- Rejected storing uploads as binaries. Parsing into TipTap JSON keeps the product fast and avoids a paid blob store.
- Rejected SQLite on Vercel. Local SQLite is for reviewer setup; production uses Neon.
- Reworked generated UI toward a paper/ink document surface instead of a generic dashboard.
- Tightened import and access helpers so they are deterministic and testable, rather than leaving conversion inside API routes.

## How correctness was verified

- Vitest: `canAccess`, title sanitization, txt/md/docx parsers, invalid JSON recovery
- Playwright: wrong password, create → format → refresh, share with Bob, Carol view-only
- Manual gate checks from the plan: empty states, unsupported file types, owner-only delete, 404 for strangers
