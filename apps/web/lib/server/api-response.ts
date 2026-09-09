import { NextResponse } from 'next/server';
import { DomainError } from './errors';

export function jsonResponse<T>(data: T, status: number = 200, headers: Record<string, string> = {}) {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    {
      status,
      headers,
    }
  );
}

export function errorResponse(error: unknown) {
  if (error instanceof DomainError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          status: error.status,
          details: error.details,
        },
      },
      { status: error.status }
    );
  }

  console.error('Unhandled API Error:', error);
  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected internal error occurred.',
        status: 500,
      },
    },
    { status: 500 }
  );
}

/**
 * Helper to parse and extract query params
 */
export function getQueryParam(url: string, param: string): string | null {
  const { searchParams } = new URL(url);
  return searchParams.get(param);
}

/**
 * Helper to parse date query param safely
 */
export function parseDateParam(value: string | null, fieldName: string): Date {
  if (!value) {
    throw new DomainError(`Query parameter '${fieldName}' is required.`, 'INVALID_INPUT', 400);
  }
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    throw new DomainError(`Query parameter '${fieldName}' must be a valid ISO 8601 date string.`, 'INVALID_INPUT', 400);
  }
  return date;
}
