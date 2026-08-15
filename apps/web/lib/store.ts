/**
 * In-memory product store for mock operations.
 * Module-level singleton - state persists for the lifetime of the Node process.
 */

import { mockAgents, mockBuybackEvents, type Agent, type BuybackEvent } from './mock-data';

export type ApplicationStatus = 
  | 'Submitted'
  | 'UnderReview' 
  | 'NeedsInfo'
  | 'Approved'
  | 'Rejected';

export interface TeamMember {
  name: string;
  role: string;
  profileUrl?: string;
}

export interface DocumentMeta {
  type: 'strategy' | 'audit' | 'other';
  title: string;
  url: string;
}

export interface Application {
  id: string;
  status: ApplicationStatus;
  
  // Profile fields
  name: string;
  description: string;
  oneLiner: string;
  logoUrl?: string;
  category: string;
  website?: string;
  docs?: string;
  twitter?: string;
  team: TeamMember[];
  
  // Revenue & wallet
  revenueWallet: string;
  chain: 'solana' | 'robinhood';
  
  // ICO config
  launchFdv: number;
  raiseTarget: number; // auto 10%
  thresholdBps: number; // 5000-8000
  vestingCliffDays: number;
  vestingDurationDays: number;
  
  // Documents
  documentsMeta: DocumentMeta[];
  
  // Admin review fields (populated on review)
  tier?: 'Seed' | 'Core' | 'Pro' | null;
  riskRating?: 'Low' | 'Medium' | 'High';
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

export interface IcoContribution {
  wallet: string;
  amount: number;
  timestamp: Date;
  txHash: string;
}

export interface IcoSession {
  agentId: string;
  contributions: IcoContribution[];
  endsAt: Date;
  totalRaised: number;
}

export interface InvestorPosition {
  wallet: string;
  agentId: string;
  contributed: number;
  tokensAllocated: number;
  claimable: boolean;
  refundable: boolean;
  claimed: boolean;
  refunded: boolean;
  claimedAt?: Date;
  refundedAt?: Date;
}

export interface InvestorTransaction {
  id: string;
  wallet: string;
  agentId: string;
  type: 'contribute' | 'claim' | 'refund' | 'buyback';
  amount: number;
  timestamp: Date;
  txHash: string;
  status: 'pending' | 'confirmed' | 'failed';
}

// Module-level state (survive Next.js HMR via globalThis)
type StoreShape = {
  waitlist: Set<string>;
  applications: Application[];
  agents: Agent[];
  icoSessions: Map<string, IcoSession>;
  investorPositions: InvestorPosition[];
  transactions: InvestorTransaction[];
};

const globalStore = globalThis as typeof globalThis & { __arcaStore?: StoreShape };

function createInitialStore(): StoreShape {
  return {
    waitlist: new Set<string>(),
    applications: [] as Application[],
    agents: [...mockAgents] as Agent[],
    icoSessions: new Map<string, IcoSession>(),
    investorPositions: [] as InvestorPosition[],
    transactions: [] as InvestorTransaction[],
  };
}

const store: StoreShape = globalStore.__arcaStore ?? createInitialStore();
globalStore.__arcaStore = store;

/** Keep catalog agents in sync with mock-data across HMR (preserve app-created agents). */
function syncCatalogAgents() {
  const mockIds = new Set(mockAgents.map((a) => a.id));
  const extras = store.agents.filter(
    (a) => !mockIds.has(a.id) && a.id.startsWith('agent-'),
  );
  const fingerprint = mockAgents.map((a) => `${a.id}:${a.name}`).join('|');
  const currentFingerprint = store.agents
    .filter((a) => mockIds.has(a.id))
    .map((a) => `${a.id}:${a.name}`)
    .join('|');

  if (
    fingerprint !== currentFingerprint ||
    store.agents.length !== mockAgents.length + extras.length
  ) {
    store.agents = [...mockAgents, ...extras];
  }
}

syncCatalogAgents();

// Initialize demo ICO session once
if (!store.icoSessions.size) {
  const predictionNexusAgent = store.agents.find((a) => a.slug === 'prediction-nexus');
  if (predictionNexusAgent) {
    store.icoSessions.set(predictionNexusAgent.id, {
      agentId: predictionNexusAgent.id,
      contributions: [
        {
          wallet: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
          amount: 15200,
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12),
          txHash: '0xabc123...',
        },
        {
          wallet: 'DYw8j...kL3n',
          amount: 22200,
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6),
          txHash: '3Kx9m...',
        },
      ],
      endsAt: new Date(Date.now() + 1000 * 60 * 60 * 48),
      totalRaised: 37400,
    });

    store.investorPositions.push(
      {
        wallet: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        agentId: predictionNexusAgent.id,
        contributed: 15200,
        tokensAllocated: 0,
        claimable: false,
        refundable: false,
        claimed: false,
        refunded: false,
      },
      {
        wallet: 'DYw8j...kL3n',
        agentId: predictionNexusAgent.id,
        contributed: 22200,
        tokensAllocated: 0,
        claimable: false,
        refundable: false,
        claimed: false,
        refunded: false,
      },
    );
  }
}

// Mock positions for Trading agents (claimable), only once
if (!store.investorPositions.some((p) => p.agentId === 'quantum-flux')) {
  const quantumFlux = store.agents.find((a) => a.slug === 'quantum-flux');
  if (quantumFlux) {
    store.investorPositions.push({
      wallet: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      agentId: quantumFlux.id,
      contributed: 5.0,
      tokensAllocated: 10_000_000,
      claimable: true,
      refundable: false,
      claimed: false,
      refunded: false,
    });
  }
}

// Waitlist API
export function addToWaitlist(email: string): void {
  store.waitlist.add(email.toLowerCase());
}

export function getWaitlist(): string[] {
  return Array.from(store.waitlist);
}

// Applications API
export function createApplication(
  data: Partial<Application> & {
    name: string;
    description: string;
    category: string;
    chain: 'solana' | 'robinhood';
    launchFdv: number;
    revenueWallet: string;
  },
): Application {
  const launchFdv = Number(data.launchFdv);
  const raiseTarget = launchFdv * 0.1;
  const thresholdBps = Math.min(
    8000,
    Math.max(5000, Number(data.thresholdBps ?? 5000)),
  );

  const app: Application = {
    id: `app-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    status: 'Submitted',
    name: data.name,
    description: data.description,
    oneLiner: data.oneLiner || data.description.slice(0, 80),
    logoUrl: data.logoUrl,
    category: data.category,
    website: data.website,
    docs: data.docs,
    twitter: data.twitter,
    team: data.team || [],
    revenueWallet: data.revenueWallet,
    chain: data.chain,
    launchFdv,
    raiseTarget,
    thresholdBps,
    vestingCliffDays: Number(data.vestingCliffDays ?? 30),
    vestingDurationDays: Number(data.vestingDurationDays ?? 365),
    documentsMeta: data.documentsMeta || (data as { documents?: Application['documentsMeta'] }).documents || [],
    tier: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  store.applications.push(app);
  return app;
}

export function getApplications(status?: ApplicationStatus): Application[] {
  if (status) {
    return store.applications.filter(a => a.status === status);
  }
  return store.applications;
}

export function getApplicationById(id: string): Application | undefined {
  return store.applications.find(a => a.id === id);
}

export function updateApplication(id: string, updates: Partial<Application>): Application | undefined {
  const app = store.applications.find(a => a.id === id);
  if (!app) return undefined;
  
  Object.assign(app, updates, { updatedAt: new Date() });
  return app;
}

export function approveApplication(
  id: string,
  tier: 'Seed' | 'Core' | 'Pro',
  riskRating: 'Low' | 'Medium' | 'High'
): { application: Application; agent: Agent } | undefined {
  const app = store.applications.find(a => a.id === id);
  if (!app) return undefined;
  
  app.status = 'Approved';
  app.tier = tier;
  app.riskRating = riskRating;
  app.updatedAt = new Date();
  
  // Create or update agent
  const existingAgent = store.agents.find(a => a.name === app.name);
  if (existingAgent) {
    existingAgent.status = 'ICO Upcoming';
    existingAgent.tier = tier;
    existingAgent.riskRating = riskRating;
    return { application: app, agent: existingAgent };
  }
  
  const agent: Agent = {
    id: `agent-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    slug: app.name.toLowerCase().replace(/\s+/g, '-'),
    name: app.name,
    ticker: app.name.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6).toUpperCase() || 'AGENT',
    deployer: `@${(app.team[0]?.name || app.name).toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 12) || 'deployer'}`,
    oneLiner: app.oneLiner,
    description: app.description,
    logoUrl: app.logoUrl || '',
    category: app.category as any,
    tier,
    status: 'ICO Upcoming',
    chain: app.chain,
    
    totalRevenue: 0,
    tradingVolume: 0,
    winRate: 0,
    avgMonthlyReturn: 0,
    capitalDeployed: 0,
    walletAge: 0,
    numPositions: 0,
    riskRating,
    
    launchFdv: app.launchFdv,
    raiseTarget: app.raiseTarget,
    amountRaised: 0,
    raiseThreshold: app.thresholdBps / 10000,
    minTicket: 0.1,
    tokenPrice: app.launchFdv / 1_000_000_000,
    
    currentPrice: 0,
    priceChange24h: 0,
    circulatingSupply: 0,
    
    totalBuybacks: 0,
    
    website: app.website,
    docs: app.docs,
    twitter: app.twitter,
    
    team: app.team,
    documents: app.documentsMeta,
    drawdownHistory: [],
    vestingCliffDays: app.vestingCliffDays,
    vestingDurationDays: app.vestingDurationDays,
  };
  
  store.agents.push(agent);
  return { application: app, agent };
}

// Agents API
export function getAgents(): Agent[] {
  syncCatalogAgents();
  return store.agents;
}

export function getAgentBySlug(slug: string): Agent | undefined {
  syncCatalogAgents();
  return store.agents.find(a => a.slug === slug);
}

export function getAgentById(id: string): Agent | undefined {
  syncCatalogAgents();
  return store.agents.find(a => a.id === id);
}

export function updateAgent(id: string, updates: Partial<Agent>): Agent | undefined {
  const agent = store.agents.find(a => a.id === id);
  if (!agent) return undefined;
  
  Object.assign(agent, updates);
  return agent;
}

// ICO Sessions API
export function getIcoSession(agentId: string): IcoSession | undefined {
  return store.icoSessions.get(agentId);
}

export function createIcoSession(agentId: string, endsAt: Date): IcoSession {
  const session: IcoSession = {
    agentId,
    contributions: [],
    endsAt,
    totalRaised: 0,
  };
  store.icoSessions.set(agentId, session);
  return session;
}

export function addContribution(
  agentId: string,
  wallet: string,
  amount: number
): { contribution: IcoContribution; tokensAllocated: number } {
  const session = store.icoSessions.get(agentId);
  const agent = store.agents.find(a => a.id === agentId);
  
  if (!session || !agent) {
    throw new Error('ICO session or agent not found');
  }
  
  const contribution: IcoContribution = {
    wallet,
    amount,
    timestamp: new Date(),
    txHash: `0x${Math.random().toString(16).substring(2, 10)}...`,
  };
  
  session.contributions.push(contribution);
  session.totalRaised += amount;
  agent.amountRaised = session.totalRaised;
  
  // Calculate tokens using preview (against target for UI display)
  const presaleTokens = 100_000_000; // 10% of 1B
  const tokensAllocated = (amount / agent.raiseTarget) * presaleTokens;
  
  // Update or create investor position
  let position = store.investorPositions.find(
    p => p.wallet === wallet && p.agentId === agentId
  );
  
  if (position) {
    position.contributed += amount;
    position.tokensAllocated += tokensAllocated;
  } else {
    position = {
      wallet,
      agentId,
      contributed: amount,
      tokensAllocated,
      claimable: false,
      refundable: false,
      claimed: false,
      refunded: false,
    };
    store.investorPositions.push(position);
  }
  
  // Add transaction
  store.transactions.push({
    id: `tx-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    wallet,
    agentId,
    type: 'contribute',
    amount,
    timestamp: new Date(),
    txHash: contribution.txHash,
    status: 'confirmed',
  });
  
  return { contribution, tokensAllocated };
}

export function finalizeIco(
  agentId: string,
  success?: boolean,
): { agent: Agent; positions: InvestorPosition[] } | undefined {
  const session = store.icoSessions.get(agentId);
  const agent = store.agents.find(a => a.id === agentId);
  
  if (!session || !agent) return undefined;

  const thresholdAmount = agent.raiseTarget * agent.raiseThreshold;
  const resolvedSuccess =
    typeof success === 'boolean' ? success : agent.amountRaised >= thresholdAmount;
  
  const positions = store.investorPositions.filter(p => p.agentId === agentId);
  
  if (resolvedSuccess) {
    agent.status = 'Successful';
    
    // Recalculate final allocations based on actual total raised
    const presaleTokens = 100_000_000;
    const total = session.totalRaised || agent.amountRaised || 1;
    positions.forEach(pos => {
      pos.tokensAllocated = (pos.contributed / total) * presaleTokens;
      pos.claimable = true;
      pos.refundable = false;
    });
    
    // After a short delay, move to Trading
    setTimeout(() => {
      agent.status = 'Trading';
      agent.currentPrice = agent.tokenPrice * 1.2;
      agent.circulatingSupply = 500_000_000;
    }, 1000);
  } else {
    agent.status = 'Failed';
    
    positions.forEach(pos => {
      pos.claimable = false;
      pos.refundable = true;
    });
  }
  
  return { agent, positions };
}

export function claimTokens(wallet: string, agentId: string): InvestorPosition | undefined {
  const position = store.investorPositions.find(
    p => p.wallet === wallet && p.agentId === agentId && p.claimable && !p.claimed
  );
  
  if (!position) return undefined;
  
  position.claimed = true;
  position.claimedAt = new Date();
  
  // Add transaction
  store.transactions.push({
    id: `tx-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    wallet,
    agentId,
    type: 'claim',
    amount: position.tokensAllocated,
    timestamp: new Date(),
    txHash: `0x${Math.random().toString(16).substring(2, 10)}...`,
    status: 'confirmed',
  });
  
  return position;
}

export function refundContribution(wallet: string, agentId: string): InvestorPosition | undefined {
  const position = store.investorPositions.find(
    p => p.wallet === wallet && p.agentId === agentId && p.refundable && !p.refunded
  );
  
  if (!position) return undefined;
  
  position.refunded = true;
  position.refundedAt = new Date();
  
  // Add transaction
  store.transactions.push({
    id: `tx-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    wallet,
    agentId,
    type: 'refund',
    amount: position.contributed,
    timestamp: new Date(),
    txHash: `0x${Math.random().toString(16).substring(2, 10)}...`,
    status: 'confirmed',
  });
  
  return position;
}

// Investor portfolio API
export function getInvestorPositions(wallet: string): InvestorPosition[] {
  return store.investorPositions.filter(p => p.wallet === wallet);
}

export function getInvestorTransactions(wallet: string): InvestorTransaction[] {
  return store.transactions
    .filter(t => t.wallet === wallet)
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

// Buyback API (uses mock data)
export function getBuybackEvents(agentId?: string): BuybackEvent[] {
  if (agentId) {
    return mockBuybackEvents.filter(b => b.agentId === agentId);
  }
  return mockBuybackEvents;
}

// Admin analytics
export interface AdminAnalytics {
  totalRevenue: number;
  totalRaised: number;
  totalBuybacks: number;
  platformBuybackVolume: number;
  activeInvestors: number;
  activeDeployers: number;
  feeRevenue: number;
  buybackHealth: {
    lastSuccessAt: Date | null;
    failures: number;
    lagSeconds: number;
  };
}

export function getAdminAnalytics(): AdminAnalytics {
  const tradingAgents = store.agents.filter(a => a.status === 'Trading');
  
  return {
    totalRevenue: tradingAgents.reduce((sum, a) => sum + a.totalRevenue, 0),
    totalRaised: store.agents.reduce((sum, a) => sum + a.amountRaised, 0),
    totalBuybacks: mockBuybackEvents.length,
    platformBuybackVolume: mockBuybackEvents.reduce(
      (sum, b) => sum + b.platformTokensBought, 
      0
    ),
    activeInvestors: new Set(store.investorPositions.map(p => p.wallet)).size,
    activeDeployers: tradingAgents.length,
    feeRevenue: tradingAgents.reduce((sum, a) => sum + a.totalRevenue * 0.01 * 0.5, 0),
    buybackHealth: {
      lastSuccessAt: mockBuybackEvents[0]?.timestamp || null,
      failures: 0,
      lagSeconds: 5,
    },
  };
}
