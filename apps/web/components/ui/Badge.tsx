import React from 'react';
import { cn } from '@/lib/utils';
import { BookingStatus, VehicleStatus } from '@drivenest/shared';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status?: BookingStatus | VehicleStatus | 'AVAILABLE' | 'UNAVAILABLE' | string;
}

export const Badge: React.FC<BadgeProps> = ({ status, className, children, ...props }) => {
  const getStatusStyles = (st?: string) => {
    switch (st?.toUpperCase()) {
      case 'PENDING':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'CONFIRMED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'ONGOING':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'COMPLETED':
        return 'bg-slate-100 text-slate-800 border-slate-200';
      case 'REJECTED':
      case 'CANCELLED':
      case 'INACTIVE':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'ACTIVE':
      case 'AVAILABLE':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'UNAVAILABLE':
        return 'bg-zinc-100 text-zinc-600 border-zinc-200';
      default:
        return 'bg-surface-alt text-text-muted border-border';
    }
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border',
        getStatusStyles(status),
        className
      )}
      {...props}
    >
      {children || status}
    </span>
  );
};
