# NovaLibra Platform Transition Guidelines

## Purpose

This document is the working guideline for NovaLibra's transition from a single-author literary site into a multi-author literary platform.

We will use it as the project reference until the platform is complete.

It defines:

- what NovaLibra is
- who it serves
- what we are building
- how we will make product decisions
- what order we will build in
- what must stay true during implementation

This document should be treated as the source of alignment for product, UX, backend, and frontend decisions.

---

## 1. Product Definition

### Working Product Statement

NovaLibra is a digital platform where writers create accounts, showcase books, connect with readers, and build literary community. Readers can discover books, follow discussions, interact with authors, and become part of a growing reading ecosystem.

### Product Identity

NovaLibra is not a personal author website.

NovaLibra is:

- a multi-author literary platform
- a discovery space for readers
- a digital presence layer for writers
- a community product built around books, discussion, and connection

### What NovaLibra Must Feel Like

At every stage, the platform should feel:

- premium
- literary
- welcoming to both readers and authors
- community-driven
- scalable beyond one person or one catalog

---

## 2. User Roles

NovaLibra has three core user types.

### Readers

Readers can:

- create accounts
- browse books
- open book pages
- comment on books
- save favourites
- message authors
- receive notifications
- return for ongoing discussion and discovery

### Authors

Authors can do everything readers can do, plus:

- create an author profile
- add books
- edit their own books
- manage their own messages
- manage their own engagement
- grow a literary presence on the platform

### Admins

Admins can:

- moderate the platform
- manage users
- remove abuse and spam
- feature books and authors
- publish announcements
- oversee platform health and trust

### Role Rules

- Readers must never be able to edit books they do not own.
- Authors must only be able to edit and delete books they own.
- Admins must be able to moderate all platform content.
- Role logic must be enforced in backend permissions, not only in frontend UI.

---

## 3. Core Promise

NovaLibra should consistently deliver these four promises:

### For writers

A place to be seen.

### For readers

A place to discover and engage.

### For both

A place to connect.

### For the platform

A place to grow literary community.

Every major feature should support at least one of these promises.

---

## 4. Product Principles

These principles should guide all product and engineering decisions.

### 4.1 Platform-first, not founder-first

We do not design NovaLibra around one author identity.

Avoid:

- copy that implies one owner is the platform
- workflows that assume all books belong to the platform itself
- UI language centered around a single author

Prefer:

- authors and readers
- create an account
- showcase your books
- connect with readers
- build your literary presence

### 4.2 Books are owned content

Books are not generic platform entries.

Each book must belong to the user who created it.

This principle affects:

- schema design
- API authorization
- dashboard structure
- profile structure
- moderation logic

### 4.3 Community is a core feature, not a side feature

Discussion, favourites, messaging, and notifications are not extras.

They are part of the platform's value and must be treated as product pillars.

### 4.4 Premium literary experience

NovaLibra should retain its premium dark editorial feel while becoming more open and platform-like.

We should preserve:

- polished visual design
- premium tone
- literary atmosphere
- clear information hierarchy

We should avoid:

- generic dashboard feel
- bland SaaS copy
- awkward role language

### 4.5 Safe incremental change

We will evolve the app in phases.

We do not break working functionality just to force the platform shift faster.

Each phase should:

- preserve current stability
- introduce one clear product improvement
- prepare the next phase

---

## 5. User Journeys

### Reader Journey

The ideal reader journey is:

1. Reader creates account.
2. Reader browses books.
3. Reader opens a book page.
4. Reader comments or saves a book.
5. Reader follows discussion.
6. Reader messages an author or engages further.
7. Reader returns for more discovery.

This is NovaLibra's reader engagement loop.

### Author Journey

The ideal author journey is:

1. Author creates account.
2. Author selects or enables author role.
3. Author sets up profile with name, bio, avatar, and links.
4. Author adds first book.
5. Book becomes publicly discoverable.
6. Readers discover and comment on it.
7. Author receives notifications or messages.
8. Author grows literary presence over time.

This is NovaLibra's author growth loop.

### Admin Journey

The ideal admin journey is:

1. Admin monitors platform activity.
2. Admin moderates abuse, spam, and problematic content.
3. Admin features promising books or authors.
4. Admin publishes platform announcements.
5. Admin supports healthy platform growth.

---

## 6. Functional Modules

NovaLibra should be built and maintained in these modules.

### Module 1: Accounts

Includes:

- signup
- login
- session handling
- roles
- profile settings

### Module 2: Author Profiles

Includes:

- author bio
- avatar
- public author page
- authored books list
- optional links and external presence later

### Module 3: Books

Includes:

- add book
- edit own book
- delete own book
- public book detail page
- cover
- description
- genre and categories later
- outbound purchase or info links

### Module 4: Community

Includes:

- comments
- replies
- favourites
- likes later
- notifications

### Module 5: Messaging

Includes:

- reader-to-author messages
- author replies
- inbox management

### Module 6: Admin

Includes:

- user moderation
- book moderation
- comment moderation
- platform announcements
- feature placement later

---

## 7. Phased Delivery Plan

We will build NovaLibra in the following order.

### Phase 1: Reposition the product

Objective:

Make NovaLibra feel like a platform for authors and readers.

Work included:

- rewrite homepage copy
- rewrite CTA labels
- update navbar labels
- remove single-owner wording
- remove reader-only framing where it is limiting
- keep routes and current functionality intact

Success criteria:

- homepage sounds open to all writers and readers
- users can understand the platform immediately
- the brand no longer feels tied to one owner

### Phase 2: Add author ownership foundation

Objective:

Prepare the data and permission model for a real multi-author platform.

Work included:

- define clear roles: reader, author, admin
- add ownership relation from books to users
- make ownership visible in backend logic
- identify migration and backfill approach for current books

Success criteria:

- every book has an owner
- roles support future author workflows
- the backend is ready for author-owned content

### Phase 3: Author book management

Objective:

Enable authors to own and manage their own books.

Work included:

- author create book flow
- author edit own book flow
- author delete own book flow
- my books page
- ownership checks in API routes

Success criteria:

- authors can manage their own catalog
- readers cannot modify books
- admins can still moderate everything

### Phase 4: Author presence

Objective:

Help writers build identity and discoverability.

Work included:

- stronger author profiles
- authored books section
- public author pages
- optional social and buy links

Success criteria:

- authors feel represented, not hidden
- readers can connect books to real authors

### Phase 5: Reader engagement

Objective:

Increase return visits and community depth.

Work included:

- improved comments and replies
- favourites and follow-style engagement
- stronger notifications
- clearer messaging between readers and authors

Success criteria:

- readers have reasons to come back
- books become hubs for discussion

### Phase 6: Platform growth tools

Objective:

Turn NovaLibra into a scalable literary ecosystem.

Work included:

- search by genre
- author discovery
- featured books
- categories
- reviews and ratings
- followers
- analytics for authors

Success criteria:

- discovery expands beyond direct browsing
- authors gain tools to understand and grow their reach

---

## 8. Non-Negotiable Build Rules

The following rules apply throughout the project.

### 8.1 Do not break existing functionality

Unless intentionally replacing a feature, we preserve:

- authentication
- books listing
- book detail pages
- comments
- favourites
- messaging
- notifications
- admin moderation

### 8.2 Preserve the premium UI direction

Do not downgrade the visual identity into a generic admin app.

We keep:

- dark premium styling
- editorial typography
- polished section structure
- elevated literary tone

### 8.3 Enforce permissions on the backend

Frontend can hide actions, but backend must enforce access.

Examples:

- author can edit only own book
- reader cannot create books unless upgraded to author
- admin can moderate all books and comments

### 8.4 Prefer extensible schema decisions

When changing the schema, choose structures that support:

- public author pages
- multiple books per author
- future categories and genres
- future analytics
- future followers or subscriptions

### 8.5 Keep terminology consistent

Use these terms consistently:

- readers
- authors
- admins
- account
- author profile
- books
- favourites
- messages
- announcements

Avoid inconsistent labels that confuse the product identity.

---

## 9. Language and Copy Guidelines

### Preferred Tone

Copy should feel:

- polished
- premium
- clear
- inclusive
- literary

### Preferred Messaging

Use language like:

- a premium digital home for authors, books, and readers
- create an account
- showcase your books
- connect with readers
- build your literary presence
- discover books and discussion
- join a growing literary community

### Avoid These Patterns

Avoid phrases like:

- his readers
- reader account
- author team
- site owner language
- platform copy that implies one central author identity

### Homepage Direction

Preferred hero direction:

- A premium digital home for authors, books, and readers.

Alternative direction:

- Where writers showcase stories and readers discover them.

Supporting direction:

- Create an account, build your profile, showcase your books, connect with readers, and be part of a growing literary community designed for discovery, discussion, and digital presence.

Preferred CTAs:

- Explore Books
- Create Account
- Become an Author

Alternative CTAs:

- Join NovaLibra
- Publish Your Presence

---

## 10. Data and Permission Guidelines

These rules should guide backend implementation.

### User roles

Target role model:

- `READER`
- `AUTHOR`
- `ADMIN`

### Book ownership

Each book must:

- store an `authorId` or `userId`
- belong to one author
- be publicly viewable
- be editable only by its owner or an admin

### Ownership checks

For any mutating book action:

- if admin, allow
- if author owns the book, allow
- otherwise, deny

### Profile rules

All users have profiles.

Authors additionally need:

- stronger author presentation
- authored books list
- optional public author-facing metadata

### Migration safety

When moving to owned books:

- do not orphan existing books
- define a backfill path before applying the migration
- test authorization after schema changes

---

## 11. Engineering Workflow Guidelines

### Build order

When possible, follow this order:

1. product copy
2. role model
3. schema ownership
4. API authorization
5. author dashboard
6. author profile improvements
7. reader engagement upgrades
8. discovery and growth tooling

### Change sizing

Prefer small, reviewable changes.

Each implementation pass should have:

- one clear objective
- one clear success condition
- minimal unrelated edits

### Validation checklist for each feature

Before a feature is considered complete, confirm:

- UX language matches platform identity
- permissions are correctly enforced
- old flows still work
- admin moderation still works
- no route or page is unintentionally broken

---

## 12. Definition of Done by Stage

### Stage A: Repositioning done when

- homepage copy is platform-wide
- nav labels are platform-wide
- registration copy welcomes all users
- profile language is not reader-only
- NovaLibra no longer feels like one person's site

### Stage B: Ownership foundation done when

- roles are reader, author, admin
- books are tied to user ownership
- backend recognizes ownership
- migration path is documented and safe

### Stage C: Author workflow done when

- authors can add books
- authors can edit their own books
- authors can delete their own books
- authors have a my books area

### Stage D: Community growth done when

- readers can engage deeply
- authors can respond and build presence
- the platform encourages return usage

### Final platform milestone

NovaLibra is complete when it operates as a real literary ecosystem where:

- multiple authors can build presence
- readers can discover and engage
- admins can moderate and guide growth
- books are owned, discoverable, and social

---

## 13. Immediate Working Next Step

The next implementation step should be:

Reposition NovaLibra as a multi-author platform and prepare the product for author-owned books.

That means:

1. rewrite homepage and interface copy
2. adjust platform labels
3. remove single-owner wording
4. define author role clearly in the product direction
5. inspect and prepare the backend model for author-owned books

This is the current priority until completed.

---

## 14. How To Use This Document

Before starting any major feature or refactor:

1. identify which phase the work belongs to
2. confirm the work supports the product definition
3. confirm the work supports at least one core promise
4. check that permissions and ownership rules stay intact
5. check that the platform feels more multi-author, not less

If a proposed change conflicts with this document, the change should be revised before implementation.

---

## 15. Living Document Rule

This guideline is a living project document.

It can be updated when:

- the product direction becomes clearer
- new modules are added
- implementation realities require a better phased plan

However, updates should not weaken the core transition goal:

NovaLibra must become a multi-author literary platform centered on discovery, presence, and community.
