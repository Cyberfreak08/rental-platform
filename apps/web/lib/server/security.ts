import * as crypto from 'crypto';

/**
 * SHA-256 hash helper for tokens and passwords
 */
export function sha256(input: string): string {
  return crypto.createHash('sha256').update(input).digest('hex');
}

/**
 * Generates a high-entropy cryptographically secure random token.
 * Formatted as URL-safe base64 string.
 */
export function generateToken(byteLength: number = 32): string {
  return crypto.randomBytes(byteLength).toString('base64url');
}

/**
 * Generates a pair of { rawToken, tokenHash }.
 * The raw token is returned to the client once (e.g. status link or cookie).
 * The tokenHash is stored in the database.
 */
export function generateTokenPair(byteLength: number = 32): { rawToken: string; tokenHash: string } {
  const rawToken = generateToken(byteLength);
  const tokenHash = sha256(rawToken);
  return { rawToken, tokenHash };
}

/**
 * Hash password using SHA-256 with salt for development/V1.
 */
export function hashPassword(password: string, salt: string = 'drivenest_salt'): string {
  return crypto.createHash('sha256').update(`${salt}:${password}`).digest('hex');
}

/**
 * Verify password against stored hash.
 */
export function verifyPassword(password: string, storedHash: string, salt: string = 'drivenest_salt'): boolean {
  const computedHash = hashPassword(password, salt);
  return crypto.timingSafeEqual(Buffer.from(computedHash), Buffer.from(storedHash));
}
