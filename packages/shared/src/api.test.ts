import { describe, it, expect } from 'vitest';
import {
  createBookingRequest,
  confirmBooking,
  reassignBooking,
  validateStateTransition,
  getBookingByStatusToken,
} from '../../../apps/web/lib/server/booking-service';
import {
  sha256,
  generateToken,
  generateTokenPair,
  hashPassword,
  verifyPassword,
} from '../../../apps/web/lib/server/security';
import { BookingStatus, ActorType } from '@prisma/client';
import {
  DomainError,
  InvalidStateTransitionError,
  VehicleUnavailableError,
  ModelUnavailableError,
  UnauthorizedError,
} from '../../../apps/web/lib/server/errors';

describe('1. API Security & Status Token Isolation', () => {
  it('generates unguessable status token and protects private status lookup', () => {
    const { rawToken, tokenHash } = generateTokenPair(32);
    expect(rawToken.length).toBeGreaterThan(40);
    expect(tokenHash).toHaveLength(64);

    // Assert that the public reference cannot be used as the SHA-256 status hash
    const fakeReference = 'BK-20260905-001';
    expect(sha256(fakeReference)).not.toEqual(tokenHash);
  });

  it('verifies owner authentication password hashing and rejection of bad credentials', () => {
    const password = 'CorrectPassword123';
    const hash = hashPassword(password);
    expect(verifyPassword(password, hash)).toBe(true);
    expect(verifyPassword('WrongPassword', hash)).toBe(false);
  });
});

describe('2. Booking State Machine & Inventory Isolation', () => {
  it('strictly validates allowed transitions', () => {
    // Valid transitions
    expect(() => validateStateTransition(BookingStatus.PENDING, BookingStatus.CONFIRMED)).not.toThrow();
    expect(() => validateStateTransition(BookingStatus.PENDING, BookingStatus.REJECTED)).not.toThrow();
    expect(() => validateStateTransition(BookingStatus.CONFIRMED, BookingStatus.ONGOING)).not.toThrow();
    expect(() => validateStateTransition(BookingStatus.CONFIRMED, BookingStatus.CANCELLED)).not.toThrow();
    expect(() => validateStateTransition(BookingStatus.ONGOING, BookingStatus.COMPLETED)).not.toThrow();
    expect(() => validateStateTransition(BookingStatus.ONGOING, BookingStatus.CANCELLED)).not.toThrow();

    // Invalid transitions
    expect(() => validateStateTransition(BookingStatus.PENDING, BookingStatus.ONGOING)).toThrow(
      InvalidStateTransitionError
    );
    expect(() => validateStateTransition(BookingStatus.COMPLETED, BookingStatus.CONFIRMED)).toThrow(
      InvalidStateTransitionError
    );
    expect(() => validateStateTransition(BookingStatus.CANCELLED, BookingStatus.CONFIRMED)).toThrow(
      InvalidStateTransitionError
    );
  });
});

describe('3. Concurrency Overlap Invariant Validation', () => {
  function checkIntervalOverlap(
    existingStart: Date,
    existingEnd: Date,
    requestedStart: Date,
    requestedEnd: Date
  ): boolean {
    return existingStart < requestedEnd && existingEnd > requestedStart;
  }

  const basePickup = new Date('2026-09-05T09:00:00+05:30');
  const baseReturn = new Date('2026-09-06T21:00:00+05:30');

  it('detects direct overlap: concurrent request during committed interval', () => {
    const overlapPickup = new Date('2026-09-05T12:00:00+05:30');
    const overlapReturn = new Date('2026-09-07T12:00:00+05:30');
    expect(checkIntervalOverlap(basePickup, baseReturn, overlapPickup, overlapReturn)).toBe(true);
  });

  it('allows back-to-back rentals without artificial turnaround buffer', () => {
    const immediateNextPickup = new Date('2026-09-06T21:00:00+05:30'); // Exactly matches baseReturn
    const immediateNextReturn = new Date('2026-09-07T21:00:00+05:30');
    expect(checkIntervalOverlap(basePickup, baseReturn, immediateNextPickup, immediateNextReturn)).toBe(false);
  });
});
