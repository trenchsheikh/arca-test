'use client';

import { RequireAuth } from '@/components/RequireAuth';
import { LoadingState } from '@/components/LoadingState';
import { InvestorStatCard } from '@/components/investor/InvestorStatCard';
import {
  InvestorTableChrome,
  SortHeader,
} from '@/components/investor/InvestorTableChrome';
import { AdminShell } from '@/components/admin/AdminShell';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { useAdminData } from '@/components/admin/useAdminData';
import { formatCompactCurrency, formatCommaNumber } from '@/lib/format';

function BuybackView() {
  const { loading, pendingCount, analytics, buybackRows } = useAdminData();

  const lastSuccess = analytics?.buybackHealth.lastSuccessAt
    ? new Date(analytics.buybackHealth.lastSuccessAt).toLocaleString()
    : 'n/a';

  return (
    <AdminShell crumb="Buyback Engine">
      <AdminPageHeader
        title="Buyback engine"
        badge={`${pendingCount} pending review`}
      />

      <div className="inv-stat-grid">
        <InvestorStatCard
          label="Buyback Events"
          value={String(analytics?.totalBuybacks ?? 24)}
          hint="platform-wide"
          sparkline="up"
        />
        <InvestorStatCard
          label="Buyback Volume"
          value={
            analytics?.platformBuybackVolume != null
              ? formatCommaNumber(analytics.platformBuybackVolume)
              : '128.4K'
          }
          hint="tokens acquired"
          sparkline="up"
        />
        <InvestorStatCard
          label="Fee Revenue"
          value={
            analytics?.feeRevenue != null
              ? formatCompactCurrency(analytics.feeRevenue)
              : '$12.4K'
          }
          hint="treasury share"
          sparkline="down"
        />
        <InvestorStatCard
          label="Indexer Lag"
          value={`${analytics?.buybackHealth.lagSeconds ?? 5}s`}
          hint={`last success ${lastSuccess}`}
          sparkline="down"
        />
      </div>

      <InvestorTableChrome title="Buyback activity">
        {loading ? (
          <div className="inv-table-empty">
            <LoadingState label="Loading buybacks…" />
          </div>
        ) : (
          <table className="inv-table">
            <thead>
              <tr>
                <th>Agent</th>
                <th>Date</th>
                <th>Trigger</th>
                <th>
                  <SortHeader label="Revenue" />
                </th>
                <th>
                  <SortHeader label="Buyback Amt." />
                </th>
                <th>Health</th>
              </tr>
            </thead>
            <tbody>
              {buybackRows.map((row) => (
                <tr key={row.id}>
                  <td>{row.agent}</td>
                  <td className="inv-cell-dim">{row.date}</td>
                  <td>{row.trigger}</td>
                  <td>{row.revenue}</td>
                  <td>{row.buybackAmt}</td>
                  <td>
                    <span
                      className={`adm-status-pill${
                        row.health === 'Healthy' ? ' is-active' : ''
                      }`}
                    >
                      {row.health}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </InvestorTableChrome>
    </AdminShell>
  );
}

export default function AdminBuybackPage() {
  return (
    <RequireAuth title="Sign In To Access Admin">
      <BuybackView />
    </RequireAuth>
  );
}
