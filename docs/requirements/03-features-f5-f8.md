# V1 Requirements — F5 to F8

Status: PHASE 1 FROZEN REQUIREMENTS

## F5 — Owner Dashboard, Calendar & Reports

### Primary navigation
- Dashboard
- Bookings
- Calendar
- Fleet
- Settings

Reports/export can be a section/action inside the dashboard rather than a major top-level module.

### Dashboard
Prioritize actionable information:
- Pending requests
- Today's pickups
- Today's returns
- Ongoing rentals
- Available fleet summary
- Upcoming schedule

No profit/loss or accounting metrics.

### Booking management
Filters:
- All
- Pending
- Confirmed
- Ongoing
- Completed
- Cancelled
- Rejected

Search by:
- Customer name
- Phone
- Booking ID/reference
- Vehicle/model

Actions depend on status:
- Pending: view, modify requested schedule, confirm, reject
- Confirmed: view, modify confirmed schedule, reassign physical vehicle, cancel
- Ongoing: view, modify return timing where appropriate, complete
- Completed: view; feedback/review communication may be triggered
- Rejected/cancelled: view history

### Offline booking
Owner can create an offline/phone/walk-in booking with:
- customer name
- phone
- model
- pickup date/time
- return date/time

Submit directly as a confirmed booking after server-side availability validation.

### Calendar
- Week view is primary.
- Day view is available when a date contains many events.
- Month navigation can be used for navigation/context.
- Support multiple events in the same day.
- Show booking spans with pickup/return times.
- Show vehicle blocks and business closures.
- Clicking an event opens the corresponding details/actions.
- Calendar is a view of backend state; it is not a separate availability engine.

### Availability shortcuts
- Add Booking
- Block Vehicle
- Close Business

### Fleet view
Show model-level fleet summary and drill into physical vehicles.
Do not duplicate all vehicle-management functions in the dashboard home.

### Vehicle block
Owner selects physical vehicle + start/end + optional reason.
Conflict with confirmed booking must be blocked/warned.

### Business closure
Owner selects start/end + optional reason. Applies to all vehicles.

### Reassignment
Owner can replace the currently assigned physical vehicle when necessary, provided the replacement is eligible for the confirmed interval.

### Reports & export
V1 includes:
- filter bookings by date range
- filter by status
- filter by vehicle/model
- view booking counts/summary
- export operational booking records as CSV

CSV should contain useful operational fields only. Do not export secrets, tokens or unrelated internal technical data.
No separate calendar-report generator.
No financial/accounting reports.

## F6 — Communication & WhatsApp

### Default low-cost mode
- Website/dashboard is source of truth.
- Customer can use normal WhatsApp click-to-chat to contact business.
- Prefilled enquiry/confirmation messages can be generated as WhatsApp links.
- No API/automation is required for core booking functionality.
- No separate WhatsApp number is required.

### Optional automated mode
When client chooses WhatsApp Business Platform/API automation:
- Client owns the business WhatsApp/API setup.
- Third-party/Meta/BSP charges are client responsibility.
- Our code should keep WhatsApp behind a notification service abstraction.

### Meaningful events
Customer-facing:
- request acknowledgement
- booking confirmation
- rejection
- cancellation
- completion/thank-you
- feedback/Google review prompt

Owner-facing:
- new booking request notification is useful but optional; dashboard is primary.

### Asynchronous workflow
Never assume confirmation is immediate.
Customer can submit a request and leave the site.
Owner contacts customer later via phone/WhatsApp, discusses/changes schedule if required, then confirms in dashboard.

### Customer status without login
A booking submission generates:
- friendly booking reference
- private status URL with unguessable access token
The customer can revisit the status page without an account.

## F7 — Business Policies & Website Content

Editable business content:
- About
- Why choose us
- Services
- FAQs
- Contact information
- Google review link

Rental policy content may include:
- cancellation
- late return
- early return
- fuel
- kilometre rules
- eligibility
- pickup/return instructions
- other conditions

Policies are primarily informational in V1. Do not implement automated penalties/fees/refunds.

Make clear that actual published policy content belongs to the client and should reflect their real practices.

## F8 — Authentication & Security

### Authentication
- One business admin account in V1.
- Secure authentication and session management [TECHNICAL DESIGN REQUIRED: HTTP-only session cookies vs signed tokens to be decided in Phase 2].
- Login/logout.
- Password change/reset.
- No customer authentication.
- Employee/staff roles are out of scope.

### Authorization
All owner APIs require authenticated business-admin access.
Never rely on frontend-only route/button hiding.

### Security requirements
- HTTPS in production
- secure authentication/session handling
- password hashing
- server-side validation
- rate limiting on sensitive/public abuse-prone endpoints
- secrets in environment variables
- no keys/secrets in frontend bundle
- business-level data isolation
- customer data access protection

### Booking integrity
Server must re-check eligibility at confirmation time.
Confirmation should be transactional so assignment/status/availability changes cannot partially apply.

### Customer privacy
Customer data is private business data.
Do not expose another customer's booking through a guessed URL/reference.
Private status URLs require high-entropy secret tokens.

### Lightweight history
Store timestamps/state transitions for important booking events. No full audit-dashboard is required.
