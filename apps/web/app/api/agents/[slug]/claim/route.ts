import { NextRequest, NextResponse } from 'next/server';
import { saveUserRecord } from '@/lib/account-db';
import { getAgentBySlug, claimTokens, getInvestorTransactions } from '@/lib/store';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const agent = getAgentBySlug(slug);

    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { wallet } = body;

    if (!wallet) {
      return NextResponse.json(
        { error: 'Wallet address required' },
        { status: 400 }
      );
    }

    const position = claimTokens(wallet, agent.id);

    if (!position) {
      return NextResponse.json(
        { error: 'No claimable position found' },
        { status: 404 }
      );
    }

    const transaction = getInvestorTransactions(wallet)[0];
    await saveUserRecord({
      wallet,
      kind: 'position',
      ref: agent.id,
      payload: position,
    });
    if (transaction) {
      await saveUserRecord({
        wallet,
        kind: 'transaction',
        ref: transaction.id,
        payload: transaction,
      });
    }

    return NextResponse.json({
      success: true,
      position,
    });
  } catch (error) {
    console.error('Claim error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
