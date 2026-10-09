'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { shortenAddress } from '@/lib/auth';

const deployerNav = [
  {
    href: '/deployer',
    label: 'Dashboard',
    icon: '/deployer/icon-dashboard.svg',
    match: (path: string) => path === '/deployer' || path === '/deployer/',
  },
  {
    href: '/deployer/launch',
    label: 'Launch an agent',
    icon: '/deployer/icon-raising.svg',
    match: (path: string) => path.startsWith('/deployer/launch'),
  },
  {
    href: '/deployer/performance',
    label: 'Performance',
    icon: '/deployer/icon-performance.svg',
    match: (path: string) => path.startsWith('/deployer/performance'),
  },
  {
    href: '/deployer/buyback',
    label: 'Buyback engine',
    icon: '/deployer/icon-buyback.svg',
    match: (path: string) => path.startsWith('/deployer/buyback'),
  },
  {
    href: '/deployer/transactions',
    label: 'Transactions',
    icon: '/deployer/icon-transactions.svg',
    match: (path: string) => path.startsWith('/deployer/transactions'),
  },
  {
    href: '/deployer/settings',
    label: 'Settings',
    icon: '/deployer/icon-settings.svg',
    match: (path: string) => path.startsWith('/deployer/settings'),
  },
] as const;

export function DeployerSidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const pathname = usePathname();
  const { logout, wallet } = useAuth();

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
              src="/deployer/icon-sidebar-collapse.svg"
              alt=""
              width={17}
              height={17}
            />
          </button>
        </div>

        <nav className="inv-sidebar-nav" aria-label="Deployer">
          <p className="inv-sidebar-section">{'// Deployer'}</p>
          {deployerNav.map((item) => {
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
            <Image src="/deployer/icon-discover.svg" alt="" width={20} height={20} />
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
              <span className="inv-wallet-addr">{shortenAddress(wallet) || 'Wallet'}</span>
              <span className="inv-wallet-role">Deployer</span>
            </span>
          )}
          {!collapsed && (
            <Image
              src="/deployer/icon-chevron-right.svg"
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
