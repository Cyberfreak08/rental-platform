# V1 Test Strategy

## Business-rule unit tests
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
