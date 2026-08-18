'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  formatCommaNumber,
  formatPercent,
  formatRelativeTime,
  formatSignedUsd,
  formatStatCurrency,
  formatUsd,
  getExplorerUrl,
} from '@/lib/format';
import { RequireAuth } from '@/components/RequireAuth';
import { useAuth } from '@/components/AuthProvider';
import { LoadingState } from '@/components/LoadingState';
import type { InvestorPosition, InvestorTransaction } from '@/lib/store';
import type { Agent, BuybackEvent } from '@/lib/mock-data';

type Tab = 'investments' | 'claims' | 'holdings' | 'pnl' | 'buybacks' | 'history';

const TABS: { id: Tab; label: string }[] = [
  { id: 'investments', label: 'My Investments' },
  { id: 'claims', label: 'Claims' },
  { id: 'holdings', label: 'Holdings' },
  { id: 'pnl', label: 'PnL' },
  { id: 'buybacks', label: 'Buybacks' },
  { id: 'history', label: 'History' },
];

const TX_TYPE_LABEL: Record<InvestorTransaction['type'], string> = {
  contribute: 'Contribute',
  claim: 'Claim',
  refund: 'Refund',
  buyback: 'Buyback',
};

const TX_STATUS_LABEL: Record<InvestorTransaction['status'], string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  failed: 'Failed',
};

function shortenAddress(value: string): string {
  if (!value) return '';
  if (value.length <= 14) return value;
  return `${value.slice(0, 6)}…${value.slice(-4)}`;
}

function positionStatus(position: InvestorPosition): string {
  if (position.claimed) return 'Claimed';
  if (position.claimable) return 'Claimable';
  if (position.refundable) return 'Refundable';
  return 'Pending';
}

function holdingValue(position: InvestorPosition): number {
  return position.tokensAllocated * 0.0005;
}

function InvestorDashboard() {
  const { wallet } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('investments');
  const [walletAddress, setWalletAddress] = useState(wallet);
  const [positions, setPositions] = useState<InvestorPosition[]>([]);
  const [transactions, setTransactions] = useState<InvestorTransaction[]>([]);
  const [buybacks, setBuybacks] = useState<BuybackEvent[]>([]);
  const [agentsById, setAgentsById] = useState<Record<string, Agent>>({});
  const [loading, setLoading] = useState(false);

  const fetchPortfolio = useCallback(async () => {
    try {
      setLoading(true);
      const [portfolioRes, agentsRes] = await Promise.all([
        fetch(`/api/investor/portfolio?wallet=${encodeURIComponent(walletAddress)}`),
        fetch('/api/agents'),
      ]);
      const data = await portfolioRes.json();
      const agentsData = await agentsRes.json();
      setPositions(data.positions || []);
      setTransactions(data.transactions || []);
      setBuybacks(data.buybacks || []);

      const next: Record<string, Agent> = {};
      for (const agent of (agentsData.agents || []) as Agent[]) {
        next[agent.id] = agent;
      }
      setAgentsById(next);
    } catch (error) {
      console.error('Failed to fetch portfolio:', error);
    } finally {
      setLoading(false);
    }
  }, [walletAddress]);

  useEffect(() => {
    setWalletAddress(wallet);
  }, [wallet]);

  useEffect(() => {
    if (walletAddress) fetchPortfolio();
  }, [walletAddress, fetchPortfolio]);

  const totalInvested = positions.reduce((sum, p) => sum + p.contributed, 0);
  const totalHoldings = positions.reduce((sum, p) => sum + holdingValue(p), 0);
  const totalBuybacks = buybacks.reduce(
    (sum, b) => sum + parseFloat(b.agentTokensBought.toString()),
    0,
  );
  const unrealizedPnL = totalHoldings - totalInvested;
  const pnlRatio = totalInvested > 0 ? unrealizedPnL / totalInvested : 0;
  const pnlTone =
    unrealizedPnL > 0 ? 'is-up' : unrealizedPnL < 0 ? 'is-down' : '';

  const claimable = useMemo(
    () => positions.filter((p) => p.claimable && !p.claimed),
    [positions],
  );

  const agentName = (agentId: string) =>
    agentsById[agentId]?.name ?? `Agent ${agentId.slice(0, 8)}`;
  const agentTicker = (agentId: string) => agentsById[agentId]?.ticker;
  const agentHref = (agentId: string) => {
    const slug = agentsById[agentId]?.slug ?? agentId;
    return `/agents/${slug}`;
  };

  const stats = [
    {
      label: 'Total Invested',
      value: formatStatCurrency(totalInvested),
      hint: `${formatCommaNumber(positions.length)} position${positions.length === 1 ? '' : 's'}`,
    },
    {
      label: 'Holdings Value',
      value: formatStatCurrency(totalHoldings),
      hint: `${unrealizedPnL >= 0 ? '+' : ''}${formatPercent(pnlRatio)}`,
      tone: pnlTone,
    },
    {
      label: 'Buybacks Received',
      value: formatCommaNumber(totalBuybacks),
      hint: `${formatCommaNumber(buybacks.length)} event${buybacks.length === 1 ? '' : 's'}`,
    },
    {
      label: 'Unrealized PnL',
      value: formatSignedUsd(unrealizedPnL),
      hint: `${unrealizedPnL >= 0 ? '+' : ''}${formatPercent(pnlRatio)}`,
      tone: pnlTone,
    },
  ];

  const renderEmpty = (message: string) => (
    <p className="dashboard-empty">{message}</p>
  );

  return (
    <div className="arca-page">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="dashboard-header"
        >
          <h1 className="arca-section-title">Investor Dashboard</h1>
          <p className="arca-page-lead">
            Track investments, claims, and buyback rewards on arca.
          </p>
          {walletAddress && (
            <p className="dashboard-wallet" title={walletAddress}>
              {shortenAddress(walletAddress)}
            </p>
          )}
        </motion.div>

        <div className="dashboard-stat-grid">
          {stats.map((stat) => (
            <article key={stat.label} className="arca-surface dashboard-stat">
              <p className="dashboard-stat-label">{stat.label}</p>
              <p
                className={`dashboard-stat-value${stat.tone ? ` ${stat.tone}` : ''}`}
              >
                {stat.value}
              </p>
              <p className="dashboard-stat-hint">{stat.hint}</p>
            </article>
          ))}
        </div>

        <div className="arca-surface dashboard-board">
          <div className="dashboard-tabs" role="tablist" aria-label="Portfolio sections">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                id={`dashboard-tab-${tab.id}`}
                aria-selected={activeTab === tab.id}
                aria-controls={`dashboard-panel-${tab.id}`}
                className={`dashboard-tab${activeTab === tab.id ? ' is-active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div
            className="dashboard-panel"
            role="tabpanel"
            id={`dashboard-panel-${activeTab}`}
            aria-labelledby={`dashboard-tab-${activeTab}`}
          >
            {loading ? (
              <LoadingState label="Loading portfolio…" />
            ) : (
              <>
                {activeTab === 'investments' && (
                  <>
                    <h2 className="dashboard-panel-title">My Investments</h2>
                    {positions.length === 0 ? (
                      renderEmpty('Contribute to a live ICO to see investments here.')
                    ) : (
                      <ul className="dashboard-list">
                        {positions.map((position, idx) => (
                          <li key={`${position.agentId}-${idx}`} className="dashboard-row">
                            <div className="dashboard-row-main">
                              <p className="dashboard-row-title">
                                {agentName(position.agentId)}
                              </p>
                              <p className="dashboard-row-meta">
                                {agentTicker(position.agentId)
                                  ? `${agentTicker(position.agentId)} · `
                                  : ''}
                                {formatCommaNumber(position.tokensAllocated)} tokens
                              </p>
                            </div>
                            <p className="dashboard-row-amount">
                              {formatUsd(position.contributed)}
                            </p>
                            <p className="dashboard-row-status">
                              {positionStatus(position)}
                            </p>
                            <Link
                              href={agentHref(position.agentId)}
                              className="dashboard-text-link dashboard-row-action"
                            >
                              View
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                )}

                {activeTab === 'claims' && (
                  <>
                    <h2 className="dashboard-panel-title">Claims</h2>
                    {claimable.length === 0 ? (
                      renderEmpty('Tokens become claimable after a successful ICO.')
                    ) : (
                      <ul className="dashboard-list">
                        {claimable.map((position, idx) => (
                          <li key={`${position.agentId}-claim-${idx}`} className="dashboard-row">
                            <div className="dashboard-row-main">
                              <p className="dashboard-row-title">
                                {agentName(position.agentId)}
                              </p>
                              <p className="dashboard-row-meta">
                                {formatCommaNumber(position.tokensAllocated)} tokens available
                              </p>
                            </div>
                            <p className="dashboard-row-amount">
                              {formatUsd(holdingValue(position))}
                            </p>
                            <Link
                              href={`${agentHref(position.agentId)}/ico`}
                              className="dashboard-claim dashboard-row-action"
                            >
                              Claim
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                )}

                {activeTab === 'holdings' && (
                  <>
                    <h2 className="dashboard-panel-title">Holdings</h2>
                    {positions.length === 0 ? (
                      renderEmpty('Holdings appear after you contribute to an agent.')
                    ) : (
                      <ul className="dashboard-list">
                        {positions.map((position, idx) => (
                          <li key={`${position.agentId}-hold-${idx}`} className="dashboard-row">
                            <div className="dashboard-row-main">
                              <p className="dashboard-row-title">
                                {agentName(position.agentId)}
                              </p>
                              <p className="dashboard-row-meta">
                                {formatCommaNumber(position.tokensAllocated)} tokens
                              </p>
                            </div>
                            <p className="dashboard-row-amount">
                              {formatUsd(holdingValue(position))}
                            </p>
                            <p className="dashboard-row-status">
                              {positionStatus(position)}
                            </p>
                            <Link
                              href={agentHref(position.agentId)}
                              className="dashboard-text-link dashboard-row-action"
                            >
                              View
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                )}

                {activeTab === 'pnl' && (
                  <>
                    <h2 className="dashboard-panel-title">PnL</h2>
                    <dl className="dashboard-pnl">
                      <div className="dashboard-pnl-row">
                        <dt>Total Invested</dt>
                        <dd className="tabular-nums">{formatUsd(totalInvested)}</dd>
                      </div>
                      <div className="dashboard-pnl-row">
                        <dt>Holdings Value</dt>
                        <dd className="tabular-nums">{formatUsd(totalHoldings)}</dd>
                      </div>
                      <div className="dashboard-pnl-row dashboard-pnl-total">
                        <dt>Unrealized PnL</dt>
                        <dd className={`tabular-nums ${pnlTone}`}>
                          {formatSignedUsd(unrealizedPnL)}
                          <span className="dashboard-pnl-ratio">
                            {unrealizedPnL >= 0 ? '+' : ''}
                            {formatPercent(pnlRatio)}
                          </span>
                        </dd>
                      </div>
                    </dl>
                  </>
                )}

                {activeTab === 'buybacks' && (
                  <>
                    <h2 className="dashboard-panel-title">Buybacks</h2>
                    {buybacks.length === 0 ? (
                      renderEmpty('Buybacks appear here when agents execute them.')
                    ) : (
                      <ul className="dashboard-list">
                        {buybacks.map((buyback, idx) => (
                          <li key={`${buyback.txHash}-${idx}`} className="dashboard-row">
                            <div className="dashboard-row-main">
                              <p className="dashboard-row-title">
                                {agentName(buyback.agentId)}
                              </p>
                              <p className="dashboard-row-meta">
                                {formatRelativeTime(buyback.timestamp)}
                              </p>
                            </div>
                            <p className="dashboard-row-amount">
                              {formatCommaNumber(
                                parseFloat(buyback.agentTokensBought.toString()),
                              )}{' '}
                              tokens
                            </p>
                            <a
                              href={getExplorerUrl(
                                buyback.chain as 'solana' | 'robinhood',
                                buyback.txHash,
                              )}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="dashboard-text-link dashboard-row-action"
                            >
                              View Tx
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                )}

                {activeTab === 'history' && (
                  <>
                    <h2 className="dashboard-panel-title">Transaction History</h2>
                    {transactions.length === 0 ? (
                      renderEmpty(
                        'Contributions, claims, and refunds will appear here.',
                      )
                    ) : (
                      <ul className="dashboard-list">
                        {transactions.map((tx) => (
                          <li key={tx.id} className="dashboard-row">
                            <div className="dashboard-row-main">
                              <p className="dashboard-row-title">
                                {TX_TYPE_LABEL[tx.type]} · {agentName(tx.agentId)}
                              </p>
                              <p className="dashboard-row-meta">
                                {formatRelativeTime(tx.timestamp)}
                              </p>
                            </div>
                            <p className="dashboard-row-amount">{formatUsd(tx.amount)}</p>
                            <p className="dashboard-row-status">
                              {TX_STATUS_LABEL[tx.status]}
                            </p>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <RequireAuth title="Sign In To Access Investor Dashboard">
      <InvestorDashboard />
    </RequireAuth>
  );
}
