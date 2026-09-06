import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-brand/50 disabled:opacity-50 disabled:pointer-events-none rounded-control';
    
    const variants = {
      primary: 'bg-brand text-white hover:bg-brand-strong active:bg-brand-strong',
      secondary: 'bg-surface-alt text-text hover:bg-border/60 active:bg-border',
      outline: 'border border-border bg-transparent text-text hover:bg-surface-alt active:bg-border',
      danger: 'bg-danger text-white hover:bg-red-700 active:bg-red-800',
      ghost: 'bg-transparent text-text hover:bg-surface-alt active:bg-border',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2.5 text-sm',
      lg: 'px-6 py-3.5 text-base font-semibold',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
