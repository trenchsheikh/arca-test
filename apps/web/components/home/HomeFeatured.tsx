'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Agent } from '@/lib/mock-data';
import { HomeCtaButton } from './HomeCtaButton';

export function HomeFeatured({ agent }: { agent: Agent }) {
  const detailHref = `/agents/${agent.slug}`;

  return (
    <article className="home-featured">
      <div className="home-featured-inner">
        <div className="home-agent-media home-featured-media">
          <Image src="/featured.png" alt="Apollo featured artwork" fill sizes="(max-width: 900px) 100vw, 494px" className="home-featured-art" />
          <span className="home-agent-badge home-agent-badge-left">Featured</span>
          <span className="home-agent-badge home-agent-badge-right">Coming soon</span>
        </div>

        <div className="home-featured-content">
          <div className="home-featured-copy">
            <h3 className="home-featured-title">
              <Link href={detailHref}>{agent.name}</Link>
            </h3>
            <div className="home-featured-by">
              <span className="home-featured-by-label">By</span>
              <span className="home-featured-by-avatar">
                <Image
                  src={agent.logoUrl}
                  alt=""
                  width={20}
                  height={20}
                  className="h-full w-full object-cover"
                />
              </span>
              <span className="home-featured-by-name">{agent.deployer}</span>
            </div>
            <p className="home-featured-desc">{agent.oneLiner}</p>
          </div>

          <div className="home-featured-progress-wrap">
            <p className="home-featured-soon">Coming soon</p>
          </div>

          <div className="home-featured-actions">
            <span className="home-cta-btn" aria-disabled="true">ICO coming soon</span>
            <HomeCtaButton href={detailHref} variant="secondary">
              View Project
            </HomeCtaButton>
          </div>
        </div>
      </div>
    </article>
  );
}

