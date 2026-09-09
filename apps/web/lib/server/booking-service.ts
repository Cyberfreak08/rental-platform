import { BookingStatus, ActorType } from '@prisma/client';
import { prisma } from './prisma';
import {
  NotFoundError,
  InvalidStateTransitionError,
  VehicleUnavailableError,
  ModelUnavailableError,
  ModelVehicleMismatchError,
  VehicleNotActiveError,
  ConcurrencyConflictError,
  InvalidIntervalError,
} from './errors';
import {
  validateIntervalAndClosures,
  checkVehicleAvailability,
} from './availability';
import { generateTokenPair } from './security';

export interface CreateBookingRequestInput {
  businessId: string;
  vehicleModelId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerMessage?: string;
  requestedPickupAt: Date;
  requestedReturnAt: Date;
  source?: 'WEBSITE' | 'PHONE' | 'WALK_IN' | 'OTHER';
}

export interface ConfirmBookingInput {
  bookingId: string;
  businessId: string;
  confirmedPickupAt: Date;
  confirmedReturnAt: Date;
  explicitVehicleId?: string;
  actorId?: string;
  actorType?: ActorType;
  ownerNotes?: string;
}

export interface ReassignBookingInput {
  bookingId: string;
  businessId: string;
  targetVehicleId: string;
  reason?: string;
  actorId?: string;
  actorType?: ActorType;
}

export interface ModifyBookingScheduleInput {
  bookingId: string;
  businessId: string;
  pickupAt: Date;
  returnAt: Date;
  actorId?: string;
  actorType?: ActorType;
}

/**
 * Validates allowed state machine transitions according to frozen rules:
 * PENDING -> CONFIRMED, REJECTED
 * CONFIRMED -> ONGOING, CANCELLED
 * ONGOING -> COMPLETED, CANCELLED
 */
export function validateStateTransition(fromStatus: BookingStatus, toStatus: BookingStatus): void {
  const allowedTransitions: Record<BookingStatus, BookingStatus[]> = {
    [BookingStatus.PENDING]: [BookingStatus.CONFIRMED, BookingStatus.REJECTED],
    [BookingStatus.CONFIRMED]: [BookingStatus.ONGOING, BookingStatus.CANCELLED],
    [BookingStatus.ONGOING]: [BookingStatus.COMPLETED, BookingStatus.CANCELLED],
    [BookingStatus.COMPLETED]: [],
    [BookingStatus.REJECTED]: [],
    [BookingStatus.CANCELLED]: [],
  };

  if (!allowedTransitions[fromStatus]?.includes(toStatus)) {
    throw new InvalidStateTransitionError(fromStatus, toStatus);
  }
}

/**
 * 1. Create a new customer booking request (PENDING)
 */
export async function createBookingRequest(input: CreateBookingRequestInput) {
  if (input.requestedPickupAt >= input.requestedReturnAt) {
    throw new InvalidIntervalError();
  }

  // Verify vehicle model exists and is not archived
  const model = await prisma.vehicleModel.findFirst({
    where: {
      id: input.vehicleModelId,
      businessId: input.businessId,
      isArchived: false,
    },
  });

  if (!model) {
    throw new NotFoundError('VehicleModel', input.vehicleModelId);
  }

  const { rawToken, tokenHash } = generateTokenPair(32);
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const publicReference = `BK-${dateStr}-${randomSuffix}`;

  const booking = await prisma.$transaction(async (tx) => {
    const b = await tx.booking.create({
      data: {
        publicReference,
        statusTokenHash: tokenHash,
        businessId: input.businessId,
        vehicleModelId: input.vehicleModelId,
        assignedVehicleId: null,
        customerName: input.customerName,
        customerPhone: input.customerPhone,
        customerEmail: input.customerEmail || null,
        customerMessage: input.customerMessage || null,
        requestedPickupAt: input.requestedPickupAt,
        requestedReturnAt: input.requestedReturnAt,
        confirmedPickupAt: null,
        confirmedReturnAt: null,
        status: BookingStatus.PENDING,
        source: input.source || 'WEBSITE',
      },
    });

    await tx.bookingEvent.create({
      data: {
        bookingId: b.id,
        eventType: 'CREATED',
        fromStatus: null,
        toStatus: BookingStatus.PENDING,
        assignedVehicleId: null,
        actorType: ActorType.CUSTOMER,
        notes: 'Booking request received via online submission',
      },
    });

    return b;
  });

  return {
    booking,
    rawStatusToken: rawToken,
  };
}

/**
 * 2. Confirm a booking request (PENDING -> CONFIRMED)
 * Concurrency-safe via row-level locking (SELECT ... FOR UPDATE).
 */
export async function confirmBooking(input: ConfirmBookingInput) {
  if (input.confirmedPickupAt >= input.confirmedReturnAt) {
    throw new InvalidIntervalError();
  }

  return await prisma.$transaction(async (tx) => {
    // 1. Fetch target booking
    const booking = await tx.booking.findFirst({
      where: {
        id: input.bookingId,
        businessId: input.businessId,
      },
    });

    if (!booking) {
      throw new NotFoundError('Booking', input.bookingId);
    }

    validateStateTransition(booking.status, BookingStatus.CONFIRMED);

    // 2. Validate business closures
    await validateIntervalAndClosures(input.businessId, input.confirmedPickupAt, input.confirmedReturnAt, tx);

    let assignedVehicleId: string;

    if (input.explicitVehicleId) {
      // Scenario A: Explicit vehicle selection by owner
      // Acquire pessimistic row lock on the vehicle
      const lockedVehicles: Array<{ id: string; operationalStatus: string; vehicleModelId: string }> =
        await tx.$queryRaw`
          SELECT id, "operationalStatus", "vehicleModelId"
          FROM physical_vehicles
          WHERE id = ${input.explicitVehicleId} AND "businessId" = ${input.businessId}
          FOR UPDATE
        `;

      if (!lockedVehicles || lockedVehicles.length === 0) {
        throw new NotFoundError('PhysicalVehicle', input.explicitVehicleId);
      }

      const lockedVehicle = lockedVehicles[0];

      if (lockedVehicle.vehicleModelId !== booking.vehicleModelId) {
        throw new ModelVehicleMismatchError(
          lockedVehicle.id,
          lockedVehicle.vehicleModelId,
          booking.vehicleModelId
        );
      }

      if (lockedVehicle.operationalStatus !== 'ACTIVE') {
        throw new VehicleNotActiveError(lockedVehicle.id, lockedVehicle.operationalStatus);
      }

      // Check overlaps inside lock
      const { isAvailable, reason } = await checkVehicleAvailability(
        lockedVehicle.id,
        input.confirmedPickupAt,
        input.confirmedReturnAt,
        booking.id,
        tx
      );

      if (!isAvailable) {
        throw new VehicleUnavailableError(reason);
      }

      assignedVehicleId = lockedVehicle.id;
    } else {
      // Scenario B: Automatic vehicle suggestion/selection
      // Lock all active candidate vehicles for this model in deterministic order
      const candidateVehicles: Array<{ id: string; internalCode: string }> =
        await tx.$queryRaw`
          SELECT id, "internalCode"
          FROM physical_vehicles
          WHERE "businessId" = ${input.businessId}
            AND "vehicleModelId" = ${booking.vehicleModelId}
            AND "operationalStatus" = 'ACTIVE'
          ORDER BY "internalCode" ASC
          FOR UPDATE
        `;

      if (!candidateVehicles || candidateVehicles.length === 0) {
        throw new ModelUnavailableError(booking.vehicleModelId);
      }

      let selectedVehicleId: string | null = null;

      for (const candidate of candidateVehicles) {
        const { isAvailable } = await checkVehicleAvailability(
          candidate.id,
          input.confirmedPickupAt,
          input.confirmedReturnAt,
          booking.id,
          tx
        );
        if (isAvailable) {
          selectedVehicleId = candidate.id;
          break;
        }
      }

      if (!selectedVehicleId) {
        throw new ModelUnavailableError(booking.vehicleModelId, {
          message: 'All candidate vehicles have conflicting bookings or blocks for this interval.',
        });
      }

      assignedVehicleId = selectedVehicleId;
    }

    // Update booking to CONFIRMED
    const updatedBooking = await tx.booking.update({
      where: { id: booking.id },
      data: {
        status: BookingStatus.CONFIRMED,
        assignedVehicleId,
        confirmedPickupAt: input.confirmedPickupAt,
        confirmedReturnAt: input.confirmedReturnAt,
        ownerNotes: input.ownerNotes || booking.ownerNotes,
      },
    });

    // Append BookingEvent
    await tx.bookingEvent.create({
      data: {
        bookingId: booking.id,
        eventType: 'CONFIRMED',
        fromStatus: BookingStatus.PENDING,
        toStatus: BookingStatus.CONFIRMED,
        assignedVehicleId,
        actorType: input.actorType || ActorType.OWNER,
        notes: input.ownerNotes || 'Booking confirmed and physical vehicle committed',
      },
    });

    return updatedBooking;
  });
}

/**
 * 3. Reassign a booking (CONFIRMED/ONGOING) to another vehicle.
 * Concurrency-safe via row-level locking.
 */
export async function reassignBooking(input: ReassignBookingInput) {
  return await prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findFirst({
      where: {
        id: input.bookingId,
        businessId: input.businessId,
      },
    });

    if (!booking) {
      throw new NotFoundError('Booking', input.bookingId);
    }

    if (booking.status !== BookingStatus.CONFIRMED && booking.status !== BookingStatus.ONGOING) {
      throw new ConcurrencyConflictError(
        `Cannot reassign booking with status '${booking.status}'. Only CONFIRMED or ONGOING bookings can be reassigned.`
      );
    }

    if (!booking.confirmedPickupAt || !booking.confirmedReturnAt) {
      throw new InvalidIntervalError('Booking lacks confirmed schedule for reassignment validation.');
    }

    const previousVehicleId = booking.assignedVehicleId;

    // Lock target replacement vehicle
    const lockedVehicles: Array<{ id: string; operationalStatus: string; vehicleModelId: string }> =
      await tx.$queryRaw`
        SELECT id, "operationalStatus", "vehicleModelId"
        FROM physical_vehicles
        WHERE id = ${input.targetVehicleId} AND "businessId" = ${input.businessId}
        FOR UPDATE
      `;

    if (!lockedVehicles || lockedVehicles.length === 0) {
      throw new NotFoundError('PhysicalVehicle', input.targetVehicleId);
    }

    const lockedVehicle = lockedVehicles[0];

    if (lockedVehicle.vehicleModelId !== booking.vehicleModelId) {
      throw new ModelVehicleMismatchError(
        lockedVehicle.id,
        lockedVehicle.vehicleModelId,
        booking.vehicleModelId
      );
    }

    if (lockedVehicle.operationalStatus !== 'ACTIVE') {
      throw new VehicleNotActiveError(lockedVehicle.id, lockedVehicle.operationalStatus);
    }

    // Check availability of the replacement vehicle
    const { isAvailable, reason } = await checkVehicleAvailability(
      lockedVehicle.id,
      booking.confirmedPickupAt,
      booking.confirmedReturnAt,
      booking.id,
      tx
    );

    if (!isAvailable) {
      throw new VehicleUnavailableError(reason);
    }

    // Update assignment
    const updatedBooking = await tx.booking.update({
      where: { id: booking.id },
      data: {
        assignedVehicleId: lockedVehicle.id,
      },
    });

    // Record BookingEvent with explicit previous and new vehicle IDs
    await tx.bookingEvent.create({
      data: {
        bookingId: booking.id,
        eventType: 'REASSIGNED',
        fromStatus: booking.status,
        toStatus: booking.status,
        previousVehicleId,
        assignedVehicleId: lockedVehicle.id,
        actorType: input.actorType || ActorType.OWNER,
        notes: input.reason || 'Vehicle reassigned by owner',
      },
    });

    return updatedBooking;
  });
}

/**
 * 4. Reject a pending booking request (PENDING -> REJECTED)
 */
export async function rejectBooking(
  bookingId: string,
  businessId: string,
  reason?: string,
  actorType: ActorType = ActorType.OWNER
) {
  return await prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findFirst({
      where: { id: bookingId, businessId },
    });

    if (!booking) {
      throw new NotFoundError('Booking', bookingId);
    }

    validateStateTransition(booking.status, BookingStatus.REJECTED);

    const updated = await tx.booking.update({
      where: { id: bookingId },
      data: {
        status: BookingStatus.REJECTED,
        ownerNotes: reason ? `Rejected: ${reason}` : booking.ownerNotes,
      },
    });

    await tx.bookingEvent.create({
      data: {
        bookingId: booking.id,
        eventType: 'REJECTED',
        fromStatus: BookingStatus.PENDING,
        toStatus: BookingStatus.REJECTED,
        assignedVehicleId: null,
        actorType,
        notes: reason || 'Booking request rejected',
      },
    });

    return updated;
  });
}

/**
 * 5. Cancel a confirmed or ongoing booking (CONFIRMED/ONGOING -> CANCELLED)
 */
export async function cancelBooking(
  bookingId: string,
  businessId: string,
  reason?: string,
  actorType: ActorType = ActorType.OWNER
) {
  return await prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findFirst({
      where: { id: bookingId, businessId },
    });

    if (!booking) {
      throw new NotFoundError('Booking', bookingId);
    }

    validateStateTransition(booking.status, BookingStatus.CANCELLED);

    const updated = await tx.booking.update({
      where: { id: bookingId },
      data: {
        status: BookingStatus.CANCELLED,
        ownerNotes: reason ? `Cancelled: ${reason}` : booking.ownerNotes,
      },
    });

    await tx.bookingEvent.create({
      data: {
        bookingId: booking.id,
        eventType: 'CANCELLED',
        fromStatus: booking.status,
        toStatus: BookingStatus.CANCELLED,
        assignedVehicleId: booking.assignedVehicleId,
        actorType,
        notes: reason || 'Booking cancelled',
      },
    });

    return updated;
  });
}

/**
 * 6. Start rental / Handover vehicle (CONFIRMED -> ONGOING)
 */
export async function startRental(
  bookingId: string,
  businessId: string,
  notes?: string,
  actorType: ActorType = ActorType.OWNER
) {
  return await prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findFirst({
      where: { id: bookingId, businessId },
    });

    if (!booking) {
      throw new NotFoundError('Booking', bookingId);
    }

    validateStateTransition(booking.status, BookingStatus.ONGOING);

    const updated = await tx.booking.update({
      where: { id: bookingId },
      data: {
        status: BookingStatus.ONGOING,
      },
    });

    await tx.bookingEvent.create({
      data: {
        bookingId: booking.id,
        eventType: 'STARTED',
        fromStatus: BookingStatus.CONFIRMED,
        toStatus: BookingStatus.ONGOING,
        assignedVehicleId: booking.assignedVehicleId,
        actorType,
        notes: notes || 'Rental started and vehicle handed over',
      },
    });

    return updated;
  });
}

/**
 * 7. Complete rental / Vehicle returned (ONGOING -> COMPLETED)
 */
export async function completeRental(
  bookingId: string,
  businessId: string,
  notes?: string,
  actorType: ActorType = ActorType.OWNER
) {
  return await prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findFirst({
      where: { id: bookingId, businessId },
    });

    if (!booking) {
      throw new NotFoundError('Booking', bookingId);
    }

    validateStateTransition(booking.status, BookingStatus.COMPLETED);

    const updated = await tx.booking.update({
      where: { id: bookingId },
      data: {
        status: BookingStatus.COMPLETED,
      },
    });

    await tx.bookingEvent.create({
      data: {
        bookingId: booking.id,
        eventType: 'COMPLETED',
        fromStatus: BookingStatus.ONGOING,
        toStatus: BookingStatus.COMPLETED,
        assignedVehicleId: booking.assignedVehicleId,
        actorType,
        notes: notes || 'Rental completed and vehicle returned',
      },
    });

    return updated;
  });
}

/**
 * 8. Lookup booking for customer status tracking via token hash
 */
export async function getBookingByStatusToken(tokenHash: string) {
  const booking = await prisma.booking.findUnique({
    where: { statusTokenHash: tokenHash },
    select: {
      id: true,
      publicReference: true,
      status: true,
      customerName: true,
      requestedPickupAt: true,
      requestedReturnAt: true,
      confirmedPickupAt: true,
      confirmedReturnAt: true,
      ownerNotes: true,
      model: {
        select: {
          id: true,
          brand: true,
          name: true,
          category: true,
          fuelType: true,
          transmission: true,
          seats: true,
          pricePerDay: true,
          images: {
            where: { imageKind: 'MODEL_DEFAULT' },
            select: { publicUrl: true, altText: true },
          },
        },
      },
      business: {
        select: {
          name: true,
          phone: true,
          whatsappNumber: true,
          email: true,
          address: true,
          city: true,
        },
      },
    },
  });

  if (!booking) {
    throw new NotFoundError('Booking', tokenHash);
  }

  return booking;
}
