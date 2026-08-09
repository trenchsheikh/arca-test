'use client';

import { useState, FormEvent } from 'react';
import {
  MdFilledButton,
  MdOutlinedTextField,
  MdIcon,
  MdCircularProgress,
} from '@/components/material';

export function WaitlistForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setStatus('success');
        setEmail('');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-lg">
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
        <div className="flex-1">
          <MdOutlinedTextField
            label="Email"
            type="email"
            value={email}
            required
            disabled={status === 'loading' || status === 'success'}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onInput={(e: any) => setEmail(e.target.value)}
          >
            <MdIcon slot="leading-icon">mail</MdIcon>
          </MdOutlinedTextField>
        </div>
        <MdFilledButton
          type="submit"
          disabled={status === 'loading' || status === 'success'}
        >
          {status === 'loading' ? (
            <MdCircularProgress indeterminate slot="icon" style={{ width: 18, height: 18 }} />
          ) : (
            <MdIcon slot="icon">{status === 'success' ? 'check' : 'north_east'}</MdIcon>
          )}
          {status === 'loading' ? 'Joining…' : status === 'success' ? 'Joined!' : 'Join waitlist'}
        </MdFilledButton>
      </div>

      {status === 'success' && (
        <p className="mt-3 text-brand text-sm font-medium">
          You&apos;re on the waitlist. We&apos;ll notify you at launch.
        </p>
      )}

      {status === 'error' && (
        <p className="mt-3 text-error text-sm">Something went wrong. Please try again.</p>
      )}
    </form>
  );
}
