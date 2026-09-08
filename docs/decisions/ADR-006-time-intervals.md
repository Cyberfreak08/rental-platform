# ADR-006 — UI Time-Selection Intervals vs Backend Timestamps

## Decision
- The frontend UI uses 30-minute time-selection intervals (`07:00`–`21:00`) for customer and owner usability.
- This is a UI/UX decision only, NOT a backend/domain invariant.
- The backend API and availability service must accept any valid ISO 8601 timestamp within business operating hours (`07:00`–`21:00` in the authoritative business timezone `Asia/Kolkata` / `+05:30`).
- The backend must not reject a valid timestamp solely because it does not fall on a 30-minute boundary unless this becomes an explicitly approved product rule.

## Reason
Providing discrete 30-minute increments in the custom `DateTimePicker` component optimizes mobile/touch selection and prevents arbitrary minute typos by users. However, restricting the backend schema or domain logic to 30-minute boundaries would artificially constrain future integration, manual offline precision, and custom business rules.

## Phase & Status
- Phase: Phase 1 (UI) & Phase 2 (Backend Contract)
- Status: Frozen Baseline Decision
