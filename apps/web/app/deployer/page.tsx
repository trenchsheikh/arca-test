'use client';

import Image from 'next/image';
import { InvestorStatCard } from '@/components/investor/InvestorStatCard';
import {
  InvestorTableChrome,
  SortHeader,
} from '@/components/investor/InvestorTableChrome';
import { RequireAuth } from '@/components/RequireAuth';
import { DeployerShell } from '@/components/deployer/DeployerShell';
import { DeployerPageHeader } from '@/components/deployer/DeployerPageHeader';
import {
  BuybackEngineCard,
  FeeRevenueCard,
} from '@/components/deployer/DeployerPanels';
import { useDeployerData } from '@/components/deployer/useDeployerData';

function DashboardView() {
  const data = useDeployerData();

  return (
    <DeployerShell crumb="Dashboard">
      <DeployerPageHeader
        title="Welcome back, Pankaj!"
        subtitle="Monitor your agent's capital, revenue, and buyback performance"
      />

      <div className="inv-stat-grid">
        <InvestorStatCard
          label="Raise Progress"
          value={`${data.raiseProgress.toFixed(1)}%`}
          hint="8.0% left"
          sparkline="up"
        />
        <InvestorStatCard
          label="Capital Raised"
          value={data.capitalRaised}
          hint="92.0% of target"
          sparkline="up"
        />
        <InvestorStatCard
          label="Operational Wallet"
          value={data.operationalWallet}
          hint="available for trading"
          sparkline="down"
        />
        <InvestorStatCard
          label="Revenue Generated"
          value={data.revenueGenerated}
          hint="0%"
          sparkline="down"
        />
      </div>

      <div className="dep-mid-grid">
        <BuybackEngineCard />
        <FeeRevenueCard />
      </div>

      <InvestorTableChrome title="Transactions">
        <table className="inv-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Amount</th>
              <th>
                <SortHeader label="Tx Hash" />
              </th>
              <th>Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {data.transactions.slice(0, 3).map((row) => (
              <tr key={row.id}>
                <td>{row.type}</td>
                <td>{row.amount}</td>
                <td className="inv-cell-dim">{row.txHash}</td>
                <td className="inv-cell-dim">{row.time}</td>
                <td>
                  <div className="inv-status-cell">
                    <span className="inv-status-pill">{row.status}</span>
                    <button
                      type="button"
                      className="inv-row-more"
                      aria-label="More actions"
                    >
                      <Image
                        src="/deployer/icon-more.svg"
                        alt=""
                        width={16}
                        height={16}
                      />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </InvestorTableChrome>
    </DeployerShell>
  );
}

export default function DeployerDashboardPage() {
  return (
    <RequireAuth title="Sign In To Access Deployer Dashboard">
      <DashboardView />
    </RequireAuth>
  );
}
