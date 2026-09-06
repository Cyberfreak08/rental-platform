'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Clock,
  CarFront,
  CalendarCheck,
  Plus,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Phone,
  Ban,
  Building2,
  FileBarChart,
} from 'lucide-react';
import { useMockState } from '@/lib/mock-state';
import { formatDate, formatDateTime, formatCurrency } from '@/lib/utils';
import { OwnerShell } from '@/components/owner/OwnerShell';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input, Select } from '@/components/ui/Input';

export default function OwnerDashboardPage() {
  const {
    business,
    bookings,
    vehicles,
    models,
    blocks,
    closures,
    confirmBooking,
    createOfflineBooking,
    addVehicleBlock,
    addBusinessClosure,
  } = useMockState();

  // Metrics
  const pendingBookings = bookings.filter(b => b.status === 'PENDING');
  const confirmedBookings = bookings.filter(b => b.status === 'CONFIRMED');
  const ongoingBookings = bookings.filter(b => b.status === 'ONGOING');
  const activeVehicles = vehicles.filter(v => v.status === 'ACTIVE');
  const inactiveVehicles = vehicles.filter(v => v.status === 'INACTIVE');

  // Modals state
  const [offlineModalOpen, setOfflineModalOpen] = useState(false);
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [closureModalOpen, setClosureModalOpen] = useState(false);

  // Offline booking form
  const [offlineModelId, setOfflineModelId] = useState(models[0]?.id || '');
  const [offlineVehicleId, setOfflineVehicleId] = useState(vehicles[0]?.id || '');
  const [offlineName, setOfflineName] = useState('');
  const [offlinePhone, setOfflinePhone] = useState('');
  const [offlinePickup, setOfflinePickup] = useState('2026-09-08T09:00:00+05:30');
  const [offlineReturn, setOfflineReturn] = useState('2026-09-09T20:00:00+05:30');

  // Vehicle block form
  const [blockVehicleId, setBlockVehicleId] = useState(vehicles[0]?.id || '');
  const [blockStartsAt, setBlockStartsAt] = useState('2026-09-09T09:00:00+05:30');
  const [blockEndsAt, setBlockEndsAt] = useState('2026-09-11T18:00:00+05:30');
  const [blockReason, setBlockReason] = useState('Routine Inspection');

  // Business closure form
  const [closureStartsAt, setClosureStartsAt] = useState('2026-09-14T00:00:00+05:30');
  const [closureEndsAt, setClosureEndsAt] = useState('2026-09-15T23:59:59+05:30');
  const [closureReason, setClosureReason] = useState('Festival Holiday');

  const handleCreateOffline = (e: React.FormEvent) => {
    e.preventDefault();
    createOfflineBooking({
      modelId: offlineModelId,
      assignedVehicleId: offlineVehicleId,
      customerName: offlineName,
      customerPhone: offlinePhone,
      pickupAt: offlinePickup,
      returnAt: offlineReturn,
      source: 'PHONE',
    });
    setOfflineModalOpen(false);
    setOfflineName('');
    setOfflinePhone('');
  };

  const handleAddBlock = (e: React.FormEvent) => {
    e.preventDefault();
    addVehicleBlock({
      physicalVehicleId: blockVehicleId,
      startsAt: blockStartsAt,
      endsAt: blockEndsAt,
      reason: blockReason,
    });
    setBlockModalOpen(false);
  };

  const handleAddClosure = (e: React.FormEvent) => {
    e.preventDefault();
    addBusinessClosure({
      startsAt: closureStartsAt,
      endsAt: closureEndsAt,
      reason: closureReason,
    });
    setClosureModalOpen(false);
  };

  return (
    <OwnerShell>
      <div className="space-y-8">
        {/* Top Operational Header & Quick Shortcuts */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
          <div>
            <h1 className="text-2xl font-bold text-text">Operations Dashboard</h1>
            <p className="text-xs text-text-muted mt-0.5">
              {business.name} • {business.city} Branch Overview
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" onClick={() => setOfflineModalOpen(true)} className="flex items-center gap-1.5 font-semibold">
              <Plus className="w-4 h-4" />
              <span>Add Walk-in / Phone Booking</span>
            </Button>
            <Button variant="outline" size="sm" onClick={() => setBlockModalOpen(true)} className="flex items-center gap-1.5">
              <Ban className="w-3.5 h-3.5 text-danger" />
              <span>Block Vehicle</span>
            </Button>
            <Button variant="outline" size="sm" onClick={() => setClosureModalOpen(true)} className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-warning" />
              <span>Close Business</span>
            </Button>
          </div>
        </div>

        {/* Action Required Banner: Pending Requests */}
        {pendingBookings.length > 0 && (
          <div className="bg-amber-50/80 border border-amber-200 rounded-feature-card p-5">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-control bg-amber-100 text-amber-900">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-amber-950">
                    Action Required: {pendingBookings.length} Pending Booking Request{pendingBookings.length === 1 ? '' : 's'}
                  </h3>
                  <p className="text-xs text-amber-800">
                    Review and confirm or adjust requested customer schedules.
                  </p>
                </div>
              </div>
              <Link href="/owner/bookings">
                <Button size="sm" variant="outline" className="bg-white text-amber-900 border-amber-300 text-xs font-bold">
                  View All Requests
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {pendingBookings.slice(0, 4).map(bk => {
                const model = models.find(m => m.id === bk.modelId);
                return (
                  <div
                    key={bk.id}
                    className="bg-white p-4 rounded-card border border-amber-200/80 flex items-center justify-between shadow-sm"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-amber-900">{bk.publicReference}</span>
                        <span className="text-xs font-semibold text-text">{bk.customerName}</span>
                      </div>
                      <p className="text-xs text-text-muted mt-1">
                        {model?.brand} {model?.name} • {formatDateTime(bk.requestedPickupAt)}
                      </p>
                    </div>
                    <Link href={`/owner/bookings/${bk.id}`}>
                      <Button size="sm" className="text-xs font-semibold">
                        Review
                      </Button>
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Operational Overview Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-xs text-text-muted uppercase tracking-wider font-semibold">Pending Review</div>
              <div className="text-2xl font-bold text-amber-800 mt-1">{pendingBookings.length}</div>
              <div className="text-[11px] text-text-muted mt-0.5">Awaiting owner confirmation</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-xs text-text-muted uppercase tracking-wider font-semibold">Active Fleet</div>
              <div className="text-2xl font-bold text-emerald-800 mt-1">
                {activeVehicles.length} / {vehicles.length}
              </div>
              <div className="text-[11px] text-text-muted mt-0.5">{inactiveVehicles.length} in service/repair</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-xs text-text-muted uppercase tracking-wider font-semibold">Ongoing Rentals</div>
              <div className="text-2xl font-bold text-blue-800 mt-1">{ongoingBookings.length}</div>
              <div className="text-[11px] text-text-muted mt-0.5">Currently with customer</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-xs text-text-muted uppercase tracking-wider font-semibold">Confirmed Upcoming</div>
              <div className="text-2xl font-bold text-brand mt-1">{confirmedBookings.length}</div>
              <div className="text-[11px] text-text-muted mt-0.5">Scheduled for handover</div>
            </CardContent>
          </Card>
        </div>

        {/* Main 2-Column Operational Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Cols: Schedule & Ongoing Rentals */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <CalendarCheck className="w-4 h-4 text-brand" /> Today & Upcoming Handover Schedule
                </CardTitle>
                <Link href="/owner/bookings" className="text-xs font-semibold text-brand hover:underline">
                  View Full List →
                </Link>
              </CardHeader>
              <CardContent className="p-0 divide-y divide-border/60">
                {confirmedBookings.length === 0 && ongoingBookings.length === 0 ? (
                  <div className="p-6 text-center text-xs text-text-muted">No scheduled handovers today.</div>
                ) : (
                  [...ongoingBookings, ...confirmedBookings].map(bk => {
                    const model = models.find(m => m.id === bk.modelId);
                    const vehicle = vehicles.find(v => v.id === bk.assignedVehicleId);
                    return (
                      <div key={bk.id} className="p-4 hover:bg-surface-alt/40 transition-colors flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-text">{bk.publicReference}</span>
                            <Badge status={bk.status}>{bk.status}</Badge>
                            <span className="text-xs text-brand font-semibold">{vehicle?.internalCode || 'Unassigned'}</span>
                          </div>
                          <p className="text-xs text-text">
                            <strong>{bk.customerName}</strong> ({bk.customerPhone})
                          </p>
                          <p className="text-[11px] text-text-muted">
                            {model?.brand} {model?.name} • Pickup: {formatDateTime(bk.confirmedPickupAt || bk.requestedPickupAt)}
                          </p>
                        </div>
                        <Link href={`/owner/bookings/${bk.id}`}>
                          <Button variant="outline" size="sm" className="text-xs">
                            Manage
                          </Button>
                        </Link>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>

            {/* Active Vehicle Blocks & Closures */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Ban className="w-4 h-4 text-danger" /> Active Vehicle Blocks & Closures
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {blocks.length === 0 && closures.length === 0 ? (
                  <p className="text-xs text-text-muted">No vehicle blocks or business closures active.</p>
                ) : (
                  <>
                    {blocks.map(b => {
                      const veh = vehicles.find(v => v.id === b.physicalVehicleId);
                      return (
                        <div key={b.id} className="p-3 bg-surface-alt rounded-control border border-border flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-danger">{veh?.internalCode}: Blocked</span>
                            <p className="text-text-muted text-[11px]">Reason: {b.reason || 'Maintenance'}</p>
                            <p className="text-text-muted text-[11px]">
                              {formatDateTime(b.startsAt)} to {formatDateTime(b.endsAt)}
                            </p>
                          </div>
                          <Badge status="INACTIVE">Blocked</Badge>
                        </div>
                      );
                    })}
                    {closures.map(c => (
                      <div key={c.id} className="p-3 bg-amber-50 rounded-control border border-amber-200 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-amber-900">All Vehicles: Business Closure</span>
                          <p className="text-amber-800 text-[11px]">Reason: {c.reason || 'Holiday'}</p>
                          <p className="text-amber-800 text-[11px]">
                            {formatDateTime(c.startsAt)} to {formatDateTime(c.endsAt)}
                          </p>
                        </div>
                        <Badge status="PENDING">Closed</Badge>
                      </div>
                    ))}
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Col: Fleet Status Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <CarFront className="w-4 h-4 text-brand" /> Fleet Summary
                </CardTitle>
                <Link href="/owner/fleet" className="text-xs font-semibold text-brand hover:underline">
                  Manage Fleet →
                </Link>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                {models.map(m => {
                  const modelVehs = vehicles.filter(v => v.modelId === m.id);
                  const activeCount = modelVehs.filter(v => v.status === 'ACTIVE').length;
                  return (
                    <div key={m.id} className="p-3 bg-surface-alt/70 rounded-card border border-border/70 flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-xs text-text">{m.brand} {m.name}</h4>
                        <span className="text-[11px] text-text-muted">{m.category} • {formatCurrency(m.pricePerDay)}/day</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-emerald-800">{activeCount} Active</span>
                        <span className="text-[10px] text-text-muted block">({modelVehs.length} Total)</span>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card className="bg-brand text-white">
              <CardContent className="p-5 space-y-3">
                <h4 className="font-bold text-sm">Operational CSV Export</h4>
                <p className="text-xs text-brand-soft leading-relaxed">
                  Export all confirmed and pending booking records for record-keeping and customer handover check sheets.
                </p>
                <Link href="/owner/reports" className="inline-block">
                  <Button size="sm" className="bg-white text-brand hover:bg-surface-alt font-bold text-xs">
                    Generate Export
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* 1. Modal: Add Walk-in / Phone Offline Booking */}
      <Modal
        isOpen={offlineModalOpen}
        onClose={() => setOfflineModalOpen(false)}
        title="Add Phone / Walk-in Booking"
        description="Creates a direct Confirmed booking after server availability check."
      >
        <form onSubmit={handleCreateOffline} className="space-y-4">
          <Input
            label="Customer Name"
            placeholder="e.g. Anandha Kumar"
            value={offlineName}
            onChange={e => setOfflineName(e.target.value)}
            required
          />
          <Input
            label="Customer Phone"
            placeholder="e.g. +91 98765 43210"
            value={offlinePhone}
            onChange={e => setOfflinePhone(e.target.value)}
            required
          />
          <Select
            label="Vehicle Model"
            value={offlineModelId}
            onChange={e => setOfflineModelId(e.target.value)}
            required
          >
            {models.map(m => (
              <option key={m.id} value={m.id}>
                {m.brand} {m.name} ({m.category} - {formatCurrency(m.pricePerDay)}/day)
              </option>
            ))}
          </Select>
          <Select
            label="Allocate Physical Car"
            value={offlineVehicleId}
            onChange={e => setOfflineVehicleId(e.target.value)}
            required
          >
            {vehicles
              .filter(v => v.modelId === offlineModelId && v.status === 'ACTIVE')
              .map(v => (
                <option key={v.id} value={v.id}>
                  {v.internalCode} ({v.year}) - {v.registrationReference || 'Active'}
                </option>
              ))}
          </Select>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Pickup Date & Time"
              value={offlinePickup}
              onChange={e => setOfflinePickup(e.target.value)}
              required
            />
            <Input
              label="Return Date & Time"
              value={offlineReturn}
              onChange={e => setOfflineReturn(e.target.value)}
              required
            />
          </div>
          <div className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setOfflineModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" className="font-bold">
              Save Confirmed Booking
            </Button>
          </div>
        </form>
      </Modal>

      {/* 2. Modal: Vehicle Block */}
      <Modal
        isOpen={blockModalOpen}
        onClose={() => setBlockModalOpen(false)}
        title="Block Physical Vehicle"
        description="Prevent vehicle from being assigned during service or repair."
      >
        <form onSubmit={handleAddBlock} className="space-y-4">
          <Select
            label="Select Physical Car"
            value={blockVehicleId}
            onChange={e => setBlockVehicleId(e.target.value)}
            required
          >
            {vehicles.map(v => {
              const m = models.find(mod => mod.id === v.modelId);
              return (
                <option key={v.id} value={v.id}>
                  {v.internalCode} ({m?.name}) - {v.registrationReference}
                </option>
              );
            })}
          </Select>
          <Input
            label="Reason for Block"
            placeholder="e.g. Scheduled 20,000km Engine Service"
            value={blockReason}
            onChange={e => setBlockReason(e.target.value)}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Starts At"
              value={blockStartsAt}
              onChange={e => setBlockStartsAt(e.target.value)}
              required
            />
            <Input
              label="Ends At"
              value={blockEndsAt}
              onChange={e => setBlockEndsAt(e.target.value)}
              required
            />
          </div>
          <div className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setBlockModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" className="font-bold">
              Apply Vehicle Block
            </Button>
          </div>
        </form>
      </Modal>

      {/* 3. Modal: Business Closure */}
      <Modal
        isOpen={closureModalOpen}
        onClose={() => setClosureModalOpen(false)}
        title="Set Business Closure"
        description="Closes booking availability for all vehicles across the business."
      >
        <form onSubmit={handleAddClosure} className="space-y-4">
          <Input
            label="Closure Reason"
            placeholder="e.g. Ayudha Pooja / Deepavali Holiday"
            value={closureReason}
            onChange={e => setClosureReason(e.target.value)}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Starts At"
              value={closureStartsAt}
              onChange={e => setClosureStartsAt(e.target.value)}
              required
            />
            <Input
              label="Ends At"
              value={closureEndsAt}
              onChange={e => setClosureEndsAt(e.target.value)}
              required
            />
          </div>
          <div className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setClosureModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" className="font-bold">
              Save Business Closure
            </Button>
          </div>
        </form>
      </Modal>
    </OwnerShell>
  );
}
