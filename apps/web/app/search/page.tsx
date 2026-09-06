'use client';

import React, {Suspense} from 'react';
import {useSearchParams, useRouter} from 'next/navigation';
import {
    Search,
    Calendar,
    Filter,
    Car,
    RefreshCw,
    AlertCircle,
} from 'lucide-react';
import {useMockState} from '@/lib/mock-state';
import {SiteHeader} from '@/components/public/SiteHeader';
import {SiteFooter} from '@/components/public/SiteFooter';
import {VehicleCard} from '@/components/public/VehicleCard';
import {Button} from '@/components/ui/Button';

function SearchContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const {checkAvailability, models} = useMockState();

    const initialPickupDate = searchParams.get('pickupDate') || '2026-09-08';
    const initialPickupTime = searchParams.get('pickupTime') || '09:00';
    const initialReturnDate = searchParams.get('returnDate') || '2026-09-10';
    const initialReturnTime = searchParams.get('returnTime') || '20:00';
    const initialCategory = searchParams.get('category') || 'All';

    const [pickupDate, setPickupDate] = React.useState(initialPickupDate);
    const [pickupTime, setPickupTime] = React.useState(initialPickupTime);
    const [returnDate, setReturnDate] = React.useState(initialReturnDate);
    const [returnTime, setReturnTime] = React.useState(initialReturnTime);
    const [category, setCategory] = React.useState(initialCategory);

    const pickupIso = `${pickupDate}T${pickupTime}:00+05:30`;
    const returnIso = `${returnDate}T${returnTime}:00+05:30`;

    const availabilityResults = checkAvailability(
        pickupIso,
        returnIso,
        category,
    );

    // Filter only available models by default as mandated by F4 & F12
    const availableModels = availabilityResults.filter((r) => r.isAvailable);

    const handleApplyFilter = (e: React.FormEvent) => {
        e.preventDefault();
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

    return (
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10'>
            {/* Search Bar / Filter Box */}
            <div className='bg-surface border border-border rounded-feature-card shadow-sm p-6 mb-10'>
                <form
                    onSubmit={handleApplyFilter}
                    className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end'
                >
                    <div>
                        <label className='block text-xs font-semibold text-text uppercase tracking-wider mb-1'>
                            Pickup Date & Time
                        </label>
                        <div className='flex gap-2'>
                            <input
                                type='date'
                                value={pickupDate}
                                onChange={(e) => setPickupDate(e.target.value)}
                                className='w-full bg-surface text-text text-xs font-medium border border-border rounded-control px-2.5 py-2'
                                required
                            />
                            <input
                                type='time'
                                value={pickupTime}
                                onChange={(e) => setPickupTime(e.target.value)}
                                className='w-24 bg-surface text-text text-xs font-medium border border-border rounded-control px-1 py-2'
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className='block text-xs font-semibold text-text uppercase tracking-wider mb-1'>
                            Return Date & Time
                        </label>
                        <div className='flex gap-2'>
                            <input
                                type='date'
                                value={returnDate}
                                onChange={(e) => setReturnDate(e.target.value)}
                                className='w-full bg-surface text-text text-xs font-medium border border-border rounded-control px-2.5 py-2'
                                required
                            />
                            <input
                                type='time'
                                value={returnTime}
                                onChange={(e) => setReturnTime(e.target.value)}
                                className='w-24 bg-surface text-text text-xs font-medium border border-border rounded-control px-1 py-2'
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className='block text-xs font-semibold text-text uppercase tracking-wider mb-1'>
                            Car Category
                        </label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className='w-full bg-surface text-text text-xs font-medium border border-border rounded-control px-3 py-2 h-[38px]'
                        >
                            <option value='All'>All Categories</option>
                            <option value='Hatchback'>Hatchback</option>
                            <option value='Compact SUV'>Compact SUV</option>
                            <option value='SUV'>SUV</option>
                        </select>
                    </div>

                    <div className='lg:col-span-2 flex gap-3'>
                        <Button
                            type='submit'
                            size='md'
                            className='flex-1 flex items-center justify-center gap-2'
                        >
                            <RefreshCw className='w-4 h-4' />
                            <span>Update Availability</span>
                        </Button>
                    </div>
                </form>
            </div>

            {/* Results Header */}
            <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-border'>
                <div>
                    <h1 className='text-2xl font-bold text-text'>
                        Available Vehicles
                    </h1>
                    <p className='text-xs text-text-muted mt-1'>
                        Showing cars available for {pickupDate} ({pickupTime})
                        to {returnDate} ({returnTime})
                    </p>
                </div>
                <div className='text-xs font-semibold px-3 py-1.5 bg-brand-soft text-brand-strong rounded-full border border-brand/20 self-start sm:self-auto'>
                    {availableModels.length} Model
                    {availableModels.length === 1 ? '' : 's'} Ready to Book
                </div>
            </div>

            {/* Grid or Empty State */}
            {availableModels.length > 0 ? (
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
                    {availableModels.map((item) => (
                        <VehicleCard
                            key={item.model.id}
                            model={item.model}
                            availableCount={item.availableCount}
                            pickupDate={pickupDate}
                            pickupTime={pickupTime}
                            returnDate={returnDate}
                            returnTime={returnTime}
                        />
                    ))}
                </div>
            ) : (
                <div className='bg-surface border border-border rounded-feature-card p-12 text-center max-w-lg mx-auto'>
                    <AlertCircle className='w-12 h-12 text-amber-600 mx-auto mb-4' />
                    <h3 className='text-lg font-bold text-text'>
                        No Vehicles Available for Selected Interval
                    </h3>
                    <p className='text-xs text-text-muted mt-2 leading-relaxed'>
                        All vehicles in this category are either booked or
                        scheduled for service during your selected timeframe.
                        Try modifying your pickup or return dates.
                    </p>
                    <div className='mt-6 flex justify-center gap-3'>
                        <Button
                            variant='outline'
                            size='sm'
                            onClick={() => {
                                setCategory('All');
                                setPickupDate('2026-09-08');
                                setReturnDate('2026-09-10');
                            }}
                        >
                            Reset Search Dates
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function SearchPage() {
    return (
        <div className='flex flex-col min-h-screen'>
            <SiteHeader />
            <main className='flex-1 bg-background'>
                <Suspense
                    fallback={
                        <div className='p-12 text-center text-sm text-text-muted'>
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
