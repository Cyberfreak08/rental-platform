'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Clock,
  CheckCircle2,
  Calendar,
  Phone,
  MessageCircle,
  MapPin,
  Car,
  ShieldCheck,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { useMockState } from '@/lib/mock-state';
import { formatDateTime, formatCurrency } from '@/lib/utils';
import { SiteHeader } from '@/components/public/SiteHeader';
import { SiteFooter } from '@/components/public/SiteFooter';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default function BookingStatusPage() {
  const params = useParams();
  const token = params.token as string;
  const { bookings, models, business, content } = useMockState();

  // Find booking matching private token (or fallback to public reference for friendly dev testing)
  const booking = bookings.find(
    b => b.privateStatusToken === token || b.publicReference === token || b.id === token
  );

  if (!booking) {
    return (
      <div className="flex flex-col min-h-screen">
        <SiteHeader />
        <main className="flex-1 max-w-2xl mx-auto px-4 py-20 text-center">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-text">Booking Record Not Found</h2>
          <p className="text-sm text-text-muted mt-2">
            The status token is invalid or the booking record could not be retrieved. Please verify your link.
          </p>
          <Link href="/" className="mt-6 inline-block">
            <Button variant="outline">Return to Home</Button>
          </Link>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const model = models.find(m => m.id === booking.modelId);

  const statusSteps = [
    { key: 'PENDING', label: 'Request Received', desc: 'Submitted & queued for review' },
    { key: 'CONFIRMED', label: 'Booking Confirmed', desc: 'Vehicle allocated & schedule locked' },
    { key: 'ONGOING', label: 'Rental In Progress', desc: 'Car handed over to customer' },
    { key: 'COMPLETED', label: 'Completed', desc: 'Car returned & checked in' },
  ];

  const getCurrentStepIndex = () => {
    switch (booking.status) {
      case 'PENDING':
        return 0;
      case 'CONFIRMED':
        return 1;
      case 'ONGOING':
        return 2;
      case 'COMPLETED':
        return 3;
      case 'REJECTED':
      case 'CANCELLED':
        return -1;
      default:
        return 0;
    }
  };

  const currentStep = getCurrentStepIndex();

  const prefilledWhatsappMsg = encodeURIComponent(
    `Hello DriveNest, inquiring regarding booking ${booking.publicReference} for ${booking.customerName}.`
  );

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1 bg-background py-10 md:py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Header Card */}
          <div className="bg-surface border border-border rounded-feature-card p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-muted uppercase tracking-wider font-semibold">
                    Booking Reference
                  </span>
                  <Badge status={booking.status}>{booking.status}</Badge>
                </div>
                <h1 className="text-2xl sm:text-3xl font-mono font-extrabold text-brand mt-1">
                  {booking.publicReference}
                </h1>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-xs text-text-muted block">Booked on:</span>
                <span className="text-xs font-semibold text-text">{formatDateTime(booking.createdAt)}</span>
              </div>
            </div>

            {/* Lifecycle Timeline */}
            <div className="pt-8">
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-6">
                Booking Status Timeline
              </h3>

              {booking.status === 'REJECTED' || booking.status === 'CANCELLED' ? (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-card text-rose-900 text-sm flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  <div>
                    <span className="font-bold">This booking has been {booking.status.toLowerCase()}.</span>
                    <p className="text-xs mt-0.5 text-rose-700">
                      Please contact our rental team directly for assistance or alternative vehicle availability.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="relative flex flex-col sm:flex-row justify-between gap-4">
                  {statusSteps.map((step, idx) => {
                    const isDone = currentStep >= idx;
                    const isCurrent = currentStep === idx;
                    return (
                      <div key={step.key} className="flex-1 flex items-start sm:flex-col gap-3 relative">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 border-2 transition-colors ${
                            isDone
                              ? 'bg-brand text-white border-brand'
                              : 'bg-surface text-text-muted border-border'
                          }`}
                        >
                          {isDone ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                        </div>
                        <div>
                          <h4
                            className={`text-xs font-bold ${
                              isCurrent ? 'text-brand' : isDone ? 'text-text' : 'text-text-muted'
                            }`}
                          >
                            {step.label}
                          </h4>
                          <p className="text-[11px] text-text-muted mt-0.5 leading-tight">{step.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Vehicle & Schedule */}
            <div className="bg-surface border border-border rounded-feature-card p-6 space-y-4 shadow-sm">
              <h3 className="text-sm font-bold text-text uppercase tracking-wider flex items-center gap-2">
                <Car className="w-4 h-4 text-brand" /> Vehicle & Schedule
              </h3>

              {model && (
                <div className="flex items-center gap-4 p-3.5 bg-surface-alt/70 rounded-card border border-border/60">
                  <div className="w-16 h-12 bg-surface rounded p-1 flex items-center justify-center border border-border">
                    <img
                      src={model.image || `/assets/cars/${model.name.toLowerCase()}-default.svg`}
                      alt={model.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-text">{model.brand} {model.name}</h4>
                    <span className="text-xs text-text-muted">{model.category} • {model.transmission}</span>
                  </div>
                </div>
              )}

              <div className="space-y-2.5 text-xs">
                <div className="p-3 bg-background rounded-card border border-border/70 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-text-muted">Pickup Schedule:</span>
                    <span className="font-bold text-text">
                      {formatDateTime(booking.confirmedPickupAt || booking.requestedPickupAt)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Return Schedule:</span>
                    <span className="font-bold text-text">
                      {formatDateTime(booking.confirmedReturnAt || booking.requestedReturnAt)}
                    </span>
                  </div>
                  {booking.confirmedPickupAt && (
                    <div className="pt-1.5 border-t border-border text-[11px] text-emerald-800 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed by Rental Desk
                    </div>
                  )}
                </div>

                <div className="flex justify-between text-xs pt-1 px-1">
                  <span className="text-text-muted">Rental Location:</span>
                  <span className="font-medium text-text">Peelamedu, Coimbatore</span>
                </div>
              </div>
            </div>

            {/* Renter Details & Support */}
            <div className="bg-surface border border-border rounded-feature-card p-6 space-y-4 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-text uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-brand" /> Customer Information
                </h3>

                <div className="mt-4 space-y-2.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-border/60">
                    <span className="text-text-muted">Customer Name:</span>
                    <span className="font-semibold text-text">{booking.customerName}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/60">
                    <span className="text-text-muted">Phone / WhatsApp:</span>
                    <span className="font-semibold text-text">{booking.customerPhone}</span>
                  </div>
                  {booking.customerEmail && (
                    <div className="flex justify-between py-1 border-b border-border/60">
                      <span className="text-text-muted">Email:</span>
                      <span className="font-semibold text-text">{booking.customerEmail}</span>
                    </div>
                  )}
                  {booking.customerMessage && (
                    <div className="pt-2">
                      <span className="text-text-muted block mb-1">Customer Notes:</span>
                      <p className="bg-surface-alt p-2.5 rounded-control text-xs text-text italic">
                        "{booking.customerMessage}"
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Need Help Action */}
              <div className="pt-4 border-t border-border space-y-2">
                <span className="text-xs font-semibold text-text block">Need to modify or request changes?</span>
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={`https://wa.me/${business.whatsappNumber.replace(/[^0-9]/g, '')}?text=${prefilledWhatsappMsg}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold py-2 px-3 rounded-control bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" /> WhatsApp Desk
                  </a>
                  <a
                    href={`tel:${business.phone}`}
                    className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold py-2 px-3 rounded-control bg-surface-alt text-text border border-border hover:bg-border/60 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-brand" /> Call Branch
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
