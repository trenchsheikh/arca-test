'use client';

import { useCallback, useEffect, useState } from 'react';
import { formatCurrency } from '@/lib/format';
import { TierBadge } from '@/components/TierBadge';
import { RequireAuth } from '@/components/RequireAuth';
import type { Agent } from '@/lib/mock-data';
import {
  MdTabs,
  MdPrimaryTab,
  MdOutlinedSelect,
  MdSelectOption,
  MdCheckbox,
  MdFilledButton,
  MdOutlinedButton,
  MdTextButton,
  MdIcon,
  MdList,
  MdListItem,
  MdDivider,
  MdLinearProgress,
} from '@/components/material';

type AdminTab = 'review' | 'ico' | 'analytics' | 'users';
type AppRow = {
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
};

type Analytics = {
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

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<AdminTab>('review');
  const [applications, setApplications] = useState<AppRow[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [tierByApp, setTierByApp] = useState<Record<string, 'Seed' | 'Core' | 'Pro'>>({});
  const [riskByApp, setRiskByApp] = useState<Record<string, 'Low' | 'Medium' | 'High'>>({});
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const decide = async (
    id: string,
    action: 'approve' | 'reject' | 'needsInfo',
  ) => {
    setBusy(id);
    try {
      const body =
        action === 'approve'
          ? {
              action,
              tier: tierByApp[id] || 'Core',
              riskRating: riskByApp[id] || 'Medium',
            }
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

  const setAgentStatus = async (slug: string, status: 'ICO Live' | 'ICO Upcoming') => {
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

  const tabs: { id: AdminTab; label: string; icon: string }[] = [
    { id: 'review', label: 'Review Queue', icon: 'fact_check' },
    { id: 'ico', label: 'ICO Management', icon: 'rocket_launch' },
    { id: 'analytics', label: 'Platform Analytics', icon: 'analytics' },
    { id: 'users', label: 'Users', icon: 'group' },
  ];

  const icoAgents = agents.filter(
    (a) => a.status === 'ICO Live' || a.status === 'ICO Upcoming',
  );

  return (
    <div className="arca-page">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="arca-section-title mb-2">Admin Dashboard</h1>
            <p className="arca-page-lead">
              Review applications, manage ICOs, monitor buybacks
            </p>
          </div>
          <MdOutlinedButton className="hero-cta-outlined" onClick={load}>
            <MdIcon slot="icon">refresh</MdIcon>
            Refresh
          </MdOutlinedButton>
        </div>

        <div className="arca-surface mb-8 overflow-hidden">
          <div className="px-2 pt-2 overflow-x-auto">
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
        </div>

        {activeTab === 'review' && (
          <div className="space-y-4">
            {applications.length === 0 && (
              <div className="arca-surface">
                <MdList>
                  <MdListItem>
                    <MdIcon slot="start">inbox</MdIcon>
                    <div slot="headline">No applications yet</div>
                    <div slot="supporting-text">Submit one via /apply</div>
                  </MdListItem>
                </MdList>
              </div>
            )}
            {applications.map((app) => (
              <div key={app.id} className="arca-surface p-6 space-y-5">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div>
                    <h3 className="font-display font-bold text-chalk text-xl">
                      {app.name}
                    </h3>
                    <p className="text-chalk-dim text-sm">
                      {app.category} · {app.chain} · Status: {app.status}
                    </p>
                    <p className="text-chalk-dim text-sm mt-2">{app.description}</p>
                  </div>
                  <div className="text-sm text-chalk md:text-right shrink-0">
                    <div>FDV {formatCurrency(app.launchFdv)}</div>
                    <div>Raise {formatCurrency(app.raiseTarget)} (10%)</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                  <label className="flex items-center gap-3 text-chalk-dim cursor-pointer">
                    <MdCheckbox />
                    Socials verified
                  </label>
                  <label className="flex items-center gap-3 text-chalk-dim cursor-pointer">
                    <MdCheckbox />
                    Docs reviewed
                  </label>
                  <label className="flex items-center gap-3 text-chalk-dim cursor-pointer">
                    <MdCheckbox checked />
                    Circularity: review required
                  </label>
                </div>

                <div className="flex flex-wrap gap-3 items-end">
                  <MdOutlinedSelect
                    label="Tier"
                    value={tierByApp[app.id] || 'Core'}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    onChange={(e: any) =>
                      setTierByApp((s) => ({
                        ...s,
                        [app.id]: e.target.value as 'Seed' | 'Core' | 'Pro',
                      }))
                    }
                  >
                    <MdSelectOption value="Seed"><div slot="headline">Seed</div></MdSelectOption>
                    <MdSelectOption value="Core"><div slot="headline">Core</div></MdSelectOption>
                    <MdSelectOption value="Pro"><div slot="headline">Pro</div></MdSelectOption>
                  </MdOutlinedSelect>
                  <MdOutlinedSelect
                    label="Risk"
                    value={riskByApp[app.id] || 'Medium'}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    onChange={(e: any) =>
                      setRiskByApp((s) => ({
                        ...s,
                        [app.id]: e.target.value as 'Low' | 'Medium' | 'High',
                      }))
                    }
                  >
                    <MdSelectOption value="Low"><div slot="headline">Low</div></MdSelectOption>
                    <MdSelectOption value="Medium"><div slot="headline">Medium</div></MdSelectOption>
                    <MdSelectOption value="High"><div slot="headline">High</div></MdSelectOption>
                  </MdOutlinedSelect>
                  <MdFilledButton
                    disabled={busy === app.id || app.status === 'Approved'}
                    onClick={() => decide(app.id, 'approve')}
                  >
                    <MdIcon slot="icon">check</MdIcon>
                    Approve with tier
                  </MdFilledButton>
                  <MdOutlinedButton
                    disabled={busy === app.id}
                    onClick={() => decide(app.id, 'reject')}
                  >
                    <MdIcon slot="icon">close</MdIcon>
                    Reject
                  </MdOutlinedButton>
                  <MdTextButton
                    disabled={busy === app.id}
                    onClick={() => decide(app.id, 'needsInfo')}
                  >
                    <MdIcon slot="icon">info</MdIcon>
                    Request more info
                  </MdTextButton>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'ico' && (
          <div className="space-y-4">
            {icoAgents.length === 0 ? (
              <div className="arca-surface">
                <MdList>
                  <MdListItem>
                    <MdIcon slot="start">rocket_launch</MdIcon>
                    <div slot="headline">No ICOs in queue</div>
                    <div slot="supporting-text">
                      Live or upcoming ICOs appear here for management
                    </div>
                  </MdListItem>
                </MdList>
              </div>
            ) : (
              icoAgents.map((agent) => {
                const progress = Math.min(
                  agent.amountRaised / agent.raiseTarget,
                  1,
                );
                return (
                  <div key={agent.id} className="arca-surface p-6 space-y-4">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                          <h3 className="font-display font-bold text-chalk text-xl">
                            {agent.name}
                          </h3>
                          <TierBadge tier={agent.tier} />
                          <span className="text-chalk-dim text-sm">
                            {agent.status}
                          </span>
                        </div>
                        <p className="text-chalk-dim text-sm mb-3">
                          Raised {formatCurrency(agent.amountRaised)} /{' '}
                          {formatCurrency(agent.raiseTarget)} · threshold{' '}
                          {(agent.raiseThreshold * 100).toFixed(0)}%
                        </p>
                        <MdLinearProgress
                          value={progress}
                          max={1}
                          style={{ width: '100%', height: 6 }}
                        />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {agent.status === 'ICO Upcoming' && (
                          <MdFilledButton
                            disabled={busy === agent.slug}
                            onClick={() => setAgentStatus(agent.slug, 'ICO Live')}
                          >
                            <MdIcon slot="icon">play_arrow</MdIcon>
                            Set Live
                          </MdFilledButton>
                        )}
                        {agent.status === 'ICO Live' && (
                          <>
                            <MdFilledButton
                              disabled={busy === agent.slug}
                              onClick={() => finalize(agent.slug, true)}
                            >
                              <MdIcon slot="icon">verified</MdIcon>
                              Finalize Success
                            </MdFilledButton>
                            <MdOutlinedButton
                              disabled={busy === agent.slug}
                              onClick={() => finalize(agent.slug, false)}
                            >
                              <MdIcon slot="icon">cancel</MdIcon>
                              Cancel & Refund
                            </MdOutlinedButton>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {activeTab === 'analytics' && analytics && (
          <div className="space-y-6">
            <div className="arca-surface overflow-hidden">
              <MdList>
                {[
                  ['Total Revenue', formatCurrency(analytics.totalRevenue), 'payments'],
                  ['Total Raised', formatCurrency(analytics.totalRaised), 'savings'],
                  ['Buybacks', String(analytics.totalBuybacks), 'autorenew'],
                  [
                    'Treasury Fees',
                    formatCurrency(analytics.feeRevenue),
                    'account_balance',
                  ],
                ].map(([label, value, icon], idx) => (
                  <div key={label}>
                    {idx > 0 && <MdDivider />}
                    <MdListItem>
                      <MdIcon slot="start">{icon}</MdIcon>
                      <div slot="overline">{label}</div>
                      <div slot="headline">{value}</div>
                    </MdListItem>
                  </div>
                ))}
              </MdList>
            </div>

            <div className="arca-surface p-6 buyback-glow border-brand/30">
              <h3 className="font-display font-bold text-chalk text-lg mb-4">
                Buyback Engine Health
              </h3>
              <MdList>
                <MdListItem>
                  <MdIcon slot="start">schedule</MdIcon>
                  <div slot="overline">Last success</div>
                  <div slot="headline">
                    {analytics.buybackHealth.lastSuccessAt
                      ? new Date(
                          analytics.buybackHealth.lastSuccessAt,
                        ).toLocaleString()
                      : 'n/a'}
                  </div>
                </MdListItem>
                <MdDivider />
                <MdListItem>
                  <MdIcon slot="start">error</MdIcon>
                  <div slot="overline">Failures</div>
                  <div slot="headline">{analytics.buybackHealth.failures}</div>
                </MdListItem>
                <MdDivider />
                <MdListItem>
                  <MdIcon slot="start">speed</MdIcon>
                  <div slot="overline">Indexer lag</div>
                  <div slot="headline">
                    {analytics.buybackHealth.lagSeconds}s
                  </div>
                </MdListItem>
              </MdList>
            </div>

            <div className="arca-surface overflow-hidden">
              <MdList>
                <MdListItem>
                  <MdIcon slot="start">group</MdIcon>
                  <div slot="overline">Active investors</div>
                  <div slot="headline">{analytics.activeInvestors}</div>
                </MdListItem>
                <MdDivider />
                <MdListItem>
                  <MdIcon slot="start">rocket_launch</MdIcon>
                  <div slot="overline">Active deployers</div>
                  <div slot="headline">{analytics.activeDeployers}</div>
                </MdListItem>
              </MdList>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="arca-surface p-6">
            <h3 className="font-display font-bold text-chalk text-lg mb-4">Users</h3>
            <MdList>
              <MdListItem>
                <MdIcon slot="start">account_balance_wallet</MdIcon>
                <div slot="headline">Demo investor wallet</div>
                <div slot="supporting-text">
                  0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
                </div>
              </MdListItem>
              <MdDivider />
              <MdListItem>
                <MdIcon slot="start">group</MdIcon>
                <div slot="headline">
                  Investors: {analytics?.activeInvestors ?? 'n/a'}
                </div>
                <div slot="supporting-text">
                  Deployers: {analytics?.activeDeployers ?? 'n/a'}
                </div>
              </MdListItem>
            </MdList>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <RequireAuth title="Sign In To Access Admin">
      <AdminDashboard />
    </RequireAuth>
  );
}
