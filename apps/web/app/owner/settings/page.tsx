'use client';

import React, { useState } from 'react';
import { Save, CheckCircle2, Building, Clock, ShieldCheck, MessageCircle } from 'lucide-react';
import { useMockState } from '@/lib/mock-state';
import { OwnerShell } from '@/components/owner/OwnerShell';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function OwnerSettingsPage() {
  const { business, content, updateBusiness, updateContent } = useMockState();

  const [name, setName] = useState(business.name);
  const [tagline, setTagline] = useState(business.tagline);
  const [phone, setPhone] = useState(business.phone);
  const [whatsapp, setWhatsapp] = useState(business.whatsappNumber);
  const [email, setEmail] = useState(business.email);
  const [address, setAddress] = useState(business.address);

  const [fuelPolicy, setFuelPolicy] = useState(content.policies.fuel);
  const [kmPolicy, setKmPolicy] = useState(content.policies.kilometres);
  const [cancellationPolicy, setCancellationPolicy] = useState(content.policies.cancellation);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateBusiness({
      name,
      tagline,
      phone,
      whatsappNumber: whatsapp,
      email,
      address,
    });
    updateContent({
      policies: {
        ...content.policies,
        fuel: fuelPolicy,
        kilometres: kmPolicy,
        cancellation: cancellationPolicy,
      },
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <OwnerShell>
      <div className="space-y-6 max-w-4xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
          <div>
            <h1 className="text-2xl font-bold text-text">Business Configuration</h1>
            <p className="text-xs text-text-muted mt-0.5">
              Edit public branch details, contact numbers, and rental policy disclosures.
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Identity & Contact Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                <Building className="w-4 h-4 text-brand" /> Business Identity & Location
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Business Name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
                <Input
                  label="Tagline"
                  value={tagline}
                  onChange={e => setTagline(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Primary Phone"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  required
                />
                <Input
                  label="WhatsApp Direct Number"
                  value={whatsapp}
                  onChange={e => setWhatsapp(e.target.value)}
                  required
                />
                <Input
                  label="Contact Email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>

              <Input
                label="Physical Address (Coimbatore Branch)"
                value={address}
                onChange={e => setAddress(e.target.value)}
                required
              />
            </CardContent>
          </Card>

          {/* Rental Policies Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-brand" /> Standard Rental Policies
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div>
                <label className="block text-sm font-medium text-text mb-1">Fuel Policy</label>
                <textarea
                  rows={2}
                  value={fuelPolicy}
                  onChange={e => setFuelPolicy(e.target.value)}
                  className="w-full px-3 py-2 bg-surface text-text border border-border rounded-input text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-1">Kilometre Allowance</label>
                <textarea
                  rows={2}
                  value={kmPolicy}
                  onChange={e => setKmPolicy(e.target.value)}
                  className="w-full px-3 py-2 bg-surface text-text border border-border rounded-input text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-1">Cancellation Terms</label>
                <textarea
                  rows={2}
                  value={cancellationPolicy}
                  onChange={e => setCancellationPolicy(e.target.value)}
                  className="w-full px-3 py-2 bg-surface text-text border border-border rounded-input text-xs"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Bar */}
          <div className="flex items-center justify-between pt-2">
            {saved && (
              <span className="text-xs text-emerald-800 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Settings updated successfully!
              </span>
            )}
            <div className="ml-auto">
              <Button type="submit" size="md" className="font-bold flex items-center gap-2">
                <Save className="w-4 h-4" />
                <span>Save Business Settings</span>
              </Button>
            </div>
          </div>
        </form>
      </div>
    </OwnerShell>
  );
}
