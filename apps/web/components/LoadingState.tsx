'use client';

import { MdCircularProgress } from '@/components/material';

export function LoadingState({
  label = 'Loading…',
  className = '',
  onBrand = false,
}: {
  label?: string;
  className?: string;
  /** White spinner/label for brand-blue page backgrounds */
  onBrand?: boolean;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 py-16 ${
        onBrand ? 'text-white/80' : 'text-chalk-dim'
      } ${className}`}
      role="status"
      aria-live="polite"
    >
      <MdCircularProgress
        indeterminate
        className={onBrand ? 'on-brand-spinner' : undefined}
        style={{ width: 40, height: 40 }}
      />
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}
