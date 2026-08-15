'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Agent } from '@/lib/mock-data';
import { formatCurrency } from '@/lib/format';
import { MdIcon } from '@/components/material';

function statusLabel(status: Agent['status']): string {
  switch (status) {
    case 'ICO Live':
      return 'LIVE';
    case 'ICO Upcoming':
      return 'UPCOMING';
    case 'Trading':
      return 'TRADING';
    case 'Successful':
      return 'ENDED';
    case 'Failed':
      return 'FAILED';
  }
}

function ctaLabel(agent: Agent): string {
  const price =
    agent.status === 'Trading' ? agent.currentPrice : agent.tokenPrice;
  const priceText =
    price >= 0.01 ? `$${price.toFixed(3)}` : `$${price.toFixed(5)}`;

  if (agent.status === 'ICO Live') {
    return `Join ${agent.ticker} | ${priceText}`;
  }
  if (agent.status === 'Trading') {
    return `Buy ${agent.ticker} | ${priceText}`;
  }
  if (agent.status === 'ICO Upcoming') {
    return `View ${agent.ticker}`;
  }
  return `Open ${agent.ticker}`;
}

export function DiscoverProjectCard({ agent }: { agent: Agent }) {
  const progress = Math.min(
    agent.raiseTarget > 0 ? agent.amountRaised / agent.raiseTarget : 0,
    1,
  );
  const filled = progress >= 0.999;
  const detailHref = `/agents/${agent.slug}`;
  const ctaHref =
    agent.status === 'ICO Live' ? `/agents/${agent.slug}/ico` : detailHref;

  return (
    <article className="discover-card flex h-full min-w-0 flex-col">
      <div className="mb-2 flex items-start justify-between gap-2">
        <Link
          href={detailHref}
          className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-md bg-ink-lighter border border-white/10"
        >
          {agent.logoUrl ? (
            <Image
              src={agent.logoUrl}
              alt=""
              width={32}
              height={32}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="font-display text-xs font-bold text-brand">
              {agent.name.charAt(0)}
            </span>
          )}
        </Link>
        <span className="discover-status-pill">{statusLabel(agent.status)}</span>
      </div>

      <Link href={detailHref} className="group">
        <h3 className="font-display text-[1.15rem] font-bold tracking-tight text-chalk leading-tight mb-0.5 group-hover:text-brand transition-colors">
          {agent.name}
        </h3>
      </Link>
      <p className="text-[11px] text-brand mb-1.5 font-medium">{agent.deployer}</p>
      <p className="text-xs text-chalk-dim leading-snug line-clamp-2 mb-3 min-h-[2.4em]">
        {agent.oneLiner}
      </p>

      <div className="mt-auto">
        <div className="mb-1.5 grid grid-cols-2 gap-2">
          <div>
            <p className="discover-stat-label">
              Raised
              <MdIcon className="arca-icon-sm">info</MdIcon>
            </p>
            <p className="text-sm font-semibold text-chalk tracking-tight">
              {formatCurrency(agent.amountRaised)}
            </p>
          </div>
          <div>
            <p className="discover-stat-label">
              Goal
              <MdIcon className="arca-icon-sm">info</MdIcon>
            </p>
            <p className="text-sm font-semibold text-chalk tracking-tight">
              {formatCurrency(agent.raiseTarget)}
            </p>
          </div>
        </div>

        <div
          className="discover-progress mb-2.5"
          role="progressbar"
          aria-valuenow={Math.round(progress * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Raise progress"
        >
          <div
            className={`discover-progress-fill ${filled ? 'is-complete' : ''}`}
            style={{ width: `${Math.max(progress * 100, progress > 0 ? 4 : 0)}%` }}
          />
        </div>

        <Link href={ctaHref} className="discover-cta">
          {ctaLabel(agent)}
        </Link>
      </div>
    </article>
  );
}
