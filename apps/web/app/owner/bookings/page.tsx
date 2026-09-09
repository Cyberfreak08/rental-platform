'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Search, Filter, Calendar, Car, ArrowRight, Eye, Phone, Plus, Loader2, AlertCircle } from 'lucide-react';
import { ownerApi, OwnerBookingItem } from '@/lib/api';
import { formatDateTime, formatCurrency } from '@/lib/utils';
import { OwnerShell } from '@/components/owner/OwnerShell';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default function OwnerBookingsPage() {
  const [bookings, setBookings] = useState<OwnerBookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ownerApi.getBookings({ status: statusFilter !== 'ALL' ? statusFilter : undefined });
      setBookings(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load bookings.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const filteredBookings = bookings.filter(b => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      b.customerName.toLowerCase().includes(q) ||
      b.customerPhone.includes(q) ||
      b.publicReference.toLowerCase().includes(q) ||
      b.model.name.toLowerCase().includes(q) ||
      (b.assignedVehicle?.internalCode?.toLowerCase().includes(q) ?? false)
    );
  });

  const statuses: { label: string; value: string }[] = [
    { label: 'All Bookings', value: 'ALL' },
    { label: 'Pending Requests', value: 'PENDING' },
    { label: 'Confirmed', value: 'CONFIRMED' },
    { label: 'Ongoing', value: 'ONGOING' },
    { label: 'Completed', value: 'COMPLETED' },
    { label: 'Rejected', value: 'REJECTED' },
    { label: 'Cancelled', value: 'CANCELLED' },
  ];

  return (
    <OwnerShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-text">Bookings Management</h1>
            <p className="text-xs text-text-muted mt-0.5">
              Review customer booking requests and manage active reservations.
            </p>
          </div>
          <Link href="/owner">
            <Button size="sm" variant="outline" className="text-xs min-h-[38px]">
              ← Back to Overview
            </Button>
          </Link>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="bg-surface border border-border rounded-card p-4 space-y-3 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by customer name, phone, ref or vehicle..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-surface text-text text-xs pl-9 pr-3 py-2.5 min-h-[44px] border border-border rounded-input focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>
          </div>

          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-border/60">
            {statuses.map(st => {
              const isActive = statusFilter === st.value;
              return (
                <button
                  key={st.value}
                  onClick={() => setStatusFilter(st.value)}
                  className={`px-3 py-2 rounded-control text-xs font-semibold transition-colors min-h-[36px] ${
                    isActive
                      ? 'bg-brand text-white font-bold shadow-sm'
                      : 'bg-surface-alt text-text-muted hover:text-text hover:bg-border/60'
                  }`}
                >
                  {st.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-brand" />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="p-6 text-center">
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
            <p className="text-sm text-text font-bold">{error}</p>
            <Button onClick={fetchBookings} size="sm" variant="outline" className="mt-3">Retry</Button>
          </div>
        )}

        {/* 1. Mobile Cards View (< 768px) */}
        {!loading && !error && (
          <>
            <div className="block md:hidden space-y-3">
              {filteredBookings.length === 0 ? (
                <div className="bg-surface border border-border rounded-card p-8 text-center text-xs text-text-muted">
                  No booking records match your filter criteria.
                </div>
              ) : (
                filteredBookings.map(bk => (
                  <div
                    key={bk.id}
                    className="bg-surface border border-border rounded-feature-card p-4 shadow-sm space-y-3"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-border/60">
                      <span className="font-mono text-xs font-bold text-brand">{bk.publicReference}</span>
                      <Badge status={bk.status as any}>{bk.status}</Badge>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-text-muted">Customer:</span>
                        <span className="font-bold text-text">{bk.customerName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-muted">Phone:</span>
                        <span className="font-mono text-text">{bk.customerPhone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-muted">Car Model:</span>
                        <span className="font-semibold text-text">{bk.model.brand} {bk.model.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-muted">Assigned Unit:</span>
                        <span className="font-mono text-brand font-bold">
                          {bk.assignedVehicle ? bk.assignedVehicle.internalCode : 'Unassigned'}
                        </span>
                      </div>
                      <div className="p-2 bg-surface-alt/70 rounded-control border border-border/60 space-y-1 text-[11px] mt-2">
                        <div className="flex justify-between">
                          <span className="text-text-muted">Pickup:</span>
                          <span className="font-medium text-text">
                            {formatDateTime(bk.confirmedPickupAt || bk.requestedPickupAt)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-muted">Return:</span>
                          <span className="font-medium text-text">
                            {formatDateTime(bk.confirmedReturnAt || bk.requestedReturnAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2">
                      <Link href={`/owner/bookings/${bk.id}`} className="block">
                        <Button
                          size="sm"
                          variant={bk.status === 'PENDING' ? 'primary' : 'outline'}
                          className="w-full text-xs font-bold min-h-[40px]"
                        >
                          {bk.status === 'PENDING' ? 'Review & Confirm' : 'Manage Booking'}
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* 2. Desktop Table View (>= 768px) */}
            <div className="hidden md:block bg-surface border border-border rounded-card shadow-sm overflow-hidden">
              {filteredBookings.length === 0 ? (
                <div className="p-12 text-center text-xs text-text-muted">
                  No booking records match your filter criteria.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-surface-alt/70 border-b border-border text-text-muted uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="p-3.5 font-bold">Reference & Status</th>
                        <th className="p-3.5 font-bold">Customer Info</th>
                        <th className="p-3.5 font-bold">Car Model & Code</th>
                        <th className="p-3.5 font-bold">Requested / Confirmed Timing</th>
                        <th className="p-3.5 font-bold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {filteredBookings.map(bk => (
                        <tr key={bk.id} className="hover:bg-surface-alt/40 transition-colors">
                          <td className="p-3.5">
                            <div className="font-mono font-bold text-text text-xs">{bk.publicReference}</div>
                            <div className="mt-1">
                              <Badge status={bk.status as any}>{bk.status}</Badge>
                            </div>
                            <span className="text-[10px] text-text-muted block mt-0.5">{bk.source}</span>
                          </td>
                          <td className="p-3.5">
                            <div className="font-bold text-text">{bk.customerName}</div>
                            <div className="text-text-muted font-mono">{bk.customerPhone}</div>
                            {bk.customerEmail && <div className="text-[10px] text-text-muted">{bk.customerEmail}</div>}
                          </td>
                          <td className="p-3.5">
                            <div className="font-semibold text-text">{bk.model.brand} {bk.model.name}</div>
                            {bk.assignedVehicle ? (
                              <span className="inline-block mt-1 font-mono text-[11px] font-bold text-brand bg-brand-soft px-2 py-0.5 rounded">
                                {bk.assignedVehicle.internalCode}
                              </span>
                            ) : (
                              <span className="text-[11px] text-amber-800 italic">Unassigned</span>
                            )}
                          </td>
                          <td className="p-3.5 space-y-1">
                            <div>
                              <span className="text-[10px] text-text-muted font-medium">Pickup: </span>
                              <span className="font-medium text-text">
                                {formatDateTime(bk.confirmedPickupAt || bk.requestedPickupAt)}
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] text-text-muted font-medium">Return: </span>
                              <span className="font-medium text-text">
                                {formatDateTime(bk.confirmedReturnAt || bk.requestedReturnAt)}
                              </span>
                            </div>
                          </td>
                          <td className="p-3.5 text-right">
                            <Link href={`/owner/bookings/${bk.id}`}>
                              <Button size="sm" variant={bk.status === 'PENDING' ? 'primary' : 'outline'} className="text-xs font-semibold min-h-[36px]">
                                {bk.status === 'PENDING' ? 'Review & Confirm' : 'Manage'}
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </OwnerShell>
  );
}
