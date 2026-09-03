'use client';

import Link from 'next/link';
import type { Agent } from '@/lib/mock-data';
import { HomeAgentCardMedia } from './HomeAgentCardMedia';
import { HomeAgentCardProgress } from './HomeAgentCardProgress';
import { HomeCtaButton } from './HomeCtaButton';

export function HomeAgentCard({ agent }: { agent: Agent }) {
  const detailHref = `/agents/${agent.slug}`;
  const buyHref = detailHref;

  return (
    <article className="home-agent-card">
      <HomeAgentCardMedia agent={agent} variant="grid" />

      <div className="home-agent-card-body">
        <div className="home-agent-card-copy">
          <Link href={detailHref} className="home-agent-card-title">
            {agent.name}
          </Link>
          <p className="home-agent-card-handle">{agent.deployer}</p>
          <p className="home-agent-card-desc">{agent.oneLiner}</p>
        </div>

        <HomeAgentCardProgress raised={agent.amountRaised} target={agent.raiseTarget} compact />

        <HomeCtaButton href={buyHref} className="w-full">
          Buy {agent.ticker}
        </HomeCtaButton>
      </div>
    </article>
  );
}
