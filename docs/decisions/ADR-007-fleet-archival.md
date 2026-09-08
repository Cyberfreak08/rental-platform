# ADR-007 — Fleet Removal, Non-Destructive Archival & Operational States

## Decision
1. Destructive physical deletion of vehicles or models with historical bookings is strictly prohibited.
2. Fleet removal must eventually be implemented as a reversible archival workflow:
   `ACTIVE -> ARCHIVED -> RESTORE -> ACTIVE`
3. Domain semantics distinguish between three non-active states:
   - **INACTIVE**: Temporarily paused or unlisted from customer search, but still an active part of the operational fleet.
   - **MAINTENANCE**: Temporarily unavailable due to service/repairs (represented via `VehicleBlock` operational downtime).
   - **ARCHIVED**: Retired from the active fleet and excluded from future availability calculations while preserving past bookings and audit logs intact. Reversible if business conditions permit.
4. Model archival must check dependent physical vehicles: a vehicle model cannot be archived if it has active dependent physical vehicles.
5. **[TECHNICAL DESIGN REQUIRED]**: The exact database persistence mechanism (single status enum, boolean flags, `archivedAt` timestamp, or relational status history) will be designed in Phase 2.

## Reason
Small rental businesses retire cars or take them off the road, but previous bookings, financial summaries, and operational logs must remain auditable without breaking relational integrity.

## Phase & Status
- Phase: Phase 1 (Product Boundary & UI Prototype) & Phase 2 (Persistence & Enforcement)
- Status: Frozen Product Decision / Technical Design Open for Phase 2
