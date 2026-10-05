'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/components/AuthProvider';
import { ArcaLogo } from '@/components/ArcaLogo';
import { LoadingState } from '@/components/LoadingState';
import { MdFilledButton, MdIcon } from '@/components/material';

export default function LoginClient() {
  const { login, isAuthenticated, ready, configured } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/investor';

  useEffect(() => {
    if (ready && isAuthenticated) {
      router.replace(next);
    }
  }, [ready, isAuthenticated, next, router]);

  if (!ready) {
    return (
      <LoadingState label="Preparing login…" className="min-h-[80vh]" onBrand />
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="arca-surface p-8 max-w-md w-full shadow-soft"
      >
        <div className="mb-6">
          <ArcaLogo size={36} />
        </div>
        <p className="text-xs uppercase tracking-[0.2em] text-brand font-semibold mb-2">
          Welcome
        </p>
        <h1 className="text-3xl font-bold text-chalk mb-2">Connect wallet</h1>
        <p className="text-chalk-dim text-sm mb-6">
          Sign in with a Solana wallet. Phantom, Solflare, Backpack, and other
          detected Solana wallets are supported.
        </p>

        {configured ? (
          <MdFilledButton onClick={() => login()} style={{ width: '100%' }}>
            <MdIcon slot="icon">account_balance_wallet</MdIcon>
            Connect Solana wallet
          </MdFilledButton>
        ) : (
          <p className="text-sm text-error">
            Wallet login is not configured. Set NEXT_PUBLIC_PRIVY_APP_ID to
            your Privy app id.
          </p>
        )}
      </motion.div>
    </div>
  );
}
