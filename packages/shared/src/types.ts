import type { ChainType } from './chains';

/**
 * Agent tier (admin-assigned, not self-selected).
 */
export type AgentTier = 'seed' | 'core' | 'pro';

/**
 * Risk rating assigned by admin during review.
 */
export type RiskRating = 'low' | 'medium' | 'high';

/**
 * Agent category/vertical.
 */
export type AgentCategory =
  | 'Trading'
  | 'Prediction'
  | 'Arbitrage'
  | 'Yield'
  | 'Research'
  | 'Other';

/**
 * Agent/ICO status in the lifecycle.
 */
export type AgentStatus =
  | 'Submitted'
  | 'UnderReview'
  | 'Approved'
  | 'IcoUpcoming'
  | 'IcoLive'
  | 'Successful'
  | 'Failed'
  | 'Refunded'
  | 'Trading'
  | 'Rejected'
  | 'NeedsInfo'
  | 'Cancelled';

/**
 * Agent entity (maps to agents table).
 */
export interface Agent {
  id: string;
  slug: string;
  name: string;
  description: string;
  oneLiner?: string;
  logoUrl?: string;
  category: AgentCategory;
  tier?: AgentTier;
  riskRating?: RiskRating;
  status: AgentStatus;
  chain: ChainType;
  website?: string;
  docsUrl?: string;
  socials?: Record<string, string>; // e.g. { twitter: "...", discord: "..." }
  launchFdvUsd?: string; // decimal string
  raiseTargetUsd?: string; // decimal string
  raiseThresholdBps?: number;
  minTicketNative?: string; // decimal string
  tokenAddress?: string;
  icoAddress?: string;
  buybackAddress?: string;
  agentWalletAddress?: string;
  operationalWalletAddress?: string;
  createdByUserId: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * ICO entity (maps to icos table).
 */
export interface Ico {
  id: string;
  agentId: string;
  startsAt?: Date;
  endsAt?: Date;
  totalRaisedNative?: string; // decimal string
  contributorCount: number;
  finalizedAt?: Date;
  outcome?: 'success' | 'failed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Contribution to an ICO (maps to contributions table).
 */
export interface Contribution {
  id: string;
  icoId: string;
  walletAddress: string;
  amountNative: string; // decimal string
  txHash: string;
  refundedAt?: Date;
  claimTxHash?: string;
  createdAt: Date;
}

/**
 * Buyback event (maps to buyback_events table).
 */
export interface BuybackEvent {
  id: string;
  agentId: string;
  chain: ChainType;
  txHash: string;
  revenueSpent: string; // decimal string - total revenue allocated to this buyback
  agentTokensBought: string; // decimal string - tokens bought for agent
  platformTokensBought: string; // decimal string - tokens bought for platform
  amounts?: Record<string, string>; // additional amount tracking
  blockTime: Date;
  rawEvent?: Record<string, unknown>; // jsonb of raw chain event
  createdAt: Date;
}

/**
 * Fee collection event (maps to fee_events table).
 */
export interface FeeEvent {
  id: string;
  agentId: string;
  txHash: string;
  totalFee: string; // decimal string
  treasuryShare: string; // decimal string
  deployerShare: string; // decimal string
  blockTime: Date;
  createdAt: Date;
}

/**
 * Vesting schedule (maps to vesting_schedules table).
 */
export interface VestingSchedule {
  id: string;
  agentId: string;
  cliffSeconds: number;
  durationSeconds: number;
  beneficiary: string;
  createdAt: Date;
}

/**
 * Team member (maps to agent_team_members table).
 */
export interface TeamMember {
  id: string;
  agentId: string;
  name: string;
  role: string;
  profileUrl?: string;
  createdAt: Date;
}

/**
 * Agent document (maps to agent_documents table).
 */
export interface AgentDocument {
  id: string;
  agentId: string;
  type: 'strategy' | 'audit' | 'other';
  url: string;
  createdAt: Date;
}
