'use client';

import Image from 'next/image';
import { formatCompactCurrency, formatUsd } from '@/lib/format';
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

function IcoView() {
  const {
    loading,
    busy,
    stats,
    pendingCount,
    icoAgents,
    setAgentStatus,
    finalize,
  } = useAdminData();

  return (
    <AdminShell crumb="ICO Management">
      <AdminPageHeader
        title="ICO management"
        badge={`${pendingCount} pending review`}
      />
      <AdminStats stats={stats} />

      <InvestorTableChrome title="ICO management">
        {loading ? (
          <div className="inv-table-empty">
            <LoadingState label="Loading ICOs…" />
          </div>
        ) : icoAgents.length === 0 ? (
          <p className="inv-table-empty">No ICOs yet. Approved launches will show up here.</p>
        ) : (
          <table className="inv-table">
            <thead>
              <tr>
                <th>ICO</th>
                <th>
                  <SortHeader label="Raised" />
                </th>
                <th>Progress (50% threshold)</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {icoAgents.map((agent) => {
                const progress =
                  agent.raiseTarget > 0
                    ? Math.min(
                        100,
                        Math.round(
                          (agent.amountRaised / agent.raiseTarget) * 100,
                        ),
                      )
                    : 0;
                const isLive = agent.status === 'ICO Live';
                return (
                  <tr key={agent.id}>
                    <td>
                      <div className="adm-ico-cell">
                        <span>{agent.name}</span>
                        <span
                          className={`adm-status-pill${isLive ? ' is-active' : ''}`}
                        >
                          {isLive ? 'Active' : agent.status}
                        </span>
                      </div>
                    </td>
                    <td>
                      {formatCompactCurrency(agent.amountRaised)} /{' '}
                      {formatCompactCurrency(agent.raiseTarget)}
                    </td>
                    <td>
                      <div className="adm-progress-row">
                        <div className="adm-progress-track" aria-hidden>
                          <div
                            className="adm-progress-fill"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="adm-progress-pct">{progress}%</span>
                      </div>
                    </td>
                    <td>
                      <div className="inv-status-cell">
                        <button
                          type="button"
                          className="adm-review-btn"
                          disabled={busy === agent.slug}
                          onClick={() => {
                            if (agent.status === 'ICO Upcoming') {
                              void setAgentStatus(agent.slug, 'ICO Live');
                              return;
                            }
                            if (
                              window.confirm(
                                `Finalize ${agent.name} as successful raise? Raised ${formatUsd(agent.amountRaised, 0)}.`,
                              )
                            ) {
                              void finalize(agent.slug, true);
                            }
                          }}
                        >
                          <Image
                            src="/admin/icon-more.svg"
                            alt=""
                            width={16}
                            height={16}
                          />
                          Manage
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </InvestorTableChrome>
    </AdminShell>
  );
}

export default function AdminIcoPage() {
  return (
    <RequireAuth admin title="Sign In To Access Admin">
      <IcoView />
    </RequireAuth>
  );
}
