'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Agent, AgentTier } from '@/lib/mock-data';
import { LoadingState } from '@/components/LoadingState';
import { HomeFeatured } from './HomeFeatured';
import { HomeAgentCard } from './HomeAgentCard';

const HOME_FEATURED_SLUG = 'yield-optimizer';
const TIERS: AgentTier[] = ['Seed', 'Core', 'Pro'];

function DiscoverShieldIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden
      className="home-discover-shield-icon"
    >
      <path
        d="M10 1.667L3.333 4.167v5c0 4.167 2.917 8.083 6.667 9.166 3.75-1.083 6.667-5 6.667-9.166v-5L10 1.667z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path
        d="M7.5 10l1.667 1.667L12.5 8.333"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function HomeDiscover() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTier, setActiveTier] = useState<AgentTier>('Seed');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await fetch('/api/agents?sort=raiseProgress&order=desc');
        const data = await response.json();
        if (!cancelled) setAgents(data.agents ?? []);
      } catch (error) {
        console.error('Failed to fetch agents:', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const featured = useMemo(() => {
    const preferred = agents.find((agent) => agent.slug === HOME_FEATURED_SLUG);
    return preferred ?? agents[0];
  }, [agents]);

  const gridAgents = useMemo(() => {
    const pool = featured
      ? agents.filter((agent) => agent.slug !== featured.slug)
      : agents;
    return pool.filter((agent) => agent.tier === activeTier).slice(0, 9);
  }, [agents, featured, activeTier]);

  return (
    <section className="home-discover" aria-labelledby="home-discover-heading">
      <div className="home-discover-header">
        <div className="home-discover-heading-wrap">
          <div className="home-discover-icon-frame" aria-hidden>
            <span className="home-stat-bracket home-stat-bracket-tl" />
            <span className="home-stat-bracket home-stat-bracket-bl" />
            <span className="home-stat-bracket home-stat-bracket-tr" />
            <span className="home-stat-bracket home-stat-bracket-br" />
            <DiscoverShieldIcon />
          </div>
          <div className="home-discover-heading-copy">
            <h2 id="home-discover-heading" className="home-discover-title">
              Discover
            </h2>
            <p className="home-discover-subtitle">
              Find agents people shared. Peek through Seed, Core, and Pro
            </p>
          </div>
        </div>

        <div className="home-discover-tabs" role="tablist" aria-label="Agent tiers">
          {TIERS.map((tier) => (
            <button
              key={tier}
              type="button"
              role="tab"
              aria-selected={activeTier === tier}
              className={`home-discover-tab${activeTier === tier ? ' is-active' : ''}`}
              onClick={() => setActiveTier(tier)}
            >
              {tier}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <LoadingState label="Loading agents…" onBrand />
      ) : (
        <>
          {featured ? <HomeFeatured agent={featured} /> : null}

          {gridAgents.length > 0 ? (
            <div className="home-agent-grid">
              {gridAgents.map((agent) => (
                <HomeAgentCard key={agent.id} agent={agent} />
              ))}
            </div>
          ) : (
            <p className="home-discover-empty">No {activeTier} agents available yet.</p>
          )}
        </>
      )}
    </section>
  );
}
