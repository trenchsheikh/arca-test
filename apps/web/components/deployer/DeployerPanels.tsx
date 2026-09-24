'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useDeployerData } from '@/components/deployer/useDeployerData';

export function BuybackEngineCard() {
  const { buybackSplit, buybackMetrics } = useDeployerData();

  return (
    <section className="dep-panel dep-panel--buyback">
      <div className="dep-panel-toolbar">
        <div className="dep-panel-heading">
          <h2 className="inv-table-title">Buyback engine status</h2>
          <Image src="/deployer/icon-info.svg" alt="" width={16} height={16} />
        </div>
        <button type="button" className="inv-more-btn" aria-label="More options">
          <Image src="/deployer/icon-dots.svg" alt="" width={18} height={18} />
        </button>
      </div>

      <div className="dep-buyback-body">
        <div className="dep-donut-col">
          <div className="dep-donut" style={{ background: `conic-gradient(#636363 0 ${buybackSplit.deployerPct}%, #5d74e6 ${buybackSplit.deployerPct}% 100%)` }} role="img" aria-label={`Revenue split: ${buybackSplit.buybackPct}% buyback, ${buybackSplit.deployerPct}% deployer share`}>
            <div className="dep-donut-label">
              <span>Revenue</span>
              <span>Buyback split</span>
            </div>
          </div>

          <div className="dep-donut-legend">
            <div className="dep-legend-row">
              <span className="dep-legend-chip dep-legend-chip--buyback">
                {buybackSplit.buybackUsd}
              </span>
              <span>~ {buybackSplit.buybackPct}% buyback</span>
            </div>
            <div className="dep-legend-row">
              <span className="dep-legend-chip dep-legend-chip--deployer">
                {buybackSplit.deployerUsd}
              </span>
              <span>~ {buybackSplit.deployerPct}% deployer share</span>
            </div>
          </div>
        </div>

        <div className="dep-metric-list">
          {buybackMetrics.map((row) => (
            <div key={row.label} className="dep-metric-row">
              <span className="dep-metric-value">{row.value}</span>
              <span className="dep-metric-label">{row.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="dep-panel-footer">
        <Link href="/deployer/buyback" className="dep-panel-link">
          View full engine detail
          <Image
            src="/deployer/icon-arrow-up-right.svg"
            alt=""
            width={14}
            height={14}
          />
        </Link>
      </div>
    </section>
  );
}

export function FeeRevenueCard() {
  const { feeRevenue } = useDeployerData();

  return (
    <section className="dep-panel dep-panel--fee">
      <div className="dep-panel-toolbar">
        <div className="dep-panel-heading">
          <h2 className="inv-table-title">Fee revenue (deployer share)</h2>
          <Image src="/deployer/icon-info.svg" alt="" width={16} height={16} />
        </div>
        <button type="button" className="inv-more-btn" aria-label="More options">
          <Image src="/deployer/icon-dots.svg" alt="" width={18} height={18} />
        </button>
      </div>

      <div className="dep-fee-body">
        <div className="dep-fee-hero">
          <p className="dep-fee-total">{feeRevenue.total}</p>
          <span className="dep-delta-pill">
            <Image src="/deployer/icon-trend-up.svg" alt="" width={14} height={14} />
            {feeRevenue.delta}
          </span>
        </div>

        <div className="dep-fee-grid">
          {feeRevenue.stats.map((stat) => (
            <div key={stat.label} className="dep-fee-stat">
              <span className="dep-metric-value">{stat.value}</span>
              <span className="dep-metric-label">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="dep-panel-footer">
        <Link href="/deployer/performance" className="dep-panel-link">
          View full performance
          <Image
            src="/deployer/icon-arrow-up-right.svg"
            alt=""
            width={14}
            height={14}
          />
        </Link>
      </div>
    </section>
  );
}

export function MonthlyReturnChart() {
  const { monthlyReturns } = useDeployerData();
  const max = Math.max(...monthlyReturns.map((m) => Math.abs(m.value)), 1);
  const highlight = 'JUL';

  const points = monthlyReturns
    .map((m, i) => {
      const x = (i / (monthlyReturns.length - 1)) * 100;
      const y = 78 - ((m.value + max) / (max * 2)) * 60;
      return `${x},${y}`;
    })
    .join(' ');

  const areaPoints = `0,90 ${points} 100,90`;

  return (
    <section className="dep-panel dep-panel--chart">
      <div className="dep-panel-toolbar">
        <div className="dep-panel-heading">
          <h2 className="inv-table-title">Monthly return</h2>
          <Image src="/deployer/icon-info.svg" alt="" width={16} height={16} />
        </div>
        <div className="dep-chart-controls">
          <button type="button" className="dep-range-btn">
            12 months
            <Image src="/deployer/icon-chevron-right.svg" alt="" width={10} height={10} />
          </button>
          <button type="button" className="inv-more-btn" aria-label="More options">
            <Image src="/deployer/icon-dots.svg" alt="" width={18} height={18} />
          </button>
        </div>
      </div>

      <div className="dep-chart-wrap">
        <svg
          className="dep-area-chart"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          role="img"
          aria-label="Monthly return chart"
        >
          <defs>
            <linearGradient id="depChartFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5d74e6" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#5d74e6" stopOpacity="0" />
            </linearGradient>
          </defs>
          <polygon points={areaPoints} fill="url(#depChartFill)" />
          <polyline
            points={points}
            fill="none"
            stroke="#5d74e6"
            strokeWidth="1.2"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        <div className="dep-chart-months">
          {monthlyReturns.map((m) => (
            <span
              key={m.month}
              className={m.month === highlight ? 'is-active' : undefined}
            >
              {m.month}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

export function RiskExposureCard() {
  const { riskExposure, exposureSplit } = useDeployerData();

  return (
    <section className="dep-panel dep-panel--risk">
      <div className="dep-panel-toolbar">
        <h2 className="inv-table-title">Risk & exposure</h2>
        <button type="button" className="inv-more-btn" aria-label="More options">
          <Image src="/deployer/icon-dots.svg" alt="" width={18} height={18} />
        </button>
      </div>

      <div className="dep-risk-list">
        {riskExposure.map((row) => (
          <div key={row.label} className="dep-risk-row">
            <span className="dep-metric-label">{row.label}</span>
            <span className="dep-metric-value">{row.value}</span>
          </div>
        ))}
      </div>

      <div className="dep-exposure">
        <div className="dep-exposure-bar" aria-hidden>
          <span style={{ width: `${exposureSplit.long}%` }} />
          <span style={{ width: `${exposureSplit.short}%` }} />
        </div>
        <div className="dep-exposure-labels">
          <span>{exposureSplit.long}% long</span>
          <span>{exposureSplit.short}% short</span>
        </div>
      </div>
    </section>
  );
}
