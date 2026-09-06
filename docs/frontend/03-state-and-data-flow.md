# Frontend State & Data Flow

## General
- Server state should come from API calls/query hooks rather than duplicated local copies.
- UI state may manage open dialogs, filters and transient form values.
- Booking/availability truth always comes from the backend.

## Search
1. User chooses pickup/return date/time and optional model.
2. Frontend requests `/public/search`.
3. Result list contains only eligible models by default.
4. Customer chooses one model.

## Booking request
1. Frontend sends customer details + requested schedule.
2. Backend creates PENDING booking and secure status token.
3. Frontend shows success/reference/status URL.
4. No client-side assumption that confirmation occurs immediately.

## Owner confirmation
1. Owner opens pending booking.
2. Owner edits requested schedule if needed.
3. Frontend fetches eligible vehicles.
4. UI displays suggested vehicle and alternatives.
5. Confirm request sends final schedule + selected/suggested vehicle.
6. Backend revalidates and commits atomically.
7. UI refreshes booking + availability.

## Notifications
Notification side effects happen after a successful database commit. UI should not claim a message was sent unless the backend reports it.
