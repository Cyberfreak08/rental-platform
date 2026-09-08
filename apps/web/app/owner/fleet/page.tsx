'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  CarFront,
  Plus,
  Shield,
  Gauge,
  Fuel,
  Users,
  Eye,
  CheckCircle2,
  AlertCircle,
  Wrench,
} from 'lucide-react';
import { useMockState } from '@/lib/mock-state';
import { formatCurrency } from '@/lib/utils';
import { OwnerShell } from '@/components/owner/OwnerShell';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default function OwnerFleetPage() {
  const { models, vehicles } = useMockState();
  const [selectedModelFilter, setSelectedModelFilter] = useState<string>('ALL');

  const filteredVehicles = vehicles.filter(
    v => selectedModelFilter === 'ALL' || v.modelId === selectedModelFilter
  );

  return (
    <OwnerShell>
      <div className="space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-text">Fleet & Vehicles Management</h1>
            <p className="text-xs text-text-muted mt-0.5">
              Manage vehicle models, specifications, pricing, and physical fleet units.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/owner">
              <Button size="sm" variant="outline" className="text-xs min-h-[38px]">
                ← Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Model Level Overview Cards */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-text uppercase tracking-wider">Vehicle Models (Catalog)</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {models.map(model => {
              const modelVehicles = vehicles.filter(v => v.modelId === model.id);
              const activeCount = modelVehicles.filter(v => v.status === 'ACTIVE').length;
              const inactiveCount = modelVehicles.filter(v => v.status === 'INACTIVE').length;

              return (
                <div
                  key={model.id}
                  className="bg-surface border border-border rounded-feature-card p-4 sm:p-6 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3 sm:mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-10 sm:w-16 sm:h-12 bg-surface-alt rounded-card p-1.5 border border-border flex items-center justify-center shrink-0">
                          <img
                            src={model.image || `/assets/cars/${model.name.toLowerCase()}-default.svg`}
                            alt={model.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] sm:text-xs text-text-muted uppercase tracking-wider font-semibold block truncate">
                            {model.brand}
                          </span>
                          <h3 className="text-base sm:text-lg font-bold text-text truncate">{model.name}</h3>
                          <span className="text-[11px] text-text-muted">{model.category}</span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-lg sm:text-xl font-bold text-brand">{formatCurrency(model.pricePerDay)}</span>
                        <span className="text-[10px] text-text-muted block">/ day</span>
                      </div>
                    </div>

                    <p className="text-xs text-text-muted line-clamp-2 mb-3 leading-relaxed hidden sm:block">
                      {model.description}
                    </p>

                    <div className="grid grid-cols-3 gap-1.5 py-2 bg-surface-alt/70 rounded-control px-2.5 border border-border/60 text-[11px] sm:text-xs">
                      <div className="truncate">
                        <span className="text-text-muted block text-[10px]">Transmission</span>
                        <span className="font-semibold text-text">{model.transmission}</span>
                      </div>
                      <div className="truncate">
                        <span className="text-text-muted block text-[10px]">Fuel</span>
                        <span className="font-semibold text-text">{model.fuelType}</span>
                      </div>
                      <div className="truncate">
                        <span className="text-text-muted block text-[10px]">Seats</span>
                        <span className="font-semibold text-text">{model.seats} Seats</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-3 border-t border-border flex items-center justify-between gap-2">
                    <div className="text-xs">
                      <span className="font-bold text-emerald-800">{activeCount} Active</span>
                      {inactiveCount > 0 && (
                        <span className="text-rose-800 ml-1.5 font-medium">({inactiveCount} in Service)</span>
                      )}
                    </div>
                    <Link href={`/owner/fleet/models/${model.id}`}>
                      <Button size="sm" variant="outline" className="text-xs font-semibold min-h-[36px]">
                        Manage Model →
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Physical Vehicles Section */}
        <div className="space-y-4 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold text-text uppercase tracking-wider">All Physical Fleet Units</h2>
              <p className="text-xs text-text-muted">Direct fleet vehicle inventory and service status.</p>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedModelFilter}
                onChange={e => setSelectedModelFilter(e.target.value)}
                className="bg-surface text-text text-xs border border-border rounded-input px-3 py-2 min-h-[40px]"
              >
                <option value="ALL">All Models ({vehicles.length} Units)</option>
                {models.map(m => (
                  <option key={m.id} value={m.id}>{m.brand} {m.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 1. Mobile Cards for Physical Vehicles (< 768px) */}
          <div className="block md:hidden space-y-3">
            {filteredVehicles.map(veh => {
              const model = models.find(m => m.id === veh.modelId);
              return (
                <div
                  key={veh.id}
                  className="bg-surface border border-border rounded-card p-4 shadow-sm space-y-2.5"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-border/60">
                    <span className="font-mono text-xs font-bold text-brand">{veh.internalCode}</span>
                    <Badge status={veh.status}>{veh.status}</Badge>
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-text-muted">Model:</span>
                      <span className="font-bold text-text">{model?.brand} {model?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">Registration / Plate:</span>
                      <span className="font-mono text-text">{veh.registrationReference || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">Model Year:</span>
                      <span className="text-text">{veh.year}</span>
                    </div>
                    {veh.inactiveReason && (
                      <div className="p-2 bg-rose-50 border border-rose-200 rounded-control text-rose-800 text-[11px] mt-1">
                        <strong>Reason:</strong> {veh.inactiveReason}
                      </div>
                    )}
                  </div>

                  <div className="pt-2">
                    <Link href={`/owner/fleet/vehicles/${veh.id}`} className="block">
                      <Button size="sm" variant="outline" className="w-full text-xs font-semibold min-h-[38px]">
                        Configure Vehicle
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 2. Desktop Table (>= 768px) */}
          <div className="hidden md:block bg-surface border border-border rounded-card shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-alt/70 border-b border-border text-text-muted uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3.5 font-bold">Internal Identifier</th>
                    <th className="p-3.5 font-bold">Model</th>
                    <th className="p-3.5 font-bold">Registration Reference</th>
                    <th className="p-3.5 font-bold">Year</th>
                    <th className="p-3.5 font-bold">Status</th>
                    <th className="p-3.5 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredVehicles.map(veh => {
                    const model = models.find(m => m.id === veh.modelId);
                    return (
                      <tr key={veh.id} className="hover:bg-surface-alt/40 transition-colors">
                        <td className="p-3.5 font-mono font-bold text-text">
                          {veh.internalCode}
                        </td>
                        <td className="p-3.5">
                          <span className="font-semibold text-text">{model?.brand} {model?.name}</span>
                          <span className="text-[10px] text-text-muted block">{model?.category}</span>
                        </td>
                        <td className="p-3.5 font-mono font-medium text-text-muted">
                          {veh.registrationReference || '—'}
                        </td>
                        <td className="p-3.5 text-text">{veh.year}</td>
                        <td className="p-3.5">
                          <Badge status={veh.status}>{veh.status}</Badge>
                          {veh.inactiveReason && (
                            <span className="text-[10px] text-rose-800 block mt-0.5">
                              {veh.inactiveReason}
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 text-right">
                          <Link href={`/owner/fleet/vehicles/${veh.id}`}>
                            <Button size="sm" variant="outline" className="text-xs min-h-[34px]">
                              Configure
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </OwnerShell>
  );
}
