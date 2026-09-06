'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Car,
  User,
  Phone,
  Mail,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Play,
  RotateCcw,
  Edit3,
  MessageCircle,
} from 'lucide-react';
import { useMockState } from '@/lib/mock-state';
import { formatDateTime, formatCurrency } from '@/lib/utils';
import { OwnerShell } from '@/components/owner/OwnerShell';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input, Select } from '@/components/ui/Input';

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.bookingId as string;
  const {
    bookings,
    models,
    vehicles,
    business,
    confirmBooking,
    rejectBooking,
    cancelBooking,
    startBooking,
    completeBooking,
    reassignVehicle,
    modifyBookingSchedule,
    getEligibleVehiclesForModel,
  } = useMockState();

  const booking = bookings.find(b => b.id === bookingId);

  // Modification modal states
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [reassignModalOpen, setReassignModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);

  // Form states
  const [modPickup, setModPickup] = useState(
    booking ? booking.confirmedPickupAt || booking.requestedPickupAt : ''
  );
  const [modReturn, setModReturn] = useState(
    booking ? booking.confirmedReturnAt || booking.requestedReturnAt : ''
  );
  const [selectedVehicleToAssign, setSelectedVehicleToAssign] = useState(
    booking?.assignedVehicleId || ''
  );
  const [reassignVehicleId, setReassignVehicleId] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [cancelReason, setCancelReason] = useState('');

  if (!booking) {
    return (
      <OwnerShell>
        <div className="p-12 text-center">
          <h2 className="text-xl font-bold text-text">Booking Not Found</h2>
          <Link href="/owner/bookings" className="mt-4 inline-block">
            <Button variant="outline">Back to Bookings</Button>
          </Link>
        </div>
      </OwnerShell>
    );
  }

  const model = models.find(m => m.id === booking.modelId);
  const currentAssignedVehicle = vehicles.find(v => v.id === booking.assignedVehicleId);

  // Find eligible physical vehicles for this model and schedule
  const effectivePickup = booking.confirmedPickupAt || booking.requestedPickupAt;
  const effectiveReturn = booking.confirmedReturnAt || booking.requestedReturnAt;
  const eligibleVehicles = getEligibleVehiclesForModel(
    booking.modelId,
    effectivePickup,
    effectiveReturn,
    booking.id
  );

  const handleConfirm = () => {
    const vehicleToUse = selectedVehicleToAssign || eligibleVehicles[0]?.id;
    if (!vehicleToUse) {
      alert('No eligible physical vehicle selected or available for this schedule.');
      return;
    }
    confirmBooking(booking.id, vehicleToUse, effectivePickup, effectiveReturn);
  };

  const handleModifySchedule = (e: React.FormEvent) => {
    e.preventDefault();
    modifyBookingSchedule(booking.id, modPickup, modReturn);
    setScheduleModalOpen(false);
  };

  const handleReassign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reassignVehicleId) return;
    reassignVehicle(booking.id, reassignVehicleId);
    setReassignModalOpen(false);
  };

  const handleReject = (e: React.FormEvent) => {
    e.preventDefault();
    rejectBooking(booking.id, rejectReason);
    setRejectModalOpen(false);
  };

  const handleCancel = (e: React.FormEvent) => {
    e.preventDefault();
    cancelBooking(booking.id, cancelReason);
    setCancelModalOpen(false);
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
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-mono font-bold text-text">{booking.publicReference}</h1>
                <Badge status={booking.status}>{booking.status}</Badge>
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
                <Button variant="outline" size="sm" className="flex items-center gap-1.5 text-emerald-800 border-emerald-300">
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>WhatsApp Customer</span>
                </Button>
              </a>

              {booking.status === 'PENDING' && (
                <>
                  <Button size="sm" onClick={handleConfirm} className="bg-emerald-700 hover:bg-emerald-800 font-bold">
                    <CheckCircle2 className="w-4 h-4 mr-1.5" /> Confirm Request
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => setRejectModalOpen(true)}>
                    <XCircle className="w-4 h-4 mr-1.5" /> Decline
                  </Button>
                </>
              )}

              {booking.status === 'CONFIRMED' && (
                <>
                  <Button size="sm" onClick={() => startBooking(booking.id)} className="bg-blue-700 hover:bg-blue-800 font-bold">
                    <Play className="w-4 h-4 mr-1.5" /> Start Trip (Pickup)
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setReassignModalOpen(true)}>
                    <RotateCcw className="w-4 h-4 mr-1.5 text-brand" /> Reassign Car
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => setCancelModalOpen(true)}>
                    Cancel Booking
                  </Button>
                </>
              )}

              {booking.status === 'ONGOING' && (
                <Button size="sm" onClick={() => completeBooking(booking.id)} className="bg-brand hover:bg-brand-strong font-bold">
                  <CheckCircle2 className="w-4 h-4 mr-1.5" /> Complete Rental (Return)
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
                <User className="w-4 h-4 text-brand" /> Customer Information
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
                <Calendar className="w-4 h-4 text-brand" /> Schedule & Vehicle
              </CardTitle>
              {booking.status === 'PENDING' || booking.status === 'CONFIRMED' ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setScheduleModalOpen(true)}
                  className="text-xs flex items-center gap-1"
                >
                  <Edit3 className="w-3.5 h-3.5 text-brand" /> Edit Schedule
                </Button>
              ) : null}
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="p-3 bg-surface-alt/80 rounded-card space-y-2 border border-border/70">
                <div className="flex justify-between">
                  <span className="text-text-muted">Vehicle Model:</span>
                  <span className="font-bold text-text">{model?.brand} {model?.name} ({model?.category})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Rate:</span>
                  <span className="font-bold text-brand">{model ? formatCurrency(model.pricePerDay) : '-'} / day</span>
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
                {currentAssignedVehicle ? (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-control flex items-center justify-between">
                    <div>
                      <span className="font-mono font-bold text-emerald-950">{currentAssignedVehicle.internalCode}</span>
                      <span className="text-[11px] text-emerald-800 ml-2">({currentAssignedVehicle.registrationReference})</span>
                    </div>
                    <Badge status="ACTIVE">Assigned</Badge>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <span className="text-xs text-amber-900 italic block">No physical car committed yet.</span>
                    <Select
                      label="Select Physical Car to Allocate"
                      value={selectedVehicleToAssign}
                      onChange={e => setSelectedVehicleToAssign(e.target.value)}
                    >
                      <option value="">Select from eligible fleet...</option>
                      {eligibleVehicles.map(v => (
                        <option key={v.id} value={v.id}>
                          {v.internalCode} ({v.year}) - {v.registrationReference}
                        </option>
                      ))}
                    </Select>
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
                <div key={ev.id} className="p-4 flex items-center justify-between text-xs hover:bg-surface-alt/30">
                  <div className="space-y-0.5">
                    <span className="font-bold text-text">{ev.eventType}</span>
                    {ev.note && <p className="text-text-muted text-[11px]">{ev.note}</p>}
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

      {/* Modal: Modify Schedule */}
      <Modal
        isOpen={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        title="Modify Booking Schedule"
        description="Update pickup or return date & time after discussing with the customer."
      >
        <form onSubmit={handleModifySchedule} className="space-y-4">
          <Input
            label="Pickup Date & Time"
            value={modPickup}
            onChange={e => setModPickup(e.target.value)}
            required
          />
          <Input
            label="Return Date & Time"
            value={modReturn}
            onChange={e => setModReturn(e.target.value)}
            required
          />
          <div className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setScheduleModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" className="font-bold">
              Save New Schedule
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
              .filter(v => v.id !== booking.assignedVehicleId)
              .map(v => (
                <option key={v.id} value={v.id}>
                  {v.internalCode} ({v.year}) - {v.registrationReference}
                </option>
              ))}
          </Select>
          <div className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setReassignModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" className="font-bold">
              Confirm Reassignment
            </Button>
          </div>
        </form>
      </Modal>

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
            <Button type="button" variant="outline" size="sm" onClick={() => setRejectModalOpen(false)}>
              Back
            </Button>
            <Button type="submit" variant="danger" size="sm" className="font-bold">
              Confirm Rejection
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
            <Button type="button" variant="outline" size="sm" onClick={() => setCancelModalOpen(false)}>
              Back
            </Button>
            <Button type="submit" variant="danger" size="sm" className="font-bold">
              Confirm Cancellation
            </Button>
          </div>
        </form>
      </Modal>
    </OwnerShell>
  );
}
