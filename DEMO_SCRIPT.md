# 2-5 Minute Demo Script

Use this exact flow while recording your submission video.

## 0:00 - 0:20 Intro

"Hi, this is my Team Task Manager full-stack assignment.  
It includes authentication, role-based access, project management, task assignment, status tracking, and dashboard metrics.  
The app is deployed on Railway."

## 0:20 - 1:00 Authentication

1. Open app.
2. Sign up with a new user (or login with existing user).
3. Show successful redirect to main dashboard.
4. Mention JWT auth is used.

Say:
"Users can sign up/login securely. Passwords are hashed using bcrypt and API uses JWT authentication."

## 1:00 - 1:50 Project and Team Management

1. Create a new project.
2. Open the project list.
3. (Optional) Show add member API usage from Postman/Thunder Client if UI for member add is not present.

Say:
"Projects can be created and team members can be managed with Admin/Member roles."

## 1:50 - 2:50 Task Lifecycle

1. Create a task under a project.
2. Show task appears in list.
3. Change status: `TODO -> IN_PROGRESS -> DONE`.
4. Show due date behavior (if overdue task exists, point it out).

Say:
"Tasks support creation, assignment, due dates, and status tracking through the full lifecycle."

## 2:50 - 3:30 Dashboard

Show dashboard cards:
- total projects
- total tasks
- overdue tasks
- assigned-to-me
- status distribution

Say:
"Dashboard gives quick progress visibility and overdue tracking."

## 3:30 - 4:10 Backend/API Proof

Quickly show:
- `GET /health`
- one auth endpoint
- one project endpoint
- one task endpoint
- dashboard summary endpoint

Say:
"This is backed by REST APIs with proper validation and relational database models."

## 4:10 - 4:40 Deployment Proof

Show Railway:
- backend service
- frontend service
- PostgreSQL plugin
- public app URL

Say:
"Both frontend and backend are deployed on Railway with PostgreSQL."

## 4:40 - 5:00 Close

"This completes the Team Task Manager assignment requirements.  
I have provided live URL, GitHub repo, README, and this demo video."
