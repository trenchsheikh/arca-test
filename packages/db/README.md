# @arca/db

Drizzle ORM database schema and client for the Arca platform.

## Overview

This package provides:

- **Full database schema** with all tables from the PRD
- **Type-safe database client** using Drizzle ORM
- **Migration tooling** via drizzle-kit
- **Seed script** with mock data for UI development

## Installation

```bash
pnpm add @arca/db
```

## Schema

The schema includes all tables from PRD §8:

### Core Tables
- `users` - User accounts (investor/deployer/admin)
- `wallets` - Wallet addresses per chain
- `agents` - Agent profiles and metadata
- `agent_team_members` - Team member information
- `agent_documents` - Strategy docs, audits, etc.

### Application & Review
- `applications` - Agent listing applications
- `reviews` - Admin reviews with tier/risk assignments
- `revenue_wallets` - Connected revenue wallets with metrics

### ICO & Investment
- `icos` - ICO campaign details
- `contributions` - User contributions to ICOs
- `vesting_schedules` - Token vesting parameters

### Trading & Revenue
- `buyback_events` - Automated buyback transactions
- `fee_events` - Trading fee collection records

### Platform
- `platform_config` - Platform-level configuration
- `waitlist` - Email waitlist
- `admin_audit_log` - Admin action audit trail
- `indexer_checkpoints` - Chain indexer state

## Usage

### Create Database Client

```typescript
import { createDb } from '@arca/db';

const db = createDb(process.env.DATABASE_URL);

// Query agents
const agents = await db.query.agents.findMany({
  where: (agents, { eq }) => eq(agents.status, 'Trading'),
});

// Insert a buyback event
await db.insert(buybackEvents).values({
  agentId: '...',
  chain: 'solana',
  txHash: '...',
  revenueSpent: '1.5',
  agentTokensBought: '375000',
  platformTokensBought: '37500',
  blockTime: new Date(),
});
```

### Run Migrations

```bash
# Generate migration files
pnpm generate

# Apply migrations
pnpm migrate
```

### Seed Development Data

The seed script creates 3 mock agents for UI development:

1. **Quantum Trader Pro** - ICO Live (Core tier)
2. **Alpha Yield Optimizer** - Trading with buyback events (Pro tier)
3. **Sentiment Prophet** - ICO Upcoming (Seed tier)

```bash
pnpm seed
```

### Drizzle Studio

Explore the database with Drizzle Studio:

```bash
pnpm studio
```

## Environment Variables

Set `DATABASE_URL` in your environment:

```bash
DATABASE_URL=postgresql://user:password@localhost:5432/arca
```

## Schema Design Notes

- **UUIDs** for all primary keys
- **Timestamps** with `defaultNow()` for created_at/updated_at
- **Enums** for tier, status, category, chain, risk
- **JSONB** for flexible metadata (socials, metrics snapshots)
- **Numeric/Decimal** for money amounts (stored as strings in application code)
- **Relations** defined for type-safe joins with Drizzle

## Scripts

- `pnpm build` - Build TypeScript to JavaScript
- `pnpm typecheck` - Type check without emitting files
- `pnpm generate` - Generate migration files from schema
- `pnpm migrate` - Apply pending migrations
- `pnpm studio` - Launch Drizzle Studio UI
- `pnpm seed` - Seed database with mock data
- `pnpm clean` - Remove build artifacts

## License

Internal use only.
