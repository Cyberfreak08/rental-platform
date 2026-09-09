import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CalendarCheck,
  CalendarDays,
  CarFront,
  FileBarChart,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
} from 'lucide-react';
import { authApi } from '@/lib/api';
import { ownerApi } from '@/lib/api';
import { useRouter } from 'next/navigation';

export const OwnerShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileNavOpen, setIsMobileNavOpen] = React.useState(false);
  const [businessName, setBusinessName] = useState<string>('');
  const [businessCity, setBusinessCity] = useState<string>('');
  const [pendingCount, setPendingCount] = useState<number>(0);

  // Fetch dashboard summary for pending count + business name from settings
  useEffect(() => {
    let cancelled = false;
    ownerApi.getDashboardSummary().then(data => {
      if (!cancelled) setPendingCount(data.metrics.pendingCount);
    }).catch(() => {/* unauthenticated — count stays 0 */});

    ownerApi.getSettings().then((data: any) => {
      if (!cancelled) {
        setBusinessName(data?.name ?? data?.businessName ?? '');
        setBusinessCity(data?.city ?? '');
      }
    }).catch(() => {/* unauthenticated */});

    return () => { cancelled = true; };
  }, [pathname]); // re-check on navigation

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await authApi.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      router.push('/owner/login');
    }
  };

  const navItems = [
    { href: '/owner', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/owner/bookings', label: 'Bookings', icon: CalendarCheck, badge: pendingCount > 0 ? pendingCount : undefined },
    { href: '/owner/calendar', label: 'Calendar', icon: CalendarDays },
    { href: '/owner/fleet', label: 'Fleet & Vehicles', icon: CarFront },
    { href: '/owner/reports', label: 'Reports & Export', icon: FileBarChart },
    { href: '/owner/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row text-text">
      {/* Mobile Top Header */}
      <div className="md:hidden bg-surface border-b border-border p-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-control bg-brand-soft flex items-center justify-center p-1 border border-brand/20">
            <img src="/assets/logos/drivenest-mark.svg" alt="DriveNest" className="w-full h-full object-contain" />
          </div>
          <div>
            <span className="font-bold text-base text-brand">DriveNest Ops</span>
            <span className="text-[10px] block text-text-muted">Owner Management</span>
          </div>
        </div>
        <button
          onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
          className="p-2 rounded-control border border-border text-text hover:bg-surface-alt"
          aria-label="Toggle navigation"
        >
          {isMobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar for Desktop & Mobile Overlay */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-surface border-r border-border flex flex-col justify-between transition-transform duration-200 md:static md:translate-x-0 ${
          isMobileNavOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="p-6 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-control bg-brand-soft flex items-center justify-center p-1.5 border border-brand/20">
                <img src="/assets/logos/drivenest-mark.svg" alt="DriveNest" className="w-full h-full object-contain" />
              </div>
              <div>
                <span className="font-bold text-lg text-brand tracking-tight">DriveNest</span>
                <span className="text-xs block font-semibold text-text-muted">Operations Portal</span>
              </div>
            </div>
            <button
              onClick={() => setIsMobileNavOpen(false)}
              className="md:hidden text-text-muted p-1 hover:bg-surface-alt rounded-control"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav List */}
          <nav className="p-4 space-y-1.5">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileNavOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-control text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-brand text-white font-semibold shadow-sm'
                      : 'text-text hover:bg-surface-alt text-text-muted hover:text-text'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-brand'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        isActive ? 'bg-white text-brand' : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer info & links */}
        <div className="p-4 border-t border-border space-y-3">
          <div className="bg-surface-alt p-3 rounded-card text-xs space-y-1">
            <p className="font-semibold text-text">{businessName || 'DriveNest'}</p>
            <p className="text-text-muted text-[11px] truncate">{businessCity ? `${businessCity}, Tamil Nadu` : 'Operations Portal'}</p>
          </div>

          <div className="flex items-center justify-between pt-1 text-xs">
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 text-text-muted hover:text-brand font-medium"
            >
              <ExternalLink className="w-3.5 h-3.5" /> View Public Site
            </Link>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1 text-danger hover:underline font-medium cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl">
        {children}
      </main>
    </div>
  );
};
