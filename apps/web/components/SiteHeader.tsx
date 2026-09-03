'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { MdIcon, MdIconButton, MdList, MdListItem, MdDivider } from '@/components/material';

const DOCS_URL = 'https://docs.arca.markets/';

type NavItem = {
  href: string;
  label: string;
  external?: boolean;
};

const baseNav: NavItem[] = [
  { href: '/', label: 'Discover' },
  { href: '/investor', label: 'Investor' },
  { href: '/deployer', label: 'Deployer' },
  { href: '/deployer/launch', label: 'Apply' },
  { href: DOCS_URL, label: 'Docs', external: true },
];

const adminNav: NavItem = {
  href: '/admin',
  label: 'Admin',
};

export function SiteHeader() {
  const { isAdmin, ready, logout, session, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuWrapRef = useRef<HTMLDivElement>(null);

  const nav = useMemo(
    () => (isAdmin ? [...baseNav, adminNav] : [...baseNav]),
    [isAdmin],
  );

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

  const go = (item: NavItem) => {
    setMenuOpen(false);
    if (item.external) {
      window.open(item.href, '_blank', 'noopener,noreferrer');
      return;
    }
    router.push(item.href);
  };

  const isActive = (item: NavItem) => {
    if (item.external) return false;
    // Discover lives on `/` — exact match only so other routes stay inactive.
    if (item.href === '/') return pathname === '/';
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  };

  const joinHref = '/login';
  const isFramedPage = pathname === '/' || /^\/agents\/[^/]+$/.test(pathname);
  const isInvestorApp = pathname.startsWith('/investor');
  const isDeployerApp = pathname.startsWith('/deployer');
  const isAdminApp = pathname.startsWith('/admin');

  if (isInvestorApp || isDeployerApp || isAdminApp) {
    return null;
  }

  const headerBar = (
    <div className={`site-header-bar${isFramedPage ? ' home-column-inset' : ''}`}>
      <Link href="/" className="site-header-logo" aria-label="arca home">
        <Image
          src="/home/header-logo-name.png"
          alt="arca"
          width={85}
          height={31}
          className="site-header-logo-img"
          priority
        />
      </Link>

      <nav className="site-header-nav" aria-label="Primary">
        {nav.map((item) => {
          const active = isActive(item);
          const className = `site-header-nav-link${active ? ' is-active' : ''}`;

          if (item.external) {
            return (
              <a
                key={`${item.label}-${item.href}`}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className={className}
              >
                <span>{item.label}</span>
                <svg
                  className="site-header-nav-chevron"
                  width="10"
                  height="6"
                  viewBox="0 0 10 6"
                  fill="none"
                  aria-hidden
                >
                  <path
                    d="M1 1.5L5 4.5L9 1.5"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
            );
          }

          return (
            <Link
              key={`${item.label}-${item.href}`}
              href={item.href}
              className={className}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="site-header-actions">
        <Link href={joinHref} className="site-header-join">
          <span>Join Arca</span>
          <Image
            src="/home/join-arrow.svg"
            alt=""
            width={12}
            height={12}
            className="site-header-join-arrow"
            aria-hidden
          />
        </Link>

        <div ref={menuWrapRef} className="site-header-menu-wrap">
          <MdIconButton
            className="site-header-menu-btn"
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
              className="site-header-mobile-menu"
            >
              <MdList style={{ border: 'none', background: 'transparent' }}>
                {nav.map((item) => {
                  const active = isActive(item);
                  return (
                    <MdListItem
                      key={`${item.label}-${item.href}`}
                      type="button"
                      onClick={() => go(item)}
                    >
                      <div slot="headline">{item.label}</div>
                      {item.external ? (
                        <MdIcon slot="end">open_in_new</MdIcon>
                      ) : active ? (
                        <MdIcon slot="end">check</MdIcon>
                      ) : null}
                    </MdListItem>
                  );
                })}
              </MdList>
              {ready && isAuthenticated && (
                <>
                  <MdDivider style={{ margin: '0.35rem 0' }} />
                  <p className="site-header-mobile-user">
                    Signed in as{' '}
                    <span>{session?.username}</span>
                  </p>
                  <button
                    type="button"
                    className="site-header-mobile-logout"
                    onClick={() => {
                      setMenuOpen(false);
                      logout();
                    }}
                  >
                    Log out
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <header className={`site-header${isFramedPage ? ' site-header--home' : ''}`}>
      {isFramedPage ? headerBar : <div className="site-header-shell">{headerBar}</div>}
    </header>
  );
}
