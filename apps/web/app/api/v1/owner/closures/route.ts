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

    const closures = await prisma.businessClosure.findMany({
      where: { businessId },
      orderBy: { startsAt: 'desc' },
    });

    return jsonResponse(closures);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await authenticateRequest(req);
    const businessId = session.businessId;
    const body = await req.json();

    if (!body.startsAt || !body.endsAt) {
      throw new DomainError('Fields "startsAt" and "endsAt" are required.', 'INVALID_INPUT', 400);
    }

    const startsAt = new Date(body.startsAt);
    const endsAt = new Date(body.endsAt);

    if (isNaN(startsAt.getTime()) || isNaN(endsAt.getTime()) || startsAt >= endsAt) {
      throw new DomainError('Invalid closure start or end timestamp.', 'INVALID_INPUT', 400);
    }

    const closure = await prisma.businessClosure.create({
      data: {
        businessId,
        startsAt,
        endsAt,
        reason: body.reason ? body.reason.trim() : null,
      },
    });

    return jsonResponse(closure, 201);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await authenticateRequest(req);
    const businessId = session.businessId;
    const { searchParams } = new URL(req.url);
    const closureId = searchParams.get('closureId');

    if (!closureId) {
      throw new DomainError('Query parameter "closureId" is required.', 'INVALID_INPUT', 400);
    }

    const closure = await prisma.businessClosure.findFirst({
      where: { id: closureId, businessId },
    });

    if (!closure) {
      throw new DomainError('Business closure not found.', 'NOT_FOUND', 404);
    }

    await prisma.businessClosure.delete({
      where: { id: closureId },
    });

    return jsonResponse({ message: 'Business closure deleted successfully.' });
  } catch (error) {
    return errorResponse(error);
  }
}
