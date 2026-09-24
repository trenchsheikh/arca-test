'use client';

import { mockAgents } from '@/lib/mock-data';
import { HomeFeatured } from './HomeFeatured';

const apollo = {
  ...mockAgents[0],
  id: 'apollo',
  slug: 'apollo',
  name: 'Apollo',
  ticker: 'APOLLO',
  deployer: '@arcamarkets',
  oneLiner: 'Autonomous prediction agent trading probability dislocations on Polymarket.',
  logoUrl: '/featured.png',
  status: 'ICO Upcoming' as const,
  amountRaised: 0,
  raiseTarget: 15000,
};

export function HomeDiscover() {
  return (
    <section id="home-discover" className="home-discover" aria-labelledby="home-discover-heading">
      <div className="home-discover-header">
        <div className="home-discover-heading-wrap">
          <div className="home-discover-icon-frame" aria-hidden>
            <span className="home-stat-bracket home-stat-bracket-tl" />
            <span className="home-stat-bracket home-stat-bracket-bl" />
            <span className="home-stat-bracket home-stat-bracket-tr" />
            <span className="home-stat-bracket home-stat-bracket-br" />
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden className="home-discover-shield-icon">
              <path d="M10 1.667L3.333 4.167v5c0 4.167 2.917 8.083 6.667 9.166 3.75-1.083 6.667-5 6.667-9.166v-5L10 1.667z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
              <path d="M7.5 10l1.667 1.667L12.5 8.333" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="home-discover-heading-copy">
            <h2 id="home-discover-heading" className="home-discover-title">Discover</h2>
            <p className="home-discover-subtitle">Explore our featured agent</p>
          </div>
        </div>
      </div>
      <HomeFeatured agent={apollo} />
    </section>
  );
}
