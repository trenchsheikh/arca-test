import { NextRequest, NextResponse } from 'next/server';
import { createApplication, getApplications } from '@/lib/store';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as any;
    
    const applications = getApplications(status || undefined);
    
    return NextResponse.json({ applications });
  } catch (error) {
    console.error('Applications GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const application = createApplication(body);
    
    return NextResponse.json({ application }, { status: 201 });
  } catch (error) {
    console.error('Applications POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
