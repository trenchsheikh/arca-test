'use client';

import { useState, FormEvent } from 'react';
import {
  MdFilledButton,
  MdOutlinedTextField,
  MdIcon,
  MdCircularProgress,
} from '@/components/material';

export function WaitlistForm({
  variant = 'brand',
}: {
  /** `brand` = on dark page chrome; `surface` = on elevated cards */
  variant?: 'brand' | 'surface';
}) {
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

  const onBrand = variant === 'brand';

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-lg">
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
        <div className="flex-1 min-w-0">
          <MdOutlinedTextField
            className={onBrand ? 'waitlist-field-brand' : undefined}
            label="Email"
            type="email"
            value={email}
            required
            disabled={status === 'loading' || status === 'success'}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onInput={(e: any) => {
              setEmail(e.target.value);
              if (status === 'error') setStatus('idle');
            }}
          >
            <MdIcon slot="leading-icon">mail</MdIcon>
          </MdOutlinedTextField>
        </div>
        <MdFilledButton
          type="submit"
          className={onBrand ? 'hero-cta-filled' : undefined}
          disabled={status === 'loading' || status === 'success'}
        >
          {status === 'loading' ? (
            <MdCircularProgress
              indeterminate
              slot="icon"
              className={onBrand ? 'waitlist-spinner-brand' : undefined}
              style={{ width: 18, height: 18 }}
            />
          ) : (
            <MdIcon slot="icon">{status === 'success' ? 'check' : 'north_east'}</MdIcon>
          )}
          {status === 'loading' ? 'Joining…' : status === 'success' ? 'Joined!' : 'Join Waitlist'}
        </MdFilledButton>
      </div>

      {status === 'success' && (
        <p
          className={`mt-3 text-sm font-medium flex items-center justify-center sm:justify-start gap-1.5 ${
            onBrand ? 'text-white' : 'text-brand'
          }`}
          role="status"
        >
          <MdIcon className="arca-icon-sm">check_circle</MdIcon>
          You&apos;re on the waitlist. We&apos;ll notify you at launch.
        </p>
      )}

      {status === 'error' && (
        <p
          className={`mt-3 text-sm font-medium flex items-center justify-center sm:justify-start gap-1.5 ${
            onBrand ? 'text-[#FFE8E6]' : 'text-error'
          }`}
          role="alert"
        >
          <MdIcon className="arca-icon-sm">error</MdIcon>
          Something went wrong. Please try again.
        </p>
      )}
    </form>
  );
}
