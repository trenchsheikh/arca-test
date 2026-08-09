import { NextRequest, NextResponse } from 'next/server';
import { getInvestorPositions, getInvestorTransactions, getBuybackEvents } from '@/lib/store';

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

    const positions = getInvestorPositions(wallet);
    const transactions = getInvestorTransactions(wallet);
    
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
