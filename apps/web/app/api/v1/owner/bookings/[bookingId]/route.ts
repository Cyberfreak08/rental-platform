import { NextRequest } from 'next/server';
import { prisma } from '@/lib/server/prisma';
import { jsonResponse, errorResponse } from '@/lib/server/api-response';
import { authenticateRequest } from '@/lib/server/api-auth';
import { NotFoundError } from '@/lib/server/errors';

export async function GET(req: NextRequest, { params }: { params: { bookingId: string } }) {
  try {
    const session = await authenticateRequest(req);
    const businessId = session.businessId;

    const booking = await prisma.booking.findFirst({
      where: {
        id: params.bookingId,
        businessId,
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
        updatedAt: true,
        model: {
          select: {
            id: true,
            brand: true,
            name: true,
            category: true,
            fuelType: true,
            transmission: true,
            seats: true,
            pricePerDay: true,
          },
        },
        assignedVehicle: {
          select: {
            id: true,
            internalCode: true,
            registrationRef: true,
            operationalStatus: true,
            internalNotes: true,
          },
        },
        events: {
          select: {
            id: true,
            eventType: true,
            fromStatus: true,
            toStatus: true,
            previousVehicleId: true,
            assignedVehicleId: true,
            actorType: true,
            notes: true,
            metadataJson: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!booking) {
      throw new NotFoundError('Booking', params.bookingId);
    }

    return jsonResponse(booking);
  } catch (error) {
    return errorResponse(error);
  }
}
