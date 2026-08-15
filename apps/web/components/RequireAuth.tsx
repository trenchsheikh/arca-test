'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { DEMO_CREDENTIALS } from '@/lib/auth';
import { LoadingState } from '@/components/LoadingState';
import {
  MdFilledButton,
  MdTextButton,
  MdIcon,
  MdList,
  MdListItem,
} from '@/components/material';

export function RequireAuth({
  children,
  title = 'Sign In To Continue',
}: {
  children: React.ReactNode;
  title?: string;
}) {
  const { ready, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

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
          <p className="text-chalk-dim text-sm mb-4">Demo credentials</p>
          <MdList className="mb-6">
            <MdListItem>
              <MdIcon slot="start">person</MdIcon>
              <div slot="headline">Username</div>
              <div slot="supporting-text">{DEMO_CREDENTIALS.username}</div>
            </MdListItem>
            <MdListItem>
              <MdIcon slot="start">lock</MdIcon>
              <div slot="headline">Password</div>
              <div slot="supporting-text">{DEMO_CREDENTIALS.password}</div>
            </MdListItem>
          </MdList>
          <MdFilledButton
            onClick={() =>
              router.push(`/login?next=${encodeURIComponent(pathname || '/')}`)
            }
            style={{ width: '100%' }}
          >
            <MdIcon slot="icon">login</MdIcon>
            Go To Login
          </MdFilledButton>
          <div className="mt-3 text-center">
            <Link href="/">
              <MdTextButton>Back To Home</MdTextButton>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
