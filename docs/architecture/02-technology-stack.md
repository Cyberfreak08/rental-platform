# Technology Stack V1

Status: PHASE 1 FROZEN BASELINE / PHASE 2 TARGET

## Frontend (Phase 1 Frozen Baseline)
- Next.js 14 (App Router)
- TypeScript
- React 18
- Tailwind CSS
- Plus Jakarta Sans Typography
- Custom Responsive Components (DateTimePicker, VehicleCard, OwnerShell)

## Backend
- Node.js
- Express
- TypeScript
- REST API

## Database
- PostgreSQL
- Prisma ORM

## Validation
Use shared/server-side schemas where practical (e.g. Zod or equivalent) so request validation is explicit.

## Authentication
Secure owner authentication and session management. [TECHNICAL DESIGN REQUIRED: HTTP-only session cookies vs signed tokens to be designed in Phase 2].

## Images
Object storage; store only metadata/object keys/URLs in PostgreSQL.

## Testing
- Unit tests for business rules and utilities
- Integration/API tests for booking/availability
- Component/UI tests for critical flows
- End-to-end smoke tests for customer and owner happy paths

## Code quality
- TypeScript strictness appropriate to the project
- linting
- formatting
- predictable folder conventions
- clear error handling
- no secrets in source control
