import { NextRequest, NextResponse } from 'next/server';
import { getAgentBySlug, getBuybackEvents, getIcoSession } from '@/lib/store';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const agent = getAgentBySlug(slug);

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    const buybacks = getBuybackEvents(agent.id);
    const icoSession = getIcoSession(agent.id);

    return NextResponse.json({
      agent,
      buybacks,
      icoSession,
      team: agent.team,
      documents: agent.documents,
      drawdownHistory: agent.drawdownHistory,
      vestingCliffDays: agent.vestingCliffDays,
      vestingDurationDays: agent.vestingDurationDays,
      icoEndsAt: agent.icoEndsAt,
    });
  } catch (error) {
    console.error('Agent GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
