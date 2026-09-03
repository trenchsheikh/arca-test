'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback } from 'react';
import type { Agent, BuybackEvent } from '@/lib/mock-data';
import { buildContributors, contributorCount } from '@/lib/contributors';
import {
  formatCompactCurrency,
  formatCurrency,
  formatPercent,
  formatUsd,
  getMarketCap,
} from '@/lib/format';
import { HomeSectionDivider } from '@/components/home/HomeSectionDivider';

interface AgentDetailClientProps {
  agent: Agent;
  buybacks: BuybackEvent[];
}

function hostLabel(url?: string): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

function daysUntil(iso?: string): number | null {
  if (!iso) return null;
  const ms = new Date(iso).getTime() - Date.now();
  if (!Number.isFinite(ms)) return null;
  if (ms <= 0) return 0;
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

function CornerIcon({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={`ad-corner-icon ${className}`}>
      <span className="ad-corner ad-corner-tl" aria-hidden />
      <span className="ad-corner ad-corner-tr" aria-hidden />
      <span className="ad-corner ad-corner-bl" aria-hidden />
      <span className="ad-corner ad-corner-br" aria-hidden />
      <span className="ad-corner-icon-inner">{children}</span>
    </span>
  );
}

function SectionTitle({
  icon,
  iconSize = 20,
  children,
}: {
  icon: string;
  iconSize?: number;
  children: React.ReactNode;
}) {
  return (
    <div className="ad-section-title">
      <Image src={icon} alt="" width={iconSize} height={iconSize} className="ad-section-title-icon" />
      <span>{children}</span>
    </div>
  );
}

export function AgentDetailClient({ agent }: AgentDetailClientProps) {
  const progress = Math.min(
    agent.raiseTarget > 0 ? agent.amountRaised / agent.raiseTarget : 0,
    1,
  );
  const progressPct = Math.round(progress * 100);
  const contributors = buildContributors(agent);
  const totalContributors = contributorCount(agent);
  const closesIn = daysUntil(agent.icoEndsAt);
  const unit = agent.chain === 'solana' ? 'SOL' : 'ETH';
  const marketCap = getMarketCap({
    circulatingSupply: agent.circulatingSupply,
    price: agent.currentPrice,
    launchFdv: agent.launchFdv,
  });
  const websiteHost = hostLabel(agent.website);
  const twitterUrl = agent.twitter || agent.team[0]?.profileUrl;
  const tradeHref =
    agent.status === 'ICO Live' || agent.status === 'ICO Upcoming'
      ? `/agents/${agent.slug}/ico`
      : agent.website || `/agents/${agent.slug}/ico`;
  const tradeLabel =
    agent.status === 'Trading' || agent.status === 'Successful'
      ? `Trade ${agent.ticker}`
      : `Buy ${agent.ticker}`;
  const deployerHandle = agent.deployer.replace(/^@/, '');
  const founderRole = agent.team[0]?.role || 'Founder';
  const moreContributors = Math.max(0, totalContributors - Math.min(contributors.length, 4));

  const onShare = useCallback(async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    try {
      if (navigator.share) {
        await navigator.share({ title: agent.name, text: agent.oneLiner, url });
        return;
      }
      await navigator.clipboard.writeText(url);
    } catch {
      /* user cancelled share */
    }
  }, [agent.name, agent.oneLiner]);

  const capitalUses = [
    `Run the live trading or research loop on ${agent.chain}`,
    'Route revenue into the locked 90/10 buyback split',
    'Cover infra, data, and risk rails for the agent',
    'Keep a reserve for inventory and drawdown control',
  ];

  const allocationTerms = [
    `Raise equals 10% of launch FDV. Capital goes to the agent treasury for execution and ops.`,
    `90% of agent revenue buys ${agent.ticker}. 10% buys the platform token. Split is locked on chain.`,
    `Contributor tokens vest after a ${agent.vestingCliffDays} day cliff over ${agent.vestingDurationDays} days.`,
    `If the raise finishes below ${(agent.raiseThreshold * 100).toFixed(1)}% of target, contributions can be refunded.`,
  ];

  const dealTerms: { label: string; value: string }[] = [
    { label: 'Ticker', value: `$${agent.ticker}` },
    { label: 'Launch FDV', value: formatCompactCurrency(agent.launchFdv) },
    {
      label: 'Raise Target',
      value: `${formatCompactCurrency(agent.raiseTarget)} (10% FDV)`,
    },
    {
      label: 'Token Price',
      value: `$${agent.tokenPrice < 0.01 ? agent.tokenPrice.toFixed(5) : agent.tokenPrice.toFixed(2)}`,
    },
    { label: 'Min Ticket', value: `${agent.minTicket} ${unit}` },
    {
      label: 'Threshold',
      value: `${(agent.raiseThreshold * 100).toFixed(1)}% of target`,
    },
    { label: 'Vesting Cliff', value: `${agent.vestingCliffDays} days` },
    {
      label: 'Vesting Duration',
      value: `${agent.vestingDurationDays} days linear`,
    },
    { label: 'Buyback Split', value: '90% agent / 10% platform' },
    { label: 'Risk', value: agent.riskRating },
  ];

  const stats = [
    {
      label: 'Revenue (30d)',
      value: formatCompactCurrency(agent.totalRevenue),
      icon: '/agent-detail/icon-cash.svg',
      tone: 'default' as const,
    },
    {
      label: 'Total market cap',
      value: formatCompactCurrency(marketCap),
      icon: '/agent-detail/icon-growth.svg',
      tone: 'default' as const,
    },
    {
      label: 'Win rate',
      value: agent.winRate > 0 ? formatPercent(agent.winRate, 0) : '—',
      icon: '/agent-detail/icon-star.svg',
      tone: 'default' as const,
    },
    {
      label: 'Avg. monthly return',
      value:
        agent.avgMonthlyReturn > 0
          ? `+${formatPercent(agent.avgMonthlyReturn, 1)}`
          : '—',
      icon: '/agent-detail/icon-return.svg',
      tone: 'positive' as const,
    },
  ];

  const topContributors = contributors.slice(0, 4).map((c, i) => {
    const pct = agent.raiseTarget > 0 ? c.amount / agent.raiseTarget : 0;
    const isDeployer = c.handle === agent.deployer;
    const hoursAgo = 2 + ((agent.slug.length + i * 3) % 18);
    return {
      ...c,
      role: isDeployer ? 'Deployer' : 'Contributor',
      pct,
      timeAgo: hoursAgo < 24 ? `${hoursAgo}h ago` : `${Math.floor(hoursAgo / 24)}d ago`,
    };
  });

  const raiseMetaMin = Math.max(250, Math.round(agent.minTicket * 200));

  return (
    <div className="ad-page">
      <HomeSectionDivider />

      <section className="ad-hero">
        <div className="ad-hero-bg" aria-hidden>
          <div
            className="ad-hero-bg-pattern"
            style={{ backgroundImage: 'url(/agent-detail/hero-bg.png)' }}
          />
          <div className="ad-hero-bg-wash" />
        </div>

        <div className="ad-hero-inner">
          <nav className="ad-breadcrumb" aria-label="Breadcrumb">
            <Link href="/" className="ad-breadcrumb-chip">
              Discover
            </Link>
            <Image
              src="/agent-detail/icon-breadcrumb.svg"
              alt=""
              width={10}
              height={20}
              className="ad-breadcrumb-sep"
            />
            <span className="ad-breadcrumb-chip">{agent.name}</span>
          </nav>

          <div className="ad-hero-identity">
            <div className="ad-hero-identity-left">
              <div className="ad-agent-mark">
                <Image
                  src="/agent-detail/icon-frame.svg"
                  alt=""
                  width={78}
                  height={78}
                  className="ad-agent-mark-frame"
                />
                <Image
                  src="/agent-detail/icon-chart.svg"
                  alt=""
                  width={32}
                  height={32}
                  className="ad-agent-mark-glyph"
                />
              </div>
              <div className="ad-hero-copy">
                <h1 className="ad-hero-title">{agent.name}</h1>
                <p className="ad-hero-lead">{agent.oneLiner}</p>
              </div>
            </div>

            <div className="ad-hero-actions">
              <button type="button" className="ad-btn ad-btn-ghost" onClick={onShare}>
                <span>Share</span>
                <Image src="/agent-detail/icon-send.svg" alt="" width={20} height={20} />
              </button>
              {agent.website ? (
                <a
                  href={agent.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ad-btn ad-btn-ghost"
                >
                  <span>Visit</span>
                  <Image src="/agent-detail/icon-visit.svg" alt="" width={20} height={20} />
                </a>
              ) : null}
              <Link href={tradeHref} className="ad-btn ad-btn-primary">
                <span>{tradeLabel}</span>
                <Image src="/agent-detail/icon-trade.svg" alt="" width={20} height={20} />
              </Link>
            </div>
          </div>

          <div className="ad-raise">
            <div className="ad-raise-head">
              <p className="ad-raise-label">Current Raise</p>
              <div className="ad-raise-values">
                <p className="ad-raise-amount">
                  <span>{formatUsd(agent.amountRaised, 0)}</span>
                  <span className="ad-raise-target"> / {formatUsd(agent.raiseTarget, 0)}</span>
                </p>
                <p className="ad-raise-pct">{progressPct}%</p>
              </div>
            </div>

            <div className="ad-raise-track" role="progressbar" aria-valuenow={progressPct} aria-valuemin={0} aria-valuemax={100}>
              <div className="ad-raise-fill" style={{ width: `${progressPct}%` }}>
                <span
                  className="ad-raise-stripes"
                  style={{ backgroundImage: 'url(/agent-detail/progress-stripes.svg)' }}
                  aria-hidden
                />
              </div>
            </div>

            <div className="ad-raise-meta">
              <div className="ad-raise-meta-item">
                <span className="ad-avatar-stack" aria-hidden>
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="ad-avatar-chip">
                      <Image
                        src="/agent-detail/avatar.png"
                        alt=""
                        width={20}
                        height={20}
                      />
                    </span>
                  ))}
                </span>
                <span>
                  {totalContributors >= 1000
                    ? `${Math.floor(totalContributors / 1000)}k+`
                    : `${totalContributors}+`}{' '}
                  Contributors
                </span>
              </div>
              {closesIn !== null ? (
                <div className="ad-raise-meta-item">
                  <Image src="/agent-detail/icon-time.svg" alt="" width={20} height={20} />
                  <span>
                    {closesIn === 0
                      ? 'Closing soon'
                      : `Closes in ${closesIn} day${closesIn === 1 ? '' : 's'}`}
                  </span>
                </div>
              ) : (
                <div className="ad-raise-meta-item">
                  <Image src="/agent-detail/icon-time.svg" alt="" width={20} height={20} />
                  <span>
                    {agent.status === 'Trading' || agent.status === 'Successful'
                      ? 'Raise completed'
                      : agent.status}
                  </span>
                </div>
              )}
              <div className="ad-raise-meta-item">
                <Image src="/agent-detail/icon-meter.svg" alt="" width={20} height={20} />
                <span>
                  Min {formatCurrency(raiseMetaMin, 0)} - Max{' '}
                  {formatUsd(agent.raiseTarget, 0)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="ad-stats">
          {stats.map((stat) => (
            <div key={stat.label} className="ad-stat-cell">
              <div className="ad-stat-copy">
                <p className="ad-stat-label">{stat.label}</p>
                <p
                  className={`ad-stat-value${stat.tone === 'positive' ? ' is-positive' : ''}`}
                >
                  {stat.value}
                </p>
              </div>
              <CornerIcon>
                <Image src={stat.icon} alt="" width={24} height={24} />
              </CornerIcon>
            </div>
          ))}
        </div>
      </section>

      <HomeSectionDivider />

      <section className="ad-body">
        <div className="ad-body-row">
          <article className="ad-panel ad-panel-about">
            <div className="ad-panel-block">
              <SectionTitle icon="/agent-detail/icon-info.svg">About</SectionTitle>
              <p className="ad-panel-text">{agent.description}</p>
            </div>

            <div className="ad-panel-rule" aria-hidden />

            <div className="ad-panel-block">
              <SectionTitle icon="/agent-detail/icon-settings.svg">Deployer</SectionTitle>
              <div className="ad-deployer">
                <div className="ad-deployer-avatar">
                  <Image
                    src={agent.logoUrl}
                    alt=""
                    width={24}
                    height={24}
                    className="ad-deployer-avatar-img"
                  />
                </div>
                <div className="ad-deployer-copy">
                  <p className="ad-deployer-handle">
                    <span>@</span>
                    {deployerHandle}
                  </p>
                  <p className="ad-deployer-bio">
                    Deployed {agent.name} on {agent.chain}. Tier {agent.tier}. {founderRole}
                  </p>
                </div>
              </div>
            </div>

            <div className="ad-panel-rule" aria-hidden />

            <div className="ad-panel-block">
              <SectionTitle icon="/agent-detail/icon-link.svg">Links</SectionTitle>
              <div className="ad-links">
                {agent.website ? (
                  <a
                    href={agent.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ad-link-btn"
                  >
                    <span>{websiteHost}</span>
                    <Image src="/agent-detail/icon-ext-arrow.svg" alt="" width={20} height={20} />
                  </a>
                ) : null}
                {twitterUrl ? (
                  <a
                    href={twitterUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ad-link-btn"
                  >
                    <span>Twitter</span>
                    <Image src="/agent-detail/icon-ext-arrow.svg" alt="" width={20} height={20} />
                  </a>
                ) : null}
                {agent.docs ? (
                  <a
                    href={agent.docs}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ad-link-btn"
                  >
                    <span>Docs</span>
                    <Image src="/agent-detail/icon-ext-arrow.svg" alt="" width={20} height={20} />
                  </a>
                ) : null}
              </div>
            </div>
          </article>

          <article className="ad-panel ad-panel-contributors">
            <SectionTitle icon="/agent-detail/icon-money.svg">Top Contributors</SectionTitle>
            <div className="ad-contributors">
              {topContributors.map((c) => (
                <div key={`${c.handle}-${c.amount}`} className="ad-contributor">
                  <div className="ad-contributor-avatar">
                    <Image
                      src="/agent-detail/avatar2.png"
                      alt=""
                      width={24}
                      height={24}
                      className="ad-contributor-avatar-img"
                    />
                  </div>
                  <div className="ad-contributor-main">
                    <div className="ad-contributor-id">
                      <p className="ad-contributor-handle">{c.handle}</p>
                      <p className="ad-contributor-role">{c.role}</p>
                    </div>
                    <div className="ad-contributor-stats">
                      <p className="ad-contributor-amount">
                        <span>+{formatCompactCurrency(c.amount)}</span>
                        <span className="ad-contributor-slash"> / </span>
                        <span className="ad-contributor-pct">
                          +{formatPercent(c.pct, 1)}
                        </span>
                      </p>
                      <p className="ad-contributor-time">{c.timeAgo}</p>
                    </div>
                  </div>
                </div>
              ))}
              {moreContributors > 0 ? (
                <p className="ad-contributors-more">+{moreContributors} more</p>
              ) : null}
            </div>
          </article>
        </div>

        <div className="ad-body-row">
          <div className="ad-panel-stack">
            <article className="ad-panel ad-panel-list">
              <SectionTitle icon="/agent-detail/icon-list.svg" iconSize={18}>
                How Capital Is Used
              </SectionTitle>
              <ul className="ad-bullet-list">
                {capitalUses.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>

            <article className="ad-panel ad-panel-list">
              <SectionTitle icon="/agent-detail/icon-note.svg">
                Allocations And Terms
              </SectionTitle>
              <ul className="ad-bullet-list">
                {allocationTerms.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          </div>

          <article className="ad-panel ad-panel-terms">
            <SectionTitle icon="/agent-detail/icon-note.svg">Deal Terms</SectionTitle>
            <dl className="ad-terms">
              {dealTerms.map((row) => (
                <div key={row.label} className="ad-terms-row">
                  <dt>{row.label}</dt>
                  <dd>{row.value}</dd>
                </div>
              ))}
            </dl>
          </article>
        </div>
      </section>

      <HomeSectionDivider />
    </div>
  );
}
