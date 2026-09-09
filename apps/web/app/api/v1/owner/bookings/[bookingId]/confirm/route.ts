import { NextRequest } from 'next/server';
import { jsonResponse, errorResponse } from '@/lib/server/api-response';
import { authenticateRequest } from '@/lib/server/api-auth';
import { confirmBooking } from '@/lib/server/booking-service';
import { DomainError } from '@/lib/server/errors';
import { ActorType } from '@prisma/client';

export async function POST(req: NextRequest, { params }: { params: { bookingId: string } }) {
  try {
    const session = await authenticateRequest(req);
    const businessId = session.businessId;
    const body = await req.json();

    if (!body.confirmedPickupAt || !body.confirmedReturnAt) {
      throw new DomainError('Fields "confirmedPickupAt" and "confirmedReturnAt" are required.', 'INVALID_INPUT', 400);
    }

    const pickupAt = new Date(body.confirmedPickupAt);
    const returnAt = new Date(body.confirmedReturnAt);

    if (isNaN(pickupAt.getTime()) || isNaN(returnAt.getTime())) {
      throw new DomainError('Confirmed dates must be valid ISO 8601 strings.', 'INVALID_INPUT', 400);
    }

    const updated = await confirmBooking({
      bookingId: params.bookingId,
      businessId,
      confirmedPickupAt: pickupAt,
      confirmedReturnAt: returnAt,
      explicitVehicleId: body.vehicleId || undefined,
      actorId: session.userId,
      actorType: ActorType.OWNER,
      ownerNotes: body.ownerNotes || undefined,
    });

    return jsonResponse(updated);
  } catch (error) {
    return errorResponse(error);
  }
}
