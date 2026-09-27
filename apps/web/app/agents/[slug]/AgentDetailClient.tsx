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
    <span className={`agd-corner-icon ${className}`}>
      <span className="agd-corner agd-corner-tl" aria-hidden />
      <span className="agd-corner agd-corner-tr" aria-hidden />
      <span className="agd-corner agd-corner-bl" aria-hidden />
      <span className="agd-corner agd-corner-br" aria-hidden />
      <span className="agd-corner-icon-inner">{children}</span>
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
    <div className="agd-section-title">
      <Image src={icon} alt="" width={iconSize} height={iconSize} className="agd-section-title-icon" />
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
    <div className="agd-page">
      <HomeSectionDivider />

      <section className="agd-hero">
        <div className="agd-hero-bg" aria-hidden>
          <div
            className="agd-hero-bg-pattern"
            style={{ backgroundImage: 'url(/agent-detail/hero-bg.png)' }}
          />
          <div className="agd-hero-bg-wash" />
        </div>

        <div className="agd-hero-inner">
          <nav className="agd-breadcrumb" aria-label="Breadcrumb">
            <Link href="/" className="agd-breadcrumb-chip">
              Discover
            </Link>
            <Image
              src="/agent-detail/icon-breadcrumb.svg"
              alt=""
              width={10}
              height={20}
              className="agd-breadcrumb-sep"
            />
            <span className="agd-breadcrumb-chip">{agent.name}</span>
          </nav>

          <div className="agd-hero-identity">
            <div className="agd-hero-identity-left">
              <div className="agd-agent-mark">
                <Image
                  src="/agent-detail/icon-frame.svg"
                  alt=""
                  width={78}
                  height={78}
                  className="agd-agent-mark-frame"
                />
                <Image
                  src="/agent-detail/icon-chart.svg"
                  alt=""
                  width={32}
                  height={32}
                  className="agd-agent-mark-glyph"
                />
              </div>
              <div className="agd-hero-copy">
                <h1 className="agd-hero-title">{agent.name}</h1>
                <p className="agd-hero-lead">{agent.oneLiner}</p>
              </div>
            </div>

            <div className="agd-hero-actions">
              <button type="button" className="agd-btn agd-btn-ghost" onClick={onShare}>
                <span>Share</span>
                <Image src="/agent-detail/icon-send.svg" alt="" width={20} height={20} />
              </button>
              {agent.website ? (
                <a
                  href={agent.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="agd-btn agd-btn-ghost"
                >
                  <span>Visit</span>
                  <Image src="/agent-detail/icon-visit.svg" alt="" width={20} height={20} />
                </a>
              ) : null}
              <Link href={tradeHref} className="agd-btn agd-btn-primary">
                <span>{tradeLabel}</span>
                <Image src="/agent-detail/icon-trade.svg" alt="" width={20} height={20} />
              </Link>
            </div>
          </div>

          <div className="agd-raise">
            <div className="agd-raise-head">
              <p className="agd-raise-label">Current Raise</p>
              <div className="agd-raise-values">
                <p className="agd-raise-amount">
                  <span>{formatUsd(agent.amountRaised, 0)}</span>
                  <span className="agd-raise-target"> / {formatUsd(agent.raiseTarget, 0)}</span>
                </p>
                <p className="agd-raise-pct">{progressPct}%</p>
              </div>
            </div>

            <div className="agd-raise-track" role="progressbar" aria-valuenow={progressPct} aria-valuemin={0} aria-valuemax={100}>
              <div className="agd-raise-fill" style={{ width: `${progressPct}%` }}>
                <span
                  className="agd-raise-stripes"
                  style={{ backgroundImage: 'url(/agent-detail/progress-stripes.svg)' }}
                  aria-hidden
                />
              </div>
            </div>

            <div className="agd-raise-meta">
              <div className="agd-raise-meta-item">
                <span className="agd-avatar-stack" aria-hidden>
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="agd-avatar-chip">
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
                <div className="agd-raise-meta-item">
                  <Image src="/agent-detail/icon-time.svg" alt="" width={20} height={20} />
                  <span>
                    {closesIn === 0
                      ? 'Closing soon'
                      : `Closes in ${closesIn} day${closesIn === 1 ? '' : 's'}`}
                  </span>
                </div>
              ) : (
                <div className="agd-raise-meta-item">
                  <Image src="/agent-detail/icon-time.svg" alt="" width={20} height={20} />
                  <span>
                    {agent.status === 'Trading' || agent.status === 'Successful'
                      ? 'Raise completed'
                      : agent.status}
                  </span>
                </div>
              )}
              <div className="agd-raise-meta-item">
                <Image src="/agent-detail/icon-meter.svg" alt="" width={20} height={20} />
                <span>
                  Min {formatCurrency(raiseMetaMin, 0)} - Max{' '}
                  {formatUsd(agent.raiseTarget, 0)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="agd-stats">
          {stats.map((stat) => (
            <div key={stat.label} className="agd-stat-cell">
              <div className="agd-stat-copy">
                <p className="agd-stat-label">{stat.label}</p>
                <p
                  className={`agd-stat-value${stat.tone === 'positive' ? ' is-positive' : ''}`}
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

      <section className="agd-body">
        <div className="agd-body-row">
          <article className="agd-panel agd-panel-about">
            <div className="agd-panel-block">
              <SectionTitle icon="/agent-detail/icon-info.svg">About</SectionTitle>
              <p className="agd-panel-text">{agent.description}</p>
            </div>

            <div className="agd-panel-rule" aria-hidden />

            <div className="agd-panel-block">
              <SectionTitle icon="/agent-detail/icon-settings.svg">Deployer</SectionTitle>
              <div className="agd-deployer">
                <div className="agd-deployer-avatar">
                  <Image
                    src={agent.logoUrl}
                    alt=""
                    width={24}
                    height={24}
                    className="agd-deployer-avatar-img"
                  />
                </div>
                <div className="agd-deployer-copy">
                  <p className="agd-deployer-handle">
                    <span>@</span>
                    {deployerHandle}
                  </p>
                  <p className="agd-deployer-bio">
                    Deployed {agent.name} on {agent.chain}. Tier {agent.tier}. {founderRole}
                  </p>
                </div>
              </div>
            </div>

            <div className="agd-panel-rule" aria-hidden />

            <div className="agd-panel-block">
              <SectionTitle icon="/agent-detail/icon-link.svg">Links</SectionTitle>
              <div className="agd-links">
                {agent.website ? (
                  <a
                    href={agent.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="agd-link-btn"
                  >
                    <span>{websiteHost}</span>
                    <Image src="/agent-detail/icon-ext-arrow.svg" alt="" width={20} height={20} />
                  </a>
                ) : null}
                {agent.docs ? (
                  <a
                    href={agent.docs}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="agd-link-btn"
                  >
                    <span>Docs</span>
                    <Image src="/agent-detail/icon-ext-arrow.svg" alt="" width={20} height={20} />
                  </a>
                ) : null}
              </div>
            </div>
          </article>

          <article className="agd-panel agd-panel-contributors">
            <SectionTitle icon="/agent-detail/icon-money.svg">Top Contributors</SectionTitle>
            <div className="agd-contributors">
              {topContributors.map((c) => (
                <div key={`${c.handle}-${c.amount}`} className="agd-contributor">
                  <div className="agd-contributor-avatar">
                    <Image
                      src="/agent-detail/avatar2.png"
                      alt=""
                      width={24}
                      height={24}
                      className="agd-contributor-avatar-img"
                    />
                  </div>
                  <div className="agd-contributor-main">
                    <div className="agd-contributor-id">
                      <p className="agd-contributor-handle">{c.handle}</p>
                      <p className="agd-contributor-role">{c.role}</p>
                    </div>
                    <div className="agd-contributor-stats">
                      <p className="agd-contributor-amount">
                        <span>+{formatCompactCurrency(c.amount)}</span>
                        <span className="agd-contributor-slash"> / </span>
                        <span className="agd-contributor-pct">
                          +{formatPercent(c.pct, 1)}
                        </span>
                      </p>
                      <p className="agd-contributor-time">{c.timeAgo}</p>
                    </div>
                  </div>
                </div>
              ))}
              {moreContributors > 0 ? (
                <p className="agd-contributors-more">+{moreContributors} more</p>
              ) : null}
            </div>
          </article>
        </div>

        <div className="agd-body-row">
          <div className="agd-panel-stack">
            <article className="agd-panel agd-panel-list">
              <SectionTitle icon="/agent-detail/icon-list.svg" iconSize={18}>
                How Capital Is Used
              </SectionTitle>
              <ul className="agd-bullet-list">
                {capitalUses.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>

            <article className="agd-panel agd-panel-list">
              <SectionTitle icon="/agent-detail/icon-note.svg">
                Allocations And Terms
              </SectionTitle>
              <ul className="agd-bullet-list">
                {allocationTerms.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          </div>

          <article className="agd-panel agd-panel-terms">
            <SectionTitle icon="/agent-detail/icon-note.svg">Deal Terms</SectionTitle>
            <dl className="agd-terms">
              {dealTerms.map((row) => (
                <div key={row.label} className="agd-terms-row">
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
