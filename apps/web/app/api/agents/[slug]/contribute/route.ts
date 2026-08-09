import { NextRequest, NextResponse } from 'next/server';
import { getAgentBySlug, addContribution } from '@/lib/store';

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

    if (agent.status !== 'ICO Live') {
      return NextResponse.json(
        { error: 'ICO is not live' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { wallet, amount } = body;

    if (!wallet || !amount || amount < agent.minTicket) {
      return NextResponse.json(
        { error: `Minimum ticket is ${agent.minTicket}` },
        { status: 400 }
      );
    }

    const result = addContribution(agent.id, wallet, amount);

    return NextResponse.json({
      success: true,
      contribution: result.contribution,
      tokensAllocated: result.tokensAllocated,
      agent: getAgentBySlug(slug),
    });
  } catch (error) {
    console.error('Contribute error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
