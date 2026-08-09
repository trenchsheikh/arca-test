'use client';

import { formatCurrency, formatPercent } from '@/lib/format';
import { MdLinearProgress, MdIcon } from '@/components/material';

interface RaiseProgressProps {
  raised: number;
  target: number;
  threshold: number;
  showThreshold?: boolean;
}

export function RaiseProgress({
  raised,
  target,
  threshold,
  showThreshold = true,
}: RaiseProgressProps) {
  const progress = Math.min(raised / target, 1);
  const thresholdPercent = threshold * 100;
  const hasMetThreshold = progress * 100 >= thresholdPercent;

  return (
    <div className="arca-surface p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-chalk-dim text-sm mb-1">Amount Raised</p>
          <p className="text-chalk font-display font-bold text-2xl">
            {formatCurrency(raised)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-chalk-dim text-sm mb-1">Target</p>
          <p className="text-chalk font-semibold text-xl">{formatCurrency(target)}</p>
        </div>
      </div>

      <div className="relative mb-2">
        <MdLinearProgress value={progress} max={1} style={{ width: '100%', height: 8 }} />
        {showThreshold && (
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-brand pointer-events-none"
            style={{ left: `${thresholdPercent}%` }}
            aria-hidden
          />
        )}
      </div>

      <div className="flex items-center justify-between mt-4 text-sm">
        <span className="text-chalk-dim">
          Progress:{' '}
          <span className="text-chalk font-semibold">{formatPercent(progress)}</span>
          {showThreshold && (
            <span className="ml-2 text-brand">
              · {formatPercent(threshold, 0)} threshold
            </span>
          )}
        </span>
        {hasMetThreshold ? (
          <span className="inline-flex items-center gap-1 text-brand font-semibold">
            <MdIcon style={{ fontSize: 18 }}>check_circle</MdIcon>
            Threshold Met
          </span>
        ) : (
          <span className="text-chalk-dim">
            {formatCurrency(target * threshold - raised)} to threshold
          </span>
        )}
      </div>
    </div>
  );
}
