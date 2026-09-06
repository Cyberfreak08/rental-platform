# Recommended Project Structure

```text
rental-platform/
├── apps/
│   ├── web/
│   │   ├── app/
│   │   │   ├── (public)/
│   │   │   ├── owner/
│   │   │   └── status/
│   │   ├── components/
│   │   ├── lib/
│   │   ├── hooks/
│   │   ├── styles/
│   │   └── public/
│   └── api/
│       └── src/
│           ├── modules/
│           │   ├── auth/
│           │   ├── business/
│           │   ├── models/
│           │   ├── vehicles/
│           │   ├── bookings/
│           │   ├── availability/
│           │   ├── calendar/
│           │   ├── reports/
│           │   └── notifications/
│           ├── middleware/
│           ├── lib/
│           └── server.ts
├── packages/
│   └── shared/
│       ├── schemas/
│       ├── types/
│       └── constants/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── docs/
└── assets/
```

## Module rule
Keep domain/business logic close to the backend module that owns it. Availability logic should not be duplicated in controllers, React components, and database scripts.

## Frontend rule
Prefer route-level server data fetching and reusable components. Keep API calls behind a small client abstraction rather than scattering raw fetch calls everywhere.
