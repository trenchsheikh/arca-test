'use client';

interface DrawdownChartProps {
  data: number[];
  className?: string;
}

export function DrawdownChart({ data, className = '' }: DrawdownChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className={`flex items-center justify-center h-32 bg-gray-900/50 rounded-lg ${className}`}>
        <p className="text-gray-500 text-sm">No drawdown data available</p>
      </div>
    );
  }

  const maxDrawdown = Math.max(...data.map(Math.abs));
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 50 - (value / maxDrawdown) * 40;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className={className}>
      <div className="bg-gray-900/50 rounded-lg p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-medium text-gray-400">Drawdown History</h3>
          <span className="text-sm text-red-400">Max: {maxDrawdown.toFixed(1)}%</span>
        </div>
        <svg width="100%" height="120" viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full">
          {/* Zero line */}
          <line x1="0" y1="50" x2="100" y2="50" stroke="#374151" strokeWidth="0.5" />
          
          {/* Drawdown area */}
          <polyline
            points={points}
            fill="none"
            stroke="#ef4444"
            strokeWidth="0.5"
            vectorEffect="non-scaling-stroke"
          />
          
          {/* Fill area under the line */}
          <polygon
            points={`0,50 ${points} 100,50`}
            fill="url(#drawdownGradient)"
            opacity="0.3"
          />
          
          <defs>
            <linearGradient id="drawdownGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.5" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}
