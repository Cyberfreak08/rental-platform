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

    const settings = await prisma.businessProfile.findUnique({
      where: { id: businessId },
      include: {
        hours: { orderBy: { weekday: 'asc' } },
        content: true,
        faqs: { orderBy: { sortOrder: 'asc' } },
      },
    });

    return jsonResponse(settings);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await authenticateRequest(req);
    const businessId = session.businessId;
    const body = await req.json();

    // Update business profile fields
    const updated = await prisma.businessProfile.update({
      where: { id: businessId },
      data: {
        name: body.name !== undefined ? body.name : undefined,
        phone: body.phone !== undefined ? body.phone : undefined,
        whatsappNumber: body.whatsappNumber !== undefined ? body.whatsappNumber : undefined,
        email: body.email !== undefined ? body.email : undefined,
        address: body.address !== undefined ? body.address : undefined,
        city: body.city !== undefined ? body.city : undefined,
      },
    });

    // Update policies/content if provided
    if (body.content) {
      await prisma.businessContent.upsert({
        where: { businessId },
        create: {
          businessId,
          aboutContent: body.content.aboutContent,
          whyChooseUs: body.content.whyChooseUs,
          servicesContent: body.content.servicesContent,
          pickupInstructions: body.content.pickupInstructions,
          returnInstructions: body.content.returnInstructions,
          fuelPolicy: body.content.fuelPolicy,
          kmPolicy: body.content.kmPolicy,
          cancellationPolicy: body.content.cancellationPolicy,
          googleReviewUrl: body.content.googleReviewUrl,
        },
        update: {
          aboutContent: body.content.aboutContent !== undefined ? body.content.aboutContent : undefined,
          whyChooseUs: body.content.whyChooseUs !== undefined ? body.content.whyChooseUs : undefined,
          servicesContent: body.content.servicesContent !== undefined ? body.content.servicesContent : undefined,
          pickupInstructions: body.content.pickupInstructions !== undefined ? body.content.pickupInstructions : undefined,
          returnInstructions: body.content.returnInstructions !== undefined ? body.content.returnInstructions : undefined,
          fuelPolicy: body.content.fuelPolicy !== undefined ? body.content.fuelPolicy : undefined,
          kmPolicy: body.content.kmPolicy !== undefined ? body.content.kmPolicy : undefined,
          cancellationPolicy: body.content.cancellationPolicy !== undefined ? body.content.cancellationPolicy : undefined,
          googleReviewUrl: body.content.googleReviewUrl !== undefined ? body.content.googleReviewUrl : undefined,
        },
      });
    }

    // Update hours if provided
    if (Array.isArray(body.hours)) {
      for (const h of body.hours) {
        if (h.weekday !== undefined) {
          await prisma.businessHour.upsert({
            where: {
              businessId_weekday: {
                businessId,
                weekday: Number(h.weekday),
              },
            },
            create: {
              businessId,
              weekday: Number(h.weekday),
              opensAt: h.opensAt,
              closesAt: h.closesAt,
              isClosed: Boolean(h.isClosed),
            },
            update: {
              opensAt: h.opensAt !== undefined ? h.opensAt : undefined,
              closesAt: h.closesAt !== undefined ? h.closesAt : undefined,
              isClosed: h.isClosed !== undefined ? Boolean(h.isClosed) : undefined,
            },
          });
        }
      }
    }

    return jsonResponse({ message: 'Settings updated successfully.', profile: updated });
  } catch (error) {
    return errorResponse(error);
  }
}
