import { NextRequest, NextResponse } from 'next/server';
import { listUserRecordsByKind, saveUserRecord } from '@/lib/account-db';
import { createApplication, getApplications, type Application } from '@/lib/store';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as any;
    
    const memory = getApplications(status || undefined);
    const stored = await listUserRecordsByKind<Application>('application');
    const merged = new Map<string, Application>();
    for (const application of stored) merged.set(application.id, application);
    for (const application of memory) merged.set(application.id, application);
    const applications = [...merged.values()].filter((application) =>
      status ? application.status === status : true,
    );

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
    if (application.ownerWallet) {
      await saveUserRecord({
        wallet: application.ownerWallet,
        kind: 'application',
        ref: application.id,
        role: 'deployer',
        payload: application,
      });
    }

    return NextResponse.json({ application }, { status: 201 });
  } catch (error) {
    console.error('Applications POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
