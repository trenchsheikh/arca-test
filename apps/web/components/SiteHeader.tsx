'use client';

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
  MdChipSet,
  MdFilterChip,
} from '@/components/material';

const nav = [
  { href: '/discover', label: 'Discover', icon: 'explore' },
  { href: '/dashboard', label: 'Investor', icon: 'account_balance_wallet' },
  { href: '/deploy', label: 'Deployer', icon: 'rocket_launch' },
  { href: '/apply', label: 'Apply', icon: 'edit_note' },
  { href: '/admin', label: 'Admin', icon: 'admin_panel_settings' },
];

export function SiteHeader() {
  const { isAuthenticated, ready, logout, session } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const activeIndex = Math.max(
    0,
    nav.findIndex(
      (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
    ),
  );
  const hasMatch = nav.some(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-black/5 bg-white/85 backdrop-blur-xl">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-6 min-w-0 flex-1">
            <ArcaLogo size={30} />
            <nav className="hidden lg:block flex-1 max-w-3xl">
              <MdTabs
                activeTabIndex={hasMatch ? activeIndex : -1}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onChange={(e: any) => {
                  const idx = e.target?.activeTabIndex ?? 0;
                  const item = nav[idx];
                  if (item) router.push(item.href);
                }}
                style={{ width: '100%' }}
              >
                {nav.map((item) => (
                  <MdPrimaryTab key={item.href}>
                    <MdIcon slot="icon">{item.icon}</MdIcon>
                    {item.label}
                  </MdPrimaryTab>
                ))}
              </MdTabs>
            </nav>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {ready && isAuthenticated ? (
              <>
                <span className="hidden sm:inline text-chalk-dim text-sm mr-1">
                  <span className="text-brand font-medium">{session?.username}</span>
                </span>
                <MdOutlinedButton onClick={logout}>
                  <MdIcon slot="icon">logout</MdIcon>
                  Log out
                </MdOutlinedButton>
              </>
            ) : (
              <Link href="/login">
                <MdFilledButton>
                  <MdIcon slot="icon">login</MdIcon>
                  Login
                </MdFilledButton>
              </Link>
            )}
          </div>
        </div>

        <nav className="lg:hidden pb-3 -mt-1 overflow-x-auto">
          <MdChipSet>
            {nav.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <MdFilterChip
                  key={item.href}
                  label={item.label}
                  selected={active}
                  onClick={() => router.push(item.href)}
                >
                  <MdIcon slot="icon">{item.icon}</MdIcon>
                </MdFilterChip>
              );
            })}
          </MdChipSet>
        </nav>
      </div>
    </header>
  );
}
