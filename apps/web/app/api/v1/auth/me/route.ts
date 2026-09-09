import { NextRequest } from 'next/server';
import { jsonResponse, errorResponse } from '@/lib/server/api-response';
import { authenticateRequest } from '@/lib/server/api-auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await authenticateRequest(req);

    return jsonResponse({
      user: {
        id: session.userId,
        email: session.email,
        name: session.name,
        businessId: session.businessId,
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
