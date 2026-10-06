import { formatUsd } from '@/lib/format';
import Image from 'next/image';

export function HomeAgentCardProgress({
  raised,
  target,
  compact = false,
}: {
  raised: number;
  target: number;
  compact?: boolean;
}) {
  const progress = target > 0 ? Math.min(raised / target, 1) : 0;
  const fillWidth = `${Math.max(progress * 100, progress > 0 ? 6 : 0)}%`;

  return (
    <div className={compact ? 'home-agent-progress home-agent-progress-compact' : 'home-agent-progress'}>
      <div className="home-agent-progress-label">
        <Image src="/home/icon-fund.svg" alt="" width={18} height={18} className="shrink-0" />
        <span>Fund raised</span>
      </div>
      <div
        className="home-agent-progress-track"
        role="progressbar"
        aria-valuenow={Math.round(progress * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Fund raised progress"
      >
        <div className="home-agent-progress-fill" style={{ width: fillWidth }} />
      </div>
      <div className="home-agent-progress-values">
        <span>{formatUsd(raised, 0)}</span>
        <span>{formatUsd(target, 0)}</span>
      </div>
    </div>
  );
}
