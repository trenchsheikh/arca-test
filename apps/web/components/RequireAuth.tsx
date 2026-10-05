'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { LoadingState } from '@/components/LoadingState';
import { MdFilledButton, MdTextButton, MdIcon } from '@/components/material';

export function RequireAuth({
  children,
  title = 'Connect Your Solana Wallet',
  admin = false,
}: {
  children: React.ReactNode;
  title?: string;
  admin?: boolean;
}) {
  const { ready, isAuthenticated, isAdmin, configured, login } = useAuth();
  const pathname = usePathname();

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingState label="Checking session…" onBrand />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="arca-surface p-8 max-w-md w-full shadow-soft">
          <h1 className="text-2xl font-bold text-chalk mb-2">{title}</h1>
          <p className="text-chalk-dim text-sm mb-6">
            Connect a Solana wallet to open this page. Email and other chains
            are not accepted.
          </p>
          {configured ? (
            <MdFilledButton onClick={() => login()} style={{ width: '100%' }}>
              <MdIcon slot="icon">account_balance_wallet</MdIcon>
              Connect Solana wallet
            </MdFilledButton>
          ) : (
            <p className="text-sm text-error mb-4">
              Set NEXT_PUBLIC_PRIVY_APP_ID before wallet login can run.
            </p>
          )}
          <div className="mt-3 text-center">
            <Link href={`/login?next=${encodeURIComponent(pathname || '/')}`}>
              <MdTextButton>Open login page</MdTextButton>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (admin && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="arca-surface p-8 max-w-md w-full shadow-soft">
          <h1 className="text-2xl font-bold text-chalk mb-2">Admin access</h1>
          <p className="text-chalk-dim text-sm mb-6">
            This Solana wallet is not on the admin allowlist.
          </p>
          <Link href="/investor">
            <MdFilledButton style={{ width: '100%' }}>
              <MdIcon slot="icon">arrow_back</MdIcon>
              Go to dashboard
            </MdFilledButton>
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
