# ADR-002 — Booking Lifecycle

## Decision
Use:
`PENDING -> CONFIRMED -> ONGOING -> COMPLETED`
with `PENDING -> REJECTED` and `CONFIRMED -> CANCELLED`.

## Reason
The owner may confirm later after calling the customer. The customer does not need an account.

## Consequences
- Pending requests do not consume inventory.
- Confirmation is the point at which inventory is committed.
- Customer receives a reference/private status link immediately after request.
