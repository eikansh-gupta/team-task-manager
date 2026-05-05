# Team Task Manager (Full-Stack)

A full-stack team collaboration application that enables users to manage projects, assign tasks, and track progress with role-based access and real-time dashboard insights.

## 🧩 Tech Stack

- Frontend: React + TypeScript (Vite)
- Backend: Node.js + Express (TypeScript)
- ORM: Prisma
- Database: SQL Server / PostgreSQL
- Auth: JWT + bcrypt

## Implemented Features

- Authentication API (`signup`, `login`, `me`) with JWT
- Password hashing using bcrypt
- Prisma data models with relationships:
  - `User`, `Project`, `ProjectMember`, `Task`
- Role support (`ADMIN`, `MEMBER`)
- Project APIs:
  - Create project
  - List user projects
  - Add/update project members
- Task APIs:
  - Create task
  - List tasks
  - Update task status/details
- Dashboard API:
  - Total projects/tasks
  - Status-wise task count
  - Overdue tasks
  - Tasks assigned to current user
- Frontend pages/components:
  - Login / signup flow
  - Dashboard metrics cards
  - Create project form
  - Create task form
  - Task list with status updates

## Project Structure

- `frontend/` - React + Vite + TypeScript client
- `backend/` - Express + TypeScript + Prisma API

## Environment Setup

### Backend (`backend/.env`)

Copy from `.env.example` into `backend/.env`, then edit values.

By default, the application uses SQL Server for local development.

```bash
PORT=4000
JWT_SECRET=replace_with_strong_secret
DATABASE_URL="sqlserver://USER:PASSWORD@localhost:1433/TeamTaskManager?encrypt=true&trustServerCertificate=true"
```

In SSMS: create database `TeamTaskManager` (empty). Prisma migrations will create tables.

**PostgreSQL (e.g. Railway):**  
In `backend/prisma/schema.prisma` set `provider = "postgresql"` and use a postgres URL (`postgresql://...`). Run `npm run prisma:generate` again.

**MySQL:**  
Uses a different URL and `provider = "mysql"` in `schema.prisma` (same app code idea; enums work on MySQL with Prisma if you revert `role`/`status` fields to enums). Prefer SQL Server since you asked for SSMS.

### Frontend (`frontend/.env`)

Copy from `.env.example`:

```bash
VITE_API_URL=http://localhost:4000
```

## Local Run

### 1) Backend
```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run dev
```

### 2) Frontend
```bash
cd frontend
npm install
npm run dev
```

## API Base URL

- Local: `http://localhost:4000`
- Health: `GET /health`

## Main API Endpoints

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/projects`
- `POST /api/projects`
- `POST /api/projects/:projectId/members`
- `GET /api/tasks`
- `POST /api/tasks`
- `PATCH /api/tasks/:taskId`
- `GET /api/dashboard/summary`

## Railway Deployment (Mandatory)

### Backend service
1. Create Railway project and add PostgreSQL.
2. Deploy `backend/` as a service.
3. Set backend env variables:
   - `DATABASE_URL` (from Railway Postgres)
   - `JWT_SECRET`
   - `PORT` (Railway sets this automatically; keep fallback in code)
4. Run Prisma migration in Railway shell:
   - `npm run prisma:migrate -- --name init`

### Frontend service
1. Deploy `frontend/` as another Railway service.
2. Set `VITE_API_URL` to your Railway backend public URL.
3. Set root directory correctly for each service (`backend` and `frontend`).

Deployment-ready configs included:
- `backend/nixpacks.toml`
- `frontend/nixpacks.toml`
- `RAILWAY_DEPLOYMENT.md` (step-by-step guide)

## What You Need To Do Next (Your Side)

1. Create `.env` files from both `.env.example` files.
2. Ensure SQL Server is running (local) **or** use Railway Postgres — set `DATABASE_URL` and matching Prisma `provider` in `schema.prisma`.
3. Run Prisma generate + migrate.
4. Test complete flow:
   - signup -> login -> create project -> create task -> update status.
5. Push code to GitHub repo.
6. Deploy backend + frontend on Railway.
7. Record a 2-5 min demo video covering:
   - auth,
   - project creation,
   - task assignment/status,
   - dashboard metrics.
8. Add final live URLs + demo link in this README.

## 🌐 Live Links

- Frontend: https://your-frontend-url
- Backend: https://your-backend-url

## Demo Recording Help

- Use `DEMO_SCRIPT.md` for a clean 2-5 minute walkthrough.

  ## 🎬 Demo Video

[Watch Demo](https://your-video-link)

## Submission Checklist

- Live app URL (Railway)
- GitHub repository
- README (setup + architecture + endpoints + env vars)
- 2-5 minute demo video
