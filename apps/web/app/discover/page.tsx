'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { DiscoverFeatured } from '@/components/DiscoverFeatured';
import { DiscoverTierRail } from '@/components/DiscoverTierRail';
import { LoadingState } from '@/components/LoadingState';
import { FEATURED_AGENT_SLUG, type Agent, type AgentTier } from '@/lib/mock-data';

const TIERS: AgentTier[] = ['Seed', 'Core', 'Pro'];

export default function DiscoverPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAgents = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/agents?sort=raiseProgress&order=desc');
      const data = await response.json();
      setAgents(data.agents || []);
    } catch (error) {
      console.error('Failed to fetch agents:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  const featured = useMemo(
    () => agents.find((agent) => agent.slug === FEATURED_AGENT_SLUG),
    [agents],
  );

  const byTier = useMemo(() => {
    const map: Record<AgentTier, Agent[]> = { Seed: [], Core: [], Pro: [] };
    for (const agent of agents) {
      if (agent.slug === FEATURED_AGENT_SLUG) continue;
      map[agent.tier]?.push(agent);
    }
    return map;
  }, [agents]);

  const hasRails = TIERS.some((tier) => byTier[tier].length > 0);

  return (
    <div className="arca-page discover-page">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 max-w-2xl"
        >
          <h1 className="font-display font-bold text-chalk text-2xl sm:text-4xl mb-1.5 tracking-tight">
            Discover
          </h1>
          <p className="text-chalk-dim text-sm sm:text-base">
            Find agents people shared. Peek through Seed, Core, and Pro.
          </p>
        </motion.div>

        {loading ? (
          <LoadingState label="Loading agents…" onBrand />
        ) : !featured && !hasRails ? (
          <div className="rounded-xl border border-dashed border-white/15 px-5 py-10 text-center">
            <p className="font-display text-lg font-bold text-chalk mb-1">
              No Agents Yet
            </p>
            <p className="text-chalk-dim text-sm">
              Seed, Core, and Pro carousels will show here when agents go live.
            </p>
          </div>
        ) : (
          <div className="discover-tier-stack">
            {featured ? <DiscoverFeatured agent={featured} /> : null}
            {TIERS.map((tier) => (
              <DiscoverTierRail key={tier} tier={tier} agents={byTier[tier]} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
