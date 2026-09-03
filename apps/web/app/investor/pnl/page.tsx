'use client';

import {
  formatCommaNumber,
  formatPercent,
  formatSignedUsd,
  formatStatCurrency,
  formatUsd,
} from '@/lib/format';
import { RequireAuth } from '@/components/RequireAuth';
import { LoadingState } from '@/components/LoadingState';
import { InvestorShell } from '@/components/investor/InvestorShell';
import { InvestorPageHeader } from '@/components/investor/InvestorPageHeader';
import { InvestorStatCard } from '@/components/investor/InvestorStatCard';
import {
  InvestorTableChrome,
  SortHeader,
} from '@/components/investor/InvestorTableChrome';
import { AgentCell } from '@/components/investor/AgentCell';
import { useInvestorPortfolio } from '@/components/investor/useInvestorPortfolio';

function PnlView() {
  const {
    loading,
    rows,
    totalInvested,
    totalHoldings,
    unrealizedPnL,
    pnlRatio,
  } = useInvestorPortfolio();

  const pnlTone = unrealizedPnL > 0 ? 'up' : unrealizedPnL < 0 ? 'down' : '';
  const sparkTone = unrealizedPnL >= 0 ? 'up' : 'down';

  return (
    <InvestorShell crumb="PnL">
      <InvestorPageHeader
        title="PnL"
        subtitle="Track unrealized performance across every agent position."
      />

      <div className="inv-stat-grid inv-stat-grid--3">
        <InvestorStatCard
          label="Total Invested"
          value={formatStatCurrency(totalInvested)}
          hint={`${formatCommaNumber(rows.length)} position${rows.length === 1 ? '' : 's'}`}
          sparkline={sparkTone}
        />
        <InvestorStatCard
          label="Holdings Value"
          value={formatStatCurrency(totalHoldings)}
          hint={`${unrealizedPnL >= 0 ? '+' : ''}${formatPercent(pnlRatio)}`}
          tone={pnlTone}
          sparkline={sparkTone}
        />
        <InvestorStatCard
          label="Unrealized PnL"
          value={formatSignedUsd(unrealizedPnL)}
          hint={`${unrealizedPnL >= 0 ? '+' : ''}${formatPercent(pnlRatio)}`}
          tone={pnlTone}
          sparkline={sparkTone}
        />
      </div>

      <InvestorTableChrome title="PnL By Agent">
        {loading ? (
          <div className="inv-table-empty">
            <LoadingState label="Loading PnL…" />
          </div>
        ) : rows.length === 0 ? (
          <p className="inv-table-empty">
            PnL appears once you hold agent tokens.
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
                  <SortHeader label="Value" />
                </th>
                <th>
                  <SortHeader label="PnL" />
                </th>
                <th>
                  <SortHeader label="Return" />
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const tone =
                  row.pnl > 0 ? 'is-up' : row.pnl < 0 ? 'is-down' : '';
                return (
                  <tr key={`pnl-${row.position.agentId}`}>
                    <td>
                      <AgentCell
                        name={row.name}
                        logoUrl={row.logoUrl}
                        href={`/agents/${row.slug}`}
                      />
                    </td>
                    <td>{row.ticker}</td>
                    <td>{formatUsd(row.invested)}</td>
                    <td>{formatUsd(row.value)}</td>
                    <td className={tone}>{formatSignedUsd(row.pnl)}</td>
                    <td className={tone}>
                      {row.pnl >= 0 ? '+' : ''}
                      {formatPercent(row.pnlRatio)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </InvestorTableChrome>
    </InvestorShell>
  );
}

export default function InvestorPnlPage() {
  return (
    <RequireAuth title="Sign In To Access Investor Dashboard">
      <PnlView />
    </RequireAuth>
  );
}
