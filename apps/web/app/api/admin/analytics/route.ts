import { NextResponse } from 'next/server';
import { getAdminAnalytics } from '@/lib/store';

export async function GET() {
  try {
    const analytics = getAdminAnalytics();
    
    return NextResponse.json({ analytics });
  } catch (error) {
    console.error('Admin analytics error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
