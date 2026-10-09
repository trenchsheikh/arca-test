import { NextRequest, NextResponse } from 'next/server';
import { upsertAccount } from '@/lib/account-db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const wallet = typeof body?.wallet === 'string' ? body.wallet.trim() : '';
    if (!wallet) {
      return NextResponse.json({ error: 'Wallet is required' }, { status: 400 });
    }

    const account = await upsertAccount(wallet);
    return NextResponse.json({ account });
  } catch (error) {
    console.error('Account sync error:', error instanceof Error ? error.message : 'unknown');
    return NextResponse.json({ error: 'Could not save account' }, { status: 500 });
  }
}
