'use client';

import { formatRelativeTime, toDate } from '@/lib/format';
import { motion } from 'framer-motion';

interface BuybackLiveIndicatorProps {
  lastBuybackTime?: Date | string | number;
  size?: 'sm' | 'md';
}

export function BuybackLiveIndicator({
  lastBuybackTime,
  size = 'md',
}: BuybackLiveIndicatorProps) {
  if (lastBuybackTime == null || lastBuybackTime === '') return null;

  const parsed = toDate(lastBuybackTime);
  if (Number.isNaN(parsed.getTime())) return null;

  const isRecent = Date.now() - parsed.getTime() < 1000 * 60 * 60;
  if (!isRecent) return null;

  const sizeClasses = size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`inline-flex items-center gap-2 ${sizeClasses} bg-brand/10 border border-brand/25 rounded-full buyback-glow`}
    >
      <motion.span
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="w-2 h-2 bg-brand rounded-full"
      />
      <span className="font-semibold text-brand">LIVE · {formatRelativeTime(parsed)}</span>
    </motion.div>
  );
}
