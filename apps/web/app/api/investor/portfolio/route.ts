import { NextRequest, NextResponse } from 'next/server';
import { listUserRecords } from '@/lib/account-db';
import {
  getInvestorPositions,
  getInvestorTransactions,
  getBuybackEvents,
  type InvestorPosition,
  type InvestorTransaction,
} from '@/lib/store';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get('wallet');

    if (!wallet) {
      return NextResponse.json(
        { error: 'Wallet parameter required' },
        { status: 400 }
      );
    }

    const storedPositions = await listUserRecords<InvestorPosition>(wallet, 'position');
    const storedTransactions = await listUserRecords<InvestorTransaction>(wallet, 'transaction');
    const positions = storedPositions.length ? storedPositions : getInvestorPositions(wallet);
    const transactions = storedTransactions.length
      ? storedTransactions
      : getInvestorTransactions(wallet);
    
    // Get buybacks relevant to this investor's holdings
    const agentIds = [...new Set(positions.map(p => p.agentId))];
    const buybacks = getBuybackEvents().filter(b => agentIds.includes(b.agentId));

    return NextResponse.json({
      wallet,
      positions,
      transactions,
      buybacks,
    });
  } catch (error) {
    console.error('Portfolio error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
