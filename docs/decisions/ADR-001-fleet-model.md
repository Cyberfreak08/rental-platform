# ADR-001 — Vehicle Model vs Physical Vehicle

## Decision
Use two levels:
- Vehicle Model: customer-facing product/option.
- Physical Vehicle: actual asset in the managed fleet.

## Reason
A model can have multiple cars, each independently active/inactive and bookable.
Customers normally choose the model, not the physical registration/unit.

## Consequences
- Availability must be calculated at physical-vehicle level.
- Pricing is model-level in V1.
- Real photos attach to physical vehicles; generic images attach to model.
