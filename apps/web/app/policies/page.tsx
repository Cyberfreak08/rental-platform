'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, AlertCircle, Fuel, Clock, Gauge, UserCheck, HelpCircle } from 'lucide-react';
import { useMockState } from '@/lib/mock-state';
import { SiteHeader } from '@/components/public/SiteHeader';
import { SiteFooter } from '@/components/public/SiteFooter';
import { Button } from '@/components/ui/Button';

export default function PoliciesPage() {
  const { content, business } = useMockState();

  const policySections = [
    {
      icon: UserCheck,
      title: 'Driver Eligibility & Documents',
      content: content.policies.eligibility,
      note: 'Driver must be minimum 21 years old and hold an original valid driving licence and official government photo ID.',
    },
    {
      icon: Fuel,
      title: 'Fuel Policy (Same-to-Same)',
      content: content.policies.fuel,
      note: 'The vehicle is provided with a recorded fuel level. Please return with the identical level to avoid refueling charges.',
    },
    {
      icon: Gauge,
      title: 'Kilometre Allowance',
      content: content.policies.kilometres,
      note: '300 km included per 24 hours. Extra mileage is billed at nominal rates upon car return.',
    },
    {
      icon: Clock,
      title: 'Late Return Policy',
      content: content.policies.lateReturn,
      note: 'A 30-minute grace period is provided. Further delays are charged hourly to ensure smooth scheduling for the next customer.',
    },
    {
      icon: AlertCircle,
      title: 'Cancellation & Modification',
      content: content.policies.cancellation,
      note: 'Please notify our rental desk via phone or WhatsApp as soon as possible if your travel plans change.',
    },
    {
      icon: ShieldCheck,
      title: 'Pickup & Return Procedures',
      content: `${content.policies.pickupInstructions} ${content.policies.returnInstructions}`,
      note: 'Vehicle handovers are conducted at our Peelamedu branch between 7:00 AM and 9:00 PM.',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1 bg-background py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold text-brand uppercase tracking-wider">Fair & Clear</span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-text mt-1">Rental Policies & Terms</h1>
            <p className="text-sm text-text-muted mt-2">
              Our business terms are designed to be simple, transparent, and easy to follow.
            </p>
          </div>

          {/* Policy Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {policySections.map((sec, idx) => {
              const Icon = sec.icon;
              return (
                <div key={idx} className="bg-surface border border-border rounded-feature-card p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-card bg-brand-soft text-brand border border-brand/20">
                        <Icon className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-base text-text">{sec.title}</h3>
                    </div>
                    <p className="text-xs text-text font-medium leading-relaxed mb-2">
                      {sec.content}
                    </p>
                    <p className="text-[11px] text-text-muted leading-relaxed">
                      {sec.note}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Clarification Box */}
          <div className="p-6 bg-surface-alt/80 rounded-feature-card border border-border text-center space-y-4">
            <h3 className="text-base font-bold text-text">Have a specific question regarding policies?</h3>
            <p className="text-xs text-text-muted max-w-md mx-auto">
              Our local rental desk is happy to clarify any outstation routes, permits, or commercial conditions.
            </p>
            <div className="flex justify-center gap-3">
              <Link href="/faq">
                <Button variant="outline" size="sm">Read FAQ</Button>
              </Link>
              <Link href="/contact">
                <Button size="sm">Contact Us</Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
