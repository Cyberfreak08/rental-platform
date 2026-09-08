# V1 Requirements — F1 to F4

Status: PHASE 1 FROZEN REQUIREMENTS

## F1 — Business Setup

One business location is sufficient in V1.

### Business identity
- Business name
- Logo
- Business description

### Contact
- Primary phone
- WhatsApp number
- Email

### Location
- Address
- City
- Google Maps/location link

### Business hours
- Day-wise opening/closing time

### Public content
- About
- Why choose us
- FAQ content
- Basic rental policies/notes

### Rental configuration
- Default rental unit/period
- Basic pickup/return information
- Review link (Google review destination)

## F2 — Fleet / Vehicle Management

### Vehicle model
Customer-facing concept. Examples: Swift, i20, Creta.

Fields:
- Brand
- Model/name
- Category
- Fuel type
- Transmission
- Seats
- Default price/day
- Public description
- Model/default images

### Physical vehicle
Actual vehicle in the business-controlled fleet.

Fields:
- Internal vehicle identifier
- Model association
- Model year (internal/owner information)
- Registration/internal identifier (internal only; not normal customer UI)
- Active/inactive state
- Optional real photos
- Optional internal notes

### Relationship
```text
Vehicle Model
  ├── Physical Vehicle A
  ├── Physical Vehicle B
  └── Physical Vehicle C
```

### Pricing
Pricing belongs to the vehicle model by default. V1 should not expose per-physical-vehicle price overrides.

### Images
- Model-level generic/default images are stored once.
- Individual physical vehicles may have real photographs.
- Public gallery can combine available real fleet photos and generic model images.
- Do not imply that a pictured physical vehicle is guaranteed to be assigned.
- No duplicated generic image copies per physical vehicle.

### Fleet status & Operational States
- **Active**: Available for customer booking.
- **Inactive**: Temporarily paused/unlisted from customer search, but part of active fleet.
- **Maintenance**: Represented through operational vehicle blocks (`VehicleBlock`).
- **Archived**: Reversibly retired from active fleet to preserve historical bookings and audit trails.

Destructive physical deletion of vehicles or models with historical bookings is strictly prohibited.
[TECHNICAL DESIGN REQUIRED: Exact database persistence mechanism for operational states in Phase 2].

## F3 — Availability & Booking

### Customer request data
- Vehicle model
- Pickup date/time
- Return date/time
- Name
- Phone
- Optional email
- Optional message

### Request lifecycle
```text
PENDING
  ├── CONFIRMED
  │     ├── ONGOING
  │     │     └── COMPLETED
  │     └── CANCELLED
  └── REJECTED
```

### Rules
- PENDING does not consume inventory.
- Customer may submit a request even if another request for the same model/period is pending.
- Owner reviews the request and can discuss changes offline.
- Owner can modify requested schedule before confirmation.
- System suggests an available physical vehicle.
- Owner can accept the suggestion or choose another eligible physical vehicle.
- Confirmation assigns a physical vehicle, updates availability, and triggers the configured communication action.
- Confirmed booking's date/time is the authoritative schedule.
- Original requested date/time must be retained for reference.
- Owner can later reassign a confirmed booking to another eligible physical vehicle if necessary.
- Registration number remains internal and is not required in the customer workflow.
- Owner can create an offline phone/walk-in booking, which is treated as a confirmed booking after availability validation.

### Status meaning
- PENDING: received but not committed.
- CONFIRMED: owner accepted and one physical vehicle is allocated.
- ONGOING: pickup has occurred and the rental is in progress.
- COMPLETED: owner marks the rental returned/finished.
- REJECTED: owner declines a pending request.
- CANCELLED: previously confirmed booking will not proceed.

### Availability calculation
A physical vehicle is eligible for a requested interval when:
```text
ACTIVE
AND no overlapping CONFIRMED/ONGOING booking
AND no overlapping vehicle block
AND business is open for the requested interval
```

Availability displayed to the customer is model-level, for example `2 cars available`.
The requested model must have at least one eligible physical vehicle for the entire requested interval to be returned as available.

### No universal buffer
Do not automatically add cleaning/handover buffer time. The owner controls practical turnaround when confirming future bookings.

### Vehicle block
Owner can block a physical vehicle for a date/time range.
- Not a booking.
- Affects only that physical vehicle.
- Optional reason.
- Must not silently override a confirmed booking.
- If conflict exists with a confirmed booking, warn/prevent the block.

### Business closure
Owner can close the whole business for a date/time range.
- Applies to all vehicles.
- Does not silently override confirmed bookings.
- Customer searching closed dates is told bookings are unavailable.

## F4 — Customer Website & Booking Experience

### Public journey
```text
Landing page
  ↓
Search
  ↓
Available vehicle models
  ↓
Vehicle/model details
  ↓
Request booking
  ↓
Request received
  ↓
Private booking status link
```

### Homepage
Business website first; prominent search/booking module.

Search inputs:
- Pickup date
- Pickup time
- Return date
- Return time
- Optional model/category; default `Any car`

Primary action: `Search Cars`

Secondary actions:
- View Fleet
- WhatsApp
- Call

### Search results
- Show only models with at least one vehicle available for the complete requested interval by default.
- Unavailable models can be a future optional view/toggle; do not require in V1.
- Show model-level availability count.
- Do not expose physical vehicle IDs/registration numbers.

### Vehicle details
Show:
- model/name
- images
- category/specs
- price/day
- selected dates/times
- availability count
- relevant business policies
- WhatsApp/Call
- Request Booking

### Booking form
Customer does not log in.
Required:
- name
- phone
- pickup/return already selected
Optional:
- email
- message

Do not collect KYC, payment, full identity documents, etc.

### Submission result
Immediately show:
- request received
- booking/reference ID
- requested dates/times
- `PENDING` state
- private status link
- statement that the rental team must review/confirm

Private status link uses an unguessable access token. Friendly reference ID can be separate from the secret token.

### No customer self-service edit in V1
Customer contacts the business for changes. Owner can modify the booking/request in the dashboard.
