# Database Relationships & Invariants

## Core relationships
```text
Business 1 ──── * VehicleModel
VehicleModel 1 ──── * PhysicalVehicle
VehicleModel 1 ──── * ImageAsset (default/model images)
PhysicalVehicle 1 ──── * ImageAsset (real photos)
VehicleModel 1 ──── * Booking
PhysicalVehicle 1 ──── * Booking (only once assigned)
PhysicalVehicle 1 ──── * VehicleBlock
Business 1 ──── * BusinessClosure
Booking 1 ──── * BookingEvent
Business 1 ──── * AdminUser (V1 may have one)
```

## Invariants
1. `booking.vehicle_model_id` is always present.
2. `booking.assigned_vehicle_id` may be null while PENDING.
3. A CONFIRMED/ONGOING booking must have an assigned physical vehicle.
4. A physical vehicle belongs to exactly one business and one model.
5. Vehicle model price is the V1 rental price source.
6. Generic model images should not be duplicated for every physical vehicle.
7. A PENDING booking does not block inventory.
8. CONFIRMED/ONGOING bookings do block their assigned vehicle for the confirmed interval.
9. A vehicle block blocks its physical vehicle for its interval.
10. A business closure blocks all vehicles for its interval.
11. Vehicle blocks/business closures cannot silently invalidate confirmed bookings.
12. Physical vehicles and vehicle models with historical bookings must not be hard deleted; archival is non-destructive and reversible where dependency rules allow.
13. Customer private status token must be high entropy and never sequential.
14. Confirmation and physical vehicle assignment must be concurrency-safe to prevent double-booking.
