import { NextRequest } from 'next/server';
import { jsonResponse, errorResponse } from '@/lib/server/api-response';
import { getDefaultBusinessId } from '@/lib/server/api-auth';
import { createBookingRequest } from '@/lib/server/booking-service';
import { DomainError } from '@/lib/server/errors';

export async function POST(req: NextRequest) {
  try {
    const businessId = await getDefaultBusinessId();
    const body = await req.json();

    if (!body.modelId) {
      throw new DomainError('Field "modelId" is required.', 'INVALID_INPUT', 400);
    }
    if (!body.customerName || typeof body.customerName !== 'string') {
      throw new DomainError('Field "customerName" is required.', 'INVALID_INPUT', 400);
    }
    if (!body.customerPhone || typeof body.customerPhone !== 'string') {
      throw new DomainError('Field "customerPhone" is required.', 'INVALID_INPUT', 400);
    }
    if (!body.requestedPickupAt) {
      throw new DomainError('Field "requestedPickupAt" is required.', 'INVALID_INPUT', 400);
    }
    if (!body.requestedReturnAt) {
      throw new DomainError('Field "requestedReturnAt" is required.', 'INVALID_INPUT', 400);
    }

    const pickupAt = new Date(body.requestedPickupAt);
    const returnAt = new Date(body.requestedReturnAt);

    if (isNaN(pickupAt.getTime()) || isNaN(returnAt.getTime())) {
      throw new DomainError('Dates must be valid ISO 8601 strings.', 'INVALID_INPUT', 400);
    }

    const { booking, rawStatusToken } = await createBookingRequest({
      businessId,
      vehicleModelId: body.modelId,
      customerName: body.customerName.trim(),
      customerPhone: body.customerPhone.trim(),
      customerEmail: body.customerEmail ? body.customerEmail.trim() : undefined,
      customerMessage: body.customerMessage ? body.customerMessage.trim() : undefined,
      requestedPickupAt: pickupAt,
      requestedReturnAt: returnAt,
      source: 'WEBSITE',
    });

    return jsonResponse(
      {
        bookingId: booking.id,
        publicReference: booking.publicReference,
        status: booking.status,
        requestedPickupAt: booking.requestedPickupAt,
        requestedReturnAt: booking.requestedReturnAt,
        statusToken: rawStatusToken,
        statusUrl: `/status/${rawStatusToken}`,
      },
      201
    );
  } catch (error) {
    return errorResponse(error);
  }
}
