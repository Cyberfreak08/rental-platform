import { NextRequest } from 'next/server';
import { prisma } from '@/lib/server/prisma';
import { jsonResponse, errorResponse } from '@/lib/server/api-response';
import { authenticateRequest } from '@/lib/server/api-auth';
import { DomainError, NotFoundError } from '@/lib/server/errors';
import { OperationalStatus } from '@prisma/client';

export async function PATCH(req: NextRequest, { params }: { params: { vehicleId: string } }) {
  try {
    const session = await authenticateRequest(req);
    const businessId = session.businessId;
    const body = await req.json();

    const existing = await prisma.physicalVehicle.findFirst({
      where: { id: params.vehicleId, businessId },
    });

    if (!existing) {
      throw new NotFoundError('PhysicalVehicle', params.vehicleId);
    }

    const updated = await prisma.physicalVehicle.update({
      where: { id: params.vehicleId },
      data: {
        modelYear: body.modelYear !== undefined ? Number(body.modelYear) : undefined,
        registrationRef: body.registrationRef !== undefined ? body.registrationRef : undefined,
        operationalStatus: body.operationalStatus !== undefined ? (body.operationalStatus as OperationalStatus) : undefined,
        inactiveReason: body.inactiveReason !== undefined ? body.inactiveReason : undefined,
        internalNotes: body.internalNotes !== undefined ? body.internalNotes : undefined,
      },
    });

    return jsonResponse(updated);
  } catch (error) {
    return errorResponse(error);
  }
}
