# V1 Requirements — F9 to F11

## F9 — Deployment, Hosting, Storage & Cost

### Commercial objective
Production infrastructure should be reasonably low-cost for small Coimbatore/Indian SMB clients while remaining secure and maintainable.

### Ownership
Client should own production infrastructure accounts wherever practical:
- domain registrar
- hosting
- database/storage
- WhatsApp business/API account when used
- analytics accounts

We configure/manage them as part of the project and support plan.

### Cost principles
- Do not require an expensive enterprise stack.
- Do not use a personal/non-commercial free tier for a paying client's production site where provider terms prohibit it.
- Avoid mandatory third-party subscriptions unless the feature requires them.
- WhatsApp automation is optional and client-paid when enabled.
- Domain is a yearly expense, not a monthly hosting fee.
- Exact provider/plan can be selected during deployment based on current commercial pricing.

### Candidate architecture
Primary starting candidate:
- Next.js frontend
- Node.js + Express backend
- PostgreSQL
- Prisma ORM
- low-cost managed hosting or appropriately secured VPS
- object storage for images

Candidate providers may include Cloudflare, Neon, Render, Railway, DigitalOcean or equivalent based on current pricing/terms. Do not hard-code provider assumptions before deployment.

### Images
Actual image binaries must not be stored in PostgreSQL. Database stores object references/URLs/metadata.

### Production security
Use HTTPS, protected secrets, least-privilege access, backups, secure database credentials and basic monitoring appropriate to the selected provider.

## F10 — SEO & Local Business Setup

### Technical SEO
- page titles
- meta descriptions
- correct headings
- clean URLs
- sitemap
- robots.txt
- canonical handling where appropriate
- Open Graph metadata
- mobile-friendly/performance-aware implementation
- appropriate structured data

### Local SEO
- consistent business name/address/phone/hours
- service and location copy based on actual business
- Google Business Profile ownership remains with client
- Google Search Console
- basic Google Analytics setup

### Analytics
Prefer established free/basic tooling for traffic behaviour.
Application/database remains source of truth for booking events.
Track events such as:
- search_performed
- vehicle_viewed
- booking_request_submitted
- booking_confirmed

Do not build a full analytics platform in V1.
Do not promise search ranking guarantees.

## F11 — Production Readiness, Launch & Handover

### Environment separation
At minimum:
- development
- production

Production secrets are never committed to Git.

### Pre-launch setup
- domain/DNS
- HTTPS
- production database
- migrations
- image storage
- environment variables
- authentication secrets
- analytics identifiers
- optional WhatsApp integration

### Pre-launch testing
Customer:
- homepage
- search
- availability
- model details
- booking request
- reference + private status link
- mobile flow

Owner:
- login
- dashboard
- confirm/reject/modify/cancel/complete
- assignment/reassignment
- offline booking
- vehicle activation/deactivation
- vehicle block
- business closure
- calendar
- reports/CSV export

Communication:
- acknowledgement path
- WhatsApp click-to-chat
- optional automated messages if configured
- feedback/review path

General:
- validation/errors
- HTTPS
- no exposed secrets
- 404 handling
- SEO basics
- responsive desktop/tablet/mobile

### Backup/recovery
- database backups enabled
- image storage separate from database
- recovery procedure documented
- no critical production-only copy on a developer laptop

### Handover
Provide the client access/ownership information for:
- domain
- hosting
- database/storage where appropriate
- admin login
- analytics/Search Console
- WhatsApp integration if configured

### Support
Initial support concept: approximately ₹500–₹600/month.
Include reasonable bug fixes, minor configuration/content corrections and deployment help.
Exclude new features, major redesigns and new integrations unless separately quoted.
No 24/7 enterprise support promise.
