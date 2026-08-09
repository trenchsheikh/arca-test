'use client';

import { MdIcon, MdLinearProgress } from '@/components/material';

const stages = [
  { icon: 'payments', title: 'Agent Revenue', sub: 'On Chain Earnings' },
  { icon: 'autorenew', title: 'Buyback Contract', sub: 'Automatic Routing' },
  { icon: 'pie_chart', title: '90 / 10 Split', sub: 'Agent · Platform' },
];

export function BuybackFlowDiagram() {
  return (
    <div className="arca-surface p-8 sm:p-10">
      <div className="text-center mb-8">
        <p className="text-xs uppercase tracking-[0.2em] text-brand font-semibold mb-2">
          Mechanism
        </p>
        <h3 className="font-display font-bold text-chalk text-2xl mb-2">
          How Buybacks Move Value
        </h3>
        <p className="text-chalk-dim text-sm max-w-md mx-auto">
          Immutable 90/10 split, locked in the contract, visible on every explorer.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        {stages.map((stage, i) => (
          <div key={stage.title} className="text-center relative">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/10 text-brand">
              <MdIcon className="arca-icon-lg">{stage.icon}</MdIcon>
            </div>
            <p className="font-semibold text-chalk">{stage.title}</p>
            <p className="text-chalk-dim text-sm mt-1">{stage.sub}</p>
            {i < stages.length - 1 && (
              <div className="hidden sm:block absolute top-7 -right-3 text-brand/40">
                <MdIcon className="arca-icon-sm">arrow_forward</MdIcon>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="max-w-md mx-auto space-y-2">
        <div className="flex justify-between text-xs font-medium">
          <span className="text-brand">90% agent</span>
          <span className="text-chalk-dim">10% platform</span>
        </div>
        <MdLinearProgress value={0.9} max={1} style={{ width: '100%', height: 6 }} />
      </div>
    </div>
  );
}
