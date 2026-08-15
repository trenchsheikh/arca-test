'use client';

import { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { DiscoverTierRail } from '@/components/DiscoverTierRail';
import { LoadingState } from '@/components/LoadingState';
import type { Agent, AgentCategory, AgentStatus, AgentTier } from '@/lib/mock-data';
import { MdIcon } from '@/components/material';

const TIERS: AgentTier[] = ['Seed', 'Core', 'Pro'];

const STATUSES: Array<AgentStatus | 'All'> = [
  'All',
  'ICO Live',
  'Trading',
  'ICO Upcoming',
];

const CATEGORIES: Array<AgentCategory | 'All'> = [
  'All',
  'Trading',
  'Prediction',
  'Arbitrage',
  'Research',
  'Other',
];

function DiscoverContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState<AgentStatus | 'All'>(
    (searchParams.get('status') as AgentStatus) || 'All',
  );
  const [categoryFilter, setCategoryFilter] = useState<AgentCategory | 'All'>(
    (searchParams.get('category') as AgentCategory) || 'All',
  );

  const fetchAgents = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (categoryFilter !== 'All') params.set('category', categoryFilter);
      if (statusFilter !== 'All') params.set('status', statusFilter);
      params.set('sort', 'raiseProgress');
      params.set('order', 'desc');

      const response = await fetch(`/api/agents?${params.toString()}`);
      const data = await response.json();
      setAgents(data.agents || []);
    } catch (error) {
      console.error('Failed to fetch agents:', error);
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAgents();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchAgents]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (categoryFilter !== 'All') params.set('category', categoryFilter);
    if (statusFilter !== 'All') params.set('status', statusFilter);
    const qs = params.toString();
    router.push(qs ? `/discover?${qs}` : '/discover', { scroll: false });
  }, [search, categoryFilter, statusFilter, router]);

  const byTier = useMemo(() => {
    const map: Record<AgentTier, Agent[]> = { Seed: [], Core: [], Pro: [] };
    for (const agent of agents) {
      map[agent.tier]?.push(agent);
    }
    return map;
  }, [agents]);

  const hasResults = agents.length > 0;

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

        <div className="discover-filters mb-5 sm:mb-6">
          <label className="discover-search">
            <MdIcon className="discover-search-icon">search</MdIcon>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search agents or deployers"
              className="discover-search-input"
              aria-label="Search agents"
            />
            {search ? (
              <button
                type="button"
                className="discover-search-clear"
                aria-label="Clear search"
                onClick={() => setSearch('')}
              >
                <MdIcon>close</MdIcon>
              </button>
            ) : null}
          </label>

          <div className="discover-filter-row" role="group" aria-label="Status">
            {STATUSES.map((s) => (
              <button
                key={s}
                type="button"
                className={`discover-filter-chip ${statusFilter === s ? 'is-active' : ''}`}
                onClick={() => setStatusFilter(s)}
              >
                {s === 'All' ? 'All' : s.replace('ICO ', '')}
              </button>
            ))}
          </div>

          <div className="discover-filter-row" role="group" aria-label="Category">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                className={`discover-filter-chip ${categoryFilter === c ? 'is-active' : ''}`}
                onClick={() => setCategoryFilter(c)}
              >
                {c === 'All' ? 'All categories' : c}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <LoadingState label="Loading agents…" onBrand />
        ) : !hasResults ? (
          <div className="rounded-xl border border-dashed border-white/15 px-5 py-10 text-center">
            <p className="font-display text-lg font-bold text-chalk mb-1">
              No Agents Match
            </p>
            <p className="text-chalk-dim text-sm">
              Clear search or filters to see Seed, Core, and Pro carousels.
            </p>
          </div>
        ) : (
          <div className="discover-tier-stack">
            {TIERS.map((tier) => (
              <DiscoverTierRail key={tier} tier={tier} agents={byTier[tier]} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function DiscoverPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <LoadingState label="Loading discover…" onBrand />
        </div>
      }
    >
      <DiscoverContent />
    </Suspense>
  );
}
