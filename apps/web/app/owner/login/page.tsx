'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

import { authApi } from '@/lib/api';

export default function OwnerLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('owner@drivenest.example');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      await authApi.login({ email, password });
      router.push('/owner');
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-3">
            <div className="w-10 h-10 rounded-control bg-brand-soft flex items-center justify-center p-1.5 border border-brand/20 shadow-sm">
              <img src="/assets/logos/drivenest-mark.svg" alt="DriveNest" className="w-full h-full object-contain" />
            </div>
            <span className="font-extrabold text-2xl text-brand tracking-tight">DriveNest</span>
          </Link>
          <h1 className="text-xl font-bold text-text">Owner Operations Login</h1>
          <p className="text-xs text-text-muted mt-1">Single Admin Business Portal (Phase 1 Mock Auth)</p>
        </div>

        {/* Card */}
        <div className="bg-surface border border-border rounded-feature-card p-6 sm:p-8 shadow-md">
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Admin Email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />

            {errorMsg && (
              <div className="p-3 bg-danger/10 border border-danger/30 rounded-control text-xs text-danger flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="pt-2">
              <Button type="submit" size="lg" disabled={loading} className="w-full font-bold">
                {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
              </Button>
            </div>
          </form>

          <div className="mt-6 p-3 bg-brand-soft/70 border border-brand/20 rounded-control text-[11px] text-brand-strong flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-brand" />
            <div>
              <span className="font-bold">Authorized Access:</span> Seed credentials prefilled for development.
            </div>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link href="/" className="text-xs text-text-muted hover:text-brand font-medium">
            ← Return to Public Website
          </Link>
        </div>
      </div>
    </div>
  );
}
