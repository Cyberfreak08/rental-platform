# Coding Phase Plan

## Phase 1 — UI Prototype (STATUS: COMPLETED, QA VERIFIED & FROZEN)
- [x] Use dummy data & comprehensive mock state (`mock-state.tsx`).
- [x] Build customer public pages (10 routes) and owner operations pages (9 routes).
- [x] Implement responsive layout optimizations (mobile card lists, compact cards $\le 640\text{px}$, responsive tables).
- [x] Implement interactive flows: custom `DateTimePicker` (30-min UI slots), request intake, tokenized status, owner workspace.
- [x] Use only approved local SVG/vector assets from `/assets`.
- [x] Perform full regression audit across Chrome & Firefox at 360px–1440px+ viewports with clean production build.
- [x] Baseline frozen.

## Phase 2 — Architecture, Database & Concurrency (NEXT)
- Technical design for physical vehicle operational state persistence (`ACTIVE`, `INACTIVE`, `MAINTENANCE`, `ARCHIVED`).
- Technical design for secure owner authentication & session management.
- Concurrency-safe transaction locking strategy for booking confirmation.
- Implement Prisma schema & PostgreSQL migrations.
- Seed realistic demo data and enforce model-vehicle relationships.

## Phase 3 — Backend API & Services
- Implement public routes (catalog, search/availability engine, request intake, tokenized status).
- Implement owner routes (state machine transitions: confirm, reject, reassign, complete, cancel, offline intake).
- Implement availability service and non-destructive reversible archival.
- Structured error handling and input validation.

## Phase 4 — Connect UI to API
- Replace mock state calls in `apps/web` with real API client.
- Handle loading, server errors, and empty states.
- Validate end-to-end booking lifecycle with database persistence.

## Phase 5 — Communication, Security & Hardening
- Implement secure owner session cookies/tokens.
- Implement secure tokenized booking access.
- WhatsApp click-to-chat deterministic URL generator; optional Cloud API adapter behind flag.

## Phase 6 — Production Readiness
- Deployment configuration and environment validation.
- End-to-end smoke tests and CSV export verification.
- Handover documentation.
## Completion rule
Do not begin the next phase merely because files compile. Confirm the prior phase's acceptance criteria and test the relevant product flows first.
