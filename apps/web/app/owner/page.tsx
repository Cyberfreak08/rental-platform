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
  ChevronDown,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { ownerApi, OwnerDashboardSummary, OwnerBookingItem, OwnerVehicleItem, OwnerModelItem } from '@/lib/api';
import { useMockState } from '@/lib/mock-state';
import { formatDate, formatDateTime, formatCurrency } from '@/lib/utils';
import { OwnerShell } from '@/components/owner/OwnerShell';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input, Select } from '@/components/ui/Input';
import { DateTimePicker } from '@/components/ui/DateTimePicker';

export default function OwnerDashboardPage() {
  // Use mock-state only for mutations that delegate to real API
  const { createOfflineBooking, addVehicleBlock, addBusinessClosure } = useMockState();

  const [summary, setSummary] = useState<OwnerDashboardSummary | null>(null);
  const [models, setModels] = useState<OwnerModelItem[]>([]);
  const [vehicles, setVehicles] = useState<OwnerVehicleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [sum, mods, vehs] = await Promise.all([
        ownerApi.getDashboardSummary(),
        ownerApi.getModels(),
        ownerApi.getVehicles(),
      ]);
      setSummary(sum);
      setModels(mods);
      setVehicles(vehs);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard. Please refresh.');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { fetchData(); }, [fetchData]);

  // Modals state
  const [offlineModalOpen, setOfflineModalOpen] = useState(false);
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [closureModalOpen, setClosureModalOpen] = useState(false);
  const [secondaryMenuOpen, setSecondaryMenuOpen] = useState(false);

  // Offline booking form
  const [offlineModelId, setOfflineModelId] = useState('');
  const [offlineVehicleId, setOfflineVehicleId] = useState('');
  const [offlineName, setOfflineName] = useState('');
  const [offlinePhone, setOfflinePhone] = useState('');
  const [offlinePickup, setOfflinePickup] = useState('');
  const [offlineReturn, setOfflineReturn] = useState('');

  // Vehicle block form
  const [blockVehicleId, setBlockVehicleId] = useState('');
  const [blockStartsAt, setBlockStartsAt] = useState('');
  const [blockEndsAt, setBlockEndsAt] = useState('');
  const [blockReason, setBlockReason] = useState('Routine Inspection');

  // Business closure form
  const [closureStartsAt, setClosureStartsAt] = useState('');
  const [closureEndsAt, setClosureEndsAt] = useState('');
  const [closureReason, setClosureReason] = useState('Holiday');

  const handleCreateOffline = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createOfflineBooking({
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
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to create booking.');
    }
  };

  const handleAddBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await ownerApi.createBlock({
        physicalVehicleId: blockVehicleId,
        startsAt: blockStartsAt,
        endsAt: blockEndsAt,
        reason: blockReason,
      });
      setBlockModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to create block.');
    }
  };

  const handleAddClosure = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await ownerApi.createClosure({
        startsAt: closureStartsAt,
        endsAt: closureEndsAt,
        reason: closureReason,
      });
      setClosureModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to create closure.');
    }
  };

  if (loading) {
    return (
      <OwnerShell>
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-brand" />
          <p className="text-sm text-text-muted">Loading dashboard...</p>
        </div>
      </OwnerShell>
    );
  }

  if (error) {
    return (
      <OwnerShell>
        <div className="p-8 text-center">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
          <p className="text-sm text-text font-bold">{error}</p>
          <Button onClick={fetchData} size="sm" variant="outline" className="mt-4">Retry</Button>
        </div>
      </OwnerShell>
    );
  }

  const metrics = summary?.metrics;
  const upcomingBookings = summary?.upcomingBookings || [];
  const pendingBookings = upcomingBookings.filter(b => b.status === 'PENDING');
  const confirmedBookings = upcomingBookings.filter(b => b.status === 'CONFIRMED');
  const ongoingBookings = upcomingBookings.filter(b => b.status === 'ONGOING');

  return (
    <OwnerShell>
      <div className="space-y-6 sm:space-y-8">
        {/* Top Operational Header & Quick Shortcuts */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 sm:pb-6 border-b border-border">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-text">Operations Dashboard</h1>
            <p className="text-xs text-text-muted mt-0.5">Real-time business overview</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              size="sm"
              onClick={() => setOfflineModalOpen(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 font-bold min-h-[40px]"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span>+ Walk-in Booking</span>
            </Button>

            <div className="hidden md:flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setBlockModalOpen(true)}
                className="flex items-center gap-1.5 min-h-[40px]"
              >
                <Ban className="w-3.5 h-3.5 text-danger shrink-0" />
                <span>Block Car</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setClosureModalOpen(true)}
                className="flex items-center gap-1.5 min-h-[40px]"
              >
                <Building2 className="w-3.5 h-3.5 text-warning shrink-0" />
                <span>Close Business</span>
              </Button>
            </div>

            <div className="relative md:hidden">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSecondaryMenuOpen(!secondaryMenuOpen)}
                className="flex items-center gap-1 min-h-[40px] px-2.5"
              >
                <span>Actions</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </Button>
              {secondaryMenuOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-48 bg-surface border border-border rounded-card shadow-lg z-30 p-1.5 space-y-1">
                  <button
                    onClick={() => { setSecondaryMenuOpen(false); setBlockModalOpen(true); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-text hover:bg-surface-alt rounded-control text-left"
                  >
                    <Ban className="w-3.5 h-3.5 text-danger shrink-0" />
                    <span>Block Physical Car</span>
                  </button>
                  <button
                    onClick={() => { setSecondaryMenuOpen(false); setClosureModalOpen(true); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-text hover:bg-surface-alt rounded-control text-left"
                  >
                    <Building2 className="w-3.5 h-3.5 text-warning shrink-0" />
                    <span>Set Business Closure</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Required Banner: Pending Requests */}
        {pendingBookings.length > 0 && (
          <div className="bg-amber-50/80 border border-amber-200 rounded-feature-card p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-control bg-amber-100 text-amber-900 shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-amber-950">
                    Action Required: {pendingBookings.length} Pending Request{pendingBookings.length === 1 ? '' : 's'}
                  </h3>
                  <p className="text-xs text-amber-800">Review and confirm or adjust requested customer schedules.</p>
                </div>
              </div>
              <Link href="/owner/bookings">
                <Button size="sm" variant="outline" className="bg-white text-amber-900 border-amber-300 text-xs font-bold w-full sm:w-auto">
                  View All Requests
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {pendingBookings.slice(0, 4).map(bk => (
                <div
                  key={bk.id}
                  className="bg-white p-3.5 sm:p-4 rounded-card border border-amber-200/80 flex items-center justify-between shadow-sm gap-2"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-amber-900">{bk.publicReference}</span>
                      <span className="text-xs font-semibold text-text truncate">{bk.customerName}</span>
                    </div>
                    <p className="text-xs text-text-muted mt-1 truncate">
                      {bk.model.brand} {bk.model.name} • {formatDateTime(bk.requestedPickupAt)}
                    </p>
                  </div>
                  <Link href={`/owner/bookings/${bk.id}`} className="shrink-0">
                    <Button size="sm" className="text-xs font-semibold min-h-[36px]">Review</Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Operational Overview Metrics */}
        {metrics && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <Card>
              <CardContent className="p-3.5 sm:p-4">
                <div className="text-[10px] sm:text-xs text-text-muted uppercase tracking-wider font-semibold">Pending Review</div>
                <div className="text-xl sm:text-2xl font-bold text-amber-800 mt-1">{metrics.pendingCount}</div>
                <div className="text-[10px] sm:text-[11px] text-text-muted mt-0.5">Awaiting confirmation</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3.5 sm:p-4">
                <div className="text-[10px] sm:text-xs text-text-muted uppercase tracking-wider font-semibold">Active Fleet</div>
                <div className="text-xl sm:text-2xl font-bold text-emerald-800 mt-1">
                  {metrics.fleet.active} / {metrics.fleet.total}
                </div>
                <div className="text-[10px] sm:text-[11px] text-text-muted mt-0.5">{metrics.fleet.inactive} in service/repair</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3.5 sm:p-4">
                <div className="text-[10px] sm:text-xs text-text-muted uppercase tracking-wider font-semibold">Ongoing Rentals</div>
                <div className="text-xl sm:text-2xl font-bold text-blue-800 mt-1">{metrics.ongoingCount}</div>
                <div className="text-[10px] sm:text-[11px] text-text-muted mt-0.5">Currently on road</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3.5 sm:p-4">
                <div className="text-[10px] sm:text-xs text-text-muted uppercase tracking-wider font-semibold">Today Pickups</div>
                <div className="text-xl sm:text-2xl font-bold text-brand mt-1">{metrics.todayPickups}</div>
                <div className="text-[10px] sm:text-[11px] text-text-muted mt-0.5">{metrics.todayReturns} returns today</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main 2-Column Operational Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Left 2 Cols: Schedule & Ongoing Rentals */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                  <CalendarCheck className="w-4 h-4 text-brand shrink-0" /> Upcoming Bookings
                </CardTitle>
                <Link href="/owner/bookings" className="text-xs font-semibold text-brand hover:underline">
                  View Full List →
                </Link>
              </CardHeader>
              <CardContent className="p-0 divide-y divide-border/60">
                {upcomingBookings.length === 0 ? (
                  <div className="p-6 text-center text-xs text-text-muted">No upcoming bookings.</div>
                ) : (
                  upcomingBookings.slice(0, 6).map(bk => (
                    <div key={bk.id} className="p-3.5 sm:p-4 hover:bg-surface-alt/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold text-text">{bk.publicReference}</span>
                          <Badge status={bk.status as any}>{bk.status}</Badge>
                          {bk.assignedVehicle && (
                            <span className="text-xs text-brand font-semibold">{bk.assignedVehicle.internalCode}</span>
                          )}
                        </div>
                        <p className="text-xs text-text">
                          <strong>{bk.customerName}</strong>
                        </p>
                        <p className="text-[11px] text-text-muted">
                          {bk.model.brand} {bk.model.name} • Pickup: {formatDateTime(bk.confirmedPickupAt || bk.requestedPickupAt)}
                        </p>
                      </div>
                      <Link href={`/owner/bookings/${bk.id}`} className="shrink-0 self-start sm:self-auto">
                        <Button variant="outline" size="sm" className="text-xs min-h-[36px]">Manage</Button>
                      </Link>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Col: Fleet Status Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                  <CarFront className="w-4 h-4 text-brand shrink-0" /> Fleet Summary
                </CardTitle>
                <Link href="/owner/fleet" className="text-xs font-semibold text-brand hover:underline">
                  Manage Fleet →
                </Link>
              </CardHeader>
              <CardContent className="p-3.5 sm:p-4 space-y-3">
                {models.map(m => {
                  const activeCount = m.vehicles.filter(v => v.operationalStatus === 'ACTIVE').length;
                  return (
                    <div key={m.id} className="p-3 bg-surface-alt/70 rounded-card border border-border/70 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <h4 className="font-bold text-xs text-text truncate">{m.brand} {m.name}</h4>
                        <span className="text-[11px] text-text-muted block">{m.category} • {formatCurrency(m.pricePerDay)}/day</span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-bold text-emerald-800">{activeCount} Active</span>
                        <span className="text-[10px] text-text-muted block">({m.vehicles.length} Total)</span>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card className="bg-brand text-white">
              <CardContent className="p-4 sm:p-5 space-y-3">
                <h4 className="font-bold text-sm">Operational CSV Export</h4>
                <p className="text-xs text-brand-soft leading-relaxed">
                  Export all confirmed and pending booking records for record-keeping and customer handover check sheets.
                </p>
                <Link href="/owner/reports" className="inline-block">
                  <Button size="sm" className="bg-white text-brand hover:bg-surface-alt font-bold text-xs min-h-[38px]">
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
            <option value="">Select model...</option>
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
            <option value="">Select vehicle...</option>
            {vehicles
              .filter(v => v.vehicleModelId === offlineModelId && v.operationalStatus === 'ACTIVE')
              .map(v => (
                <option key={v.id} value={v.id}>
                  {v.internalCode} - {v.registrationRef || 'Active'}
                </option>
              ))}
          </Select>
          <DateTimePicker
            label="Pickup Date & Time"
            value={offlinePickup}
            onChange={setOfflinePickup}
            required
          />
          <DateTimePicker
            label="Return Date & Time"
            value={offlineReturn}
            onChange={setOfflineReturn}
            required
          />
          <div className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setOfflineModalOpen(false)}>Cancel</Button>
            <Button type="submit" size="sm" className="font-bold">Save Confirmed Booking</Button>
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
            <option value="">Select vehicle...</option>
            {vehicles.map(v => (
              <option key={v.id} value={v.id}>
                {v.internalCode} ({v.model.name}) - {v.registrationRef}
              </option>
            ))}
          </Select>
          <Input
            label="Reason for Block"
            placeholder="e.g. Scheduled 20,000km Engine Service"
            value={blockReason}
            onChange={e => setBlockReason(e.target.value)}
            required
          />
          <DateTimePicker
            label="Block Starts At"
            value={blockStartsAt}
            onChange={setBlockStartsAt}
            required
          />
          <DateTimePicker
            label="Block Ends At"
            value={blockEndsAt}
            onChange={setBlockEndsAt}
            required
          />
          <div className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setBlockModalOpen(false)}>Cancel</Button>
            <Button type="submit" size="sm" className="font-bold">Apply Vehicle Block</Button>
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
          <DateTimePicker
            label="Closure Starts At"
            value={closureStartsAt}
            onChange={setClosureStartsAt}
            required
          />
          <DateTimePicker
            label="Closure Ends At"
            value={closureEndsAt}
            onChange={setClosureEndsAt}
            required
          />
          <div className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setClosureModalOpen(false)}>Cancel</Button>
            <Button type="submit" size="sm" className="font-bold">Save Business Closure</Button>
          </div>
        </form>
      </Modal>
    </OwnerShell>
  );
}
