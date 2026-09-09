import { NextRequest } from 'next/server';
import { jsonResponse, errorResponse } from '@/lib/server/api-response';
import { authenticateRequest } from '@/lib/server/api-auth';
import { completeRental } from '@/lib/server/booking-service';
import { ActorType } from '@prisma/client';

export async function POST(req: NextRequest, { params }: { params: { bookingId: string } }) {
  try {
    const session = await authenticateRequest(req);
    const businessId = session.businessId;
    let notes: string | undefined;

    try {
      const body = await req.json();
      notes = body.notes;
    } catch {
      // Body is optional
    }

    const updated = await completeRental(params.bookingId, businessId, notes, ActorType.OWNER);

    return jsonResponse(updated);
  } catch (error) {
    return errorResponse(error);
  }
}
