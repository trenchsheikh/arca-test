import { NextRequest, NextResponse } from 'next/server';
import { saveUserRecord } from '@/lib/account-db';
import { getApplicationById, updateApplication, approveApplication, type Application } from '@/lib/store';

async function persistApplication(application: Application | undefined) {
  if (!application?.ownerWallet) return;
  await saveUserRecord({
    wallet: application.ownerWallet,
    kind: 'application',
    ref: application.id,
    role: 'deployer',
    payload: application,
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const application = getApplicationById(id);
    
    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ application });
  } catch (error) {
    console.error('Application GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action, tier, riskRating, ...updates } = body;
    
    if (action === 'approve' && tier && riskRating) {
      const result = approveApplication(id, tier, riskRating);
      if (!result) {
        return NextResponse.json(
          { error: 'Application not found' },
          { status: 404 }
        );
      }
      await persistApplication(result.application);
      return NextResponse.json(result);
    }
    
    if (action === 'reject') {
      const application = updateApplication(id, { status: 'Rejected' });
      if (!application) {
        return NextResponse.json(
          { error: 'Application not found' },
          { status: 404 }
        );
      }
      await persistApplication(application);
      return NextResponse.json({ application });
    }
    
    if (action === 'needsInfo') {
      const application = updateApplication(id, { status: 'NeedsInfo' });
      if (!application) {
        return NextResponse.json(
          { error: 'Application not found' },
          { status: 404 }
        );
      }
      await persistApplication(application);
      return NextResponse.json({ application });
    }
    
    const application = updateApplication(id, updates);
    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }
    await persistApplication(application);

    return NextResponse.json({ application });
  } catch (error) {
    console.error('Application PATCH error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
