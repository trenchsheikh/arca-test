export type AgentTier = 'Seed' | 'Core' | 'Pro';
export type AgentStatus = 'ICO Upcoming' | 'ICO Live' | 'Successful' | 'Failed' | 'Trading';
export type AgentCategory = 'Trading' | 'Prediction' | 'Arbitrage' | 'Research' | 'Other';

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

export interface Contributor {
  handle: string;
  amount: number;
}

export interface Agent {
  id: string;
  slug: string;
  name: string;
  ticker: string;
  deployer: string;
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

type DeployedAgentSpec = {
  name: string;
  ticker: string;
  deployer: string;
  oneLiner: string;
  category: AgentCategory;
  tier: AgentTier;
  status: AgentStatus;
  chain: 'solana' | 'robinhood';
  raiseTarget: number;
  amountRaised: number;
  logo: number;
  trading?: boolean;
  price?: number;
};

const AGENT_LOGOS = [
  '/agents/quantum-flux.svg',
  '/agents/arbitrage-alpha.svg',
  '/agents/yield-optimizer.svg',
  '/agents/prediction-nexus.svg',
] as const;

function buildDeployedAgents(specs: DeployedAgentSpec[]): Agent[] {
  return specs.map((spec) => {
    const slug = spec.name.toLowerCase().replace(/\s+/g, '-');
    const isTrading = Boolean(spec.trading) || spec.status === 'Trading';
    const price = spec.price ?? (isTrading ? spec.raiseTarget / 100_000_000 : 0);
    const fdv = spec.raiseTarget * 10;

    return {
      id: slug,
      slug,
      name: spec.name,
      ticker: spec.ticker,
      deployer: spec.deployer,
      oneLiner: spec.oneLiner,
      description: `${spec.name} was deployed by ${spec.deployer} on arca. ${spec.oneLiner}.`,
      logoUrl: AGENT_LOGOS[spec.logo % AGENT_LOGOS.length],
      category: spec.category,
      tier: spec.tier,
      status: spec.status,
      chain: spec.chain,
      totalRevenue: isTrading ? Math.round(spec.raiseTarget * 4.2) : Math.round(spec.amountRaised * 0.4),
      tradingVolume: isTrading ? Math.round(spec.raiseTarget * 80) : Math.round(spec.amountRaised * 12),
      winRate: isTrading ? 0.72 + (spec.raiseTarget % 17) / 100 : 0,
      avgMonthlyReturn: isTrading ? 0.09 + (spec.raiseTarget % 11) / 200 : 0,
      capitalDeployed: isTrading ? Math.round(spec.raiseTarget * 12) : 0,
      walletAge: isTrading ? 40 + (spec.raiseTarget % 200) : 0,
      numPositions: isTrading ? 200 + (spec.raiseTarget % 900) : 0,
      riskRating: spec.tier === 'Pro' ? 'Low' : spec.tier === 'Core' ? 'Medium' : 'High',
      launchFdv: fdv,
      raiseTarget: spec.raiseTarget,
      amountRaised: spec.amountRaised,
      raiseThreshold: 0.5,
      minTicket: spec.tier === 'Pro' ? 0.2 : 0.05,
      tokenPrice: fdv / 1_000_000_000,
      currentPrice: price,
      priceChange24h: isTrading ? ((spec.raiseTarget % 9) - 4) / 100 : 0,
      circulatingSupply: isTrading ? 200_000_000 + spec.raiseTarget : 0,
      totalBuybacks: isTrading ? 6 + (spec.raiseTarget % 40) : 0,
      lastBuybackTime: isTrading
        ? new Date(Date.now() - 1000 * 60 * (20 + (spec.raiseTarget % 180)))
        : undefined,
      team: [
        {
          name: spec.deployer.replace(/^@/, ''),
          role: 'Deployer',
        },
      ],
      documents: [{ type: 'strategy', title: `${spec.name} Notes`, url: '#' }],
      drawdownHistory: isTrading ? [0, -2, -4, -3, -6, -2, -1, -3, -5, -2] : [],
      vestingCliffDays: spec.tier === 'Pro' ? 120 : 45,
      vestingDurationDays: spec.tier === 'Pro' ? 900 : 400,
      icoEndsAt:
        spec.status === 'ICO Live'
          ? new Date(Date.now() + 1000 * 60 * 60 * (24 + (spec.raiseTarget % 72))).toISOString()
          : undefined,
    };
  });
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
    name: 'Megaarb',
    ticker: 'MEGA',
    deployer: '@alexchen',
    oneLiner: 'Millisecond sniper farming CEX DEX gaps nonstop',
    description: 'Megaarb was deployed by @alexchen to farm cross venue dislocations with MEV resistant routing. Pure arb flow, no directional bagholding.',
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
    name: 'Perpchad',
    ticker: 'PCHAD',
    deployer: '@marcuswebb',
    oneLiner: 'Funding rate gladiator that never holds the bag',
    description: 'Perpchad was deployed by @marcuswebb to farm funding, basis, and inventory edge across perps. Market neutral when it can, aggressive when the tape is cooked.',
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
    name: 'Memecoinsnipe',
    ticker: 'MEME',
    deployer: '@jakethompson',
    oneLiner: 'Solana memecoin sniper that fades rugs and rides pumps',
    description: 'Memecoinsnipe was deployed by @jakethompson to scan new Solana launches, skip toxic flow, and ride early momentum with hard stop rails.',
    logoUrl: '/agents/yield-optimizer.svg',
    category: 'Trading',
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
    
    website: 'https://memecoinsnipe.fi',
    
    team: [
      { name: 'Jake Thompson', role: 'Founder', profileUrl: 'https://twitter.com/jakethompson' },
    ],
    documents: [
      { type: 'strategy', title: 'Meme Entry Framework', url: 'https://memecoinsnipe.fi/docs/strategy.pdf' },
    ],
    drawdownHistory: [0, -4, -7, -5, -12, -9, -6, -4, -8, -3],
    vestingCliffDays: 30,
    vestingDurationDays: 365,
  },
  {
    id: 'prediction-nexus',
    slug: 'prediction-nexus',
    name: 'Copium Oracle',
    ticker: 'COPE',
    deployer: '@sophiam',
    oneLiner: 'Prediction market degen that prices narrative heat',
    description: 'Copium Oracle was deployed by @sophiam to score news, CT volume, and on chain flow into prediction market bets before the timeline catches up.',
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
  {
    id: 'signal-forge',
    slug: 'signal-forge',
    name: 'Signalmaxx',
    ticker: 'SMAX',
    deployer: '@ninaortiz',
    oneLiner: 'Swing signal printer for mid curve alts',
    description: 'Signal Forge blends on chain flows, funding rates, and social momentum into ranked trade signals.',
    logoUrl: '/agents/quantum-flux.svg',
    category: 'Trading',
    tier: 'Seed',
    status: 'ICO Live',
    chain: 'solana',
    totalRevenue: 12000,
    tradingVolume: 410000,
    winRate: 0.71,
    avgMonthlyReturn: 0.09,
    capitalDeployed: 80000,
    walletAge: 42,
    numPositions: 318,
    riskRating: 'High',
    launchFdv: 120000,
    raiseTarget: 12000,
    amountRaised: 9800,
    raiseThreshold: 0.5,
    minTicket: 0.05,
    tokenPrice: 0.00012,
    currentPrice: 0,
    priceChange24h: 0,
    circulatingSupply: 0,
    totalBuybacks: 0,
    website: 'https://signalforge.ai',
    team: [{ name: 'Nina Ortiz', role: 'Founder' }],
    documents: [{ type: 'strategy', title: 'Signal Framework', url: '#' }],
    drawdownHistory: [],
    vestingCliffDays: 30,
    vestingDurationDays: 365,
    icoEndsAt: new Date(Date.now() + 1000 * 60 * 60 * 72).toISOString(),
  },
  {
    id: 'desk-sentinel',
    slug: 'desk-sentinel',
    name: 'Jeetshield',
    ticker: 'JEET',
    deployer: '@omarblake',
    oneLiner: 'Hedge bot that panic sells your downside for you',
    description: 'Desk Sentinel watches open positions and hedges when volatility and inventory risk spike.',
    logoUrl: '/agents/yield-optimizer.svg',
    category: 'Research',
    tier: 'Seed',
    status: 'ICO Upcoming',
    chain: 'robinhood',
    totalRevenue: 0,
    tradingVolume: 0,
    winRate: 0,
    avgMonthlyReturn: 0,
    capitalDeployed: 0,
    walletAge: 0,
    numPositions: 0,
    riskRating: 'Medium',
    launchFdv: 180000,
    raiseTarget: 18000,
    amountRaised: 0,
    raiseThreshold: 0.5,
    minTicket: 0.05,
    tokenPrice: 0.00018,
    currentPrice: 0,
    priceChange24h: 0,
    circulatingSupply: 0,
    totalBuybacks: 0,
    team: [{ name: 'Omar Blake', role: 'Founder' }],
    documents: [{ type: 'strategy', title: 'Hedging Playbook', url: '#' }],
    drawdownHistory: [],
    vestingCliffDays: 45,
    vestingDurationDays: 400,
  },
  {
    id: 'basis-relay',
    slug: 'basis-relay',
    name: 'Basisbag',
    ticker: 'BBAG',
    deployer: '@priyanair',
    oneLiner: 'Cash and carry farmer stacking boring edge',
    description: 'Basis Relay harvests funding and basis spreads with automated inventory controls.',
    logoUrl: '/agents/arbitrage-alpha.svg',
    category: 'Arbitrage',
    tier: 'Core',
    status: 'Trading',
    chain: 'solana',
    totalRevenue: 212000,
    tradingVolume: 6400000,
    winRate: 0.802,
    avgMonthlyReturn: 0.141,
    capitalDeployed: 520000,
    walletAge: 188,
    numPositions: 2104,
    riskRating: 'Low',
    launchFdv: 420000,
    raiseTarget: 42000,
    amountRaised: 42000,
    raiseThreshold: 0.5,
    minTicket: 0.1,
    tokenPrice: 0.00042,
    currentPrice: 0.00051,
    priceChange24h: 0.021,
    circulatingSupply: 420000000,
    totalBuybacks: 29,
    lastBuybackTime: new Date(Date.now() - 1000 * 60 * 55),
    website: 'https://basisrelay.io',
    team: [{ name: 'Priya Nair', role: 'Founder' }],
    documents: [{ type: 'audit', title: 'Audit Summary', url: '#' }],
    drawdownHistory: [0, -1, -3, -2, -4, -2, -1, -2, -3, -1],
    vestingCliffDays: 90,
    vestingDurationDays: 730,
  },
  {
    id: 'oracle-pulse',
    slug: 'oracle-pulse',
    name: 'Narrativedump',
    ticker: 'NARR',
    deployer: '@elenavoss',
    oneLiner: 'Catalyst scout that rotates into the next meta',
    description: 'Oracle Pulse ranks narrative catalysts and routes capital into high conviction windows.',
    logoUrl: '/agents/prediction-nexus.svg',
    category: 'Research',
    tier: 'Core',
    status: 'ICO Live',
    chain: 'robinhood',
    totalRevenue: 64000,
    tradingVolume: 900000,
    winRate: 0.74,
    avgMonthlyReturn: 0.11,
    capitalDeployed: 190000,
    walletAge: 120,
    numPositions: 640,
    riskRating: 'Medium',
    launchFdv: 480000,
    raiseTarget: 48000,
    amountRaised: 48000,
    raiseThreshold: 0.5,
    minTicket: 0.1,
    tokenPrice: 0.00048,
    currentPrice: 0,
    priceChange24h: 0,
    circulatingSupply: 0,
    totalBuybacks: 0,
    docs: 'https://docs.oraclepulse.ai',
    team: [{ name: 'Elena Voss', role: 'Founder' }],
    documents: [{ type: 'strategy', title: 'Catalyst Scoring', url: '#' }],
    drawdownHistory: [],
    vestingCliffDays: 60,
    vestingDurationDays: 540,
    icoEndsAt: new Date(Date.now() + 1000 * 60 * 60 * 20).toISOString(),
  },
  {
    id: 'vault-navigator',
    slug: 'vault-navigator',
    name: 'Aichipdesk',
    ticker: 'NVDAX',
    deployer: '@hannahcho',
    oneLiner: 'AI chip and semis stock desk trading NVDA supply chain heat',
    description: 'Aichipdesk was deployed by @hannahcho to trade AI semiconductor names around earnings, export rules, and cluster demand signals.',
    logoUrl: '/agents/yield-optimizer.svg',
    category: 'Trading',
    tier: 'Pro',
    status: 'Trading',
    chain: 'robinhood',
    totalRevenue: 980000,
    tradingVolume: 18000000,
    winRate: 0.889,
    avgMonthlyReturn: 0.168,
    capitalDeployed: 3500000,
    walletAge: 510,
    numPositions: 4520,
    riskRating: 'Low',
    launchFdv: 2000000,
    raiseTarget: 200000,
    amountRaised: 200000,
    raiseThreshold: 0.5,
    minTicket: 0.25,
    tokenPrice: 0.002,
    currentPrice: 0.0024,
    priceChange24h: 0.014,
    circulatingSupply: 500000000,
    totalBuybacks: 156,
    lastBuybackTime: new Date(Date.now() - 1000 * 60 * 22),
    website: 'https://aichipdesk.io',
    team: [
      { name: 'Hannah Cho', role: 'CEO' },
      { name: 'Miles Adler', role: 'CTO' },
    ],
    documents: [
      { type: 'audit', title: 'Security Review', url: '#' },
      { type: 'strategy', title: 'Semis Trading Framework', url: '#' },
    ],
    drawdownHistory: [0, -1, -1, -2, -1, 0, -1, -2, -1, 0],
    vestingCliffDays: 180,
    vestingDurationDays: 1095,
  },
  {
    id: 'flow-lattice',
    slug: 'flow-lattice',
    name: 'Flowdegen',
    ticker: 'FLOW',
    deployer: '@chrisvale',
    oneLiner: 'Order flow sniper for thin perp books',
    description: 'Flow Lattice models order book imbalance and executes with latency aware routing.',
    logoUrl: '/agents/arbitrage-alpha.svg',
    category: 'Trading',
    tier: 'Pro',
    status: 'ICO Live',
    chain: 'robinhood',
    totalRevenue: 410000,
    tradingVolume: 9200000,
    winRate: 0.861,
    avgMonthlyReturn: 0.195,
    capitalDeployed: 1400000,
    walletAge: 276,
    numPositions: 5012,
    riskRating: 'Medium',
    launchFdv: 1500000,
    raiseTarget: 150000,
    amountRaised: 112500,
    raiseThreshold: 0.5,
    minTicket: 0.2,
    tokenPrice: 0.0015,
    currentPrice: 0,
    priceChange24h: 0,
    circulatingSupply: 0,
    totalBuybacks: 0,
    team: [{ name: 'Chris Vale', role: 'Founder' }],
    documents: [{ type: 'strategy', title: 'Microstructure Notes', url: '#' }],
    drawdownHistory: [],
    vestingCliffDays: 120,
    vestingDurationDays: 900,
    icoEndsAt: new Date(Date.now() + 1000 * 60 * 60 * 96).toISOString(),
  },
  {
    id: 'gamma-scout',
    slug: 'gamma-scout',
    name: 'Gammachad',
    ticker: 'GCHA',
    deployer: '@rileyfox',
    oneLiner: 'Event week gamma scalper with hard inventory caps',
    description: 'Gamma Scout harvests gamma around known catalysts while capping overnight inventory.',
    logoUrl: '/agents/quantum-flux.svg',
    category: 'Trading',
    tier: 'Seed',
    status: 'Trading',
    chain: 'solana',
    totalRevenue: 56000,
    tradingVolume: 2100000,
    winRate: 0.733,
    avgMonthlyReturn: 0.102,
    capitalDeployed: 210000,
    walletAge: 67,
    numPositions: 890,
    riskRating: 'High',
    launchFdv: 160000,
    raiseTarget: 16000,
    amountRaised: 16000,
    raiseThreshold: 0.5,
    minTicket: 0.05,
    tokenPrice: 0.00016,
    currentPrice: 0.00019,
    priceChange24h: -0.012,
    circulatingSupply: 160000000,
    totalBuybacks: 8,
    lastBuybackTime: new Date(Date.now() - 1000 * 60 * 90),
    team: [{ name: 'Riley Fox', role: 'Founder' }],
    documents: [{ type: 'strategy', title: 'Gamma Playbook', url: '#' }],
    drawdownHistory: [0, -5, -8, -4, -10, -6, -3, -7, -5, -2],
    vestingCliffDays: 30,
    vestingDurationDays: 365,
  },
  ...buildDeployedAgents([
    // Seed
    {
      name: 'Nightape',
      ticker: 'NAPE',
      deployer: '@maya_k',
      oneLiner: 'Overnight perps funding farmer that never sleeps',
      category: 'Trading',
      tier: 'Seed',
      status: 'ICO Live',
      chain: 'solana',
      raiseTarget: 14000,
      amountRaised: 11200,
      logo: 0,
    },
    {
      name: 'Gridgoblin',
      ticker: 'GGBL',
      deployer: '@devonlee',
      oneLiner: 'Range bound grid bot for choppy midcaps',
      category: 'Trading',
      tier: 'Seed',
      status: 'Trading',
      chain: 'robinhood',
      raiseTarget: 10000,
      amountRaised: 10000,
      logo: 1,
      trading: true,
      price: 0.00014,
    },
    {
      name: 'Weatherbag',
      ticker: 'WX',
      deployer: '@sofiar',
      oneLiner: 'Polymarket weather markets sniper for storm weeks',
      category: 'Prediction',
      tier: 'Seed',
      status: 'ICO Live',
      chain: 'robinhood',
      raiseTarget: 11000,
      amountRaised: 7800,
      logo: 2,
    },
    {
      name: 'Policopium',
      ticker: 'PCOPE',
      deployer: '@jonpark',
      oneLiner: 'Politics week Polymarket sniper',
      category: 'Prediction',
      tier: 'Seed',
      status: 'ICO Live',
      chain: 'robinhood',
      raiseTarget: 16000,
      amountRaised: 6400,
      logo: 3,
    },
    {
      name: 'Rektrevert',
      ticker: 'RVR',
      deployer: '@amina_z',
      oneLiner: 'Mean reversion scout that buys the panic',
      category: 'Trading',
      tier: 'Seed',
      status: 'Trading',
      chain: 'solana',
      raiseTarget: 12500,
      amountRaised: 12500,
      logo: 0,
      trading: true,
      price: 0.00017,
    },
    {
      name: 'Bundlesnipe',
      ticker: 'BSNI',
      deployer: '@theo_m',
      oneLiner: 'Toxic flow filter for memecoin bundle entries',
      category: 'Arbitrage',
      tier: 'Seed',
      status: 'ICO Live',
      chain: 'solana',
      raiseTarget: 18000,
      amountRaised: 15300,
      logo: 1,
    },
    {
      name: 'Pumpfilter',
      ticker: 'PUMP',
      deployer: '@degenjay',
      oneLiner: 'Memecoin launch filter that skips obvious rugs',
      category: 'Trading',
      tier: 'Seed',
      status: 'Trading',
      chain: 'solana',
      raiseTarget: 13500,
      amountRaised: 13500,
      logo: 2,
      trading: true,
      price: 0.00011,
    },
    {
      name: 'Perpscrab',
      ticker: 'PCRAB',
      deployer: '@liqnikita',
      oneLiner: 'Small ticket perps scalper on crowded books',
      category: 'Trading',
      tier: 'Seed',
      status: 'ICO Upcoming',
      chain: 'solana',
      raiseTarget: 9500,
      amountRaised: 0,
      logo: 3,
    },
    {
      name: 'Rainmarket',
      ticker: 'RAIN',
      deployer: '@cloudbets',
      oneLiner: 'Polymarket rainfall and temp contract hopper',
      category: 'Prediction',
      tier: 'Seed',
      status: 'ICO Live',
      chain: 'robinhood',
      raiseTarget: 12000,
      amountRaised: 9100,
      logo: 0,
    },
    {
      name: 'Tsladesk',
      ticker: 'TSLAX',
      deployer: '@evscout',
      oneLiner: 'EV and Tesla stock flow desk around delivery prints',
      category: 'Trading',
      tier: 'Seed',
      status: 'Trading',
      chain: 'robinhood',
      raiseTarget: 15000,
      amountRaised: 15000,
      logo: 1,
      trading: true,
      price: 0.00022,
    },
    // Core
    {
      name: 'Inventoryanon',
      ticker: 'INV',
      deployer: '@clairew',
      oneLiner: 'Maker inventory balancer across venues',
      category: 'Trading',
      tier: 'Core',
      status: 'Trading',
      chain: 'robinhood',
      raiseTarget: 55000,
      amountRaised: 55000,
      logo: 2,
      trading: true,
      price: 0.00072,
    },
    {
      name: 'Triangledump',
      ticker: 'TRI',
      deployer: '@benji_s',
      oneLiner: 'Latency triangle runner for CEX DEX gaps',
      category: 'Arbitrage',
      tier: 'Core',
      status: 'ICO Live',
      chain: 'solana',
      raiseTarget: 60000,
      amountRaised: 42100,
      logo: 3,
    },
    {
      name: 'Metarotator',
      ticker: 'META',
      deployer: '@ira_novak',
      oneLiner: 'Narrative rotation research stack for CT metas',
      category: 'Research',
      tier: 'Core',
      status: 'Trading',
      chain: 'solana',
      raiseTarget: 40000,
      amountRaised: 40000,
      logo: 0,
      trading: true,
      price: 0.00055,
    },
    {
      name: 'Polyweather',
      ticker: 'PWX',
      deployer: '@stormdesk',
      oneLiner: 'Polymarket hurricane and freeze market book',
      category: 'Prediction',
      tier: 'Core',
      status: 'ICO Live',
      chain: 'robinhood',
      raiseTarget: 48000,
      amountRaised: 48000,
      logo: 1,
    },
    {
      name: 'Thinspread',
      ticker: 'THIN',
      deployer: '@omar_f',
      oneLiner: 'Smart router for illiquid perp books',
      category: 'Trading',
      tier: 'Core',
      status: 'ICO Upcoming',
      chain: 'solana',
      raiseTarget: 52000,
      amountRaised: 0,
      logo: 2,
    },
    {
      name: 'Eventbag',
      ticker: 'EVNT',
      deployer: '@rue_dante',
      oneLiner: 'Event market maker with inventory bands',
      category: 'Prediction',
      tier: 'Core',
      status: 'Trading',
      chain: 'robinhood',
      raiseTarget: 45000,
      amountRaised: 45000,
      logo: 3,
      trading: true,
      price: 0.00061,
    },
    {
      name: 'Memeflow',
      ticker: 'MFLO',
      deployer: '@ctmaxxing',
      oneLiner: 'Memecoin order flow desk for Solana launches',
      category: 'Trading',
      tier: 'Core',
      status: 'Trading',
      chain: 'solana',
      raiseTarget: 42000,
      amountRaised: 42000,
      logo: 0,
      trading: true,
      price: 0.00048,
    },
    {
      name: 'Perpnikita',
      ticker: 'PNKT',
      deployer: '@basisbee',
      oneLiner: 'Cross venue perps funding and basis scraper',
      category: 'Trading',
      tier: 'Core',
      status: 'ICO Live',
      chain: 'solana',
      raiseTarget: 58000,
      amountRaised: 39200,
      logo: 1,
    },
    {
      name: 'Nvidiastack',
      ticker: 'CHIP',
      deployer: '@semisbot',
      oneLiner: 'AI chip stock stack trading NVDA AMD TSM heat',
      category: 'Trading',
      tier: 'Core',
      status: 'Trading',
      chain: 'robinhood',
      raiseTarget: 65000,
      amountRaised: 65000,
      logo: 2,
      trading: true,
      price: 0.00088,
    },
    {
      name: 'Oilshock',
      ticker: 'OILX',
      deployer: '@macroape',
      oneLiner: 'Energy and oil stock desk around inventory prints',
      category: 'Trading',
      tier: 'Core',
      status: 'ICO Live',
      chain: 'robinhood',
      raiseTarget: 50000,
      amountRaised: 27500,
      logo: 3,
    },
    // Pro
    {
      name: 'Fundingwhale',
      ticker: 'FWHL',
      deployer: '@helixdesk',
      oneLiner: 'Institutional perps funding desk with hard risk rails',
      category: 'Trading',
      tier: 'Pro',
      status: 'Trading',
      chain: 'solana',
      raiseTarget: 250000,
      amountRaised: 250000,
      logo: 0,
      trading: true,
      price: 0.0031,
    },
    {
      name: 'Mag7desk',
      ticker: 'MAG7',
      deployer: '@sterlingdao',
      oneLiner: 'Magnificent 7 stock rotation desk with earnings rails',
      category: 'Trading',
      tier: 'Pro',
      status: 'Trading',
      chain: 'robinhood',
      raiseTarget: 300000,
      amountRaised: 300000,
      logo: 1,
      trading: true,
      price: 0.0028,
    },
    {
      name: 'Catalystape',
      ticker: 'CAT',
      deployer: '@forge_labs',
      oneLiner: 'Pro research stack for catalyst weeks',
      category: 'Research',
      tier: 'Pro',
      status: 'ICO Live',
      chain: 'solana',
      raiseTarget: 180000,
      amountRaised: 126000,
      logo: 2,
    },
    {
      name: 'Carrychad',
      ticker: 'CRRY',
      deployer: '@cinder_ops',
      oneLiner: 'Basis and carry book for large tickets',
      category: 'Arbitrage',
      tier: 'Pro',
      status: 'Trading',
      chain: 'robinhood',
      raiseTarget: 220000,
      amountRaised: 220000,
      logo: 3,
      trading: true,
      price: 0.0022,
    },
    {
      name: 'Optionsanon',
      ticker: 'OANON',
      deployer: '@novacap',
      oneLiner: 'Low drawdown options overlay for mega caps',
      category: 'Trading',
      tier: 'Pro',
      status: 'ICO Live',
      chain: 'solana',
      raiseTarget: 175000,
      amountRaised: 98000,
      logo: 0,
    },
    {
      name: 'Govdegen',
      ticker: 'GOV',
      deployer: '@parity_hq',
      oneLiner: 'Governance and election Polymarket book',
      category: 'Prediction',
      tier: 'Pro',
      status: 'ICO Upcoming',
      chain: 'robinhood',
      raiseTarget: 200000,
      amountRaised: 0,
      logo: 1,
    },
    {
      name: 'Hyperperps',
      ticker: 'HPERP',
      deployer: '@vaultnik',
      oneLiner: 'Pro perps book across BTC ETH SOL inventories',
      category: 'Trading',
      tier: 'Pro',
      status: 'Trading',
      chain: 'solana',
      raiseTarget: 280000,
      amountRaised: 280000,
      logo: 2,
      trading: true,
      price: 0.0034,
    },
    {
      name: 'Memewhale',
      ticker: 'MWHL',
      deployer: '@solbags',
      oneLiner: 'Size aware memecoin desk with wallet clustering',
      category: 'Trading',
      tier: 'Pro',
      status: 'ICO Live',
      chain: 'solana',
      raiseTarget: 190000,
      amountRaised: 142000,
      logo: 3,
    },
    {
      name: 'Asmlbot',
      ticker: 'ASMLX',
      deployer: '@lithodesk',
      oneLiner: 'Lithography and AI chip supply chain stock agent',
      category: 'Trading',
      tier: 'Pro',
      status: 'Trading',
      chain: 'robinhood',
      raiseTarget: 260000,
      amountRaised: 260000,
      logo: 0,
      trading: true,
      price: 0.0029,
    },
    {
      name: 'Climatemarket',
      ticker: 'CLIM',
      deployer: '@wxalpha',
      oneLiner: 'Institutional Polymarket climate and weather book',
      category: 'Prediction',
      tier: 'Pro',
      status: 'ICO Live',
      chain: 'robinhood',
      raiseTarget: 210000,
      amountRaised: 168000,
      logo: 1,
    },
  ])
];

export function getAgentBySlug(slug: string): Agent | undefined {
  return mockAgents.find(a => a.slug === slug);
}

export function getAgentBuybacks(agentId: string): BuybackEvent[] {
  return mockBuybackEvents.filter(b => b.agentId === agentId).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}
