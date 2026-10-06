import type { PrivyClientConfig } from '@privy-io/react-auth';
import { toSolanaWalletConnectors } from '@privy-io/react-auth/solana';

const solanaConnectors = toSolanaWalletConnectors({
  // Phantom's in-page channel is not ready during the first page load.
  // Auto-connect races that setup and throws "Channel secret not available yet".
  shouldAutoConnect: false,
});

/** External Solana wallets only. No email, social, or embedded wallet signup. */
export const privyConfig: PrivyClientConfig = {
  loginMethods: ['wallet'],
  appearance: {
    theme: 'dark',
    accentColor: '#5d74e6',
    walletChainType: 'solana-only',
    walletList: ['phantom', 'solflare', 'backpack', 'detected_solana_wallets'],
    showWalletLoginFirst: true,
  },
  embeddedWallets: {
    ethereum: { createOnLogin: 'off' },
    solana: { createOnLogin: 'off' },
  },
  externalWallets: {
    solana: { connectors: solanaConnectors },
  },
};

export const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID || '';
