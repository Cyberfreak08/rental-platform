import React from 'react';
import { ShieldCheck, Sparkles, Clock, MapPin } from 'lucide-react';

export const TrustStrip: React.FC = () => {
  const items = [
    {
      icon: Sparkles,
      title: 'Spotless & Sanitised Fleet',
      desc: 'Cleaned and mechanically inspected before every departure',
    },
    {
      icon: ShieldCheck,
      title: 'Zero Hidden Charges',
      desc: 'Transparent daily rates with exact same-to-same fuel terms',
    },
    {
      icon: Clock,
      title: 'Flexible Pickup Times',
      desc: '7:00 AM to 9:00 PM operational convenience in Peelamedu',
    },
    {
      icon: MapPin,
      title: 'Coimbatore & Outstation Ready',
      desc: 'Permitted across Tamil Nadu, Kerala, and Karnataka',
    },
  ];

  return (
    <section className="border-y border-border bg-surface py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-card bg-brand-soft text-brand shrink-0 border border-brand/10">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-text text-sm">{item.title}</h4>
                  <p className="text-xs text-text-muted mt-0.5 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
