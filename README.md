# NovaLibra Author Platform Demo

## Project Overview

This project turns a static author website concept into a modern full-stack demo platform for **NovaLibra**. It is designed as a startup-style MVP with a clean API-first architecture, premium dark editorial UI, role-based admin tools, and realtime notification support.

Readers can:

- register and log in
- browse books
- save favourites
- comment on books
- receive notifications
- message the author team
- manage their profile

Admins can:

- manage books
- moderate comments and replies
- review users
- publish announcements
- review messages
- monitor dashboard metrics

## Architecture Overview

### Frontend

- **React + Vite + Tailwind CSS**
- Context-based auth and notification state
- React Router for public, protected, and admin routes
- Axios for API calls
- Socket.IO client for realtime notifications

### Backend

- **Node.js + Express.js**
- Modular controllers, routes, middleware, and services
- Prisma ORM with MySQL
- JWT access + refresh-ready token flow
- bcrypt password hashing
- Socket.IO for notification and message events

### Data Layer

- **MySQL** with Prisma schema in [backend/prisma/schema.prisma](/C:/Users/gambe/OneDrive/Desktop/book%20web/backend/prisma/schema.prisma)
- Compatible with MySQL Workbench for inspection and administration

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, React Router, Axios, Socket.IO Client
- Backend: Node.js, Express.js, Prisma, bcryptjs, jsonwebtoken, Socket.IO, Zod
- Database: MySQL
- Auth: JWT access token + refresh-ready token strategy

## Folder Structure

```text
book web/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.js
│   ├── src/
│   │   ├── app.js
│   │   ├── server.js
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── sockets/
│   │   └── utils/
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   │   ├── books/
│   │   │   ├── comments/
│   │   │   ├── layout/
│   │   │   ├── messages/
│   │   │   ├── notifications/
│   │   │   └── ui/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .env.example
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
├── .gitignore
└── README.md
```

## Database Schema

The platform uses these relational models:

- `users`
  - id, name, email, password_hash, role, bio, avatar_url, refresh_token_version, created_at, updated_at
- `books`
  - id, title, slug, short_description, full_description, cover_image, amazon_url, created_at, updated_at
- `comments`
  - id, user_id, book_id, content, created_at, updated_at
- `replies`
  - id, comment_id, user_id, content, created_at, updated_at
- `notifications`
  - id, user_id, type, title, message, is_read, created_at
- `announcements`
  - id, title, content, created_at, updated_at
- `messages`
  - id, sender_id, receiver_id, subject, content, status, created_at, updated_at
- `favorites`
  - id, user_id, book_id, created_at

Primary schema file:

- [schema.prisma](/C:/Users/gambe/OneDrive/Desktop/book%20web/backend/prisma/schema.prisma)

Seed file:

- [seed.js](/C:/Users/gambe/OneDrive/Desktop/book%20web/backend/prisma/seed.js)

## API Design

Base URL: `http://localhost:5000/api`

### Auth

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `GET /auth/me`
- `POST /auth/logout`

### Users

- `GET /users/me/profile`
- `PATCH /users/me/profile`

### Books

- `GET /books`
- `GET /books/:slug`
- `POST /books` admin
- `PATCH /books/:bookId` admin
- `DELETE /books/:bookId` admin

### Comments and Replies

- `POST /comments`
- `PATCH /comments/:commentId`
- `DELETE /comments/:commentId`
- `POST /comments/:commentId/replies`

### Notifications

- `GET /notifications`
- `PATCH /notifications/:notificationId/read`
- `PATCH /notifications/read-all`

### Messages

- `GET /messages`
- `POST /messages`
- `PATCH /messages/:messageId/read`

### Announcements

- `GET /announcements`
- `POST /announcements` admin
- `PATCH /announcements/:announcementId` admin
- `DELETE /announcements/:announcementId` admin

### Favorites

- `POST /favorites/:bookId/toggle`

### Admin

- `GET /admin/dashboard`
- `GET /admin/users`
- `GET /admin/comments`

## Demo Features Included

- JWT auth with refresh-ready structure
- bcrypt password hashing
- protected routes and admin-only routes
- persistent auth in the frontend
- reader profile editing
- book listing and book detail pages
- threaded comments with author/admin replies
- favourites
- announcements
- notification center
- realtime notification push via Socket.IO
- lightweight message thread inbox
- admin dashboard and content management screens

## Local Development Setup

### 1. Create the database

In MySQL Workbench:

1. Open MySQL Workbench.
2. Create a new schema named `novalibra_db`.
3. Ensure your MySQL user has permission to create and modify tables in that schema.

### 2. Backend setup

```bash
cd backend
cp .env.example .env
npm install
npx prisma generate
npx prisma db push
npm run seed
npm run dev
```

Update [backend/.env.example](/C:/Users/gambe/OneDrive/Desktop/book%20web/backend/.env.example) values in your `.env`, especially:

- `DATABASE_URL`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `CLIENT_URL`

Backend runs on `http://localhost:5000`.

### 3. Frontend setup

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`.

### Automated end-to-end QA

From the repository root:

```bash
npm run qa:e2e
```

This script will:

- reseed the database to a known baseline
- start the backend on `http://localhost:5000`
- start the frontend on `http://localhost:5173`
- launch a headless Edge or Chrome session
- run browser-level reader, author, and admin QA flows

The command exits non-zero if any flow fails.

## MySQL Workbench Usage

After running `npx prisma db push`, open MySQL Workbench and refresh the `novalibra_db` schema to inspect:

- `users`
- `books`
- `comments`
- `replies`
- `notifications`
- `announcements`
- `messages`
- `favorites`

You can also browse seeded rows and test relationships directly inside Workbench.

## Environment Variables

### Backend

Defined in [backend/.env.example](/C:/Users/gambe/OneDrive/Desktop/book%20web/backend/.env.example):

- `PORT`
- `NODE_ENV`
- `CLIENT_URL`
- `DATABASE_URL`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `ACCESS_TOKEN_EXPIRES_IN`
- `REFRESH_TOKEN_EXPIRES_IN`

### Frontend

Defined in [frontend/.env.example](/C:/Users/gambe/OneDrive/Desktop/book%20web/frontend/.env.example):

- `VITE_API_URL`
- `VITE_SOCKET_URL`

## Demo Credentials

- Admin: `admin@example.com` / `password123`
- User: `user@example.com` / `password123`
- Extra reader: `reader2@example.com` / `password123`

## File References

- Backend entry: [server.js](/C:/Users/gambe/OneDrive/Desktop/book%20web/backend/src/server.js)
- Express app: [app.js](/C:/Users/gambe/OneDrive/Desktop/book%20web/backend/src/app.js)
- Prisma schema: [schema.prisma](/C:/Users/gambe/OneDrive/Desktop/book%20web/backend/prisma/schema.prisma)
- Seed data: [seed.js](/C:/Users/gambe/OneDrive/Desktop/book%20web/backend/prisma/seed.js)
- Frontend entry: [main.jsx](/C:/Users/gambe/OneDrive/Desktop/book%20web/frontend/src/main.jsx)
- Router shell: [App.jsx](/C:/Users/gambe/OneDrive/Desktop/book%20web/frontend/src/App.jsx)

## Future Improvement Ideas

- secure refresh tokens in httpOnly cookies
- richer conversation threading and presence indicators
- image upload support for avatars and cover assets
- search, filtering, and pagination
- audit logs for admin actions
- markdown support with server-side sanitization
- email delivery for announcements and message alerts
- analytics dashboard and event tracking
- test coverage with Vitest and Supertest

## Notes

- The original single-file static concept remains in [index.html](/C:/Users/gambe/OneDrive/Desktop/book%20web/index.html) for visual reference.
- This repository is scaffolded to be Git-friendly and easy to extend into a larger author SaaS platform later.

## Troubleshooting

### Error: `EADDRINUSE: address already in use :::5000`

This means another process is already using backend port `5000`.

#### Option 1: Stop the process using port 5000 (Windows)

```powershell
netstat -ano | findstr :5000
taskkill /PID <PID_FROM_ABOVE> /F
```

Then restart the backend:

```bash
cd backend
npm run dev
```

#### Option 2: Run the backend on a different port

Update [backend/.env](/C:/Users/gambe/OneDrive/Desktop/book%20web/backend/.env):

```env
PORT=5001
```

Then update [frontend/.env](/C:/Users/gambe/OneDrive/Desktop/book%20web/frontend/.env):

```env
VITE_API_URL=http://localhost:5001/api
VITE_SOCKET_URL=http://localhost:5001
```

Restart both backend and frontend after changing ports.
