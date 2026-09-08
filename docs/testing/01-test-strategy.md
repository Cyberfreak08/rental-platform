# V1 Test Strategy

Status: PHASE 1 VERIFIED & FROZEN / PHASE 2 TEST SUITE TARGET

## Phase 1 Completed & Verified QA Scope
- **Responsive Viewport Testing**: Verified across Mobile (360px–640px), Tablet (768px–1024px), Desktop (1280px–1440px+).
- **Cross-Browser Verification**: Verified on Chrome and Firefox engines with zero visual regressions.
- **Route Integrity**: All 19 Next.js App Router routes built cleanly into static/dynamic bundles (`17/17` SSG/dynamic pages).
- **Interaction & State**: DateTimePicker 30-minute interval selection, booking request submission, tokenized tracking, mock booking state transitions (`PENDING` -> `CONFIRMED` -> `ONGOING` -> `COMPLETED`, `REJECTED`, `CANCELLED`), physical vehicle assignment, and reversible archival.
- **Typography & Assets**: Plus Jakarta Sans rendering and local SVG assets verification without broken image references.

## Business-rule unit tests (Phase 2 Target)
At minimum test:
- date/time ordering
- overlap detection
- active/inactive vehicle filtering
- vehicle block filtering
- business closure filtering
- model-level availability count
- booking status transition guards
- reassignment eligibility
- confirmation eligibility

## Booking scenarios
1. Normal request -> confirm.
2. Two overlapping pending requests -> both remain pending.
3. One remaining vehicle -> first confirmation consumes it; other request remains pending and must be rechecked.
4. Offline booking blocks inventory.
5. Vehicle goes inactive -> excluded.
6. Vehicle block -> excluded only for affected physical vehicle.
7. Business closure -> all vehicles unavailable.
8. Confirmed booking cancelled -> vehicle becomes eligible again.
9. Confirmed vehicle becomes unusable -> reassignment to another eligible vehicle.
10. Requested model unavailable -> alternatives shown; request model is not silently changed.
11. Owner changes requested timing before confirmation.
12. Owner changes confirmed timing and conflict validation runs.
13. Completion is owner-driven rather than time-triggered.
14. Private status link cannot access another booking.

## UI tests
- mobile/desktop layout
- forms and validation
- loading/error/empty states
- calendar crowded day behaviour
- search results and availability display
- owner confirmation flow

## Security tests
- unauthenticated owner API access rejected
- cross-business access rejected
- private status token entropy/access control
- public booking endpoint rate limited/validated
- no secrets in client bundle
