'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Plus, CarFront, CheckCircle2 } from 'lucide-react';
import { useMockState } from '@/lib/mock-state';
import { formatCurrency } from '@/lib/utils';
import { OwnerShell } from '@/components/owner/OwnerShell';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';

export default function OwnerModelDetailPage() {
  const params = useParams();
  const router = useRouter();
  const modelId = params.modelId as string;
  const { models, vehicles, updateModel } = useMockState();

  const model = models.find(m => m.id === modelId);

  const [pricePerDay, setPricePerDay] = useState(model?.pricePerDay?.toString() || '');
  const [description, setDescription] = useState(model?.description || '');
  const [saved, setSaved] = useState(false);

  if (!model) {
    return (
      <OwnerShell>
        <div className="p-12 text-center">
          <h2 className="text-xl font-bold text-text">Model Not Found</h2>
          <Link href="/owner/fleet" className="mt-4 inline-block">
            <Button variant="outline">Back to Fleet</Button>
          </Link>
        </div>
      </OwnerShell>
    );
  }

  const modelVehicles = vehicles.filter(v => v.modelId === model.id);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateModel(model.id, {
      pricePerDay: parseFloat(pricePerDay) || model.pricePerDay,
      description,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
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
                <h1 className="text-2xl font-bold text-text">{model.brand} {model.name}</h1>
                <Badge status="ACTIVE">{model.category}</Badge>
              </div>
              <p className="text-xs text-text-muted mt-0.5">
                Model Catalog Configuration & Linked Physical Units
              </p>
            </div>
          </div>
        </div>

        {/* Model Form Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-wider">Model Details & Daily Pricing</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Daily Rental Rate (₹ / 24-hr)"
                  type="number"
                  value={pricePerDay}
                  onChange={e => setPricePerDay(e.target.value)}
                  helperText="Authoritative pricing for all physical cars of this model in V1."
                  required
                />
                <Input
                  label="Transmission & Specs"
                  value={`${model.transmission} • ${model.fuelType} • ${model.seats} Seats`}
                  disabled
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-1.5">Public Model Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-surface text-text border border-border rounded-input text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                {saved && (
                  <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Changes saved successfully!
                  </span>
                )}
                <div className="ml-auto">
                  <Button type="submit" size="sm" className="font-bold flex items-center gap-1.5">
                    <Save className="w-4 h-4" /> Save Model Config
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Associated Physical Cars */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold uppercase tracking-wider">
              Linked Physical Vehicles ({modelVehicles.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-border/60">
            {modelVehicles.map(veh => (
              <div key={veh.id} className="p-4 flex items-center justify-between text-xs hover:bg-surface-alt/40">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-text">{veh.internalCode}</span>
                    <Badge status={veh.status}>{veh.status}</Badge>
                    <span className="text-text-muted font-mono">{veh.registrationReference}</span>
                  </div>
                  <p className="text-[11px] text-text-muted mt-0.5">
                    Model Year: {veh.year} {veh.inactiveReason && `• Reason: ${veh.inactiveReason}`}
                  </p>
                </div>
                <Link href={`/owner/fleet/vehicles/${veh.id}`}>
                  <Button size="sm" variant="outline" className="text-xs">
                    Edit Car Status
                  </Button>
                </Link>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </OwnerShell>
  );
}
