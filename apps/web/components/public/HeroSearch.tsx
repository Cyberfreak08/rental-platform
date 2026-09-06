import React from 'react';
import {useRouter} from 'next/navigation';
import {Calendar, Clock, Car, Search, Shield, ArrowRight} from 'lucide-react';
import {useMockState} from '@/lib/mock-state';
import {Button} from '@/components/ui/Button';

export const HeroSearch: React.FC = () => {
    const router = useRouter();
    const {models} = useMockState();

    // Sensible default dates: tomorrow 09:00 AM to day after tomorrow 20:00 PM
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
        <section className='relative pt-12 pb-20 md:pt-16 md:pb-28 overflow-hidden'>
            {/* Background soft ambient decoration */}
            <div className='absolute inset-0 bg-gradient-to-b from-brand-soft/40 via-background to-background -z-10' />

            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                <div className='text-center max-w-3xl mx-auto mb-10 md:mb-14'>
                    <div className='inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-soft border border-brand/20 text-brand-strong text-xs font-semibold uppercase tracking-wider mb-4'>
                        <Shield className='w-3.5 h-3.5 text-brand' />{' '}
                        Coimbatore's Trusted Self-Drive Fleet
                    </div>
                    <h1 className='text-4xl sm:text-5xl lg:text-6xl font-extrabold text-text tracking-tight leading-[1.15]'>
                        Explore Coimbatore{' '}
                        <span className='text-brand underline decoration-brand/30 decoration-4'>
                            Your Way
                        </span>
                    </h1>
                    <p className='mt-4 text-base sm:text-lg text-text-muted leading-relaxed'>
                        Flexible, transparent and reliable self-drive cars for
                        city commutes, family road trips, and hill station
                        getaways.
                    </p>
                </div>

                {/* Search Box Card */}
                <div className='max-w-4xl mx-auto bg-surface border border-border rounded-hero shadow-xl p-4 sm:p-7 md:p-8 relative'>
                    <form onSubmit={handleSearch} className='space-y-4'>
                        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
                            {/* Pickup Date & Time */}
                            <div className='bg-surface-alt/60 p-3.5 rounded-input border border-border/80 focus-within:border-brand transition-colors'>
                                <label className='block text-xs font-semibold text-text uppercase tracking-wider mb-1 flex items-center gap-1.5'>
                                    <Calendar className='w-3.5 h-3.5 text-brand' />{' '}
                                    Pickup Date & Time
                                </label>
                                <div className='space-y-1.5'>
                                    <input
                                        type='date'
                                        value={pickupDate}
                                        onChange={(e) =>
                                            setPickupDate(e.target.value)
                                        }
                                        className='w-full bg-surface text-text text-sm font-medium border border-border rounded-control px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand'
                                        required
                                    />
                                    <input
                                        type='time'
                                        value={pickupTime}
                                        onChange={(e) =>
                                            setPickupTime(e.target.value)
                                        }
                                        className='w-full bg-surface text-text text-xs font-medium border border-border rounded-control px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-brand'
                                        required
                                    />
                                </div>
                            </div>

                            {/* Return Date & Time */}
                            <div className='bg-surface-alt/60 p-3.5 rounded-input border border-border/80 focus-within:border-brand transition-colors'>
                                <label className='block text-xs font-semibold text-text uppercase tracking-wider mb-1 flex items-center gap-1.5'>
                                    <Calendar className='w-3.5 h-3.5 text-brand' />{' '}
                                    Return Date & Time
                                </label>
                                <div className='space-y-1.5'>
                                    <input
                                        type='date'
                                        value={returnDate}
                                        onChange={(e) =>
                                            setReturnDate(e.target.value)
                                        }
                                        className='w-full bg-surface text-text text-sm font-medium border border-border rounded-control px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand'
                                        required
                                    />
                                    <input
                                        type='time'
                                        value={returnTime}
                                        onChange={(e) =>
                                            setReturnTime(e.target.value)
                                        }
                                        className='w-full bg-surface text-text text-xs font-medium border border-border rounded-control px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-brand'
                                        required
                                    />
                                </div>
                            </div>

                            {/* Car Category */}
                            <div className='bg-surface-alt/60 p-3.5 rounded-input border border-border/80 focus-within:border-brand transition-colors'>
                                <label className='block text-xs font-semibold text-text uppercase tracking-wider mb-1 flex items-center gap-1.5'>
                                    <Car className='w-3.5 h-3.5 text-brand' />{' '}
                                    Car Type
                                </label>
                                <select
                                    value={category}
                                    onChange={(e) =>
                                        setCategory(e.target.value)
                                    }
                                    className='w-full h-16 bg-surface text-text text-sm font-medium border border-border rounded-control px-3 py-2 focus:outline-none focus:ring-1 focus:ring-brand'
                                >
                                    <option value='Any car'>
                                        Any car (All)
                                    </option>
                                    <option value='Hatchback'>
                                        Hatchback (Swift, i20)
                                    </option>
                                    <option value='Compact SUV'>
                                        Compact SUV (Brezza)
                                    </option>
                                    <option value='SUV'>SUV (Creta)</option>
                                </select>
                            </div>

                            {/* Submit CTA */}
                            <div className='flex flex-col justify-end'>
                                <Button
                                    type='submit'
                                    size='lg'
                                    className='w-full h-[88px] text-base font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2'
                                >
                                    <Search className='w-5 h-5' />
                                    <span>Search Cars</span>
                                </Button>
                            </div>
                        </div>

                        <div className='pt-2 flex flex-wrap items-center justify-between text-xs text-text-muted'>
                            <span>
                                * 24-hr minimum duration applies. Simple
                                same-to-same fuel policy.
                            </span>
                            <span className='font-medium text-brand'>
                                No customer login needed to request
                            </span>
                        </div>
                    </form>
                </div>
            </div>
        </section>
    );
};
