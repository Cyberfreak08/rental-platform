# Detailed Endpoint Contracts V1

## Public search
`GET /api/v1/public/search`

Query:
- `pickupAt` required ISO datetime
- `returnAt` required ISO datetime
- `modelId` optional

Success:
```json
{
  "data": [
    {
      "modelId": "model-swift",
      "brand": "Maruti",
      "name": "Swift",
      "category": "Hatchback",
      "fuelType": "Petrol",
      "transmission": "Manual",
      "seats": 5,
      "pricePerDay": 1500,
      "availableCount": 2,
      "images": []
    }
  ]
}
```

## Create booking request
`POST /api/v1/public/bookings`

Returns HTTP 201 when saved as PENDING.

Response:
```json
{
  "data": {
    "reference": "BK-20260905-001",
    "status": "PENDING",
    "statusUrl": "https://example.com/status/<unguessable-token>",
    "requestedPickupAt": "2026-09-05T08:00:00+05:30",
    "requestedReturnAt": "2026-09-06T22:00:00+05:30"
  }
}
```

## Public status
`GET /api/v1/public/status/:token`

Return only safe customer-visible fields:
- reference
- model name
- requested/confirmed schedule
- current status
- business contact information
- next-step message

Never return internal vehicle ID, registration, admin metadata, secret token, or other customer records.

## Confirm booking
`POST /api/v1/owner/bookings/:bookingId/confirm`

Request:
```json
{
  "confirmedPickupAt": "2026-09-05T09:00:00+05:30",
  "confirmedReturnAt": "2026-09-06T21:00:00+05:30",
  "vehicleId": "car-001"
}
```

The server may receive `vehicleId` from the owner's selection, but must independently verify its eligibility.

## Vehicle suggestion
`GET /api/v1/owner/bookings/:bookingId/vehicle-options`

Returns eligible physical vehicles and a suggested choice.

## Reassign
`POST /api/v1/owner/bookings/:bookingId/reassign`
```json
{ "vehicleId": "car-002" }
```

## Complete
`POST /api/v1/owner/bookings/:bookingId/complete`
No client-supplied completion time is required; server records the action timestamp.

## CSV export
`GET /api/v1/owner/reports/bookings.csv`
Query filters match `/owner/bookings` where practical.
Response content type: `text/csv`.

## API implementation rules
- Validate all body/query/path inputs.
- Apply business isolation to every owner query.
- Use transactions for confirmation and assignment.
- Return 409 for inventory conflicts.
- Emit notification side effects only after successful commit.
