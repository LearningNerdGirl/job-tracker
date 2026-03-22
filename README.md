# JobTrackr — Job Application Tracker SaaS

A full-stack, production-ready SaaS for tracking job applications with a Kanban pipeline, analytics, and JWT authentication.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS + shadcn/ui components |
| State | Zustand (auth) + TanStack Query (server state) |
| Backend | Node.js + Express + TypeScript |
| Database | MySQL + Prisma ORM |
| Auth | JWT (access + refresh tokens) |

## Features

- **Auth** — Register, login, JWT with auto-refresh on 401
- **Applications** — Full CRUD with search, filter, pagination
- **Kanban Board** — Visual pipeline with one-click status moves
- **Analytics** — Pipeline breakdown chart, application funnel, 30-day timeline
- **Dashboard** — Summary stats, recent apps, follow-up reminders
- **Responsive** — Mobile-first layout with collapsible sidebar

## Getting Started

### Prerequisites
- Node.js 18+
- MySQL running locally

### 1. Clone and install

```bash
# Server
cd server
npm install

# Client
cd ../client
npm install
```

### 2. Configure environment

```bash
# server/.env
DATABASE_URL="mysql://root:password@localhost:3306/job_tracker"
JWT_SECRET="your-secret"
JWT_REFRESH_SECRET="your-refresh-secret"
PORT=5000
CORS_ORIGIN="http://localhost:3000"

# client/.env.local
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 3. Setup database

```bash
cd server
npx prisma db push      # creates tables
npx prisma generate     # generates client
```

### 4. Run development servers

```bash
# Terminal 1 — Backend
cd server
npm run dev

# Terminal 2 — Frontend
cd client
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
job-tracker/
├── server/
│   ├── prisma/schema.prisma
│   └── src/
│       ├── modules/
│       │   ├── auth/          (register, login, refresh, me)
│       │   ├── applications/  (CRUD + status update)
│       │   └── stats/         (summary, timeline, follow-ups)
│       ├── middleware/        (auth, errorHandler)
│       ├── utils/             (jwt, response helpers)
│       └── index.ts
└── client/
    └── src/
        ├── app/
        │   ├── (auth)/        (login, register)
        │   └── (dashboard)/   (dashboard, applications, kanban, analytics)
        ├── components/
        │   ├── layout/Sidebar.tsx
        │   └── ui/            (button, card, badge, input...)
        ├── store/authStore.ts
        └── lib/api.ts
```

## API Endpoints

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/refresh
GET    /api/auth/me

GET    /api/applications        ?page=&limit=&status=&search=
POST   /api/applications
GET    /api/applications/:id
PUT    /api/applications/:id
PATCH  /api/applications/:id/status
DELETE /api/applications/:id

GET    /api/stats/summary
GET    /api/stats/timeline
GET    /api/stats/followups
```

## Deployment

| Service | Provider |
|---|---|
| Frontend | Vercel |
| Backend + DB | Railway |

### Railway (Backend)
Set env vars: `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `CORS_ORIGIN`

Build command: `npm run build`  
Start command: `npm start`

### Vercel (Frontend)
Set env var: `NEXT_PUBLIC_API_URL=https://your-api.up.railway.app/api`
