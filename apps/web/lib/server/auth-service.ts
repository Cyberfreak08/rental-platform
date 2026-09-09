import { prisma } from './prisma';
import {
  NotFoundError,
  UnauthorizedError,
} from './errors';
import {
  hashPassword,
  verifyPassword,
  generateTokenPair,
  sha256,
} from './security';

export interface LoginInput {
  businessId: string;
  email: string;
  password: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface SessionValidationResult {
  userId: string;
  businessId: string;
  email: string;
  name: string;
  sessionId: string;
}

/**
 * 1. Owner Login -> Verify credentials and create opaque server-side session
 */
export async function authenticateOwner(input: LoginInput): Promise<{
  rawSessionToken: string;
  sessionExpiry: Date;
  user: { id: string; email: string; name: string };
}> {
  const user = await prisma.adminUser.findFirst({
    where: {
      businessId: input.businessId,
      email: input.email.toLowerCase().trim(),
      isActive: true,
    },
  });

  if (!user) {
    throw new UnauthorizedError('Invalid email or password.');
  }

  // Verify password
  const isValid =
    verifyPassword(input.password, user.passwordHash) ||
    // Support un-salted SHA-256 for initial seed development
    sha256(input.password) === user.passwordHash;

  if (!isValid) {
    throw new UnauthorizedError('Invalid email or password.');
  }

  // Generate opaque session token
  const { rawToken, tokenHash } = generateTokenPair(32);
  const sessionExpiry = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days

  await prisma.adminSession.create({
    data: {
      userId: user.id,
      sessionTokenHash: tokenHash,
      expiresAt: sessionExpiry,
      ipAddress: input.ipAddress || null,
      userAgent: input.userAgent || null,
    },
  });

  return {
    rawSessionToken: rawToken,
    sessionExpiry,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
  };
}

/**
 * 2. Validate session token hash from cookie / header
 */
export async function validateSession(rawSessionToken: string): Promise<SessionValidationResult> {
  if (!rawSessionToken) {
    throw new UnauthorizedError('No session token provided.');
  }

  const tokenHash = sha256(rawSessionToken);

  const session = await prisma.adminSession.findUnique({
    where: { sessionTokenHash: tokenHash },
    include: {
      user: {
        select: {
          id: true,
          businessId: true,
          email: true,
          name: true,
          isActive: true,
        },
      },
    },
  });

  if (!session) {
    throw new UnauthorizedError('Session not found or invalid.');
  }

  if (session.revokedAt) {
    throw new UnauthorizedError('Session has been revoked.');
  }

  if (session.expiresAt < new Date()) {
    throw new UnauthorizedError('Session has expired.');
  }

  if (!session.user || !session.user.isActive) {
    throw new UnauthorizedError('User account is deactivated.');
  }

  return {
    userId: session.user.id,
    businessId: session.user.businessId,
    email: session.user.email,
    name: session.user.name,
    sessionId: session.id,
  };
}

/**
 * 3. Revoke single session on logout
 */
export async function revokeSession(rawSessionToken: string): Promise<void> {
  const tokenHash = sha256(rawSessionToken);

  await prisma.adminSession.updateMany({
    where: { sessionTokenHash: tokenHash, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

/**
 * 4. Revoke all active sessions for a user (e.g. password change)
 */
export async function revokeAllUserSessions(userId: string): Promise<void> {
  await prisma.adminSession.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}
