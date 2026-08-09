'use client';

import type { AgentStatus } from '@/lib/mock-data';
import { MdAssistChip, MdIcon } from '@/components/material';

interface StatusPillProps {
  status: AgentStatus;
}

export function StatusPill({ status }: StatusPillProps) {
  const icon =
    status === 'Trading'
      ? 'trending_up'
      : status === 'ICO Live'
        ? 'bolt'
        : status === 'Failed'
          ? 'error'
          : 'schedule';

  return (
    <MdAssistChip label={status} elevated={false}>
      <MdIcon slot="icon">{icon}</MdIcon>
    </MdAssistChip>
  );
}
