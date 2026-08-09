/**
 * Fixed total supply for all agent token launches.
 * 1 billion tokens.
 */
export const TOTAL_SUPPLY = 1_000_000_000;

/**
 * Token allocation percentages (locked, non-editable by deployers).
 * All allocations are in basis points (1% = 100 bps).
 */
export const ALLOCATIONS = {
  /** 50% - Liquid at launch, seeded as liquidity */
  openMarket: 5000,
  /** 20% - Permanently locked; only released if full operational capital raised during ICO is fully deployed */
  agentWallet: 2000,
  /** 20% - Linear vested; cliff and schedule configurable */
  deployer: 2000,
  /** 10% - Distributed to ICO participants at close */
  presale: 1000,
} as const;

/**
 * Buyback split when agent generates revenue (immutable post-launch).
 * 90% goes to agent token buyback, 10% to platform token buyback.
 */
export const BUYBACK_SPLIT = {
  agent: 9000, // 90% in bps
  platform: 1000, // 10% in bps
} as const;

/**
 * Platform trading fee on all agent token transactions.
 * 1% total fee.
 */
export const TRADING_FEE_BPS = 100; // 1%

/**
 * Fee split between Arca treasury and agent deployer.
 * 50/50 split.
 */
export const FEE_SPLIT = {
  treasury: 5000, // 50% in bps
  deployer: 5000, // 50% in bps
} as const;

/**
 * Raise target is always 10% of launch FDV.
 * This is the percentage of FDV that determines the ICO raise target.
 */
export const RAISE_OF_FDV = 0.10; // 10%

/**
 * Raise threshold range (minimum and maximum in bps).
 * Deployer can configure between 50% and 80% of raise target.
 */
export const THRESHOLD_MIN_BPS = 5000; // 50%
export const THRESHOLD_MAX_BPS = 8000; // 80%

/**
 * Calculate raise target from FDV in USD.
 * Raise target = 10% of launch FDV.
 *
 * @param fdvUsd - Launch FDV in USD
 * @returns Raise target in USD
 */
export function raiseTargetFromFdv(fdvUsd: number): number {
  return fdvUsd * RAISE_OF_FDV;
}

/**
 * Preview tokens if the raise fills exactly to target (UI estimate while contributing).
 * Uses raise target as denominator — for display only before finalize.
 */
export function tokensForContributionPreview(
  contributionAmount: number,
  raiseTargetNative: number,
): number {
  if (raiseTargetNative <= 0 || contributionAmount <= 0) return 0;
  const presaleTokens = TOTAL_SUPPLY * (ALLOCATIONS.presale / 10000);
  return (contributionAmount / raiseTargetNative) * presaleTokens;
}

/**
 * Final claim allocation after successful raise.
 * Tokens = (contribution / totalRaised) * presale bucket — matches on-chain ICO claim math.
 *
 * @param contributionAmount - Amount contributed in native currency (SOL/ETH)
 * @param totalRaisedNative - Actual total raised at finalize (not the target)
 */
export function tokensForContribution(
  contributionAmount: number,
  totalRaisedNative: number,
): number {
  if (totalRaisedNative <= 0 || contributionAmount <= 0) return 0;
  const presaleTokens = TOTAL_SUPPLY * (ALLOCATIONS.presale / 10000);
  return (contributionAmount / totalRaisedNative) * presaleTokens;
}

/** @deprecated Use tokensForContributionPreview for live ICO UI estimates */
export const tokensForContributionAgainstTarget = tokensForContributionPreview;

/**
 * Get the full allocation breakdown in tokens.
 *
 * @returns Object with token amounts for each allocation bucket
 */
export function allocationBreakdown() {
  return {
    openMarket: TOTAL_SUPPLY * (ALLOCATIONS.openMarket / 10000),
    agentWallet: TOTAL_SUPPLY * (ALLOCATIONS.agentWallet / 10000),
    deployer: TOTAL_SUPPLY * (ALLOCATIONS.deployer / 10000),
    presale: TOTAL_SUPPLY * (ALLOCATIONS.presale / 10000),
    total: TOTAL_SUPPLY,
  };
}

/**
 * Validate that a threshold BPS is within allowed range.
 *
 * @param thresholdBps - Threshold in basis points
 * @returns true if valid, false otherwise
 */
export function isValidThreshold(thresholdBps: number): boolean {
  return thresholdBps >= THRESHOLD_MIN_BPS && thresholdBps <= THRESHOLD_MAX_BPS;
}
