'use client';

import { RequireAuth } from '@/components/RequireAuth';
import { LoadingState } from '@/components/LoadingState';
import {
  InvestorTableChrome,
  SortHeader,
} from '@/components/investor/InvestorTableChrome';
import { AdminShell } from '@/components/admin/AdminShell';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminStats } from '@/components/admin/AdminStats';
import { useAdminData } from '@/components/admin/useAdminData';

function RaisesView() {
  const { loading, stats, pendingCount, raiseRows } = useAdminData();

  return (
    <AdminShell crumb="Raises">
      <AdminPageHeader
        title="Raises"
        badge={`${pendingCount} pending review`}
      />
      <AdminStats stats={stats} />

      <InvestorTableChrome title="Platform raises">
        {loading ? (
          <div className="inv-table-empty">
            <LoadingState label="Loading raises…" />
          </div>
        ) : (
          <table className="inv-table">
            <thead>
              <tr>
                <th>Agent</th>
                <th>Ticker</th>
                <th>
                  <SortHeader label="Target" />
                </th>
                <th>
                  <SortHeader label="Raised" />
                </th>
                <th>Progress</th>
                <th>Status</th>
                <th>
                  <SortHeader label="Investors" />
                </th>
              </tr>
            </thead>
            <tbody>
              {raiseRows.map((row) => (
                <tr key={row.id}>
                  <td>{row.agent}</td>
                  <td className="inv-cell-mono">{row.ticker}</td>
                  <td>{row.target}</td>
                  <td>{row.raised}</td>
                  <td>
                    <div className="adm-progress-row">
                      <div className="adm-progress-track" aria-hidden>
                        <div
                          className="adm-progress-fill"
                          style={{ width: `${row.progress}%` }}
                        />
                      </div>
                      <span className="adm-progress-pct">{row.progress}%</span>
                    </div>
                  </td>
                  <td>
                    <span
                      className={`adm-status-pill${
                        row.status === 'ICO Live' || row.status === 'Trading'
                          ? ' is-active'
                          : ''
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td>{row.investors}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </InvestorTableChrome>
    </AdminShell>
  );
}

export default function AdminRaisesPage() {
  return (
    <RequireAuth title="Sign In To Access Admin">
      <RaisesView />
    </RequireAuth>
  );
}
