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

function UsersView() {
  const { loading, stats, pendingCount, wallets } = useAdminData();

  return (
    <AdminShell crumb="Users">
      <AdminPageHeader
        title="Users"
        badge={`${pendingCount} pending review`}
      />
      <AdminStats stats={stats} />

      <InvestorTableChrome title="Platform wallets">
        {loading ? (
          <div className="inv-table-empty">
            <LoadingState label="Loading wallets…" />
          </div>
        ) : wallets.length === 0 ? (
          <p className="inv-table-empty">No wallets yet.</p>
        ) : (
          <table className="inv-table">
            <thead>
              <tr>
                <th>Wallet</th>
                <th>Role</th>
                <th>Telegram</th>
                <th>Joined</th>
                <th>
                  <SortHeader label="Total" />
                </th>
                <th>Status</th>
                <th>
                  <SortHeader label="Agents Backed" />
                </th>
              </tr>
            </thead>
            <tbody>
              {wallets.map((row) => (
                <tr key={row.id}>
                  <td className="inv-cell-mono">{row.wallet}</td>
                  <td className="inv-cell-mono">{row.role}</td>
                  <td className="inv-cell-mono">{row.telegram}</td>
                  <td>{row.joined}</td>
                  <td>{row.total}</td>
                  <td>
                    <span className="adm-status-pill is-active">{row.status}</span>
                  </td>
                  <td>{row.agentsBacked}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </InvestorTableChrome>
    </AdminShell>
  );
}

export default function AdminUsersPage() {
  return (
    <RequireAuth admin title="Sign In To Access Admin">
      <UsersView />
    </RequireAuth>
  );
}
