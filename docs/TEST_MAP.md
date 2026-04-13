# NovaLibra Test Map

## Purpose

This document now acts as the Stage 0 through Stage 13 map for NovaLibra.

It establishes:

- the audited project layout
- the staged test layers already in the repo
- the smoke-test entry points
- the suite execution order for regression runs
- the command map for running focused slices in day-to-day QA
- the naming and folder strategy used as the current tagging system

## Audited Project Layout

### Root

- `backend/`
- `frontend/`
- `scripts/`
- `scripts/e2e-qa.mjs`

### Backend

- Express app: `backend/src/app.js`
- Server entry: `backend/src/server.js`
- Prisma schema: `backend/prisma/schema.prisma`
- Seed script: `backend/prisma/seed.js`
- Existing tests: `backend/tests/api-security.test.js`

### Frontend

- App routes: `frontend/src/App.jsx`
- Auth context: `frontend/src/context/AuthContext.jsx`
- Notification context: `frontend/src/context/NotificationContext.jsx`
- Route guards:
  - `frontend/src/routes/ProtectedRoute.jsx`
  - `frontend/src/routes/AuthorRoute.jsx`
  - `frontend/src/routes/AdminRoute.jsx`

### Existing QA

- Legacy browser QA runner: `scripts/e2e-qa.mjs`

## Stage 0 Recommended Test Architecture

### Backend

- Keep Node's built-in test runner
- Add smoke suites under `backend/tests/smoke`
- Preserve existing security/ownership tests

### Frontend

- Add Vitest + React Testing Library
- Keep tests inside `frontend/src/test`

### E2E

- Add Playwright as the primary browser validation layer
- Keep `scripts/e2e-qa.mjs` as a legacy smoke/regression helper

## Current Suite Layout

### Backend suites

- `backend/tests/smoke`
- `backend/tests/auth`
- `backend/tests/permissions`
- `backend/tests/books`
- `backend/tests/engagement`
- `backend/tests/communications`
- `backend/tests/admin`
- `backend/tests/demo`

### Frontend suites

- `frontend/src/test/smoke`
- `frontend/src/test/auth`
- `frontend/src/test/routes`
- `frontend/src/test/public`
- `frontend/src/test/reader`
- `frontend/src/test/author`
- `frontend/src/test/admin`
- `frontend/src/test/books`
- `frontend/src/test/engagement`
- `frontend/src/test/communications`
- `frontend/src/test/ui`

### E2E suites

- `e2e/smoke`
- `e2e/public`
- `e2e/reader`
- `e2e/author`
- `e2e/admin`
- `e2e/books`
- `e2e/engagement`
- `e2e/communications`
- `e2e/demo`
- `e2e/ui`

## Suite Tagging Strategy

NovaLibra currently uses folder-based tagging as the primary grouping system.

That means:

- backend slices are grouped by `backend/tests/<suite>`
- frontend slices are grouped by `frontend/src/test/<suite>`
- Playwright slices are grouped by `e2e/<suite>`
- root scripts are the stable, human-friendly entry points for each suite

This keeps execution predictable without adding a second layer of custom metadata that can drift away from the actual file layout.

## Command Map

### Core surfaces

- Smoke: `npm.cmd run test:smoke`
- Backend only: `npm.cmd run test:backend`
- Frontend only: `npm.cmd run test:frontend`
- E2E only: `npm.cmd run test:e2e`

### Product slices

- Auth: `npm.cmd run test:auth`
- Permissions: `npm.cmd run test:permissions`
- Public: `npm.cmd run test:public`
- Reader: `npm.cmd run test:reader`
- Author: `npm.cmd run test:author`
- Admin: `npm.cmd run test:admin`
- Books: `npm.cmd run test:books`
- Engagement: `npm.cmd run test:engagement`
- Communications: `npm.cmd run test:communications`
- Messaging alias: `npm.cmd run test:messaging`
- Notifications alias: `npm.cmd run test:notifications`
- UI actions: `npm.cmd run test:ui-actions`
- Seeded demo validation: `npm.cmd run test:demo-data`
- Demo alias: `npm.cmd run test:demo`

### Full regression

- Ordered full regression: `npm.cmd run test:regression`
- Release-check alias: `npm.cmd run test:release-check`
- Optional legacy browser QA: `node scripts/e2e-qa.mjs`

## Stage 1 Smoke Scope

The smoke layer currently verifies:

- local origin alignment between frontend and backend
- backend health endpoint
- seeded database presence
- public API availability for books and announcements
- frontend homepage render
- frontend route availability for login and books
- browser-level smoke through Playwright

## Full Regression Order

`npm.cmd run test:regression` executes the suites in this order:

1. `test:smoke`
2. `test:auth`
3. `test:permissions`
4. `test:public`
5. `test:reader`
6. `test:author`
7. `test:admin`
8. `test:books`
9. `test:engagement`
10. `test:communications`
11. `test:ui-actions`
12. `test:demo-data`

This order is intentional:

- smoke catches boot issues first
- auth and permissions fail early if access boundaries regress
- public, reader, author, and admin flows validate the major role journeys
- books, engagement, and communications then verify the deeper domain systems
- UI actions and demo data close the run with wiring and presentation confidence
