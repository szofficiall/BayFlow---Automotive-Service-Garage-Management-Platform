# BayFlow Vercel Services setup

## Inferred service and route choices — approval required

- `server`: `server/`, Express backend; publicly routed at `/api/*`.
- `web`: `web/`, Next.js frontend; publicly routed at all other paths.
- Service bindings: **none**. The React client fetches `/api/*` from the browser via a public rewrite. Neither application makes server-side calls to another service. A binding would be unused. If you want the Express API fully private, we can instead add a Next.js server-side proxy and a `web` -> `server` service binding.

Do not set binding-generated environment variables manually. `NEXT_PUBLIC_API_URL` must remain unset in Vercel so client requests use `/api/*` on the same origin. For separate local Node/Next terminals, set it in `web/.env.local` to `http://localhost:4000`.

## Deployment steps

1. Add `vercel.json` from this package to the GitHub repository **root**, not in `web/`.
2. In Vercel, import the GitHub repository as **one** project with project Root Directory at repository root (`.`).
3. Set its Framework Preset to **Services** (required). Service names match the `services` keys: `web` and `server`.
4. Run `npm install -g vercel` if needed; from the repository root run `vercel link` then `vercel dev` for a production-like local multi-service test. You may use `vercel dev -L` for local-only mode where supported.
5. Deploy with `vercel` (preview) or `vercel --prod` (production), or push to your connected GitHub branch.
6. Smoke test `/` and `/api/health`. The other API endpoints intentionally return HTTP 503 in Vercel because the project still uses local JSON storage.

## Important: storage and production readiness

**This is a routing/deployment configuration, not a fully working hosted booking system.** The original Express backend synchronously stores users, passwords, sessions, bookings, slots and audit records in `server/data.json`. Vercel Functions have no durable writable filesystem; changes would be lost, fail or disagree across instances. This patch therefore **blocks stateful API operations on Vercel** rather than risking misleading success or disappearing customer data. The `/api/health` endpoint remains available.

To deploy the complete application for real use, migrate `server/store.js`, `server/index.js` and the demo seeder to a persistent transaction-safe external database (for example PostgreSQL) using asynchronous queries and proper transaction handling, then remove the explicit temporary 503 guard. Moving only the file path to `/tmp` is **not** a production solution. Provide secure environment configuration for database connectivity and add proper concurrency, security, and integration tests.

## Source code modifications

- `web/app/page.tsx`: defaults API fetches to the current origin `/api`; optional `NEXT_PUBLIC_API_URL` is for separate local servers only.
- `server/index.js`: exports the Express app for Vercel; starts a port listener only outside Vercel. Vercel health endpoint works, stateful endpoints report 503 until durable storage is implemented.
- `vercel.json`: two services, most-specific `/api/*` rewrite first, frontend catch-all second.

## Please confirm before deploying

1. Are the service names `server` and `web` correct?
2. Should the Express API be public at `/api/*` and Next.js public at `/*`, or should Express be fully internal behind a Next.js proxy?
3. Do you confirm **no bindings are required** with the current browser-to-public-API architecture, or do you want the Next.js server-to-Express binding/proxy variant?
