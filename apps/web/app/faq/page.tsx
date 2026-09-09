'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronUp, HelpCircle, MessageCircle, Phone, Loader2 } from 'lucide-react';
import { publicApi, PublicFaq } from '@/lib/api';
import { useMockState } from '@/lib/mock-state';
import { SiteHeader } from '@/components/public/SiteHeader';
import { SiteFooter } from '@/components/public/SiteFooter';
import { Button } from '@/components/ui/Button';

export default function FAQPage() {
  // mock-state used only for business contact data (already hydrated from real API on mount)
  const { business } = useMockState();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const [faqs, setFaqs] = React.useState<PublicFaq[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    publicApi.getFaqs()
      .then(data => { if (!cancelled) setFaqs(data); })
      .catch(err => { if (!cancelled) setError(err.message || 'Failed to load FAQs.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1 bg-background py-12 md:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {/* Header */}
          <div className="text-center max-w-xl mx-auto">
            <span className="text-xs font-bold text-brand uppercase tracking-wider">Help & Answers</span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-text mt-1">Frequently Asked Questions</h1>
            <p className="text-sm text-text-muted mt-2">
              Everything you need to know about booking, requirements, and car handover with DriveNest.
            </p>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-brand" />
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-card text-sm">
              {error}
            </div>
          )}

          {/* FAQ Accordion List */}
          {!loading && !error && (
            <div className="space-y-4">
              {faqs.length === 0 ? (
                <p className="text-sm text-text-muted text-center py-8">No FAQs available at this time.</p>
              ) : (
                faqs.map((faq, idx) => {
                  const isOpen = openIndex === idx;
                  return (
                    <div
                      key={faq.id}
                      className="bg-surface border border-border rounded-feature-card overflow-hidden shadow-sm transition-colors"
                    >
                      <button
                        onClick={() => toggleFaq(idx)}
                        className="w-full p-5 text-left flex items-center justify-between gap-4 focus:outline-none"
                      >
                        <span className="font-bold text-sm sm:text-base text-text">{faq.question}</span>
                        <span className="p-1 rounded-full bg-surface-alt text-brand shrink-0">
                          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </span>
                      </button>
                      {isOpen && (
                        <div className="px-5 pb-5 pt-1 border-t border-border/60 text-xs sm:text-sm text-text-muted leading-relaxed">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Still Have Questions Box */}
          <div className="bg-surface-alt/80 border border-border rounded-feature-card p-8 text-center space-y-4">
            <h3 className="text-lg font-bold text-text">Still have unanswered questions?</h3>
            <p className="text-xs text-text-muted max-w-md mx-auto">
              Our Coimbatore rental desk is always on standby to assist with outstation planning or specific vehicle requirements.
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              {business.whatsappNumber && (
                <a
                  href={`https://wa.me/${business.whatsappNumber.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="sm" className="flex items-center gap-1.5 text-emerald-800">
                    <MessageCircle className="w-4 h-4 text-emerald-600" />
                    <span>WhatsApp Desk</span>
                  </Button>
                </a>
              )}
              {business.phone && (
                <a href={`tel:${business.phone}`}>
                  <Button size="sm" className="flex items-center gap-1.5">
                    <Phone className="w-4 h-4" />
                    <span>Call {business.phone}</span>
                  </Button>
                </a>
              )}
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
