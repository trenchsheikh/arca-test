'use client';

const colorMap: Record<string, string> = {
  mint: '#5D74E5',
  gold: '#7B8DEB',
  chalk: '#9AA3B8',
  'mint-dark': '#4559C7',
};

export function TokenomicsChart() {
  const allocation = [
    { label: 'Open Market / LP', percent: 50, color: 'mint' },
    { label: 'Agent Wallet (Locked)', percent: 20, color: 'gold' },
    { label: 'Deployer (Vested)', percent: 20, color: 'chalk' },
    { label: 'Presale Participants', percent: 10, color: 'mint-dark' },
  ];

  return (
    <div className="bg-ink-light border border-chalk/10 rounded-xl p-6">
      <h3 className="font-display font-bold text-chalk text-lg mb-6">
        Token Allocation
      </h3>

      <div className="space-y-4">
        {allocation.map((item) => (
          <div key={item.label} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-chalk text-sm">{item.label}</span>
              <span className="text-chalk font-semibold">{item.percent}%</span>
            </div>
            <div className="h-2 bg-ink rounded-full overflow-hidden">
              <div
                className="h-full"
                style={{ 
                  width: `${item.percent}%`,
                  backgroundColor: colorMap[item.color] || '#9ca3af'
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-chalk/10">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-chalk-dim mb-1">Total Supply</p>
            <p className="text-chalk font-semibold">1,000,000,000</p>
          </div>
          <div>
            <p className="text-chalk-dim mb-1">Initial Circulating</p>
            <p className="text-chalk font-semibold">500,000,000</p>
          </div>
        </div>
      </div>
    </div>
  );
}
