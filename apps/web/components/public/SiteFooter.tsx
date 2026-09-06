import React from 'react';
import Link from 'next/link';
import { Phone, Mail, MapPin, MessageCircle, Clock, ShieldCheck } from 'lucide-react';
import { useMockState } from '@/lib/mock-state';

export const SiteFooter: React.FC = () => {
  const { business } = useMockState();

  return (
    <footer className="bg-surface border-t border-border mt-20 pt-16 pb-12 text-sm text-text-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-border">
          {/* Col 1: Brand & Bio */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-control bg-brand-soft flex items-center justify-center p-1.5 border border-brand/20">
                <img
                  src="/assets/logos/drivenest-mark.svg"
                  alt="DriveNest"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="font-bold text-lg text-brand tracking-tight">DriveNest</span>
            </div>
            <p className="text-text-muted text-sm leading-relaxed">
              {business.tagline} Verified self-drive rental fleet serving Coimbatore and outstation travelers.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-soft text-brand-strong text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" /> 100% Verified Fleet
              </span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="font-semibold text-text text-sm uppercase tracking-wider mb-4">Quick Links</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/" className="hover:text-brand transition-colors">Home</Link>
              </li>
              <li>
                <Link href="/search" className="hover:text-brand transition-colors">Search & Book Fleet</Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-brand transition-colors">About DriveNest</Link>
              </li>
              <li>
                <Link href="/policies" className="hover:text-brand transition-colors">Rental Policies & Terms</Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-brand transition-colors">Frequently Asked Questions</Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Operating Hours */}
          <div>
            <h4 className="font-semibold text-text text-sm uppercase tracking-wider mb-4">Operating Hours</h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-text font-medium">
                <Clock className="w-4 h-4 text-brand" />
                <span>Standard Pickup & Return</span>
              </div>
              <div className="bg-surface-alt p-3 rounded-card space-y-1 text-text-muted border border-border/60">
                <div className="flex justify-between">
                  <span>Mon – Sat:</span>
                  <span className="font-medium text-text">07:00 AM – 09:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Sunday:</span>
                  <span className="font-medium text-text">08:00 AM – 08:00 PM</span>
                </div>
              </div>
              <p className="text-[11px] text-text-muted italic pt-1">
                *Booking requests can be submitted 24/7 online.
              </p>
            </div>
          </div>

          {/* Col 4: Contact & Location */}
          <div>
            <h4 className="font-semibold text-text text-sm uppercase tracking-wider mb-4">Branch Location</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-brand mt-0.5 shrink-0" />
                <span>{business.address}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-brand shrink-0" />
                <a href={`tel:${business.phone}`} className="hover:text-brand font-medium text-text">
                  {business.phone}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <a
                  href={`https://wa.me/${business.whatsappNumber.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-700 font-medium text-emerald-700"
                >
                  WhatsApp: {business.whatsappNumber}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-brand shrink-0" />
                <a href={`mailto:${business.email}`} className="hover:text-brand">
                  {business.email}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright & owner portal link */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© {new Date().getFullYear()} {business.name}. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/policies" className="hover:text-text transition-colors">Privacy & Terms</Link>
            <Link href="/owner" className="hover:text-brand font-semibold text-brand flex items-center gap-1">
              Owner Dashboard →
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
