# ADR-008 — Concurrency-Safe Booking Confirmation & Locking

## Decision
- Screen-level availability displays are advisory.
- Pending booking requests do NOT consume physical inventory.
- Confirmation is the authoritative commitment point where physical inventory is allocated.
- Final confirmation and vehicle assignment MUST be concurrency-safe on the backend and database.
- Simultaneous confirmation attempts for overlapping schedules on the same physical vehicle must be serialized or atomically checked so double-booking is impossible.
- **[TECHNICAL DESIGN REQUIRED]**: The exact database locking mechanism (e.g., PostgreSQL advisory locks, `SELECT ... FOR UPDATE`, serializable transaction isolation, or optimistic concurrency control) will be evaluated and selected during Phase 2 architecture.

## Reason
Multiple pending requests can exist simultaneously for the same model and date range. When an owner confirms a request (or when multiple staff members or offline walk-ins occur simultaneously), race conditions could otherwise cause two bookings to be assigned to the same physical vehicle.

## Phase & Status
- Phase: Phase 2 (Backend & Persistence Architecture)
- Status: Frozen Product Invariant / Technical Design Open for Phase 2
