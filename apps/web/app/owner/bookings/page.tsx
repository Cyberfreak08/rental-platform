'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Filter, Calendar, Car, ArrowRight, Eye, Phone, Plus } from 'lucide-react';
import { useMockState } from '@/lib/mock-state';
import { formatDateTime, formatCurrency } from '@/lib/utils';
import { OwnerShell } from '@/components/owner/OwnerShell';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { BookingStatus } from '@drivenest/shared';

export default function OwnerBookingsPage() {
  const { bookings, models, vehicles } = useMockState();
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBookings = bookings.filter(b => {
    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
    const model = models.find(m => m.id === b.modelId);
    const vehicle = vehicles.find(v => v.id === b.assignedVehicleId);

    const matchesSearch =
      b.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.customerPhone.includes(searchQuery) ||
      b.publicReference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (model?.name && model.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (vehicle?.internalCode && vehicle.internalCode.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesStatus && matchesSearch;
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
            <h1 className="text-2xl font-bold text-text">Bookings Management</h1>
            <p className="text-xs text-text-muted mt-0.5">
              Review customer booking requests and manage active reservations.
            </p>
          </div>
          <Link href="/owner">
            <Button size="sm" variant="outline" className="text-xs">
              ← Back to Overview
            </Button>
          </Link>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="bg-surface border border-border rounded-card p-4 space-y-3">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by customer name, phone, ref or vehicle..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-surface text-text text-xs pl-9 pr-3 py-2 border border-border rounded-control focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>
          </div>

          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-border/60">
            {statuses.map(st => {
              const isActive = statusFilter === st.value;
              const count = st.value === 'ALL' ? bookings.length : bookings.filter(b => b.status === st.value).length;
              return (
                <button
                  key={st.value}
                  onClick={() => setStatusFilter(st.value)}
                  className={`px-3 py-1.5 rounded-control text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-brand text-white font-bold'
                      : 'bg-surface-alt text-text-muted hover:text-text hover:bg-border/60'
                  }`}
                >
                  {st.label} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Responsive Table / Card List */}
        <div className="bg-surface border border-border rounded-card shadow-sm overflow-hidden">
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
                  {filteredBookings.map(bk => {
                    const model = models.find(m => m.id === bk.modelId);
                    const vehicle = vehicles.find(v => v.id === bk.assignedVehicleId);
                    return (
                      <tr key={bk.id} className="hover:bg-surface-alt/40 transition-colors">
                        <td className="p-3.5">
                          <div className="font-mono font-bold text-text text-xs">{bk.publicReference}</div>
                          <div className="mt-1">
                            <Badge status={bk.status}>{bk.status}</Badge>
                          </div>
                          <span className="text-[10px] text-text-muted block mt-0.5">{bk.source}</span>
                        </td>
                        <td className="p-3.5">
                          <div className="font-bold text-text">{bk.customerName}</div>
                          <div className="text-text-muted font-mono">{bk.customerPhone}</div>
                          {bk.customerEmail && <div className="text-[10px] text-text-muted">{bk.customerEmail}</div>}
                        </td>
                        <td className="p-3.5">
                          <div className="font-semibold text-text">{model?.brand} {model?.name}</div>
                          <div className="text-text-muted text-[11px]">{model?.category}</div>
                          {vehicle ? (
                            <span className="inline-block mt-1 font-mono text-[11px] font-bold text-brand bg-brand-soft px-2 py-0.5 rounded">
                              {vehicle.internalCode} ({vehicle.registrationReference || 'Assigned'})
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
                            <Button size="sm" variant={bk.status === 'PENDING' ? 'primary' : 'outline'} className="text-xs font-semibold">
                              {bk.status === 'PENDING' ? 'Review & Confirm' : 'Manage'}
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </OwnerShell>
  );
}
