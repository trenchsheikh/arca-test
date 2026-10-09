export type AuthSession = {
  /** Short display label, usually a shortened Solana address. */
  username: string;
  wallet: string;
  loggedInAt: string;
};

export function shortenAddress(value: string): string {
  if (!value) return '';
  if (value.length <= 14) return value;
  return `${value.slice(0, 4)}…${value.slice(-4)}`;
}

export function adminWallets(): string[] {
  return (process.env.NEXT_PUBLIC_ADMIN_WALLETS || '')
    .split(',')
    .map((wallet) => wallet.trim())
    .filter(Boolean);
}

export function isAdminWallet(wallet: string): boolean {
  if (!wallet) return false;
  return adminWallets().some((allowed) => allowed === wallet);
}
