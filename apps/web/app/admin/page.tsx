'use client';

import Image from 'next/image';
import { formatCompactCurrency } from '@/lib/format';
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

function ApplicationsView() {
  const { loading, busy, stats, pendingCount, applications, decide } =
    useAdminData();

  return (
    <AdminShell crumb="Applications">
      <AdminPageHeader
        title="Applications"
        badge={`${pendingCount} pending review`}
      />
      <AdminStats stats={stats} />

      <InvestorTableChrome title="Application queue">
        {loading ? (
          <div className="inv-table-empty">
            <LoadingState label="Loading applications…" />
          </div>
        ) : (
          <table className="inv-table">
            <thead>
              <tr>
                <th>Applicant</th>
                <th>Agent</th>
                <th>Category</th>
                <th>
                  <SortHeader label="Target" />
                </th>
                <th>Submitted</th>
                <th>Raise</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((row) => (
                <tr key={row.id}>
                  <td>{row.name}</td>
                  <td className="inv-cell-mono">{row.agentName}</td>
                  <td>{row.category}</td>
                  <td>
                    {row.targetLabel ||
                      formatCompactCurrency(row.raiseTarget || 0)}
                  </td>
                  <td>
                    <span className="adm-muted-pill">{row.status || 'Pending'}</span>
                  </td>
                  <td className="inv-cell-dim">{row.raiseDate}</td>
                  <td>
                    <div className="inv-status-cell">
                      <button
                        type="button"
                        className="adm-review-btn"
                        disabled={busy === row.id || row.status === 'Approved'}
                        onClick={() => {
                          if (
                            window.confirm(
                              `Approve ${row.name} as Core / Medium risk?`,
                            )
                          ) {
                            void decide(row.id, 'approve');
                          }
                        }}
                      >
                        <Image
                          src="/admin/icon-more.svg"
                          alt=""
                          width={16}
                          height={16}
                        />
                        Review
                      </button>
                    </div>
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

export default function AdminApplicationsPage() {
  return (
    <RequireAuth title="Sign In To Access Admin">
      <ApplicationsView />
    </RequireAuth>
  );
}
