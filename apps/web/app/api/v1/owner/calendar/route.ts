import { NextRequest } from 'next/server';
import { prisma } from '@/lib/server/prisma';
import { jsonResponse, errorResponse, parseDateParam } from '@/lib/server/api-response';
import { authenticateRequest } from '@/lib/server/api-auth';
import { BookingStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await authenticateRequest(req);
    const businessId = session.businessId;

    const { searchParams } = new URL(req.url);
    const startsAtStr = searchParams.get('startsAt');
    const endsAtStr = searchParams.get('endsAt');

    const startsAt = parseDateParam(startsAtStr, 'startsAt');
    const endsAt = parseDateParam(endsAtStr, 'endsAt');

    // 1. Confirmed and Ongoing bookings in the interval
    const bookings = await prisma.booking.findMany({
      where: {
        businessId,
        status: { in: [BookingStatus.CONFIRMED, BookingStatus.ONGOING] },
        confirmedPickupAt: { lt: endsAt },
        confirmedReturnAt: { gt: startsAt },
      },
      select: {
        id: true,
        publicReference: true,
        customerName: true,
        customerPhone: true,
        status: true,
        confirmedPickupAt: true,
        confirmedReturnAt: true,
        model: { select: { id: true, name: true, brand: true } },
        assignedVehicle: { select: { id: true, internalCode: true, registrationRef: true } },
      },
    });

    // 2. Vehicle Blocks in the interval
    const blocks = await prisma.vehicleBlock.findMany({
      where: {
        businessId,
        startsAt: { lt: endsAt },
        endsAt: { gt: startsAt },
      },
      select: {
        id: true,
        physicalVehicleId: true,
        startsAt: true,
        endsAt: true,
        reason: true,
        vehicle: { select: { internalCode: true } },
      },
    });

    // 3. Business Closures in the interval
    const closures = await prisma.businessClosure.findMany({
      where: {
        businessId,
        startsAt: { lt: endsAt },
        endsAt: { gt: startsAt },
      },
      select: {
        id: true,
        startsAt: true,
        endsAt: true,
        reason: true,
      },
    });

    return jsonResponse({
      startsAt,
      endsAt,
      events: {
        bookings,
        blocks,
        closures,
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
