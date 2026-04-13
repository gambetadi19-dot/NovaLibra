# NovaLibra Release Certification Checklist

## Purpose

This is the Stage 15 release-readiness checklist for NovaLibra.

It is meant to answer one question clearly:

Is this build ready for demo, handoff, soft launch, or public release?

The checklist is based on the real NovaLibra feature set and the staged validation system already implemented across backend, frontend, and Playwright.

## Recommended Release Decision Levels

### Demo ready

Use this level when:

- `npm.cmd run test:smoke` passes
- `npm.cmd run test:demo-data` passes
- seeded accounts and seeded content are present
- the main public, reader, author, and admin surfaces are presentable

### Internal preview ready

Use this level when:

- `npm.cmd run test:regression` passes
- critical feature regressions are cleared
- seeded demo data remains strong
- known issues are minor and documented

### Launch ready

Use this level only when:

- `npm.cmd run test:quality` passes
- no Sev 1 or Sev 2 defects remain open
- auth, permissions, ownership, and admin moderation risks are cleared
- build, reporting, and failure-artifact generation are working
- this checklist is fully signed off

## Required Commands Before Signoff

Run these from the repo root:

1. `npm.cmd run test:smoke`
2. `npm.cmd run test:regression`
3. `npm.cmd run test:quality`
4. `npm.cmd --prefix frontend run build`

Optional but recommended:

- `npm.cmd run test:reports`
- `npm.cmd --prefix backend run coverage`
- `npm.cmd --prefix frontend run coverage`

## Public Visitor Certification

Pass all of the following:

- Home page loads without auth
- Navbar links work for public users
- Footer renders and important links are reachable
- Books page loads with visible seeded content
- Book detail pages open correctly
- Public author profile pages open correctly
- Announcement and discovery surfaces are populated
- Empty-state and not-found behavior are safe and understandable
- Public CTAs route to the correct destinations

Primary validating suites:

- `npm.cmd run test:public`
- `npm.cmd run test:books`
- `npm.cmd run test:ui-actions`
- `npm.cmd run test:smoke`

Release note:

- Public browsing must feel complete even before login.

## Authentication And Session Certification

Pass all of the following:

- Reader registration works
- Invalid registration is rejected cleanly
- Duplicate email registration is rejected cleanly
- Admin, author, and reader login works
- Invalid login fails cleanly
- Refresh-token flow works
- Missing refresh-token flow fails cleanly
- `/api/auth/me` works for valid sessions
- `/api/auth/me` rejects invalid or deleted-user sessions
- Logout revokes refresh behavior
- Frontend session restoration works
- Anonymous frontend boot does not spam refresh failures
- `localhost` origin path works correctly for development auth

Primary validating suites:

- `npm.cmd run test:auth`
- `npm.cmd run test:smoke`
- `npm.cmd run test:quality`

Release note:

- Auth and session behavior is a hard blocker for launch.

## Permissions And Ownership Certification

Pass all of the following:

- Public routes stay public
- Protected routes reject unauthenticated users
- Reader cannot use author-only routes
- Reader cannot use admin-only routes
- Author can use author routes
- Author cannot use admin routes
- Admin can use admin routes
- Non-owner author cannot modify another author’s book
- Admin override works where intended
- Featured escalation stays blocked for unauthorized roles
- Backend enforcement holds even if frontend protections are bypassed

Primary validating suites:

- `npm.cmd run test:permissions`
- `npm.cmd run test:auth`
- `npm.cmd run test:author`
- `npm.cmd run test:admin`

Release note:

- Permission regressions are launch blockers.

## Reader Workflow Certification

Pass all of the following:

- Reader can log in
- Reader profile renders useful seeded data
- Reader can browse and open books
- Reader can favorite and unfavorite
- Reader can create, edit, reply to, and delete own comments
- Reader can create, update, and delete own review where supported
- Reader can follow and unfollow authors
- Reader can open notifications
- Reader can mark notifications read
- Reader can open inbox views
- Reader can message allowed recipients
- Reader cannot message disallowed recipients

Primary validating suites:

- `npm.cmd run test:reader`
- `npm.cmd run test:engagement`
- `npm.cmd run test:communications`

Release note:

- Reader flows should feel complete enough for daily use and demos.

## Author Workflow Certification

Pass all of the following:

- Author can log in
- MyBooks loads correctly
- Author analytics loads correctly
- Author can create a book
- Author can edit own book
- Author can delete own book
- Book validation rejects malformed input
- Public author page reflects authored books
- Ownership prevents editing another author’s book

Primary validating suites:

- `npm.cmd run test:author`
- `npm.cmd run test:books`
- `npm.cmd run test:permissions`

Release note:

- Ownership-sensitive author flows are launch blockers.

## Admin Workflow Certification

Pass all of the following:

- Admin can log in
- Admin dashboard loads
- Admin books page loads and supports expected controls
- Admin comments page loads and moderation actions work
- Admin users page loads and user-management controls work
- Admin announcements page supports publish/edit/delete
- Admin messages page loads and admin reply flow works
- Non-admin users are blocked from admin routes

Primary validating suites:

- `npm.cmd run test:admin`
- `npm.cmd run test:permissions`

Release note:

- Broken admin moderation or accidental admin exposure is a launch blocker.

## Book Domain Certification

Pass all of the following:

- Public book list returns seeded catalog content
- Search/filtering works for the implemented books experience
- Featured-book behavior works as intended
- Book detail payload contains author, review, and discussion data
- Authenticated personalization on book detail works
- Invalid slug handling is safe
- Author and admin book mutations respect validation and ownership rules

Primary validating suites:

- `npm.cmd run test:books`
- `npm.cmd run test:author`
- `npm.cmd run test:admin`

Release note:

- Books are a core domain and must remain stable for release confidence.

## Engagement Certification

Pass all of the following:

- Comments work
- Replies work
- Review upsert behavior works
- Duplicate review creation does not create duplicate rows
- Favorites work
- Follows work
- Foreign delete/edit restrictions hold
- Notification side effects work where expected

Primary validating suites:

- `npm.cmd run test:engagement`
- `npm.cmd run test:reader`

Release note:

- Engagement issues are high-importance because they shape community trust.

## Communications Certification

Pass all of the following:

- Inbox fetch works
- Reader messaging works for allowed targets
- Read-state update works
- Notifications fetch works
- Notification read flows work
- Announcements publish correctly
- Announcement notifications fan out correctly
- Socket room-join logic stays safe for authenticated and anonymous cases
- Realtime absence does not break core messaging or notification views

Primary validating suites:

- `npm.cmd run test:communications`
- `npm.cmd run test:admin`
- `npm.cmd run test:demo-data`

Release note:

- Messaging and notification integrity matters for both demo polish and real platform trust.

## UI Wiring Certification

Pass all of the following:

- Navbar actions work
- Footer actions work
- Login and registration entry points are reachable
- Book-card actions are wired
- Mobile navigation is usable
- Protected navigation redirects correctly
- Author workspace buttons work
- Admin action buttons work
- Disabled/loading/error action states are not broken

Primary validating suites:

- `npm.cmd run test:ui-actions`
- `npm.cmd run test:public`

Release note:

- Small broken buttons can sink a demo, even when domain logic is correct.

## Seeded Demo Certification

Pass all of the following:

- Seeded admin account logs in
- Seeded author account logs in
- Seeded reader account logs in
- Seeded books are visible
- Seeded book details show discussions and reviews
- Seeded notifications exist
- Seeded messages exist
- Seeded announcements exist
- Seeded author/admin workspaces feel populated and believable

Primary validating suites:

- `npm.cmd run test:demo-data`
- `npm.cmd run test:smoke`

Release note:

- NovaLibra must remain demoable on seeded data, not just technically functional.

## Reporting And Diagnostics Certification

Pass all of the following:

- Coverage reports generate successfully
- Playwright HTML report generates successfully
- Failure artifacts are retained on Playwright failure
- Quality-gate script completes successfully
- Regression suite completes in ordered form
- Reporting locations are documented for the team

Primary validating suites:

- `npm.cmd run test:coverage:critical`
- `npm.cmd run test:quality`
- `npm.cmd run test:reports`

Reference:

- See `docs/TEST_REPORTING.md`

## Current Stage-Based Launch Gate

As of the current NovaLibra validation system, a build should not be called launch ready unless all of the following are true:

- Stage 0/1 smoke validation is green
- Stage 2 auth/session validation is green
- Stage 3 permissions/route protection validation is green
- Stage 4 public visitor validation is green
- Stage 5 reader validation is green
- Stage 6 author validation is green
- Stage 7 admin validation is green
- Stage 8 books validation is green
- Stage 9 engagement validation is green
- Stage 10 communications validation is green
- Stage 11 UI-action validation is green
- Stage 12 demo-data validation is green
- Stage 13 ordered regression flow is green
- Stage 14 coverage/reporting/quality gate is green

## Final Signoff Record

Use this section for each release candidate.

### Candidate

- Build or tag:
- Date:
- Reviewer:

### Command Results

- `test:smoke`:
- `test:regression`:
- `test:quality`:
- `frontend build`:

### Blocking Defects

- Sev 1 open:
- Sev 2 open:
- Security blockers:
- Demo blockers:

### Decision

- Demo ready: Yes / No
- Internal preview ready: Yes / No
- Launch ready: Yes / No

### Notes

- Follow-up items:
- Accepted risks:
- Rollback plan owner:
