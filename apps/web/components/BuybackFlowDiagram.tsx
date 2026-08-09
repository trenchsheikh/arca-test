export function BuybackFlowDiagram() {
  return (
    <div className="bg-ink-light border border-chalk/10 rounded-xl p-6">
      <h3 className="font-display font-bold text-chalk text-lg mb-6">
        Buyback Mechanism
      </h3>

      <div className="relative">
        <div className="flex items-center justify-between">
          <div className="flex-1 text-center">
            <div className="w-16 h-16 mx-auto bg-chalk/10 rounded-full flex items-center justify-center mb-3">
              <svg className="w-8 h-8 text-chalk" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-chalk text-sm font-semibold">Agent Revenue</p>
            <p className="text-chalk-dim text-xs mt-1">Generated on-chain</p>
          </div>

          <div className="flex-shrink-0 px-4">
            <svg className="w-8 h-8 text-mint" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>

          <div className="flex-1 text-center">
            <div className="w-16 h-16 mx-auto bg-mint/10 rounded-full flex items-center justify-center mb-3 buyback-glow">
              <svg className="w-8 h-8 text-mint" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <p className="text-chalk text-sm font-semibold">Buyback Contract</p>
            <p className="text-chalk-dim text-xs mt-1">Automatic routing</p>
          </div>

          <div className="flex-shrink-0 px-4">
            <svg className="w-8 h-8 text-mint" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>

          <div className="flex-1">
            <div className="space-y-3">
              <div className="bg-mint/10 border border-mint/20 rounded-lg p-3">
                <p className="text-mint font-semibold text-sm mb-1">90% Agent Token</p>
                <p className="text-chalk-dim text-xs">Market buy from DEX</p>
              </div>
              <div className="bg-gold/10 border border-gold/20 rounded-lg p-3">
                <p className="text-gold font-semibold text-sm mb-1">10% Platform Token</p>
                <p className="text-chalk-dim text-xs">Market buy from DEX</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-chalk/10 text-sm text-chalk-dim">
        <p>
          <strong className="text-chalk">Immutable split:</strong> The 90/10 buyback ratio is locked in the smart contract and cannot be changed by anyone post-launch.
        </p>
      </div>
    </div>
  );
}
