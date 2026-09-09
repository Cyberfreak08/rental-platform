'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Fuel, Sparkles, CheckCircle2, ArrowRight, MessageCircle, Phone, Star, MapPin, Loader2 } from 'lucide-react';
import { publicApi, PublicBusinessProfile, PublicVehicleModel } from '@/lib/api';
import { useMockState } from '@/lib/mock-state';
import { SiteHeader } from '@/components/public/SiteHeader';
import { SiteFooter } from '@/components/public/SiteFooter';
import { HeroSearch } from '@/components/public/HeroSearch';
import { TrustStrip } from '@/components/public/TrustStrip';
import { VehicleCard } from '@/components/public/VehicleCard';
import { Button } from '@/components/ui/Button';

export default function HomePage() {
  // mock-state is still used here for business contact info (hydrated from real API on mount)
  // and for whyChooseUs content. The fleet models are fetched directly from the real API.
  const { business, content } = useMockState();

  const [models, setModels] = React.useState<PublicVehicleModel[]>([]);
  const [modelsLoading, setModelsLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    publicApi.getModels()
      .then(data => { if (!cancelled) setModels(data); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setModelsLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const steps = [
    { num: '01', title: 'Choose Your Dates', desc: 'Select your preferred pickup and return date & time.' },
    { num: '02', title: 'Select Vehicle Model', desc: 'Pick from our well-maintained hatchback, compact SUV or SUV fleet.' },
    { num: '03', title: 'Submit Booking Request', desc: 'Provide your name and contact details without needing to register.' },
    { num: '04', title: 'Owner Confirms & Handover', desc: 'Our team reviews availability, confirms your booking and prepares your car.' },
  ];

  const reviews = [
    {
      name: 'Vigneshwaran K.',
      city: 'Coimbatore',
      rating: 5,
      comment: 'Rented the Brezza for an Ooty road trip with family. Car was in pristine condition, pickup was effortless in Peelamedu, and the team was extremely helpful.',
    },
    {
      name: 'Ananya S.',
      city: 'Bangalore',
      rating: 5,
      comment: 'Very straightforward rental experience. No unnecessary account creation or hidden deposits. Clean i20 Automatic delivered on time.',
    },
    {
      name: 'Suresh Menon',
      city: 'Coimbatore',
      rating: 5,
      comment: 'Regular customer for local business commutes. Clear same-to-same fuel policy and polite owner. Highly recommended.',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />

      <main className="flex-1">
        {/* 1. Hero & Search */}
        <HeroSearch />

        {/* 2. Trust Strip */}
        <TrustStrip />

        {/* 3. Featured Fleet */}
        <section className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <div className="text-xs font-bold text-brand uppercase tracking-wider mb-2">Verified Fleet</div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-text tracking-tight">
                Our Popular Self-Drive Cars
              </h2>
              <p className="text-sm sm:text-base text-text-muted mt-2 max-w-xl">
                Clean, inspected and ready for immediate booking. Transparent daily rates.
              </p>
            </div>
            <Link href="/search" className="mt-4 md:mt-0">
              <Button variant="outline" size="md" className="flex items-center gap-2">
                <span>View Full Fleet</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {modelsLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-brand" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {models.map(m => (
                <VehicleCard
                  key={m.id}
                  model={{
                    id: m.id,
                    brand: m.brand,
                    name: m.name,
                    category: m.category as any,
                    fuelType: m.fuelType as any,
                    transmission: m.transmission as any,
                    seats: m.seats,
                    pricePerDay: m.pricePerDay,
                    description: m.description || '',
                    image: m.images?.[0]?.publicUrl || undefined,
                  }}
                  availableCount={1}
                />
              ))}
            </div>
          )}
        </section>

        {/* 4. Why Choose Us */}
        <section className="py-16 bg-surface-alt/60 border-y border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-xs font-bold text-brand uppercase tracking-wider">The DriveNest Advantage</span>
              <h2 className="text-3xl font-extrabold text-text mt-1">Why Drive With Us</h2>
              <p className="text-sm text-text-muted mt-2">
                Reliable self-drive experience tailored for Coimbatore locals and outstation travelers.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {content.whyChooseUs.map((item, idx) => (
                <div key={idx} className="bg-surface p-6 rounded-feature-card border border-border/80 shadow-sm">
                  <div className="w-10 h-10 rounded-control bg-brand-soft text-brand font-bold flex items-center justify-center mb-4 border border-brand/20">
                    {idx + 1}
                  </div>
                  <h3 className="font-bold text-base text-text mb-2">{item.title}</h3>
                  <p className="text-xs text-text-muted leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. How It Works */}
        <section className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold text-brand uppercase tracking-wider">Straightforward Rental</span>
            <h2 className="text-3xl font-extrabold text-text mt-1">How DriveNest Works</h2>
            <p className="text-sm text-text-muted mt-2">
              Four simple steps from choosing your dates to taking the keys.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {steps.map((step, idx) => (
              <div key={idx} className="bg-surface p-6 rounded-feature-card border border-border relative">
                <span className="text-4xl font-extrabold text-brand/20 mb-2 block">{step.num}</span>
                <h3 className="font-bold text-base text-text mb-2">{step.title}</h3>
                <p className="text-xs text-text-muted leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 p-5 rounded-card bg-brand-soft border border-brand/20 text-center max-w-2xl mx-auto text-xs text-brand-strong">
            <span className="font-bold">Important Notice:</span> A booking request is not an instant reservation. The rental team reviews your request and confirms the final vehicle and timing.
          </div>
        </section>

        {/* 6. Customer Reviews */}
        <section className="py-16 bg-surface border-y border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
              <div>
                <span className="text-xs font-bold text-brand uppercase tracking-wider">Customer Feedback</span>
                <h2 className="text-3xl font-extrabold text-text mt-1">What Our Renters Say</h2>
              </div>
              {business.googleReviewUrl && (
                <a
                  href={business.googleReviewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 md:mt-0 text-xs font-semibold text-brand hover:underline flex items-center gap-1.5"
                >
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>View Google Reviews</span>
                </a>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {reviews.map((rev, idx) => (
                <div key={idx} className="bg-background p-6 rounded-card border border-border/70 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1 text-amber-500 mb-3">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                    <p className="text-xs text-text leading-relaxed italic">"{rev.comment}"</p>
                  </div>
                  <div className="mt-5 pt-4 border-t border-border/60 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand-soft flex items-center justify-center text-xs font-bold text-brand">
                      {rev.name[0]}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-text">{rev.name}</div>
                      <div className="text-[11px] text-text-muted">{rev.city}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 7. Location & Quick Contact */}
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-surface-alt/70 border border-border rounded-hero p-8 md:p-12 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <span className="text-xs font-bold text-brand uppercase tracking-wider">Ready to Drive?</span>
              <h2 className="text-3xl font-extrabold text-text mt-2 leading-tight">
                Visit our Peelamedu branch or speak with us directly.
              </h2>
              <p className="text-sm text-text-muted mt-3 leading-relaxed">
                Have specific dates or custom outstation requirements? Our local Coimbatore operations team is available 7:00 AM – 9:00 PM.
              </p>

              <div className="mt-8 space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-brand shrink-0 mt-0.5" />
                  <span className="text-text font-medium">{business.address}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-brand shrink-0" />
                  <a href={`tel:${business.phone}`} className="text-text font-semibold hover:text-brand">
                    {business.phone}
                  </a>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/search">
                  <Button size="lg">Search Available Fleet</Button>
                </Link>
                {business.whatsappNumber && (
                  <a
                    href={`https://wa.me/${business.whatsappNumber.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="lg" className="flex items-center gap-2">
                      <MessageCircle className="w-5 h-5 text-emerald-600" />
                      <span>WhatsApp Inquiry</span>
                    </Button>
                  </a>
                )}
              </div>
            </div>

            {/* Map Placeholder Card */}
            <div className="relative aspect-[4/3] rounded-feature-card bg-surface border border-border overflow-hidden shadow-inner flex flex-col items-center justify-center p-6 text-center">
              <img
                src="/assets/ui/map-placeholder.svg"
                alt="Coimbatore Location Map"
                className="w-full h-full object-cover absolute inset-0 opacity-80"
              />
              <div className="relative bg-surface/90 backdrop-blur-md p-4 rounded-card border border-border max-w-xs shadow-lg">
                <MapPin className="w-6 h-6 text-brand mx-auto mb-1.5" />
                <h4 className="font-bold text-xs text-text">{business.name}</h4>
                <p className="text-[11px] text-text-muted mt-0.5">Peelamedu, Coimbatore, TN</p>
                <span className="mt-2 inline-block text-[10px] bg-brand-soft text-brand-strong px-2 py-0.5 rounded font-semibold">
                  Open 7:00 AM – 9:00 PM
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
