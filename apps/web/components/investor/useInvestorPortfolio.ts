'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import type { InvestorPosition, InvestorTransaction } from '@/lib/store';
import type { Agent, BuybackEvent } from '@/lib/mock-data';

export type PortfolioRow = {
  position: InvestorPosition;
  agent: Agent | undefined;
  name: string;
  ticker: string;
  slug: string;
  logoUrl: string;
  invested: number;
  balance: number;
  value: number;
  status: 'Active' | 'Claimable' | 'Claimed' | 'Refundable' | 'Pending';
  pnl: number;
  pnlRatio: number;
};

function holdingValue(position: InvestorPosition, agent?: Agent): number {
  const price = agent?.currentPrice || agent?.tokenPrice || 0.0005;
  return position.tokensAllocated * price;
}

function rowStatus(position: InvestorPosition): PortfolioRow['status'] {
  if (position.claimed) return 'Claimed';
  if (position.claimable) return 'Claimable';
  if (position.refundable) return 'Refundable';
  if (position.tokensAllocated > 0) return 'Active';
  return 'Pending';
}

export function useInvestorPortfolio() {
  const { wallet } = useAuth();
  const [positions, setPositions] = useState<InvestorPosition[]>([]);
  const [transactions, setTransactions] = useState<InvestorTransaction[]>([]);
  const [buybacks, setBuybacks] = useState<BuybackEvent[]>([]);
  const [agentsById, setAgentsById] = useState<Record<string, Agent>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPortfolio = useCallback(async () => {
    if (!wallet) return;
    try {
      setLoading(true);
      setError(null);
      const [portfolioRes, agentsRes] = await Promise.all([
        fetch(`/api/investor/portfolio?wallet=${encodeURIComponent(wallet)}`),
        fetch('/api/agents'),
      ]);
      if (!portfolioRes.ok) throw new Error('Failed to load portfolio');
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
    } catch (err) {
      console.error(err);
      setError('Could not load portfolio.');
    } finally {
      setLoading(false);
    }
  }, [wallet]);

  useEffect(() => {
    fetchPortfolio();
  }, [fetchPortfolio]);

  const rows = useMemo<PortfolioRow[]>(() => {
    return positions.map((position) => {
      const agent = agentsById[position.agentId];
      const value = holdingValue(position, agent);
      const invested = position.contributed;
      const pnl = value - invested;
      return {
        position,
        agent,
        name: agent?.name ?? `Agent ${position.agentId.slice(0, 8)}`,
        ticker: agent?.ticker ? `$${agent.ticker}` : '—',
        slug: agent?.slug ?? position.agentId,
        logoUrl: agent?.logoUrl || '/investor/brand-icon.png',
        invested,
        balance: position.tokensAllocated,
        value,
        status: rowStatus(position),
        pnl,
        pnlRatio: invested > 0 ? pnl / invested : 0,
      };
    });
  }, [positions, agentsById]);

  const totalInvested = rows.reduce((sum, r) => sum + r.invested, 0);
  const totalHoldings = rows.reduce((sum, r) => sum + r.value, 0);
  const totalBuybacks = buybacks.reduce(
    (sum, b) => sum + parseFloat(b.agentTokensBought.toString()),
    0,
  );
  const unrealizedPnL = totalHoldings - totalInvested;
  const pnlRatio = totalInvested > 0 ? unrealizedPnL / totalInvested : 0;
  const activeCount = rows.filter((r) => r.status === 'Active' || r.status === 'Claimable').length;

  const agentName = useCallback(
    (agentId: string) => agentsById[agentId]?.name ?? `Agent ${agentId.slice(0, 8)}`,
    [agentsById],
  );

  return {
    wallet,
    loading,
    error,
    refresh: fetchPortfolio,
    positions,
    transactions,
    buybacks,
    agentsById,
    rows,
    totalInvested,
    totalHoldings,
    totalBuybacks,
    unrealizedPnL,
    pnlRatio,
    activeCount,
    agentName,
  };
}
