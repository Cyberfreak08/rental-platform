import React from 'react';
import Link from 'next/link';
import { Fuel, Gauge, Users, ArrowRight, CheckCircle2 } from 'lucide-react';
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
      {/* Media Box */}
      <div className="relative aspect-[16/10] bg-surface-alt/70 p-6 flex items-center justify-center border-b border-border/60">
        <img
          src={model.image || `/assets/cars/${model.name.toLowerCase()}-default.svg`}
          alt={`${model.brand} ${model.name}`}
          className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge status="AVAILABLE" className="bg-brand-soft text-brand-strong border-brand/20">
            {availableCount > 0 ? `${availableCount} Available` : 'Waitlist'}
          </Badge>
          <span className="text-[11px] font-semibold uppercase tracking-wider bg-surface px-2.5 py-0.5 rounded-full border border-border text-text">
            {model.category}
          </span>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-baseline justify-between mb-2">
            <div>
              <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">{model.brand}</span>
              <h3 className="text-xl font-bold text-text">{model.name}</h3>
            </div>
            <div className="text-right">
              <span className="text-2xl font-extrabold text-brand">{formatCurrency(model.pricePerDay)}</span>
              <span className="text-xs text-text-muted block">/ day</span>
            </div>
          </div>

          <p className="text-xs text-text-muted line-clamp-2 mb-4 leading-relaxed">
            {model.description}
          </p>

          {/* Specs Grid */}
          <div className="grid grid-cols-3 gap-2 py-3 border-y border-border/60 text-xs text-text">
            <div className="flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-brand" />
              <span>{model.transmission}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Fuel className="w-3.5 h-3.5 text-brand" />
              <span>{model.fuelType}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-brand" />
              <span>{model.seats} Seats</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-4 mt-2 flex items-center gap-2">
          <Link href={detailUrl} className="flex-1">
            <Button variant="outline" size="sm" className="w-full text-xs font-medium">
              View Details
            </Button>
          </Link>
          <Link href={requestUrl} className="flex-1">
            <Button size="sm" className="w-full text-xs font-semibold flex items-center justify-center gap-1">
              <span>Book Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
