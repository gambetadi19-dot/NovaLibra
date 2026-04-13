# NovaLibra Development Phases

## Purpose

This document is the execution roadmap for building NovaLibra into a complete multi-author literary platform.

The companion document [PROJECT_GUIDELINES.md](C:\Users\gambe\OneDrive\Desktop\NovaLibra\PROJECT_GUIDELINES.md) defines the product direction and operating rules.

This document defines:

- every major development phase
- what each phase must achieve
- what features belong in each phase
- what must be designed carefully
- how we make NovaLibra not just functional, but loved
- what done looks like before moving forward

This should be treated as the main build sequence for the rest of the project.

---

## 1. Product Outcome We Are Building Toward

NovaLibra must become a platform where:

- authors can create identity, publish books, and grow presence
- readers can discover books, connect with authors, and return for discussion
- admins can moderate quality, trust, and visibility
- the product feels premium, literary, alive, and worth coming back to

The final experience should not feel like:

- a personal site with extra pages
- a generic admin dashboard
- a plain CRUD app for books

It should feel like:

- a literary home
- a discovery platform
- a social reading space
- a premium publishing presence layer

---

## 2. What Makes NovaLibra Loved

NovaLibra will only become a loved platform if we intentionally build for emotional quality, not just technical completeness.

### 2.1 For authors

Authors should feel:

- seen
- respected
- proud to publish there
- in control of their own books
- connected to their readers

To achieve that, we must give authors:

- ownership
- strong profiles
- elegant presentation
- meaningful engagement signals
- tools to grow presence over time

### 2.2 For readers

Readers should feel:

- curious
- welcomed
- rewarded for browsing
- close to authors and stories
- motivated to return

To achieve that, we must give readers:

- strong discovery
- clear book pages
- good conversations
- favourites and follow-style behaviors
- fast, pleasant interactions

### 2.3 For the platform as a whole

The platform should feel:

- consistent
- premium
- trustworthy
- active
- carefully curated, not chaotic

To achieve that, we must protect:

- moderation quality
- tone of voice
- visual coherence
- clear permissions
- scalable architecture

---

## 3. Full Development Sequence

We will build NovaLibra in nine development phases.

### Phase 1: Product Repositioning

#### Objective

Transform the visible product language from single-author framing into multi-author platform framing.

#### Why this phase matters

If the app still sounds like one person owns everything, the rest of the platform work will feel inconsistent.

This phase creates the correct public identity before deeper functionality changes.

#### Scope

- rewrite homepage hero
- rewrite supporting homepage sections
- update CTA labels
- update navbar wording
- update registration wording
- update profile wording
- update books page wording
- remove exclusive phrases and single-owner language

#### Features and tasks

- replace phrases like `his readers`, `reader account`, and `author team`
- use platform-wide language like `authors and readers`, `create an account`, `showcase your books`, `build your literary presence`
- keep current routes and UI structure
- preserve premium dark look and feel

#### UX intent

The first-time visitor should immediately understand:

- this is for writers and readers
- this is a platform, not one person’s homepage
- joining has value

#### Risks to avoid

- changing copy in ways that weaken the premium tone
- introducing generic startup language
- changing functionality during a copy-only pass

#### Definition of done

- homepage feels platform-wide
- onboarding language feels inclusive
- no major public page implies one-owner structure

---

### Phase 2: Role Model and Account Evolution

#### Objective

Create the right account structure for a multi-user platform.

#### Why this phase matters

A platform cannot behave correctly if all non-admin users are treated the same way.

We need role clarity before author ownership and author workflows can be built correctly.

#### Scope

- expand role system
- define author enablement flow
- align auth payloads with new role model
- prepare frontend session logic for role-aware experiences

#### Target roles

- `READER`
- `AUTHOR`
- `ADMIN`

#### Decisions to make

- whether users choose author role during registration
- whether users start as readers and later activate author mode
- whether author role requires admin approval now or later

#### Recommended initial approach

Start simple:

- default all new users to `READER`
- allow author profile enablement later
- keep admin approval optional for future moderation policy

#### Features and tasks

- update Prisma enum for roles
- migrate existing `USER` records safely
- update backend authorization helpers
- update frontend role checks
- ensure notifications and messaging continue working with the new role names

#### UX intent

Users should feel like the platform understands who they are and what they can do.

#### Risks to avoid

- breaking login or refresh flows
- hard-coding old role values
- exposing author-only actions before backend permissions exist

#### Definition of done

- roles are clear and stable
- current users still work
- frontend and backend agree on role values

---

### Phase 3: Book Ownership Foundation

#### Objective

Make books truly belong to the users who created them.

#### Why this phase matters

This is the actual transition from “site” to “platform.”

Without ownership, authors do not really exist as first-class participants.

#### Scope

- add ownership relation from books to users
- backfill existing books safely
- expose author data where needed
- enforce book ownership in backend logic

#### Required data model direction

Each book must:

- have an `authorId` or `userId`
- belong to exactly one user
- be publicly readable
- be editable by owner or admin only

#### Features and tasks

- update Prisma `Book` model
- add reverse user-to-books relation
- create migration
- define existing-book assignment strategy
- update create, update, and delete book logic
- ensure admins can still moderate all books

#### UX intent

Authors should begin to feel like they are publishing to the platform, not submitting content into an anonymous pool.

#### Risks to avoid

- orphaning old books
- missing authorization checks
- exposing edit actions without ownership enforcement

#### Definition of done

- every book has an owner
- authorization is enforced on the backend
- public reading flows still work

---

### Phase 4: Author Publishing Workflow

#### Objective

Let authors create and manage books directly.

#### Why this phase matters

Once ownership exists, authors need real publishing flows.

Without this phase, ownership exists only in the database, not in the product.

#### Scope

- author create book flow
- author edit book flow
- author delete own book flow
- author “My Books” area
- clearer navigation for authors

#### Features and tasks

- create `My Books` page
- create `Add Book` form
- create `Edit Book` experience
- connect authored books to profile and dashboard surfaces
- keep admin catalog management separate from author self-management

#### UX intent

Authors should feel:

- capable
- empowered
- professionally represented

The creation flow should feel polished, not like a hidden admin tool.

#### Risks to avoid

- reusing admin workflows without adapting language for authors
- mixing admin moderation tools with author tools in confusing ways
- weak validation on book data

#### Definition of done

- authors can manage their own books end-to-end
- author tools are clearly separated from admin tools
- readers still cannot modify books

---

### Phase 5: Author Presence and Public Identity

#### Objective

Give authors a real literary presence on NovaLibra.

#### Why this phase matters

Authors do not just need publishing capability. They need identity, discoverability, and trust.

#### Scope

- strengthen author profiles
- add authored books lists
- support public author pages
- add optional author links
- improve bio and presentation space

#### Features and tasks

- upgrade profile model where needed
- create public author page route
- surface authored books on profile pages
- distinguish reader profile view from author profile view
- allow optional external links later

#### UX intent

A reader landing on an author page should feel they are meeting a real writer, not looking at a technical user record.

#### What makes this phase lovable

- elegant profile presentation
- clear connection between author and books
- thoughtful bio space
- premium visual treatment

#### Risks to avoid

- leaving author pages visually flat
- showing too little identity
- making all profiles look identical regardless of role

#### Definition of done

- authors have a meaningful public presence
- books visibly belong to authors
- readers can browse from book to author and back

---

### Phase 6: Reader Engagement Loop

#### Objective

Make readers want to stay, interact, and return.

#### Why this phase matters

Publishing alone does not create community. Engagement does.

#### Scope

- improve comments
- improve replies
- strengthen favourites
- improve notifications
- make discussion feel active and valuable

#### Features and tasks

- improve comment composer experience
- refine threaded discussion display
- allow richer engagement cues
- improve notification relevance
- ensure saved books and discussion are visible in user experience

#### UX intent

Book pages should feel alive, not static.

Readers should be encouraged to participate without feeling overwhelmed.

#### What makes this phase lovable

- discussion that feels close to the book
- easy saving and returning
- notifications that matter
- visible signals that the community is active

#### Risks to avoid

- noisy notifications
- cluttered discussions
- low-signal interactions that feel shallow

#### Definition of done

- readers can engage meaningfully around books
- returning behavior is supported
- comments feel like a true community feature

---

### Phase 7: Reader-to-Author Connection

#### Objective

Turn NovaLibra into a place where authors and readers actually connect.

#### Why this phase matters

Connection is one of NovaLibra’s core promises.

Messaging and interaction must feel intentional and useful, not bolted on.

#### Scope

- improve reader-to-author messaging
- clarify recipient flows
- improve inbox clarity
- align messaging with author identities instead of admin-only contact patterns

#### Features and tasks

- ensure messages can be directed to authors
- update UI to reflect author communication, not just platform contact
- improve inbox states
- optionally support conversation grouping later

#### UX intent

Messaging should feel personal, safe, and worth using.

#### What makes this phase lovable

- readers feel close to authors
- authors feel connected to real people
- communication feels human, not transactional

#### Risks to avoid

- spammy message flows
- unclear recipient rules
- inbox experiences that feel raw or unfinished

#### Definition of done

- readers can message authors clearly
- authors can manage responses smoothly
- messaging reinforces the platform’s community value

---

### Phase 8: Discovery and Curation

#### Objective

Help readers find the right books and authors.

#### Why this phase matters

A growing platform must make discovery better over time, not harder.

#### Scope

- search
- genre browsing
- categories
- featured books
- featured authors
- improved book browsing structure

#### Features and tasks

- add genre/category fields
- add search and filters
- create discovery pages or sections
- add featured placements for admin curation
- improve card and list design for browsing

#### UX intent

Readers should be able to move from curiosity to discovery quickly.

The platform should feel curated, not random.

#### What makes this phase lovable

- strong browsing experience
- surprising discovery moments
- useful curation
- a sense that the platform has depth

#### Risks to avoid

- overcomplicated filters too early
- empty categories
- low-quality featured content without moderation standards

#### Definition of done

- readers can discover books by more than manual browsing
- authors gain more visibility paths
- admins can guide attention thoughtfully

---

### Phase 9: Growth, Retention, and Platform Intelligence

#### Objective

Give NovaLibra the tools to sustain long-term platform health and value.

#### Why this phase matters

Once the core product works, the next challenge is retention, growth, and author success.

#### Scope

- followers
- reviews and ratings
- author analytics
- recommendation improvements later
- editorial and platform insight tools

#### Features and tasks

- follower relationships
- reader reviews or ratings
- author analytics dashboard
- engagement summaries
- performance indicators for books and profiles

#### UX intent

Authors should feel their presence is growing.

Readers should feel the platform gets richer the more they use it.

#### What makes this phase lovable

- authors can see momentum
- readers can express richer appreciation
- the platform becomes more rewarding over time

#### Risks to avoid

- vanity metrics with little value
- noisy analytics
- low-quality reviews without moderation support

#### Definition of done

- authors have growth visibility
- readers have richer participation options
- NovaLibra behaves like a mature literary ecosystem

---

## 4. Cross-Phase Systems We Must Keep Improving

Some areas must be maintained across all phases rather than only in one phase.

### 4.1 Design system quality

Throughout development we must protect:

- consistent spacing
- premium typography
- coherent dark theme styling
- strong card and panel design
- good mobile responsiveness

### 4.2 Performance and responsiveness

Throughout development we must protect:

- fast page loads
- smooth transitions
- efficient book and discussion rendering
- low-friction browsing

### 4.3 Trust and safety

Throughout development we must protect:

- moderation controls
- anti-abuse handling
- spam control
- permission boundaries

### 4.4 Data quality

Throughout development we must protect:

- clean book metadata
- safe migrations
- consistent relations
- reliable role enforcement

### 4.5 Product tone

Throughout development we must protect:

- literary language
- premium tone
- inclusive messaging
- platform-wide identity

---

## 5. What We Must Not Leave Out

The platform will feel incomplete if any of these are ignored.

### Must not leave out for authors

- ownership of books
- clean publishing flow
- strong public profile
- authored books visibility
- meaningful reader interaction

### Must not leave out for readers

- good browsing
- clear book detail pages
- favourites
- comments and replies
- ways to reconnect with books and authors

### Must not leave out for admins

- full moderation authority
- user management
- comment moderation
- book moderation
- announcements and curation tools

### Must not leave out for product quality

- mobile responsiveness
- visual consistency
- backend permission enforcement
- migration safety
- coherent platform messaging

---

## 6. Recommended Build Priorities Inside Each Phase

When working within a phase, use this order:

### First

Get the backend rules right.

### Second

Build the frontend experience that exposes those rules clearly.

### Third

Refine the copy and visual polish so the feature feels intentional.

### Fourth

Verify the feature against existing flows so nothing breaks.

This order helps us avoid pretty but fragile features.

---

## 7. Quality Gates Before Moving to the Next Phase

Before we consider a phase complete, verify the following:

### Product gate

- does this phase support the core promise?
- does it move NovaLibra further toward multi-author platform identity?

### UX gate

- does the feature feel premium and literary?
- is the language clear and inclusive?
- is the experience understandable without explanation?

### Engineering gate

- are permissions enforced on the backend?
- are data relationships correct?
- are current routes and flows still working?

### Growth gate

- does this phase make the platform more useful for authors or readers?
- does it improve retention, connection, or discoverability?

If the answer is no, the phase is not truly complete.

---

## 8. Immediate Development Order

This is the exact order we should follow next:

1. complete Phase 1 product repositioning in code
2. implement Phase 2 role model evolution
3. implement Phase 3 book ownership foundation
4. implement Phase 4 author publishing workflow
5. implement Phase 5 author presence
6. implement Phase 6 reader engagement improvements
7. implement Phase 7 author-reader connection improvements
8. implement Phase 8 discovery and curation
9. implement Phase 9 growth and analytics

This is the cleanest path to a complete platform.

---

## 9. Final Vision of Done

NovaLibra is finished when it becomes a platform that people genuinely want to use and return to.

That means:

- authors can join, publish, and grow with pride
- readers can discover, engage, and reconnect easily
- books belong to real creators
- profiles feel alive
- discussions feel meaningful
- messaging feels human
- discovery feels curated
- moderation feels reliable
- the interface feels premium and memorable

When those conditions are true, NovaLibra will no longer just be a working application.

It will be a loved literary platform.
