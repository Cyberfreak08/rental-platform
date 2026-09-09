import { NextRequest } from 'next/server';
import { prisma } from '@/lib/server/prisma';
import { jsonResponse, errorResponse } from '@/lib/server/api-response';
import { authenticateRequest } from '@/lib/server/api-auth';
import { BookingStatus, OperationalStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await authenticateRequest(req);
    const businessId = session.businessId;

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    // 1. Pending requests count
    const pendingCount = await prisma.booking.count({
      where: {
        businessId,
        status: BookingStatus.PENDING,
      },
    });

    // 2. Ongoing rentals count
    const ongoingCount = await prisma.booking.count({
      where: {
        businessId,
        status: BookingStatus.ONGOING,
      },
    });

    // 3. Today's pickups
    const todayPickups = await prisma.booking.count({
      where: {
        businessId,
        status: { in: [BookingStatus.CONFIRMED, BookingStatus.ONGOING] },
        confirmedPickupAt: { gte: startOfToday, lte: endOfToday },
      },
    });

    // 4. Today's returns
    const todayReturns = await prisma.booking.count({
      where: {
        businessId,
        status: { in: [BookingStatus.CONFIRMED, BookingStatus.ONGOING] },
        confirmedReturnAt: { gte: startOfToday, lte: endOfToday },
      },
    });

    // 5. Fleet summary
    const totalVehicles = await prisma.physicalVehicle.count({
      where: { businessId },
    });
    const activeVehicles = await prisma.physicalVehicle.count({
      where: { businessId, operationalStatus: OperationalStatus.ACTIVE },
    });
    const inactiveVehicles = await prisma.physicalVehicle.count({
      where: { businessId, operationalStatus: OperationalStatus.INACTIVE },
    });
    const archivedVehicles = await prisma.physicalVehicle.count({
      where: { businessId, operationalStatus: OperationalStatus.ARCHIVED },
    });

    // 6. Upcoming schedule (next 5 confirmed/pending bookings)
    const upcomingBookings = await prisma.booking.findMany({
      where: {
        businessId,
        status: { in: [BookingStatus.PENDING, BookingStatus.CONFIRMED, BookingStatus.ONGOING] },
      },
      select: {
        id: true,
        publicReference: true,
        customerName: true,
        status: true,
        requestedPickupAt: true,
        requestedReturnAt: true,
        confirmedPickupAt: true,
        confirmedReturnAt: true,
        model: { select: { name: true, brand: true } },
        assignedVehicle: { select: { internalCode: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    return jsonResponse({
      metrics: {
        pendingCount,
        ongoingCount,
        todayPickups,
        todayReturns,
        fleet: {
          total: totalVehicles,
          active: activeVehicles,
          inactive: inactiveVehicles,
          archived: archivedVehicles,
        },
      },
      upcomingBookings,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
