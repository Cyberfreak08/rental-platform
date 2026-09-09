import { NextRequest } from 'next/server';
import { prisma } from '@/lib/server/prisma';
import { jsonResponse, errorResponse } from '@/lib/server/api-response';
import { authenticateRequest } from '@/lib/server/api-auth';
import { BookingStatus, BookingSource, ActorType } from '@prisma/client';
import { DomainError, VehicleUnavailableError } from '@/lib/server/errors';
import { checkVehicleAvailability, validateIntervalAndClosures } from '@/lib/server/availability';
import { generateTokenPair } from '@/lib/server/security';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await authenticateRequest(req);
    const businessId = session.businessId;

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') as BookingStatus | null;
    const modelId = searchParams.get('modelId');
    const vehicleId = searchParams.get('vehicleId');
    const search = searchParams.get('search');

    const bookings = await prisma.booking.findMany({
      where: {
        businessId,
        status: status || undefined,
        vehicleModelId: modelId || undefined,
        assignedVehicleId: vehicleId || undefined,
        OR: search
          ? [
              { customerName: { contains: search, mode: 'insensitive' } },
              { customerPhone: { contains: search } },
              { publicReference: { contains: search, mode: 'insensitive' } },
            ]
          : undefined,
      },
      select: {
        id: true,
        publicReference: true,
        customerName: true,
        customerPhone: true,
        customerEmail: true,
        customerMessage: true,
        requestedPickupAt: true,
        requestedReturnAt: true,
        confirmedPickupAt: true,
        confirmedReturnAt: true,
        status: true,
        source: true,
        ownerNotes: true,
        createdAt: true,
        model: {
          select: {
            id: true,
            brand: true,
            name: true,
            pricePerDay: true,
          },
        },
        assignedVehicle: {
          select: {
            id: true,
            internalCode: true,
            registrationRef: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return jsonResponse(bookings);
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * Owner offline/walk-in booking creation (Directly created as CONFIRMED after availability validation)
 */
export async function POST(req: NextRequest) {
  try {
    const session = await authenticateRequest(req);
    const businessId = session.businessId;
    const body = await req.json();

    if (!body.modelId || !body.customerName || !body.customerPhone || !body.pickupAt || !body.returnAt || !body.vehicleId) {
      throw new DomainError('Missing required offline booking fields.', 'INVALID_INPUT', 400);
    }

    const pickupAt = new Date(body.pickupAt);
    const returnAt = new Date(body.returnAt);

    if (isNaN(pickupAt.getTime()) || isNaN(returnAt.getTime()) || pickupAt >= returnAt) {
      throw new DomainError('Invalid pickup or return timestamp.', 'INVALID_INPUT', 400);
    }

    const booking = await prisma.$transaction(async (tx) => {
      // Validate closure
      await validateIntervalAndClosures(businessId, pickupAt, returnAt, tx);

      // Lock vehicle
      const lockedVehicles: Array<{ id: string; operationalStatus: string; vehicleModelId: string }> =
        await tx.$queryRaw`
          SELECT id, "operationalStatus", "vehicleModelId"
          FROM physical_vehicles
          WHERE id = ${body.vehicleId} AND "businessId" = ${businessId}
          FOR UPDATE
        `;

      if (!lockedVehicles || lockedVehicles.length === 0) {
        throw new DomainError('Physical vehicle not found.', 'NOT_FOUND', 404);
      }

      const lockedVehicle = lockedVehicles[0];
      if (lockedVehicle.vehicleModelId !== body.modelId) {
        throw new DomainError('Selected vehicle does not match the requested model.', 'MODEL_MISMATCH', 400);
      }

      if (lockedVehicle.operationalStatus !== 'ACTIVE') {
        throw new DomainError('Selected vehicle is not active.', 'VEHICLE_NOT_ACTIVE', 400);
      }

      // Check overlaps
      const { isAvailable, reason } = await checkVehicleAvailability(lockedVehicle.id, pickupAt, returnAt, undefined, tx);
      if (!isAvailable) {
        throw new VehicleUnavailableError(reason);
      }

      const { rawToken, tokenHash } = generateTokenPair(32);
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const publicReference = `BK-${dateStr}-${randomSuffix}`;

      const b = await tx.booking.create({
        data: {
          publicReference,
          statusTokenHash: tokenHash,
          businessId,
          vehicleModelId: body.modelId,
          assignedVehicleId: lockedVehicle.id,
          customerName: body.customerName.trim(),
          customerPhone: body.customerPhone.trim(),
          customerEmail: body.customerEmail ? body.customerEmail.trim() : null,
          customerMessage: body.customerMessage || null,
          requestedPickupAt: pickupAt,
          requestedReturnAt: returnAt,
          confirmedPickupAt: pickupAt,
          confirmedReturnAt: returnAt,
          status: BookingStatus.CONFIRMED,
          source: body.source === 'PHONE' ? BookingSource.PHONE : BookingSource.WALK_IN,
          ownerNotes: body.ownerNotes || 'Offline direct booking created by owner',
        },
      });

      await tx.bookingEvent.create({
        data: {
          bookingId: b.id,
          eventType: 'CONFIRMED',
          fromStatus: null,
          toStatus: BookingStatus.CONFIRMED,
          assignedVehicleId: lockedVehicle.id,
          actorType: ActorType.OWNER,
          notes: 'Direct offline booking confirmed by owner',
        },
      });

      return { booking: b, rawToken };
    });

    return jsonResponse(booking, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
