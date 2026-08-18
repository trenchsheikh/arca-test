import { existsSync } from 'fs';
import { resolve } from 'path';
import { NextRequest, NextResponse } from 'next/server';
import { loadEnvConfig } from '@next/env';
import {
  fetchWalletStats,
  WalletStatsError,
  type WalletChain,
} from '@/lib/wallet-stats';

function hydrateRepoEnv() {
  const candidates = [process.cwd(), resolve(process.cwd(), '../..'), resolve(process.cwd(), '..')];
  for (const dir of candidates) {
    if (existsSync(resolve(dir, '.env')) || existsSync(resolve(dir, '.env.local'))) {
      loadEnvConfig(dir);
      return;
    }
  }
}

try {
  hydrateRepoEnv();
} catch {
  // Public RPC fallbacks still work if repo-root .env cannot be loaded.
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address') || '';
    const chain = (searchParams.get('chain') || '') as WalletChain;

    const stats = await fetchWalletStats(address, chain);
    return NextResponse.json(stats, {
      headers: { 'Cache-Control': 'private, max-age=10' },
    });
  } catch (error) {
    if (error instanceof WalletStatsError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('Wallet stats error:', error instanceof Error ? error.message : 'unknown');
    return NextResponse.json({ error: 'Failed to pull wallet stats' }, { status: 502 });
  }
}
