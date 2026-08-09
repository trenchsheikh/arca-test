'use client';

import { MdCircularProgress } from '@/components/material';

export function LoadingState({
  label = 'Loading…',
  className = '',
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 py-16 text-chalk-dim ${className}`}
      role="status"
      aria-live="polite"
    >
      <MdCircularProgress indeterminate style={{ width: 40, height: 40 }} />
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}
