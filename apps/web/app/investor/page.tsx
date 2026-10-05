'use client';

import Image from 'next/image';
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

function DashboardView() {
  const {
    loading,
    rows,
    totalInvested,
    totalHoldings,
    totalBuybacks,
    unrealizedPnL,
    pnlRatio,
    activeCount,
    buybacks,
  } = useInvestorPortfolio();

  const pnlTone = unrealizedPnL > 0 ? 'up' : unrealizedPnL < 0 ? 'down' : '';
  const sparkline = rows.length === 0 ? undefined : unrealizedPnL >= 0 ? 'up' : 'down';

  return (
    <InvestorShell crumb="Dashboard">
      <InvestorPageHeader
        title="Welcome to Arca!  👋"
        subtitle="Track investments, claims, and buyback rewards on arca."
      />

      <div className="inv-stat-grid">
        <InvestorStatCard
          label="Total Invested"
          value={formatStatCurrency(totalInvested)}
          hint={`${formatCommaNumber(rows.length)} position${rows.length === 1 ? '' : 's'}`}
          sparkline={sparkline}
        />
        <InvestorStatCard
          label="Holdings Value"
          value={formatStatCurrency(totalHoldings)}
          hint={`${unrealizedPnL >= 0 ? '+' : ''}${formatPercent(pnlRatio)}`}
          tone={pnlTone}
          sparkline={sparkline}
        />
        <InvestorStatCard
          label="Buybacks Received"
          value={formatCommaNumber(totalBuybacks)}
          hint={`${formatCommaNumber(buybacks.length)} event${buybacks.length === 1 ? '' : 's'}`}
          sparkline={sparkline}
        />
        <InvestorStatCard
          label="Unrealized PnL"
          value={formatSignedUsd(unrealizedPnL)}
          hint={`${unrealizedPnL >= 0 ? '+' : ''}${formatPercent(pnlRatio)}`}
          tone={pnlTone}
          sparkline={sparkline}
        />
      </div>

      <InvestorTableChrome
        title="My Investments"
        badge={activeCount > 0 ? `${activeCount} Active` : undefined}
      >
        {loading ? (
          <div className="inv-table-empty">
            <LoadingState label="Loading portfolio…" />
          </div>
        ) : rows.length === 0 ? (
          <p className="inv-table-empty">
            Contribute to a live ICO to see investments here.
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
                <tr key={`${row.position.agentId}-${row.position.wallet}`}>
                  <td>
                    <AgentCell
                      name={row.name}
                      logoUrl={row.logoUrl}
                      href={`/agents/${row.slug}`}
                    />
                  </td>
                  <td>{row.ticker}</td>
                  <td>{formatUsd(row.invested)}</td>
                  <td>{formatCommaNumber(row.balance)}</td>
                  <td>{formatUsd(row.value)}</td>
                  <td>
                    <div className="inv-status-cell">
                      <span className="inv-status-pill">{row.status}</span>
                      <button
                        type="button"
                        className="inv-row-more"
                        aria-label={`More actions for ${row.name}`}
                      >
                        <Image
                          src="/investor/icon-more.svg"
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
    </InvestorShell>
  );
}

export default function InvestorDashboardPage() {
  return (
    <RequireAuth title="Sign In To Access Investor Dashboard">
      <DashboardView />
    </RequireAuth>
  );
}
