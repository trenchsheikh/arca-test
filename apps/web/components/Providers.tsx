'use client';

import { AuthProvider } from '@/components/AuthProvider';
import { SmoothScroll } from '@/components/SmoothScroll';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SmoothScroll>{children}</SmoothScroll>
    </AuthProvider>
  );
}
