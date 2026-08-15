'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import type { Agent, BuybackEvent } from '@/lib/mock-data';
import { TierBadge } from '@/components/TierBadge';
import { StatusPill } from '@/components/StatusPill';
import { LiveBuybackFeed } from '@/components/LiveBuybackFeed';
import { Countdown } from '@/components/Countdown';
import {
  apeMeterScore,
  buildContributors,
  contributorCount,
} from '@/lib/contributors';
import {
  formatCurrency,
  formatPercent,
  formatNumber,
  formatRelativeTime,
  getExplorerUrl,
} from '@/lib/format';
import { MdFilledButton, MdIcon } from '@/components/material';

interface AgentDetailClientProps {
  agent: Agent;
  buybacks: BuybackEvent[];
}

function launchStatusCopy(agent: Agent): { title: string; detail: string } {
  switch (agent.status) {
    case 'ICO Live':
      return {
        title: 'Raise is live',
        detail: agent.icoEndsAt
          ? `Closes ${new Date(agent.icoEndsAt).toLocaleString()}`
          : 'Open for contributions now',
      };
    case 'ICO Upcoming':
      return {
        title: 'Raise upcoming',
        detail: 'Waiting on admin go live',
      };
    case 'Trading':
      return {
        title: 'Raise completed',
        detail: 'Agent is live with buybacks on chain',
      };
    case 'Successful':
      return {
        title: 'Raise succeeded',
        detail: 'Target hit and tokens are live',
      };
    case 'Failed':
      return {
        title: 'Raise failed',
        detail: 'Below threshold. Refunds available',
      };
  }
}

export function AgentDetailClient({ agent, buybacks }: AgentDetailClientProps) {
  const isTrading = agent.status === 'Trading';
  const isIcoLive = agent.status === 'ICO Live';
  const progress = Math.min(
    agent.raiseTarget > 0 ? agent.amountRaised / agent.raiseTarget : 0,
    1,
  );
  const filled = progress >= 0.999;
  const contributors = buildContributors(agent);
  const totalContributors = contributorCount(agent);
  const heat = apeMeterScore(agent);
  const launch = launchStatusCopy(agent);
  const unit = agent.chain === 'solana' ? 'SOL' : 'ETH';

  return (
    <div className="agent-detail-page">
      <div className="container mx-auto py-6 sm:py-8">
        <Link href="/discover" className="agent-back-link">
          <MdIcon>arrow_back</MdIcon>
          Discover
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="agent-detail-hero"
        >
          <div className="agent-detail-hero-copy">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <TierBadge tier={agent.tier} showTooltip />
              <StatusPill status={agent.status} />
              <span className="text-xs uppercase tracking-wide text-chalk-dim font-semibold">
                {agent.category} · {agent.chain}
              </span>
            </div>

            <div className="flex items-start justify-between gap-4 mb-2">
              <h1 className="font-display font-bold text-chalk text-3xl sm:text-5xl tracking-tight leading-none">
                {agent.name}
              </h1>
              <div className="flex shrink-0 gap-2">
                {agent.website && (
                  <a
                    href={agent.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="agent-icon-btn"
                    aria-label="Website"
                  >
                    <MdIcon>language</MdIcon>
                  </a>
                )}
                {agent.twitter && (
                  <a
                    href={agent.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="agent-icon-btn"
                    aria-label="X"
                  >
                    <MdIcon>alternate_email</MdIcon>
                  </a>
                )}
                {agent.docs && (
                  <a
                    href={agent.docs}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="agent-icon-btn"
                    aria-label="Docs"
                  >
                    <MdIcon>description</MdIcon>
                  </a>
                )}
              </div>
            </div>

            <p className="text-chalk-dim text-base sm:text-lg mb-6 max-w-xl leading-relaxed">
              {agent.oneLiner}
            </p>

            <p className="font-display font-bold text-chalk text-2xl sm:text-4xl tracking-tight mb-3">
              {formatCurrency(agent.amountRaised)}{' '}
              <span className="text-chalk-dim text-lg sm:text-2xl font-semibold">
                raised
              </span>
            </p>

            <div className="agent-raise-track mb-2">
              <div
                className={`agent-raise-fill ${filled ? 'is-complete' : ''}`}
                style={{ width: `${Math.max(progress * 100, progress > 0 ? 3 : 0)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-sm mb-5">
              <span className={`font-semibold ${filled ? 'text-emerald-400' : 'text-brand'}`}>
                {filled ? 'Complete' : formatPercent(progress)}
              </span>
              <span className="text-chalk-dim">
                Goal {formatCurrency(agent.raiseTarget)}
              </span>
            </div>

            <div className="flex items-center gap-3 mb-6">
              <div className="agent-avatar-stack" aria-hidden>
                {contributors.slice(0, 5).map((c) => (
                  <span
                    key={c.handle}
                    className="agent-avatar"
                    style={{
                      background: `hsl(${(c.handle.length * 37) % 360} 42% 38%)`,
                    }}
                    title={c.handle}
                  >
                    {c.handle.replace('@', '').charAt(0).toUpperCase()}
                  </span>
                ))}
              </div>
              <p className="text-sm text-chalk-dim">
                <span className="text-chalk font-semibold">+{totalContributors}</span>{' '}
                contributors
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {isIcoLive && (
                <Link href={`/agents/${agent.slug}/ico`}>
                  <MdFilledButton>
                    <MdIcon slot="icon">payments</MdIcon>
                    Join Raise
                  </MdFilledButton>
                </Link>
              )}
              {isTrading && (
                <MdFilledButton>
                  <MdIcon slot="icon">candlestick_chart</MdIcon>
                  Trade {agent.ticker}
                </MdFilledButton>
              )}
            </div>
          </div>

          <div className="agent-detail-hero-visual">
            <div className="agent-hero-mark">
              {agent.logoUrl ? (
                <Image
                  src={agent.logoUrl}
                  alt={agent.name}
                  width={280}
                  height={280}
                  className="w-full h-full object-cover"
                  priority
                />
              ) : (
                <span className="font-display text-7xl font-bold text-brand">
                  {agent.name.charAt(0)}
                </span>
              )}
            </div>
            <p className="text-center text-xs text-chalk-dim mt-3 font-mono">
              ${agent.ticker}
            </p>
          </div>
        </motion.div>

        <div className="agent-detail-grid">
          <div className="agent-detail-main space-y-8">
            <section>
              <h2 className="agent-section-title">About</h2>
              <p className="text-chalk-muted leading-relaxed">{agent.description}</p>
            </section>

            <section>
              <h2 className="agent-section-title">Deployer</h2>
              <div className="agent-deployer-card">
                <span
                  className="agent-avatar agent-avatar-lg"
                  style={{
                    background: `hsl(${(agent.deployer.length * 41) % 360} 48% 40%)`,
                  }}
                >
                  {agent.deployer.replace('@', '').charAt(0).toUpperCase()}
                </span>
                <div>
                  <p className="text-chalk font-semibold text-lg">{agent.deployer}</p>
                  <p className="text-chalk-dim text-sm">
                    Deployed {agent.name} on {agent.chain}. Tier {agent.tier}.
                  </p>
                  {agent.team[0]?.role && (
                    <p className="text-chalk-dim text-sm mt-1">{agent.team[0].role}</p>
                  )}
                </div>
              </div>
            </section>

            <section>
              <h2 className="agent-section-title">How Capital Is Used</h2>
              <ul className="agent-bullet-list">
                <li>Run the live trading or research loop on {agent.chain}</li>
                <li>Route revenue into the locked 90/10 buyback split</li>
                <li>Cover infra, data, and risk rails for the agent</li>
                <li>Keep a reserve for inventory and drawdown control</li>
              </ul>
            </section>

            <section>
              <h2 className="agent-section-title">Deal Terms</h2>
              <dl className="agent-terms-list">
                <div>
                  <dt>Ticker</dt>
                  <dd>${agent.ticker}</dd>
                </div>
                <div>
                  <dt>Launch FDV</dt>
                  <dd>{formatCurrency(agent.launchFdv)}</dd>
                </div>
                <div>
                  <dt>Raise Target</dt>
                  <dd>{formatCurrency(agent.raiseTarget)} (10% FDV)</dd>
                </div>
                <div>
                  <dt>Token Price</dt>
                  <dd>${agent.tokenPrice}</dd>
                </div>
                <div>
                  <dt>Min Ticket</dt>
                  <dd>
                    {agent.minTicket} {unit}
                  </dd>
                </div>
                <div>
                  <dt>Threshold</dt>
                  <dd>{formatPercent(agent.raiseThreshold)} of target</dd>
                </div>
                <div>
                  <dt>Vesting Cliff</dt>
                  <dd>{agent.vestingCliffDays} days</dd>
                </div>
                <div>
                  <dt>Vesting Duration</dt>
                  <dd>{agent.vestingDurationDays} days linear</dd>
                </div>
                <div>
                  <dt>Buyback Split</dt>
                  <dd>90% agent / 10% platform</dd>
                </div>
                <div>
                  <dt>Risk</dt>
                  <dd>{agent.riskRating}</dd>
                </div>
              </dl>
            </section>

            {(agent.website || agent.docs || agent.twitter) && (
              <section>
                <h2 className="agent-section-title">Links</h2>
                <div className="flex flex-wrap gap-x-5 gap-y-2">
                  {agent.website && (
                    <a
                      href={agent.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="agent-text-link"
                    >
                      Website
                    </a>
                  )}
                  {agent.docs && (
                    <a
                      href={agent.docs}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="agent-text-link"
                    >
                      Docs
                    </a>
                  )}
                  {agent.twitter && (
                    <a
                      href={agent.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="agent-text-link"
                    >
                      X
                    </a>
                  )}
                </div>
              </section>
            )}

            {isTrading && (
              <section>
                <h2 className="agent-section-title">Verified Performance</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="agent-stat-cell">
                    <p className="label">Revenue</p>
                    <p className="value">{formatCurrency(agent.totalRevenue)}</p>
                  </div>
                  <div className="agent-stat-cell">
                    <p className="label">Volume</p>
                    <p className="value">{formatCurrency(agent.tradingVolume)}</p>
                  </div>
                  <div className="agent-stat-cell">
                    <p className="label">Win Rate</p>
                    <p className="value text-brand">{formatPercent(agent.winRate)}</p>
                  </div>
                  <div className="agent-stat-cell">
                    <p className="label">Monthly</p>
                    <p className="value text-brand">
                      {formatPercent(agent.avgMonthlyReturn)}
                    </p>
                  </div>
                </div>
              </section>
            )}

            {buybacks.length > 0 && (
              <section>
                <LiveBuybackFeed events={buybacks} agentId={agent.id} limit={5} />
              </section>
            )}

            {isTrading && buybacks.length > 0 && (
              <section>
                <h2 className="agent-section-title">Buyback History</h2>
                <div className="overflow-x-auto">
                  <table className="agent-table">
                    <thead>
                      <tr>
                        <th>Time</th>
                        <th>Spent</th>
                        <th>Agent</th>
                        <th>Platform</th>
                        <th>Tx</th>
                      </tr>
                    </thead>
                    <tbody>
                      {buybacks.map((b) => (
                        <tr key={b.id}>
                          <td>{formatRelativeTime(b.timestamp)}</td>
                          <td>{formatCurrency(b.revenueSpent)}</td>
                          <td>{formatNumber(b.agentTokensBought)}</td>
                          <td>{formatNumber(b.platformTokensBought)}</td>
                          <td>
                            <a
                              href={getExplorerUrl(b.chain, b.txHash)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="agent-text-link font-mono text-xs"
                            >
                              {b.txHash}
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            <section>
              <h2 className="agent-section-title">Allocations And Terms</h2>
              <ol className="agent-number-list">
                <li>
                  Raise equals 10% of launch FDV. Capital goes to the agent treasury for
                  execution and ops.
                </li>
                <li>
                  90% of agent revenue buys {agent.ticker}. 10% buys the platform token.
                  Split is locked on chain.
                </li>
                <li>
                  Contributor tokens vest after a {agent.vestingCliffDays} day cliff over{' '}
                  {agent.vestingDurationDays} days.
                </li>
                <li>
                  If the raise finishes below {formatPercent(agent.raiseThreshold)} of
                  target, contributions can be refunded.
                </li>
              </ol>
            </section>
          </div>

          <aside className="agent-detail-aside space-y-4">
            <div className="agent-side-card">
              <p className="text-xs uppercase tracking-[0.14em] text-chalk-dim font-semibold mb-2">
                Launch Status
              </p>
              <p className="font-display font-bold text-chalk text-xl mb-1">
                {launch.title}
              </p>
              <p className="text-sm text-chalk-dim mb-4">{launch.detail}</p>
              {isIcoLive && agent.icoEndsAt && (
                <div className="mb-4">
                  <Countdown endsAt={agent.icoEndsAt} className="justify-start" />
                </div>
              )}
              {isIcoLive ? (
                <Link href={`/agents/${agent.slug}/ico`} className="block">
                  <MdFilledButton style={{ width: '100%' }}>
                    <MdIcon slot="icon">bolt</MdIcon>
                    Contribute Now
                  </MdFilledButton>
                </Link>
              ) : isTrading ? (
                <MdFilledButton style={{ width: '100%' }}>
                  <MdIcon slot="icon">candlestick_chart</MdIcon>
                  Trade {agent.ticker}
                </MdFilledButton>
              ) : (
                <MdFilledButton style={{ width: '100%' }} disabled>
                  Raise Not Open
                </MdFilledButton>
              )}
            </div>

            <div className="agent-side-card">
              <p className="text-xs uppercase tracking-[0.14em] text-chalk-dim font-semibold mb-3">
                Ape Meter
              </p>
              <div className="agent-ape-meter" aria-label={`Ape meter ${heat}`}>
                <svg viewBox="0 0 120 70" className="w-full max-w-[200px] mx-auto">
                  <path
                    d="M10 60 A50 50 0 0 1 110 60"
                    fill="none"
                    stroke="rgba(255,255,255,0.12)"
                    strokeWidth="10"
                    strokeLinecap="round"
                  />
                  <path
                    d="M10 60 A50 50 0 0 1 110 60"
                    fill="none"
                    stroke="#5D74E5"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={`${(heat / 100) * 157} 157`}
                  />
                  <text
                    x="60"
                    y="58"
                    textAnchor="middle"
                    fill="#F5F6FA"
                    fontSize="18"
                    fontWeight="700"
                  >
                    {heat}
                  </text>
                </svg>
              </div>
              <p className="text-center text-xs text-chalk-dim mt-1">
                Heat from raise pace and buyback activity
              </p>
            </div>

            <div className="agent-side-card">
              <p className="text-xs uppercase tracking-[0.14em] text-chalk-dim font-semibold mb-3">
                Top Contributors
              </p>
              {contributors.length === 0 ? (
                <p className="text-sm text-chalk-dim">No contributions yet.</p>
              ) : (
                <ul className="space-y-3">
                  {contributors.slice(0, 6).map((c, i) => {
                    const share =
                      agent.amountRaised > 0
                        ? c.amount / agent.amountRaised
                        : 0;
                    return (
                      <li key={`${c.handle}-${i}`} className="flex items-center gap-3">
                        <span
                          className="agent-avatar"
                          style={{
                            background: `hsl(${(c.handle.length * 37) % 360} 42% 38%)`,
                          }}
                        >
                          {c.handle.replace('@', '').charAt(0).toUpperCase()}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-chalk font-medium truncate">
                            {c.handle}
                            {c.handle === agent.deployer && (
                              <span className="ml-1 text-[10px] uppercase tracking-wide text-brand">
                                Deployer
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-chalk-dim">
                            {formatCurrency(c.amount)} · {formatPercent(share)}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {isTrading && (
              <div className="agent-side-card">
                <p className="text-xs uppercase tracking-[0.14em] text-chalk-dim font-semibold mb-3">
                  Market
                </p>
                <p className="font-display font-bold text-chalk text-2xl">
                  ${agent.currentPrice.toFixed(5)}
                </p>
                <p
                  className={`text-sm mb-3 ${
                    agent.priceChange24h >= 0 ? 'text-emerald-400' : 'text-error'
                  }`}
                >
                  {agent.priceChange24h >= 0 ? '+' : ''}
                  {formatPercent(agent.priceChange24h)} 24h
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between gap-3">
                    <span className="text-chalk-dim">Buybacks</span>
                    <span className="text-chalk font-semibold">{agent.totalBuybacks}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-chalk-dim">Circulating</span>
                    <span className="text-chalk font-semibold">
                      {formatNumber(agent.circulatingSupply)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
