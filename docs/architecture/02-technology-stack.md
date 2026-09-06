# Technology Stack V1

## Frontend
- Next.js
- TypeScript
- React
- Responsive CSS/UI system

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
Implementation mechanism is open (secure cookie/session or equivalent), but must meet the F8 security requirements.

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
