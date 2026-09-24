export type PreIcoAgent = {
  name: string;
  slug: string;
  artwork: string;
  subtitle: string;
  deployer: string;
  deployerBio: string;
  raiseTarget: string;
  raiseAllocation: string;
  launchFdv: string;
  recordNote: string;
  performance: [label: string, value: string][];
  description: string;
  thesis: string;
  steps: [name: string, description: string][];
  whyCapital: string;
  capitalCaveat: string;
  allocation: [name: string, description: string][];
  terms: [label: string, value: string][];
};

export const preIcoAgents: Record<string, PreIcoAgent> = {
  apollo: {
    slug: 'apollo',
    name: 'Apollo',
    artwork: '/featured.png',
    subtitle: 'Autonomous prediction agent trading probability dislocations on Polymarket.',
    deployer: '@arcamarkets',
    deployerBio: 'Deployed by Arca as its first autonomous prediction agent.',
    raiseTarget: '$15,000',
    raiseAllocation: '10%',
    launchFdv: '$150,000',
    recordNote: 'Polymarket record revealed at launch.',
    performance: [['Prediction P&L', '+$8,420'], ['Markets Traded', '184'], ['Win Rate', '68.5%'], ['Capital Deployed', '$24,600']],
    description: 'Apollo is an autonomous prediction-market agent built to identify where market-implied probabilities diverge from its own estimates. It monitors Polymarket, analyzes relevant information, prices outcomes independently and takes positions when the discrepancy meets its strategy and risk thresholds.',
    thesis: 'The market has a price. Apollo has a probability.',
    steps: [
      ['Discover', 'Continuously scans active prediction markets for opportunities.'],
      ['Price', 'Forms an independent probability using market and external data.'],
      ['Compare', 'Measures Apollo’s estimate against the market-implied probability.'],
      ['Execute', 'Takes positions when the discrepancy clears its strategy and risk thresholds.'],
    ],
    whyCapital: 'Apollo’s opportunity set can exceed the capital available to deploy against it. Additional capital expands capacity to take simultaneous positions, diversify exposure and operate across a broader opportunity set within predefined risk parameters.',
    capitalCaveat: 'Capital expands capacity. It does not guarantee performance.',
    allocation: [
      ['Trading Capital', 'Primary allocation to Apollo’s prediction-market operating treasury.'],
      ['Risk Reserve', 'Capital reserved for settlement, liquidity and drawdown management.'],
      ['Infrastructure', 'Data, inference and execution infrastructure required to operate Apollo.'],
      ['Strategy Expansion', 'Additional markets and strategies that meet its operating criteria.'],
    ],
    terms: [
      ['Ticker', '$APOLLO'], ['Launch FDV', '$150,000'], ['Raise Target', '$15,000 (10% FDV)'],
      ['Token Price', '$0.00015'], ['Min Ticket', '0.05 SOL'], ['Threshold', '50% of target'],
      ['Vesting Cliff', '30 days'], ['Vesting Duration', '365 days linear'],
      ['Chain', '—'], ['Status', 'COMING SOON'],
    ],
  },
};
