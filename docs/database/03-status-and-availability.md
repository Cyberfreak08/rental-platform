# Booking State & Availability Rules

Status: PHASE 1 FROZEN DOMAIN BASELINE

## State transitions
```text
PENDING -> CONFIRMED
PENDING -> REJECTED
CONFIRMED -> ONGOING
CONFIRMED -> CANCELLED
ONGOING -> COMPLETED
```

No arbitrary reverse transitions are allowed.

## Inventory Commitment Rule
- **PENDING** requests do NOT consume inventory.
- **CONFIRMED** and **ONGOING** bookings consume their assigned physical vehicle.
- Manual walk-in / phone bookings created by the owner directly commit inventory upon confirmation.

## Confirmation transaction
The server transaction should:
1. Lock/check the booking as still PENDING.
2. Validate confirmed schedule.
3. Validate business is open for the interval.
4. Validate selected physical vehicle belongs to the same business and requested model.
5. Validate vehicle is ACTIVE.
6. Validate no overlapping CONFIRMED/ONGOING booking exists for that vehicle.
7. Validate no overlapping vehicle block exists.
8. Set confirmed dates/times.
9. Assign physical vehicle.
10. Change status to CONFIRMED.
11. Create booking event/history record.
12. Commit.
13. Only after successful commit trigger notification side effect.

## Race condition & Concurrency rule
Availability shown on screen is advisory. Confirmation must perform a fresh server-side check with concurrency protection (locking/serialization) because another owner action/request may have changed state after the screen loaded. [TECHNICAL DESIGN REQUIRED for specific locking mechanism in Phase 2].

## Time Selection vs Backend Validation
- The UI exposes 30-minute intervals (`07:00`–`21:00`) for user experience.
- The backend domain logic and API contracts accept any valid ISO 8601 timestamp within operating hours (`Asia/Kolkata` / `+05:30`).
- Minimum booking duration enforcement is **[PRODUCT DECISION REQUIRED]**.

## Reassignment
Reassignment must validate the replacement vehicle against the same confirmed interval before saving.

## Completion
Do not auto-mark COMPLETED purely because the return timestamp passed. Owner marks the rental complete so real-world return is represented accurately.

## Availability result
For a model and interval, return a model if at least one ACTIVE physical vehicle is eligible for the entire interval.
Also return the eligible count for display where needed.
