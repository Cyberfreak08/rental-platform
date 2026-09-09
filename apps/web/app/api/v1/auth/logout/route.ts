import { NextRequest } from 'next/server';
import { jsonResponse, errorResponse } from '@/lib/server/api-response';
import { revokeSession } from '@/lib/server/auth-service';
import { SESSION_COOKIE_NAME } from '@/lib/server/api-auth';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    if (token) {
      await revokeSession(token);
    }

    const response = jsonResponse({ message: 'Logged out successfully.' });
    response.cookies.delete(SESSION_COOKIE_NAME);
    return response;
  } catch (error) {
    return errorResponse(error);
  }
}
