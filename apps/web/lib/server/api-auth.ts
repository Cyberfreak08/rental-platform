import { NextRequest } from 'next/server';
import { validateSession, SessionValidationResult } from './auth-service';
import { UnauthorizedError } from './errors';
import { prisma } from './prisma';

export const SESSION_COOKIE_NAME = 'dn_session_token';

/**
 * Extracts and validates the owner session token from HttpOnly cookie or Authorization header
 */
export async function authenticateRequest(req: NextRequest): Promise<SessionValidationResult> {
  let token = req.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    }
  }

  if (!token) {
    throw new UnauthorizedError('Authentication required. No session cookie or token provided.');
  }

  return await validateSession(token);
}

/**
 * Gets the default business profile ID (DriveNest V1 singleton tenant)
 */
export async function getDefaultBusinessId(): Promise<string> {
  const business = await prisma.businessProfile.findFirst({
    select: { id: true },
  });

  if (!business) {
    throw new Error('No business profile initialized. Please run database seed.');
  }

  return business.id;
}
