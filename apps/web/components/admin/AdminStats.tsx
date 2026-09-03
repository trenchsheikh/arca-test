'use client';

import { InvestorStatCard } from '@/components/investor/InvestorStatCard';
import type { AdminDashboardStats } from '@/components/admin/useAdminData';

export function AdminStats({ stats }: { stats: AdminDashboardStats }) {
  return (
    <div className="inv-stat-grid">
      <InvestorStatCard
        label="Pending Applications"
        value={String(stats.pendingApplications)}
        hint="8.0% left"
        sparkline="up"
      />
      <InvestorStatCard
        label="Live Agents"
        value={String(stats.liveAgents)}
        hint="92.0% of target"
        sparkline="up"
      />
      <InvestorStatCard
        label="Platform TVL"
        value={stats.platformTvl}
        hint="available for trading"
        sparkline="down"
      />
      <InvestorStatCard
        label="Flagged Transactions"
        value={String(stats.flaggedTransactions)}
        hint="0%"
        tone="down"
        sparkline="down"
      />
    </div>
  );
}
