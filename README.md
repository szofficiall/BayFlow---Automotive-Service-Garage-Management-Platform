# BayFlow — Automotive Service & Garage Operations Platform

BayFlow is a modern, full-stack automotive service management web application built with **Next.js, React, TypeScript, Node.js, and Express**. It connects customers, auto repair shops, and workshop teams through one structured workflow—from scheduling an appointment and inspecting a vehicle to approving repair estimates, handling parts, performing quality control, and completing pickup.

The project includes a responsive, animated user interface with light and dark themes and role-based workspaces. It is designed as a **local hackathon prototype** to demonstrate a complete workshop service journey across multiple garages.

**Developed by Sultan Zaib — Python Engineer | Backend Engineer**


## Overview

Traditional garage operations often depend on phone calls, handwritten job cards, and disconnected records. This can make it difficult for customers to follow repairs and for garage teams to coordinate inspections, estimates, parts, and quality checks.

BayFlow provides a unified platform where customers can book services and monitor progress, while authorized workshop staff manage the next operational steps. Status transitions and activity records keep the process organized and traceable.

## Key Features

### Public Website and Customer Experience

- Responsive landing page with a premium SaaS-style design.
- Light and dark mode support.
- Animated sections, interactive cards, and responsive layouts.
- Garage discovery with service details and available booking slots.
- Step-by-step appointment booking wizard.
- Customer registration and sign-in.
- Vehicle information and issue description during booking.
- Customer dashboard showing appointments and their current status.
- Itemized repair estimate review and approval or rejection.
- Booking history and operational activity timeline.

### Garage and Staff Operations

- Owner access to multiple garages and their teams.
- Role-based workspaces for service advisors, technicians, QC inspectors, and parts staff.
- Appointment confirmation and cancellation.
- Technician assignment and inspection workflow.
- Itemized labor and parts estimates.
- Customer estimate approval and rejection workflow.
- Parts stock checks, purchase-order handling, and allocation.
- Repair progress tracking.
- Quality-control checks with pass/fail outcomes.
- Rework loop when a vehicle does not pass QC.
- Pickup confirmation and job completion.
- Shop-scoped memberships, status checks, and audit records.
- Basic owner analytics and revenue summaries.

## Technology Stack

| Layer | Technology |
| --- | --- |
| Frontend | Next.js 15 (App Router), React 19, TypeScript |
| Styling | Custom CSS, responsive design, CSS animations |
| Icons in application UI | Lucide React |
| Backend | Node.js, Express.js |
| API | REST endpoints with JSON responses |
| Authentication | Bearer-token sessions and scrypt password hashing |
| Prototype storage | Local JSON file (`server/data.json`) |
| Development tools | npm, VS Code, Git, GitHub |

The README intentionally uses no decorative icons or emojis. The application itself uses Lucide React icons as part of its interface.

## Project Structure

```text
BayFlow/
├── web/
│   ├── app/
│   │   ├── page.tsx             # Landing page, booking and dashboards
│   │   ├── layout.tsx           # Root layout
│   │   ├── globals.css          # Base styles
│   │   └── premium.css          # Premium UI and visual effects
│   ├── public/
│   ├── package.json
│   └── tsconfig.json
├── server/
│   ├── index.js                 # Express API and business workflows
│   ├── store.js                 # JSON persistence helpers
│   ├── seed.js                  # Demo data and accounts
│   ├── test.js                  # Backend tests
│   ├── package.json
│   └── data.json                # Generated locally; do not commit
├── .env.example
├── .gitignore
├── package.json                # Root development scripts
├── START_BACKEND.bat
├── START_FRONTEND.bat
├── RUN_WINDOWS.bat
├── QUICK_START_WINDOWS.md
└── README.md
```

## Prerequisites

Before running the project, install:

- **Node.js 22 or later** (recommended).
- **npm 10 or later**.
- A code editor such as Visual Studio Code.
- Git, if you want to clone or publish the repository.

A separate PostgreSQL, MySQL, or MongoDB installation is **not required** for this local prototype. The backend persists data in a JSON file.

Verify your tools:

```powershell
node --version
npm --version
```

## Installation

Clone the project repository:

```powershell
git clone https://github.com/szofficiall/BayFlow---Automotive-Service-Garage-Management-Platform.git
cd BayFlow---Automotive-Service-Garage-Management-Platform
```

Alternatively, extract the project ZIP and open the **BayFlow** project folder in Visual Studio Code.

### Option 1: Start Everything from One Terminal

Run these commands from the project root (the directory containing the root `package.json`):

```powershell
npm install
npm run install:all
npm run seed
npm run dev
```

Open:

- Frontend: http://localhost:3000
- Backend health check: http://localhost:4000/api/health

Both services must remain running during use.

### Option 2: Start Backend and Frontend Separately

**Terminal 1 — Backend**

From the project root:

```powershell
cd server
npm install
npm run seed
npm run dev
```

The backend uses port **4000** by default.

**Terminal 2 — Frontend**

Open a new terminal in the project root:

```powershell
cd web
npm install
npm run dev
```

The frontend uses port **3000** by default.

If your terminal is already inside `server` or `web`, do not enter the same folder again.

### Option 3: Windows Launcher Scripts

From the extracted project, you can also run:

1. `START_BACKEND.bat`
2. `START_FRONTEND.bat`

Keep both terminal windows open. These launchers are intended for local Windows development.

## Environment Variables

The project includes a root `.env.example` file as a reference.

Create **`server/.env`** with the following values:

```dotenv
PORT=4000
CLIENT_URL=http://localhost:3000
SESSION_SECRET=replace-with-a-long-random-secret
```

Create **`web/.env.local`** with:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:4000
```

The default frontend API URL is `http://localhost:4000` when `NEXT_PUBLIC_API_URL` is not set.

Restart the affected server after updating its environment variables. Never publish real secrets or local `.env` files to GitHub.

## Demo Accounts

Seed demo data before using the accounts below:

```powershell
npm run seed
```

Run this command from the project root. **It resets local demo records**, so do not run it again if you need to preserve bookings or other data.

| Role | Email | Password |
| --- | --- | --- |
| Owner | `owner@bayflow.demo` | `Demo@12345` |
| Service Advisor | `advisor@bayflow.demo` | `Demo@12345` |
| Technician | `technician@bayflow.demo` | `Demo@12345` |
| QC Inspector | `qc@bayflow.demo` | `Demo@12345` |
| Parts Person | `parts@bayflow.demo` | `Demo@12345` |
| Customer | `customer@bayflow.demo` | `Demo@12345` |

These credentials are for local demonstration only and must not be used for a real deployment. Seeded shops, accounts, and bookings are sample data.

## Role-Based Access

| Role | Main Responsibilities |
| --- | --- |
| Customer | Book services, track jobs, approve/reject estimates and confirm pickup |
| Owner | View garage operations, create additional locations, manage staff and view analytics |
| Service Advisor | Confirm bookings, assign technicians, send estimates, assign parts and coordinate completion |
| Technician | Inspect vehicles, prepare estimates, perform repairs and submit jobs to QC |
| Parts Person | Check stock, handle missing parts, receive parts and allocate inventory |
| QC Inspector | Claim QC jobs, pass inspections or return failed jobs for rework |

Permissions and allowed actions depend on the authenticated user's role, garage membership, and the booking's current status.

## Complete Booking and Repair Workflow

BayFlow follows a structured service journey:

1. **Garage discovery:** A customer explores available garages and services.
2. **Booking request:** The customer selects a service, time slot, and vehicle details.
3. **Appointment confirmation:** The Service Advisor confirms the request.
4. **Technician assignment:** The Service Advisor assigns a workshop technician.
5. **Vehicle inspection:** The technician starts inspection and prepares an itemized estimate.
6. **Estimate review:** The Service Advisor sends the estimate to the customer.
7. **Customer decision:** The customer approves the estimate or rejects it for revision.
8. **Parts coordination:** The assigned Parts Person checks inventory and handles unavailable parts.
9. **Repair work:** The technician completes the authorized work.
10. **Quality control:** The QC Inspector checks the result.
11. **QC rework:** Failed quality checks return the job to repair; passed jobs become ready for pickup.
12. **Job completion:** The Service Advisor or customer confirms pickup and the booking is completed.

The activity timeline records important booking actions. The seeded booking `BF-DEMO01` begins at the **CONFIRMED** stage so the staff workflow can be demonstrated quickly.

### Supported Statuses

```text
PENDING
CONFIRMED
ASSIGNED
INSPECTING
ESTIMATE_REVIEW
AWAITING_CUSTOMER
ESTIMATE_APPROVED
ESTIMATE_REJECTED
PARTS_PENDING
PARTS_ORDERED
PARTS_READY
IN_REPAIR
QC_PENDING
QC_IN_PROGRESS
READY_FOR_PICKUP
COMPLETED
```

Booking cancellations and QC failures are handled by the backend workflow as appropriate. Not every stage appears for every booking: for example, available inventory can avoid the parts-ordering step.

## REST API Overview

Default API base URL: `http://localhost:4000/api`

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/health` | API health check |
| POST | `/register` | Create customer account |
| POST | `/login` | Authenticate a user |
| GET | `/me` | Retrieve current user and memberships |
| GET | `/shops` | List garages, services and slots |
| POST | `/shops` | Create a garage (owner) |
| POST | `/staff/:shopId` | Create a shop staff account (owner) |
| GET | `/staff/:shopId` | Retrieve staff for a garage |
| GET | `/bookings` | List bookings accessible to the user |
| POST | `/bookings` | Create a booking |
| GET | `/bookings/:id` | Retrieve booking details |
| POST | `/bookings/:id/action` | Perform an allowed workflow action |
| GET | `/inventory/:shopId` | Read shop inventory |
| GET | `/analytics/:shopId` | Read shop analytics |

Authenticated routes expect a bearer token:

```http
Authorization: Bearer YOUR_TOKEN
```

Status transitions are validated on the backend. An unauthorized user should not be able to advance a job through restricted staff actions.

## Example Development Scenario

To demonstrate the full system locally:

1. Sign in as the customer and create a booking.
2. Sign out and sign in as the Service Advisor to confirm it.
3. Assign a technician and sign in with that technician's account.
4. Inspect the vehicle and submit an estimate.
5. As the Service Advisor, send the estimate to the customer.
6. As the customer, approve or reject the estimate.
7. As the Service Advisor, assign a Parts Person.
8. As the Parts Person, complete the stock check and allocation process.
9. As the technician, finish repair and submit to quality control.
10. As the QC Inspector, record a pass or fail. Test the rework path if desired.
11. Confirm pickup and verify the completed status.

Known seeded inventory SKUs useful during testing include `brake-pad`, `oil-filter`, `engine-oil`, `battery`, and `air-filter`.

## Available npm Commands

Run from the project root unless otherwise noted:

| Command | Purpose |
| --- | --- |
| `npm install` | Install root development dependencies |
| `npm run install:all` | Install frontend and backend dependencies |
| `npm run seed` | Reset and create local demonstration records |
| `npm run dev` | Run frontend and backend together |
| `npm test` | Run backend tests |
| `npm run dev --prefix server` | Start only the Express backend |
| `npm run dev --prefix web` | Start only the Next.js frontend |
| `npm run build --prefix web` | Create the Next.js production build |
| `npm run start --prefix web` | Serve a previously built frontend |
| `npm run start --prefix server` | Run the backend without watch mode |

## Testing

Run the included backend tests:

```powershell
npm test
```

Check the frontend production build:

```powershell
npm run build --prefix web
```

Then verify the main user journeys manually: authentication, slot booking, estimate decisions, parts allocation, QC pass/fail, and shop-level access restrictions.

**Verification note:** The source archive has undergone limited syntax and packaging checks. A complete dependency installation, production build and end-to-end browser test have **not** been confirmed in the preparation environment. Treat the repository as a working prototype to validate locally, not a certified production-ready system.

## Troubleshooting

**`npm` is not recognized**

Install a supported Node.js version and reopen VS Code or your terminal.

**Frontend cannot connect to API**

Confirm the backend is running and open http://localhost:4000/api/health. Check `NEXT_PUBLIC_API_URL` in `web/.env.local` and `CLIENT_URL` in `server/.env`.

**Port 3000 or 4000 already in use**

Stop the other process that is using the port. Keep the frontend and backend ports aligned with your configuration.

**Old UI appears after updating frontend files**

Stop the frontend from its `web` directory and clear the Next.js build cache:

```powershell
Remove-Item -Recurse -Force .next
npm run dev
```

**Demo account cannot sign in**

Verify the seed command completed. Be aware that reseeding resets local records and sessions.

**Icon component runtime errors**

Ensure the application imports valid icons from `lucide-react` and that the package is installed under `web/`. For a garage address, use `MapPin` rather than an unavailable `Garage` export.

## Security and Data Notes

- Local demo passwords and accounts are published intentionally for testing only.
- Backend authentication uses bearer-token sessions and scrypt-hashed passwords.
- Shop membership and booking state are checked in protected workflows.
- The JSON data store is local and intended for a single API process.
- Never commit `.env`, `.env.local`, or generated `server/data.json` files.
- Production deployment requires stronger session management, rate limiting, robust validation, secure transport, backups, monitoring, and transactional database storage.

## Current Scope and Limitations

This repository implements a local full-stack **hackathon prototype**, not a production garage ERP. The following are not included as operational integrations:

- A production PostgreSQL/MySQL database or migrations.
- WebRTC calling between customers and Service Advisors.
- AI voice front desk or live LLM-based calling.
- Real email or SMS delivery.
- Integrated payment gateway.
- A public production deployment.

Before handling real customer or business data, replace JSON persistence with a transaction-safe relational database, harden authentication and authorization, add integration tests, and deploy both services with HTTPS.

## Design Direction

The interface features a studio-inspired automotive SaaS look: clear typography, deep navy and electric-blue accents, glass-like surfaces, responsive layouts, and motion effects. It supports both dark and light themes. The design is an original BayFlow implementation inspired by the visual atmosphere of [Netvixa](https://netvixa.online/), not an exact copy of its assets, code, or branding.

## Future Improvements

Potential next steps include PostgreSQL with database migrations, transactional slot reservations, real-time status updates, email/SMS notifications, invoice generation, richer owner analytics, customer service history, calling integration, and optional AI-assisted front desk capabilities.

## Contributing

Issues and pull requests are welcome for improvements to the interface, documentation, testing, and workflow correctness. Please avoid committing secrets or user data. Review changes locally and confirm that they do not break the booking lifecycle.

## Project Status

**Local prototype / hackathon demonstration.** This repository is intended for learning, review, and further development. It must be independently tested and secured before use in a production environment.

## Developer

**Sultan Zaib**  
**Python Engineer | Backend Engineer**  
GitHub: [szofficiall](https://github.com/szofficiall)  
Project Repository: [BayFlow — Automotive Service & Garage Management Platform](https://github.com/szofficiall/BayFlow---Automotive-Service-Garage-Management-Platform.git)

This project demonstrates full-stack application development, structured backend workflows, role-based access control, REST API integration, and responsive user-interface development.
