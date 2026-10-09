import { NextRequest, NextResponse } from 'next/server';
import { saveTelegramSignup } from '@/lib/account-db';
import { addNotifySignup } from '@/lib/store';

const TELEGRAM_HANDLE = /^[a-zA-Z][a-zA-Z0-9_]{4,31}$/;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const raw = typeof body?.telegram === 'string' ? body.telegram.trim() : '';
    const agent = typeof body?.agent === 'string' && body.agent.trim() ? body.agent.trim() : 'apollo';
    const telegram = raw.replace(/^@/, '');

    if (!TELEGRAM_HANDLE.test(telegram)) {
      return NextResponse.json(
        { error: 'Enter a valid Telegram username' },
        { status: 400 },
      );
    }

    const wallet = typeof body?.wallet === 'string' ? body.wallet.trim() : '';
    await saveTelegramSignup({
      telegram,
      agent,
      wallet: wallet || null,
    });
    addNotifySignup(agent, telegram);

    return NextResponse.json(
      { message: 'You will be notified' },
      { status: 200 },
    );
  } catch (error) {
    console.error('Notify signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
