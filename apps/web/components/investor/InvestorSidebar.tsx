'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { shortenAddress } from '@/lib/auth';

const investorNav = [
  {
    href: '/investor',
    label: 'Dashboard',
    icon: '/investor/icon-dashboard.svg',
    match: (path: string) => path === '/investor' || path === '/investor/',
  },
  {
    href: '/investor/holdings',
    label: 'Holdings',
    icon: '/investor/icon-holdings.svg',
    match: (path: string) => path.startsWith('/investor/holdings'),
  },
  {
    href: '/investor/pnl',
    label: 'PnL',
    icon: '/investor/icon-pnl.svg',
    match: (path: string) => path.startsWith('/investor/pnl'),
  },
  {
    href: '/investor/history',
    label: 'History',
    icon: '/investor/icon-history.svg',
    match: (path: string) => path.startsWith('/investor/history'),
  },
] as const;

export function InvestorSidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const pathname = usePathname();
  const { wallet, logout } = useAuth();

  return (
    <aside className={`inv-sidebar${collapsed ? ' is-collapsed' : ''}`}>
      <div className="inv-sidebar-top">
        <div className="inv-sidebar-brand-row">
          <Link href="/" className="inv-sidebar-brand" aria-label="arca home">
            <Image
              src="/home/header-logo-name.png"
              alt="arca"
              width={85}
              height={31}
              className="inv-sidebar-logo"
              priority
            />
          </Link>
          <button
            type="button"
            className="inv-sidebar-collapse"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            onClick={onToggle}
          >
            <Image
              src="/investor/icon-sidebar-collapse.svg"
              alt=""
              width={17}
              height={17}
            />
          </button>
        </div>

        <nav className="inv-sidebar-nav" aria-label="Investor">
          <p className="inv-sidebar-section">{'// Investor'}</p>
          {investorNav.map((item) => {
            const active = item.match(pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inv-sidebar-link${active ? ' is-active' : ''}`}
                aria-current={active ? 'page' : undefined}
              >
                <Image src={item.icon} alt="" width={20} height={20} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <nav className="inv-sidebar-nav inv-sidebar-nav--platform" aria-label="Platform">
          <p className="inv-sidebar-section">{'// Platform'}</p>
          <Link href="/" className="inv-sidebar-link">
            <Image src="/investor/icon-discover.svg" alt="" width={20} height={20} />
            {!collapsed && <span>Discover</span>}
          </Link>
        </nav>
      </div>

      <div className="inv-sidebar-footer">
        <button
          type="button"
          className="inv-wallet-card"
          onClick={logout}
          title="Log out"
        >
          {!collapsed && (
            <span className="inv-wallet-meta">
              <span className="inv-wallet-addr">{shortenAddress(wallet)}</span>
              <span className="inv-wallet-role">Investor</span>
            </span>
          )}
          {!collapsed && (
            <Image
              src="/investor/icon-chevron-right.svg"
              alt=""
              width={12}
              height={12}
              className="inv-wallet-chevron"
            />
          )}
        </button>
      </div>
    </aside>
  );
}
