# Dummy Data Package

All data is fictional and safe for local development/testing.

## Dataset groups
- business
- business hours
- vehicle models
- physical vehicles
- model/default images
- real fleet images
- bookings across statuses
- vehicle blocks
- business closures
- FAQs/policies
- reviews
- notification message copy

## Development rule
Dummy data must exercise both happy paths and edge cases: multiple physical cars per model, active/inactive vehicles, multiple bookings in one day, overlapping pending requests, confirmed/ongoing/completed/cancelled/rejected bookings, vehicle blocks, closures, reassignment and unavailable-model alternatives.

See `../../data/seed-data.json` for the machine-readable baseline.
