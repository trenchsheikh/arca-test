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

function BuybackView() {
  const { loading, pendingCount, buybackRows } = useAdminData();

  return (
    <AdminShell crumb="Buyback Engine">
      <AdminPageHeader
        title="Buyback engine"
        badge={`${pendingCount} pending review`}
      />

      <div className="inv-stat-grid">
        <InvestorStatCard
          label="Buyback Events"
          value="0"
          hint="No events yet"
        />
        <InvestorStatCard
          label="Buyback Volume"
          value="0"
          hint="No tokens acquired"
        />
        <InvestorStatCard
          label="Fee Revenue"
          value="$0"
          hint="No treasury share yet"
        />
        <InvestorStatCard
          label="Indexer Lag"
          value="—"
          hint="No buybacks recorded"
        />
      </div>

      <InvestorTableChrome title="Buyback activity">
        {loading ? (
          <div className="inv-table-empty">
            <LoadingState label="Loading buybacks…" />
          </div>
        ) : buybackRows.length === 0 ? (
          <p className="inv-table-empty">No buyback activity yet.</p>
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
    <RequireAuth admin title="Sign In To Access Admin">
      <BuybackView />
    </RequireAuth>
  );
}
