# REST API Overview V1

Base path: `/api/v1`

## Public API groups
- `/public/business`
- `/public/models`
- `/public/search`
- `/public/bookings`
- `/public/status`

## Owner API groups
- `/auth`
- `/owner/dashboard`
- `/owner/bookings`
- `/owner/calendar`
- `/owner/models`
- `/owner/vehicles`
- `/owner/blocks`
- `/owner/closures`
- `/owner/reports`
- `/owner/settings`

## Conventions
- JSON request/response.
- ISO 8601 timestamps with explicit timezone/offset from API clients.
- Validation errors return structured field-level details.
- Authentication failures are 401; authenticated but unauthorized access is 403; missing entity is 404; business rule conflicts use 409 where appropriate.
- Do not leak database internals or stack traces to clients.
