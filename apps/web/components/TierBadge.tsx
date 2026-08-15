'use client';

import type { AgentTier } from '@/lib/mock-data';
import { MdSuggestionChip, MdIcon } from '@/components/material';

interface TierBadgeProps {
  tier: AgentTier;
  showTooltip?: boolean;
}

const tierMeta: Record<
  AgentTier,
  { icon: string; tooltip: string }
> = {
  Seed: {
    icon: 'spa',
    tooltip: 'Early stage, higher variance, larger open market allocation',
  },
  Core: {
    icon: 'verified',
    tooltip: 'Proven revenue and track record, balanced allocation',
  },
  Pro: {
    icon: 'workspace_premium',
    tooltip: 'Institutional grade, sustained high volume revenue, priority access',
  },
};

export function TierBadge({ tier, showTooltip = false }: TierBadgeProps) {
  const meta = tierMeta[tier];

  return (
    <div className="relative inline-flex group" title={showTooltip ? meta.tooltip : undefined}>
      <MdSuggestionChip label={tier}>
        <MdIcon slot="icon">{meta.icon}</MdIcon>
      </MdSuggestionChip>
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-ink-lighter border border-white/10 rounded-lg text-xs text-chalk w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all shadow-card z-10">
          {meta.tooltip}
        </div>
      )}
    </div>
  );
}
