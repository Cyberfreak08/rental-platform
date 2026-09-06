'use client';

import React from 'react';
import Link from 'next/link';
import { Shield, Sparkles, MapPin, Users, Phone, ArrowRight } from 'lucide-react';
import { useMockState } from '@/lib/mock-state';
import { SiteHeader } from '@/components/public/SiteHeader';
import { SiteFooter } from '@/components/public/SiteFooter';
import { Button } from '@/components/ui/Button';

export default function AboutPage() {
  const { business, content } = useMockState();

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1 bg-background py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold text-brand uppercase tracking-wider">Local & Reliable</span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-text mt-1">About DriveNest Rentals</h1>
            <p className="text-sm text-text-muted mt-3 leading-relaxed">
              Serving Coimbatore with clean, transparent and dependable self-drive car rentals since our founding.
            </p>
          </div>

          {/* Main Story Card */}
          <div className="bg-surface border border-border rounded-feature-card p-6 sm:p-10 shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-text">Our Mission</h2>
            <p className="text-sm text-text leading-relaxed">
              {content.about}
            </p>
            <p className="text-sm text-text-muted leading-relaxed">
              Unlike large impersonal aggregators, DriveNest is rooted in Coimbatore. We maintain our own fleet with meticulous mechanical checkups before every trip. We believe in clear pricing, zero hidden surprises, and personal service so your journey across Tamil Nadu, Kerala, or Karnataka is completely stress-free.
            </p>

            <div className="pt-6 border-t border-border grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-surface-alt/70 p-4 rounded-card border border-border/60">
                <Shield className="w-6 h-6 text-brand mb-2" />
                <h4 className="font-bold text-sm text-text">Verified Quality</h4>
                <p className="text-xs text-text-muted mt-1">All cars regularly serviced and thoroughly cleaned.</p>
              </div>
              <div className="bg-surface-alt/70 p-4 rounded-card border border-border/60">
                <Sparkles className="w-6 h-6 text-brand mb-2" />
                <h4 className="font-bold text-sm text-text">Transparent Terms</h4>
                <p className="text-xs text-text-muted mt-1">No complicated deposits or sudden penalty charges.</p>
              </div>
              <div className="bg-surface-alt/70 p-4 rounded-card border border-border/60">
                <MapPin className="w-6 h-6 text-brand mb-2" />
                <h4 className="font-bold text-sm text-text">Prime Location</h4>
                <p className="text-xs text-text-muted mt-1">Convenient branch at Peelamedu, Coimbatore.</p>
              </div>
            </div>
          </div>

          {/* CTA Box */}
          <div className="bg-brand text-white rounded-feature-card p-8 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6 shadow-lg">
            <div>
              <h3 className="text-xl font-bold">Ready to plan your trip?</h3>
              <p className="text-xs text-brand-soft mt-1">Explore available hatchbacks, compact SUVs and SUVs today.</p>
            </div>
            <Link href="/search">
              <Button size="lg" className="bg-white text-brand hover:bg-surface-alt font-bold shadow">
                Search Available Fleet
              </Button>
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
