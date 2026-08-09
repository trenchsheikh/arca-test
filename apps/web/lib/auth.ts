'use client';

const AUTH_KEY = 'arca_auth';

export const DEMO_CREDENTIALS = {
  username: 'admin',
  password: 'pass',
} as const;

export const DEMO_WALLET = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';

export type AuthSession = {
  username: string;
  loggedInAt: string;
};

export function getSession(): AuthSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

export function setSession(username: string): AuthSession {
  const session: AuthSession = {
    username,
    loggedInAt: new Date().toISOString(),
  };
  localStorage.setItem(AUTH_KEY, JSON.stringify(session));
  window.dispatchEvent(new Event('arca-auth-changed'));
  return session;
}

export function clearSession(): void {
  localStorage.removeItem(AUTH_KEY);
  window.dispatchEvent(new Event('arca-auth-changed'));
}

export function login(username: string, password: string): AuthSession | null {
  if (
    username.trim() === DEMO_CREDENTIALS.username &&
    password === DEMO_CREDENTIALS.password
  ) {
    return setSession(DEMO_CREDENTIALS.username);
  }
  return null;
}

export function isLoggedIn(): boolean {
  return getSession() !== null;
}
