import { NextRequest } from 'next/server';
import { jsonResponse, errorResponse } from '@/lib/server/api-response';
import { authenticateRequest } from '@/lib/server/api-auth';
import { reassignBooking } from '@/lib/server/booking-service';
import { DomainError } from '@/lib/server/errors';
import { ActorType } from '@prisma/client';

export async function POST(req: NextRequest, { params }: { params: { bookingId: string } }) {
  try {
    const session = await authenticateRequest(req);
    const businessId = session.businessId;
    const body = await req.json();

    if (!body.targetVehicleId) {
      throw new DomainError('Field "targetVehicleId" is required.', 'INVALID_INPUT', 400);
    }

    const updated = await reassignBooking({
      bookingId: params.bookingId,
      businessId,
      targetVehicleId: body.targetVehicleId,
      reason: body.reason || undefined,
      actorId: session.userId,
      actorType: ActorType.OWNER,
    });

    return jsonResponse(updated);
  } catch (error) {
    return errorResponse(error);
  }
}
