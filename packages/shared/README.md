# @arca/shared

Shared TypeScript constants, types, and utilities for the Arca platform.

## Overview

This package contains:

- **Chain constants**: Solana clusters and Robinhood Chain network configurations
- **Tokenomics**: Fixed allocation percentages, buyback splits, fee structures, and helper functions
- **Types**: TypeScript interfaces for Agent, ICO, Contribution, BuybackEvent, and more
- **Tier information**: Descriptions and metadata for Seed, Core, and Pro tiers

## Installation

```bash
pnpm add @arca/shared
```

## Usage

### Chain Constants

```typescript
import { CHAINS, ROBINHOOD_CHAIN, SOLANA_CLUSTERS, ChainType } from '@arca/shared';

// Access Robinhood Chain mainnet config
const rhMainnet = ROBINHOOD_CHAIN.mainnet;
console.log(rhMainnet.chainId); // 4663

// Access Solana devnet
const solDevnet = SOLANA_CLUSTERS.devnet;
```

### Tokenomics

```typescript
import {
  TOTAL_SUPPLY,
  ALLOCATIONS,
  BUYBACK_SPLIT,
  raiseTargetFromFdv,
  tokensForContribution,
  allocationBreakdown,
} from '@arca/shared';

// Calculate raise target (10% of FDV)
const fdv = 500_000; // $500K
const raiseTarget = raiseTargetFromFdv(fdv); // $50K

// Calculate token allocation for a contributor
const contribution = 5; // 5 SOL/ETH
const tokens = tokensForContribution(contribution, 50); // Total raise target 50 SOL/ETH

// Get full allocation breakdown
const breakdown = allocationBreakdown();
console.log(breakdown);
// {
//   openMarket: 500_000_000,
//   agentWallet: 200_000_000,
//   deployer: 200_000_000,
//   presale: 100_000_000,
//   total: 1_000_000_000
// }
```

### Types

```typescript
import type {
  Agent,
  Ico,
  BuybackEvent,
  Contribution,
  AgentTier,
  AgentStatus,
  AgentCategory,
  RiskRating,
} from '@arca/shared';

const agent: Agent = {
  id: '...',
  name: 'My Agent',
  tier: 'core',
  status: 'IcoLive',
  category: 'Trading',
  // ... other fields
};
```

### Tier Information

```typescript
import { TIER_INFO, getTierInfo, getAllTiers } from '@arca/shared';

// Get info for a specific tier
const coreInfo = getTierInfo('core');
console.log(coreInfo.description);

// Get all tiers
const allTiers = getAllTiers();
```

## Domain Rules

All constants and types follow the rules defined in the Arca V1 PRD:

- **Total Supply**: Fixed at 1,000,000,000 tokens for all launches
- **Allocations**: 50/20/20/10 (open market / agent wallet / deployer / presale)
- **Buyback Split**: 90% agent token, 10% platform token (immutable)
- **Trading Fee**: 1% split 50/50 between treasury and deployer
- **Raise Target**: Always 10% of launch FDV
- **Threshold Range**: 50-80% of raise target

## Scripts

- `pnpm build` - Build TypeScript to JavaScript
- `pnpm typecheck` - Type check without emitting files
- `pnpm clean` - Remove build artifacts

## License

Internal use only.
