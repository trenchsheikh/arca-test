'use client';

import Image from 'next/image';
import {
  InvestorTableChrome,
  SortHeader,
} from '@/components/investor/InvestorTableChrome';
import { RequireAuth } from '@/components/RequireAuth';
import { DeployerShell } from '@/components/deployer/DeployerShell';
import { DeployerPageHeader } from '@/components/deployer/DeployerPageHeader';
import { useDeployerData } from '@/components/deployer/useDeployerData';

function TransactionsView() {
  const data = useDeployerData();

  return (
    <DeployerShell crumb="Transactions">
      <DeployerPageHeader
        title="Transactions"
        subtitle={data.raiseMeta}
        status={data.raiseStatus}
      />

      <InvestorTableChrome title="On-chain Transactions">
        {data.transactions.length === 0 ? (
          <p className="inv-table-empty">No transactions yet.</p>
        ) : (
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
            {data.transactions.map((row) => (
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
        )}
      </InvestorTableChrome>
    </DeployerShell>
  );
}

export default function DeployerTransactionsPage() {
  return (
    <RequireAuth title="Sign In To Access Deployer Dashboard">
      <TransactionsView />
    </RequireAuth>
  );
}
