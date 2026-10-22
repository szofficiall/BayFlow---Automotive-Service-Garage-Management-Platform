<<<<<<< HEAD
# BayFlow---Automotive-Service-Garage-Management-Platform
A modern full-stack automotive service platform built with Next.js and Node.js, featuring online bookings, role-based dashboards, repair tracking, inventory management, quality control, and responsive light/dark UI.
=======
# BayFlow Studio — Premium Auto Service Platform

A redesigned Next.js + Node.js hackathon prototype with an elevated studio-style visual language inspired by Netvixa, featuring premium electric-blue/glass UI, deep navy palette, responsive breakpoints, and theme-aware animations. Features animated responsive public pages, light/dark themes, six roles, customer booking, service estimates, parts inventory, shop isolation, QC rework loop and activity audit records.

See also **QUICK_START_WINDOWS.md** and the double-click launcher scripts `START_BACKEND.bat` + `START_FRONTEND.bat`.

## Requirements
- Node.js 22 or later (recommended)
- npm 10 or later
- No database installation needed for this local prototype: JSON persistence in `server/data.json`

## Windows quick start (PowerShell)
```powershell
cd BayFlow
npm install
npm run install:all
npm run seed
npm run dev
```
Visit **http://localhost:3000**. Backend is at **http://localhost:4000/api/health**.

If you want separate terminals, run `npm run dev --prefix server` and `npm run dev --prefix web`.

For a fresh demo run: stop development servers, then run `npm run seed`, then `npm run dev`. Seeding replaces the local JSON data and resets passwords/sessions/bookings.

## Demo sign-ins
All demo users have password **Demo@12345**.

| Role | Email |
|---|---|
| Owner | owner@bayflow.demo |
| Service Advisor | advisor@bayflow.demo |
| Technician | technician@bayflow.demo |
| QC Inspector | qc@bayflow.demo |
| Parts Person | parts@bayflow.demo |
| Customer | customer@bayflow.demo |

Owners and staff share demo memberships in each of the three seeded shops for easy testing. **Do not use demo credentials in production.**

## End-to-end testing scenario
1. Customer logs in (or registers), opens Find a garage, selects a service, available slot, and vehicle; confirms booking.
2. Advisor opens dashboard and confirms the pending booking.
3. Advisor assigns technician from that shop's staff list.
4. Technician signs in, starts inspection, enters estimate items with `labor` or `part`. For known parts, use a matching inventory SKU (`brake-pad`, `oil-filter`, `engine-oil`, `battery`, `air-filter`).
5. Advisor sends estimate. Customer accepts (or rejects, allowing estimate rework).
6. Advisor assigns parts person. Parts person checks stock; insufficient stock creates order(s), then receives parts; allocates available parts.
7. Technician completes work and submits to QC.
8. QC inspector claims job; can fail with issue (job returns to repair) or pass.
9. Advisor or customer marks vehicle picked up, completing the booking.

A seeded booking `BF-DEMO01` starts at CONFIRMED for quick testing.

## Main API endpoints
- `POST /api/register`, `POST /api/login`, `GET /api/me`
- `GET /api/shops`, `POST /api/shops` (owner)
- `POST /api/staff/:shopId` (owner)
- `GET /api/bookings`, `POST /api/bookings`, `GET /api/bookings/:id`
- `POST /api/bookings/:id/action` — validated state transitions
- `GET /api/staff/:shopId`, `GET /api/inventory/:shopId`, `GET /api/analytics/:shopId`

Authenticated API requests require `Authorization: Bearer <token>`.

## Configuration
The root `.env.example` documents all environment variables. Copy it to `server/.env` and copy `NEXT_PUBLIC_API_URL=http://localhost:4000` to `web/.env.local` if changing defaults. Client origin is governed by `CLIENT_URL` on the API.

## Architecture
- `web/` — Next.js App Router (TypeScript, custom design tokens, SVG/icon components, CSS keyframes, light/dark switcher).
- `server/` — Express REST backend, token sessions, scrypt-hashed passwords, shop-scoped memberships, explicit booking status checks, inventory purchasing/allocation, timeline audit entries.
- `server/data.json` — local prototype store; automatically created on first start and populated with `npm run seed`.

## Tests & build
```powershell
npm test
npm run build --prefix web
```

## Prototype scope / limitations
This is a functioning **local hackathon core-flow implementation**, not an audited production service. It does not contain real-time WebRTC calling, AI voice front desk, real email/SMS dispatch, a production SQL database, distributed locking, or a public deployment. JSON persistence uses process-local synchronous filesystem updates; run one API process only, and migrate to PostgreSQL with transactions before real multi-user production. In particular, slot reservations and QC claims are serialized only inside one Node process. Secure browser-cookie authentication, request rate limits, stronger schema validation and backup/monitoring are production follow-ups.

No proprietary Netvixa imagery, source code or logos have been copied; the UI is an original implementation inspired by the referenced site's visual atmosphere.
>>>>>>> 457559a (first push)
