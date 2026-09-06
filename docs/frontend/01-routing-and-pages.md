# Frontend Routes & Page Map

## Public routes
```text
/                         Home / landing
/search                   Search results
/models/:modelId          Vehicle/model details
/request/:modelId         Booking request form
/request/success          Request received confirmation
/status/:token            Private booking status
/about                    About
/contact                  Contact/location
/faq                      FAQ
/policies                 Rental policies
```

## Owner routes
```text
/owner/login
/owner
/owner/bookings
/owner/bookings/:bookingId
/owner/calendar
/owner/fleet
/owner/fleet/models/:modelId
/owner/fleet/vehicles/:vehicleId
/owner/reports
/owner/settings
```

## Route behaviour
- Public pages are accessible without login except private status route, which requires a secret token.
- Owner routes redirect unauthenticated users to `/owner/login`.
- Owner route data is fetched from authenticated APIs.
- Do not expose server secrets through page props/client bundles.
