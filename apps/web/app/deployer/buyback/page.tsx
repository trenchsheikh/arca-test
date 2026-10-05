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

function BuybackView() {
  const data = useDeployerData();

  return (
    <DeployerShell crumb="Buyback Engine">
      <DeployerPageHeader
        title="Buyback engine"
        subtitle={data.raiseMeta}
        status={data.raiseStatus}
      />

      <div className="dep-buyback-top">
        <section className="dep-panel">
          <div className="dep-panel-toolbar">
            <h2 className="inv-table-title">Engine parameters</h2>
            <button type="button" className="inv-more-btn" aria-label="More options">
              <Image src="/deployer/icon-dots.svg" alt="" width={18} height={18} />
            </button>
          </div>
          <div className="dep-param-list">
            {data.engineParams.length === 0 ? (
              <p className="inv-table-empty">
                Engine parameters are set when you launch an agent.
              </p>
            ) : null}
            {data.engineParams.map((row) => (
              <div key={row.label} className="dep-param-row">
                <span className="dep-metric-label">{row.label}</span>
                <span className="dep-metric-value">{row.value}</span>
              </div>
            ))}
          </div>
          <div className="dep-info-box">
            <Image src="/deployer/icon-info.svg" alt="" width={16} height={16} />
            <p>
              The split and trigger threshold are fixed in the agent&apos;s smart
              contract at launch and cannot be modified by the deployer.
            </p>
          </div>
        </section>

        <section className="dep-panel">
          <div className="dep-panel-toolbar">
            <h2 className="inv-table-title">Lifetime totals</h2>
            <button type="button" className="inv-more-btn" aria-label="More options">
              <Image src="/deployer/icon-dots.svg" alt="" width={18} height={18} />
            </button>
          </div>
          <div className="dep-lifetime-body">
            <p className="dep-fee-total">{data.lifetimeTotals.routed}</p>
            <p className="dep-lifetime-sub">routed to buybacks since launch</p>
            <p className="dep-section-label">{'// Stats'}</p>
            <div className="dep-lifetime-stats">
              <div>
                <span className="dep-metric-value">{data.lifetimeTotals.tokensBought}</span>
                <span className="dep-metric-label">Tokens bought back</span>
              </div>
              <div>
                <span className="dep-metric-value">{data.lifetimeTotals.events}</span>
                <span className="dep-metric-label">Buyback events</span>
              </div>
              <div>
                <span className="dep-metric-value">{data.lifetimeTotals.avgSize}</span>
                <span className="dep-metric-label">Avg. buyback size</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      <InvestorTableChrome title="Buyback History">
        {data.buybackHistory.length === 0 ? (
          <p className="inv-table-empty">No buybacks yet.</p>
        ) : (
        <table className="inv-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Trigger</th>
              <th>
                <SortHeader label="Revenue" />
              </th>
              <th>
                <SortHeader label="Buyback Amt." />
              </th>
              <th>
                <SortHeader label="sHELX Bought" />
              </th>
              <th>Tx</th>
            </tr>
          </thead>
          <tbody>
            {data.buybackHistory.map((row) => (
              <tr key={row.id}>
                <td>{row.date}</td>
                <td>{row.trigger}</td>
                <td>{row.revenue}</td>
                <td>{row.buybackAmt}</td>
                <td>{row.tokensBought}</td>
                <td className="inv-cell-dim">{row.tx}</td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
      </InvestorTableChrome>
    </DeployerShell>
  );
}

export default function DeployerBuybackPage() {
  return (
    <RequireAuth title="Sign In To Access Deployer Dashboard">
      <BuybackView />
    </RequireAuth>
  );
}
