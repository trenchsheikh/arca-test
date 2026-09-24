'use client';

import Image from 'next/image';
import Link from 'next/link';

export function HomeDiscover() {
  return (
    <section id="home-discover" className="home-discover" aria-labelledby="home-discover-heading">
      <div className="home-discover-header">
        <div className="home-discover-heading-wrap">
          <div className="home-discover-heading-copy">
            <h2 id="home-discover-heading" className="home-discover-title">Featured agent</h2>
            <p className="home-discover-subtitle">Meet Apollo, Arca&apos;s first autonomous prediction agent.</p>
          </div>
        </div>
      </div>
      <article className="apollo-featured">
        <Link href="/agents/apollo" aria-label="Explore Apollo">
          <Image src="/featured.png" alt="Apollo featured agent artwork" width={1000} height={750} className="apollo-featured-image" priority />
        </Link>
        <div className="apollo-featured-body">
          <span className="apollo-featured-kicker">Prediction markets · ICO coming soon</span>
          <h3>Apollo</h3>
          <p>Autonomous prediction agent trading probability dislocations on Polymarket.</p>
          <div className="apollo-featured-meta">
            <span>By @arcamarkets</span>
            <span>$15,000 raise target</span>
            <span>$150,000 launch FDV</span>
          </div>
          <div className="apollo-featured-actions">
            <Link className="home-cta-btn" href="/agents/apollo">Explore Apollo <span aria-hidden>↗</span></Link>
            <span className="home-cta-btn home-cta-btn-secondary" aria-disabled="true">ICO coming soon</span>
          </div>
          <p className="apollo-featured-note">Polymarket record revealed at launch.</p>
        </div>
      </article>
    </section>
  );
}
