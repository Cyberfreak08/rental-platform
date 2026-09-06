'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Ban, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useMockState } from '@/lib/mock-state';
import { formatDateTime } from '@/lib/utils';
import { OwnerShell } from '@/components/owner/OwnerShell';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { VehicleStatus } from '@drivenest/shared';

export default function OwnerVehicleDetailPage() {
  const params = useParams();
  const vehicleId = params.vehicleId as string;
  const { vehicles, models, bookings, blocks, updateVehicle, addVehicleBlock } = useMockState();

  const vehicle = vehicles.find(v => v.id === vehicleId);

  const [status, setStatus] = useState<VehicleStatus>(vehicle?.status || 'ACTIVE');
  const [inactiveReason, setInactiveReason] = useState(vehicle?.inactiveReason || '');
  const [internalNotes, setInternalNotes] = useState(vehicle?.internalNotes || '');
  const [saved, setSaved] = useState(false);

  // Vehicle Block Form State
  const [blockStart, setBlockStart] = useState('2026-09-10T09:00:00+05:30');
  const [blockEnd, setBlockEnd] = useState('2026-09-12T18:00:00+05:30');
  const [blockReason, setBlockReason] = useState('Routine Service');
  const [blockAdded, setBlockAdded] = useState(false);

  if (!vehicle) {
    return (
      <OwnerShell>
        <div className="p-12 text-center">
          <h2 className="text-xl font-bold text-text">Physical Vehicle Not Found</h2>
          <Link href="/owner/fleet" className="mt-4 inline-block">
            <Button variant="outline">Back to Fleet</Button>
          </Link>
        </div>
      </OwnerShell>
    );
  }

  const model = models.find(m => m.id === vehicle.modelId);
  const vehicleBookings = bookings.filter(b => b.assignedVehicleId === vehicle.id);
  const vehicleBlocks = blocks.filter(b => b.physicalVehicleId === vehicle.id);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateVehicle(vehicle.id, {
      status,
      inactiveReason: status === 'INACTIVE' ? inactiveReason : undefined,
      internalNotes,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleAddBlock = (e: React.FormEvent) => {
    e.preventDefault();
    addVehicleBlock({
      physicalVehicleId: vehicle.id,
      startsAt: blockStart,
      endsAt: blockEnd,
      reason: blockReason,
    });
    setBlockAdded(true);
    setTimeout(() => setBlockAdded(false), 2500);
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
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-mono font-bold text-text">{vehicle.internalCode}</h1>
                <Badge status={vehicle.status}>{vehicle.status}</Badge>
              </div>
              <p className="text-xs text-text-muted mt-0.5">
                {model?.brand} {model?.name} • Year {vehicle.year} • Reg: {vehicle.registrationReference || 'Unregistered'}
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
                  onChange={e => setStatus(e.target.value as VehicleStatus)}
                  required
                >
                  <option value="ACTIVE">ACTIVE (Eligible for Booking Assignment)</option>
                  <option value="INACTIVE">INACTIVE (Service, Repair or Offline)</option>
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
                  <Button type="submit" size="sm" className="font-bold flex items-center gap-1.5">
                    <Save className="w-4 h-4" /> Save Status
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
              <Ban className="w-4 h-4 text-danger" /> Schedule Maintenance / Out-of-Service Block
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddBlock} className="space-y-4 text-xs">
              <p className="text-xs text-text-muted">
                Blocks this specific car from being assigned for a date range without modifying the model pricing or catalog.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Input
                  label="Block Start"
                  value={blockStart}
                  onChange={e => setBlockStart(e.target.value)}
                  required
                />
                <Input
                  label="Block End"
                  value={blockEnd}
                  onChange={e => setBlockEnd(e.target.value)}
                  required
                />
                <Input
                  label="Reason"
                  value={blockReason}
                  onChange={e => setBlockReason(e.target.value)}
                  required
                />
              </div>
              <div className="flex items-center justify-between pt-1">
                {blockAdded && (
                  <span className="text-xs text-emerald-700 font-bold">
                    ✓ Block registered for this vehicle!
                  </span>
                )}
                <Button type="submit" size="sm" variant="outline" className="ml-auto text-xs font-bold">
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
                <div key={b.id} className="p-4 flex items-center justify-between text-xs hover:bg-surface-alt/40">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-text">{b.publicReference}</span>
                      <Badge status={b.status}>{b.status}</Badge>
                      <span className="font-semibold text-text">{b.customerName}</span>
                    </div>
                    <p className="text-[11px] text-text-muted mt-0.5">
                      {formatDateTime(b.confirmedPickupAt || b.requestedPickupAt)} to {formatDateTime(b.confirmedReturnAt || b.requestedReturnAt)}
                    </p>
                  </div>
                  <Link href={`/owner/bookings/${b.id}`}>
                    <Button size="sm" variant="outline" className="text-xs">
                      View
                    </Button>
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
