'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Agent } from '@/lib/mock-data';
import { formatCurrency, discoverCtaLabel } from '@/lib/format';
import { MdIcon } from '@/components/material';

/** Native pixels of logos/elvis.png — keep in sync with .discover-featured-media aspect-ratio. */
const FEATURED_STILL_WIDTH = 1448;
const FEATURED_STILL_HEIGHT = 1086;

export function DiscoverFeatured({ agent }: { agent: Agent }) {
  const progress = Math.min(
    agent.raiseTarget > 0 ? agent.amountRaised / agent.raiseTarget : 0,
    1,
  );
  const filled = progress >= 0.999;
  const detailHref = `/agents/${agent.slug}`;
  const ctaHref =
    agent.status === 'ICO Live' ? `/agents/${agent.slug}/ico` : detailHref;

  return (
    <section className="discover-featured" aria-labelledby="discover-featured-heading">
      <div className="discover-featured-header">
        <div className="discover-featured-title-row">
          <h2 id="discover-featured-heading" className="discover-featured-heading">
            Featured
          </h2>
          <span
            className="discover-featured-help"
            title="Agents arca picked to spotlight on Discover."
            aria-label="Agents arca picked to spotlight on Discover."
          >
            <MdIcon>info</MdIcon>
          </span>
        </div>
        <Link href="/apply" className="discover-featured-apply">
          Apply
        </Link>
      </div>

      <article className="discover-featured-card">
        <Link
          href={detailHref}
          className="discover-featured-media"
          aria-label={agent.name}
        >
          <Image
            src={agent.logoUrl}
            alt={`${agent.name} featured still`}
            width={FEATURED_STILL_WIDTH}
            height={FEATURED_STILL_HEIGHT}
            priority
            sizes="(max-width: 767px) 280px, 320px"
            className="discover-featured-image"
          />
        </Link>

        <div className="discover-featured-body">
          <div className="discover-featured-founder">
            <Link
              href={detailHref}
              className="discover-featured-avatar"
              aria-label={`${agent.name} profile`}
            >
              <Image
                src={agent.logoUrl}
                alt=""
                width={40}
                height={40}
                className="discover-featured-avatar-img"
              />
            </Link>
            <div className="min-w-0">
              <p className="discover-featured-founder-label">Founded by</p>
              <p className="discover-featured-handle">{agent.deployer}</p>
            </div>
          </div>

          <p className="discover-featured-copy">{agent.oneLiner}</p>

          <div className="discover-featured-stats">
            <div className="discover-featured-stat-grid">
              <div>
                <p className="discover-stat-label">
                  Raised
                  <MdIcon className="arca-icon-sm">info</MdIcon>
                </p>
                <p className="discover-featured-stat-value">
                  {formatCurrency(agent.amountRaised)}
                </p>
              </div>
              <div>
                <p className="discover-stat-label">
                  Goal
                  <MdIcon className="arca-icon-sm">info</MdIcon>
                </p>
                <p className="discover-featured-stat-value">
                  {formatCurrency(agent.raiseTarget)}
                </p>
              </div>
            </div>

            <div
              className="discover-progress mb-2"
              role="progressbar"
              aria-valuenow={Math.round(progress * 100)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Raise progress"
            >
              <div
                className={`discover-progress-fill ${filled ? 'is-complete' : ''}`}
                style={{
                  width: `${Math.max(progress * 100, progress > 0 ? 4 : 0)}%`,
                }}
              />
            </div>

            <Link href={ctaHref} className="discover-cta discover-featured-cta">
              {discoverCtaLabel(agent)}
            </Link>
          </div>
        </div>
      </article>
    </section>
  );
}
