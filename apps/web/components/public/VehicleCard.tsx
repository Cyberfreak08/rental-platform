import React from 'react';
import Link from 'next/link';
import { Fuel, Gauge, Users, ArrowRight } from 'lucide-react';
import { VehicleModel } from '@drivenest/shared';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface VehicleCardProps {
  model: VehicleModel;
  availableCount?: number;
  pickupDate?: string;
  pickupTime?: string;
  returnDate?: string;
  returnTime?: string;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({
  model,
  availableCount = 1,
  pickupDate,
  pickupTime,
  returnDate,
  returnTime,
}) => {
  const queryParams = new URLSearchParams();
  if (pickupDate) queryParams.append('pickupDate', pickupDate);
  if (pickupTime) queryParams.append('pickupTime', pickupTime);
  if (returnDate) queryParams.append('returnDate', returnDate);
  if (returnTime) queryParams.append('returnTime', returnTime);

  const detailUrl = `/models/${model.id}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const requestUrl = `/request/${model.id}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

  return (
    <div className="bg-surface border border-border rounded-feature-card shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col group">
      {/* Mobile-first Responsive Container */}
      <div className="flex flex-col sm:block">
        {/* Media Box */}
        <div className="relative aspect-[16/10] sm:aspect-[16/10] bg-surface-alt/70 p-4 sm:p-6 flex items-center justify-center border-b border-border/60 shrink-0">
          <img
            src={model.image || `/assets/cars/${model.name.toLowerCase()}-default.svg`}
            alt={`${model.brand} ${model.name}`}
            className="w-full h-full object-contain max-h-[140px] sm:max-h-none transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 flex gap-1.5 sm:gap-2">
            <Badge status="AVAILABLE" className="bg-brand-soft text-brand-strong border-brand/20 text-[10px] sm:text-xs">
              {availableCount > 0 ? `${availableCount} Available` : 'Waitlist'}
            </Badge>
            <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider bg-surface px-2 py-0.5 rounded-full border border-border text-text">
              {model.category}
            </span>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-baseline justify-between mb-1.5 sm:mb-2">
              <div className="min-w-0 pr-2">
                <span className="text-[10px] sm:text-xs font-semibold text-text-muted uppercase tracking-wider block truncate">
                  {model.brand}
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-text truncate">{model.name}</h3>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xl sm:text-2xl font-extrabold text-brand">
                  {formatCurrency(model.pricePerDay)}
                </span>
                <span className="text-[10px] sm:text-xs text-text-muted block">/ day</span>
              </div>
            </div>

            <p className="text-xs text-text-muted line-clamp-2 mb-3 sm:mb-4 leading-relaxed hidden sm:block">
              {model.description}
            </p>

            {/* Specs Grid */}
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2 py-2 sm:py-3 border-y border-border/60 text-[11px] sm:text-xs text-text">
              <div className="flex items-center gap-1 sm:gap-1.5 min-w-0">
                <Gauge className="w-3.5 h-3.5 text-brand shrink-0" />
                <span className="truncate">{model.transmission}</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-1.5 min-w-0">
                <Fuel className="w-3.5 h-3.5 text-brand shrink-0" />
                <span className="truncate">{model.fuelType}</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-1.5 min-w-0">
                <Users className="w-3.5 h-3.5 text-brand shrink-0" />
                <span className="truncate">{model.seats} Seats</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 sm:pt-4 mt-1 sm:mt-2 flex items-center gap-2">
            <Link href={detailUrl} className="flex-1 min-w-0">
              <Button variant="outline" size="sm" className="w-full text-xs font-medium px-2 py-2 min-h-[40px]">
                Details
              </Button>
            </Link>
            <Link href={requestUrl} className="flex-1 min-w-0">
              <Button size="sm" className="w-full text-xs font-bold flex items-center justify-center gap-1 px-2 py-2 min-h-[40px]">
                <span>Book Now</span>
                <ArrowRight className="w-3.5 h-3.5 shrink-0" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
