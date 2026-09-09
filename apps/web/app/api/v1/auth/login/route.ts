import { NextRequest, NextResponse } from 'next/server';
import { jsonResponse, errorResponse } from '@/lib/server/api-response';
import { authenticateOwner, revokeSession, validateSession } from '@/lib/server/auth-service';
import { getDefaultBusinessId, SESSION_COOKIE_NAME, authenticateRequest } from '@/lib/server/api-auth';
import { DomainError } from '@/lib/server/errors';

export async function POST(req: NextRequest) {
  try {
    const businessId = await getDefaultBusinessId();
    const body = await req.json();

    if (!body.email || !body.password) {
      throw new DomainError('Both email and password are required.', 'INVALID_INPUT', 400);
    }

    const { rawSessionToken, sessionExpiry, user } = await authenticateOwner({
      businessId,
      email: body.email,
      password: body.password,
      ipAddress: req.headers.get('x-forwarded-for') || req.ip || undefined,
      userAgent: req.headers.get('user-agent') || undefined,
    });

    const response = jsonResponse({
      user,
      expiresAt: sessionExpiry,
    });

    // Set secure HttpOnly cookie
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: rawSessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: sessionExpiry,
    });

    return response;
  } catch (error) {
    return errorResponse(error);
  }
}
