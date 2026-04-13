# NovaLibra Test Reporting

## Purpose

This document defines the Stage 14 reporting, coverage, and failure-diagnostics layer for NovaLibra.

It answers:

- where coverage artifacts go
- where Playwright failure artifacts go
- which commands to run for coverage vs regression vs quality gates
- what minimum coverage targets are recommended for release confidence
- how to debug flaky or repeated test failures without guessing

## Coverage Commands

### Full coverage

- Root: `npm.cmd run test:coverage`
- Backend only: `npm.cmd --prefix backend run coverage`
- Frontend only: `npm.cmd --prefix frontend run coverage`

### Critical-path coverage

- Root: `npm.cmd run test:coverage:critical`
- Backend only: `npm.cmd --prefix backend run coverage:critical`
- Frontend only: `npm.cmd --prefix frontend run coverage:critical`

### Quality gate

- Root: `npm.cmd run test:quality`

This runs:

1. critical-path coverage
2. the ordered regression suite

## Coverage Artifact Locations

### Backend

- HTML report: `backend/coverage/index.html`
- LCOV: `backend/coverage/lcov.info`
- JSON summary: `backend/coverage/coverage-summary.json`

### Frontend

- HTML report: `frontend/coverage/index.html`
- LCOV: `frontend/coverage/lcov.info`
- JSON summary: `frontend/coverage/coverage-summary.json`

## Playwright Reporting

Playwright now produces:

- HTML report: `artifacts/playwright/html-report`
- JUnit XML: `artifacts/playwright/junit/results.xml`
- JSON report: `artifacts/playwright/json/results.json`
- screenshots/videos/traces: `artifacts/playwright/test-results`

Failure artifact defaults:

- screenshots: retained on failure
- videos: retained on failure
- traces: captured on first retry in CI and available for failure analysis

## Recommended Coverage Targets

These are the release targets NovaLibra should aim to hold or exceed.

- Auth and session restoration: 90%+
- Permission and ownership enforcement: 95%+
- Book management and ownership-sensitive mutations: 90%+
- Engagement systems: 85%+
- Messaging, notifications, and announcements: 85%+
- Route guards and UI action coverage: 90%+
- Critical public pages and auth pages: 85%+

These are recommended thresholds for certification, not yet hard-enforced numeric gates in config.

## Readable Output Strategy

NovaLibra currently uses:

- focused root scripts for each major domain
- ordered regression output from `scripts/qa/run-full-regression.mjs`
- explicit suite labels before each grouped command
- Playwright list reporter for readable terminal progress

This keeps local runs understandable while still producing machine-readable report artifacts.

## Flaky Test Debugging Guidance

When a browser test fails intermittently:

1. Check whether the action creates persistent demo data and makes future selectors ambiguous.
2. Prefer unique per-run values for subjects, titles, or temporary content in E2E flows.
3. Open the Playwright HTML report and failure screenshot first.
4. If the failure is navigation-related, inspect the trace next.
5. If a selector is matching more than one valid element, tighten it to the exact intended surface instead of forcing non-strict behavior.

When an API test fails intermittently:

1. Check whether cleanup logic is removing all transient rows.
2. Prefer test-created records over assumptions about mutable seed counts.
3. Use role-specific seeded accounts for read-only flows and transient users for destructive flows.

## Retry Strategy

Current approach:

- local Playwright runs: `0` retries so real failures stay visible
- CI Playwright runs: `2` retries to help isolate true flakes from infrastructure noise

This balance is intentional:

- local work should fail loudly
- CI can gather more diagnostic information before classifying something as flaky

## What To Run In Practice

- Quick confidence check: `npm.cmd run test:smoke`
- Release regression: `npm.cmd run test:regression`
- Reporting bundle: `npm.cmd run test:reports`
- Coverage plus regression gate: `npm.cmd run test:quality`
