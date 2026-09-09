'use client';

import React, { Suspense } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Gauge,
  Fuel,
  Users,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  ArrowLeft,
  ArrowRight,
  Phone,
  MessageCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { publicApi, PublicVehicleModel, PublicAvailabilityResult } from '@/lib/api';
import { useMockState } from '@/lib/mock-state';
import { formatCurrency } from '@/lib/utils';
import { SiteHeader } from '@/components/public/SiteHeader';
import { SiteFooter } from '@/components/public/SiteFooter';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

function ModelDetailContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  // Only use mock-state for business contact data (phone/whatsapp) which is hydrated from real API on mount
  const { business, content } = useMockState();

  const modelId = params.modelId as string;

  const pickupDate = searchParams.get('pickupDate') || '';
  const pickupTime = searchParams.get('pickupTime') || '09:00';
  const returnDate = searchParams.get('returnDate') || '';
  const returnTime = searchParams.get('returnTime') || '20:00';

  const [model, setModel] = React.useState<PublicVehicleModel | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [availableCount, setAvailableCount] = React.useState<number | null>(null);
  const [availLoading, setAvailLoading] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    publicApi.getModelDetail(modelId)
      .then(data => {
        if (!cancelled) setModel(data);
      })
      .catch(err => {
        if (!cancelled) setError(err.message || 'Failed to load vehicle details.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [modelId]);

  React.useEffect(() => {
    if (!pickupDate || !returnDate) return;
    const pickupIso = `${pickupDate}T${pickupTime}:00+05:30`;
    const returnIso = `${returnDate}T${returnTime}:00+05:30`;
    setAvailLoading(true);
    publicApi.searchAvailability({ pickupAt: pickupIso, returnAt: returnIso, modelId })
      .then(results => {
        const match = results.find(r => r.modelId === modelId);
        setAvailableCount(match ? match.availableCount : 0);
      })
      .catch(() => setAvailableCount(null))
      .finally(() => setAvailLoading(false));
  }, [modelId, pickupDate, pickupTime, returnDate, returnTime]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
        <p className="text-sm text-text-muted">Loading vehicle details...</p>
      </div>
    );
  }

  if (error || !model) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-text">Vehicle Model Not Found</h2>
        <p className="text-sm text-text-muted mt-2">{error || 'The requested model does not exist or has been archived.'}</p>
        <Link href="/search" className="mt-6 inline-block">
          <Button variant="outline">Back to Search</Button>
        </Link>
      </div>
    );
  }

  const queryParams = new URLSearchParams();
  if (pickupDate) queryParams.set('pickupDate', pickupDate);
  if (pickupTime) queryParams.set('pickupTime', pickupTime);
  if (returnDate) queryParams.set('returnDate', returnDate);
  if (returnTime) queryParams.set('returnTime', returnTime);
  const queryString = queryParams.toString();

  const requestUrl = `/request/${model.id}${queryString ? `?${queryString}` : ''}`;
  const imageUrl = model.images?.[0]?.publicUrl || `/assets/cars/${model.name.toLowerCase()}-default.svg`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Back Link */}
      <div className="mb-6">
        <Link
          href={`/search${queryString ? `?${queryString}` : ''}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-brand transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Search Results</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left 2 Cols: Gallery, Overview, Specifications, Policies */}
        <div className="lg:col-span-2 space-y-8">
          {/* Main Gallery Card */}
          <div className="bg-surface border border-border rounded-feature-card overflow-hidden shadow-sm">
            <div className="aspect-[16/10] bg-surface-alt/70 p-10 flex items-center justify-center relative">
              <img
                src={imageUrl}
                alt={`${model.brand} ${model.name}`}
                className="w-full h-full object-contain max-h-[360px]"
              />
              <div className="absolute top-4 left-4 flex gap-2">
                {pickupDate && returnDate ? (
                  availLoading ? (
                    <Badge status="AVAILABLE">Checking...</Badge>
                  ) : (
                    <Badge status={availableCount !== null && availableCount > 0 ? 'AVAILABLE' : 'UNAVAILABLE'}>
                      {availableCount !== null && availableCount > 0 ? `${availableCount} Available for Dates` : 'Fully Booked'}
                    </Badge>
                  )
                ) : null}
                <span className="text-xs font-semibold uppercase tracking-wider bg-surface px-3 py-1 rounded-full border border-border text-text">
                  {model.category}
                </span>
              </div>
            </div>

            <div className="p-6 border-t border-border">
              <div className="flex flex-wrap items-baseline justify-between gap-4">
                <div>
                  <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">{model.brand}</span>
                  <h1 className="text-3xl font-extrabold text-text">{model.name}</h1>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-extrabold text-brand">{formatCurrency(model.pricePerDay)}</span>
                  <span className="text-xs text-text-muted block">per 24-hr day</span>
                </div>
              </div>

              {model.description && (
                <p className="mt-4 text-sm text-text-muted leading-relaxed">
                  {model.description}
                </p>
              )}
              <div className="mt-3 text-[11px] text-text-muted italic bg-surface-alt/80 p-2.5 rounded-control border border-border/50">
                * Note: Vehicle images are representative of the available fleet. The exact physical car is allocated by the owner upon booking confirmation.
              </div>
            </div>
          </div>

          {/* Technical Specifications */}
          <div className="bg-surface border border-border rounded-feature-card p-6">
            <h3 className="text-base font-bold text-text mb-4">Technical Specifications</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-surface-alt/60 p-3.5 rounded-card border border-border/60">
                <Gauge className="w-5 h-5 text-brand mb-1.5" />
                <div className="text-xs text-text-muted">Transmission</div>
                <div className="text-sm font-bold text-text">{model.transmission}</div>
              </div>
              <div className="bg-surface-alt/60 p-3.5 rounded-card border border-border/60">
                <Fuel className="w-5 h-5 text-brand mb-1.5" />
                <div className="text-xs text-text-muted">Fuel Type</div>
                <div className="text-sm font-bold text-text">{model.fuelType}</div>
              </div>
              <div className="bg-surface-alt/60 p-3.5 rounded-card border border-border/60">
                <Users className="w-5 h-5 text-brand mb-1.5" />
                <div className="text-xs text-text-muted">Seating Capacity</div>
                <div className="text-sm font-bold text-text">{model.seats} Passengers</div>
              </div>
              <div className="bg-surface-alt/60 p-3.5 rounded-card border border-border/60">
                <ShieldCheck className="w-5 h-5 text-brand mb-1.5" />
                <div className="text-xs text-text-muted">Insurance</div>
                <div className="text-sm font-bold text-text">Comprehensive</div>
              </div>
            </div>
          </div>

          {/* Rental Rules & Policies */}
          <div className="bg-surface border border-border rounded-feature-card p-6 space-y-4">
            <h3 className="text-base font-bold text-text">Standard Rental Conditions</h3>
            <div className="space-y-3 text-xs text-text-muted">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-text">Fuel Policy: </span>
                  {content.policies.fuel}
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-text">Kilometre Allowance: </span>
                  {content.policies.kilometres}
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-text">Driver Requirements: </span>
                  {content.policies.eligibility}
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-text">Cancellation: </span>
                  {content.policies.cancellation}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Booking Summary & Request CTA */}
        <div className="space-y-6">
          <div className="bg-surface border border-border rounded-feature-card p-6 shadow-md sticky top-24">
            <h3 className="text-lg font-bold text-text pb-4 border-b border-border">Booking Summary</h3>

            {/* Selected Dates Display */}
            <div className="py-4 space-y-3 text-xs">
              {pickupDate && returnDate ? (
                <div className="bg-surface-alt/70 p-3 rounded-card space-y-2 border border-border/60">
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-brand" /> Pickup:
                    </span>
                    <span className="font-semibold text-text">{pickupDate} at {pickupTime}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-brand" /> Return:
                    </span>
                    <span className="font-semibold text-text">{returnDate} at {returnTime}</span>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-card text-xs text-amber-800">
                  No dates selected. <Link href="/search" className="font-semibold underline">Search for availability</Link> first.
                </div>
              )}

              <div className="flex items-center justify-between pt-2 text-sm font-medium">
                <span className="text-text-muted">Daily Rate:</span>
                <span className="text-text font-bold">{formatCurrency(model.pricePerDay)}</span>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-4 border-t border-border space-y-3">
              <Link href={requestUrl}>
                <Button size="lg" className="w-full flex items-center justify-center gap-2 text-sm font-bold">
                  <span>Request This Car</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <p className="text-[11px] text-center text-text-muted leading-tight">
                No upfront payment required. Your request is reviewed directly by our Coimbatore rental desk.
              </p>
            </div>

            {/* Direct Contact Alternatives */}
            <div className="mt-6 pt-6 border-t border-border space-y-2.5">
              <span className="text-xs font-semibold text-text block">Have questions or custom dates?</span>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={`https://wa.me/${business.whatsappNumber.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold py-2 px-3 rounded-control bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                </a>
                <a
                  href={`tel:${business.phone}`}
                  className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold py-2 px-3 rounded-control bg-surface-alt text-text border border-border hover:bg-border/60 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-brand" /> Call Desk
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ModelDetailPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1 bg-background">
        <Suspense fallback={<div className="p-12 text-center text-sm text-text-muted">Loading vehicle specifications...</div>}>
          <ModelDetailContent />
        </Suspense>
      </main>
      <SiteFooter />
    </div>
  );
}
