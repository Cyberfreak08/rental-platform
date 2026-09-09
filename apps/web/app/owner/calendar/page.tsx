'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Car,
  Ban,
  Building2,
  CheckCircle2,
  Plus,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { ownerApi, OwnerCalendarData } from '@/lib/api';
import { formatDate, formatDateTime } from '@/lib/utils';
import { OwnerShell } from '@/components/owner/OwnerShell';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

function getWeekDays(startDate: Date): string[] {
  const days: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d;
}

export default function OwnerCalendarPage() {
  const [viewMode, setViewMode] = useState<'week' | 'day'>('week');
  const [weekStart, setWeekStart] = useState<Date>(getMonday(new Date()));
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().slice(0, 10));

  const [calendarData, setCalendarData] = useState<OwnerCalendarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const weekDays = getWeekDays(weekStart);

  const fetchCalendar = useCallback(async () => {
    setLoading(true);
    setError(null);
    const startsAt = weekDays[0] + 'T00:00:00+05:30';
    const endsAt = weekDays[6] + 'T23:59:59+05:30';
    try {
      const data = await ownerApi.getCalendarEvents(startsAt, endsAt);
      setCalendarData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load calendar.');
    } finally {
      setLoading(false);
    }
  }, [weekDays[0], weekDays[6]]);

  useEffect(() => { fetchCalendar(); }, [fetchCalendar]);

  const getEventsForDate = (dateStr: string) => {
    if (!calendarData) return { bookings: [], blocks: [], closures: [] };
    const dayStart = new Date(`${dateStr}T00:00:00+05:30`);
    const dayEnd = new Date(`${dateStr}T23:59:59+05:30`);

    const dayBookings = calendarData.events.bookings.filter(b => {
      const p = new Date(b.confirmedPickupAt);
      const r = new Date(b.confirmedReturnAt);
      return p <= dayEnd && r >= dayStart;
    });

    const dayBlocks = calendarData.events.blocks.filter(b => {
      const s = new Date(b.startsAt);
      const e = new Date(b.endsAt);
      return s <= dayEnd && e >= dayStart;
    });

    const dayClosures = calendarData.events.closures.filter(c => {
      const s = new Date(c.startsAt);
      const e = new Date(c.endsAt);
      return s <= dayEnd && e >= dayStart;
    });

    return { bookings: dayBookings, blocks: dayBlocks, closures: dayClosures };
  };

  const selectedDayEvents = getEventsForDate(selectedDate);

  const prevWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() - 7);
    setWeekStart(d);
  };

  const nextWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);
    setWeekStart(d);
  };

  return (
    <OwnerShell>
      <div className="space-y-6">
        {/* Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
          <div>
            <h1 className="text-2xl font-bold text-text">Operations Calendar</h1>
            <p className="text-xs text-text-muted mt-0.5">
              Visualise vehicle assignments, pickup/return schedules, blocks and closures.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-surface-alt p-1 rounded-control border border-border flex gap-1">
              <button
                onClick={() => setViewMode('week')}
                className={`px-3 py-1 text-xs font-bold rounded-control transition-colors ${
                  viewMode === 'week' ? 'bg-surface text-brand shadow-sm' : 'text-text-muted hover:text-text'
                }`}
              >
                Week View
              </button>
              <button
                onClick={() => setViewMode('day')}
                className={`px-3 py-1 text-xs font-bold rounded-control transition-colors ${
                  viewMode === 'day' ? 'bg-surface text-brand shadow-sm' : 'text-text-muted hover:text-text'
                }`}
              >
                Day Detail
              </button>
            </div>
            <Button size="sm" variant="outline" onClick={prevWeek} className="text-xs px-2">‹ Prev</Button>
            <Button size="sm" variant="outline" onClick={nextWeek} className="text-xs px-2">Next ›</Button>
            <Link href="/owner">
              <Button size="sm" variant="outline" className="text-xs">Dashboard</Button>
            </Link>
          </div>
        </div>

        {loading && (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-brand" />
          </div>
        )}

        {error && (
          <div className="p-6 text-center">
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
            <p className="text-sm text-text font-bold">{error}</p>
            <Button onClick={fetchCalendar} size="sm" variant="outline" className="mt-3">Retry</Button>
          </div>
        )}

        {/* Calendar Week View */}
        {!loading && !error && viewMode === 'week' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
              {weekDays.map(dateStr => {
                const { bookings: bks, blocks: blks, closures: cls } = getEventsForDate(dateStr);
                const isSelected = selectedDate === dateStr;
                const dateObj = new Date(dateStr);
                const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                const dayNum = dateObj.getDate();
                const monthName = dateObj.toLocaleDateString('en-US', { month: 'short' });

                return (
                  <div
                    key={dateStr}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`bg-surface border rounded-card p-3.5 flex flex-col justify-between cursor-pointer transition-all min-h-[180px] ${
                      isSelected
                        ? 'border-brand ring-2 ring-brand/30 shadow-md'
                        : 'border-border hover:border-brand/40'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/60">
                        <div>
                          <span className="text-[11px] font-bold uppercase text-text-muted">{dayName}</span>
                          <div className="text-base font-extrabold text-text">{dayNum} {monthName}</div>
                        </div>
                        {(bks.length > 0 || blks.length > 0 || cls.length > 0) && (
                          <span className="w-2 h-2 rounded-full bg-brand" />
                        )}
                      </div>

                      <div className="space-y-1.5">
                        {cls.map(c => (
                          <div key={c.id} className="p-1.5 rounded bg-amber-100 text-amber-900 border border-amber-200 text-[10px] font-bold truncate">
                            🔒 Closed: {c.reason || 'Holiday'}
                          </div>
                        ))}
                        {blks.map(b => (
                          <div key={b.id} className="p-1.5 rounded bg-rose-100 text-rose-900 border border-rose-200 text-[10px] font-bold truncate">
                            ⛔ {b.vehicle.internalCode}: Blocked
                          </div>
                        ))}
                        {bks.map(bk => (
                          <div
                            key={bk.id}
                            className={`p-1.5 rounded text-[10px] border truncate ${
                              bk.status === 'CONFIRMED'
                                ? 'bg-emerald-50 text-emerald-900 border-emerald-200 font-semibold'
                                : bk.status === 'ONGOING'
                                ? 'bg-blue-50 text-blue-900 border-blue-200 font-semibold'
                                : 'bg-amber-50 text-amber-900 border-amber-200 font-medium'
                            }`}
                          >
                            🚗 {bk.assignedVehicle ? bk.assignedVehicle.internalCode : bk.model.name}: {bk.customerName.split(' ')[0]}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 text-[10px] text-text-muted text-right">
                      {bks.length} booking{bks.length === 1 ? '' : 's'}
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-text-muted italic">
              💡 Click on any day box to inspect its specific breakdown and actions below.
            </p>
          </div>
        )}

        {/* Day Detail Inspector Panel */}
        {!loading && !error && (
          <Card className="border-brand/40 shadow-sm">
            <CardHeader className="bg-surface-alt/50 flex flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-brand" /> Detailed Schedule for {selectedDate}
              </CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-brand">
                  {selectedDayEvents.bookings.length} Bookings • {selectedDayEvents.blocks.length} Blocks • {selectedDayEvents.closures.length} Closures
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {selectedDayEvents.bookings.length === 0 &&
              selectedDayEvents.blocks.length === 0 &&
              selectedDayEvents.closures.length === 0 ? (
                <p className="text-xs text-text-muted p-4 text-center">No operations scheduled on this date.</p>
              ) : (
                <div className="space-y-3">
                  {selectedDayEvents.closures.map(c => (
                    <div key={c.id} className="p-3 bg-amber-50 border border-amber-200 rounded-control flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-amber-950">🔒 Business Closure: {c.reason}</span>
                        <p className="text-[11px] text-amber-800">
                          {formatDateTime(c.startsAt)} to {formatDateTime(c.endsAt)} (All Fleet Unavailable)
                        </p>
                      </div>
                      <Badge status="PENDING">Closure</Badge>
                    </div>
                  ))}

                  {selectedDayEvents.blocks.map(b => (
                    <div key={b.id} className="p-3 bg-rose-50 border border-rose-200 rounded-control flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-rose-950">⛔ Vehicle Block: {b.vehicle.internalCode}</span>
                        <p className="text-[11px] text-rose-800">Reason: {b.reason || 'Service'} ({formatDateTime(b.startsAt)} – {formatDateTime(b.endsAt)})</p>
                      </div>
                      <Badge status="INACTIVE">Blocked</Badge>
                    </div>
                  ))}

                  {selectedDayEvents.bookings.map(bk => (
                    <div key={bk.id} className="p-4 bg-surface rounded-card border border-border shadow-sm flex items-center justify-between text-xs hover:bg-surface-alt/40 transition-colors">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-text">{bk.publicReference}</span>
                          <Badge status={bk.status as any}>{bk.status}</Badge>
                          <span className="font-semibold text-brand">{bk.model.brand} {bk.model.name}</span>
                          {bk.assignedVehicle && (
                            <span className="font-mono text-[11px] bg-brand-soft text-brand-strong px-2 py-0.5 rounded font-bold">
                              {bk.assignedVehicle.internalCode}
                            </span>
                          )}
                        </div>
                        <p className="text-text font-medium">
                          Customer: <strong>{bk.customerName}</strong> ({bk.customerPhone})
                        </p>
                        <p className="text-[11px] text-text-muted">
                          Pickup: {formatDateTime(bk.confirmedPickupAt)} | Return: {formatDateTime(bk.confirmedReturnAt)}
                        </p>
                      </div>
                      <Link href={`/owner/bookings/${bk.id}`}>
                        <Button size="sm" variant="outline" className="text-xs">Open Booking</Button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </OwnerShell>
  );
}
