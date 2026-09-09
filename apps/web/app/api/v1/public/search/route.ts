import { NextRequest } from 'next/server';
import { prisma } from '@/lib/server/prisma';
import { jsonResponse, errorResponse, parseDateParam } from '@/lib/server/api-response';
import { getDefaultBusinessId } from '@/lib/server/api-auth';
import { calculateModelAvailability } from '@/lib/server/availability';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const businessId = await getDefaultBusinessId();
    const { searchParams } = new URL(req.url);
    const pickupAtStr = searchParams.get('pickupAt');
    const returnAtStr = searchParams.get('returnAt');
    const modelIdFilter = searchParams.get('modelId');
    const categoryFilter = searchParams.get('category');

    const pickupAt = parseDateParam(pickupAtStr, 'pickupAt');
    const returnAt = parseDateParam(returnAtStr, 'returnAt');

    // Fetch active models
    const models = await prisma.vehicleModel.findMany({
      where: {
        businessId,
        isArchived: false,
        id: modelIdFilter || undefined,
        category: categoryFilter || undefined,
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
          select: { publicUrl: true, altText: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { pricePerDay: 'asc' },
    });

    const results = [];

    for (const model of models) {
      const avail = await calculateModelAvailability(businessId, model.id, pickupAt, returnAt);
      results.push({
        modelId: model.id,
        brand: model.brand,
        name: model.name,
        category: model.category,
        fuelType: model.fuelType,
        transmission: model.transmission,
        seats: model.seats,
        pricePerDay: Number(model.pricePerDay),
        images: model.images,
        isAvailable: avail.isAvailable,
        availableCount: avail.eligibleCount,
        totalActiveCount: avail.totalActiveCount,
      });
    }

    return jsonResponse(results);
  } catch (error) {
    return errorResponse(error);
  }
}
