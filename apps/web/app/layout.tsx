import React from 'react';
import type { Metadata } from 'next';
import '@/styles/globals.css';
import { MockStateProvider } from '@/lib/mock-state';

export const metadata: Metadata = {
  title: 'DriveNest | Self Drive Cars in Coimbatore',
  description: 'Clean, reliable and affordable self-drive cars in Coimbatore. Swift, i20, Brezza and Creta ready for city & outstation trips.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/assets/logos/drivenest-mark.svg" type="image/svg+xml" />
      </head>
      <body className="min-h-screen bg-background text-text selection:bg-brand/20 selection:text-brand">
        <MockStateProvider>
          {children}
        </MockStateProvider>
      </body>
    </html>
  );
}
