import React from 'react';
import { Calendar, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DateTimePickerProps {
  label?: string;
  value: string; // ISO string like '2026-09-08T09:00:00+05:30' or '2026-09-08T09:00'
  onChange: (isoString: string) => void;
  required?: boolean;
  minDate?: string;
  className?: string;
  helperText?: string;
}

// Operating hours from 07:00 to 21:00 in 30-min intervals
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

export const DateTimePicker: React.FC<DateTimePickerProps> = ({
  label,
  value,
  onChange,
  required = false,
  minDate,
  className,
  helperText,
}) => {
  // Parse date and time from current value
  let currentDate = '';
  let currentTime = '09:00';

  if (value) {
    if (value.includes('T')) {
      const parts = value.split('T');
      currentDate = parts[0];
      const timePart = parts[1];
      currentTime = timePart.substring(0, 5);
    } else {
      currentDate = value;
    }
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    const newIso = `${newDate}T${currentTime}:00+05:30`;
    onChange(newIso);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTime = e.target.value;
    const newIso = `${currentDate || '2026-09-08'}T${newTime}:00+05:30`;
    onChange(newIso);
  };

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label className="block text-xs font-semibold text-text uppercase tracking-wider mb-1.5">
          {label}
          {required && <span className="text-danger ml-1">*</span>}
        </label>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div className="relative flex items-center">
          <Calendar className="w-4 h-4 text-brand absolute left-3 pointer-events-none" />
          <input
            type="date"
            value={currentDate}
            min={minDate}
            onChange={handleDateChange}
            required={required}
            className="w-full bg-surface text-text text-xs font-medium border border-border rounded-input pl-9 pr-2.5 py-2.5 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand"
          />
        </div>
        <div className="relative flex items-center">
          <Clock className="w-4 h-4 text-brand absolute left-3 pointer-events-none" />
          <select
            value={currentTime}
            onChange={handleTimeChange}
            required={required}
            className="w-full bg-surface text-text text-xs font-medium border border-border rounded-input pl-9 pr-3 py-2.5 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand"
          >
            {TIME_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {formatTimeLabel(t)}
              </option>
            ))}
          </select>
        </div>
      </div>
      {helperText && <p className="text-[11px] text-text-muted mt-1">{helperText}</p>}
    </div>
  );
};
