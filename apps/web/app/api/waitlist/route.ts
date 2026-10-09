import { NextRequest, NextResponse } from 'next/server';
import { saveWaitlistEmail } from '@/lib/account-db';
import { addToWaitlist, getWaitlist } from '@/lib/store';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    await saveWaitlistEmail(email);
    addToWaitlist(email);

    return NextResponse.json(
      { message: 'Successfully joined waitlist' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Waitlist error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  const waitlist = getWaitlist();
  return NextResponse.json({
    count: waitlist.length,
    emails: waitlist,
  });
}
