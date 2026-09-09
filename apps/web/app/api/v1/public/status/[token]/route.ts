import { NextRequest } from 'next/server';
import { jsonResponse, errorResponse } from '@/lib/server/api-response';
import { getBookingByStatusToken } from '@/lib/server/booking-service';
import { sha256 } from '@/lib/server/security';
import { DomainError } from '@/lib/server/errors';

export async function GET(req: NextRequest, { params }: { params: { token: string } }) {
  try {
    const rawToken = params.token;
    if (!rawToken || rawToken.trim().length === 0) {
      throw new DomainError('Valid status token is required.', 'INVALID_INPUT', 400);
    }

    const tokenHash = sha256(rawToken.trim());
    const booking = await getBookingByStatusToken(tokenHash);

    return jsonResponse({
      id: booking.id,
      publicReference: booking.publicReference,
      status: booking.status,
      customerName: booking.customerName,
      requestedPickupAt: booking.requestedPickupAt,
      requestedReturnAt: booking.requestedReturnAt,
      confirmedPickupAt: booking.confirmedPickupAt,
      confirmedReturnAt: booking.confirmedReturnAt,
      ownerNotes: booking.ownerNotes,
      model: {
        id: booking.model.id,
        brand: booking.model.brand,
        name: booking.model.name,
        category: booking.model.category,
        fuelType: booking.model.fuelType,
        transmission: booking.model.transmission,
        seats: booking.model.seats,
        pricePerDay: Number(booking.model.pricePerDay),
        images: booking.model.images,
      },
      business: booking.business,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
