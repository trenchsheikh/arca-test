# Arca V1

Verified AI agent capital markets with automated on-chain buybacks.

**Source of truth:** [docs/ARCA_V1_PRD_AND_BUILD_PLAN.md](docs/ARCA_V1_PRD_AND_BUILD_PLAN.md)

## Stack

| Layer | Choice |
| --- | --- |
| Web | Next.js 15 + TypeScript + Tailwind + Framer Motion |
| Chains | Solana (Anchor) + Robinhood Chain EVM L2 (Foundry) |
| Data | PostgreSQL + Drizzle, Redis + BullMQ |
| Realtime | `apps/ws` WebSocket for live buyback feeds |

## Monorepo

```
apps/web                 Next.js product UI (all 8 core pages)
apps/workers             Indexers, buyback keeper, finalize/refund jobs
apps/ws                  Buyback / ICO progress WebSocket
packages/shared          Types, chain constants, tokenomics
packages/db              Drizzle schema + migrations
packages/contracts-evm   Foundry: Ico, Buyback, LockedAgentWallet, PlatformFee, Factory
packages/programs-solana Anchor: arca_ico, arca_buyback, arca_locked_wallet
```

## Quick start

```bash
pnpm install
cp .env.example .env
# optional: docker compose up -d   # Postgres + Redis
pnpm --filter @arca/db generate   # already generated: drizzle/0000_init.sql
pnpm dev                          # web on :3000
pnpm --filter @arca/ws dev        # buyback WS on :3001
```

Open http://localhost:3000 — Homepage leads with **ARCA**, Discover lists mock agents, Agent Detail shows the live buyback feed (connects to WS when running).

## Current V1 status

**Shipped in this scaffold**

- Full UI for Homepage, Discover, Agent Detail (centerpiece), ICO participate, Investor/Deployer/Admin dashboards, Apply wizard
- Shared tokenomics (1B supply, 50/20/20/10, 90/10 buyback, raise = 10% FDV)
- EVM contracts with immutable buyback split + Foundry tests
- Solana Anchor program sources (need Solana toolchain to build)
- DB schema + SQL migration for all PRD entities
- Workers + WS skeletons with Redis pub/sub hooks

**Next (Phases 4–8 from PRD)**

- Wire wallet auth (SIWE / SIWS) and real contribute txs
- Deploy contracts to RH testnet `46630` + Solana devnet (`forge` / `anchor` required)
- Indexer → Postgres → WS path end-to-end on testnet
- Admin review → ICO finalize/refund against live contracts
- Audits and prod hardening

## Deploy to Vercel (web only)

Only `apps/web` is Vercel-ready. Workers (`apps/workers`) and the buyback WebSocket (`apps/ws`) need a long-running host (Railway, Fly, etc.) — leave them out of this deploy.

1. Push this repo to GitHub/GitLab/Bitbucket.
2. In Vercel → **Add New Project** → import the repo.
3. Project settings:
   - **Root Directory:** `apps/web` (important — monorepo)
   - **Framework Preset:** Next.js (auto from `vercel.json`)
   - **Install / Build:** leave as in `apps/web/vercel.json` (`pnpm install` + `pnpm --filter @arca/web build` from repo root)
   - **Node.js:** 20.x
4. Environment variables (optional for the demo):
   - `NEXT_PUBLIC_APP_URL` = `https://<your-deployment>.vercel.app` (set after first deploy if you want absolute URLs)
   - Do **not** set `NEXT_PUBLIC_WS_URL` unless you host `apps/ws` elsewhere — the UI falls back to the mock buyback feed.
5. Deploy. Demo login: username `admin`, password `pass`.

**Notes for this V1 demo on Vercel**

- Data is in-memory per serverless instance (waitlist / applications / ICO state can reset).
- No Postgres/Redis required for the current web mock APIs.
- Package manager is pinned: `pnpm@9.15.0` (`packageManager` in root `package.json`).

## Core product rule

The buyback engine is the product. ICO gets investors in; immutable 90/10 on-chain buybacks prove the investment and keep them.
