# Authentication & Owner Routes

## Authentication
`POST /auth/login`
`POST /auth/logout`
`POST /auth/forgot-password`
`POST /auth/reset-password`
`POST /auth/change-password`
`GET /auth/me`

All protected owner routes require an authenticated business admin.

## Owner dashboard
`GET /owner/dashboard/summary`
Returns pending count, today's pickups/returns, ongoing count, available fleet summary.

## Bookings
`GET /owner/bookings`
Filters: status, date range, model/vehicle, search.

`GET /owner/bookings/:bookingId`
Returns booking details plus relevant history.

`PATCH /owner/bookings/:bookingId/requested-schedule`
Modify requested schedule while pending.

`POST /owner/bookings/:bookingId/confirm`
Request body includes confirmed pickup/return and optionally selected vehicle. Server can suggest/accept a vehicle before confirmation.

`POST /owner/bookings/:bookingId/reject`
Reject pending request.

`PATCH /owner/bookings/:bookingId/confirmed-schedule`
Modify confirmed schedule with availability validation.

`POST /owner/bookings/:bookingId/reassign`
Replace assigned physical vehicle after confirmation.

`POST /owner/bookings/:bookingId/cancel`
Cancel confirmed/ongoing booking when appropriate.

`POST /owner/bookings/:bookingId/start`
Mark pickup/ongoing.

`POST /owner/bookings/:bookingId/complete`
Mark rental completed.

`POST /owner/bookings/offline`
Create offline booking and confirm after availability validation.

## Fleet
`GET /owner/models`
`POST /owner/models`
`PATCH /owner/models/:modelId`
`GET /owner/models/:modelId/vehicles`
`POST /owner/models/:modelId/vehicles`
`PATCH /owner/vehicles/:vehicleId`
`POST /owner/vehicles/:vehicleId/deactivate`
`POST /owner/vehicles/:vehicleId/activate`

## Blocks/closures
`POST /owner/vehicles/:vehicleId/blocks`
`GET /owner/vehicles/:vehicleId/blocks`
`DELETE /owner/vehicle-blocks/:blockId`

`POST /owner/closures`
`GET /owner/closures`
`PATCH /owner/closures/:closureId`
`DELETE /owner/closures/:closureId`

## Reports
`GET /owner/reports/bookings`
Query params for date range/status/model/vehicle.

`GET /owner/reports/bookings.csv`
CSV export of same filtered dataset.
