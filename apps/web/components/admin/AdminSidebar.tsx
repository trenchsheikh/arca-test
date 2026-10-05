'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { shortenAddress } from '@/lib/auth';

const reviewNav = [
  {
    href: '/admin',
    label: 'Applications',
    icon: '/admin/icon-applications.svg',
    match: (path: string) => path === '/admin' || path === '/admin/',
  },
  {
    href: '/admin/ico',
    label: 'ICO Management',
    icon: '/admin/icon-ico.svg',
    match: (path: string) => path.startsWith('/admin/ico'),
  },
  {
    href: '/admin/users',
    label: 'Users',
    icon: '/admin/icon-users.svg',
    match: (path: string) => path.startsWith('/admin/users'),
  },
] as const;

const capitalNav = [
  {
    href: '/admin/raises',
    label: 'Raises',
    icon: '/admin/icon-raises.svg',
    match: (path: string) => path.startsWith('/admin/raises'),
  },
  {
    href: '/admin/buyback',
    label: 'Buyback engine',
    icon: '/admin/icon-buyback.svg',
    match: (path: string) => path.startsWith('/admin/buyback'),
  },
  {
    href: '/admin/transactions',
    label: 'Transactions',
    icon: '/admin/icon-transactions.svg',
    match: (path: string) => path.startsWith('/admin/transactions'),
  },
] as const;

export function AdminSidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const pathname = usePathname();
  const { logout, wallet } = useAuth();
  const displayName = shortenAddress(wallet) || 'Admin';

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
              src="/admin/icon-sidebar-collapse.svg"
              alt=""
              width={17}
              height={17}
            />
          </button>
        </div>

        <nav className="inv-sidebar-nav" aria-label="Review queue">
          <p className="inv-sidebar-section">{'// Review queue'}</p>
          {reviewNav.map((item) => {
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

        <nav className="inv-sidebar-nav" aria-label="Capital and ops">
          <p className="inv-sidebar-section">{'// Capital & ops'}</p>
          {capitalNav.map((item) => {
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
            <Image src="/admin/icon-discover.svg" alt="" width={20} height={20} />
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
          <Image
            src="/admin/avatar.png"
            alt=""
            width={30}
            height={30}
            className="inv-wallet-avatar"
          />
          {!collapsed && (
            <span className="inv-wallet-meta">
              <span className="inv-wallet-addr">{displayName}</span>
              <span className="inv-wallet-role">Admin</span>
            </span>
          )}
          {!collapsed && (
            <Image
              src="/admin/icon-chevron-right.svg"
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
