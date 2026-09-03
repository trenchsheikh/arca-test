# Arca V1 Web App

Next.js 15 web application for the Arca AI agent capital markets platform.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Animation:** Framer Motion
- **Fonts:** Syne (display) + IBM Plex Sans (body)

## Design System

### Colors

- **Ink** (#0B1220): Deep background
- **Mint** (#3DFFC0): Primary accent for buybacks and live signals
- **Chalk** (#FAFAFA): Primary text
- **Gold** (#C6A75E): Pro tier only

### Design Direction

Sharp financial terminal meets editorial. NOT purple-on-white, NOT cream+terracotta, NOT dark-mode-by-default glow.

## Project Structure

```
app/
├── page.tsx              # Homepage with waitlist
├── discover/             # Agent discovery with filters
├── agents/[slug]/        # Agent detail (most important page)
│   └── ico/              # ICO participation
├── dashboard/            # Investor dashboard
├── deployer/             # Deployer dashboard
├── apply/                # Multi-step application wizard
├── admin/                # Admin panel (internal)
└── api/                  # API routes (stubs)
    ├── waitlist/
    └── agents/

components/
├── SiteHeader.tsx
├── SiteFooter.tsx
├── TierBadge.tsx
├── StatusPill.tsx
├── BuybackLiveIndicator.tsx
├── LiveBuybackFeed.tsx   # Core buyback display
├── RaiseProgress.tsx
├── TokenomicsChart.tsx
├── BuybackFlowDiagram.tsx
├── AgentCard.tsx
└── WaitlistForm.tsx

lib/
├── mock-data.ts          # Mock agents & buyback events
└── format.ts             # Formatting utilities
```

## Getting Started

### Install Dependencies

```bash
pnpm install
```

### Development

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
pnpm build
```

### Type Check

```bash
pnpm typecheck
```

### Lint

```bash
pnpm lint
```

## Pages

### 1. Homepage `/`
- Hero with buyback positioning
- How it works section
- Waitlist capture
- CTAs to Discover and Apply

### 2. Discover `/discover`
- Filter by category, tier, status
- Search agents
- Agent cards with live buyback indicators

### 3. Agent Detail `/agents/[slug]` ⭐ MOST IMPORTANT
- Hero with tier, status, live buyback indicator
- **LiveBuybackFeed** component (core proof of concept)
- Performance metrics grid (verified on-chain)
- Raise progress (with 50% threshold marker)
- Tokenomics chart (50/20/20/10)
- Buyback mechanic diagram
- Buyback history table with explorer links

### 4. ICO Participation `/agents/[slug]/ico`
- Contribute UI with amount input
- Live allocation preview
- Progress + threshold
- Countdown timer

### 5. Investor Dashboard `/dashboard`
- Investments, claims, holdings
- PnL tracking
- **Buybacks received** (core feature)
- Transaction history

### 6. Deployer Dashboard `/deployer`
- Capital raised
- Operational wallet balance
- Revenue generated
- **Buybacks executed** (core feature)
- Current token price
- Circulating supply

### 7. Apply `/apply`
- Multi-step wizard:
  1. Profile (name, description, category, socials)
  2. Revenue verification (connect wallet, auto-pull metrics)
  3. ICO config (FDV, raise target auto 10%, threshold, vesting)
  4. Preview & submit

### 8. Admin `/admin`
- Review queue (assign tier + risk, approve/reject)
- ICO management (set live, pause, finalize, cancel)
- Platform analytics (KPIs)
- User lists

## API Stubs

### POST `/api/waitlist`
Accepts email, stores in memory, returns ok.

### GET `/api/agents`
Returns all mock agents.

### GET `/api/agents/[slug]`
Returns agent detail + buybacks.

## Wallet Integration

Wallet connect button shows "Connect" dropdown with "Solana / Robinhood" options. Currently UI-only stub.

TODO: Wire up wagmi/viem for EVM and @solana/web3.js + wallet-adapter for Solana.

## Mock Data

See `lib/mock-data.ts` for:
- 4 mock agents (3 trading, 1 ICO live)
- Buyback events across agents
- Performance metrics

## Key Design Rules

1. **Buyback engine is the centerpiece**: Live feed, history, and metrics must be visually dominant
2. **No AI-generic looks**: Custom color palette, distinctive fonts
3. **Motion**: 2-3 intentional Framer Motion moments (hero pulse, feed slide-in, progress)
4. **Homepage hero**: Full-bleed atmospheric visual, no card clutter
5. **Agent Detail**: CoinMarketCap meets hedge-fund data room

## Environment Variables

Create `.env.local`:

```env
# Add environment variables as needed
# NEXT_PUBLIC_RPC_URL_SOLANA=
# NEXT_PUBLIC_RPC_URL_ROBINHOOD=
```

## Deployment

Designed to deploy on Vercel with:
- Static generation for marketing pages
- Dynamic routes for agent details
- API routes for data fetching

## Dependencies

Workspace dependency on `@arca/shared` package (shared types and constants).

## Contributing

See main repo README and `docs/ARCA_V1_PRD_AND_BUILD_PLAN.md` for full product spec.

---

**Status:** V1 MVP - all pages functional with mock data  
**Next:** Backend integration, wallet connection, smart contracts  
**Source of truth:** `d:\arca\docs\ARCA_V1_PRD_AND_BUILD_PLAN.md`
