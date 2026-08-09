'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  clearSession,
  getSession,
  login as doLogin,
  type AuthSession,
  DEMO_WALLET,
} from '@/lib/auth';

type AuthContextValue = {
  session: AuthSession | null;
  ready: boolean;
  isAuthenticated: boolean;
  wallet: string;
  login: (username: string, password: string) => boolean;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSessionState] = useState<AuthSession | null>(null);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(() => {
    setSessionState(getSession());
    setReady(true);
  }, []);

  useEffect(() => {
    refresh();
    const onChange = () => refresh();
    window.addEventListener('arca-auth-changed', onChange);
    window.addEventListener('storage', onChange);
    return () => {
      window.removeEventListener('arca-auth-changed', onChange);
      window.removeEventListener('storage', onChange);
    };
  }, [refresh]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      ready,
      isAuthenticated: !!session,
      wallet: DEMO_WALLET,
      login: (username, password) => {
        const next = doLogin(username, password);
        if (next) {
          setSessionState(next);
          return true;
        }
        return false;
      },
      logout: () => {
        clearSession();
        setSessionState(null);
      },
    }),
    [session, ready],
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
