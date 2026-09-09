'use client';

import React, { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Search,
  Calendar,
  Filter,
  Car,
  RefreshCw,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { publicApi, PublicAvailabilityResult } from '@/lib/api';
import { SiteHeader } from '@/components/public/SiteHeader';
import { SiteFooter } from '@/components/public/SiteFooter';
import { VehicleCard } from '@/components/public/VehicleCard';
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

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialPickupDate = searchParams.get('pickupDate') || '';
  const initialPickupTime = searchParams.get('pickupTime') || '09:00';
  const initialReturnDate = searchParams.get('returnDate') || '';
  const initialReturnTime = searchParams.get('returnTime') || '20:00';
  const initialCategory = searchParams.get('category') || 'All';

  const [pickupDate, setPickupDate] = React.useState(initialPickupDate);
  const [pickupTime, setPickupTime] = React.useState(initialPickupTime);
  const [returnDate, setReturnDate] = React.useState(initialReturnDate);
  const [returnTime, setReturnTime] = React.useState(initialReturnTime);
  const [category, setCategory] = React.useState(initialCategory);

  const [results, setResults] = React.useState<PublicAvailabilityResult[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [searched, setSearched] = React.useState(false);

  // Auto-search when params are present in the URL
  React.useEffect(() => {
    if (initialPickupDate && initialReturnDate) {
      const pickupIso = `${initialPickupDate}T${initialPickupTime}:00+05:30`;
      const returnIso = `${initialReturnDate}T${initialReturnTime}:00+05:30`;
      doSearch(pickupIso, returnIso, initialCategory);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const doSearch = async (pickupIso: string, returnIso: string, cat: string) => {
    setLoading(true);
    setError(null);
    setSearched(true);
    try {
      const data = await publicApi.searchAvailability({
        pickupAt: pickupIso,
        returnAt: returnIso,
        category: cat !== 'All' ? cat : undefined,
      });
      setResults(data);
    } catch (err: any) {
      setError(err.message || 'Failed to check availability. Please try again.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickupDate || !returnDate) {
      setError('Please select both pickup and return dates.');
      return;
    }
    const pickupIso = `${pickupDate}T${pickupTime}:00+05:30`;
    const returnIso = `${returnDate}T${returnTime}:00+05:30`;
    doSearch(pickupIso, returnIso, category);
    const params = new URLSearchParams({
      pickupDate,
      pickupTime,
      returnDate,
      returnTime,
    });
    if (category && category !== 'All') {
      params.append('category', category);
    }
    router.push(`/search?${params.toString()}`);
  };

  const availableModels = results.filter((r) => r.isAvailable);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
      {/* Search Bar / Filter Box */}
      <div className="bg-surface border border-border rounded-feature-card shadow-sm p-4 sm:p-6 mb-8 md:mb-10">
        <form
          onSubmit={handleApplyFilter}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 items-end"
        >
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
                onChange={(e) => setPickupDate(e.target.value)}
                className="w-full bg-surface text-text text-xs font-medium border border-border rounded-control px-2 py-2 min-h-[44px] focus:outline-none focus:ring-1 focus:ring-brand"
                required
              />
              <select
                value={pickupTime}
                onChange={(e) => setPickupTime(e.target.value)}
                className="w-full bg-surface text-text text-xs font-medium border border-border rounded-control px-2 py-2 min-h-[44px] focus:outline-none focus:ring-1 focus:ring-brand"
                required
              >
                {TIME_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {formatTimeLabel(t)}
                  </option>
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
                onChange={(e) => setReturnDate(e.target.value)}
                className="w-full bg-surface text-text text-xs font-medium border border-border rounded-control px-2 py-2 min-h-[44px] focus:outline-none focus:ring-1 focus:ring-brand"
                required
              />
              <select
                value={returnTime}
                onChange={(e) => setReturnTime(e.target.value)}
                className="w-full bg-surface text-text text-xs font-medium border border-border rounded-control px-2 py-2 min-h-[44px] focus:outline-none focus:ring-1 focus:ring-brand"
                required
              >
                {TIME_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {formatTimeLabel(t)}
                  </option>
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
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-surface text-text text-xs font-medium border border-border rounded-control px-3 py-2 min-h-[44px] focus:outline-none focus:ring-1 focus:ring-brand"
            >
              <option value="All">All Categories</option>
              <option value="Hatchback">Hatchback</option>
              <option value="Compact SUV">Compact SUV</option>
              <option value="SUV">SUV</option>
            </select>
          </div>

          {/* Submit CTA */}
          <div className="flex flex-col justify-end">
            <Button
              type="submit"
              size="lg"
              disabled={loading}
              className="w-full min-h-[48px] py-3 text-sm sm:text-base font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 shrink-0 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 shrink-0" />
              )}
              <span>{loading ? 'Checking...' : 'Check Availability'}</span>
            </Button>
          </div>
        </form>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-card flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Initial prompt — no search yet */}
      {!searched && !loading && (
        <div className="bg-surface border border-border rounded-feature-card p-8 sm:p-12 text-center max-w-lg mx-auto">
          <Search className="w-10 h-10 text-brand/40 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-text">Select Dates to Check Availability</h3>
          <p className="text-xs text-text-muted mt-2 leading-relaxed">
            Choose your pickup and return dates above, then click <strong>Check Availability</strong> to see the fleet.
          </p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="p-12 text-center text-sm text-text-muted flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-brand" />
          <span>Checking availability from real-time fleet data...</span>
        </div>
      )}

      {/* Results */}
      {searched && !loading && !error && (
        <>
          {/* Results Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8 pb-4 border-b border-border">
            <div>
              <h1 className="text-2xl font-bold text-text">Available Vehicles</h1>
              {pickupDate && returnDate && (
                <p className="text-xs text-text-muted mt-1">
                  Showing cars available for {pickupDate} ({formatTimeLabel(pickupTime)}) to {returnDate} ({formatTimeLabel(returnTime)})
                </p>
              )}
            </div>
            <div className="text-xs font-semibold px-3 py-1.5 bg-brand-soft text-brand-strong rounded-full border border-brand/20 self-start sm:self-auto">
              {availableModels.length} Model{availableModels.length === 1 ? '' : 's'} Ready to Book
            </div>
          </div>

          {/* Grid or Empty State */}
          {availableModels.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {availableModels.map((item) => (
                <VehicleCard
                  key={item.modelId}
                  model={{
                    id: item.modelId,
                    brand: item.brand,
                    name: item.name,
                    description: '',
                    category: item.category as any,
                    fuelType: item.fuelType as any,
                    transmission: item.transmission as any,
                    seats: item.seats,
                    pricePerDay: item.pricePerDay,
                    image: item.images?.[0]?.publicUrl || undefined,
                  }}
                  availableCount={item.availableCount}
                  pickupDate={pickupDate}
                  pickupTime={pickupTime}
                  returnDate={returnDate}
                  returnTime={returnTime}
                />
              ))}
            </div>
          ) : (
            <div className="bg-surface border border-border rounded-feature-card p-8 sm:p-12 text-center max-w-lg mx-auto">
              <AlertCircle className="w-12 h-12 text-amber-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-text">
                No Vehicles Available for Selected Interval
              </h3>
              <p className="text-xs text-text-muted mt-2 leading-relaxed">
                All vehicles in this category are either booked or scheduled for service during your selected timeframe. Try modifying your pickup or return dates.
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setCategory('All');
                    setPickupDate('');
                    setReturnDate('');
                    setSearched(false);
                    setResults([]);
                  }}
                >
                  Reset Search
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1 bg-background">
        <Suspense
          fallback={
            <div className="p-12 text-center text-sm text-text-muted">
              Loading availability...
            </div>
          }
        >
          <SearchContent />
        </Suspense>
      </main>
      <SiteFooter />
    </div>
  );
}
