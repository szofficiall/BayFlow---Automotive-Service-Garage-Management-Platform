# BayFlow Studio — Windows Start Guide

## Prerequisites
- Node.js 22+ and npm 10+; internet access is required for the **first install**.
- Extract ZIP first. Open the `BayFlow` directory in VS Code.

## Easiest setup (two terminals)
In terminal 1 (project root):
```powershell
cd server
npm install
npm run seed
npm run dev
```

In terminal 2 (project root):
```powershell
cd web
npm install
npm run dev
```

- Frontend: http://localhost:3000
- Backend health: http://localhost:4000/api/health

Alternative: double-click `START_BACKEND.bat` first, then `START_FRONTEND.bat`. On the very first backend start, the batch file automatically seeds the demo database.

## One terminal option
From the project root:
```powershell
npm install
npm run install:all
npm run seed
npm run dev
```

## Demo accounts
Use `owner@bayflow.demo`, `advisor@bayflow.demo`, `technician@bayflow.demo`, `qc@bayflow.demo`, `parts@bayflow.demo` or `customer@bayflow.demo`.
Password for all: `Demo@12345`.

## Troubleshooting
- `Cannot connect to API`: confirm terminal 1 is running and health URL responds.
- `npm is not recognized`: install Node.js and reopen VS Code.
- `Port 3000 in use`: stop the other Next.js app using that port.
- UI shows an old version: stop Next.js, delete `web/.next` then start again.
- Don't run `npm run seed` again after creating your own records: it **resets** local demo data.

## Implementation and limits
Next.js 15 App Router + React 19 + TypeScript frontend, Node.js/Express API, local JSON persistence, multi-shop membership, six accounts, service booking/estimates/parts/QC state machine. Netvixa-inspired design direction, not an exact copy. Light/dark CSS themes and animated UI.

Local prototype, **not production deployment**. No production database, payment gateway, WebRTC calling or hosted AI voice bot. For production use, replace local storage with a transaction-safe DB, harden authentication, add integration tests, and deploy both services with TLS.
