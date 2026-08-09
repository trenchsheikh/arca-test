/**
 * Chain type: Solana or Robinhood Chain (EVM L2)
 */
export type ChainType = 'solana' | 'robinhood';

/**
 * Solana cluster configuration
 */
export const SOLANA_CLUSTERS = {
  mainnet: {
    name: 'Solana Mainnet',
    cluster: 'mainnet-beta',
    rpcUrl: 'https://api.mainnet-beta.solana.com',
    explorer: 'https://explorer.solana.com',
  },
  devnet: {
    name: 'Solana Devnet',
    cluster: 'devnet',
    rpcUrl: 'https://api.devnet.solana.com',
    explorer: 'https://explorer.solana.com',
  },
  testnet: {
    name: 'Solana Testnet',
    cluster: 'testnet',
    rpcUrl: 'https://api.testnet.solana.com',
    explorer: 'https://explorer.solana.com',
  },
} as const;

/**
 * Robinhood Chain configuration
 * EVM-compatible Arbitrum L2
 */
export const ROBINHOOD_CHAIN = {
  mainnet: {
    chainId: 4663,
    name: 'Robinhood Chain',
    currency: 'ETH',
    rpcUrl: 'https://rpc.chain.robinhood.com', // Use Alchemy/QuickNode in production
    explorer: 'https://robinhoodchain.blockscout.com',
  },
  testnet: {
    chainId: 46630,
    name: 'Robinhood Chain Testnet',
    currency: 'ETH',
    rpcUrl: 'https://rpc.testnet.chain.robinhood.com',
    explorer: 'https://explorer.testnet.chain.robinhood.com',
  },
} as const;

/**
 * All supported chains by environment
 */
export const CHAINS = {
  solana: SOLANA_CLUSTERS,
  robinhood: ROBINHOOD_CHAIN,
} as const;
