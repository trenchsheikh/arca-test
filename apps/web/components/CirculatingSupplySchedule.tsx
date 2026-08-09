'use client';

import { TOTAL_SUPPLY, ALLOCATIONS } from '@arca/shared';

interface CirculatingSupplyScheduleProps {
  vestingCliffDays: number;
  vestingDurationDays: number;
  className?: string;
}

export function CirculatingSupplySchedule({ 
  vestingCliffDays, 
  vestingDurationDays,
  className = '' 
}: CirculatingSupplyScheduleProps) {
  // Calculate token amounts
  const openMarket = TOTAL_SUPPLY * (ALLOCATIONS.openMarket / 10000);
  const agentLocked = TOTAL_SUPPLY * (ALLOCATIONS.agentWallet / 10000);
  const deployerVesting = TOTAL_SUPPLY * (ALLOCATIONS.deployer / 10000);
  const presale = TOTAL_SUPPLY * (ALLOCATIONS.presale / 10000);

  // Time periods for visualization
  const periods = [
    { label: 'Launch', months: 0 },
    { label: `${vestingCliffDays}d`, months: vestingCliffDays / 30 },
    { label: `${Math.floor(vestingDurationDays / 2)}d`, months: vestingDurationDays / 60 },
    { label: `${vestingDurationDays}d`, months: vestingDurationDays / 30 },
  ];

  const getSupplyAtPeriod = (months: number) => {
    const cliffMonths = vestingCliffDays / 30;
    const durationMonths = vestingDurationDays / 30;
    
    // Open market + presale always circulating
    let circulating = openMarket + presale;
    
    // Deployer vesting
    if (months >= cliffMonths) {
      const vestingProgress = Math.min(1, (months - cliffMonths) / (durationMonths - cliffMonths));
      circulating += deployerVesting * vestingProgress;
    }
    
    return circulating;
  };

  const maxSupply = openMarket + presale + deployerVesting;

  return (
    <div className={className}>
      <div className="bg-gray-900/50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Circulating Supply Schedule</h3>
        
        <div className="space-y-4">
          {periods.map((period, idx) => {
            const circulating = getSupplyAtPeriod(period.months);
            const locked = agentLocked;
            const vesting = deployerVesting * (period.months >= vestingCliffDays / 30 
              ? Math.min(1, (period.months - vestingCliffDays / 30) / ((vestingDurationDays - vestingCliffDays) / 30))
              : 0);
            const unvested = deployerVesting - vesting;
            const circulatingBase = openMarket + presale;
            
            return (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">{period.label}</span>
                  <span className="text-white font-mono">
                    {(circulating / 1_000_000).toFixed(0)}M / {(TOTAL_SUPPLY / 1_000_000).toFixed(0)}M
                  </span>
                </div>
                <div className="h-8 flex rounded overflow-hidden">
                  <div 
                    style={{ 
                      width: `${(circulatingBase / TOTAL_SUPPLY) * 100}%`,
                      backgroundColor: '#10b981'
                    }}
                    className="flex items-center justify-center text-xs text-white font-semibold"
                    title="LP + Presale (Unlocked)"
                  >
                    {circulatingBase > TOTAL_SUPPLY * 0.1 ? 'Liquid' : ''}
                  </div>
                  <div 
                    style={{ 
                      width: `${(vesting / TOTAL_SUPPLY) * 100}%`,
                      backgroundColor: '#3b82f6'
                    }}
                    className="flex items-center justify-center text-xs text-white font-semibold"
                    title="Deployer (Vested)"
                  >
                    {vesting > TOTAL_SUPPLY * 0.05 ? 'Vested' : ''}
                  </div>
                  <div 
                    style={{ 
                      width: `${(unvested / TOTAL_SUPPLY) * 100}%`,
                      backgroundColor: '#6366f1'
                    }}
                    className="flex items-center justify-center text-xs text-white/70 font-semibold"
                    title="Deployer (Locked)"
                  >
                    {unvested > TOTAL_SUPPLY * 0.1 ? 'Locked' : ''}
                  </div>
                  <div 
                    style={{ 
                      width: `${(locked / TOTAL_SUPPLY) * 100}%`,
                      backgroundColor: '#94a3b8'
                    }}
                    className="flex items-center justify-center text-xs text-white/70 font-semibold"
                    title="Agent (Locked)"
                  >
                    {locked > TOTAL_SUPPLY * 0.1 ? 'Agent' : ''}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: '#10b981' }} />
            <span className="text-gray-400">LP + Presale</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: '#3b82f6' }} />
            <span className="text-gray-400">Deployer (Vested)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: '#6366f1' }} />
            <span className="text-gray-400">Deployer (Locked)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: '#94a3b8' }} />
            <span className="text-gray-400">Agent (Locked)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
