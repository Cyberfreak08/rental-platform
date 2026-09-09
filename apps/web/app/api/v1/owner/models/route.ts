import { NextRequest } from 'next/server';
import { prisma } from '@/lib/server/prisma';
import { jsonResponse, errorResponse } from '@/lib/server/api-response';
import { authenticateRequest } from '@/lib/server/api-auth';
import { DomainError } from '@/lib/server/errors';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await authenticateRequest(req);
    const businessId = session.businessId;

    const models = await prisma.vehicleModel.findMany({
      where: { businessId },
      include: {
        vehicles: {
          select: {
            id: true,
            internalCode: true,
            modelYear: true,
            registrationRef: true,
            operationalStatus: true,
            inactiveReason: true,
            internalNotes: true,
          },
          orderBy: { internalCode: 'asc' },
        },
        images: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    return jsonResponse(models);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await authenticateRequest(req);
    const businessId = session.businessId;
    const body = await req.json();

    if (!body.brand || !body.name || !body.category || !body.fuelType || !body.transmission || !body.seats || !body.pricePerDay) {
      throw new DomainError('Missing required vehicle model fields.', 'INVALID_INPUT', 400);
    }

    const model = await prisma.vehicleModel.create({
      data: {
        businessId,
        brand: body.brand.trim(),
        name: body.name.trim(),
        category: body.category.trim(),
        fuelType: body.fuelType.trim(),
        transmission: body.transmission.trim(),
        seats: Number(body.seats),
        pricePerDay: Number(body.pricePerDay),
        description: body.description ? body.description.trim() : null,
      },
    });

    return jsonResponse(model, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
