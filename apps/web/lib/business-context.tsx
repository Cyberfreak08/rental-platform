'use client';

/**
 * BusinessContext — real API data provider for public business profile.
 *
 * Fetches GET /api/v1/public/business once on mount and makes the result
 * available to all public-facing pages and components (SiteHeader, About,
 * Contact, Policies, request/success).
 *
 * This is the PRODUCTION data source for business contact info and content.
 * It does NOT fall back to mock data — a loading or error state is shown
 * while the API call is in flight or when it fails.
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { publicApi, PublicBusinessProfile } from '@/lib/api';

interface BusinessContextValue {
  business: PublicBusinessProfile | null;
  isLoading: boolean;
  error: string | null;
}

const BusinessContext = createContext<BusinessContextValue>({
  business: null,
  isLoading: true,
  error: null,
});

export function BusinessProvider({ children }: { children: React.ReactNode }) {
  const [business, setBusiness] = useState<PublicBusinessProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    publicApi
      .getBusiness()
      .then(data => {
        if (!cancelled) setBusiness(data);
      })
      .catch(err => {
        if (!cancelled) setError(err?.message ?? 'Failed to load business data');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <BusinessContext.Provider value={{ business, isLoading, error }}>
      {children}
    </BusinessContext.Provider>
  );
}

export function useBusinessData() {
  return useContext(BusinessContext);
}
