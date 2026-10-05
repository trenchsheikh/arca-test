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

  const launchedAgents = useMemo(
    () => agents.filter((agent) => agent.id.startsWith('agent-')),
    [agents],
  );

  const icoAgents = useMemo(
    () =>
      launchedAgents.filter(
        (a) => a.status === 'ICO Live' || a.status === 'ICO Upcoming',
      ),
    [launchedAgents],
  );

  const liveAgents = useMemo(
    () =>
      launchedAgents.filter(
        (a) =>
          a.status === 'Trading' ||
          a.status === 'ICO Live' ||
          a.status === 'ICO Upcoming',
      ).length,
    [launchedAgents],
  );

  const raisedCapital = useMemo(
    () => launchedAgents.reduce((sum, agent) => sum + (agent.amountRaised || 0), 0),
    [launchedAgents],
  );

  const stats: AdminDashboardStats = useMemo(() => {
    return {
      pendingApplications: pendingApps.length,
      liveAgents,
      platformTvl: formatCompactCurrency(raisedCapital),
      flaggedTransactions: 0,
    };
  }, [liveAgents, pendingApps.length, raisedCapital]);

  const applicationRows = useMemo(() => {
    return applications.map((app) => ({
      ...app,
      agentName: app.name.includes('Rho') ? 'Nimbus Yield' : app.name,
      targetLabel: formatUsd(app.raiseTarget || app.launchFdv * 0.1, 0),
      submittedLabel: formatSubmitted(app.createdAt || app.updatedAt),
      raiseDate: formatSubmitted(app.createdAt || app.updatedAt),
    }));
  }, [applications]);

  const raiseRows: RaiseRow[] = useMemo(() => {
    return launchedAgents.map((agent) => {
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
        investors: 0,
      };
    });
  }, [launchedAgents]);

  const buybackRows: BuybackRowRow[] = useMemo(() => [], []);

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
    pendingCount: pendingApps.length,
    applications: applicationRows,
    icoAgents,
    agents,
    analytics,
    wallets: [] as WalletRow[],
    raiseRows,
    buybackRows,
    transactions: [] as TxRow[],
    decide,
    setAgentStatus,
    finalize,
  };
}
