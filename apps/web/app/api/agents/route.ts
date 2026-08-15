import { NextRequest, NextResponse } from 'next/server';
import { getAgents } from '@/lib/store';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    let agents = getAgents();
    
    // Filter by category
    const category = searchParams.get('category');
    if (category) {
      agents = agents.filter(a => a.category === category);
    }
    
    // Filter by tier
    const tier = searchParams.get('tier');
    if (tier) {
      agents = agents.filter(a => a.tier === tier);
    }
    
    // Filter by status
    const status = searchParams.get('status');
    if (status) {
      agents = agents.filter(a => a.status === status);
    }
    
    // Search by name, deployer, ticker
    const search = searchParams.get('search');
    if (search) {
      const searchLower = search.toLowerCase();
      agents = agents.filter(a => 
        a.name.toLowerCase().includes(searchLower) ||
        a.deployer.toLowerCase().includes(searchLower) ||
        a.ticker.toLowerCase().includes(searchLower) ||
        a.oneLiner.toLowerCase().includes(searchLower) ||
        a.description.toLowerCase().includes(searchLower)
      );
    }
    
    // Sort
    const sort = searchParams.get('sort');
    const order = searchParams.get('order') || 'desc';
    
    if (sort) {
      agents.sort((a, b) => {
        let aVal: any = 0;
        let bVal: any = 0;
        
        switch (sort) {
          case 'revenue':
            aVal = a.totalRevenue;
            bVal = b.totalRevenue;
            break;
          case 'winRate':
            aVal = a.winRate;
            bVal = b.winRate;
            break;
          case 'age':
            aVal = a.walletAge;
            bVal = b.walletAge;
            break;
          case 'raiseProgress':
            aVal = a.raiseTarget > 0 ? a.amountRaised / a.raiseTarget : 0;
            bVal = b.raiseTarget > 0 ? b.amountRaised / b.raiseTarget : 0;
            break;
          default:
            return 0;
        }
        
        return order === 'asc' ? aVal - bVal : bVal - aVal;
      });
    }
    
    return NextResponse.json({
      agents,
      count: agents.length,
    });
  } catch (error) {
    console.error('Agents GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
