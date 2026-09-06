# MASTER BOB PROMPT — Rental Platform V1

## 0. Role

You are the implementation engineer for an already-designed product.

Your job is to **implement the existing product specification**, not redesign the product or invent additional functionality.

The repository documentation is the source of truth.

Before changing application code, read the relevant files under:

- `docs/requirements/`
- `docs/architecture/`
- `docs/database/`
- `docs/api/`
- `docs/frontend/`
- `docs/design/`
- `docs/decisions/`
- `docs/final-review/`
- `docs/testing/`
- `docs/agent/`
- `data/`
- `assets/`

Also read:

- `README.md`
- `DOC-MAP.md`
- `assets/ASSET-MANIFEST.md`

Do not start coding until you understand the repository structure and the V1 boundaries.

---

# 1. Product

Product name for the prototype/demo: **DriveNest**.

Product type:

> Responsive full-stack rental-business website + lightweight owner booking/availability management system.

Initial target:

> Small local rental businesses in Coimbatore/India.

The customer-facing application should feel like a **real business website**, not an admin application.

The owner-facing application is a lightweight operational dashboard for booking requests, fleet availability and scheduling.

This is NOT a Zoomcar/Revv clone and NOT a full rental ERP.

---

# 2. V1 Product Goal

The product must help a small rental business:

1. Present its business professionally online.
2. Show its rental fleet/models.
3. Let customers search by requested pickup/return date and time.
4. Show which vehicle models are available for the requested period.
5. Let a customer submit a booking request without creating an account.
6. Let the owner review and manage requests.
7. Let the owner confirm/reject/modify requests.
8. Automatically calculate availability from confirmed bookings and operational blocks.
9. Let the owner manage physical vehicles internally.
10. Let the owner view bookings through a dashboard and calendar.
11. Let the owner add bookings received by phone/walk-in.
12. Provide basic booking reports/CSV export.
13. Support WhatsApp as a communication channel without making WhatsApp automation mandatory.

---

# 3. Hard V1 Boundaries

Do NOT build these unless explicitly requested later:

- Online payments
- KYC/document verification
- Aadhaar/licence upload
- Digital rental agreement
- Profit/loss/accounting
- Partner revenue-share calculations
- Employee/staff roles
- Advanced RBAC
- GPS/vehicle tracking
- Vehicle maintenance module
- Insurance tracking
- Damage management
- Automated penalties
- Advanced pricing engine
- Customer login/accounts
- Native Android/iOS app
- In-app chat
- Full CRM
- Multi-branch management
- Enterprise SSO
- MFA
- Sophisticated analytics dashboard
- Guaranteed SEO rankings
- Large SEO content system

Do not add “helpful” extra modules simply because they are technically possible.

---

# 4. Core Domain Model

## 4.1 Vehicle Model vs Physical Vehicle

This distinction is mandatory.

### Vehicle Model
The customer-facing rental offering.

Examples:

- Maruti Swift
- Maruti Baleno
- Hyundai Creta
- Hyundai i20
- Brezza

A model contains common information such as:

- name
- brand
- model name
- category
- fuel type
- transmission
- seats
- default/base price
- model/default images

### Physical Vehicle

An actual unit owned or managed by the business.

Example:

- Swift Car 1
- Swift Car 2
- Swift Car 3

Physical vehicle data can include:

- internal vehicle identifier
- vehicle model reference
- model year
- registration number/internal operational details
- active/inactive state
- optional actual photos

The customer normally selects the **vehicle model**, not a physical vehicle.

The customer must not be forced to compare “Swift 2025” vs “Swift 2026”.

---

# 5. Pricing Rule

Default pricing belongs to the **Vehicle Model**, not each physical vehicle.

Example:

`Swift = ₹1,500/day`

All physical Swift vehicles use that price by default.

Do not create a customer workflow that requires separate pricing for each physical car.

An implementation may leave room for a future individual-vehicle price override, but V1 UI should not expose unnecessary complexity.

Do not tie price automatically to model year.

---

# 6. Image Rules

The product must not invent random vehicle imagery during implementation.

Use repository assets and the asset manifest.

Image strategy:

### Model-level images
Generic/model reference images.

### Physical-vehicle images
Optional actual photos of the business's physical vehicles.

Customer-facing display rule:

> Show available real fleet photos + generic/model photos.

Do not imply that a displayed real vehicle photo is guaranteed to be the exact physical vehicle assigned to the booking.

If a physical vehicle has no actual photo, generic/model images may be used.

Do not duplicate the same generic model image into every physical-vehicle record.

The database should store image metadata/references; image files belong in appropriate storage.

---

# 7. Customer Booking Rules

## 7.1 No customer account

Customers do NOT create accounts or sign in.

A booking request requires only the necessary contact/request information.

Minimum customer information:

- name
- mobile number

Optional:

- email
- customer note/message

Do not collect KYC or payment information in V1.

---

## 7.2 Search

Homepage search accepts:

- pickup date
- pickup time
- return date
- return time
- optional vehicle/model selection

Vehicle/model selection is optional.

Default can be:

`Any car`

V1 does not support a multi-model preference such as “any automatic under ₹2,000”. Keep that for later.

---

## 7.3 Search result availability

Availability is calculated for the **entire requested interval**.

If a model has no physical vehicle available for the full requested period, that model is not available.

V1 default behavior:

> Show available models only.

Optional “show unavailable” behavior may be added later; do not make it required for V1.

Search result should display model-level availability, e.g.:

- `Swift`
- `₹1,500/day`
- `2 cars available`

Do not expose physical registration numbers.

---

# 8. Booking Lifecycle

Use these statuses:

- `PENDING`
- `CONFIRMED`
- `ONGOING`
- `COMPLETED`
- `REJECTED`
- `CANCELLED`

Lifecycle:

`PENDING -> CONFIRMED -> ONGOING -> COMPLETED`

Alternative terminal paths:

`PENDING -> REJECTED`

`CONFIRMED -> CANCELLED`

Only the owner moves a booking into an accepted/real operational state.

---

# 9. Pending Request Rule

A customer request creates a `PENDING` booking request.

Pending requests:

- DO NOT consume inventory.
- DO NOT reduce availability.
- MAY overlap another pending request.
- Are reviewed by the owner asynchronously.
- Are not assumed to be confirmed immediately.

There is no guarantee that the owner responds in one second or immediately.

---

# 10. Owner Confirmation Flow

When the owner reviews a pending request:

1. Owner sees requested model and requested pickup/return date/time.
2. Owner may discuss the request with the customer offline using phone/WhatsApp.
3. Owner may modify the requested pickup/return date/time before confirmation.
4. System identifies an available physical vehicle.
5. System suggests an available physical vehicle.
6. Owner can accept the suggestion or choose another currently available physical vehicle.
7. Owner confirms the booking.

Confirmation must be treated as one atomic server-side operation:

- revalidate the request
- revalidate time interval
- revalidate business closure
- revalidate vehicle block
- revalidate conflicting confirmed bookings
- assign physical vehicle
- set booking to CONFIRMED
- update effective availability
- trigger the communication action/event

Never trust stale availability data from the browser.

---

# 11. Physical Vehicle Assignment

Customers select a vehicle model.

The system internally allocates an individual physical vehicle when the owner confirms.

The assigned physical vehicle is an internal operational detail.

Do NOT expose registration numbers as part of the default customer booking flow.

Do NOT require the customer to choose physical Vehicle A/B/C.

---

# 12. Vehicle Reassignment

A confirmed booking may need to be moved to another physical vehicle if the original allocated vehicle becomes unusable.

Example:

- breakdown
- operational issue
- unexpected unavailability

Owner must be able to reassign.

Reassignment must revalidate availability for the replacement physical vehicle before saving.

The booking remains the same booking; only the internal assignment changes.

Customer-facing communication does not need to expose registration details.

---

# 13. Date and Time Rules

Booking must store pickup and return **date + time**.

Do not use only dates.

Do NOT invent a universal preparation/buffer period.

Exact confirmed pickup/return time is the source of truth.

A vehicle remains occupied through the confirmed return time.

Any practical business buffer is handled by the owner through the confirmed timing.

Do not build automatic penalty calculations in V1.

---

# 14. Offline / Phone / Walk-in Booking

Owner must be able to add a booking received outside the website.

Typical flow:

- select model
- select date/time
- customer name
- phone
- owner confirms

Offline bookings participate in the same availability system as website-confirmed bookings.

Do not create a separate booking system for offline bookings.

---

# 15. Vehicle Blocks

Owner can temporarily block a specific physical vehicle.

Example:

- service
- repair
- personal use
- other operational reason

A vehicle block contains:

- physical vehicle
- start date/time
- end date/time
- optional reason

A vehicle block is NOT a booking.

It reduces that physical vehicle's availability during the blocked interval.

A vehicle block must not silently override a conflicting confirmed booking.

If there is a conflict, surface the conflict and require the owner to resolve the confirmed booking separately.

---

# 16. Business Closure

Owner can close the entire business for a date/time range.

Examples:

- holiday
- temporary closure
- vacation
- operational shutdown

Business closure affects availability for all vehicles.

Do not require the owner to block each vehicle separately.

A business closure must NOT silently override existing confirmed bookings.

If it conflicts with confirmed bookings, surface the conflict and require the owner to resolve those bookings.

---

# 17. Availability Formula

Conceptually a physical vehicle is available for an interval only when:

- the physical vehicle is active
- there is no overlapping confirmed booking
- there is no overlapping vehicle block
- the business is not closed

Pending requests do not consume inventory.

Completed/cancelled bookings release inventory.

---

# 18. Booking Modification

Before confirmation:

- owner can modify requested pickup/return date/time.

After confirmation:

- owner can modify confirmed timing and internal assignment.
- all changes must re-check availability before saving.

Do not build a customer self-service booking-edit system in V1.

---

# 19. Cancellation

Cancellation is owner-controlled in V1.

The owner may cancel a confirmed booking.

Cancellation should release the assigned vehicle availability.

Do not build automated refunds or financial workflows.

Business-specific cancellation policy is informational/configurable content, not an automated refund engine.

---

# 20. Customer Booking Status

After submitting a request, the customer receives:

- human-readable booking reference
- immediate “request received” confirmation page
- private status link

The customer does not need an account.

The status link must use an unguessable secure access token. Do not use predictable sequential IDs as the authorization mechanism.

Customer status should reflect current booking state.

Example:

`PENDING -> Awaiting confirmation`

Later:

`CONFIRMED -> Booking confirmed`

The owner may take minutes/hours/etc. to act. The UI must not assume instant confirmation.

---

# 21. Public Website

The public application should feel like a premium local business website.

Main journey:

`Homepage -> Search -> Available Models -> Vehicle Details -> Request Booking -> Request Received/Status`

Homepage should prominently combine:

### Business showcase
- brand/hero
- why choose us
- fleet highlights
- trust/reviews
- how it works
- location/contact
- relevant business information

### Booking search
- pickup date/time
- return date/time
- optional vehicle/model
- Search Cars CTA

Do not turn the homepage into a generic admin-style UI.

---

# 22. Vehicle Details Page

Show useful model-level information:

- model/brand
- category
- fuel type
- transmission
- seats
- price
- image gallery
- selected rental period
- availability
- relevant business policies/information
- WhatsApp/call CTA

Do not expose internal registration numbers.

Do not imply that the displayed physical vehicle is guaranteed to be assigned.

---

# 23. Booking Request Page

Pre-fill selected date/time and model.

Collect:

- name
- phone
- optional email
- optional message

Display:

- selected model
- requested pickup/return
- rate
- concise policy acknowledgement
- submit request CTA

Do not present the rental rate as a final invoice/quote when V1 has not implemented all possible charges.

---

# 24. Owner Dashboard

Primary owner areas:

- Dashboard
- Bookings
- Calendar
- Fleet
- Settings / Business configuration

Dashboard should prioritize:

1. action required
2. today's activity
3. fleet status
4. upcoming schedule

Useful summary cards may include:

- pending requests
- today's pickups
- today's returns
- ongoing rentals
- available cars

Do not add revenue/profit dashboards.

---

# 25. Bookings UI

Support:

- all
- pending
- confirmed
- ongoing
- completed
- cancelled
- rejected

Search by:

- customer name
- phone
- booking reference
- model/vehicle

Booking details should make important actions easy but prevent accidental destructive operations.

---

# 26. Calendar

Primary view:

- week view

Support:

- day view for crowded days
- month navigation

Calendar must support multiple events per day.

Possible event types:

- booking period
- pickup
- return
- vehicle block
- business closure

When a day is crowded, show a compact “more” indicator and allow drill-down into the day's events.

Clicking an event opens the relevant existing details/actions.

Do not make the calendar a separate business logic engine; backend availability remains the source of truth.

---

# 27. Fleet UI

Show vehicle models first, then physical vehicles.

Example:

`Swift`
- 3 cars
- 2 active
- 1 inactive

Inside the model:

- physical vehicle records
- optional actual photos
- active/inactive state
- view bookings
- block/unblock

Do not build maintenance management.

---

# 28. Reports

Reports belong inside the owner dashboard.

V1 reports are operational only.

Support:

- date range
- booking status
- model/vehicle filter
- booking summary
- booking counts

Provide CSV export.

CSV is sufficient for V1.

Do not build:

- PDF reporting
- financial reporting
- accounting
- profit/loss
- complex BI dashboards

CSV must not contain secrets, auth tokens, internal access tokens or unnecessary security data.

---

# 29. Communication

Website/dashboard = source of truth.

WhatsApp = communication channel.

### Standard V1
Use the owner's existing WhatsApp where possible.

Normal click-to-chat/deep-link flow may include a prefilled message.

No separate phone number is required.

No WhatsApp API subscription is mandatory.

### Automated WhatsApp
Optional later/integration layer.

Do not make the booking system dependent on automated WhatsApp.

Customer-facing event communications can include:

- request received
- booking confirmed
- booking rejected
- booking cancelled
- booking completed / feedback/review

Owner communication can include:

- new request notification

Owner dashboard remains the primary place to work.

---

# 30. WhatsApp Cost Rule

Do not assume the product pays WhatsApp/BSP/API charges.

Automated WhatsApp is a client-paid third-party capability when enabled.

Keep the notification provider behind an abstraction/interface so Meta/BSP/provider can be changed later without rewriting booking logic.

---

# 31. Completion / Review Flow

When the owner marks a rental as completed:

- booking status becomes COMPLETED
- physical vehicle is released for future availability
- completion communication may be triggered
- feedback/Google review link may be presented

Do not build a proprietary review platform.

---

# 32. Business Configuration

The business can configure:

### Identity
- business name
- logo
- description

### Contact
- phone
- WhatsApp
- email

### Location
- address
- city
- map link

### Hours
- business hours per day

### Content
- about
- why choose us
- services
- FAQs
- basic rental policies
- pickup/return instructions

### Rental basics
- default rental period/unit
- basic pickup information

Do not build multi-branch configuration in V1.

---

# 33. Policies

Policies are informational content.

Possible policy fields:

- minimum rental duration
- cancellation policy
- late return policy
- early return policy
- fuel policy
- kilometre policy
- eligibility/age requirement
- pickup/return instructions
- other notes

The system displays these policies.

Do NOT turn them into a complex penalty/refund/accounting engine.

---

# 34. Authentication & Security

V1:

- one business admin account
- login
- logout
- password reset/change
- owner dashboard protected

Customers do not have accounts.

Backend authorization is mandatory.

Frontend hiding a button is NOT security.

APIs must verify:

- authenticated user
- business ownership/tenant context
- permission to perform the requested operation

Customer booking endpoint is public and therefore requires:

- server-side validation
- rate limiting / abuse protection
- input validation
- safe error handling

Passwords must be hashed securely.

Secrets must only exist in environment/server configuration.

Never expose secrets in frontend bundles.

Use HTTPS in production.

---

# 35. Booking Integrity / Transactions

Critical operations must be handled server-side and transactionally where appropriate.

At minimum:

### Confirm booking
Validate:
- booking state
- requested/confirmed interval
- business closure
- vehicle active state
- vehicle block
- conflicting confirmed bookings

Then atomically:
- assign physical vehicle
- set confirmed state
- persist confirmed timing
- reserve effective availability

### Reassignment
Revalidate replacement vehicle before changing assignment.

### Modification
Revalidate the resulting schedule before committing.

Never rely only on previously loaded browser state.

---

# 36. UI / Visual Direction

Prototype brand:

**DriveNest**

Style:

- premium
- modern
- clean
- trustworthy
- local-business friendly
- visually interactive without being gimmicky

Use the repository design docs as the authority.

Use the provided:

- logo assets
- car assets
- mockups
- theme board
- icon set
- image registry

Do not replace them with random AI/stock images unless explicitly instructed.

Interactive UI should include thoughtful:

- hover states
- transitions
- cards
- booking search interaction
- availability states
- modal/drawer where appropriate
- calendar interactions
- responsive navigation
- microinteractions

But do not use excessive animations that reduce usability or performance.

---

# 37. Responsive Requirements

One web application.

Must work on:

- mobile
- tablet
- desktop

No separate mobile application.

The owner dashboard must be usable on a phone.

Test:

- customer flow on mobile
- owner flow on mobile
- calendar at narrow widths
- booking forms
- tables/lists
- navigation

---

# 38. Frontend Implementation Rules

Use reusable components.

Keep business logic out of presentation-only components.

Use typed data.

Do not duplicate business rules across multiple screens.

Keep API access in organized service/data layers.

Use clear loading, empty and error states.

Do not fake backend behavior in production code once integration begins.

For Phase 1 UI implementation, mock data is allowed and expected.

---

# 39. Backend Implementation Rules

Node.js + Express.

Use a clear separation such as:

- routes
- controllers
- services
- validation
- data access
- domain/business logic
- utilities

Availability logic must live server-side.

Validation must exist server-side even if frontend validation exists.

Return consistent errors using documented error codes/HTTP semantics.

Do not put database credentials in source files.

---

# 40. Database

PostgreSQL + Prisma.

Use normalized relational design.

The expected conceptual relationships include:

- business
- admin/user
- vehicle model
- physical vehicle
- vehicle image/model image references
- booking
- customer
- vehicle block
- business closure
- booking/audit/event timestamps as appropriate

Use the existing database documentation and Prisma draft as the primary reference.

Do not redesign the schema without first checking the documented model and decisions.

---

# 41. Partner Fleet

There is a real-world future scenario where a rental operator may obtain cars from partner owners under a 60/40 arrangement.

This is intentionally NOT part of V1.

Do not build partner settlement, partner dashboards, revenue share or partner availability management now.

The architecture should not make future partner support impossible, but do not implement it.

---

# 42. Deployment Philosophy

Production infrastructure should be:

- commercially usable
- low-cost for small local businesses
- secure enough for the application
- maintainable by a small team

Client should own production accounts/domain where practical.

Do not hard-code provider-specific assumptions throughout the application.

Exact provider selection can remain an infrastructure decision at deployment time.

---

# 43. Cost Philosophy

Target market:

> Small local Indian businesses.

Do not architect the product around expensive enterprise services by default.

Avoid unnecessary recurring third-party subscriptions.

WhatsApp API automation is optional.

Analytics should use an established low/no-cost solution for basic site analytics, while booking metrics remain application data.

---

# 44. SEO

Implement practical local-business SEO foundations:

- metadata
- titles/descriptions
- headings
- clean URLs
- sitemap
- robots.txt
- canonical handling where appropriate
- Open Graph
- structured data where appropriate
- mobile/performance basics
- Google Search Console readiness
- Google Analytics readiness
- local business information

Do not promise ranking guarantees.

Do not mass-generate low-value location pages.

---

# 45. Analytics

Do not build a custom analytics platform in V1.

Use a free established analytics solution for website traffic/behaviour where appropriate.

Application database remains the source of truth for:

- booking requests
- confirmed bookings
- other core operational metrics

Potential conversion events:

- search performed
- vehicle viewed
- booking request submitted

---

# 46. Production / Launch

Before production:

- test customer flow
- test owner flow
- test booking edge cases
- test availability
- test mobile
- test calendar
- test auth
- test public/private boundaries
- test errors
- test database migrations
- test storage
- test domain
- test HTTPS
- test analytics
- test SEO basics
- verify backups/recovery plan
- verify client ownership/handover information

---

# 47. Testing Priorities

At minimum test:

1. multiple pending requests for overlapping dates
2. confirmation consuming one physical vehicle
3. remaining physical vehicles staying available
4. no physical vehicles remaining
5. rejected request not consuming inventory
6. cancelled confirmed booking releasing inventory
7. offline booking consuming inventory
8. vehicle block reducing availability
9. business closure reducing availability
10. conflicting block rejected/warned
11. confirmed vehicle reassignment
12. timing modification with availability recheck
13. concurrent confirmation conflict
14. secure status token cannot access another booking
15. unauthorized owner API calls fail
16. public booking endpoint abuse/rate limiting
17. multi-event day in calendar
18. CSV export filters

---

# 48. Coding-Agent Behaviour

Do NOT:

- invent new product features
- silently alter frozen business rules
- replace provided assets with random alternatives
- add dependencies without a clear reason
- expose secrets
- create customer authentication
- introduce employee roles
- implement excluded V1 features
- make assumptions that conflict with docs
- hide unresolved contradictions

When a genuine contradiction is found:

1. stop that implementation decision
2. identify the conflicting requirements
3. document the conflict
4. propose the smallest change
5. do not silently redefine the product

Do not repeatedly restate the full specification in every code change.

---

# 49. Implementation Sequence

Build in controlled phases.

## Phase 1 — UI prototype

Use mock data.

Build:

### Customer
- Home
- Search results
- Vehicle details
- Booking request
- Request received
- Booking status

### Owner
- Login
- Dashboard
- Bookings
- Booking details
- Calendar
- Fleet/model list
- Physical vehicle details
- Block vehicle
- Business closure
- Reports/export
- Settings

Focus heavily on visual quality and responsive behavior.

Do not implement live backend behavior yet.

---

## Phase 2 — Data model and backend

Implement:

- Prisma schema
- migrations
- seed/mock data support
- API structure
- validation
- auth
- core booking services

---

## Phase 3 — Availability and booking engine

Implement and test:

- date/time interval logic
- pending vs confirmed semantics
- physical vehicle allocation
- reassignment
- vehicle blocks
- business closure
- offline bookings
- transactional confirmation

This phase deserves careful tests.

---

## Phase 4 — Frontend integration

Replace mock data with real APIs.

Integrate:

- search
- availability
- booking request
- private status page
- owner dashboard
- calendar
- fleet
- reports

---

## Phase 5 — Communication

Implement:

- WhatsApp click-to-chat
- prefilled messages
- notification abstractions
- optional automated integration interfaces
- completion/review flow

---

## Phase 6 — Production preparation

Implement/configure:

- env handling
- production build
- deployment
- storage
- analytics
- SEO
- backups
- security hardening
- launch checks

---

# 50. Asset Rules

Use these repository assets as the authoritative visual source.

Do not create random stock/AI car images when an appropriate repository asset exists.

Use:

- `assets/logos/`
- `assets/cars/`
- `assets/icons/`
- `assets/ui/`
- `assets/mockups/`
- `assets/asset-registry.json`

Reference:

`assets/ASSET-MANIFEST.md`

If an image type is missing, use a deliberate neutral placeholder consistent with the design system and record the gap instead of silently replacing the visual language.

---

# 51. Brand

Use the DriveNest prototype brand consistently.

Primary idea:

> Self Drive • Explore More

Brand tone:

- trustworthy
- modern
- confident
- local
- helpful

Visual direction should align with the repository theme board and design-system documentation.

Do not invent a different brand name.

---

# 52. Final Instruction

Before coding:

1. read the documentation
2. inspect the current repository
3. inspect assets
4. confirm the existing structure
5. implement Phase 1 only
6. keep the implementation incremental and reviewable
7. run validation/tests where relevant
8. report exactly what was changed

Start with the **responsive customer-facing UI prototype** and its shared design system/components.

Do not start by building the whole backend, payment system, WhatsApp API, employee system, or deployment infrastructure.

The product has already been designed.

Your job is to **execute the design faithfully and cleanly**.
