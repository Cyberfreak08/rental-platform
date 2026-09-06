# Public API Routes

## Business/public content
`GET /public/business`
Returns public business profile, hours, policies summary, public contact and basic content.

`GET /public/business/faqs`
Returns active FAQs ordered by sort_order.

## Vehicle models
`GET /public/models`
Returns active models. Supports optional query filters such as category.

`GET /public/models/:modelId`
Returns public model details and image gallery.

## Availability/search
`GET /public/search?pickupAt=&returnAt=&modelId=`
Returns models with at least one eligible physical vehicle for the complete requested interval.

Response should include:
- model id
- name/brand/category
- specs
- price/day
- images
- available count

If no model filter is supplied, search across all active models.

## Booking request
`POST /public/bookings`
Creates a PENDING booking request.

Request:
```json
{
  "modelId": "...",
  "requestedPickupAt": "2026-09-05T08:00:00+05:30",
  "requestedReturnAt": "2026-09-06T22:00:00+05:30",
  "customerName": "Rahul Kumar",
  "customerPhone": "+919000010001",
  "customerEmail": "rahul@example.com",
  "customerMessage": "Need airport pickup"
}
```

The server validates basic input/date ordering but does not require inventory to be available at PENDING time if the product rule permits request capture. Availability should still be shown accurately at search time.

Response includes:
- public reference
- status = PENDING
- requested schedule
- status URL (or a URL built from one-time secret token)

## Status
`GET /public/status/:token`
Returns only the booking information permitted to the holder of the unguessable secret token.

Do not expose another customer's data through a public reference alone.
