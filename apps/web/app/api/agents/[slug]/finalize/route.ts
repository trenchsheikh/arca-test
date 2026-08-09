import { NextRequest, NextResponse } from 'next/server';
import { getAgentBySlug, finalizeIco } from '@/lib/store';

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
    const { success } = body;

    const result = finalizeIco(agent.id, success);

    if (!result) {
      return NextResponse.json(
        { error: 'Unable to finalize ICO' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      agent: result.agent,
      positions: result.positions,
    });
  } catch (error) {
    console.error('Finalize error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
