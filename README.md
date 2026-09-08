# DriveNest Rental Platform V1 — Knowledge Base & Implementation Blueprint

Status: **PHASE 1 FROZEN BASELINE / READY FOR PHASE 2 ARCHITECTURE & PERSISTENCE**

DriveNest is a responsive, full-stack rental business web platform designed for small-to-medium local vehicle rental operators (initial target: self-drive car rentals in Coimbatore/Tamil Nadu, India).

## Current Project Status
- **Phase 1 (Responsive UI Prototype)**: **COMPLETE & FROZEN**. All 19 public and owner routes, Plus Jakarta Sans typography, custom responsive components (e.g. `DateTimePicker`), mock state flows, and viewport regression QA (360px–1440px+) across Chrome and Firefox are fully verified.
- **Phase 2 (Architecture, Persistence, API & Concurrency)**: **READY TO START**.

## Main contents
- `docs/requirements/` — frozen F1–F11 requirements and V1 boundaries
- `docs/architecture/` — system architecture, stack, configuration
- `docs/database/` — logical schema, relationships, status/availability rules
- `docs/api/` — REST API route contracts and errors
- `docs/frontend/` — routing, pages, components, state/data flow, responsive behaviour
- `docs/design/` — visual system, screen design, interactions, asset rules
- `docs/testing/` — scenario-driven test strategy
- `docs/deployment/` — production launch/handover checklist
- `docs/decisions/` — explicit architectural/product decisions
- `data/` — realistic fictional seed data and message copy
- `assets/` — controlled local visual assets and visual references

## Core Product Boundaries & Invariants
- **V1 Hard Exclusions**: No online payment gateways, no automated KYC/ID uploads, no digital rental agreements, no GPS/telematics, no customer login/accounts, no multi-tier staff RBAC.
- **Authoritative Owner Role**: Owner is the sole authority for confirming booking requests, allocating physical inventory, and marking rental completions.
- **Booking Lifecycle**: `PENDING -> CONFIRMED -> ONGOING -> COMPLETED` (with explicit rejection and cancellation flows).
- **Inventory Commitment**: `PENDING` requests **do not** consume physical inventory. `CONFIRMED` and `ONGOING` bookings consume their assigned physical vehicle.
- **Availability & Concurrency**: Screen-level availability is advisory. Server confirmation must be concurrency-safe with atomic locking to prevent double-booking.
- **Time Selection**: 30-minute UI intervals are for UX only; backend contract accepts valid ISO 8601 timestamps within operating hours (`07:00`–`21:00` in `Asia/Kolkata` / `+05:30` IST).
- **Fleet Archival**: Deletion of vehicles or models with historical bookings is strictly prohibited. Fleet removal is a non-destructive, reversible archival workflow (`ACTIVE` $\leftrightarrow$ `ARCHIVED`).
- **Communication**: WhatsApp integration is deterministic click-to-chat (`wa.me`) by default; external Cloud API automation remains optional and non-blocking.

## Unsettled Items Classification
- **[PRODUCT DECISION REQUIRED]**: Minimum booking duration enforcement.
- **[TECHNICAL DESIGN REQUIRED]**: Physical vehicle operational state persistence representation (`ACTIVE`, `INACTIVE`, `MAINTENANCE`, `ARCHIVED`).
- **[TECHNICAL DESIGN REQUIRED]**: Owner authentication & session management architecture.
- **[TECHNICAL DESIGN REQUIRED]**: Database transaction locking strategy for confirmation.

## Implementation Instruction
Read `docs/README.md` and `docs/decisions/` before writing backend code. Treat the frozen requirements and ADRs as authoritative.
