export type AgentTier = 'Seed' | 'Core' | 'Pro';
export type AgentStatus = 'ICO Upcoming' | 'ICO Live' | 'Successful' | 'Failed' | 'Trading';
export type AgentCategory = 'Trading' | 'Prediction' | 'Arbitrage' | 'Yield' | 'Research' | 'Other';

export interface BuybackEvent {
  id: string;
  agentId: string;
  timestamp: Date;
  revenueSpent: number;
  agentTokensBought: number;
  platformTokensBought: number;
  txHash: string;
  chain: 'solana' | 'robinhood';
}

export interface TeamMember {
  name: string;
  role: string;
  profileUrl?: string;
}

export interface AgentDocument {
  type: 'strategy' | 'audit' | 'other';
  title: string;
  url: string;
}

export interface Agent {
  id: string;
  slug: string;
  name: string;
  oneLiner: string;
  description: string;
  logoUrl: string;
  category: AgentCategory;
  tier: AgentTier;
  status: AgentStatus;
  chain: 'solana' | 'robinhood';
  
  // Performance metrics
  totalRevenue: number;
  tradingVolume: number;
  winRate: number;
  avgMonthlyReturn: number;
  capitalDeployed: number;
  walletAge: number; // days
  numPositions: number;
  riskRating: 'Low' | 'Medium' | 'High';
  
  // Raise details
  launchFdv: number;
  raiseTarget: number;
  amountRaised: number;
  raiseThreshold: number; // 0.5 = 50%
  minTicket: number;
  tokenPrice: number;
  
  // Market data
  currentPrice: number;
  priceChange24h: number;
  circulatingSupply: number;
  
  // Buybacks
  totalBuybacks: number;
  lastBuybackTime?: Date;
  
  // Socials
  website?: string;
  docs?: string;
  twitter?: string;
  
  // Team and documents
  team: TeamMember[];
  documents: AgentDocument[];
  
  // Performance history
  drawdownHistory: number[]; // percentage drawdowns over time
  
  // Vesting
  vestingCliffDays: number;
  vestingDurationDays: number;
  
  // ICO timing
  icoEndsAt?: string; // ISO string for live ICOs
}

export const mockBuybackEvents: BuybackEvent[] = [
  {
    id: 'bb-1',
    agentId: 'quantum-flux',
    timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 min ago
    revenueSpent: 2400,
    agentTokensBought: 180000,
    platformTokensBought: 5000,
    txHash: '5KqX7...',
    chain: 'solana',
  },
  {
    id: 'bb-2',
    agentId: 'quantum-flux',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
    revenueSpent: 3200,
    agentTokensBought: 240000,
    platformTokensBought: 6700,
    txHash: '2Hzp9...',
    chain: 'solana',
  },
  {
    id: 'bb-3',
    agentId: 'arbitrage-alpha',
    timestamp: new Date(Date.now() - 1000 * 60 * 45), // 45 min ago
    revenueSpent: 1800,
    agentTokensBought: 120000,
    platformTokensBought: 3800,
    txHash: '0x7dfa...',
    chain: 'robinhood',
  },
  {
    id: 'bb-4',
    agentId: 'arbitrage-alpha',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8 hours ago
    revenueSpent: 2100,
    agentTokensBought: 140000,
    platformTokensBought: 4200,
    txHash: '0x9abc...',
    chain: 'robinhood',
  },
  {
    id: 'bb-5',
    agentId: 'yield-optimizer',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    revenueSpent: 950,
    agentTokensBought: 85000,
    platformTokensBought: 2100,
    txHash: '3Km8x...',
    chain: 'solana',
  },
];

export const mockAgents: Agent[] = [
  {
    id: 'quantum-flux',
    slug: 'quantum-flux',
    name: 'Quantum Flux',
    oneLiner: 'High frequency cross chain arbitrage agent',
    description: 'Quantum Flux exploits millisecond level price discrepancies across DEXs using advanced prediction models and MEV resistant execution strategies.',
    logoUrl: '/agents/quantum-flux.svg',
    category: 'Arbitrage',
    tier: 'Core',
    status: 'Trading',
    chain: 'solana',
    
    totalRevenue: 487000,
    tradingVolume: 12400000,
    winRate: 0.847,
    avgMonthlyReturn: 0.182,
    capitalDeployed: 850000,
    walletAge: 247,
    numPositions: 3421,
    riskRating: 'Medium',
    
    launchFdv: 500000,
    raiseTarget: 50000,
    amountRaised: 50000,
    raiseThreshold: 0.5,
    minTicket: 0.1,
    tokenPrice: 0.0005,
    
    currentPrice: 0.00068,
    priceChange24h: 0.0823,
    circulatingSupply: 500000000,
    
    totalBuybacks: 47,
    lastBuybackTime: new Date(Date.now() - 1000 * 60 * 15),
    
    website: 'https://quantumflux.ai',
    docs: 'https://docs.quantumflux.ai',
    twitter: 'https://twitter.com/quantumflux',
    
    team: [
      { name: 'Alex Chen', role: 'Founder & Lead Engineer', profileUrl: 'https://twitter.com/alexchen' },
      { name: 'Sarah Kim', role: 'Quantitative Strategist', profileUrl: 'https://linkedin.com/in/sarahkim' },
    ],
    documents: [
      { type: 'strategy', title: 'Arbitrage Strategy Overview', url: 'https://docs.quantumflux.ai/strategy.pdf' },
      { type: 'audit', title: 'Security Audit Report', url: 'https://docs.quantumflux.ai/audit.pdf' },
    ],
    drawdownHistory: [0, -2, -5, -3, -8, -4, -1, -3, -6, -2],
    vestingCliffDays: 90,
    vestingDurationDays: 730,
  },
  {
    id: 'arbitrage-alpha',
    slug: 'arbitrage-alpha',
    name: 'Arbitrage Alpha',
    oneLiner: 'Statistical arbitrage across perpetual futures',
    description: 'Arbitrage Alpha runs market neutral strategies across funding rates and basis trades on perpetual futures markets.',
    logoUrl: '/agents/arbitrage-alpha.svg',
    category: 'Trading',
    tier: 'Pro',
    status: 'Trading',
    chain: 'robinhood',
    
    totalRevenue: 1240000,
    tradingVolume: 28900000,
    winRate: 0.913,
    avgMonthlyReturn: 0.241,
    capitalDeployed: 2100000,
    walletAge: 412,
    numPositions: 8934,
    riskRating: 'Low',
    
    launchFdv: 1000000,
    raiseTarget: 100000,
    amountRaised: 100000,
    raiseThreshold: 0.5,
    minTicket: 0.05,
    tokenPrice: 0.001,
    
    currentPrice: 0.00147,
    priceChange24h: 0.0512,
    circulatingSupply: 500000000,
    
    totalBuybacks: 104,
    lastBuybackTime: new Date(Date.now() - 1000 * 60 * 45),
    
    website: 'https://arbitragealpha.io',
    docs: 'https://docs.arbitragealpha.io',
    
    team: [
      { name: 'Dr. Marcus Webb', role: 'Chief Quantitative Officer', profileUrl: 'https://linkedin.com/in/marcuswebb' },
      { name: 'Lisa Park', role: 'Head of Risk Management' },
      { name: 'Tom Rodriguez', role: 'Senior Developer', profileUrl: 'https://github.com/tomr' },
    ],
    documents: [
      { type: 'strategy', title: 'Statistical Arbitrage Methodology', url: 'https://docs.arbitragealpha.io/methodology.pdf' },
      { type: 'audit', title: 'Third Party Audit Report', url: 'https://docs.arbitragealpha.io/audit-2024.pdf' },
      { type: 'other', title: 'Whitepaper', url: 'https://docs.arbitragealpha.io/whitepaper.pdf' },
    ],
    drawdownHistory: [0, -1, -2, -1, -3, -2, -1, 0, -2, -1],
    vestingCliffDays: 180,
    vestingDurationDays: 1095,
  },
  {
    id: 'yield-optimizer',
    slug: 'yield-optimizer',
    name: 'Yield Optimizer',
    oneLiner: 'Autonomous yield farming and LP management',
    description: 'Yield Optimizer continuously rebalances LP positions across DeFi protocols to maximize yield adjusted returns.',
    logoUrl: '/agents/yield-optimizer.svg',
    category: 'Yield',
    tier: 'Seed',
    status: 'Trading',
    chain: 'solana',
    
    totalRevenue: 84000,
    tradingVolume: 3200000,
    winRate: 0.769,
    avgMonthlyReturn: 0.124,
    capitalDeployed: 340000,
    walletAge: 89,
    numPositions: 1247,
    riskRating: 'Medium',
    
    launchFdv: 150000,
    raiseTarget: 15000,
    amountRaised: 15000,
    raiseThreshold: 0.5,
    minTicket: 0.05,
    tokenPrice: 0.00015,
    
    currentPrice: 0.00021,
    priceChange24h: 0.0347,
    circulatingSupply: 500000000,
    
    totalBuybacks: 12,
    lastBuybackTime: new Date(Date.now() - 1000 * 60 * 60 * 2),
    
    website: 'https://yieldoptimizer.fi',
    
    team: [
      { name: 'Jake Thompson', role: 'Founder', profileUrl: 'https://twitter.com/jakethompson' },
    ],
    documents: [
      { type: 'strategy', title: 'LP Optimization Strategy', url: 'https://yieldoptimizer.fi/docs/strategy.pdf' },
    ],
    drawdownHistory: [0, -4, -7, -5, -12, -9, -6, -4, -8, -3],
    vestingCliffDays: 30,
    vestingDurationDays: 365,
  },
  {
    id: 'prediction-nexus',
    slug: 'prediction-nexus',
    name: 'Prediction Nexus',
    oneLiner: 'Event driven prediction market agent',
    description: 'Prediction Nexus analyzes news, social sentiment, and on chain data to make informed bets on prediction markets.',
    logoUrl: '/agents/prediction-nexus.svg',
    category: 'Prediction',
    tier: 'Core',
    status: 'ICO Live',
    chain: 'robinhood',
    
    totalRevenue: 0,
    tradingVolume: 0,
    winRate: 0,
    avgMonthlyReturn: 0,
    capitalDeployed: 0,
    walletAge: 0,
    numPositions: 0,
    riskRating: 'Medium',
    
    launchFdv: 500000,
    raiseTarget: 50000,
    amountRaised: 37400,
    raiseThreshold: 0.5,
    minTicket: 0.1,
    tokenPrice: 0.0005,
    
    currentPrice: 0,
    priceChange24h: 0,
    circulatingSupply: 0,
    
    totalBuybacks: 0,
    
    docs: 'https://docs.predictionnexus.ai',
    
    team: [
      { name: 'Sophia Martinez', role: 'Founder & AI Lead', profileUrl: 'https://twitter.com/sophiamartinez' },
      { name: 'David Lee', role: 'Data Scientist' },
    ],
    documents: [
      { type: 'strategy', title: 'Prediction Market Strategy', url: 'https://docs.predictionnexus.ai/strategy.pdf' },
      { type: 'other', title: 'Technical Roadmap', url: 'https://docs.predictionnexus.ai/roadmap.pdf' },
    ],
    drawdownHistory: [],
    vestingCliffDays: 90,
    vestingDurationDays: 545,
    icoEndsAt: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(), // 48 hours from now
  },
];

export function getAgentBySlug(slug: string): Agent | undefined {
  return mockAgents.find(a => a.slug === slug);
}

export function getAgentBuybacks(agentId: string): BuybackEvent[] {
  return mockBuybackEvents.filter(b => b.agentId === agentId).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}
