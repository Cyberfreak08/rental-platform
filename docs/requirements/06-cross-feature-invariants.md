# Cross-Feature Invariants — Final V1 Preflight

These rules have priority when multiple features interact.

## Fleet vs booking
- Customer selects a Vehicle Model, never a physical vehicle in the default V1 journey.
- Every confirmed/ongoing booking must have one assigned PhysicalVehicle.
- A physical vehicle belongs to exactly one business and one VehicleModel.

## Pricing
- V1 customer price comes from VehicleModel.pricePerDay.
- Physical vehicle year does not change price.
- No per-car price UI in V1.

## Images
- Generic model images belong to VehicleModel.
- Real fleet images optionally belong to PhysicalVehicle.
- Public gallery may combine both.
- Images do not guarantee assignment of the pictured car.

## Availability
- Availability is evaluated for the complete requested interval.
- Pending requests do not consume inventory.
- Confirmed and ongoing bookings consume their assigned physical vehicle.
- Inactive physical vehicles never qualify for availability.
- Vehicle blocks remove only the blocked physical vehicle from eligibility.
- Business closure removes all vehicles from eligibility.
- No universal buffer is created by the system.

## Confirmation
- Owner reviews asynchronously; there is no instant-confirmation assumption.
- Owner may change requested schedule before confirmation.
- Server re-checks availability immediately before committing confirmation.
- Confirmation assigns a physical vehicle and changes status atomically.
- Notification is a post-commit side effect.

## Post-confirmation
- Owner can reassign a booking if the originally assigned vehicle becomes unusable.
- Reassignment must validate the replacement vehicle for the same confirmed interval.
- Owner can modify confirmed schedule only after a fresh availability check.
- Owner completion is explicit; do not auto-complete solely because time passed.

## Customer privacy
- No customer account.
- Private status access uses a high-entropy token.
- Friendly reference is not a secret.
- Public status endpoint exposes only safe customer-facing fields.

## Communication
- Booking remains valid even if WhatsApp is unavailable.
- Default low-cost flow uses normal WhatsApp click-to-chat/prefilled messages.
- Automated WhatsApp is optional and external-cost-bearing.

## Reporting
- Calendar is an operational view.
- Reports are filtered booking data and CSV export.
- No calendar-specific report generator.
- No accounting/profit/loss reporting.

## Partner fleet
Partner vehicles and 60/40 settlement are future scope. V1 must not add partner-specific UI or financial calculations unless explicitly reopened.

## F9 provider selection
Exact hosting/provider plans remain an implementation/deployment choice. Architecture should preserve provider portability.
