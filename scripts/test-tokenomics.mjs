import assert from 'node:assert/strict';
import {
  TOTAL_SUPPLY,
  ALLOCATIONS,
  BUYBACK_SPLIT,
  TRADING_FEE_BPS,
  FEE_SPLIT,
  RAISE_OF_FDV,
  THRESHOLD_MIN_BPS,
  THRESHOLD_MAX_BPS,
  raiseTargetFromFdv,
  tokensForContribution,
  tokensForContributionPreview,
  allocationBreakdown,
  isValidThreshold,
} from '../packages/shared/src/tokenomics.ts';

assert.equal(TOTAL_SUPPLY, 1_000_000_000);
assert.equal(ALLOCATIONS.openMarket, 5000);
assert.equal(ALLOCATIONS.agentWallet, 2000);
assert.equal(ALLOCATIONS.deployer, 2000);
assert.equal(ALLOCATIONS.presale, 1000);
assert.equal(BUYBACK_SPLIT.agent, 9000);
assert.equal(BUYBACK_SPLIT.platform, 1000);
assert.equal(TRADING_FEE_BPS, 100);
assert.equal(FEE_SPLIT.treasury, 5000);
assert.equal(FEE_SPLIT.deployer, 5000);
assert.equal(RAISE_OF_FDV, 0.1);
assert.equal(THRESHOLD_MIN_BPS, 5000);
assert.equal(THRESHOLD_MAX_BPS, 8000);

assert.equal(raiseTargetFromFdv(500_000), 50_000);
assert.equal(raiseTargetFromFdv(150_000), 15_000);
assert.equal(raiseTargetFromFdv(1_000_000), 100_000);

const breakdown = allocationBreakdown();
assert.equal(breakdown.openMarket, 500_000_000);
assert.equal(breakdown.agentWallet, 200_000_000);
assert.equal(breakdown.deployer, 200_000_000);
assert.equal(breakdown.presale, 100_000_000);

// Preview vs target
assert.equal(tokensForContributionPreview(5, 50), 10_000_000);

// Claim math uses totalRaised (oversubscribe case)
assert.equal(tokensForContribution(10, 100), 10_000_000);
assert.equal(tokensForContribution(25, 50), 50_000_000);

assert.equal(isValidThreshold(5000), true);
assert.equal(isValidThreshold(8000), true);
assert.equal(isValidThreshold(4999), false);
assert.equal(isValidThreshold(8001), false);

console.log('shared tokenomics: all assertions passed');
