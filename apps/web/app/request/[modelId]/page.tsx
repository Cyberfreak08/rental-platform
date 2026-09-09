'use client';

import React, { Suspense, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Calendar,
  Car,
  User,
  Phone,
  Mail,
  FileText,
  ShieldCheck,
  ArrowLeft,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { publicApi, PublicVehicleModel } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { SiteHeader } from '@/components/public/SiteHeader';
import { SiteFooter } from '@/components/public/SiteFooter';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

function RequestFormContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const modelId = params.modelId as string;

  const pickupDate = searchParams.get('pickupDate') || '';
  const pickupTime = searchParams.get('pickupTime') || '09:00';
  const returnDate = searchParams.get('returnDate') || '';
  const returnTime = searchParams.get('returnTime') || '20:00';

  const [model, setModel] = React.useState<PublicVehicleModel | null>(null);
  const [modelLoading, setModelLoading] = React.useState(true);
  const [modelError, setModelError] = React.useState<string | null>(null);

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerMessage, setCustomerMessage] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    setModelLoading(true);
    setModelError(null);
    publicApi.getModelDetail(modelId)
      .then(data => { if (!cancelled) setModel(data); })
      .catch(err => { if (!cancelled) setModelError(err.message || 'Failed to load vehicle details.'); })
      .finally(() => { if (!cancelled) setModelLoading(false); });
    return () => { cancelled = true; };
  }, [modelId]);

  if (modelLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
        <p className="text-sm text-text-muted">Loading booking form...</p>
      </div>
    );
  }

  if (modelError || !model) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-text">Vehicle Model Not Found</h2>
        <p className="text-sm text-text-muted mt-2">{modelError || 'Unable to load vehicle details.'}</p>
        <Link href="/search" className="mt-4 inline-block">
          <Button variant="outline">Back to Search</Button>
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptedTerms) {
      setError('Please acknowledge that you agree to the rental policies.');
      return;
    }
    if (!customerPhone.trim() || !customerName.trim()) {
      setError('Please fill in your name and phone number.');
      return;
    }
    if (!pickupDate || !returnDate) {
      setError('Please go back and select pickup and return dates.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const pickupIso = `${pickupDate}T${pickupTime}:00+05:30`;
      const returnIso = `${returnDate}T${returnTime}:00+05:30`;

      const res = await publicApi.submitBookingRequest({
        modelId: model.id,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim() || undefined,
        customerMessage: customerMessage.trim() || undefined,
        requestedPickupAt: pickupIso,
        requestedReturnAt: returnIso,
      });

      // Navigate to success page with booking reference & token
      const successParams = new URLSearchParams({
        ref: res.publicReference,
        token: res.statusToken,
        model: model.name,
        brand: model.brand,
      });

      router.push(`/request/success?${successParams.toString()}`);
    } catch (err: any) {
      setError(err.message || 'Failed to submit booking request. Please try again.');
      setIsSubmitting(false);
    }
  };

  const imageUrl = model.images?.[0]?.publicUrl || `/assets/cars/${model.name.toLowerCase()}-default.svg`;
  const queryString = new URLSearchParams({
    ...(pickupDate && { pickupDate }),
    ...(pickupTime && { pickupTime }),
    ...(returnDate && { returnDate }),
    ...(returnTime && { returnTime }),
  }).toString();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Back Link */}
      <div className="mb-6">
        <Link
          href={`/models/${model.id}${queryString ? `?${queryString}` : ''}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-brand transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to {model.brand} {model.name} Details</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left 2 Cols: The Request Form */}
        <div className="lg:col-span-2">
          <div className="bg-surface border border-border rounded-feature-card p-6 sm:p-8 shadow-sm">
            <h1 className="text-2xl font-bold text-text">Request Self-Drive Booking</h1>
            <p className="text-xs text-text-muted mt-1">
              No account or login required. Fill out your details below to submit your rental request.
            </p>

            {error && (
              <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-control text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {(!pickupDate || !returnDate) && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-control text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>No dates selected. <Link href="/search" className="font-semibold underline">Go back to search</Link> and select pickup/return dates first.</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <div className="space-y-4">
                <Input
                  label="Full Name"
                  placeholder="e.g. Senthil Nathan"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  required
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Mobile / WhatsApp Number"
                    placeholder="e.g. 98765 43210"
                    type="tel"
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                    helperText="Our team will call or WhatsApp you to confirm."
                    required
                  />

                  <Input
                    label="Email Address (Optional)"
                    placeholder="e.g. senthil@example.com"
                    type="email"
                    value={customerEmail}
                    onChange={e => setCustomerEmail(e.target.value)}
                    helperText="For receiving booking updates and receipt."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-1.5">
                    Trip Notes / Special Requests (Optional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Traveling to Valparai with family; need early pickup if possible."
                    value={customerMessage}
                    onChange={e => setCustomerMessage(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-surface text-text border border-border rounded-input text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand"
                  />
                </div>
              </div>

              {/* Policy Acknowledgement */}
              <div className="pt-4 border-t border-border">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={e => setAcceptedTerms(e.target.checked)}
                    className="mt-1 w-4 h-4 text-brand rounded border-border focus:ring-brand"
                    required
                  />
                  <span className="text-xs text-text-muted leading-relaxed">
                    I agree to the <Link href="/policies" target="_blank" className="text-brand font-semibold hover:underline">Rental Terms & Policies</Link> (Valid Driving Licence required, 21+ years of age, same-to-same fuel policy). I understand this submission is a <strong>request awaiting owner confirmation</strong>.
                  </span>
                </label>
              </div>

              {/* Submit CTA */}
              <div className="pt-4">
                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubmitting || !pickupDate || !returnDate}
                  className="w-full text-base font-bold shadow-md"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" /> Submitting Request...
                    </span>
                  ) : 'Submit Booking Request'}
                </Button>
                <p className="text-[11px] text-center text-text-muted mt-2">
                  🔒 Zero commitment until confirmed. Payment is handled directly during car handover.
                </p>
              </div>
            </form>
          </div>
        </div>

        {/* Right Col: Car & Trip Summary */}
        <div>
          <div className="bg-surface border border-border rounded-feature-card p-6 shadow-sm sticky top-24 space-y-6">
            <h3 className="text-base font-bold text-text pb-3 border-b border-border">Selected Vehicle</h3>

            <div className="flex items-center gap-4">
              <div className="w-20 h-16 bg-surface-alt/80 rounded-card p-2 flex items-center justify-center border border-border/70">
                <img
                  src={imageUrl}
                  alt={model.name}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">{model.brand}</span>
                <h4 className="font-bold text-base text-text">{model.name}</h4>
                <span className="text-xs text-brand font-semibold">{formatCurrency(model.pricePerDay)} / day</span>
              </div>
            </div>

            <div className="space-y-3 pt-2 text-xs border-t border-border">
              <div className="flex justify-between">
                <span className="text-text-muted">Category:</span>
                <span className="font-medium text-text">{model.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Transmission:</span>
                <span className="font-medium text-text">{model.transmission}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Fuel:</span>
                <span className="font-medium text-text">{model.fuelType}</span>
              </div>
            </div>

            {pickupDate && returnDate ? (
              <div className="p-3.5 bg-surface-alt/70 rounded-card border border-border/80 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-text-muted font-medium">Pickup:</span>
                  <span className="text-text font-bold">{pickupDate} ({pickupTime})</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-muted font-medium">Return:</span>
                  <span className="text-text font-bold">{returnDate} ({returnTime})</span>
                </div>
                <div className="pt-1.5 border-t border-border/60 flex items-center justify-between text-brand-strong font-semibold">
                  <span>Location:</span>
                  <span>Peelamedu, Coimbatore</span>
                </div>
              </div>
            ) : (
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-card text-xs text-amber-800">
                No dates selected. Please go back to search.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RequestPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1 bg-background">
        <Suspense fallback={<div className="p-12 text-center text-sm text-text-muted">Loading booking form...</div>}>
          <RequestFormContent />
        </Suspense>
      </main>
      <SiteFooter />
    </div>
  );
}
