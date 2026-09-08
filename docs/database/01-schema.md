# PostgreSQL Schema V1 — Logical Domain Model

Status: PHASE 1 FROZEN DOMAIN BASELINE (Persistence details marked for Phase 2 design)

This document describes the logical domain entities. Exact database representation, column types, and index optimizations belong to Phase 2 technical design without altering the core business invariants.

## entities

### business
- id
- name
- slug
- description
- phone
- whatsapp_number
- email
- address
- city
- map_url
- logo_url
- timezone (default Asia/Kolkata for initial target, configurable if needed)
- created_at
- updated_at

### business_hours
- id
- business_id
- weekday (0-6)
- opens_at
- closes_at
- is_closed

### business_content
- id
- business_id
- about_content
- why_choose_us
- services_content
- pickup_instructions
- return_instructions
- fuel_policy
- km_policy
- cancellation_policy
- late_return_policy
- eligibility_policy
- google_review_url
- created_at
- updated_at

### faq
- id
- business_id
- question
- answer
- sort_order
- is_active

### vehicle_model
- id
- business_id
- brand
- name
- category
- fuel_type
- transmission
- seats
- price_per_day
- description
- is_active
- created_at
- updated_at

### physical_vehicle
- id
- business_id
- vehicle_model_id
- internal_code
- model_year
- registration_reference (private/internal)
- operational_state (Domain semantics: ACTIVE, INACTIVE, MAINTENANCE, ARCHIVED) - **[TECHNICAL DESIGN REQUIRED]** (Exact persistence representation via enum, boolean flags, or timestamps to be decided in Phase 2)
- inactive_reason
- internal_notes
- created_at
- updated_at

### image_asset
- id
- business_id
- storage_key
- public_url (or derived URL)
- image_kind (MODEL_DEFAULT / VEHICLE_REAL / LOGO / BUSINESS / UI)
- vehicle_model_id nullable
- physical_vehicle_id nullable
- alt_text
- sort_order
- created_at

### admin_user
- id
- business_id
- name
- email
- password_hash or auth-provider reference
- is_active
- created_at
- updated_at

### booking
- id
- public_reference
- private_status_token_hash (store a hash where practical, not raw token)
- business_id
- vehicle_model_id
- assigned_vehicle_id nullable until confirmation
- customer_name
- customer_phone
- customer_email nullable
- customer_message nullable
- requested_pickup_at
- requested_return_at
- confirmed_pickup_at nullable
- confirmed_return_at nullable
- status
- source (WEBSITE / PHONE / WALK_IN / OTHER)
- created_at
- updated_at

### booking_event
- id
- booking_id
- event_type
- from_status nullable
- to_status nullable
- metadata_json nullable
- created_at

### vehicle_block
- id
- business_id
- physical_vehicle_id
- starts_at
- ends_at
- reason
- created_at
- updated_at

### business_closure
- id
- business_id
- starts_at
- ends_at
- reason
- created_at
- updated_at

## Future-only entities (do not implement V1 unless specifically approved)
- staff_user
- partner_provider
- partner_settlement
- payment
- kyc_document
- rental_agreement
- maintenance_record
