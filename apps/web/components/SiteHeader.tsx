'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { ArcaLogo } from '@/components/ArcaLogo';
import {
  MdFilledButton,
  MdOutlinedButton,
  MdTabs,
  MdPrimaryTab,
  MdIcon,
  MdIconButton,
  MdList,
  MdListItem,
  MdDivider,
} from '@/components/material';

const baseNav = [
  { href: '/discover', label: 'Discover', icon: 'explore' },
  { href: '/dashboard', label: 'Investor', icon: 'account_balance_wallet' },
  { href: '/deploy', label: 'Deployer', icon: 'rocket_launch' },
  { href: '/apply', label: 'Apply', icon: 'edit_note' },
] as const;

const adminNav = {
  href: '/admin',
  label: 'Admin',
  icon: 'admin_panel_settings',
} as const;

export function SiteHeader() {
  const { isAuthenticated, isAdmin, ready, logout, session } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuWrapRef = useRef<HTMLDivElement>(null);

  const nav = useMemo(
    () => (isAdmin ? [...baseNav, adminNav] : [...baseNav]),
    [isAdmin],
  );

  const activeIndex = nav.findIndex(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );
  const hasMatch = activeIndex >= 0;

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (menuWrapRef.current && target && !menuWrapRef.current.contains(target)) {
        setMenuOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

  const go = (href: string) => {
    setMenuOpen(false);
    router.push(href);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-black/5 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between gap-2">
          <div className="min-w-0 shrink-0">
            <ArcaLogo size={36} />
          </div>

          <nav
            className="pointer-events-none absolute inset-y-0 left-1/2 hidden -translate-x-1/2 items-center lg:flex"
            aria-label="Primary"
          >
            <div className="pointer-events-auto">
              <MdTabs
                key={nav.map((item) => item.href).join('|')}
                activeTabIndex={hasMatch ? activeIndex : -1}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onChange={(e: any) => {
                  const idx = Number(e.target?.activeTabIndex ?? -1);
                  const item = nav[idx];
                  if (item) go(item.href);
                }}
              >
                {nav.map((item) => (
                  <MdPrimaryTab key={item.href} onClick={() => go(item.href)}>
                    <MdIcon slot="icon">{item.icon}</MdIcon>
                    {item.label}
                  </MdPrimaryTab>
                ))}
              </MdTabs>
            </div>
          </nav>

          <div className="ml-auto flex shrink-0 items-center justify-end gap-1 sm:gap-2">
            {ready && isAuthenticated ? (
              <>
                <span className="hidden md:inline text-chalk-dim text-sm">
                  <span className="text-brand font-medium">{session?.username}</span>
                </span>
                <MdOutlinedButton className="header-auth-btn" onClick={logout}>
                  <MdIcon slot="icon">logout</MdIcon>
                  Log out
                </MdOutlinedButton>
              </>
            ) : (
              <Link href="/login" className="shrink-0">
                <MdFilledButton className="header-auth-btn">
                  <MdIcon slot="icon">login</MdIcon>
                  Login
                </MdFilledButton>
              </Link>
            )}

            <div ref={menuWrapRef} className="relative lg:hidden">
              <MdIconButton
                aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={menuOpen}
                aria-haspopup="menu"
                onClick={() => setMenuOpen((open) => !open)}
              >
                <MdIcon>{menuOpen ? 'close' : 'menu'}</MdIcon>
              </MdIconButton>

              {menuOpen && (
                <div
                  role="menu"
                  aria-label="Navigation"
                  className="header-mobile-menu absolute top-full right-0 z-[60] w-[min(100vw-2rem,18rem)] origin-top-right rounded-2xl border border-black/10 bg-white py-2 shadow-soft"
                >
                  <MdList style={{ border: 'none', background: 'transparent' }}>
                    {nav.map((item) => {
                      const active =
                        pathname === item.href ||
                        pathname.startsWith(`${item.href}/`);
                      return (
                        <MdListItem
                          key={item.href}
                          type="button"
                          onClick={() => go(item.href)}
                        >
                          <MdIcon slot="start">{item.icon}</MdIcon>
                          <div slot="headline">{item.label}</div>
                          {active ? <MdIcon slot="end">check</MdIcon> : null}
                        </MdListItem>
                      );
                    })}
                  </MdList>
                  {ready && isAuthenticated && (
                    <>
                      <MdDivider style={{ margin: '0.35rem 0' }} />
                      <p className="text-sm text-chalk-dim px-4 py-2">
                        Signed in as{' '}
                        <span className="text-brand font-medium">
                          {session?.username}
                        </span>
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
