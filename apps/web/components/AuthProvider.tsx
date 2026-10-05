'use client';

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';
import { usePrivy, type User } from '@privy-io/react-auth';
import { useWallets } from '@privy-io/react-auth/solana';
import {
  isAdminWallet,
  shortenAddress,
  type AuthSession,
} from '@/lib/auth';

type AuthContextValue = {
  session: AuthSession | null;
  ready: boolean;
  configured: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  wallet: string;
  login: () => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function solanaAddressFromUser(user: User | null): string {
  if (!user) return '';
  const account = user.linkedAccounts.find(
    (entry) => entry.type === 'wallet' && entry.chainType === 'solana',
  );
  return account && 'address' in account ? account.address : '';
}

export function PrivyAuthProvider({ children }: { children: ReactNode }) {
  const { ready, authenticated, user, login, logout } = usePrivy();
  const { wallets } = useWallets();

  const wallet = wallets[0]?.address || solanaAddressFromUser(user);
  const isAuthenticated = ready && authenticated && !!wallet;

  const value = useMemo<AuthContextValue>(() => {
    const session: AuthSession | null = isAuthenticated
      ? {
          username: shortenAddress(wallet),
          wallet,
          loggedInAt: user?.createdAt
            ? new Date(user.createdAt).toISOString()
            : new Date().toISOString(),
        }
      : null;

    return {
      session,
      ready,
      configured: true,
      isAuthenticated,
      isAdmin: isAuthenticated && isAdminWallet(wallet),
      wallet: isAuthenticated ? wallet : '',
      login: () => {
        login();
      },
      logout: () => {
        void logout();
      },
    };
  }, [isAuthenticated, login, logout, ready, user?.createdAt, wallet]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function UnconfiguredAuthProvider({ children }: { children: ReactNode }) {
  const value = useMemo<AuthContextValue>(
    () => ({
      session: null,
      ready: true,
      configured: false,
      isAuthenticated: false,
      isAdmin: false,
      wallet: '',
      login: () => {},
      logout: () => {},
    }),
    [],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
