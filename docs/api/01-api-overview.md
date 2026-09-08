# REST API Overview V1

Status: PHASE 1 FROZEN PROTOTYPE BASELINE / PHASE 2 TARGET CONTRACT

Base path: `/api/v1`

## Separation of Phases
- **Phase 1 Prototype**: In-memory mock state and client interactions implemented in Next.js frontend (`apps/web/lib/mock-state.tsx`).
- **Phase 2 Backend Contract**: REST API endpoints, PostgreSQL persistence via Prisma, server-side transaction locking, and secure owner authentication.

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
