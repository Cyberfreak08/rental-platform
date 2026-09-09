import { Prisma, OperationalStatus, BookingStatus } from '@prisma/client';
import { prisma } from './prisma';
import {
  InvalidIntervalError,
  BusinessClosureConflictError,
} from './errors';

export interface AvailabilityInterval {
  pickupAt: Date;
  returnAt: Date;
}

export interface ModelAvailabilityResult {
  vehicleModelId: string;
  isAvailable: boolean;
  eligibleCount: number;
  totalActiveCount: number;
  eligibleVehicleIds: string[];
}

/**
 * Validates requested interval against standard invariants:
 * 1. pickupAt < returnAt
 * 2. business closure check
 */
export async function validateIntervalAndClosures(
  businessId: string,
  pickupAt: Date,
  returnAt: Date,
  tx: Prisma.TransactionClient = prisma
): Promise<void> {
  if (pickupAt >= returnAt) {
    throw new InvalidIntervalError();
  }

  // Check business closure overlap: startsAt < returnAt AND endsAt > pickupAt
  const closure = await tx.businessClosure.findFirst({
    where: {
      businessId,
      startsAt: { lt: returnAt },
      endsAt: { gt: pickupAt },
    },
  });

  if (closure) {
    throw new BusinessClosureConflictError(closure.reason);
  }
}

/**
 * Checks if a specific physical vehicle has conflicting confirmed/ongoing bookings
 * or active vehicle blocks during the requested interval.
 */
export async function checkVehicleAvailability(
  physicalVehicleId: string,
  pickupAt: Date,
  returnAt: Date,
  excludeBookingId?: string,
  tx: Prisma.TransactionClient = prisma
): Promise<{ isAvailable: boolean; reason?: string }> {
  // 1. Overlapping CONFIRMED or ONGOING bookings
  const overlappingBooking = await tx.booking.findFirst({
    where: {
      assignedVehicleId: physicalVehicleId,
      id: excludeBookingId ? { not: excludeBookingId } : undefined,
      status: { in: [BookingStatus.CONFIRMED, BookingStatus.ONGOING] },
      confirmedPickupAt: { lt: returnAt },
      confirmedReturnAt: { gt: pickupAt },
    },
  });

  if (overlappingBooking) {
    return {
      isAvailable: false,
      reason: `Vehicle has overlapping booking '${overlappingBooking.publicReference}' (${overlappingBooking.status}).`,
    };
  }

  // 2. Overlapping VehicleBlock
  const overlappingBlock = await tx.vehicleBlock.findFirst({
    where: {
      physicalVehicleId,
      startsAt: { lt: returnAt },
      endsAt: { gt: pickupAt },
    },
  });

  if (overlappingBlock) {
    return {
      isAvailable: false,
      reason: `Vehicle is blocked${overlappingBlock.reason ? `: ${overlappingBlock.reason}` : ''}.`,
    };
  }

  return { isAvailable: true };
}

/**
 * Calculates availability for a specific vehicle model across a requested interval.
 */
export async function calculateModelAvailability(
  businessId: string,
  vehicleModelId: string,
  pickupAt: Date,
  returnAt: Date,
  tx: Prisma.TransactionClient = prisma
): Promise<ModelAvailabilityResult> {
  await validateIntervalAndClosures(businessId, pickupAt, returnAt, tx);

  // 1. Fetch all ACTIVE physical vehicles for this model
  const activeVehicles = await tx.physicalVehicle.findMany({
    where: {
      businessId,
      vehicleModelId,
      operationalStatus: OperationalStatus.ACTIVE,
    },
    select: {
      id: true,
      internalCode: true,
    },
    orderBy: {
      internalCode: 'asc',
    },
  });

  const totalActiveCount = activeVehicles.length;
  if (totalActiveCount === 0) {
    return {
      vehicleModelId,
      isAvailable: false,
      eligibleCount: 0,
      totalActiveCount: 0,
      eligibleVehicleIds: [],
    };
  }

  const eligibleVehicleIds: string[] = [];

  for (const vehicle of activeVehicles) {
    const { isAvailable } = await checkVehicleAvailability(vehicle.id, pickupAt, returnAt, undefined, tx);
    if (isAvailable) {
      eligibleVehicleIds.push(vehicle.id);
    }
  }

  return {
    vehicleModelId,
    isAvailable: eligibleVehicleIds.length > 0,
    eligibleCount: eligibleVehicleIds.length,
    totalActiveCount,
    eligibleVehicleIds,
  };
}

/**
 * Calculates availability for all active models in a business for public search.
 */
export async function searchAllModelsAvailability(
  businessId: string,
  pickupAt: Date,
  returnAt: Date,
  tx: Prisma.TransactionClient = prisma
): Promise<Record<string, ModelAvailabilityResult>> {
  await validateIntervalAndClosures(businessId, pickupAt, returnAt, tx);

  const models = await tx.vehicleModel.findMany({
    where: {
      businessId,
      isArchived: false,
    },
    select: {
      id: true,
    },
  });

  const results: Record<string, ModelAvailabilityResult> = {};

  for (const model of models) {
    results[model.id] = await calculateModelAvailability(businessId, model.id, pickupAt, returnAt, tx);
  }

  return results;
}
