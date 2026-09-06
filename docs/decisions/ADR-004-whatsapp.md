# ADR-004 — WhatsApp Strategy

## Decision
Core V1 works without WhatsApp API automation.

Default: use existing business WhatsApp through click-to-chat/prefilled messages.
Optional: automated WhatsApp via a client-owned Business Platform/API setup.

## Reason
Target customers are small local businesses; many use a single phone/number and do not want another recurring tool cost.

## Consequences
- Booking workflow must never depend on WhatsApp delivery.
- Automated message costs are not included in basic maintenance.
