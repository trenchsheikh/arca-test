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

const MONTHLY_RETURNS = [
  { month: 'JAN', value: 2.1 },
  { month: 'FEB', value: 3.4 },
  { month: 'MAR', value: 4.2 },
  { month: 'APR', value: 5.1 },
  { month: 'MAY', value: -3.6 },
  { month: 'JUN', value: 6.0 },
  { month: 'JUL', value: 7.8 },
  { month: 'AUG', value: 10.8 },
  { month: 'SEP', value: 8.2 },
  { month: 'OCT', value: 6.5 },
  { month: 'NOV', value: 7.1 },
  { month: 'DEC', value: 7.2 },
];

const TRANSACTIONS: DeployerTransaction[] = Array.from({ length: 6 }, (_, i) => ({
  id: `tx-${i}`,
  type: 'Buyback',
  amount: '$4,120 → 2,239 $HELX',
  txHash: '0x8a2...F31',
  time: '12 min ago',
  status: 'Confirmed' as const,
}));

const OPEN_POSITIONS: OpenPosition[] = [
  {
    id: 'pos-1',
    pair: 'ETH-PERP',
    side: 'Long',
    size: '$84,200',
    entry: '$3,412',
    pnl: 2140,
    opened: '2h ago',
  },
  {
    id: 'pos-2',
    pair: 'ETH-PERP',
    side: 'Long',
    size: '$84,200',
    entry: '$3,412',
    pnl: -2240,
    opened: '2h ago',
  },
];

const BUYBACK_HISTORY: BuybackHistoryRow[] = Array.from({ length: 3 }, (_, i) => ({
  id: `bb-${i}`,
  date: 'Aug 22, 2026',
  trigger: 'Threshold ($2K)',
  revenue: '$12,400',
  buybackAmt: '$11,160',
  tokensBought: '6,065',
  tx: '0x8a2...f31',
}));

export function useDeployerData() {
  return {
    agentName: 'Elvis',
    agentStatus: 'Trading · ICO Live',
    ticker: '$HELX',
    raiseProgress: 92,
    capitalRaised: '$46K',
    operationalWallet: '$0',
    revenueGenerated: '$0',
    raiseMeta: 'Trading · Base · 80% of $3.0M target',
    raiseStatus: 'Raising' as const,
    buybackSplit: {
      buybackPct: 90,
      deployerPct: 10,
      buybackUsd: '$312K',
      deployerUsd: '$34.7K',
    },
    buybackMetrics: [
      { value: '$HELX', label: 'Tokens bought back' },
      { value: '$4,120', label: 'Last buyback' },
      { value: '$4,216', label: 'Avg. buyback size' },
      { value: '0', label: 'Avg Monthly Return' },
      { value: '$0', label: 'Current Token Price' },
    ],
    feeRevenue: {
      total: '$34,720',
      delta: '+12.1% vs last 30d',
      stats: [
        { value: '$12.4M', label: 'Trading volume 30d' },
        { value: '1,204', label: 'Total positions' },
        { value: '68%', label: 'Win rate' },
        { value: '3.2M', label: 'Circulating supply' },
        { value: '0', label: 'Avg Monthly Return' },
        { value: '$0', label: 'Current Token Price' },
      ],
    },
    performanceStats: {
      winRate: '68%',
      avgMonthlyReturn: '+7.2%',
      tradingVolume: '$12.4M',
      totalPositions: '1,204',
    },
    riskExposure: [
      { label: 'Max drawdown', value: '$12.4M' },
      { label: 'Sharpe ratio', value: '2.1' },
      { label: 'Avg. position duration', value: '6h 40m' },
      { label: 'Best month', value: 'Aug +10.8%' },
      { label: 'Worst month', value: 'May -3.6%' },
    ],
    exposureSplit: { long: 62, short: 38 },
    monthlyReturns: MONTHLY_RETURNS,
    engineParams: [
      { label: 'Revenue split', value: '90% buyback / 10% deployer' },
      { label: 'Trigger threshold', value: '$2,000 pending revenue' },
      { label: 'Execution venue', value: 'Base — native DEX router' },
      { label: 'Max slippage', value: '0.8%' },
      { label: 'Contract', value: '0x71a...40cE' },
    ],
    lifetimeTotals: {
      routed: '$312,000',
      tokensBought: '169,565 $HELX',
      events: '74',
      avgSize: '$4,216',
    },
    settings: {
      apiKey: '••••••••••••sk-3f2a',
      webhookUrl: 'https://hooks.arca.ai/deploy/elvis',
      notifications: [
        { id: 'all', label: 'All', on: true },
        { id: 'email', label: 'Email Alerts', on: true },
        { id: 'buyback', label: 'Buyback Alerts', on: true },
        { id: 'weekly', label: 'Weekly Report', on: true },
        { id: 'price', label: 'Price Alerts', on: true },
      ],
    },
    transactions: TRANSACTIONS,
    openPositions: OPEN_POSITIONS,
    buybackHistory: BUYBACK_HISTORY,
  };
}
