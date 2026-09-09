import { NextRequest } from 'next/server';
import { prisma } from '@/lib/server/prisma';
import { jsonResponse, errorResponse } from '@/lib/server/api-response';
import { authenticateRequest } from '@/lib/server/api-auth';
import { DomainError, VehicleUnavailableError } from '@/lib/server/errors';
import { checkVehicleAvailability } from '@/lib/server/availability';

export async function POST(req: NextRequest) {
  try {
    const session = await authenticateRequest(req);
    const businessId = session.businessId;
    const body = await req.json();

    if (!body.physicalVehicleId || !body.startsAt || !body.endsAt) {
      throw new DomainError('Fields "physicalVehicleId", "startsAt", and "endsAt" are required.', 'INVALID_INPUT', 400);
    }

    const startsAt = new Date(body.startsAt);
    const endsAt = new Date(body.endsAt);

    if (isNaN(startsAt.getTime()) || isNaN(endsAt.getTime()) || startsAt >= endsAt) {
      throw new DomainError('Invalid block start or end timestamp.', 'INVALID_INPUT', 400);
    }

    // Check if vehicle exists
    const vehicle = await prisma.physicalVehicle.findFirst({
      where: { id: body.physicalVehicleId, businessId },
    });

    if (!vehicle) {
      throw new DomainError('Physical vehicle not found.', 'NOT_FOUND', 404);
    }

    // Verify no conflicting confirmed/ongoing bookings
    const { isAvailable, reason } = await checkVehicleAvailability(vehicle.id, startsAt, endsAt);
    if (!isAvailable) {
      throw new VehicleUnavailableError(`Cannot block vehicle: ${reason}`);
    }

    const block = await prisma.vehicleBlock.create({
      data: {
        businessId,
        physicalVehicleId: vehicle.id,
        startsAt,
        endsAt,
        reason: body.reason ? body.reason.trim() : null,
      },
    });

    return jsonResponse(block, 201);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await authenticateRequest(req);
    const businessId = session.businessId;
    const { searchParams } = new URL(req.url);
    const blockId = searchParams.get('blockId');

    if (!blockId) {
      throw new DomainError('Query parameter "blockId" is required.', 'INVALID_INPUT', 400);
    }

    const block = await prisma.vehicleBlock.findFirst({
      where: { id: blockId, businessId },
    });

    if (!block) {
      throw new DomainError('Vehicle block not found.', 'NOT_FOUND', 404);
    }

    await prisma.vehicleBlock.delete({
      where: { id: blockId },
    });

    return jsonResponse({ message: 'Vehicle block deleted successfully.' });
  } catch (error) {
    return errorResponse(error);
  }
}
