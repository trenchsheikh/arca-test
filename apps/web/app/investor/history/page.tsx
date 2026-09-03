'use client';

import Image from 'next/image';
import {
  formatCommaNumber,
  formatRelativeTime,
  formatUsd,
  getExplorerUrl,
} from '@/lib/format';
import { RequireAuth } from '@/components/RequireAuth';
import { LoadingState } from '@/components/LoadingState';
import { InvestorShell } from '@/components/investor/InvestorShell';
import { InvestorPageHeader } from '@/components/investor/InvestorPageHeader';
import {
  InvestorTableChrome,
  SortHeader,
} from '@/components/investor/InvestorTableChrome';
import { AgentCell } from '@/components/investor/AgentCell';
import { useInvestorPortfolio } from '@/components/investor/useInvestorPortfolio';
import type { InvestorTransaction } from '@/lib/store';

const TX_TYPE_LABEL: Record<InvestorTransaction['type'], string> = {
  contribute: 'Contribute',
  claim: 'Claim',
  refund: 'Refund',
  buyback: 'Buyback',
};

const TX_STATUS_LABEL: Record<InvestorTransaction['status'], string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  failed: 'Failed',
};

function HistoryView() {
  const {
    loading,
    transactions,
    buybacks,
    agentName,
    agentsById,
  } = useInvestorPortfolio();

  const historyRows = [
    ...transactions.map((tx) => {
      const agent = agentsById[tx.agentId];
      const ts = new Date(tx.timestamp).getTime();
      return {
        id: tx.id,
        kind: TX_TYPE_LABEL[tx.type],
        name: agentName(tx.agentId),
        logoUrl: agent?.logoUrl || '/investor/brand-icon.png',
        slug: agent?.slug,
        amount: formatUsd(tx.amount),
        when: formatRelativeTime(tx.timestamp),
        status: TX_STATUS_LABEL[tx.status],
        explorer:
          tx.txHash && agent
            ? getExplorerUrl(agent.chain as 'solana' | 'robinhood', tx.txHash)
            : null,
        ts,
      };
    }),
    ...buybacks.map((b, idx) => {
      const agent = agentsById[b.agentId];
      const ts = new Date(b.timestamp).getTime();
      return {
        id: `buyback-${b.txHash}-${idx}`,
        kind: 'Buyback',
        name: agentName(b.agentId),
        logoUrl: agent?.logoUrl || '/investor/brand-icon.png',
        slug: agent?.slug,
        amount: `${formatCommaNumber(parseFloat(b.agentTokensBought.toString()))} tokens`,
        when: formatRelativeTime(b.timestamp),
        status: 'Confirmed',
        explorer: getExplorerUrl(
          b.chain as 'solana' | 'robinhood',
          b.txHash,
        ),
        ts,
      };
    }),
  ].sort((a, b) => b.ts - a.ts);

  return (
    <InvestorShell crumb="History">
      <InvestorPageHeader
        title="History"
        subtitle="Contributions, claims, refunds, and buyback events for your wallet."
      />

      <InvestorTableChrome title="Transaction History">
        {loading ? (
          <div className="inv-table-empty">
            <LoadingState label="Loading history…" />
          </div>
        ) : historyRows.length === 0 ? (
          <p className="inv-table-empty">
            Contributions, claims, and refunds will appear here.
          </p>
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
                  <SortHeader label="Time" />
                </th>
                <th>Status</th>
                <th>Tx</th>
              </tr>
            </thead>
            <tbody>
              {historyRows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <span className="inv-status-pill">{row.kind}</span>
                  </td>
                  <td>
                    <AgentCell
                      name={row.name}
                      logoUrl={row.logoUrl}
                      href={row.slug ? `/agents/${row.slug}` : undefined}
                    />
                  </td>
                  <td>{row.amount}</td>
                  <td className="inv-cell-dim">{row.when}</td>
                  <td>
                    <span className="inv-status-pill">{row.status}</span>
                  </td>
                  <td>
                    {row.explorer ? (
                      <a
                        href={row.explorer}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inv-claim-link"
                      >
                        View
                        <Image
                          src="/investor/icon-external.svg"
                          alt=""
                          width={16}
                          height={16}
                        />
                      </a>
                    ) : (
                      <span className="inv-cell-dim">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </InvestorTableChrome>
    </InvestorShell>
  );
}

export default function InvestorHistoryPage() {
  return (
    <RequireAuth title="Sign In To Access Investor Dashboard">
      <HistoryView />
    </RequireAuth>
  );
}
