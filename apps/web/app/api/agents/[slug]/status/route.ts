import { NextRequest, NextResponse } from 'next/server';
import {
  getAgentBySlug,
  updateAgent,
  createIcoSession,
  getIcoSession,
} from '@/lib/store';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const agent = getAgentBySlug(slug);

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    const body = await request.json();
    const { status } = body as { status?: string };

    if (status === 'ICO Live') {
      const endsAt = new Date(Date.now() + 1000 * 60 * 60 * 48);
      if (!getIcoSession(agent.id)) {
        createIcoSession(agent.id, endsAt);
      }
      const updated = updateAgent(agent.id, {
        status: 'ICO Live',
        icoEndsAt: endsAt.toISOString(),
      });
      return NextResponse.json({ agent: updated });
    }

    if (status === 'ICO Upcoming') {
      const updated = updateAgent(agent.id, { status: 'ICO Upcoming' });
      return NextResponse.json({ agent: updated });
    }

    return NextResponse.json(
      { error: 'Unsupported status. Use "ICO Live" or "ICO Upcoming".' },
      { status: 400 },
    );
  } catch (error) {
    console.error('Agent status POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
