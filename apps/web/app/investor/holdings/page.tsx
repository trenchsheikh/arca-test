'use client';

import Image from 'next/image';
import Link from 'next/link';
import { formatCommaNumber, formatUsd } from '@/lib/format';
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

function HoldingsView() {
  const { loading, rows } = useInvestorPortfolio();

  return (
    <InvestorShell crumb="Holdings">
      <InvestorPageHeader
        title="Holdings"
        subtitle="View all tokens and assets currently held in your portfolio."
      />

      <InvestorTableChrome title="Holdings">
        {loading ? (
          <div className="inv-table-empty">
            <LoadingState label="Loading holdings…" />
          </div>
        ) : rows.length === 0 ? (
          <p className="inv-table-empty">
            Holdings appear after you contribute to an agent.
          </p>
        ) : (
          <table className="inv-table">
            <thead>
              <tr>
                <th>Agent</th>
                <th>Token</th>
                <th>
                  <SortHeader label="Invested" />
                </th>
                <th>
                  <SortHeader label="Balance" />
                </th>
                <th>
                  <SortHeader label="Value" />
                </th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={`hold-${row.position.agentId}`}>
                  <td>
                    <AgentCell name={row.name} logoUrl={row.logoUrl} />
                  </td>
                  <td className="inv-cell-muted">
                    {formatCommaNumber(row.balance)}
                  </td>
                  <td className="inv-cell-dim">{formatUsd(row.invested)}</td>
                  <td>{formatCommaNumber(row.balance)}</td>
                  <td>{formatUsd(row.value)}</td>
                  <td>
                    <div className="inv-status-cell">
                      {row.position.claimable && !row.position.claimed ? (
                        <Link
                          href={`/agents/${row.slug}/ico`}
                          className="inv-claim-link"
                        >
                          Claim
                          <Image
                            src="/investor/icon-external.svg"
                            alt=""
                            width={16}
                            height={16}
                          />
                        </Link>
                      ) : (
                        <span className="inv-status-pill">{row.status}</span>
                      )}
                      <Link
                        href={`/agents/${row.slug}`}
                        className="inv-row-more"
                        aria-label={`View ${row.name}`}
                      >
                        <Image
                          src="/investor/icon-eye.svg"
                          alt=""
                          width={16}
                          height={16}
                        />
                      </Link>
                    </div>
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

export default function InvestorHoldingsPage() {
  return (
    <RequireAuth title="Sign In To Access Investor Dashboard">
      <HoldingsView />
    </RequireAuth>
  );
}
