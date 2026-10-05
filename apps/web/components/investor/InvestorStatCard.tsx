'use client';

import Image from 'next/image';

export function InvestorStatCard({
  label,
  value,
  hint,
  tone,
  sparkline,
}: {
  label: string;
  value: string;
  hint: string;
  tone?: 'up' | 'down' | '';
  sparkline?: 'up' | 'down';
}) {
  return (
    <article className="inv-stat-card">
      <div className="inv-stat-card-body">
        <div className="inv-stat-card-main">
          <p className="inv-stat-label">{label}</p>
          <p className="inv-stat-value">{value}</p>
        </div>
        {sparkline ? (
        <div className="inv-stat-spark">
          <Image
            src={
              sparkline === 'up'
                ? '/investor/sparkline-up.svg'
                : '/investor/sparkline-down.svg'
            }
            alt=""
            width={69}
            height={42}
          />
        </div>
        ) : null}
      </div>
      <div className="inv-stat-card-footer">
        <Image
          src="/investor/icon-external.svg"
          alt=""
          width={16}
          height={16}
        />
        <span className={`inv-stat-hint${tone ? ` is-${tone}` : ''}`}>
          {tone === 'down' && (
            <Image
              src="/investor/icon-trend-down.svg"
              alt=""
              width={14}
              height={14}
              className="inv-stat-trend"
            />
          )}
          {hint}
        </span>
      </div>
    </article>
  );
}
