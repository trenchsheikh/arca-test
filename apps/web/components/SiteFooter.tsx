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

type PlatformLink = {
  href: string;
  label: string;
  external?: boolean;
};

const DOCS_URL = 'https://docs.arca.markets/';

const baseLinks: PlatformLink[] = [
  { href: '/discover', label: 'Discover Agents' },
  { href: '/dashboard', label: 'Investor Dashboard' },
  { href: '/deploy', label: 'Deployer Dashboard' },
  { href: '/apply', label: 'Apply To Launch' },
  { href: DOCS_URL, label: 'Docs', external: true },
];

const adminLink: PlatformLink = {
  href: '/admin',
  label: 'Admin',
};

const loginLink: PlatformLink = {
  href: '/login',
  label: 'Log In',
};

export function SiteFooter() {
  const { isAdmin, isAuthenticated } = useAuth();
  const router = useRouter();

  const platformLinks = useMemo(() => {
    const links: PlatformLink[] = [...baseLinks];
    if (isAdmin) links.push(adminLink);
    if (!isAuthenticated) links.push(loginLink);
    return links;
  }, [isAdmin, isAuthenticated]);

  return (
    <footer className="glass-panel glass-footer mt-0 rounded-none border-x-0 border-b-0">
      <ScrollReveal className="container mx-auto py-10 sm:py-12">
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
            <p className="font-semibold text-chalk mb-3 text-sm uppercase tracking-wide">
              Platform
            </p>
            <MdList style={{ background: 'transparent', border: 'none' }}>
              {platformLinks.map((item) => (
                <MdListItem
                  key={item.href}
                  type="button"
                  onClick={() => {
                    if (item.external) {
                      window.open(item.href, '_blank', 'noopener,noreferrer');
                      return;
                    }
                    router.push(item.href);
                  }}
                >
                  <div slot="headline">{item.label}</div>
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
