'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Agent } from '@/lib/mock-data';
import { HomeAgentCardMedia } from './HomeAgentCardMedia';
import { HomeAgentCardProgress } from './HomeAgentCardProgress';
import { HomeCtaButton } from './HomeCtaButton';

export function HomeFeatured({ agent }: { agent: Agent }) {
  const detailHref = `/agents/${agent.slug}`;
  const buyHref = detailHref;

  return (
    <article className="home-featured">
      <div className="home-featured-inner">
        <HomeAgentCardMedia agent={agent} variant="featured" className="home-featured-media" />

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
            <HomeAgentCardProgress raised={agent.amountRaised} target={agent.raiseTarget} />
          </div>

          <div className="home-featured-actions">
            <HomeCtaButton href={buyHref}>Buy {agent.ticker}</HomeCtaButton>
            <HomeCtaButton href={detailHref} variant="secondary">
              View Project
            </HomeCtaButton>
          </div>
        </div>
      </div>
    </article>
  );
}
