import React from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, Car, Search, Shield, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const TIME_OPTIONS = [
  '07:00', '07:30', '08:00', '08:30', '09:00', '09:30',
  '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30',
  '19:00', '19:30', '20:00', '20:30', '21:00'
];

function formatTimeLabel(timeStr: string): string {
  const [hourStr, minStr] = timeStr.split(':');
  const hour = parseInt(hourStr, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minStr} ${ampm}`;
}

export const HeroSearch: React.FC = () => {
  const router = useRouter();

  const [pickupDate, setPickupDate] = React.useState('2026-09-08');
  const [pickupTime, setPickupTime] = React.useState('09:00');
  const [returnDate, setReturnDate] = React.useState('2026-09-10');
  const [returnTime, setReturnTime] = React.useState('20:00');
  const [category, setCategory] = React.useState('Any car');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams({
      pickupDate,
      pickupTime,
      returnDate,
      returnTime,
    });
    if (category && category !== 'Any car') {
      params.append('category', category);
    }
    router.push(`/search?${params.toString()}`);
  };

  return (
    <section className="relative pt-10 pb-16 md:pt-16 md:pb-24 overflow-hidden">
      {/* Background soft ambient decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-brand-soft/40 via-background to-background -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-8 md:mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-soft border border-brand/20 text-brand-strong text-xs font-semibold uppercase tracking-wider mb-4">
            <Shield className="w-3.5 h-3.5 text-brand" /> Coimbatore's Trusted Self-Drive Fleet
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-text tracking-tight leading-[1.15]">
            Explore Coimbatore <span className="text-brand underline decoration-brand/30 decoration-4">Your Way</span>
          </h1>
          <p className="mt-3 text-sm sm:text-base text-text-muted leading-relaxed max-w-2xl mx-auto">
            Flexible, transparent and reliable self-drive cars for city commutes, family road trips, and hill station getaways.
          </p>
        </div>

        {/* Unified Search Box Card */}
        <div className="max-w-5xl mx-auto bg-surface border border-border rounded-hero shadow-xl p-4 sm:p-6 md:p-7 relative">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 items-end">
              {/* Pickup Group */}
              <div className="bg-surface-alt/70 p-3 rounded-card border border-border/80 focus-within:border-brand transition-colors">
                <label className="block text-[11px] font-bold text-text uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-brand shrink-0" />
                  <span>Pickup Schedule</span>
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <input
                    type="date"
                    value={pickupDate}
                    onChange={e => setPickupDate(e.target.value)}
                    className="w-full bg-surface text-text text-xs font-medium border border-border rounded-control px-2 py-2 min-h-[44px] focus:outline-none focus:ring-1 focus:ring-brand"
                    required
                  />
                  <select
                    value={pickupTime}
                    onChange={e => setPickupTime(e.target.value)}
                    className="w-full bg-surface text-text text-xs font-medium border border-border rounded-control px-2 py-2 min-h-[44px] focus:outline-none focus:ring-1 focus:ring-brand"
                    required
                  >
                    {TIME_OPTIONS.map(t => (
                      <option key={t} value={t}>{formatTimeLabel(t)}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Return Group */}
              <div className="bg-surface-alt/70 p-3 rounded-card border border-border/80 focus-within:border-brand transition-colors">
                <label className="block text-[11px] font-bold text-text uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-brand shrink-0" />
                  <span>Return Schedule</span>
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <input
                    type="date"
                    value={returnDate}
                    onChange={e => setReturnDate(e.target.value)}
                    className="w-full bg-surface text-text text-xs font-medium border border-border rounded-control px-2 py-2 min-h-[44px] focus:outline-none focus:ring-1 focus:ring-brand"
                    required
                  />
                  <select
                    value={returnTime}
                    onChange={e => setReturnTime(e.target.value)}
                    className="w-full bg-surface text-text text-xs font-medium border border-border rounded-control px-2 py-2 min-h-[44px] focus:outline-none focus:ring-1 focus:ring-brand"
                    required
                  >
                    {TIME_OPTIONS.map(t => (
                      <option key={t} value={t}>{formatTimeLabel(t)}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Car Category */}
              <div className="bg-surface-alt/70 p-3 rounded-card border border-border/80 focus-within:border-brand transition-colors">
                <label className="block text-[11px] font-bold text-text uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Car className="w-3.5 h-3.5 text-brand shrink-0" />
                  <span>Car Type</span>
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full bg-surface text-text text-xs font-medium border border-border rounded-control px-3 py-2 min-h-[44px] focus:outline-none focus:ring-1 focus:ring-brand"
                >
                  <option value="Any car">Any car (All Fleet)</option>
                  <option value="Hatchback">Hatchback (Swift, i20)</option>
                  <option value="Compact SUV">Compact SUV (Brezza)</option>
                  <option value="SUV">SUV (Creta)</option>
                </select>
              </div>

              {/* Submit CTA */}
              <div className="flex flex-col justify-end">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full min-h-[48px] py-3 text-sm sm:text-base font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Search className="w-4 h-4 shrink-0" />
                  <span>Search Cars</span>
                </Button>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-between text-xs text-text-muted gap-2">
              <span>* 24-hr minimum duration applies. Simple same-to-same fuel policy.</span>
              <span className="font-semibold text-brand">No customer login needed to request</span>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};
