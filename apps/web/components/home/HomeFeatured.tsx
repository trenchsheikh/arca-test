'use client';

import { FormEvent, useEffect, useId, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Agent } from '@/lib/mock-data';
import { HomeCtaButton } from './HomeCtaButton';

export function HomeFeatured({ agent }: { agent: Agent }) {
  const detailHref = `/agents/${agent.slug}`;
  const titleId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [telegram, setTelegram] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    inputRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
      previous?.focus();
    };
  }, [open]);

  const close = () => setOpen(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setStatus('loading');
    setError('');
    try {
      const res = await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegram, agent: agent.slug }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(typeof body?.error === 'string' ? body.error : 'Something went wrong. Please try again.');
        setStatus('error');
        return;
      }
      setStatus('success');
    } catch {
      setError('Something went wrong. Please try again.');
      setStatus('error');
    }
  };

  return (
    <article className="home-featured">
      <div className="home-featured-inner">
        <div className="home-agent-media home-featured-media">
          <Image src="/featured.png" alt="Apollo featured artwork" fill sizes="(max-width: 900px) 100vw, 494px" className="home-featured-art" />
          <span className="home-agent-badge home-agent-badge-left">Featured</span>
          <span className="home-agent-badge home-agent-badge-right">Coming soon</span>
        </div>

        <div className="home-featured-content">
          <div className="home-featured-copy">
            <h3 className="home-featured-title">
              <Link href={detailHref}>{agent.name}</Link>
            </h3>
            <div className="home-featured-by">
              <span className="home-featured-by-label">By</span>
              <span className="home-featured-by-avatar">
                <Image
                  src={agent.logoUrl}
                  alt=""
                  width={20}
                  height={20}
                  className="h-full w-full object-cover"
                />
              </span>
              <span className="home-featured-by-name">{agent.deployer}</span>
            </div>
            <p className="home-featured-desc">{agent.oneLiner}</p>
          </div>

          <div className="home-featured-progress-wrap">
            <p className="home-featured-soon">Coming soon</p>
          </div>

          <div className="home-featured-actions">
            <button type="button" className="home-cta-btn" onClick={() => setOpen(true)}>
              Notify me
            </button>
            <HomeCtaButton href={detailHref} variant="secondary">
              View Project
            </HomeCtaButton>
          </div>
        </div>
      </div>

      {open ? (
        <div className="notify-backdrop" onClick={close}>
          <div
            className="notify-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            onClick={(event) => event.stopPropagation()}
          >
            <button type="button" className="notify-close" onClick={close} aria-label="Close">
              ×
            </button>
            {status === 'success' ? (
              <div className="notify-thanks">
                <p id={titleId} className="notify-title">Thank you</p>
                <p className="notify-copy">You will be notified when {agent.name} opens.</p>
                <button type="button" className="home-cta-btn" onClick={close}>
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={submit}>
                <p id={titleId} className="notify-title">Get notified</p>
                <p className="notify-copy">Enter your Telegram username and we will let you know when {agent.name} opens.</p>
                <label className="notify-label" htmlFor={`${titleId}-telegram`}>
                  Telegram username
                </label>
                <input
                  ref={inputRef}
                  id={`${titleId}-telegram`}
                  className="notify-input"
                  value={telegram}
                  onChange={(event) => {
                    setTelegram(event.target.value);
                    if (status === 'error') setStatus('idle');
                  }}
                  placeholder="@username"
                  autoComplete="off"
                  required
                  disabled={status === 'loading'}
                />
                {status === 'error' ? (
                  <p className="notify-error" role="alert">{error}</p>
                ) : null}
                <button type="submit" className="home-cta-btn notify-submit" disabled={status === 'loading'}>
                  {status === 'loading' ? 'Saving…' : 'Notify me'}
                </button>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </article>
  );
}

