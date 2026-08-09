'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { formatPercent, formatRelativeTime, getExplorerUrl } from '@/lib/format';
import { RequireAuth } from '@/components/RequireAuth';
import { useAuth } from '@/components/AuthProvider';
import { LoadingState } from '@/components/LoadingState';
import type { InvestorPosition, InvestorTransaction } from '@/lib/store';
import type { BuybackEvent } from '@/lib/mock-data';
import {
  MdTabs,
  MdPrimaryTab,
  MdList,
  MdListItem,
  MdIcon,
  MdFilledButton,
  MdDivider,
} from '@/components/material';

type Tab = 'investments' | 'claims' | 'holdings' | 'pnl' | 'buybacks' | 'history';

function InvestorDashboard() {
  const { wallet } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('investments');
  const [walletAddress, setWalletAddress] = useState(wallet);

  const [positions, setPositions] = useState<InvestorPosition[]>([]);
  const [transactions, setTransactions] = useState<InvestorTransaction[]>([]);
  const [buybacks, setBuybacks] = useState<BuybackEvent[]>([]);
  const [loading, setLoading] = useState(false);

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'investments', label: 'My Investments', icon: 'account_balance_wallet' },
    { id: 'claims', label: 'Claims', icon: 'redeem' },
    { id: 'holdings', label: 'Holdings', icon: 'inventory_2' },
    { id: 'pnl', label: 'PnL', icon: 'trending_up' },
    { id: 'buybacks', label: 'Buybacks', icon: 'autorenew' },
    { id: 'history', label: 'Transaction History', icon: 'history' },
  ];

  const fetchPortfolio = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/investor/portfolio?wallet=${encodeURIComponent(walletAddress)}`,
      );
      const data = await response.json();
      setPositions(data.positions || []);
      setTransactions(data.transactions || []);
      setBuybacks(data.buybacks || []);
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
  const totalHoldings = positions.reduce((sum, p) => sum + p.tokensAllocated * 0.0005, 0);
  const totalBuybacks = buybacks.reduce(
    (sum, b) => sum + parseFloat(b.agentTokensBought.toString()),
    0,
  );
  const unrealizedPnL = totalHoldings - totalInvested;
  const pnlRatio = totalInvested > 0 ? unrealizedPnL / totalInvested : 0;

  const positionStatus = (position: InvestorPosition) =>
    position.claimed
      ? 'Claimed'
      : position.claimable
        ? 'Claimable'
        : position.refundable
          ? 'Refundable'
          : 'Pending';

  return (
    <div className="arca-page">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2">
            <h1 className="arca-section-title">Investor Dashboard</h1>
            <p className="text-sm text-chalk-dim font-mono">{walletAddress}</p>
          </div>
          <p className="text-chalk-dim text-lg">
            Track your investments, claims, and buyback rewards
          </p>
        </motion.div>

        <div className="arca-surface mb-8 overflow-hidden">
          <MdList>
            <MdListItem>
              <MdIcon slot="start">payments</MdIcon>
              <div slot="overline">Total Invested</div>
              <div slot="headline">${totalInvested.toFixed(2)}</div>
              <div slot="supporting-text">{positions.length} positions</div>
            </MdListItem>
            <MdDivider />
            <MdListItem>
              <MdIcon slot="start">savings</MdIcon>
              <div slot="overline">Holdings Value</div>
              <div slot="headline">${totalHoldings.toFixed(2)}</div>
              <div slot="supporting-text">
                {unrealizedPnL >= 0 ? '+' : ''}
                {formatPercent(pnlRatio)}
              </div>
            </MdListItem>
            <MdDivider />
            <MdListItem>
              <MdIcon slot="start">autorenew</MdIcon>
              <div slot="overline">Buybacks Received</div>
              <div slot="headline">{totalBuybacks.toFixed(0)}</div>
              <div slot="supporting-text">{buybacks.length} events</div>
            </MdListItem>
            <MdDivider />
            <MdListItem>
              <MdIcon slot="start">
                {unrealizedPnL >= 0 ? 'trending_up' : 'trending_down'}
              </MdIcon>
              <div slot="overline">Unrealized PnL</div>
              <div slot="headline">
                {unrealizedPnL >= 0 ? '+' : ''}${Math.abs(unrealizedPnL).toFixed(2)}
              </div>
              <div slot="supporting-text">
                {unrealizedPnL >= 0 ? '+' : ''}
                {formatPercent(pnlRatio)}
              </div>
            </MdListItem>
          </MdList>
        </div>

        <div className="arca-surface overflow-hidden">
          <div className="px-2 pt-2 border-b border-black/5 overflow-x-auto">
            <MdTabs
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onChange={(e: any) => {
                const idx = e.target?.activeTabIndex ?? 0;
                setActiveTab(tabs[idx].id);
              }}
              activeTabIndex={tabs.findIndex((t) => t.id === activeTab)}
            >
              {tabs.map((tab) => (
                <MdPrimaryTab key={tab.id}>
                  <MdIcon slot="icon">{tab.icon}</MdIcon>
                  {tab.label}
                </MdPrimaryTab>
              ))}
            </MdTabs>
          </div>

          <div className="p-4 sm:p-6">
            {loading ? (
              <LoadingState label="Loading portfolio…" />
            ) : (
              <>
                {activeTab === 'investments' &&
                  (positions.length === 0 ? (
                    <MdList>
                      <MdListItem>
                        <MdIcon slot="start">inbox</MdIcon>
                        <div slot="headline">No investments yet</div>
                        <div slot="supporting-text">
                          Contribute to a live ICO to see positions here
                        </div>
                      </MdListItem>
                    </MdList>
                  ) : (
                    <MdList>
                      {positions.map((position, idx) => (
                        <div key={idx}>
                          {idx > 0 && <MdDivider />}
                          <MdListItem>
                            <MdIcon slot="start">smart_toy</MdIcon>
                            <div slot="headline">
                              Agent {position.agentId.substring(0, 8)}
                            </div>
                            <div slot="supporting-text">
                              Contributed: ${position.contributed.toFixed(2)}
                            </div>
                            <div slot="trailing-supporting-text">
                              {position.tokensAllocated.toFixed(0)} tokens ·{' '}
                              {positionStatus(position)}
                            </div>
                          </MdListItem>
                        </div>
                      ))}
                    </MdList>
                  ))}

                {activeTab === 'claims' &&
                  (positions.filter((p) => p.claimable && !p.claimed).length === 0 ? (
                    <MdList>
                      <MdListItem>
                        <MdIcon slot="start">redeem</MdIcon>
                        <div slot="headline">No claimable positions</div>
                        <div slot="supporting-text">
                          Tokens become claimable after a successful ICO
                        </div>
                      </MdListItem>
                    </MdList>
                  ) : (
                    <div className="space-y-3">
                      {positions
                        .filter((p) => p.claimable && !p.claimed)
                        .map((position, idx) => (
                          <div
                            key={idx}
                            className="arca-surface-muted p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                          >
                            <div>
                              <p className="font-bold text-chalk mb-1">
                                Agent {position.agentId.substring(0, 8)}
                              </p>
                              <p className="text-chalk-dim text-sm">
                                {position.tokensAllocated.toFixed(0)} tokens available
                              </p>
                            </div>
                            <MdFilledButton onClick={() => alert('Claim via ICO page')}>
                              <MdIcon slot="icon">redeem</MdIcon>
                              Claim
                            </MdFilledButton>
                          </div>
                        ))}
                    </div>
                  ))}

                {activeTab === 'holdings' && (
                  <MdList>
                    <MdListItem>
                      <MdIcon slot="start">inventory_2</MdIcon>
                      <div slot="headline">Holdings value</div>
                      <div slot="supporting-text">
                        ${totalHoldings.toFixed(2)} across {positions.length} position
                        {positions.length !== 1 ? 's' : ''}
                      </div>
                    </MdListItem>
                  </MdList>
                )}

                {activeTab === 'pnl' && (
                  <div className="arca-surface-muted p-8 text-center">
                    <p className="text-chalk-dim text-sm mb-2">Total PnL</p>
                    <p className="font-bold text-3xl text-chalk">
                      {unrealizedPnL >= 0 ? '+' : ''}${Math.abs(unrealizedPnL).toFixed(2)}
                    </p>
                    <p className="text-sm mt-2 text-brand">
                      {unrealizedPnL >= 0 ? '+' : ''}
                      {formatPercent(pnlRatio)}
                    </p>
                  </div>
                )}

                {activeTab === 'buybacks' &&
                  (buybacks.length === 0 ? (
                    <MdList>
                      <MdListItem>
                        <MdIcon slot="start">autorenew</MdIcon>
                        <div slot="headline">No buyback events yet</div>
                        <div slot="supporting-text">
                          Buybacks appear here when agents execute them
                        </div>
                      </MdListItem>
                    </MdList>
                  ) : (
                    <MdList>
                      {buybacks.map((buyback, idx) => (
                        <div key={idx}>
                          {idx > 0 && <MdDivider />}
                          <MdListItem
                            type="link"
                            href={getExplorerUrl(
                              buyback.chain as 'solana' | 'robinhood',
                              buyback.txHash,
                            )}
                          >
                            <MdIcon slot="start">autorenew</MdIcon>
                            <div slot="headline">
                              Agent {buyback.agentId.substring(0, 8)}
                            </div>
                            <div slot="supporting-text">
                              {formatRelativeTime(buyback.timestamp)} ·{' '}
                              {buyback.txHash.substring(0, 8)}…
                            </div>
                            <div slot="trailing-supporting-text">
                              {parseFloat(buyback.agentTokensBought.toString()).toFixed(0)}{' '}
                              tokens
                            </div>
                            <MdIcon slot="end">open_in_new</MdIcon>
                          </MdListItem>
                        </div>
                      ))}
                    </MdList>
                  ))}

                {activeTab === 'history' &&
                  (transactions.length === 0 ? (
                    <MdList>
                      <MdListItem>
                        <MdIcon slot="start">history</MdIcon>
                        <div slot="headline">No transactions yet</div>
                        <div slot="supporting-text">
                          Contributions, claims, and refunds show up here
                        </div>
                      </MdListItem>
                    </MdList>
                  ) : (
                    <MdList>
                      {transactions.map((tx, idx) => (
                        <div key={tx.id}>
                          {idx > 0 && <MdDivider />}
                          <MdListItem>
                            <MdIcon slot="start">
                              {tx.type === 'contribute'
                                ? 'add_circle'
                                : tx.type === 'claim'
                                  ? 'redeem'
                                  : tx.type === 'refund'
                                    ? 'undo'
                                    : 'swap_horiz'}
                            </MdIcon>
                            <div slot="overline">
                              {tx.type} · {tx.status}
                            </div>
                            <div slot="headline">
                              Agent {tx.agentId.substring(0, 8)} · {tx.amount.toFixed(2)}
                            </div>
                            <div slot="supporting-text">
                              {formatRelativeTime(tx.timestamp)} ·{' '}
                              {tx.txHash.substring(0, 8)}…
                            </div>
                          </MdListItem>
                        </div>
                      ))}
                    </MdList>
                  ))}
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
    <RequireAuth title="Sign in to access Investor Dashboard">
      <InvestorDashboard />
    </RequireAuth>
  );
}
