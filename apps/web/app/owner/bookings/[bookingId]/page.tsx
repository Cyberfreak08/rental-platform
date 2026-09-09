'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  Car,
  User,
  Phone,
  CheckCircle2,
  XCircle,
  Play,
  RotateCcw,
  Edit3,
  MessageCircle,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { ownerApi, OwnerBookingDetail, OwnerVehicleItem } from '@/lib/api';
import { formatDateTime, formatCurrency } from '@/lib/utils';
import { OwnerShell } from '@/components/owner/OwnerShell';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input, Select } from '@/components/ui/Input';
import { DateTimePicker } from '@/components/ui/DateTimePicker';

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.bookingId as string;

  const [booking, setBooking] = useState<OwnerBookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allVehicles, setAllVehicles] = useState<OwnerVehicleItem[]>([]);

  const fetchBooking = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [bk, vehs] = await Promise.all([
        ownerApi.getBookingDetail(bookingId),
        ownerApi.getVehicles(),
      ]);
      setBooking(bk);
      setAllVehicles(vehs);
    } catch (err: any) {
      setError(err.message || 'Failed to load booking.');
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => { fetchBooking(); }, [fetchBooking]);

  // Modal states
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [reassignModalOpen, setReassignModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);

  // Form states
  const [modPickup, setModPickup] = useState('');
  const [modReturn, setModReturn] = useState('');
  const [selectedVehicleToAssign, setSelectedVehicleToAssign] = useState('');
  const [reassignVehicleId, setReassignVehicleId] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (booking) {
      setModPickup(booking.confirmedPickupAt || booking.requestedPickupAt);
      setModReturn(booking.confirmedReturnAt || booking.requestedReturnAt);
      setSelectedVehicleToAssign(booking.assignedVehicle?.id || '');
    }
  }, [booking]);

  if (loading) {
    return (
      <OwnerShell>
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-brand" />
          <p className="text-sm text-text-muted">Loading booking...</p>
        </div>
      </OwnerShell>
    );
  }

  if (error || !booking) {
    return (
      <OwnerShell>
        <div className="p-12 text-center">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-text">Booking Not Found</h2>
          <p className="text-sm text-text-muted mt-1">{error}</p>
          <Link href="/owner/bookings" className="mt-4 inline-block">
            <Button variant="outline">Back to Bookings</Button>
          </Link>
        </div>
      </OwnerShell>
    );
  }

  // Eligible vehicles: same model, ACTIVE status, not the current vehicle
  const eligibleVehicles = allVehicles.filter(
    v => v.vehicleModelId === booking.model.id && v.operationalStatus === 'ACTIVE'
  );

  const handleConfirm = async () => {
    const vehicleToUse = selectedVehicleToAssign || eligibleVehicles[0]?.id;
    if (!vehicleToUse) {
      alert('No eligible physical vehicle selected or available for this schedule.');
      return;
    }
    setActionLoading(true);
    try {
      await ownerApi.confirmBooking(bookingId, {
        confirmedPickupAt: booking.confirmedPickupAt || booking.requestedPickupAt,
        confirmedReturnAt: booking.confirmedReturnAt || booking.requestedReturnAt,
        vehicleId: vehicleToUse,
      });
      await fetchBooking();
    } catch (err: any) {
      alert(err.message || 'Failed to confirm booking.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleModifySchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    // Schedule modification is not a direct API endpoint in Phase 2D; use confirm with updated times
    setScheduleModalOpen(false);
  };

  const handleReassign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reassignVehicleId) return;
    setActionLoading(true);
    try {
      await ownerApi.reassignBooking(bookingId, reassignVehicleId);
      setReassignModalOpen(false);
      await fetchBooking();
    } catch (err: any) {
      alert(err.message || 'Failed to reassign booking.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await ownerApi.rejectBooking(bookingId, rejectReason);
      setRejectModalOpen(false);
      await fetchBooking();
    } catch (err: any) {
      alert(err.message || 'Failed to reject booking.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await ownerApi.cancelBooking(bookingId, cancelReason);
      setCancelModalOpen(false);
      await fetchBooking();
    } catch (err: any) {
      alert(err.message || 'Failed to cancel booking.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStart = async () => {
    setActionLoading(true);
    try {
      await ownerApi.startRental(bookingId);
      await fetchBooking();
    } catch (err: any) {
      alert(err.message || 'Failed to start rental.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async () => {
    setActionLoading(true);
    try {
      await ownerApi.completeRental(bookingId);
      await fetchBooking();
    } catch (err: any) {
      alert(err.message || 'Failed to complete rental.');
    } finally {
      setActionLoading(false);
    }
  };

  const prefilledWhatsappMsg = encodeURIComponent(
    `Hello ${booking.customerName}, this is DriveNest regarding your booking request ${booking.publicReference}.`
  );

  return (
    <OwnerShell>
      <div className="space-y-6 max-w-5xl">
        {/* Back and Header */}
        <div>
          <Link
            href="/owner/bookings"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-brand mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Bookings</span>
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-mono font-bold text-text">{booking.publicReference}</h1>
                <Badge status={booking.status as any}>{booking.status}</Badge>
              </div>
              <p className="text-xs text-text-muted mt-0.5">
                Submitted on {formatDateTime(booking.createdAt)} via {booking.source}
              </p>
            </div>

            {/* Quick Actions Bar based on Status */}
            <div className="flex flex-wrap items-center gap-2">
              <a
                href={`https://wa.me/${booking.customerPhone.replace(/[^0-9]/g, '')}?text=${prefilledWhatsappMsg}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="sm" className="flex items-center gap-1.5 text-emerald-800 border-emerald-300 min-h-[38px]">
                  <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>WhatsApp</span>
                </Button>
              </a>

              {booking.status === 'PENDING' && (
                <>
                  <Button
                    size="sm"
                    onClick={handleConfirm}
                    disabled={actionLoading}
                    className="bg-emerald-700 hover:bg-emerald-800 font-bold min-h-[38px]"
                  >
                    {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <CheckCircle2 className="w-4 h-4 mr-1.5 shrink-0" />}
                    Confirm Request
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => setRejectModalOpen(true)} className="min-h-[38px]">
                    <XCircle className="w-4 h-4 mr-1.5 shrink-0" /> Decline
                  </Button>
                </>
              )}

              {booking.status === 'CONFIRMED' && (
                <>
                  <Button
                    size="sm"
                    onClick={handleStart}
                    disabled={actionLoading}
                    className="bg-blue-700 hover:bg-blue-800 font-bold min-h-[38px]"
                  >
                    {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Play className="w-4 h-4 mr-1.5 shrink-0" />}
                    Pickup Car
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setReassignModalOpen(true)} className="min-h-[38px]">
                    <RotateCcw className="w-4 h-4 mr-1.5 text-brand shrink-0" /> Reassign
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => setCancelModalOpen(true)} className="min-h-[38px]">
                    Cancel
                  </Button>
                </>
              )}

              {booking.status === 'ONGOING' && (
                <Button
                  size="sm"
                  onClick={handleComplete}
                  disabled={actionLoading}
                  className="bg-brand hover:bg-brand-strong font-bold min-h-[38px]"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <CheckCircle2 className="w-4 h-4 mr-1.5 shrink-0" />}
                  Return & Complete
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* 2-Column Info Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Customer & Notes Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                <User className="w-4 h-4 text-brand shrink-0" /> Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-border/60">
                <span className="text-text-muted font-medium">Customer Name:</span>
                <span className="font-bold text-text">{booking.customerName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/60">
                <span className="text-text-muted font-medium">Phone Number:</span>
                <a href={`tel:${booking.customerPhone}`} className="font-bold text-brand hover:underline">
                  {booking.customerPhone}
                </a>
              </div>
              {booking.customerEmail && (
                <div className="flex justify-between py-1 border-b border-border/60">
                  <span className="text-text-muted font-medium">Email Address:</span>
                  <span className="font-medium text-text">{booking.customerEmail}</span>
                </div>
              )}
              {booking.customerMessage && (
                <div className="pt-2">
                  <span className="text-text-muted font-medium block mb-1">Customer Special Requests:</span>
                  <p className="bg-surface-alt p-3 rounded-control text-xs text-text italic border border-border/70">
                    "{booking.customerMessage}"
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Schedule & Vehicle Assignment Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                <Calendar className="w-4 h-4 text-brand shrink-0" /> Schedule & Vehicle
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="p-3 bg-surface-alt/80 rounded-card space-y-2 border border-border/70">
                <div className="flex justify-between">
                  <span className="text-text-muted">Vehicle Model:</span>
                  <span className="font-bold text-text">{booking.model.brand} {booking.model.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Rate:</span>
                  <span className="font-bold text-brand">{formatCurrency(booking.model.pricePerDay)} / day</span>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <div className="flex justify-between">
                  <span className="text-text-muted">Pickup Schedule:</span>
                  <span className="font-bold text-text">
                    {formatDateTime(booking.confirmedPickupAt || booking.requestedPickupAt)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Return Schedule:</span>
                  <span className="font-bold text-text">
                    {formatDateTime(booking.confirmedReturnAt || booking.requestedReturnAt)}
                  </span>
                </div>
              </div>

              {/* Physical Car Assignment Section */}
              <div className="pt-3 border-t border-border">
                <span className="text-text-muted font-medium block mb-1.5">Assigned Physical Car:</span>
                {booking.assignedVehicle ? (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-control flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <span className="font-mono font-bold text-emerald-950">{booking.assignedVehicle.internalCode}</span>
                      {booking.assignedVehicle.registrationRef && (
                        <span className="text-[11px] text-emerald-800 ml-2">({booking.assignedVehicle.registrationRef})</span>
                      )}
                    </div>
                    <Badge status="ACTIVE" className="shrink-0">Assigned</Badge>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <span className="text-xs text-amber-900 italic block">No physical car committed yet.</span>
                    {booking.status === 'PENDING' && (
                      <Select
                        label="Select Physical Car to Allocate"
                        value={selectedVehicleToAssign}
                        onChange={e => setSelectedVehicleToAssign(e.target.value)}
                      >
                        <option value="">Select from eligible fleet...</option>
                        {eligibleVehicles.map(v => (
                          <option key={v.id} value={v.id}>
                            {v.internalCode} - {v.registrationRef || 'Active'}
                          </option>
                        ))}
                      </Select>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Audit History / Event Log */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-wider">Booking Activity & Event Trail</CardTitle>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-border/60">
            {booking.events && booking.events.length > 0 ? (
              booking.events.map(ev => (
                <div key={ev.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs hover:bg-surface-alt/30">
                  <div className="space-y-0.5">
                    <span className="font-bold text-text">{ev.eventType}</span>
                    {ev.notes && <p className="text-text-muted text-[11px]">{ev.notes}</p>}
                    {ev.fromStatus && ev.toStatus && (
                      <div className="text-[10px] text-brand-strong">
                        Status Transition: {ev.fromStatus} → {ev.toStatus}
                      </div>
                    )}
                  </div>
                  <span className="text-text-muted font-mono text-[11px]">{formatDateTime(ev.createdAt)}</span>
                </div>
              ))
            ) : (
              <div className="p-4 text-xs text-text-muted">No state events recorded.</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal: Reject Request */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Decline Booking Request"
        description="Reject this pending request if fleet is fully committed."
      >
        <form onSubmit={handleReject} className="space-y-4">
          <Input
            label="Reason for Declining (Optional)"
            placeholder="e.g. Requested vehicle model fully booked for selected weekend"
            value={rejectReason}
            onChange={e => setRejectReason(e.target.value)}
          />
          <div className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setRejectModalOpen(false)}>Back</Button>
            <Button type="submit" variant="danger" size="sm" className="font-bold" disabled={actionLoading}>
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Rejection'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Reassign Vehicle */}
      <Modal
        isOpen={reassignModalOpen}
        onClose={() => setReassignModalOpen(false)}
        title="Reassign Physical Vehicle"
        description="Select an alternative eligible physical vehicle for this booking."
      >
        <form onSubmit={handleReassign} className="space-y-4">
          <Select
            label="Select Replacement Vehicle"
            value={reassignVehicleId}
            onChange={e => setReassignVehicleId(e.target.value)}
            required
          >
            <option value="">Choose alternative vehicle...</option>
            {eligibleVehicles
              .filter(v => v.id !== booking.assignedVehicle?.id)
              .map(v => (
                <option key={v.id} value={v.id}>
                  {v.internalCode} - {v.registrationRef || 'Active'}
                </option>
              ))}
          </Select>
          <div className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setReassignModalOpen(false)}>Cancel</Button>
            <Button type="submit" size="sm" className="font-bold" disabled={actionLoading}>
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Reassignment'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Cancel Booking */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Cancel Confirmed Booking"
        description="Cancel this confirmed reservation and release the assigned vehicle."
      >
        <form onSubmit={handleCancel} className="space-y-4">
          <Input
            label="Cancellation Reason"
            placeholder="e.g. Customer requested cancellation due to personal emergency"
            value={cancelReason}
            onChange={e => setCancelReason(e.target.value)}
          />
          <div className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setCancelModalOpen(false)}>Back</Button>
            <Button type="submit" variant="danger" size="sm" className="font-bold" disabled={actionLoading}>
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Cancellation'}
            </Button>
          </div>
        </form>
      </Modal>
    </OwnerShell>
  );
}
