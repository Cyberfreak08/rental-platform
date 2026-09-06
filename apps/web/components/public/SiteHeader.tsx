import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Phone, MessageCircle, Menu, X, Car } from 'lucide-react';
import { useMockState } from '@/lib/mock-state';
import { Button } from '@/components/ui/Button';

export const SiteHeader: React.FC = () => {
  const { business } = useMockState();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/search', label: 'Browse Fleet' },
    { href: '/about', label: 'About' },
    { href: '/policies', label: 'Policies' },
    { href: '/faq', label: 'FAQ' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur-md border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-control bg-brand-soft flex items-center justify-center p-1.5 border border-brand/20">
              <img
                src="/assets/logos/drivenest-mark.svg"
                alt="DriveNest"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <span className="font-bold text-xl tracking-tight text-brand">DriveNest</span>
              <span className="text-xs block font-medium text-text-muted -mt-1">Self Drive Coimbatore</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map(link => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3.5 py-2 rounded-control text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-brand bg-brand-soft font-semibold'
                      : 'text-text hover:text-brand hover:bg-surface-alt'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Contact / CTA Actions */}
          <div className="hidden lg:flex items-center gap-3">
            <a
              href={`https://wa.me/${business.whatsappNumber.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-2 rounded-control border border-emerald-200 hover:bg-emerald-100 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp</span>
            </a>
            <a
              href={`tel:${business.phone}`}
              className="inline-flex items-center gap-2 text-xs font-semibold text-text bg-surface-alt px-3 py-2 rounded-control border border-border hover:bg-border/50 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-brand" />
              <span>{business.phone}</span>
            </a>
            <Link href="/search">
              <Button size="sm">Search Cars</Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <a
              href={`https://wa.me/${business.whatsappNumber.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-emerald-700 bg-emerald-50 rounded-control border border-emerald-200"
            >
              <MessageCircle className="w-5 h-5" />
            </a>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-control text-text hover:bg-surface-alt border border-border"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-surface px-4 pt-2 pb-6 space-y-3">
          <nav className="flex flex-col space-y-1">
            {navLinks.map(link => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-3 py-2.5 rounded-control text-base font-medium ${
                    isActive
                      ? 'text-brand bg-brand-soft font-semibold'
                      : 'text-text hover:bg-surface-alt'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <div className="pt-4 border-t border-border flex flex-col gap-2.5">
            <a
              href={`tel:${business.phone}`}
              className="flex items-center justify-center gap-2 w-full py-2.5 bg-surface-alt text-sm font-semibold rounded-control border border-border"
            >
              <Phone className="w-4 h-4 text-brand" />
              Call {business.phone}
            </a>
            <Link href="/search" onClick={() => setIsMobileMenuOpen(false)}>
              <Button className="w-full" size="md">Search Available Cars</Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
