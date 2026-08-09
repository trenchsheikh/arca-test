import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  integer,
  jsonb,
  numeric,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

/**
 * Enums
 */
export const roleEnum = pgEnum('role', ['investor', 'deployer', 'admin']);

export const chainEnum = pgEnum('chain', ['solana', 'robinhood']);

export const agentTierEnum = pgEnum('agent_tier', ['seed', 'core', 'pro']);

export const riskRatingEnum = pgEnum('risk_rating', ['low', 'medium', 'high']);

export const agentCategoryEnum = pgEnum('agent_category', [
  'Trading',
  'Prediction',
  'Arbitrage',
  'Yield',
  'Research',
  'Other',
]);

export const agentStatusEnum = pgEnum('agent_status', [
  'Submitted',
  'UnderReview',
  'Approved',
  'IcoUpcoming',
  'IcoLive',
  'Successful',
  'Failed',
  'Refunded',
  'Trading',
  'Rejected',
  'NeedsInfo',
  'Cancelled',
]);

export const documentTypeEnum = pgEnum('document_type', [
  'strategy',
  'audit',
  'other',
]);

export const icoOutcomeEnum = pgEnum('ico_outcome', [
  'success',
  'failed',
  'cancelled',
]);

export const reviewDecisionEnum = pgEnum('review_decision', [
  'approved',
  'rejected',
  'needs_info',
]);

/**
 * Tables
 */

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  role: roleEnum('role').notNull().default('investor'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Wallets table
export const wallets = pgTable('wallets', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  chain: chainEnum('chain').notNull(),
  address: text('address').notNull(),
  isPrimary: boolean('is_primary').notNull().default(false),
  verifiedAt: timestamp('verified_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Agents table
export const agents = pgTable('agents', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  oneLiner: text('one_liner'),
  logoUrl: text('logo_url'),
  category: agentCategoryEnum('category').notNull(),
  tier: agentTierEnum('tier'),
  riskRating: riskRatingEnum('risk_rating'),
  status: agentStatusEnum('status').notNull().default('Submitted'),
  chain: chainEnum('chain').notNull(),
  website: text('website'),
  docsUrl: text('docs_url'),
  socials: jsonb('socials').$type<Record<string, string>>(),
  launchFdvUsd: numeric('launch_fdv_usd', { precision: 20, scale: 2 }),
  raiseTargetUsd: numeric('raise_target_usd', { precision: 20, scale: 2 }),
  raiseThresholdBps: integer('raise_threshold_bps'),
  minTicketNative: numeric('min_ticket_native', { precision: 20, scale: 8 }),
  tokenAddress: text('token_address'),
  icoAddress: text('ico_address'),
  buybackAddress: text('buyback_address'),
  agentWalletAddress: text('agent_wallet_address'),
  operationalWalletAddress: text('operational_wallet_address'),
  createdByUserId: uuid('created_by_user_id')
    .notNull()
    .references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Agent team members table
export const agentTeamMembers = pgTable('agent_team_members', {
  id: uuid('id').primaryKey().defaultRandom(),
  agentId: uuid('agent_id')
    .notNull()
    .references(() => agents.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  role: text('role').notNull(),
  profileUrl: text('profile_url'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Agent documents table
export const agentDocuments = pgTable('agent_documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  agentId: uuid('agent_id')
    .notNull()
    .references(() => agents.id, { onDelete: 'cascade' }),
  type: documentTypeEnum('type').notNull(),
  url: text('url').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Applications table
export const applications = pgTable('applications', {
  id: uuid('id').primaryKey().defaultRandom(),
  agentId: uuid('agent_id')
    .notNull()
    .references(() => agents.id, { onDelete: 'cascade' }),
  payload: jsonb('payload').$type<Record<string, unknown>>().notNull(),
  status: agentStatusEnum('status').notNull().default('Submitted'),
  submittedAt: timestamp('submitted_at').notNull().defaultNow(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Reviews table
export const reviews = pgTable('reviews', {
  id: uuid('id').primaryKey().defaultRandom(),
  applicationId: uuid('application_id')
    .notNull()
    .references(() => applications.id, { onDelete: 'cascade' }),
  adminId: uuid('admin_id')
    .notNull()
    .references(() => users.id),
  circularityFlag: boolean('circularity_flag').notNull().default(false),
  notes: text('notes'),
  decision: reviewDecisionEnum('decision'),
  tierAssigned: agentTierEnum('tier_assigned'),
  riskAssigned: riskRatingEnum('risk_assigned'),
  decidedAt: timestamp('decided_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Revenue wallets table
export const revenueWallets = pgTable('revenue_wallets', {
  id: uuid('id').primaryKey().defaultRandom(),
  agentId: uuid('agent_id')
    .notNull()
    .references(() => agents.id, { onDelete: 'cascade' }),
  chain: chainEnum('chain').notNull(),
  address: text('address').notNull(),
  metricsSnapshot: jsonb('metrics_snapshot').$type<Record<string, unknown>>(),
  lastSyncedAt: timestamp('last_synced_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ICOs table
export const icos = pgTable('icos', {
  id: uuid('id').primaryKey().defaultRandom(),
  agentId: uuid('agent_id')
    .notNull()
    .references(() => agents.id, { onDelete: 'cascade' }),
  startsAt: timestamp('starts_at'),
  endsAt: timestamp('ends_at'),
  totalRaisedNative: numeric('total_raised_native', {
    precision: 20,
    scale: 8,
  }).default('0'),
  contributorCount: integer('contributor_count').notNull().default(0),
  finalizedAt: timestamp('finalized_at'),
  outcome: icoOutcomeEnum('outcome'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Contributions table
export const contributions = pgTable('contributions', {
  id: uuid('id').primaryKey().defaultRandom(),
  icoId: uuid('ico_id')
    .notNull()
    .references(() => icos.id, { onDelete: 'cascade' }),
  walletAddress: text('wallet_address').notNull(),
  amountNative: numeric('amount_native', { precision: 20, scale: 8 }).notNull(),
  txHash: text('tx_hash').notNull().unique(),
  refundedAt: timestamp('refunded_at'),
  claimTxHash: text('claim_tx_hash'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Vesting schedules table
export const vestingSchedules = pgTable('vesting_schedules', {
  id: uuid('id').primaryKey().defaultRandom(),
  agentId: uuid('agent_id')
    .notNull()
    .references(() => agents.id, { onDelete: 'cascade' }),
  cliffSeconds: integer('cliff_seconds').notNull(),
  durationSeconds: integer('duration_seconds').notNull(),
  beneficiary: text('beneficiary').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Buyback events table
export const buybackEvents = pgTable('buyback_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  agentId: uuid('agent_id')
    .notNull()
    .references(() => agents.id, { onDelete: 'cascade' }),
  chain: chainEnum('chain').notNull(),
  txHash: text('tx_hash').notNull().unique(),
  revenueSpent: numeric('revenue_spent', { precision: 20, scale: 8 }).notNull(),
  agentTokensBought: numeric('agent_tokens_bought', {
    precision: 20,
    scale: 8,
  }).notNull(),
  platformTokensBought: numeric('platform_tokens_bought', {
    precision: 20,
    scale: 8,
  }).notNull(),
  amounts: jsonb('amounts').$type<Record<string, string>>(),
  blockTime: timestamp('block_time').notNull(),
  rawEvent: jsonb('raw_event').$type<Record<string, unknown>>(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Fee events table
export const feeEvents = pgTable('fee_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  agentId: uuid('agent_id')
    .notNull()
    .references(() => agents.id, { onDelete: 'cascade' }),
  txHash: text('tx_hash').notNull().unique(),
  totalFee: numeric('total_fee', { precision: 20, scale: 8 }).notNull(),
  treasuryShare: numeric('treasury_share', {
    precision: 20,
    scale: 8,
  }).notNull(),
  deployerShare: numeric('deployer_share', {
    precision: 20,
    scale: 8,
  }).notNull(),
  blockTime: timestamp('block_time').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Platform config table
export const platformConfig = pgTable('platform_config', {
  id: uuid('id').primaryKey().defaultRandom(),
  key: text('key').notNull().unique(),
  value: jsonb('value').$type<unknown>().notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Waitlist table
export const waitlist = pgTable('waitlist', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Admin audit log table
export const adminAuditLog = pgTable('admin_audit_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  actorId: uuid('actor_id')
    .notNull()
    .references(() => users.id),
  action: text('action').notNull(),
  entity: text('entity').notNull(),
  entityId: uuid('entity_id'),
  metadata: jsonb('metadata').$type<Record<string, unknown>>(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Indexer checkpoints table
export const indexerCheckpoints = pgTable('indexer_checkpoints', {
  id: uuid('id').primaryKey().defaultRandom(),
  chain: chainEnum('chain').notNull(),
  program: text('program').notNull(),
  lastBlock: text('last_block').notNull(),
  lastSignature: text('last_signature'),
  confirmedAt: timestamp('confirmed_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

/**
 * Relations
 */

export const usersRelations = relations(users, ({ many }) => ({
  wallets: many(wallets),
  agentsCreated: many(agents),
  reviews: many(reviews),
  auditLogs: many(adminAuditLog),
}));

export const walletsRelations = relations(wallets, ({ one }) => ({
  user: one(users, {
    fields: [wallets.userId],
    references: [users.id],
  }),
}));

export const agentsRelations = relations(agents, ({ one, many }) => ({
  creator: one(users, {
    fields: [agents.createdByUserId],
    references: [users.id],
  }),
  teamMembers: many(agentTeamMembers),
  documents: many(agentDocuments),
  applications: many(applications),
  revenueWallets: many(revenueWallets),
  icos: many(icos),
  vestingSchedules: many(vestingSchedules),
  buybackEvents: many(buybackEvents),
  feeEvents: many(feeEvents),
}));

export const agentTeamMembersRelations = relations(
  agentTeamMembers,
  ({ one }) => ({
    agent: one(agents, {
      fields: [agentTeamMembers.agentId],
      references: [agents.id],
    }),
  })
);

export const agentDocumentsRelations = relations(agentDocuments, ({ one }) => ({
  agent: one(agents, {
    fields: [agentDocuments.agentId],
    references: [agents.id],
  }),
}));

export const applicationsRelations = relations(applications, ({ one, many }) => ({
  agent: one(agents, {
    fields: [applications.agentId],
    references: [agents.id],
  }),
  reviews: many(reviews),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  application: one(applications, {
    fields: [reviews.applicationId],
    references: [applications.id],
  }),
  admin: one(users, {
    fields: [reviews.adminId],
    references: [users.id],
  }),
}));

export const revenueWalletsRelations = relations(revenueWallets, ({ one }) => ({
  agent: one(agents, {
    fields: [revenueWallets.agentId],
    references: [agents.id],
  }),
}));

export const icosRelations = relations(icos, ({ one, many }) => ({
  agent: one(agents, {
    fields: [icos.agentId],
    references: [agents.id],
  }),
  contributions: many(contributions),
}));

export const contributionsRelations = relations(contributions, ({ one }) => ({
  ico: one(icos, {
    fields: [contributions.icoId],
    references: [icos.id],
  }),
}));

export const vestingSchedulesRelations = relations(
  vestingSchedules,
  ({ one }) => ({
    agent: one(agents, {
      fields: [vestingSchedules.agentId],
      references: [agents.id],
    }),
  })
);

export const buybackEventsRelations = relations(buybackEvents, ({ one }) => ({
  agent: one(agents, {
    fields: [buybackEvents.agentId],
    references: [agents.id],
  }),
}));

export const feeEventsRelations = relations(feeEvents, ({ one }) => ({
  agent: one(agents, {
    fields: [feeEvents.agentId],
    references: [agents.id],
  }),
}));

export const adminAuditLogRelations = relations(adminAuditLog, ({ one }) => ({
  actor: one(users, {
    fields: [adminAuditLog.actorId],
    references: [users.id],
  }),
}));
