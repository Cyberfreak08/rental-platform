-- CreateEnum
CREATE TYPE "OperationalStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'ONGOING', 'COMPLETED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "BookingSource" AS ENUM ('WEBSITE', 'PHONE', 'WALK_IN', 'OTHER');

-- CreateEnum
CREATE TYPE "ActorType" AS ENUM ('CUSTOMER', 'OWNER', 'SYSTEM');

-- CreateTable
CREATE TABLE "business_profiles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "phone" TEXT NOT NULL,
    "whatsappNumber" TEXT,
    "email" TEXT,
    "address" TEXT,
    "city" TEXT NOT NULL,
    "mapUrl" TEXT,
    "logoUrl" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "business_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business_hours" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "weekday" INTEGER NOT NULL,
    "opensAt" TEXT,
    "closesAt" TEXT,
    "isClosed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "business_hours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business_closures" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "startsAt" TIMESTAMPTZ(6) NOT NULL,
    "endsAt" TIMESTAMPTZ(6) NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "business_closures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business_contents" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "aboutContent" TEXT,
    "whyChooseUs" TEXT,
    "servicesContent" TEXT,
    "pickupInstructions" TEXT,
    "returnInstructions" TEXT,
    "fuelPolicy" TEXT,
    "kmPolicy" TEXT,
    "cancellationPolicy" TEXT,
    "googleReviewUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "business_contents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faqs" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "faqs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_models" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "fuelType" TEXT NOT NULL,
    "transmission" TEXT NOT NULL,
    "seats" INTEGER NOT NULL,
    "pricePerDay" DECIMAL(10,2) NOT NULL,
    "description" TEXT,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicle_models_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "physical_vehicles" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "vehicleModelId" TEXT NOT NULL,
    "internalCode" TEXT NOT NULL,
    "modelYear" INTEGER,
    "registrationRef" TEXT,
    "operationalStatus" "OperationalStatus" NOT NULL DEFAULT 'ACTIVE',
    "inactiveReason" TEXT,
    "internalNotes" TEXT,
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "physical_vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_blocks" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "physicalVehicleId" TEXT NOT NULL,
    "startsAt" TIMESTAMPTZ(6) NOT NULL,
    "endsAt" TIMESTAMPTZ(6) NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicle_blocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" TEXT NOT NULL,
    "publicReference" TEXT NOT NULL,
    "statusTokenHash" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "vehicleModelId" TEXT NOT NULL,
    "assignedVehicleId" TEXT,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "customerEmail" TEXT,
    "customerMessage" TEXT,
    "requestedPickupAt" TIMESTAMPTZ(6) NOT NULL,
    "requestedReturnAt" TIMESTAMPTZ(6) NOT NULL,
    "confirmedPickupAt" TIMESTAMPTZ(6),
    "confirmedReturnAt" TIMESTAMPTZ(6),
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "source" "BookingSource" NOT NULL DEFAULT 'WEBSITE',
    "ownerNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking_events" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "fromStatus" "BookingStatus",
    "toStatus" "BookingStatus",
    "previousVehicleId" TEXT,
    "assignedVehicleId" TEXT,
    "actorType" "ActorType" NOT NULL DEFAULT 'SYSTEM',
    "notes" TEXT,
    "metadataJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "booking_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_users" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_sessions" (
    "id" TEXT NOT NULL,
    "sessionTokenHash" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMPTZ(6) NOT NULL,
    "revokedAt" TIMESTAMPTZ(6),
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "image_assets" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "publicUrl" TEXT,
    "imageKind" TEXT NOT NULL,
    "vehicleModelId" TEXT,
    "physicalVehicleId" TEXT,
    "altText" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "image_assets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "business_profiles_slug_key" ON "business_profiles"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "business_hours_businessId_weekday_key" ON "business_hours"("businessId", "weekday");

-- CreateIndex
CREATE INDEX "idx_business_closures_interval" ON "business_closures"("businessId", "startsAt", "endsAt");

-- CreateIndex
CREATE UNIQUE INDEX "business_contents_businessId_key" ON "business_contents"("businessId");

-- CreateIndex
CREATE INDEX "faqs_businessId_isActive_sortOrder_idx" ON "faqs"("businessId", "isActive", "sortOrder");

-- CreateIndex
CREATE INDEX "vehicle_models_businessId_isArchived_idx" ON "vehicle_models"("businessId", "isArchived");

-- CreateIndex
CREATE INDEX "idx_vehicles_model_status" ON "physical_vehicles"("businessId", "vehicleModelId", "operationalStatus");

-- CreateIndex
CREATE UNIQUE INDEX "physical_vehicles_businessId_internalCode_key" ON "physical_vehicles"("businessId", "internalCode");

-- CreateIndex
CREATE UNIQUE INDEX "physical_vehicles_id_vehicleModelId_key" ON "physical_vehicles"("id", "vehicleModelId");

-- CreateIndex
CREATE INDEX "idx_vehicle_blocks_interval" ON "vehicle_blocks"("physicalVehicleId", "startsAt", "endsAt");

-- CreateIndex
CREATE UNIQUE INDEX "bookings_publicReference_key" ON "bookings"("publicReference");

-- CreateIndex
CREATE UNIQUE INDEX "bookings_statusTokenHash_key" ON "bookings"("statusTokenHash");

-- CreateIndex
CREATE INDEX "idx_bookings_availability" ON "bookings"("assignedVehicleId", "status", "confirmedPickupAt", "confirmedReturnAt");

-- CreateIndex
CREATE INDEX "idx_bookings_owner_filter" ON "bookings"("businessId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "idx_bookings_calendar_range" ON "bookings"("businessId", "confirmedPickupAt", "confirmedReturnAt");

-- CreateIndex
CREATE INDEX "idx_booking_events_timeline" ON "booking_events"("bookingId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_businessId_email_key" ON "admin_users"("businessId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "admin_sessions_sessionTokenHash_key" ON "admin_sessions"("sessionTokenHash");

-- CreateIndex
CREATE INDEX "idx_admin_sessions_validity" ON "admin_sessions"("userId", "expiresAt", "revokedAt");

-- CreateIndex
CREATE INDEX "image_assets_businessId_imageKind_idx" ON "image_assets"("businessId", "imageKind");

-- AddForeignKey
ALTER TABLE "business_hours" ADD CONSTRAINT "business_hours_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "business_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_closures" ADD CONSTRAINT "business_closures_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "business_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_contents" ADD CONSTRAINT "business_contents_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "business_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faqs" ADD CONSTRAINT "faqs_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "business_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_models" ADD CONSTRAINT "vehicle_models_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "business_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "physical_vehicles" ADD CONSTRAINT "physical_vehicles_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "business_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "physical_vehicles" ADD CONSTRAINT "physical_vehicles_vehicleModelId_fkey" FOREIGN KEY ("vehicleModelId") REFERENCES "vehicle_models"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_blocks" ADD CONSTRAINT "vehicle_blocks_physicalVehicleId_fkey" FOREIGN KEY ("physicalVehicleId") REFERENCES "physical_vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "business_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_vehicleModelId_fkey" FOREIGN KEY ("vehicleModelId") REFERENCES "vehicle_models"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_assignedVehicleId_vehicleModelId_fkey" FOREIGN KEY ("assignedVehicleId", "vehicleModelId") REFERENCES "physical_vehicles"("id", "vehicleModelId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_events" ADD CONSTRAINT "booking_events_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_users" ADD CONSTRAINT "admin_users_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "business_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_sessions" ADD CONSTRAINT "admin_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "admin_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "image_assets" ADD CONSTRAINT "image_assets_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "business_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "image_assets" ADD CONSTRAINT "image_assets_vehicleModelId_fkey" FOREIGN KEY ("vehicleModelId") REFERENCES "vehicle_models"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "image_assets" ADD CONSTRAINT "image_assets_physicalVehicleId_fkey" FOREIGN KEY ("physicalVehicleId") REFERENCES "physical_vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ============================================================================
-- Custom PostgreSQL Check Constraints for Business & Data Integrity
-- ============================================================================

-- 1. Timestamp validity constraints (Start < End)
ALTER TABLE "bookings"
  ADD CONSTRAINT "check_booking_requested_interval"
  CHECK ("requestedPickupAt" < "requestedReturnAt");

ALTER TABLE "bookings"
  ADD CONSTRAINT "check_booking_confirmed_interval"
  CHECK ("confirmedPickupAt" IS NULL OR "confirmedReturnAt" IS NULL OR "confirmedPickupAt" < "confirmedReturnAt");

ALTER TABLE "vehicle_blocks"
  ADD CONSTRAINT "check_vehicle_block_interval"
  CHECK ("startsAt" < "endsAt");

ALTER TABLE "business_closures"
  ADD CONSTRAINT "check_business_closure_interval"
  CHECK ("startsAt" < "endsAt");

-- 2. Booking assignment invariant: CONFIRMED, ONGOING, COMPLETED must have an assigned vehicle
ALTER TABLE "bookings"
  ADD CONSTRAINT "check_booking_assigned_vehicle_required"
  CHECK (
    "status" NOT IN ('CONFIRMED', 'ONGOING', 'COMPLETED')
    OR ("assignedVehicleId" IS NOT NULL AND "confirmedPickupAt" IS NOT NULL AND "confirmedReturnAt" IS NOT NULL)
  );

-- 3. ImageAsset ownership constraint: must attach to model, vehicle, or general business asset (never both)
ALTER TABLE "image_assets"
  ADD CONSTRAINT "check_image_asset_ownership"
  CHECK (
    ("vehicleModelId" IS NOT NULL AND "physicalVehicleId" IS NULL) OR
    ("vehicleModelId" IS NULL AND "physicalVehicleId" IS NOT NULL) OR
    ("vehicleModelId" IS NULL AND "physicalVehicleId" IS NULL AND "imageKind" IN ('LOGO', 'UI', 'BUSINESS'))
  );
