'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Clock, ShieldCheck, ArrowRight, Copy, MessageCircle, Phone, ExternalLink } from 'lucide-react';
import { useMockState } from '@/lib/mock-state';
import { SiteHeader } from '@/components/public/SiteHeader';
import { SiteFooter } from '@/components/public/SiteFooter';
import { Button } from '@/components/ui/Button';

function SuccessContent() {
  const searchParams = useSearchParams();
  const { business } = useMockState();

  const ref = searchParams.get('ref') || 'BK-20260908-001';
  const token = searchParams.get('token') || 'tok_demo';
  const model = searchParams.get('model') || 'Car';
  const brand = searchParams.get('brand') || '';

  const [copied, setCopied] = React.useState(false);
  const statusUrl = typeof window !== 'undefined' ? `${window.location.origin}/status/${token}` : `/status/${token}`;

  const copyLink = () => {
    navigator.clipboard.writeText(statusUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const prefilledWhatsappMsg = encodeURIComponent(
    `Hello DriveNest, I have submitted a booking request for ${brand} ${model} (Ref: ${ref}). Can you please check and confirm?`
  );

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <div className="bg-surface border border-border rounded-feature-card p-6 sm:p-10 shadow-lg text-center">
        {/* Success Icon */}
        <div className="w-16 h-16 bg-brand-soft text-brand rounded-full flex items-center justify-center mx-auto mb-6 border border-brand/20">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 mb-3 uppercase tracking-wider">
          Request Status: Pending Review
        </span>

        <h1 className="text-3xl font-extrabold text-text">Booking Request Received!</h1>
        <p className="text-sm text-text-muted mt-2 max-w-lg mx-auto leading-relaxed">
          Thank you. Your rental request for <strong>{brand} {model}</strong> has been received by the DriveNest team in Coimbatore.
        </p>

        {/* Reference & Private Link Card */}
        <div className="mt-8 p-6 bg-surface-alt/80 rounded-card border border-border/80 text-left space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-border">
            <div>
              <span className="text-xs text-text-muted font-medium">Public Booking Reference:</span>
              <div className="text-xl font-mono font-bold text-brand">{ref}</div>
            </div>
            <div className="text-xs text-text-muted">
              Keep this for quick communication with our rental desk.
            </div>
          </div>

          <div>
            <span className="text-xs text-text-muted font-medium block mb-1">
              Private Status Tracking URL:
            </span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={statusUrl}
                className="w-full bg-surface text-text text-xs font-mono border border-border rounded-control px-3 py-2 select-all"
              />
              <Button variant="secondary" size="sm" onClick={copyLink} className="shrink-0 text-xs flex items-center gap-1">
                <Copy className="w-3.5 h-3.5" />
                <span>{copied ? 'Copied!' : 'Copy Link'}</span>
              </Button>
            </div>
            <p className="text-[11px] text-text-muted mt-1.5">
              💡 Bookmark or save this link. You can track your booking status directly without logging in.
            </p>
          </div>
        </div>

        {/* Process Timeline Note */}
        <div className="mt-8 text-left bg-brand-soft/60 border border-brand/20 p-5 rounded-card text-xs text-brand-strong space-y-2">
          <div className="font-bold flex items-center gap-2">
            <Clock className="w-4 h-4 text-brand" /> What happens next?
          </div>
          <ul className="list-disc list-inside space-y-1 text-xs text-text leading-relaxed">
            <li>Our operations team verifies physical car availability and schedule turnaround.</li>
            <li>We will contact you via phone or WhatsApp at your registered number.</li>
            <li>Once accepted, the car is allocated and the status changes to <strong>Confirmed</strong>.</li>
          </ul>
        </div>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href={`/status/${token}`} className="w-full sm:w-auto">
            <Button size="lg" className="w-full flex items-center justify-center gap-2 font-bold">
              <span>View Booking Status Page</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <a
            href={`https://wa.me/${business.whatsappNumber.replace(/[^0-9]/g, '')}?text=${prefilledWhatsappMsg}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto"
          >
            <Button variant="outline" size="lg" className="w-full flex items-center justify-center gap-2 text-emerald-700 hover:bg-emerald-50">
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>WhatsApp Our Desk</span>
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}

export default function RequestSuccessPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1 bg-background">
        <Suspense fallback={<div className="p-12 text-center text-sm text-text-muted">Loading confirmation details...</div>}>
          <SuccessContent />
        </Suspense>
      </main>
      <SiteFooter />
    </div>
  );
}
