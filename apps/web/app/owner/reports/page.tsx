'use client';

import React, { useState } from 'react';
import { Download, FileText, Filter, Calendar, CheckCircle2 } from 'lucide-react';
import { useMockState } from '@/lib/mock-state';
import { formatDateTime } from '@/lib/utils';
import { OwnerShell } from '@/components/owner/OwnerShell';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function OwnerReportsPage() {
  const { bookings, models, vehicles } = useMockState();
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [modelFilter, setModelFilter] = useState('ALL');
  const [downloaded, setDownloaded] = useState(false);

  const filteredBookings = bookings.filter(b => {
    const matchStatus = statusFilter === 'ALL' || b.status === statusFilter;
    const matchModel = modelFilter === 'ALL' || b.modelId === modelFilter;
    return matchStatus && matchModel;
  });

  const exportCSV = () => {
    const headers = [
      'Reference',
      'Status',
      'Customer Name',
      'Customer Phone',
      'Vehicle Model',
      'Assigned Vehicle Code',
      'Pickup Schedule',
      'Return Schedule',
      'Source',
      'Created At',
    ];

    const rows = filteredBookings.map(b => {
      const model = models.find(m => m.id === b.modelId);
      const vehicle = vehicles.find(v => v.id === b.assignedVehicleId);
      return [
        `"${b.publicReference}"`,
        `"${b.status}"`,
        `"${b.customerName}"`,
        `"${b.customerPhone}"`,
        `"${model?.brand || ''} ${model?.name || ''}"`,
        `"${vehicle?.internalCode || 'Unassigned'}"`,
        `"${b.confirmedPickupAt || b.requestedPickupAt}"`,
        `"${b.confirmedReturnAt || b.requestedReturnAt}"`,
        `"${b.source}"`,
        `"${b.createdAt}"`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `drivenest_bookings_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 3000);
  };

  return (
    <OwnerShell>
      <div className="space-y-6 max-w-5xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
          <div>
            <h1 className="text-2xl font-bold text-text">Operational Reports & Export</h1>
            <p className="text-xs text-text-muted mt-0.5">
              Export operational booking records as CSV for dispatch and record-keeping.
            </p>
          </div>
          <Button onClick={exportCSV} size="sm" className="flex items-center gap-2 font-bold">
            <Download className="w-4 h-4" />
            <span>Export Filtered CSV</span>
          </Button>
        </div>

        {/* Filter Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
              <Filter className="w-4 h-4 text-brand" /> Report Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-medium text-text mb-1.5">Booking Status</label>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="w-full bg-surface text-text text-xs border border-border rounded-input px-3 py-2"
              >
                <option value="ALL">All Statuses ({bookings.length})</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="ONGOING">Ongoing</option>
                <option value="PENDING">Pending</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-text mb-1.5">Vehicle Model</label>
              <select
                value={modelFilter}
                onChange={e => setModelFilter(e.target.value)}
                className="w-full bg-surface text-text text-xs border border-border rounded-input px-3 py-2"
              >
                <option value="ALL">All Models</option>
                {models.map(m => (
                  <option key={m.id} value={m.id}>{m.brand} {m.name}</option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Report Preview */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold uppercase tracking-wider">
              Export Records Preview ({filteredBookings.length} Bookings)
            </CardTitle>
            {downloaded && (
              <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> CSV Download Triggered!
              </span>
            )}
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-alt/70 border-b border-border text-text-muted text-[10px] uppercase">
                <tr>
                  <th className="p-3 font-bold">Reference</th>
                  <th className="p-3 font-bold">Status</th>
                  <th className="p-3 font-bold">Customer</th>
                  <th className="p-3 font-bold">Model</th>
                  <th className="p-3 font-bold">Assigned Car</th>
                  <th className="p-3 font-bold">Pickup</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredBookings.map(b => {
                  const m = models.find(mod => mod.id === b.modelId);
                  const v = vehicles.find(veh => veh.id === b.assignedVehicleId);
                  return (
                    <tr key={b.id} className="hover:bg-surface-alt/30">
                      <td className="p-3 font-mono font-bold text-brand">{b.publicReference}</td>
                      <td className="p-3 font-semibold">{b.status}</td>
                      <td className="p-3">{b.customerName} ({b.customerPhone})</td>
                      <td className="p-3">{m?.brand} {m?.name}</td>
                      <td className="p-3 font-mono">{v?.internalCode || '—'}</td>
                      <td className="p-3 text-[11px] text-text-muted">
                        {formatDateTime(b.confirmedPickupAt || b.requestedPickupAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </OwnerShell>
  );
}
