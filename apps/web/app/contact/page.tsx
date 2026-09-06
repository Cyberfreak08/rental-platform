'use client';

import React, { useState } from 'react';
import { MapPin, Phone, MessageCircle, Mail, Clock, Send, CheckCircle2 } from 'lucide-react';
import { useMockState } from '@/lib/mock-state';
import { SiteHeader } from '@/components/public/SiteHeader';
import { SiteFooter } from '@/components/public/SiteFooter';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function ContactPage() {
  const { business } = useMockState();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1 bg-background py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Header */}
          <div className="text-center max-w-xl mx-auto">
            <span className="text-xs font-bold text-brand uppercase tracking-wider">Get in Touch</span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-text mt-1">Contact DriveNest</h1>
            <p className="text-sm text-text-muted mt-2">
              Have questions regarding self-drive rentals in Coimbatore? Reach out to our local branch.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Contact Details Card */}
            <div className="space-y-6">
              <div className="bg-surface border border-border rounded-feature-card p-6 sm:p-8 shadow-sm space-y-6">
                <h2 className="text-xl font-bold text-text">Branch Details</h2>

                <div className="space-y-4 text-sm">
                  <div className="flex items-start gap-3.5">
                    <div className="p-2.5 rounded-card bg-brand-soft text-brand border border-brand/20 shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-text text-xs uppercase tracking-wider">Address</h4>
                      <p className="text-text-muted text-xs mt-0.5 leading-relaxed">{business.address}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="p-2.5 rounded-card bg-brand-soft text-brand border border-brand/20 shrink-0">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-text text-xs uppercase tracking-wider">Phone Support</h4>
                      <a href={`tel:${business.phone}`} className="text-text font-bold text-xs mt-0.5 block hover:text-brand">
                        {business.phone}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="p-2.5 rounded-card bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-emerald-900 text-xs uppercase tracking-wider">WhatsApp Direct</h4>
                      <a
                        href={`https://wa.me/${business.whatsappNumber.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-700 font-bold text-xs mt-0.5 block hover:underline"
                      >
                        {business.whatsappNumber}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="p-2.5 rounded-card bg-brand-soft text-brand border border-brand/20 shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-text text-xs uppercase tracking-wider">Operational Hours</h4>
                      <p className="text-text-muted text-xs mt-0.5">
                        Monday – Saturday: 07:00 AM – 09:00 PM<br />
                        Sunday: 08:00 AM – 08:00 PM
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Map Container */}
              <div className="aspect-[16/9] rounded-feature-card bg-surface border border-border overflow-hidden relative shadow-inner">
                <img
                  src="/assets/ui/map-placeholder.svg"
                  alt="Branch Location Map"
                  className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 flex items-center justify-center p-4">
                  <div className="bg-surface/90 backdrop-blur-md p-4 rounded-card border border-border shadow-md text-center max-w-xs">
                    <MapPin className="w-5 h-5 text-brand mx-auto mb-1" />
                    <p className="font-bold text-xs text-text">{business.name}</p>
                    <p className="text-[11px] text-text-muted">Peelamedu, Coimbatore</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Enquiry Form */}
            <div className="bg-surface border border-border rounded-feature-card p-6 sm:p-8 shadow-sm flex flex-col justify-between">
              <div>
                <h2 className="text-xl font-bold text-text">Send Us an Inquiry</h2>
                <p className="text-xs text-text-muted mt-1">
                  Have a custom rental question or outstation requirement? Leave a message.
                </p>

                {sent ? (
                  <div className="mt-8 p-6 bg-emerald-50 border border-emerald-200 rounded-feature-card text-center space-y-2">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                    <h3 className="font-bold text-emerald-900 text-sm">Message Transmitted</h3>
                    <p className="text-xs text-emerald-800">
                      Thank you. Our rental team will contact you shortly via phone or WhatsApp.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSent(false)}
                      className="mt-4 text-xs"
                    >
                      Send Another Message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSendMessage} className="mt-6 space-y-4">
                    <Input
                      label="Your Name"
                      placeholder="e.g. Ramesh"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      required
                    />
                    <Input
                      label="Phone Number"
                      type="tel"
                      placeholder="e.g. +91 98765 43210"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      required
                    />
                    <div>
                      <label className="block text-sm font-medium text-text mb-1.5">
                        Your Message / Questions
                      </label>
                      <textarea
                        rows={4}
                        placeholder="e.g. Inquiring about Creta availability for a weekend family trip to Munnar..."
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-surface text-text border border-border rounded-input text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand"
                        required
                      />
                    </div>
                    <Button type="submit" size="md" className="w-full flex items-center justify-center gap-2 font-bold">
                      <Send className="w-4 h-4" />
                      <span>Send Direct Message</span>
                    </Button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
