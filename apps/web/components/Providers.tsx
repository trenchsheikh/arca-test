'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import {
  PrivyAuthProvider,
  UnconfiguredAuthProvider,
} from '@/components/AuthProvider';
import { SmoothScroll } from '@/components/SmoothScroll';
import { privyAppId, privyConfig } from '@/lib/privy';

export function Providers({ children }: { children: React.ReactNode }) {
  if (!privyAppId) {
    return (
      <UnconfiguredAuthProvider>
        <SmoothScroll>{children}</SmoothScroll>
      </UnconfiguredAuthProvider>
    );
  }

  return (
    <PrivyProvider appId={privyAppId} config={privyConfig}>
      <PrivyAuthProvider>
        <SmoothScroll>{children}</SmoothScroll>
      </PrivyAuthProvider>
    </PrivyProvider>
  );
}
