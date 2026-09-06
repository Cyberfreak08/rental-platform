# API Error Contract

Suggested error response:
```json
{
  "error": {
    "code": "BOOKING_CONFLICT",
    "message": "The selected vehicle is no longer available for the confirmed period.",
    "fields": {}
  }
}
```

## Important codes
- `VALIDATION_ERROR`
- `UNAUTHENTICATED`
- `FORBIDDEN`
- `NOT_FOUND`
- `BOOKING_NOT_PENDING`
- `BOOKING_CONFLICT`
- `VEHICLE_NOT_AVAILABLE`
- `VEHICLE_BLOCK_CONFLICT`
- `BUSINESS_CLOSED`
- `INVALID_STATUS_TRANSITION`
- `DUPLICATE_REQUEST`
- `RATE_LIMITED`
- `INTERNAL_ERROR`

Never expose raw DB errors or stack traces.
