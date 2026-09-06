# Coding Phase Plan

## Phase 1 — UI only
- Use dummy data.
- Build customer public pages and owner pages.
- Implement responsive behaviour.
- Implement interactions with mock state only.
- Use only approved local assets from `/assets`.
- Do not build production authentication/database/WhatsApp yet.

## Phase 2 — Database
- Implement Prisma schema.
- Run migrations.
- Seed realistic demo data.
- Verify relationships and invariants.

## Phase 3 — Backend/API
- Implement public routes.
- Implement owner routes.
- Implement validation/error contract.
- Implement availability service.
- Implement booking lifecycle and transactions.

## Phase 4 — Connect UI to API
- Replace mock calls with API client.
- Handle loading/error/empty states.
- Validate all flows using seeded data.

## Phase 5 — Communication/security
- Add owner authentication.
- Add secure private booking status.
- Add WhatsApp click-to-chat/prefill.
- Keep automated API behind an adapter and feature flag.

## Phase 6 — Production readiness
- Configure selected provider stack.
- Configure domain/DNS/HTTPS.
- Storage and backups.
- Analytics/Search Console.
- E2E smoke testing.
- Handover checklist.

## Completion rule
Do not begin the next phase merely because files compile. Confirm the prior phase's acceptance criteria and test the relevant product flows first.
