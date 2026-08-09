# @arca/programs-solana — Solana Programs

Anchor-based Solana programs for the Arca platform, providing parity with EVM contracts.

## Programs

### 1. `arca_buyback` — Buyback with Immutable 90/10 Split

**The centerpiece of Arca.**

- **Immutable split**: 90% agent token, 10% platform token
- Only platform keeper can execute buybacks (deployer CANNOT)
- Emits `BuybackExecuted` event with amounts and timestamp
- No instruction to modify the split (by design)

**TODO for production:**
- Integrate Jupiter CPI for actual swaps on Solana
- Handle slippage and minimum output amounts

### 2. `arca_ico` — ICO with Threshold and Refunds

Mirrors EVM ICO contract (see PRD §7.2).

- Accepts SOL contributions during raise window
- Enforces minimum ticket and raise threshold (50-80%)
- Admin can pause/unpause
- Refunds if threshold not met
- Token claims if successful

**TODO for production:**
- Implement SOL vault transfers (contribute/refund)
- Token distribution and vesting logic
- Integrate with token factory

### 3. `arca_locked_wallet` — Locked Agent Token Allocation

Holds 20% of agent token supply at launch.

- Permanently locked by default
- Release only if full operational capital is **fully deployed**
- Requires admin attestation (or oracle, TBD)

**TODO for production:**
- Define precise release condition before audit (see PRD §14 risks)

## Structure

```
packages/programs-solana/
├── Anchor.toml                  # Anchor config
├── Cargo.toml                   # Rust workspace
├── programs/
│   ├── arca_buyback/
│   │   ├── Cargo.toml
│   │   └── src/lib.rs          # Buyback program
│   ├── arca_ico/
│   │   ├── Cargo.toml
│   │   └── src/lib.rs          # ICO program
│   └── arca_locked_wallet/
│       ├── Cargo.toml
│       └── src/lib.rs          # Locked wallet program
├── ts/
│   └── index.ts                # TypeScript client types / stubs
├── package.json
├── tsconfig.json
└── README.md
```

## Prerequisites

To build these programs, you need:

- **Rust** (stable toolchain)
- **Solana CLI** (v1.18.22 or compatible)
- **Anchor CLI** (v0.30.1)

Install Anchor:

```bash
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install 0.30.1
avm use 0.30.1
```

## Building

```bash
cd packages/programs-solana
anchor build
```

This will:
- Compile all three programs
- Generate IDL JSON files in `target/idl/`
- Output program binaries in `target/deploy/`

## Testing

```bash
anchor test
```

(Note: Tests are not included in this scaffold. Add test files in `tests/` following Anchor patterns.)

## Deployment

### Localnet

```bash
solana-test-validator  # in separate terminal
anchor deploy
```

### Devnet

```bash
anchor deploy --provider.cluster devnet
```

### Mainnet

```bash
anchor deploy --provider.cluster mainnet-beta
```

Update program IDs in `Anchor.toml` after initial deployment.

## TypeScript Client

After building, import the IDL JSON files and use with Anchor's `Program` API:

```typescript
import { Program, AnchorProvider } from "@coral-xyz/anchor";
import { Connection, Keypair } from "@solana/web3.js";
import idl from "./target/idl/arca_buyback.json";

const connection = new Connection("https://api.devnet.solana.com");
const provider = new AnchorProvider(connection, wallet, {});
const program = new Program(idl, provider);

// Call initialize
await program.methods
  .initialize(agentMint, platformMint)
  .accounts({
    config: ...,
    authority: ...,
    keeper: ...,
    systemProgram: ...,
  })
  .rpc();
```

See `ts/index.ts` for type definitions and usage notes.

## Contract Invariants

These programs enforce the same invariants as the EVM contracts (see PRD §7.1):

| ID | Invariant |
|----|-----------|
| SC-INV-01 | Buyback split fixed at 90/10 forever after launch initialization |
| SC-INV-02 | Deployer cannot modify, pause, or redirect buyback routing |
| SC-INV-03 | Only admin/platform roles may pause ICO contribution window |
| SC-INV-04 | Raise threshold unmet at close ⇒ refunds; no token distribution |
| SC-INV-05 | Raise threshold met ⇒ tokens distributed; SOL to operational wallet |
| SC-INV-06 | Agent token allocation 20% locked until release condition |
| SC-INV-08 | All buybacks emit public events |

## Production Checklist

Before mainnet:

- [ ] Complete Jupiter CPI integration in `arca_buyback`
- [ ] Implement SOL vault transfers in `arca_ico`
- [ ] Define and implement release condition in `arca_locked_wallet`
- [ ] Add comprehensive tests (unit, integration, fuzz)
- [ ] External audit (both Solana and EVM)
- [ ] Deploy with multisig authority (Squads on Solana)
- [ ] Publish verified IDL
- [ ] Document keeper crank setup

## Parity with EVM

These Solana programs mirror the EVM contracts on Robinhood Chain:

| Solana Program | EVM Contract | Notes |
|----------------|--------------|-------|
| `arca_buyback` | `ArcaBuyback.sol` | Same 90/10 invariant; Jupiter vs Uniswap |
| `arca_ico` | `ArcaICO.sol` | Same threshold/refund logic |
| `arca_locked_wallet` | `ArcaLockedWallet.sol` | Same release condition |

## Notes

- Full Anchor build may not run without Solana toolchain installed, but the Rust source and TS client types are provided for review and integration.
- Update placeholder program IDs in `Anchor.toml` after first deploy.
- For indexing events, use Helius webhooks or direct RPC transaction parsing (see `@arca/workers`).
