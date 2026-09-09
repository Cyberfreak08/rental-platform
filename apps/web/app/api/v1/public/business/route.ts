import { NextRequest } from 'next/server';
import { prisma } from '@/lib/server/prisma';
import { jsonResponse, errorResponse } from '@/lib/server/api-response';
import { getDefaultBusinessId } from '@/lib/server/api-auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const businessId = await getDefaultBusinessId();

    const business = await prisma.businessProfile.findUnique({
      where: { id: businessId },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        phone: true,
        whatsappNumber: true,
        email: true,
        address: true,
        city: true,
        mapUrl: true,
        logoUrl: true,
        timezone: true,
        hours: {
          select: {
            weekday: true,
            opensAt: true,
            closesAt: true,
            isClosed: true,
          },
          orderBy: { weekday: 'asc' },
        },
        content: {
          select: {
            aboutContent: true,
            whyChooseUs: true,
            servicesContent: true,
            pickupInstructions: true,
            returnInstructions: true,
            fuelPolicy: true,
            kmPolicy: true,
            cancellationPolicy: true,
            googleReviewUrl: true,
          },
        },
      },
    });

    if (!business) {
      return jsonResponse({ error: 'Business profile not found' }, 404);
    }

    return jsonResponse(business);
  } catch (error) {
    return errorResponse(error);
  }
}
