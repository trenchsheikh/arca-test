'use client';

export type DeployerTransaction = {
  id: string;
  type: string;
  amount: string;
  txHash: string;
  time: string;
  status: 'Confirmed' | 'Pending' | 'Failed';
};

export type OpenPosition = {
  id: string;
  pair: string;
  side: 'Long' | 'Short';
  size: string;
  entry: string;
  pnl: number;
  opened: string;
};

export type BuybackHistoryRow = {
  id: string;
  date: string;
  trigger: string;
  revenue: string;
  buybackAmt: string;
  tokensBought: string;
  tx: string;
};

/**
 * New wallets have no launched agent. Pages render these zeros and empty
 * lists until a real agent is attached to the connected wallet.
 */
export function useDeployerData() {
  return {
    hasAgent: false,
    agentName: 'No agent',
    agentStatus: 'Not launched',
    ticker: '—',
    raiseProgress: 0,
    capitalRaised: '$0',
    operationalWallet: '$0',
    revenueGenerated: '$0',
    raiseMeta: 'Launch an agent to see capital, revenue, and buybacks.',
    raiseStatus: undefined as string | undefined,
    buybackSplit: {
      buybackPct: 0,
      deployerPct: 0,
      buybackUsd: '$0',
      deployerUsd: '$0',
    },
    buybackMetrics: [
      { value: '—', label: 'Tokens bought back' },
      { value: '$0', label: 'Last buyback' },
      { value: '$0', label: 'Avg. buyback size' },
      { value: '0%', label: 'Avg monthly return' },
      { value: '$0', label: 'Current token price' },
    ],
    feeRevenue: {
      total: '$0',
      delta: 'No revenue yet',
      stats: [
        { value: '$0', label: 'Trading volume 30d' },
        { value: '0', label: 'Total positions' },
        { value: '0%', label: 'Win rate' },
        { value: '0', label: 'Circulating supply' },
        { value: '0%', label: 'Avg monthly return' },
        { value: '$0', label: 'Current token price' },
      ],
    },
    performanceStats: {
      winRate: '0%',
      avgMonthlyReturn: '0%',
      tradingVolume: '$0',
      totalPositions: '0',
    },
    riskExposure: [] as { label: string; value: string }[],
    exposureSplit: { long: 0, short: 0 },
    monthlyReturns: [] as { month: string; value: number }[],
    engineParams: [] as { label: string; value: string }[],
    lifetimeTotals: {
      routed: '$0',
      tokensBought: '0',
      events: '0',
      avgSize: '$0',
    },
    settings: {
      connected: false,
      apiKey: '',
      webhookUrl: '',
      notifications: [
        { id: 'all', label: 'All', on: false },
        { id: 'email', label: 'Email Alerts', on: false },
        { id: 'buyback', label: 'Buyback Alerts', on: false },
        { id: 'weekly', label: 'Weekly Report', on: false },
        { id: 'price', label: 'Price Alerts', on: false },
      ],
    },
    transactions: [] as DeployerTransaction[],
    openPositions: [] as OpenPosition[],
    buybackHistory: [] as BuybackHistoryRow[],
  };
}
