'use client';

import { HomeHero } from '@/components/home/HomeHero';
import { HomeDiscover } from '@/components/home/HomeDiscover';
import { HomeSectionDivider } from '@/components/home/HomeSectionDivider';

export default function HomePage() {
  return (
    <div className="home-page">
      <div className="home-page-backdrop" aria-hidden />
      <HomeSectionDivider />
      <div className="home-page-content home-column-inset">
        <HomeHero />
      </div>
      <HomeSectionDivider />
      <div className="home-page-content home-column-inset">
        <HomeDiscover />
      </div>
      <HomeSectionDivider />
    </div>
  );
}
