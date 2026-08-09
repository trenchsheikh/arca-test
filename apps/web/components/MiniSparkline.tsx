'use client';

interface MiniSparklineProps {
  data: number[];
  className?: string;
  color?: string;
}

export function MiniSparkline({ data, className = '', color = '#10b981' }: MiniSparklineProps) {
  if (!data || data.length < 2) {
    return null;
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 40;
    const y = 16 - ((value - min) / range) * 12;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width="40" height="16" viewBox="0 0 40 16" className={className}>
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
