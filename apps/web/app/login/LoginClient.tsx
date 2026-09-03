'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { DEMO_CREDENTIALS } from '@/lib/auth';
import { ArcaLogo } from '@/components/ArcaLogo';
import { LoadingState } from '@/components/LoadingState';
import {
  MdFilledButton,
  MdOutlinedTextField,
  MdIcon,
  MdChipSet,
  MdSuggestionChip,
  MdCircularProgress,
} from '@/components/material';

export default function LoginClient() {
  const { login, isAuthenticated, ready } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/investor';

  const [username, setUsername] = useState<string>(DEMO_CREDENTIALS.username);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (ready && isAuthenticated) {
      router.replace(next);
    }
  }, [ready, isAuthenticated, next, router]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    const ok = login(username, password);
    if (!ok) {
      setError('Invalid credentials. Use admin / pass.');
      setSubmitting(false);
      return;
    }
    router.push(next);
  };

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
        <h1 className="text-3xl font-bold text-chalk mb-2">Sign In</h1>
        <p className="text-chalk-dim text-sm mb-6">
          Demo access for all dashboards. Username{' '}
          <code className="text-brand">admin</code>, password{' '}
          <code className="text-brand">pass</code>.
        </p>

        <form onSubmit={onSubmit} className="space-y-4">
          <MdOutlinedTextField
            label="Username"
            value={username}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onInput={(e: any) => setUsername(e.target.value)}
          >
            <MdIcon slot="leading-icon">person</MdIcon>
          </MdOutlinedTextField>
          <MdOutlinedTextField
            label="Password"
            type="password"
            value={password}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onInput={(e: any) => setPassword(e.target.value)}
          >
            <MdIcon slot="leading-icon">lock</MdIcon>
          </MdOutlinedTextField>
          {error && <p className="text-error text-sm">{error}</p>}
          <MdFilledButton type="submit" style={{ width: '100%' }} disabled={submitting}>
            {submitting ? (
              <MdCircularProgress indeterminate slot="icon" style={{ width: 20, height: 20 }} />
            ) : (
              <MdIcon slot="icon">login</MdIcon>
            )}
            Sign In
          </MdFilledButton>
        </form>

        <p className="text-xs text-chalk-dim mt-6 mb-2">Quick destinations</p>
        <MdChipSet>
          {[
            ['Investor', '/investor'],
            ['Deployer', '/deployer'],
            ['Admin', '/admin'],
            ['Apply', '/deployer/launch'],
          ].map(([label, href]) => (
            <Link key={href} href={`/login?next=${encodeURIComponent(href)}`}>
              <MdSuggestionChip label={label}>
                <MdIcon slot="icon">arrow_forward</MdIcon>
              </MdSuggestionChip>
            </Link>
          ))}
        </MdChipSet>
      </motion.div>
    </div>
  );
}
