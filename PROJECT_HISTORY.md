# NovaLibra Project History

## Purpose

This document is an updated record of what has been done on NovaLibra from the beginning of the project up to the current repository state.

It is intended to help the team quickly understand:

- where the project started
- how the direction changed over time
- what major engineering and design work has already been completed
- what features are available right now
- what supporting QA and operational work has been added

This is a reconstruction based on the current repository, planning documents, application routes, schema, seeded data, and recent implementation work.

---

## 1. Project Origin

NovaLibra began as a literary website concept rather than a full application platform.

The earliest version focused on:

- premium literary tone
- dark editorial presentation
- books as the emotional center of the product
- a polished visual identity rather than complex workflows

That early concept established the brand direction that still shapes the product now: elegant, book-centered, and more curated than generic.

---

## 2. Strategic Repositioning

The project then shifted from being treated like a single-site literary concept into a multi-role literary platform.

This repositioning established that NovaLibra should support:

- readers
- authors
- admins

It also established the core platform promises:

- authors should be able to build presence
- readers should be able to discover books and engage
- authors and readers should be able to connect
- admins should be able to moderate, curate, and guide the platform

This was the decision that turned NovaLibra from a branding concept into a real product platform.

---

## 3. Full-Stack Application Foundation

Once the product direction was clear, NovaLibra moved into a real full-stack architecture.

### Frontend foundation

The frontend was built with:

- React
- Vite
- Tailwind CSS
- React Router

### Backend foundation

The backend was built with:

- Node.js
- Express
- Prisma
- MySQL
- JWT-based authentication
- Socket.IO
- Zod validation

### Backend organization

The backend structure now includes:

- routes
- controllers
- middleware
- services
- utilities
- socket handlers

This was the stage where NovaLibra became a true application rather than a styled static site.

---

## 4. User Identity, Roles, and Authentication

One of the earliest major backend milestones was role-aware identity and auth support.

The platform now supports:

- `READER`
- `AUTHOR`
- `ADMIN`

Authentication and session work includes:

- registration
- login
- logout
- refresh-token support
- authenticated session restoration
- authenticated user lookup through `/api/auth/me`
- local token persistence in the frontend

This created the permission boundary needed for everything that followed.

---

## 5. Data Model Expansion

The Prisma schema and migrations show that the data model evolved in layers rather than being designed only for a minimal demo.

The current platform data model supports:

- users
- books
- comments
- replies
- announcements
- notifications
- messages
- favorites
- follows
- reviews
- refresh tokens and session flows

The schema journey reflects the product journey:

1. start with users and books
2. add auth and protected actions
3. add engagement systems
4. add moderation and platform communication
5. add ownership, discovery, and author growth relations

---

## 6. Book Ownership and Author Model

One of the most important platform milestones was changing books from generic content entries into author-owned content.

The current platform now enforces that:

- each book belongs to an author through `authorId`
- author identity is attached to published books
- non-owner authors cannot update books they do not own
- admins can still moderate platform-wide
- featured status is protected from unauthorized escalation

Related book model improvements include:

- slug support
- short description
- full description
- cover image support
- Amazon or purchase link support
- genre support
- category support
- featured-book support

This changed NovaLibra from a catalog demo into a genuine author platform foundation.

---

## 7. Author Publishing and Growth Workflows

After ownership support was established, NovaLibra added author-facing creation and management workflows.

Implemented author capabilities now include:

- author book creation
- author book editing
- author book deletion
- dedicated `MyBooks` management surface
- public author profile presentation
- author analytics surface
- author identity tied to books, followers, and reviews

This work made authors first-class users of the platform rather than just content providers behind the scenes.

---

## 8. Reader Experience and Community Features

NovaLibra then expanded beyond passive browsing into reader interaction and community systems.

Reader-facing and community features now include:

- public book browsing
- curated book discovery
- detailed book pages
- comments
- replies
- saved favorites
- follows
- reviews and ratings
- notifications

These features created a stronger reader loop:

- discover
- save
- discuss
- follow
- return

This pushed the product beyond a showcase and toward a literary community experience.

---

## 9. Messaging and Platform Communication

The platform also added direct messaging and broader communication features.

Implemented communication capabilities include:

- inbox-style direct messages
- message composition
- role-aware recipient handling
- message read-state updates
- admin inbox oversight
- announcement publishing
- notification generation for platform events

This work supports NovaLibra's core promise that readers and authors should be able to connect in a way that feels curated rather than noisy.

---

## 10. Admin Control and Moderation Surfaces

Admin tools were built alongside reader and author workflows so the platform could stay curated and trustworthy.

Current admin capabilities include:

- dashboard metrics
- book management
- comment moderation
- announcement publishing
- platform inbox oversight
- user review and featured-author management

These tools give admins the ability to manage the tone, quality, and direction of the platform rather than leaving it as an unmanaged submission system.

---

## 11. Discovery, Curation, and Growth Systems

As the platform matured, NovaLibra added discovery and growth-oriented features beyond core CRUD workflows.

The repository now shows support for:

- genres
- categories
- featured books
- featured authors
- follows
- reviews
- rating data
- author analytics
- platform curation surfaces

This indicates the project moved well beyond an MVP and into retention, identity, and growth work.

---

## 12. Realtime and Notification Infrastructure

NovaLibra added event-driven behavior using notifications and Socket.IO support.

This infrastructure supports:

- notification creation during meaningful events
- realtime delivery support
- messaging-related updates
- a more alive and responsive user experience

This matters because the platform was never intended to feel static or dormant.

---

## 13. Frontend Expansion Across Routes

The frontend expanded from an initial public-facing concept into a multi-surface application with distinct journeys.

The current route and page footprint includes:

- `Home`
- `Books`
- `BookDetails`
- `Login`
- `Register`
- `Profile`
- `AuthorProfile`
- `AuthorAnalytics`
- `MyBooks`
- `Messages`
- `Notifications`
- admin dashboard
- admin books
- admin comments
- admin users
- admin announcements
- admin messages

This shows that NovaLibra now supports distinct experiences for:

- public visitors
- authenticated readers
- authors
- admins

---

## 14. Branding and Visual Evolution

One of the most visible recent milestones has been a full frontend visual refinement pass.

This included:

- a cleaner `logo-v2.png` derived from the original logo concept
- a reusable `BrandLockup` component
- improved navbar and footer branding
- upgraded favicon usage
- custom hero artwork generation
- a more premium, cinematic homepage
- richer motion, glow, and atmosphere treatments

The visual direction became much more luxurious, dynamic, and high-end while staying aligned with the literary identity of the project.

---

## 15. Full-App Luxury Frontend Redesign

The design work then expanded from the homepage into the rest of the application so there would be no visual drop-off between routes.

This broader redesign included:

- upgraded homepage hero and highlights
- premium editorial `BookCard` treatment
- upgraded navbar interactions and mobile menu
- improved shared shell, panel, form, alert, and empty-state styling
- redesigned `Books`, `BookDetails`, `Login`, and `Profile`
- redesigned `Register`, `Messages`, and `Notifications`
- redesigned admin dashboard and admin management pages

As a result, NovaLibra now presents a much more unified premium interface across public, reader, author, and admin areas.

---

## 16. Logo and Artwork Support

Supporting assets and generation scripts were also added so branding and visual scenes are not purely manual.

This work includes:

- `scripts/generate-logo-v2.ps1`
- `frontend/public/logo-v2.png`
- `scripts/generate-hero-artwork.ps1`
- `frontend/public/hero-artwork-v1.png`

This is useful because it gives the team repeatable asset generation instead of one-off image replacement.

---

## 17. Seeded Demo Content and Demo Accounts

The backend seed data now provides a usable demo environment.

Seeded users include:

- admin account
- author account
- reader account
- additional reader account

Seeded content includes:

- multiple books
- announcement data
- comments
- replies
- favorites
- follows
- reviews
- messages
- notifications

This means the product can be demonstrated with meaningful starting data instead of an empty interface.

---

## 18. QA, Automation, and Security Test Coverage

Quality work has also matured as the project progressed.

The repository includes:

- automated QA scripting from the repo root
- backend and frontend bootstrapping support for repeatable checks
- backend API tests using the Node test runner

Most recently, backend security-sensitive API coverage was added around auth, permissions, and ownership.

That current backend test coverage now verifies:

- unauthenticated `/api/auth/me` rejection
- deleted-user token rejection
- valid authenticated user resolution
- rejection of reader attempts to create author-only content
- author book creation without unauthorized featured escalation
- rejection of non-owner author book updates
- admin override for cross-owner book management
- ownership and moderation rules for comment deletion

This is one of the most important recent engineering milestones because it protects the permission model below the UI layer.

---

## 19. Current Feature Inventory

Based on the current repository state, NovaLibra currently provides the following working platform capabilities.

### Public and visitor-facing

- premium homepage and branding
- public book browsing
- detailed book pages
- public author profiles
- premium discovery presentation

### Reader capabilities

- registration
- login
- persistent sessions
- profile management
- favorites
- comments and replies
- follows
- reviews and ratings
- notifications
- direct messages

### Author capabilities

- author-owned books
- book creation
- book editing
- book deletion
- author presence and profile identity
- visibility into followers and reviews
- analytics surface

### Admin capabilities

- platform dashboard
- catalog management
- user oversight
- comment moderation
- announcement publishing
- inbox oversight
- featured-author control

### Platform infrastructure

- JWT auth
- refresh tokens
- cookie-based refresh flow
- role-aware backend permissions
- realtime notification support
- seeded demo data
- backend API security tests
- frontend production build verification

---

## 20. What Is Available Right Now

If someone opens the repository today and runs the app successfully, they have access to:

- a multi-role literary platform demo
- branded premium UI across the full app
- seeded demo accounts and seeded content
- public discovery and book engagement flows
- author management flows
- admin moderation and platform control surfaces
- direct messaging and notifications
- backend API coverage for security-sensitive auth and ownership behavior

In practical terms, NovaLibra is no longer just a concept, prototype, or landing page. It is now a substantial full-stack literary platform demo with real user journeys and protected backend workflows.

---

## 21. Current Known Operational Notes

There are also a few practical setup notes that matter for day-to-day development:

- backend development runs from the `backend` folder
- frontend development runs from the `frontend` folder
- on Windows PowerShell, `npm.cmd` should be used instead of `npm`
- the backend currently expects `CLIENT_URL=http://localhost:5173`
- if the frontend is opened at `http://127.0.0.1:5173`, login can fail because that origin does not match the configured backend client origin

This is not a product capability issue. It is an environment/origin configuration detail during local development.

---

## 22. Summary of the Journey

In simple terms, the NovaLibra project history so far looks like this:

1. It began as a literary website concept with a strong editorial identity.
2. It was repositioned into a multi-role literary platform.
3. A real React and Express full-stack architecture was built.
4. Authentication, roles, and protected user actions were added.
5. Books became author-owned content.
6. Reader engagement systems were added.
7. Messaging, notifications, and moderation tools were added.
8. Discovery, follows, reviews, and analytics pushed the project beyond MVP scope.
9. Branding and visual design were elevated into a more luxurious premium product feel.
10. That luxury design system was extended across nearly the entire application.
11. Backend security-sensitive API tests were added to protect auth, permissions, and ownership rules.

NovaLibra is now positioned as a serious literary platform foundation with strong presentation, real workflows, seeded demo data, and protected backend behavior.

---

## 23. Recommended Uses for This Document

This document is especially useful for:

- onboarding collaborators
- stakeholder updates
- project status reporting
- planning the next implementation phase
- identifying what has already been solved
- understanding what is already available for demos

It can be extended later with:

- exact milestone dates
- release or version history
- contributor notes
- screenshots
- direct links to key implementation files by module
