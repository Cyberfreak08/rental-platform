import { NextRequest } from 'next/server';
import { prisma } from '@/lib/server/prisma';
import { jsonResponse, errorResponse } from '@/lib/server/api-response';
import { getDefaultBusinessId } from '@/lib/server/api-auth';
import { NotFoundError } from '@/lib/server/errors';

export async function GET(req: NextRequest, { params }: { params: { modelId: string } }) {
  try {
    const businessId = await getDefaultBusinessId();

    const model = await prisma.vehicleModel.findFirst({
      where: {
        id: params.modelId,
        businessId,
        isArchived: false,
      },
      select: {
        id: true,
        brand: true,
        name: true,
        category: true,
        fuelType: true,
        transmission: true,
        seats: true,
        pricePerDay: true,
        description: true,
        images: {
          select: {
            id: true,
            publicUrl: true,
            imageKind: true,
            altText: true,
            sortOrder: true,
          },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!model) {
      throw new NotFoundError('VehicleModel', params.modelId);
    }

    return jsonResponse(model);
  } catch (error) {
    return errorResponse(error);
  }
}
