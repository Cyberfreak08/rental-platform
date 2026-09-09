import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/server/prisma';
import { jsonResponse, errorResponse } from '@/lib/server/api-response';
import { authenticateRequest } from '@/lib/server/api-auth';
import { BookingStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await authenticateRequest(req);
    const businessId = session.businessId;

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') as BookingStatus | null;
    const modelId = searchParams.get('modelId');
    const vehicleId = searchParams.get('vehicleId');
    const format = searchParams.get('format'); // 'json' or 'csv'
    const fromDateStr = searchParams.get('from');
    const toDateStr = searchParams.get('to');

    const fromDate = fromDateStr ? new Date(fromDateStr) : undefined;
    const toDate = toDateStr ? new Date(toDateStr) : undefined;

    const bookings = await prisma.booking.findMany({
      where: {
        businessId,
        status: status || undefined,
        vehicleModelId: modelId || undefined,
        assignedVehicleId: vehicleId || undefined,
        createdAt: {
          gte: fromDate,
          lte: toDate,
        },
      },
      select: {
        id: true,
        publicReference: true,
        customerName: true,
        customerPhone: true,
        customerEmail: true,
        requestedPickupAt: true,
        requestedReturnAt: true,
        confirmedPickupAt: true,
        confirmedReturnAt: true,
        status: true,
        source: true,
        createdAt: true,
        model: { select: { brand: true, name: true, pricePerDay: true } },
        assignedVehicle: { select: { internalCode: true, registrationRef: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (format === 'csv') {
      const headers = [
        'Booking Reference',
        'Customer Name',
        'Customer Phone',
        'Model',
        'Vehicle Internal Code',
        'Registration',
        'Status',
        'Source',
        'Requested Pickup',
        'Requested Return',
        'Confirmed Pickup',
        'Confirmed Return',
        'Created At',
      ];

      const rows = bookings.map((b) => [
        b.publicReference,
        `"${b.customerName.replace(/"/g, '""')}"`,
        b.customerPhone,
        `"${b.model.brand} ${b.model.name}"`,
        b.assignedVehicle?.internalCode || 'Unassigned',
        b.assignedVehicle?.registrationRef || '',
        b.status,
        b.source,
        b.requestedPickupAt.toISOString(),
        b.requestedReturnAt.toISOString(),
        b.confirmedPickupAt ? b.confirmedPickupAt.toISOString() : '',
        b.confirmedReturnAt ? b.confirmedReturnAt.toISOString() : '',
        b.createdAt.toISOString(),
      ]);

      const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="drivenest_bookings_report_${new Date().toISOString().slice(0, 10)}.csv"`,
        },
      });
    }

    return jsonResponse({
      totalCount: bookings.length,
      bookings,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
