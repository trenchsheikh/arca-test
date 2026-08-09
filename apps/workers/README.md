# @arca/workers — BullMQ Workers

Background job processors for the Arca platform.

## Queues

| Queue Name | Processor | Purpose |
|------------|-----------|---------|
| `buyback-keeper` | `buyback-keeper.ts` | **Periodic buyback execution** — the core of the Arca engine. Queries agents with pending revenue, executes 90/10 buyback splits, and publishes events to Redis |
| `finalize-ico` | `finalize-ico.ts` | Finalizes successful ICOs: deploys tokens, seeds LP, transfers funds to operational wallet |
| `refund-ico` | `refund-ico.ts` | Processes refunds when ICO fails or is cancelled |
| `index-evm-logs` | `index-evm-logs.ts` | Indexes events from EVM contracts (Robinhood Chain) into Postgres |
| `index-solana` | `index-solana.ts` | Indexes Solana program events/transactions into Postgres |
| `sync-revenue-wallets` | `sync-revenue-wallets.ts` | Syncs metrics from agent revenue wallets for verification and performance tracking |

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `REDIS_URL` | `redis://localhost:6379` | Redis connection URL for BullMQ |
| `BUYBACK_FREQUENCY_MINUTES` | `60` | Buyback keeper cron frequency in minutes |

## Scripts

```bash
pnpm dev        # Watch mode with tsx
pnpm start      # Production mode
pnpm typecheck  # Type checking
```

## Architecture

### Buyback Flow

```
┌─────────────────┐
│ buyback-keeper  │ (repeatable job every N minutes)
└────────┬────────┘
         │
         v
┌─────────────────────────────────────────────────────┐
│ 1. Query agents with pending revenue                │
│ 2. Execute buyback contract:                        │
│    - 90% → agent token buy (Uniswap/Jupiter)        │
│    - 10% → platform token buy                       │
│ 3. Index BuybackExecuted event to Postgres          │
│ 4. Publish to Redis "arca:buybacks"                 │
└────────┬────────────────────────────────────────────┘
         │
         v
┌─────────────────┐
│   @arca/ws      │ ──> WebSocket clients
│   (fanout)      │
└─────────────────┘
```

### ICO Flow

```
┌──────────────┐
│  ICO closes  │
└──────┬───────┘
       │
       ├──> Threshold met ──> finalize-ico ──> Token deploy, LP seed, claims
       │
       └──> Threshold NOT met ──> refund-ico ──> Refund contributors
```

### Indexing Flow

```
┌─────────────────┐         ┌──────────────────┐
│  Chain events   │────────>│  index-evm-logs  │
│  (Alchemy WS)   │         │  index-solana    │
└─────────────────┘         └────────┬─────────┘
                                     │
                                     v
                            ┌────────────────┐
                            │   Postgres     │
                            │   (buyback_    │
                            │    events,     │
                            │    contribs)   │
                            └────────────────┘
```

## Production Deployment

1. Set `REDIS_URL` to your managed Redis instance
2. Configure `BUYBACK_FREQUENCY_MINUTES` per platform policy (default: 60 minutes)
3. Deploy as persistent workers (e.g., Fly.io, Railway)
4. Set up Alchemy WebSocket subscriptions for EVM log indexing
5. Configure Helius webhooks for Solana transaction monitoring
6. Monitor job success rate and latency via BullMQ metrics
7. Set up alerts for failed buybacks (P0 incident)

## TODOs

All processors have clear TODOs for production implementation:

- **Buyback keeper**: Integrate viem (EVM) and @solana/web3.js (Solana) for actual contract calls to Jupiter/Uniswap
- **Indexers**: Subscribe to contract logs via viem (EVM) and Helius webhooks (Solana)
- **Finalize/Refund**: Implement factory deployment and claim/refund flows
- **Revenue sync**: Query transaction history and calculate metrics for admin review

## Dependencies

- `@arca/shared` — Shared types, constants, and utilities (workspace dependency)
- `bullmq` — Queue and worker infrastructure
- `ioredis` — Redis client for BullMQ and pub/sub
- `viem` — EVM client for Robinhood Chain contracts

## Testing

For local testing without full chain setup:

1. Run Redis: `docker-compose up redis`
2. Start workers: `pnpm dev`
3. The buyback keeper will emit demo events every hour (configurable)
4. Check logs for simulated buyback events published to Redis
