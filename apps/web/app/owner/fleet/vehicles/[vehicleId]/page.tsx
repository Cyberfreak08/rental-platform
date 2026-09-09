'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Ban, CheckCircle2, ShieldAlert, Loader2, AlertCircle } from 'lucide-react';
import { ownerApi, OwnerVehicleItem, OwnerBookingItem } from '@/lib/api';
import { formatDateTime } from '@/lib/utils';
import { OwnerShell } from '@/components/owner/OwnerShell';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { DateTimePicker } from '@/components/ui/DateTimePicker';

export default function OwnerVehicleDetailPage() {
  const params = useParams();
  const vehicleId = params.vehicleId as string;

  const [vehicle, setVehicle] = useState<OwnerVehicleItem | null>(null);
  const [vehicleBookings, setVehicleBookings] = useState<OwnerBookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE' | 'ARCHIVED'>('ACTIVE');
  const [inactiveReason, setInactiveReason] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const [blockStart, setBlockStart] = useState('');
  const [blockEnd, setBlockEnd] = useState('');
  const [blockReason, setBlockReason] = useState('Routine Service');
  const [blockAdded, setBlockAdded] = useState(false);

  const fetchVehicle = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [vehs, bookings] = await Promise.all([
        ownerApi.getVehicles(),
        ownerApi.getBookings({ vehicleId }),
      ]);
      const v = vehs.find(v => v.id === vehicleId);
      if (!v) throw new Error('Vehicle not found.');
      setVehicle(v);
      setStatus(v.operationalStatus);
      setInactiveReason(v.inactiveReason || '');
      setInternalNotes(v.internalNotes || '');
      setVehicleBookings(bookings);
    } catch (err: any) {
      setError(err.message || 'Failed to load vehicle.');
    } finally {
      setLoading(false);
    }
  }, [vehicleId]);

  useEffect(() => { fetchVehicle(); }, [fetchVehicle]);

  if (loading) {
    return (
      <OwnerShell>
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-brand" />
          <p className="text-sm text-text-muted">Loading vehicle...</p>
        </div>
      </OwnerShell>
    );
  }

  if (error || !vehicle) {
    return (
      <OwnerShell>
        <div className="p-12 text-center">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-text">Physical Vehicle Not Found</h2>
          <p className="text-sm text-text-muted mt-1">{error}</p>
          <Link href="/owner/fleet" className="mt-4 inline-block">
            <Button variant="outline">Back to Fleet</Button>
          </Link>
        </div>
      </OwnerShell>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await ownerApi.updateVehicle(vehicle.id, {
        operationalStatus: status,
        inactiveReason: status === 'INACTIVE' ? inactiveReason : null,
        internalNotes: internalNotes || null,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      fetchVehicle();
    } catch (err: any) {
      alert(err.message || 'Failed to save vehicle status.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await ownerApi.createBlock({
        physicalVehicleId: vehicle.id,
        startsAt: blockStart,
        endsAt: blockEnd,
        reason: blockReason,
      });
      setBlockAdded(true);
      setTimeout(() => setBlockAdded(false), 2500);
      setBlockStart('');
      setBlockEnd('');
    } catch (err: any) {
      alert(err.message || 'Failed to create block.');
    }
  };

  return (
    <OwnerShell>
      <div className="space-y-6 max-w-4xl">
        <div>
          <Link
            href="/owner/fleet"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-brand mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Fleet Overview</span>
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl font-mono font-bold text-text">{vehicle.internalCode}</h1>
                <Badge status={vehicle.operationalStatus as any}>{vehicle.operationalStatus}</Badge>
              </div>
              <p className="text-xs text-text-muted mt-0.5">
                {vehicle.model.brand} {vehicle.model.name} • Year {vehicle.modelYear || '—'} • Reg: {vehicle.registrationRef || 'Unregistered'}
              </p>
            </div>
          </div>
        </div>

        {/* Configuration Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-wider">Physical Car Operational Status</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Fleet Status"
                  value={status}
                  onChange={e => setStatus(e.target.value as any)}
                  required
                >
                  <option value="ACTIVE">ACTIVE (Eligible for Booking Assignment)</option>
                  <option value="INACTIVE">INACTIVE (Service, Repair or Offline)</option>
                  <option value="ARCHIVED">ARCHIVED (Permanently removed)</option>
                </Select>

                {status === 'INACTIVE' && (
                  <Input
                    label="Inactive Reason"
                    placeholder="e.g. Brake pad replacement & insurance renewal"
                    value={inactiveReason}
                    onChange={e => setInactiveReason(e.target.value)}
                    required
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-1.5">Internal Fleet Notes</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Fastag ID: 9812903, Next RC renewal in Nov 2027"
                  value={internalNotes}
                  onChange={e => setInternalNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-surface text-text border border-border rounded-input text-xs focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                {saved && (
                  <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Status updated!
                  </span>
                )}
                <div className="ml-auto">
                  <Button type="submit" size="sm" disabled={saving} className="font-bold flex items-center gap-1.5 min-h-[38px]">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Status
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Apply Vehicle Block */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
              <Ban className="w-4 h-4 text-danger shrink-0" /> Schedule Maintenance / Out-of-Service Block
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddBlock} className="space-y-4 text-xs">
              <p className="text-xs text-text-muted">
                Blocks this specific car from being assigned for a date range without modifying the model pricing or catalog.
              </p>
              <Input
                label="Reason for Block"
                placeholder="e.g. Scheduled 20,000km Engine Service"
                value={blockReason}
                onChange={e => setBlockReason(e.target.value)}
                required
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DateTimePicker
                  label="Block Starts At"
                  value={blockStart}
                  onChange={setBlockStart}
                  required
                />
                <DateTimePicker
                  label="Block Ends At"
                  value={blockEnd}
                  onChange={setBlockEnd}
                  required
                />
              </div>
              <div className="flex items-center justify-between pt-2">
                {blockAdded && (
                  <span className="text-xs text-emerald-700 font-bold">✓ Block registered for this vehicle!</span>
                )}
                <Button type="submit" size="sm" variant="outline" className="ml-auto text-xs font-bold min-h-[38px]">
                  Apply Schedule Block
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Assigned Bookings History */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-wider">
              Assigned Bookings History ({vehicleBookings.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-border/60">
            {vehicleBookings.length === 0 ? (
              <div className="p-4 text-xs text-text-muted">No reservations assigned to this car yet.</div>
            ) : (
              vehicleBookings.map(b => (
                <div key={b.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-surface-alt/40">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-text">{b.publicReference}</span>
                      <Badge status={b.status as any}>{b.status}</Badge>
                      <span className="font-semibold text-text">{b.customerName}</span>
                    </div>
                    <p className="text-[11px] text-text-muted mt-0.5">
                      {formatDateTime(b.confirmedPickupAt || b.requestedPickupAt)} to {formatDateTime(b.confirmedReturnAt || b.requestedReturnAt)}
                    </p>
                  </div>
                  <Link href={`/owner/bookings/${b.id}`} className="shrink-0 self-start sm:self-auto">
                    <Button size="sm" variant="outline" className="text-xs min-h-[34px]">View</Button>
                  </Link>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </OwnerShell>
  );
}
