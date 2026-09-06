# System Architecture V1

## Objective
Keep the application full-stack, maintainable, provider-agnostic and inexpensive enough for local SMB deployment.

## Logical architecture
```text
                    Public Customer
                           |
                           v
                    Next.js Web App
                           |
                    HTTPS / REST API
                           |
                           v
                  Node.js + Express API
                           |
            +--------------+--------------+
            |              |              |
            v              v              v
         Prisma         Notification    Storage adapter
            |             service           |
            v              |              v
       PostgreSQL       WhatsApp       Object storage
                           |
                           v
                       Email later
```

## Major boundaries
- Frontend owns presentation and client interaction state.
- Backend owns business rules, validation, availability calculations and booking state transitions.
- Database owns durable records and relationships.
- Notification service abstracts WhatsApp/email provider specifics.
- Storage service abstracts image storage.

## Important principle
Do not put booking availability rules only in the frontend. The backend must independently validate every action that affects inventory.

## Deployment independence
Do not make business logic dependent on a specific hosting provider's proprietary APIs unless an explicit feature requires it.
