/**
 * TypeScript client types for Arca Solana programs
 * 
 * This file provides IDL-shaped types and instruction builder stubs
 * for interacting with the Arca Solana programs from the web app and workers.
 * 
 * After running `anchor build`, the full IDL JSON files will be available in
 * target/idl/ and can be imported for runtime use with Anchor's Program API.
 */

import type { PublicKey } from "@solana/web3.js";

// ============================================================================
// ARCA BUYBACK PROGRAM
// ============================================================================

export interface BuybackConfig {
  authority: PublicKey;
  keeper: PublicKey;
  agentMint: PublicKey;
  platformMint: PublicKey;
  agentBps: number;      // 9000 (immutable)
  platformBps: number;   // 1000 (immutable)
  bump: number;
}

export interface BuybackExecutedEvent {
  agentMint: PublicKey;
  platformMint: PublicKey;
  revenueSpent: bigint;
  agentAmountSpent: bigint;
  platformAmountSpent: bigint;
  agentTokensBought: bigint;
  platformTokensBought: bigint;
  timestamp: bigint;
}

// Instruction builder stubs
export namespace ArcaBuyback {
  export function initialize(params: {
    authority: PublicKey;
    keeper: PublicKey;
    agentMint: PublicKey;
    platformMint: PublicKey;
  }): any {
    // TODO: Build instruction using Anchor IDL
    throw new Error("Not implemented: Use Anchor Program API with IDL");
  }

  export function executeBuyback(params: {
    keeper: PublicKey;
    revenueAmount: bigint;
  }): any {
    // TODO: Build instruction using Anchor IDL
    throw new Error("Not implemented: Use Anchor Program API with IDL");
  }
}

// ============================================================================
// ARCA ICO PROGRAM
// ============================================================================

export interface Ico {
  agentId: string;
  authority: PublicKey;
  launchFdv: bigint;
  raiseTarget: bigint;
  thresholdBps: number;
  minTicket: bigint;
  windowStart: bigint;
  windowEnd: bigint;
  totalRaised: bigint;
  contributorCount: number;
  paused: boolean;
  finalized: boolean;
  bump: number;
}

export interface ContributionEvent {
  contributor: PublicKey;
  amount: bigint;
  timestamp: bigint;
}

export interface RefundEvent {
  contributor: PublicKey;
  amount: bigint;
  timestamp: bigint;
}

export interface RaiseFinalizedEvent {
  success: boolean;
  totalRaised: bigint;
  timestamp: bigint;
}

export interface TokensClaimedEvent {
  contributor: PublicKey;
  amount: bigint;
}

// Instruction builder stubs
export namespace ArcaIco {
  export function initialize(params: {
    agentId: string;
    authority: PublicKey;
    launchFdv: bigint;
    raiseTarget: bigint;
    thresholdBps: number;
    minTicket: bigint;
    windowStart: bigint;
    windowEnd: bigint;
  }): any {
    // TODO: Build instruction using Anchor IDL
    throw new Error("Not implemented: Use Anchor Program API with IDL");
  }

  export function contribute(params: {
    contributor: PublicKey;
    amount: bigint;
  }): any {
    // TODO: Build instruction using Anchor IDL
    throw new Error("Not implemented: Use Anchor Program API with IDL");
  }

  export function refund(params: {
    contributor: PublicKey;
  }): any {
    // TODO: Build instruction using Anchor IDL
    throw new Error("Not implemented: Use Anchor Program API with IDL");
  }

  export function finalize(params: {
    authority: PublicKey;
  }): any {
    // TODO: Build instruction using Anchor IDL
    throw new Error("Not implemented: Use Anchor Program API with IDL");
  }

  export function claim(params: {
    contributor: PublicKey;
  }): any {
    // TODO: Build instruction using Anchor IDL
    throw new Error("Not implemented: Use Anchor Program API with IDL");
  }

  export function pause(params: {
    authority: PublicKey;
  }): any {
    // TODO: Build instruction using Anchor IDL
    throw new Error("Not implemented: Use Anchor Program API with IDL");
  }

  export function unpause(params: {
    authority: PublicKey;
  }): any {
    // TODO: Build instruction using Anchor IDL
    throw new Error("Not implemented: Use Anchor Program API with IDL");
  }
}

// ============================================================================
// ARCA LOCKED WALLET PROGRAM
// ============================================================================

export interface LockedWallet {
  authority: PublicKey;
  agentMint: PublicKey;
  beneficiary: PublicKey;
  released: boolean;
  bump: number;
}

// Instruction builder stubs
export namespace ArcaLockedWallet {
  export function initialize(params: {
    authority: PublicKey;
    agentMint: PublicKey;
    beneficiary: PublicKey;
  }): any {
    // TODO: Build instruction using Anchor IDL
    throw new Error("Not implemented: Use Anchor Program API with IDL");
  }

  export function release(params: {
    authority: PublicKey;
  }): any {
    // TODO: Build instruction using Anchor IDL
    throw new Error("Not implemented: Use Anchor Program API with IDL");
  }
}

// ============================================================================
// PROGRAM IDs
// ============================================================================

export const PROGRAM_IDS = {
  BUYBACK: "ArcaBuyback111111111111111111111111111111111" as const,
  ICO: "ArcaIco1111111111111111111111111111111111111" as const,
  LOCKED_WALLET: "ArcaLocked11111111111111111111111111111111" as const,
};

// ============================================================================
// USAGE NOTES
// ============================================================================

/**
 * To use these programs in production:
 * 
 * 1. Build the programs:
 *    cd packages/programs-solana
 *    anchor build
 * 
 * 2. The IDL JSON files will be in target/idl/
 * 
 * 3. Import the IDL and use Anchor's Program API:
 * 
 *    import { Program, AnchorProvider } from "@coral-xyz/anchor";
 *    import { Connection, Keypair } from "@solana/web3.js";
 *    import idl from "./target/idl/arca_buyback.json";
 * 
 *    const connection = new Connection("https://api.devnet.solana.com");
 *    const wallet = ... // your wallet adapter
 *    const provider = new AnchorProvider(connection, wallet, {});
 *    const program = new Program(idl, provider);
 * 
 *    // Call instructions:
 *    await program.methods
 *      .initialize(agentMint, platformMint)
 *      .accounts({ ... })
 *      .rpc();
 * 
 * 4. For event parsing, use program.addEventListener or parse transaction logs
 * 
 * 5. These TypeScript types are for convenience and type safety in the monorepo
 */
