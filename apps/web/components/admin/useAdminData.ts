'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Agent } from '@/lib/mock-data';
import { formatCompactCurrency, formatUsd } from '@/lib/format';

export type AppRow = {
  id: string;
  name: string;
  description: string;
  category: string;
  chain: string;
  launchFdv: number;
  raiseTarget: number;
  status: string;
  revenueWallet: string;
  website?: string;
  docs?: string;
  twitter?: string;
  team: { name: string; role: string }[];
  createdAt?: string | Date;
  updatedAt?: string | Date;
};

export type AdminAnalytics = {
  totalRevenue: number;
  totalRaised: number;
  totalBuybacks: number;
  platformBuybackVolume: number;
  activeInvestors: number;
  activeDeployers: number;
  feeRevenue: number;
  buybackHealth: {
    lastSuccessAt: string | Date | null;
    failures: number;
    lagSeconds: number;
  };
};

export type AdminDashboardStats = {
  pendingApplications: number;
  liveAgents: number;
  platformTvl: string;
  flaggedTransactions: number;
};

export type WalletRow = {
  id: string;
  wallet: string;
  role: string;
  joined: string;
  total: string;
  status: string;
  agentsBacked: number;
};

export type RaiseRow = {
  id: string;
  agent: string;
  ticker: string;
  target: string;
  raised: string;
  progress: number;
  status: string;
  investors: number;
};

export type BuybackRowRow = {
  id: string;
  agent: string;
  date: string;
  trigger: string;
  revenue: string;
  buybackAmt: string;
  health: string;
};

export type TxRow = {
  id: string;
  type: string;
  agent: string;
  amount: string;
  txHash: string;
  time: string;
  status: string;
  flagged: boolean;
};

const PLACEHOLDER_WALLETS: WalletRow[] = [
  {
    id: 'w1',
    wallet: '0x4f2…9a2c',
    role: 'Investor',
    joined: 'Jun 2, 2026',
    total: '$128,400',
    status: 'Active',
    agentsBacked: 5,
  },
  {
    id: 'w2',
    wallet: '0x8a1…3c7e',
    role: 'Investor',
    joined: 'May 18, 2026',
    total: '$64,200',
    status: 'Active',
    agentsBacked: 3,
  },
  {
    id: 'w3',
    wallet: '0x2b9…f01d',
    role: 'Deployer',
    joined: 'Apr 9, 2026',
    total: '$0',
    status: 'Active',
    agentsBacked: 1,
  },
  {
    id: 'w4',
    wallet: '0x7c4…aa12',
    role: 'Investor',
    joined: 'Mar 22, 2026',
    total: '$12,800',
    status: 'Active',
    agentsBacked: 2,
  },
  {
    id: 'w5',
    wallet: '0xd01…88bf',
    role: 'Investor',
    joined: 'Feb 14, 2026',
    total: '$250,000',
    status: 'Active',
    agentsBacked: 8,
  },
];

const PLACEHOLDER_TX: TxRow[] = [
  {
    id: 't1',
    type: 'Contribution',
    agent: 'Elvis',
    amount: '$2,500',
    txHash: '0x9f2a…c41e',
    time: '2h ago',
    status: 'Confirmed',
    flagged: false,
  },
  {
    id: 't2',
    type: 'Buyback',
    agent: 'Nimbus Yield',
    amount: '$1,200',
    txHash: '0x71bc…90aa',
    time: '5h ago',
    status: 'Confirmed',
    flagged: false,
  },
  {
    id: 't3',
    type: 'Withdrawal',
    agent: 'Helix Desk',
    amount: '$8,400',
    txHash: '0x3aad…12f0',
    time: '1d ago',
    status: 'Flagged',
    flagged: true,
  },
  {
    id: 't4',
    type: 'Fee',
    agent: 'Platform',
    amount: '$420',
    txHash: '0x55e1…77cd',
    time: '1d ago',
    status: 'Confirmed',
    flagged: false,
  },
  {
    id: 't5',
    type: 'Refund',
    agent: 'Orbit AI',
    amount: '$1,000',
    txHash: '0xab90…6e21',
    time: '2d ago',
    status: 'Flagged',
    flagged: true,
  },
];

function formatSubmitted(value?: string | Date): string {
  if (!value) return '—';
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function useAdminData() {
  const [applications, setApplications] = useState<AppRow[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [appsRes, agentsRes, analyticsRes] = await Promise.all([
        fetch('/api/applications'),
        fetch('/api/agents'),
        fetch('/api/admin/analytics'),
      ]);
      const appsJson = await appsRes.json();
      const agentsJson = await agentsRes.json();
      const analyticsJson = await analyticsRes.json();
      setApplications(appsJson.applications || []);
      setAgents(agentsJson.agents || []);
      setAnalytics(analyticsJson.analytics || analyticsJson);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const pendingApps = useMemo(
    () =>
      applications.filter(
        (a) =>
          a.status === 'Submitted' ||
          a.status === 'UnderReview' ||
          a.status === 'NeedsInfo' ||
          a.status === 'Pending',
      ),
    [applications],
  );

  const icoAgents = useMemo(
    () =>
      agents.filter(
        (a) => a.status === 'ICO Live' || a.status === 'ICO Upcoming',
      ),
    [agents],
  );

  const liveAgents = useMemo(
    () =>
      agents.filter(
        (a) =>
          a.status === 'Trading' ||
          a.status === 'ICO Live' ||
          a.status === 'ICO Upcoming',
      ).length,
    [agents],
  );

  const stats: AdminDashboardStats = useMemo(() => {
    const tvl =
      analytics?.totalRaised != null
        ? formatCompactCurrency(analytics.totalRaised || 41_200_000)
        : '$41.2M';
    return {
      pendingApplications: pendingApps.length || 7,
      liveAgents: liveAgents || 86,
      platformTvl: analytics?.totalRaised ? tvl : '$41.2M',
      flaggedTransactions: 2,
    };
  }, [analytics, liveAgents, pendingApps.length]);

  const applicationRows = useMemo(() => {
    const source =
      applications.length > 0
        ? applications
        : [
            {
              id: 'demo-1',
              name: 'Rho North Labs',
              description: '',
              category: 'DeFi',
              chain: 'solana',
              launchFdv: 18_000_000,
              raiseTarget: 1_800_000,
              status: 'Pending',
              revenueWallet: '',
              team: [],
              createdAt: '2026-08-20',
            },
            {
              id: 'demo-2',
              name: 'Rho North Labs',
              description: '',
              category: 'DeFi',
              chain: 'solana',
              launchFdv: 18_000_000,
              raiseTarget: 1_800_000,
              status: 'Pending',
              revenueWallet: '',
              team: [],
              createdAt: '2026-08-20',
            },
            {
              id: 'demo-3',
              name: 'Rho North Labs',
              description: '',
              category: 'DeFi',
              chain: 'solana',
              launchFdv: 18_000_000,
              raiseTarget: 1_800_000,
              status: 'Pending',
              revenueWallet: '',
              team: [],
              createdAt: '2026-08-20',
            },
          ];

    return source.map((app) => ({
      ...app,
      agentName: app.name.includes('Rho') ? 'Nimbus Yield' : app.name,
      targetLabel: formatUsd(app.raiseTarget || app.launchFdv * 0.1, 0),
      submittedLabel: formatSubmitted(app.createdAt || app.updatedAt),
      raiseDate: formatSubmitted(app.createdAt || '2026-08-20'),
    }));
  }, [applications]);

  const raiseRows: RaiseRow[] = useMemo(() => {
    const source = agents.length > 0 ? agents : [];
    if (source.length === 0) {
      return [
        {
          id: 'r1',
          agent: 'Elvis',
          ticker: 'ELVIS',
          target: '$50,000',
          raised: '$46,000',
          progress: 92,
          status: 'ICO Live',
          investors: 128,
        },
        {
          id: 'r2',
          agent: 'Nimbus Yield',
          ticker: 'NIM',
          target: '$1,800,000',
          raised: '$420,000',
          progress: 23,
          status: 'ICO Upcoming',
          investors: 41,
        },
        {
          id: 'r3',
          agent: 'Helix Desk',
          ticker: 'HELX',
          target: '$250,000',
          raised: '$250,000',
          progress: 100,
          status: 'Trading',
          investors: 312,
        },
      ];
    }
    return source.map((agent) => {
      const progress =
        agent.raiseTarget > 0
          ? Math.min(100, Math.round((agent.amountRaised / agent.raiseTarget) * 100))
          : 0;
      return {
        id: agent.id,
        agent: agent.name,
        ticker: agent.ticker,
        target: formatUsd(agent.raiseTarget, 0),
        raised: formatUsd(agent.amountRaised, 0),
        progress,
        status: agent.status,
        investors: Math.max(1, Math.round(agent.amountRaised / 2500)),
      };
    });
  }, [agents]);

  const buybackRows: BuybackRowRow[] = useMemo(() => {
    const trading = agents.filter((a) => a.status === 'Trading').slice(0, 6);
    if (trading.length === 0) {
      return [
        {
          id: 'b1',
          agent: 'Helix Desk',
          date: 'Sep 1, 2026',
          trigger: 'Threshold',
          revenue: '$12,400',
          buybackAmt: '$6,200',
          health: 'Healthy',
        },
        {
          id: 'b2',
          agent: 'Orbit AI',
          date: 'Aug 28, 2026',
          trigger: 'Manual',
          revenue: '$4,100',
          buybackAmt: '$2,050',
          health: 'Healthy',
        },
        {
          id: 'b3',
          agent: 'Nimbus Yield',
          date: 'Aug 20, 2026',
          trigger: 'Threshold',
          revenue: '$9,800',
          buybackAmt: '$4,900',
          health: 'Lagging',
        },
      ];
    }
    return trading.map((agent, idx) => ({
      id: agent.id,
      agent: agent.name,
      date: formatSubmitted(new Date(Date.now() - idx * 86_400_000 * 3)),
      trigger: idx % 2 === 0 ? 'Threshold' : 'Manual',
      revenue: formatUsd(agent.totalRevenue || 4_100 + idx * 800, 0),
      buybackAmt: formatUsd((agent.totalRevenue || 4_100) * 0.5, 0),
      health:
        analytics?.buybackHealth.failures && analytics.buybackHealth.failures > 0
          ? 'Lagging'
          : 'Healthy',
    }));
  }, [agents, analytics]);

  const decide = async (
    id: string,
    action: 'approve' | 'reject' | 'needsInfo',
  ) => {
    if (id.startsWith('demo-')) return;
    setBusy(id);
    try {
      const body =
        action === 'approve'
          ? { action, tier: 'Core', riskRating: 'Medium' }
          : { action };
      const res = await fetch(`/api/applications/${id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(await res.text());
      await load();
    } catch (e) {
      alert(`Action failed: ${e}`);
    } finally {
      setBusy(null);
    }
  };

  const setAgentStatus = async (
    slug: string,
    status: 'ICO Live' | 'ICO Upcoming',
  ) => {
    setBusy(slug);
    try {
      const res = await fetch(`/api/agents/${slug}/status`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error(await res.text());
      await load();
    } catch (e) {
      alert(`Status update failed: ${e}`);
    } finally {
      setBusy(null);
    }
  };

  const finalize = async (slug: string, success: boolean) => {
    setBusy(slug);
    try {
      const res = await fetch(`/api/agents/${slug}/finalize`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ success }),
      });
      if (!res.ok) throw new Error(await res.text());
      await load();
    } catch (e) {
      alert(`Finalize failed: ${e}`);
    } finally {
      setBusy(null);
    }
  };

  return {
    loading,
    busy,
    load,
    stats,
    pendingCount: pendingApps.length || 2,
    applications: applicationRows,
    icoAgents,
    agents,
    analytics,
    wallets: PLACEHOLDER_WALLETS,
    raiseRows,
    buybackRows,
    transactions: PLACEHOLDER_TX,
    decide,
    setAgentStatus,
    finalize,
  };
}
