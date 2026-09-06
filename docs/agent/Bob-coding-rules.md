# Coding-Agent Rules

## Source of truth
Before changing product behaviour, read:
- `docs/requirements/`
- `docs/decisions/`
- relevant `docs/database/`, `docs/api/`, `docs/frontend/`, `docs/design/`

## Do not invent
Do not add:
- payment systems
- KYC
- customer accounts
- staff roles
- partner settlement
- maintenance modules
- GPS
- accounting
- advanced pricing
- hidden availability rules
- arbitrary notifications

## Product constraints
- Customer has no login in V1.
- Owner has one business-admin account in V1.
- Pending requests do not consume inventory.
- Owner confirmation is the inventory-commit point.
- Customer chooses a model, not a physical vehicle.
- Pricing is model-level.
- Customer status is via unguessable token URL.
- Registration/internal physical identifiers are not part of normal customer flow.

## Implementation discipline
- Never trust frontend availability; re-check on server.
- Confirmation must be transactional.
- Keep business rules in backend/domain services.
- Provide loading, error and empty states.
- Use supplied assets; do not fetch random stock images or generate arbitrary brand assets during coding.
- Do not hard-code demo business data into components; use the seed/mock data layer.
- Keep third-party integrations behind adapters/services.

## UI discipline
- Follow `docs/design/01-design-system.md` and screen specs.
- The public website should feel like a premium local-business site.
- The owner UI should be operational and uncluttered.
- Preserve desktop/tablet/mobile behaviour.

## Change protocol
If a new requirement conflicts with a frozen requirement, do not silently change the frozen requirement. Document the conflict and stop at the smallest sensible boundary.
