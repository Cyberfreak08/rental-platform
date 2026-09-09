'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Save, CheckCircle2, Building, Clock, ShieldCheck, MessageCircle, Loader2, AlertCircle } from 'lucide-react';
import { ownerApi } from '@/lib/api';
import { OwnerShell } from '@/components/owner/OwnerShell';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function OwnerSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [fuelPolicy, setFuelPolicy] = useState('');
  const [kmPolicy, setKmPolicy] = useState('');
  const [cancellationPolicy, setCancellationPolicy] = useState('');

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ownerApi.getSettings();
      setName(data.business?.name || '');
      setPhone(data.business?.phone || '');
      setWhatsapp(data.business?.whatsappNumber || '');
      setEmail(data.business?.email || '');
      setAddress(data.business?.address || '');
      setFuelPolicy(data.content?.fuelPolicy || '');
      setKmPolicy(data.content?.kmPolicy || '');
      setCancellationPolicy(data.content?.cancellationPolicy || '');
    } catch (err: any) {
      setError(err.message || 'Failed to load settings.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await ownerApi.updateSettings({
        business: { name, phone, whatsappNumber: whatsapp, email, address },
        content: { fuelPolicy, kmPolicy, cancellationPolicy },
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: any) {
      alert(err.message || 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <OwnerShell>
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-brand" />
          <p className="text-sm text-text-muted">Loading settings...</p>
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
          <Button onClick={fetchSettings} size="sm" variant="outline" className="mt-4">Retry</Button>
        </div>
      </OwnerShell>
    );
  }

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
                />
                <Input
                  label="Contact Email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
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
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-1">Kilometre Allowance</label>
                <textarea
                  rows={2}
                  value={kmPolicy}
                  onChange={e => setKmPolicy(e.target.value)}
                  className="w-full px-3 py-2 bg-surface text-text border border-border rounded-input text-xs"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-1">Cancellation Terms</label>
                <textarea
                  rows={2}
                  value={cancellationPolicy}
                  onChange={e => setCancellationPolicy(e.target.value)}
                  className="w-full px-3 py-2 bg-surface text-text border border-border rounded-input text-xs"
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
              <Button type="submit" size="md" disabled={saving} className="font-bold flex items-center gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>{saving ? 'Saving...' : 'Save Business Settings'}</span>
              </Button>
            </div>
          </div>
        </form>
      </div>
    </OwnerShell>
  );
}
