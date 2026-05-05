# Railway Deployment Guide

This project is a monorepo with two services:
- `backend/` (Express API + Prisma)
- `frontend/` (Vite React app)

## 1) Create Railway project

1. Go to [Railway](https://railway.app/).
2. Create a new project.
3. Add a PostgreSQL database service.

## 2) Deploy backend service

1. Click **New Service** -> **GitHub Repo**.
2. Select this repository.
3. Set **Root Directory** to `backend`.
4. Railway will use `backend/nixpacks.toml`.

### Backend Environment Variables

Set in Railway backend service variables:

- `DATABASE_URL` = value from Railway PostgreSQL service
- `JWT_SECRET` = any strong random string
- `PORT` = auto-managed by Railway (do not hardcode)

### Backend Checks

- Open backend public URL + `/health`
- Expected response:
  - `{ "ok": true, "service": "team-task-manager-api" }`

## 3) Deploy frontend service

1. Add another service from same GitHub repo.
2. Set **Root Directory** to `frontend`.
3. Railway will use `frontend/nixpacks.toml`.

### Frontend Environment Variable

- `VITE_API_URL` = backend public URL (example: `https://your-backend.up.railway.app`)

## 4) Validate full app

After both services are live:
1. Open frontend URL.
2. Signup/Login.
3. Create project.
4. Create and update tasks.
5. Verify dashboard metrics.

## 5) Common issues

- **CORS/Network error in frontend**:
  - Check `VITE_API_URL` points to backend public URL
  - Redeploy frontend after variable change

- **Prisma migration errors**:
  - Confirm backend `DATABASE_URL` is set correctly
  - Trigger a backend redeploy

- **401 Unauthorized on protected routes**:
  - Login again and refresh token/session
