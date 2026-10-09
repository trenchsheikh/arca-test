import { NextResponse } from 'next/server';
import { listAccounts } from '@/lib/account-db';

export async function GET() {
  try {
    const accounts = await listAccounts();
    return NextResponse.json({
      accounts: accounts.map((account) => ({
        id: account.id,
        wallet: account.wallet,
        role: account.role,
        telegram: account.telegram,
        joined: account.joined,
        totalContributed: Number(account.totalContributed) || 0,
        agentsBacked: Number(account.agentsBacked) || 0,
      })),
    });
  } catch (error) {
    console.error('Account list error:', error instanceof Error ? error.message : 'unknown');
    return NextResponse.json({ error: 'Could not load accounts' }, { status: 500 });
  }
}
