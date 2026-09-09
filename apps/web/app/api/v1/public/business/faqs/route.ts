import { NextRequest } from 'next/server';
import { prisma } from '@/lib/server/prisma';
import { jsonResponse, errorResponse } from '@/lib/server/api-response';
import { getDefaultBusinessId } from '@/lib/server/api-auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const businessId = await getDefaultBusinessId();

    const faqs = await prisma.faq.findMany({
      where: {
        businessId,
        isActive: true,
      },
      select: {
        id: true,
        question: true,
        answer: true,
        sortOrder: true,
      },
      orderBy: { sortOrder: 'asc' },
    });

    return jsonResponse(faqs);
  } catch (error) {
    return errorResponse(error);
  }
}
