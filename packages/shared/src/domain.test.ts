import { describe, it, expect } from 'vitest';
import {
  DomainError,
  NotFoundError,
  InvalidStateTransitionError,
  ConcurrencyConflictError,
  VehicleUnavailableError,
  ModelUnavailableError,
  ModelVehicleMismatchError,
  VehicleNotActiveError,
  InvalidIntervalError,
  BusinessClosureConflictError,
} from '../../../apps/web/lib/server/errors';
import { validateStateTransition } from '../../../apps/web/lib/server/booking-service';
import {
  sha256,
  generateToken,
  generateTokenPair,
  hashPassword,
  verifyPassword,
} from '../../../apps/web/lib/server/security';
import { BookingStatus } from '@prisma/client';

describe('1. Security & Token Hashing Utilities', () => {
  it('generates high-entropy tokens and valid SHA-256 hashes', () => {
    const token1 = generateToken(32);
    const token2 = generateToken(32);
    expect(token1).not.toEqual(token2);
    expect(token1.length).toBeGreaterThan(30);

    const hash1 = sha256(token1);
    const hash2 = sha256(token1);
    expect(hash1).toEqual(hash2);
    expect(hash1.length).toBe(64); // hex encoded 256 bits
  });

  it('generates token pairs consistently', () => {
    const { rawToken, tokenHash } = generateTokenPair(32);
    expect(sha256(rawToken)).toEqual(tokenHash);
  });

  it('hashes and verifies passwords accurately with timing-safe comparison', () => {
    const password = 'SecretPassword123!';
    const hash = hashPassword(password);
    expect(verifyPassword(password, hash)).toBe(true);
    expect(verifyPassword('WrongPassword', hash)).toBe(false);
  });
});

describe('2. Booking State Machine Transitions', () => {
  it('allows valid PENDING -> CONFIRMED and PENDING -> REJECTED transitions', () => {
    expect(() => validateStateTransition(BookingStatus.PENDING, BookingStatus.CONFIRMED)).not.toThrow();
    expect(() => validateStateTransition(BookingStatus.PENDING, BookingStatus.REJECTED)).not.toThrow();
  });

  it('allows valid CONFIRMED -> ONGOING and CONFIRMED -> CANCELLED transitions', () => {
    expect(() => validateStateTransition(BookingStatus.CONFIRMED, BookingStatus.ONGOING)).not.toThrow();
    expect(() => validateStateTransition(BookingStatus.CONFIRMED, BookingStatus.CANCELLED)).not.toThrow();
  });

  it('allows valid ONGOING -> COMPLETED and ONGOING -> CANCELLED transitions', () => {
    expect(() => validateStateTransition(BookingStatus.ONGOING, BookingStatus.COMPLETED)).not.toThrow();
    expect(() => validateStateTransition(BookingStatus.ONGOING, BookingStatus.CANCELLED)).not.toThrow();
  });

  it('disallows arbitrary invalid transitions', () => {
    // PENDING cannot jump to ONGOING or COMPLETED
    expect(() => validateStateTransition(BookingStatus.PENDING, BookingStatus.ONGOING)).toThrow(
      InvalidStateTransitionError
    );
    expect(() => validateStateTransition(BookingStatus.PENDING, BookingStatus.COMPLETED)).toThrow(
      InvalidStateTransitionError
    );

    // COMPLETED cannot transition to anything
    expect(() => validateStateTransition(BookingStatus.COMPLETED, BookingStatus.ONGOING)).toThrow(
      InvalidStateTransitionError
    );
    expect(() => validateStateTransition(BookingStatus.COMPLETED, BookingStatus.CANCELLED)).toThrow(
      InvalidStateTransitionError
    );

    // REJECTED cannot transition to CONFIRMED
    expect(() => validateStateTransition(BookingStatus.REJECTED, BookingStatus.CONFIRMED)).toThrow(
      InvalidStateTransitionError
    );
  });
});

describe('3. Overlap Logic Invariant: [start, end) Half-Open Interval', () => {
  function checkIntervalOverlap(
    existingStart: Date,
    existingEnd: Date,
    requestedStart: Date,
    requestedEnd: Date
  ): boolean {
    return existingStart < requestedEnd && existingEnd > requestedStart;
  }

  const baseStart = new Date('2026-09-10T10:00:00Z');
  const baseEnd = new Date('2026-09-12T18:00:00Z');

  it('detects exact overlapping intervals', () => {
    const reqStart = new Date('2026-09-11T09:00:00Z');
    const reqEnd = new Date('2026-09-13T12:00:00Z');
    expect(checkIntervalOverlap(baseStart, baseEnd, reqStart, reqEnd)).toBe(true);
  });

  it('detects internal sub-intervals as overlapping', () => {
    const reqStart = new Date('2026-09-11T12:00:00Z');
    const reqEnd = new Date('2026-09-11T16:00:00Z');
    expect(checkIntervalOverlap(baseStart, baseEnd, reqStart, reqEnd)).toBe(true);
  });

  it('allows back-to-back rentals (zero turnaround buffer)', () => {
    // Case 1: Requested ends exactly when existing starts
    const beforeStart = new Date('2026-09-08T10:00:00Z');
    const beforeEnd = new Date('2026-09-10T10:00:00Z'); // matches baseStart
    expect(checkIntervalOverlap(baseStart, baseEnd, beforeStart, beforeEnd)).toBe(false);

    // Case 2: Requested starts exactly when existing ends
    const afterStart = new Date('2026-09-12T18:00:00Z'); // matches baseEnd
    const afterEnd = new Date('2026-09-14T10:00:00Z');
    expect(checkIntervalOverlap(baseStart, baseEnd, afterStart, afterEnd)).toBe(false);
  });

  it('does not overlap with non-adjacent intervals', () => {
    const reqStart = new Date('2026-09-15T10:00:00Z');
    const reqEnd = new Date('2026-09-16T10:00:00Z');
    expect(checkIntervalOverlap(baseStart, baseEnd, reqStart, reqEnd)).toBe(false);
  });
});

describe('4. Domain Error Taxonomy', () => {
  it('provides structured status codes and error codes', () => {
    const errNotFound = new NotFoundError('Booking', 'b-123');
    expect(errNotFound.status).toBe(404);
    expect(errNotFound.code).toBe('NOT_FOUND');

    const errConflict = new ConcurrencyConflictError('Lock conflict');
    expect(errConflict.status).toBe(409);
    expect(errConflict.code).toBe('CONCURRENCY_CONFLICT');

    const errModelUnavailable = new ModelUnavailableError('model-swift');
    expect(errModelUnavailable.status).toBe(409);
    expect(errModelUnavailable.code).toBe('MODEL_UNAVAILABLE');

    const errClosure = new BusinessClosureConflictError('Holiday');
    expect(errClosure.status).toBe(409);
    expect(errClosure.code).toBe('BUSINESS_CLOSED');

    const errMismatch = new ModelVehicleMismatchError('car-1', 'model-swift', 'model-i20');
    expect(errMismatch.status).toBe(400);
    expect(errMismatch.code).toBe('MODEL_VEHICLE_MISMATCH');

    const errNotActive = new VehicleNotActiveError('car-3', 'INACTIVE');
    expect(errNotActive.status).toBe(400);
    expect(errNotActive.code).toBe('VEHICLE_NOT_ACTIVE');
  });
});
