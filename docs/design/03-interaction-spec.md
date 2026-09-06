# Interaction & UX Rules

## Booking request
After submit:
- disable duplicate submission while request is processing
- show progress
- show success only after server success
- surface validation errors clearly

## Owner confirmation
- show final dates/times prominently
- show suggested eligible vehicle
- allow owner override
- confirmation is a deliberate primary action
- after success refresh booking, availability and calendar state

## Conflicts
When vehicle is no longer available:
- show clear conflict message
- do not silently swap to a different model
- offer eligible replacement physical vehicles to owner

## Customer unavailable model
If requested model has no eligible vehicle:
- state unavailable for selected period
- optionally show available alternatives
- require customer to choose an alternative; never silently change the request

## Cancellation/reassignment
Use confirmation dialogs only for destructive/high-impact actions.

## Loading/error states
Every API-backed surface needs loading, empty and error states.
