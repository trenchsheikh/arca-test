'use client';

import { InvestorStatCard } from '@/components/investor/InvestorStatCard';
import {
  InvestorTableChrome,
  SortHeader,
} from '@/components/investor/InvestorTableChrome';
import { RequireAuth } from '@/components/RequireAuth';
import { DeployerShell } from '@/components/deployer/DeployerShell';
import { DeployerPageHeader } from '@/components/deployer/DeployerPageHeader';
import {
  MonthlyReturnChart,
  RiskExposureCard,
} from '@/components/deployer/DeployerPanels';
import { useDeployerData } from '@/components/deployer/useDeployerData';

function PerformanceView() {
  const data = useDeployerData();
  const { performanceStats } = data;

  return (
    <DeployerShell crumb="Performance">
      <DeployerPageHeader
        title="Performance"
        subtitle={data.raiseMeta}
        status={data.raiseStatus}
      />

      <div className="inv-stat-grid">
        <InvestorStatCard
          label="Win Rate"
          value={performanceStats.winRate}
          hint="8.0% left"
          sparkline="up"
        />
        <InvestorStatCard
          label="Avg. Monthly Return"
          value={performanceStats.avgMonthlyReturn}
          hint="92.0% of target"
          sparkline="up"
        />
        <InvestorStatCard
          label="Trading Volume"
          value={performanceStats.tradingVolume}
          hint="available for trading"
          sparkline="up"
        />
        <InvestorStatCard
          label="Total Positions"
          value={performanceStats.totalPositions}
          hint="0%"
          sparkline="up"
        />
      </div>

      <div className="dep-perf-grid">
        <MonthlyReturnChart />
        <RiskExposureCard />
      </div>

      <InvestorTableChrome title="Open Positions">
        <table className="inv-table">
          <thead>
            <tr>
              <th>Pair</th>
              <th>Side</th>
              <th>
                <SortHeader label="Size" />
              </th>
              <th>
                <SortHeader label="Entry" />
              </th>
              <th>
                <SortHeader label="PnL" />
              </th>
              <th>Opened</th>
            </tr>
          </thead>
          <tbody>
            {data.openPositions.map((row) => (
              <tr key={row.id}>
                <td>{row.pair}</td>
                <td>{row.side}</td>
                <td>{row.size}</td>
                <td>{row.entry}</td>
                <td className={row.pnl >= 0 ? 'is-up' : 'is-down'}>
                  {row.pnl >= 0 ? '+' : '-'}${Math.abs(row.pnl).toLocaleString()}
                </td>
                <td className="inv-cell-dim">{row.opened}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </InvestorTableChrome>
    </DeployerShell>
  );
}

export default function DeployerPerformancePage() {
  return (
    <RequireAuth title="Sign In To Access Deployer Dashboard">
      <PerformanceView />
    </RequireAuth>
  );
}
