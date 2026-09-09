import { NextRequest } from 'next/server';
import { prisma } from '@/lib/server/prisma';
import { jsonResponse, errorResponse } from '@/lib/server/api-response';
import { getDefaultBusinessId } from '@/lib/server/api-auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const businessId = await getDefaultBusinessId();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const fuelType = searchParams.get('fuelType');
    const transmission = searchParams.get('transmission');

    const models = await prisma.vehicleModel.findMany({
      where: {
        businessId,
        isArchived: false,
        category: category || undefined,
        fuelType: fuelType || undefined,
        transmission: transmission || undefined,
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
          where: { imageKind: 'MODEL_DEFAULT' },
          select: {
            id: true,
            publicUrl: true,
            altText: true,
            sortOrder: true,
          },
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { pricePerDay: 'asc' },
    });

    return jsonResponse(models);
  } catch (error) {
    return errorResponse(error);
  }
}
