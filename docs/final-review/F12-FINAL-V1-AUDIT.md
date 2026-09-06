# F12 — Final V1 Consistency Audit & Implementation Gate

## Purpose

This document is the final product-level audit before application code is written. It does not add a new product feature. It verifies that the frozen F1–F11 requirements agree with each other and records the rules Bob must treat as authoritative.

## Audit result

**Status: READY FOR UI IMPLEMENTATION**

The frozen V1 requirements are internally consistent after the clarifications recorded below. No additional functional feature is required to begin Phase 1 UI work.

## F1–F11 status

| Feature | Status | Final outcome |
|---|---|---|
| F1 Business Setup | FROZEN | Business identity, contact, one location, hours, basic content/policies and review link |
| F2 Fleet / Vehicle Management | FROZEN | Vehicle Model → Physical Vehicle; model-level pricing; model + real fleet images |
| F3 Availability & Booking | FROZEN | Owner-driven asynchronous confirmation; physical allocation; booking/block/closure availability rules |
| F4 Customer Website & Booking | FROZEN | Responsive public site; search; model selection; no customer login; request + private status link |
| F5 Owner Dashboard | FROZEN | Dashboard, bookings, calendar, fleet, blocks/closures, reports/CSV |
| F6 Communication | FROZEN | Low-cost WhatsApp-first/manual mode; optional automated mode |
| F7 Policies & Content | FROZEN | Informational business policies and editable content; no penalty/accounting engine |
| F8 Authentication & Security | FROZEN | One admin account in V1, secure owner access, server-side authorization |
| F9 Infrastructure & Cost | PROVISIONAL PROVIDER CHOICE | Low-cost commercial deployment; client-owned infrastructure; exact providers finalized at deployment |
| F10 SEO & Local Setup | FROZEN | Technical SEO + local business setup + free analytics/search console baseline |
| F11 Production & Handover | FROZEN | Launch checklist, backups, testing, documentation and client handover |

## Final cross-feature rules

### 1. Product boundary

V1 is a **rental-business website + lightweight booking/availability management system**. It is not a rental ERP, marketplace, accounting system, payment gateway, KYC system, or native mobile app.

### 2. Fleet model

A **Vehicle Model** is what the customer selects (for example, Swift). A **Physical Vehicle** is an individual car managed internally by the business. Multiple physical vehicles can belong to one model.

The customer-facing journey does not ask the customer to select a physical vehicle.

### 3. Pricing

`VehicleModel.pricePerDay` is the V1 customer-facing price source. Vehicle year does not change the default price. Per-physical-vehicle price overrides are excluded from V1 UI.

### 4. Images

Model-level generic/default images are stored once. Physical vehicles may have optional real photographs. Public galleries may combine available real fleet photos with generic model images. Displayed images never guarantee that a specific physical car will be assigned.

### 5. Booking ownership

Customer requests are **not bookings that consume inventory** until the owner confirms them. Owner action is the commitment point.

### 6. Booking lifecycle

```text
PENDING
  ├── CONFIRMED
  │     ├── ONGOING
  │     │     └── COMPLETED
  │     └── CANCELLED
  └── REJECTED
```

No arbitrary reverse transitions should be exposed.

### 7. Requested vs confirmed schedule

The original customer request is retained separately from the confirmed schedule. The owner may adjust the requested pickup/return date/time before confirmation after discussing it with the customer.

Once confirmed, the **confirmed schedule is authoritative**.

### 8. Availability

A physical vehicle qualifies for a model/date-time search only when it is:

- Active;
- free of overlapping Confirmed/Ongoing bookings for the requested interval;
- free of overlapping vehicle blocks; and
- within an open business period.

The entire requested interval must be satisfiable.

### 9. Pending requests

Multiple customers may submit overlapping requests while they are Pending. Pending requests do not reserve or reduce inventory.

### 10. Confirmation transaction

The server must re-check eligibility immediately before confirmation and atomically:

1. validate the still-pending request;
2. validate the final confirmed schedule;
3. validate business-open/closure rules for a new booking;
4. choose or validate the physical vehicle;
5. validate active status and overlapping bookings/blocks;
6. assign the physical vehicle;
7. set confirmed schedule;
8. change status to Confirmed;
9. record the booking event;
10. commit before triggering external notifications.

A stale frontend availability result must never be treated as authoritative.

### 11. Reassignment

A Confirmed/Ongoing booking may be reassigned when operationally necessary (for example, a vehicle issue). Replacement eligibility must be rechecked server-side before committing the reassignment.

The system does not need to expose the replacement vehicle's registration number to the customer.

### 12. Vehicle blocks

An owner can block an individual physical vehicle for a date/time range with an optional reason. A block is not a booking and affects only that vehicle.

A block may not silently invalidate a Confirmed/Ongoing booking; conflicting blocks must be prevented/warned.

### 13. Business closures

An owner can close the business for a date/time range with an optional reason. A closure prevents new availability/confirmation during the closed interval but does not silently cancel or invalidate existing Confirmed/Ongoing bookings.

If the owner needs to resolve an existing conflict, they do so explicitly through the booking workflow.

### 14. No universal turnaround buffer

The system does not invent a cleaning/handover buffer. Pickup and return date/time are explicit. Practical turnaround is controlled by the owner when confirming or modifying schedules.

### 15. Offline bookings

Owner-created phone/walk-in bookings bypass the customer request state and are created as Confirmed only after server-side availability validation.

### 16. Customer identity and status access

Customers do not create accounts. After a request, the customer receives a friendly reference and a private status URL backed by a high-entropy token. The friendly reference itself is not a secret.

The status endpoint exposes only safe customer-facing booking information.

### 17. Customer changes

No customer self-service booking edits in V1. The customer contacts the business; the owner changes the request/confirmed schedule from the dashboard after appropriate validation.

### 18. WhatsApp

The core product works without WhatsApp automation. The cheapest default flow uses normal WhatsApp/click-to-chat and prefilled messages. Automated WhatsApp is optional; external provider/Meta charges are client-owned costs.

WhatsApp is a communication layer, not the source of truth.

### 19. Completion and review

A booking is not automatically marked Completed solely because its return timestamp has passed. The owner explicitly marks completion. Completion can trigger a thank-you/feedback/Google-review communication.

### 20. Reporting

The calendar is an operational planning view. Reports are filtered booking data and CSV export. There is no separate calendar-report generator and no accounting/profit/loss reporting.

### 21. Staff/employee roles

V1 has one business admin account. Employee/staff roles and advanced RBAC are future scope. The underlying design should not make future roles impossible, but no staff UI is required now.

### 22. Partner/aggregator fleet

Partner vehicles and 60/40 settlement are future scope. V1 must not introduce partner settlement calculations or partner-specific operational UI. The core data model should remain extensible enough to add provider ownership later.

### 23. Security

The frontend is never the security boundary. Owner authorization, data isolation, availability checks and booking integrity are enforced server-side.

### 24. Infrastructure

The production provider stack is intentionally not hard-coded into application/business requirements. The application should remain portable across equivalent commercial hosting/database/storage providers.

Client production accounts should be client-owned wherever practical. Third-party usage charges are not absorbed by the maintenance plan.

## UI consistency gate

The public site must feel like a real local rental-business website, not an admin application. The owner dashboard may feel like software, but remains responsive and usable on mobile, tablet and desktop.

The primary customer action is **Search Cars**. The primary owner actions are **Confirm, Reject, Modify, Cancel, Complete, Add Booking, Block Vehicle, Close Business**.

No V1 flow should require more steps simply to accommodate an edge case that can be handled manually outside the core system.

## F9 commercial guardrail

For initial Coimbatore SMB clients, infrastructure should be selected for reasonable commercial reliability and the lowest practical recurring cost. The target is to keep infrastructure lean enough that our introductory support fee (approximately ₹500–₹600/month) is not consumed by mandatory third-party software costs.

Exact provider plans are finalized only after a client/deployment scenario is known and current provider terms are checked.

## Implementation gate

Before Bob writes application code, it must:

1. Read the complete `docs/requirements/` set.
2. Read `docs/database/`, `docs/api/`, `docs/frontend/`, `docs/design/`, `docs/architecture/` and `docs/agent/`.
3. Treat this F12 document and the cross-feature invariants as higher priority than inferred conventions.
4. Use repository assets instead of generating substitute/random branding or vehicle imagery.
5. Avoid implementing V2/future-scope functionality unless explicitly requested.
6. Build UI-first with mock data in Phase 1, then integrate the backend in later phases.
7. Record genuine architectural conflicts as decisions instead of silently changing requirements.

## Final decision

**F12 PASS — V1 is ready for implementation.**

The next artifact after this audit is the **Master Bob Implementation Prompt**, which should point to these repository documents rather than restating the entire product in an uncontrolled free-form prompt.
