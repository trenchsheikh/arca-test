import { NextRequest, NextResponse } from 'next/server';
import {
  fetchWalletStats,
  WalletStatsError,
  type WalletChain,
} from '@/lib/wallet-stats';

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
