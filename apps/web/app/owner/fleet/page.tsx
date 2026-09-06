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

  const filteredModels = selectedModelFilter === 'ALL'
    ? models
    : models.filter(m => m.id === selectedModelFilter);

  return (
    <OwnerShell>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
          <div>
            <h1 className="text-2xl font-bold text-text">Fleet & Vehicles Management</h1>
            <p className="text-xs text-text-muted mt-0.5">
              Manage vehicle models, specifications, pricing, and physical fleet units.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/owner">
              <Button size="sm" variant="outline" className="text-xs">
                ← Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Model Level Overview Cards */}
        <div className="space-y-6">
          <h2 className="text-base font-bold text-text uppercase tracking-wider">Vehicle Models (Catalog)</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {models.map(model => {
              const modelVehicles = vehicles.filter(v => v.modelId === model.id);
              const activeCount = modelVehicles.filter(v => v.status === 'ACTIVE').length;
              const inactiveCount = modelVehicles.filter(v => v.status === 'INACTIVE').length;

              return (
                <div
                  key={model.id}
                  className="bg-surface border border-border rounded-feature-card p-6 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-12 bg-surface-alt rounded-card p-1.5 border border-border flex items-center justify-center">
                          <img
                            src={model.image || `/assets/cars/${model.name.toLowerCase()}-default.svg`}
                            alt={model.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div>
                          <span className="text-xs text-text-muted uppercase tracking-wider font-semibold">
                            {model.brand}
                          </span>
                          <h3 className="text-lg font-bold text-text">{model.name}</h3>
                          <span className="text-xs text-text-muted">{model.category}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xl font-bold text-brand">{formatCurrency(model.pricePerDay)}</span>
                        <span className="text-[10px] text-text-muted block">/ day</span>
                      </div>
                    </div>

                    <p className="text-xs text-text-muted line-clamp-2 mb-4 leading-relaxed">
                      {model.description}
                    </p>

                    <div className="grid grid-cols-3 gap-2 py-2.5 bg-surface-alt/70 rounded-control px-3 border border-border/60 text-xs">
                      <div>
                        <span className="text-text-muted block text-[10px]">Transmission</span>
                        <span className="font-semibold text-text">{model.transmission}</span>
                      </div>
                      <div>
                        <span className="text-text-muted block text-[10px]">Fuel</span>
                        <span className="font-semibold text-text">{model.fuelType}</span>
                      </div>
                      <div>
                        <span className="text-text-muted block text-[10px]">Seats</span>
                        <span className="font-semibold text-text">{model.seats} Passengers</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-5 mt-4 border-t border-border flex items-center justify-between">
                    <div className="text-xs">
                      <span className="font-bold text-emerald-800">{activeCount} Active Units</span>
                      {inactiveCount > 0 && (
                        <span className="text-rose-800 ml-2 font-medium">({inactiveCount} in Service)</span>
                      )}
                    </div>
                    <Link href={`/owner/fleet/models/${model.id}`}>
                      <Button size="sm" variant="outline" className="text-xs font-semibold">
                        Manage Model & Cars →
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Physical Vehicles Table */}
        <div className="space-y-4 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-text uppercase tracking-wider">All Physical Fleet Units</h2>
              <p className="text-xs text-text-muted">Direct fleet vehicle inventory and service status.</p>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedModelFilter}
                onChange={e => setSelectedModelFilter(e.target.value)}
                className="bg-surface text-text text-xs border border-border rounded-control px-3 py-1.5"
              >
                <option value="ALL">All Models</option>
                {models.map(m => (
                  <option key={m.id} value={m.id}>{m.brand} {m.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-card shadow-sm overflow-hidden">
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
                  {vehicles
                    .filter(v => selectedModelFilter === 'ALL' || v.modelId === selectedModelFilter)
                    .map(veh => {
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
                              <Button size="sm" variant="outline" className="text-xs">
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
