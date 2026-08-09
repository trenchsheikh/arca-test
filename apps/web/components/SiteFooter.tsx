'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArcaLogo } from '@/components/ArcaLogo';
import { useAuth } from '@/components/AuthProvider';
import { ScrollReveal } from '@/components/ScrollReveal';
import {
  MdList,
  MdListItem,
  MdIcon,
  MdDivider,
  MdTextButton,
} from '@/components/material';

const baseLinks = [
  { href: '/discover', label: 'Discover Agents', icon: 'explore' },
  { href: '/dashboard', label: 'Investor Dashboard', icon: 'account_balance_wallet' },
  { href: '/deploy', label: 'Deployer Dashboard', icon: 'rocket_launch' },
  { href: '/apply', label: 'Apply To Launch', icon: 'edit_note' },
] as const;

const adminLink = {
  href: '/admin',
  label: 'Admin',
  icon: 'admin_panel_settings',
} as const;

const loginLink = {
  href: '/login',
  label: 'Log In',
  icon: 'login',
} as const;

export function SiteFooter() {
  const { isAdmin, isAuthenticated } = useAuth();
  const router = useRouter();

  const platformLinks = useMemo(() => {
    const links = [...baseLinks];
    if (isAdmin) links.push(adminLink);
    if (!isAuthenticated) links.push(loginLink);
    return links;
  }, [isAdmin, isAuthenticated]);

  return (
    <footer className="border-t border-black/5 bg-white mt-0">
      <ScrollReveal className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <ArcaLogo size={36} className="mb-4" />
            <p className="text-chalk-dim text-sm leading-relaxed mb-4">
              Verified AI agent capital markets with automatic on chain buybacks.
            </p>
            <Link href="/discover">
              <MdTextButton>
                <MdIcon slot="icon">arrow_forward</MdIcon>
                Explore Agents
              </MdTextButton>
            </Link>
          </div>

          <div className="md:col-span-2">
            <p className="font-semibold text-black mb-3 text-sm uppercase tracking-wide">
              Platform
            </p>
            <MdList style={{ background: 'transparent', border: 'none' }}>
              {platformLinks.map((item) => (
                <MdListItem
                  key={item.href}
                  type="button"
                  onClick={() => router.push(item.href)}
                >
                  <MdIcon slot="start">{item.icon}</MdIcon>
                  <div slot="headline">{item.label}</div>
                  <MdIcon slot="end">chevron_right</MdIcon>
                </MdListItem>
              ))}
            </MdList>
          </div>
        </div>

        <MdDivider style={{ margin: '2rem 0' }} />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-chalk-dim">
          <p>&copy; 2026 arca. All rights reserved.</p>
          <div className="flex gap-2">
            <MdTextButton>Terms</MdTextButton>
            <MdTextButton>Privacy</MdTextButton>
            <MdTextButton>Risk Disclaimer</MdTextButton>
          </div>
        </div>
      </ScrollReveal>
    </footer>
  );
}
