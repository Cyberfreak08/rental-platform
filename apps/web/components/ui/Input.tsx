import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-text mb-1.5">
            {label}
            {props.required && <span className="text-danger ml-1">*</span>}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={cn(
            'w-full px-3.5 py-2.5 bg-surface text-text border border-border rounded-input text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand disabled:bg-surface-alt disabled:text-text-muted',
            error && 'border-danger focus:ring-danger focus:border-danger',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-danger mt-1.5">{error}</p>}
        {!error && helperText && <p className="text-xs text-text-muted mt-1.5">{helperText}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, helperText, id, children, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="block text-sm font-medium text-text mb-1.5">
            {label}
            {props.required && <span className="text-danger ml-1">*</span>}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          className={cn(
            'w-full px-3.5 py-2.5 bg-surface text-text border border-border rounded-input text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand disabled:bg-surface-alt disabled:text-text-muted',
            error && 'border-danger focus:ring-danger focus:border-danger',
            className
          )}
          {...props}
        >
          {children}
        </select>
        {error && <p className="text-xs text-danger mt-1.5">{error}</p>}
        {!error && helperText && <p className="text-xs text-text-muted mt-1.5">{helperText}</p>}
      </div>
    );
  }
);
Select.displayName = 'Select';
