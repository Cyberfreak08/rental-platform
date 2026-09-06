# ADR-005 — Customer Without Account

## Decision
No customer sign-in in V1. Use booking reference + unguessable private status token.

## Reason
Reducing customer friction is important for local enquiries; the owner can communicate by phone/WhatsApp after receiving the request.

## Consequences
Private status URLs must be high entropy and protected. Public reference alone is not an authorization credential.
