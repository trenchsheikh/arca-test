'use client';

import Image from 'next/image';
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

function TransactionsView() {
  const { loading, stats, pendingCount, transactions } = useAdminData();

  return (
    <AdminShell crumb="Transactions">
      <AdminPageHeader
        title="Transactions"
        badge={`${pendingCount} pending review`}
      />
      <AdminStats stats={stats} />

      <InvestorTableChrome title="Platform transactions">
        {loading ? (
          <div className="inv-table-empty">
            <LoadingState label="Loading transactions…" />
          </div>
        ) : transactions.length === 0 ? (
          <p className="inv-table-empty">No transactions yet.</p>
        ) : (
          <table className="inv-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Agent</th>
                <th>
                  <SortHeader label="Amount" />
                </th>
                <th>
                  <SortHeader label="Tx Hash" />
                </th>
                <th>Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((row) => (
                <tr key={row.id}>
                  <td>{row.type}</td>
                  <td>{row.agent}</td>
                  <td>{row.amount}</td>
                  <td className="inv-cell-dim inv-cell-mono">{row.txHash}</td>
                  <td className="inv-cell-dim">{row.time}</td>
                  <td>
                    <div className="inv-status-cell">
                      <span
                        className={`adm-status-pill${
                          row.flagged ? '' : ' is-active'
                        }${row.flagged ? ' is-flagged' : ''}`}
                      >
                        {row.status}
                      </span>
                      <button
                        type="button"
                        className="inv-row-more"
                        aria-label="More actions"
                      >
                        <Image
                          src="/admin/icon-more.svg"
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
        )}
      </InvestorTableChrome>
    </AdminShell>
  );
}

export default function AdminTransactionsPage() {
  return (
    <RequireAuth admin title="Sign In To Access Admin">
      <TransactionsView />
    </RequireAuth>
  );
}
