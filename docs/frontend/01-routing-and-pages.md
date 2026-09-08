# Frontend Routes & Page Map

Status: PHASE 1 FROZEN FRONTEND BASELINE (19 Verified Routes)

All routes verified against the actual Next.js 14 App Router implementation in `apps/web/app/`:

## Public routes
```text
/                         Home / landing (HeroSearch, Featured, TrustStrip, Reviews, FAQ)
/search                   Search results & date-filtered availability catalog
/models/[modelId]         Vehicle model details & showcase
/request/[modelId]        Booking request form
/request/success          Request received confirmation
/status/[token]           Private tokenized booking status & WhatsApp connect
/about                    About business
/contact                  Contact info, map location, business hours
/faq                      Frequently Asked Questions
/policies                 Rental terms, deposits & cancellation policies
```

## Owner routes
```text
/owner/login
/owner                    Operations Dashboard
/owner/bookings           Booking requests list & filterable management
/owner/bookings/[bookingId] Booking detail & action workspace (Confirm, Reject, Reassign)
/owner/calendar           Fleet calendar & timeline schedule view
/owner/fleet              Fleet catalog (Models & Physical Vehicles list)
/owner/fleet/models/[modelId] Model editor & specs
/owner/fleet/vehicles/[vehicleId] Physical vehicle editor & maintenance blocks
/owner/reports            Filterable booking reports & CSV export
/owner/settings           Business profile, location, & operating hours
```

## Route behaviour
- Public pages are accessible without login except private status route, which requires a secret token.
- Owner routes redirect unauthenticated users to `/owner/login`.
- Owner route data is fetched from authenticated APIs.
- Do not expose server secrets through page props/client bundles.
