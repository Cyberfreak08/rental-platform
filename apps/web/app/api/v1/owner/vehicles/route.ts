import { NextRequest } from 'next/server';
import { prisma } from '@/lib/server/prisma';
import { jsonResponse, errorResponse } from '@/lib/server/api-response';
import { authenticateRequest } from '@/lib/server/api-auth';
import { DomainError, NotFoundError } from '@/lib/server/errors';
import { OperationalStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await authenticateRequest(req);
    const businessId = session.businessId;

    const vehicles = await prisma.physicalVehicle.findMany({
      where: { businessId },
      include: {
        model: {
          select: {
            id: true,
            brand: true,
            name: true,
            category: true,
          },
        },
        blocks: {
          where: { endsAt: { gte: new Date() } },
          orderBy: { startsAt: 'asc' },
        },
      },
      orderBy: { internalCode: 'asc' },
    });

    return jsonResponse(vehicles);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await authenticateRequest(req);
    const businessId = session.businessId;
    const body = await req.json();

    if (!body.vehicleModelId || !body.internalCode) {
      throw new DomainError('Fields "vehicleModelId" and "internalCode" are required.', 'INVALID_INPUT', 400);
    }

    const model = await prisma.vehicleModel.findFirst({
      where: { id: body.vehicleModelId, businessId },
    });

    if (!model) {
      throw new NotFoundError('VehicleModel', body.vehicleModelId);
    }

    const vehicle = await prisma.physicalVehicle.create({
      data: {
        businessId,
        vehicleModelId: body.vehicleModelId,
        internalCode: body.internalCode.trim(),
        modelYear: body.modelYear ? Number(body.modelYear) : null,
        registrationRef: body.registrationRef ? body.registrationRef.trim() : null,
        operationalStatus: (body.operationalStatus as OperationalStatus) || OperationalStatus.ACTIVE,
        inactiveReason: body.inactiveReason ? body.inactiveReason.trim() : null,
        internalNotes: body.internalNotes ? body.internalNotes.trim() : null,
      },
    });

    return jsonResponse(vehicle, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
