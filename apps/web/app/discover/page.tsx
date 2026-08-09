'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { AgentCard } from '@/components/AgentCard';
import { LoadingState } from '@/components/LoadingState';
import type { Agent, AgentCategory, AgentTier, AgentStatus } from '@/lib/mock-data';
import {
  MdOutlinedTextField,
  MdOutlinedSelect,
  MdSelectOption,
  MdChipSet,
  MdFilterChip,
  MdIcon,
  MdIconButton,
  MdList,
  MdListItem,
  MdDivider,
  MdOutlinedButton,
} from '@/components/material';

const CATEGORIES: Array<AgentCategory | 'All'> = [
  'All',
  'Trading',
  'Prediction',
  'Arbitrage',
  'Yield',
  'Research',
  'Other',
];

const TIERS: Array<AgentTier | 'All'> = ['All', 'Seed', 'Core', 'Pro'];
const STATUSES: Array<AgentStatus | 'All'> = [
  'All',
  'ICO Upcoming',
  'ICO Live',
  'Trading',
];

function DiscoverContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'grid' | 'list'>('list');

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [categoryFilter, setCategoryFilter] = useState<AgentCategory | 'All'>(
    (searchParams.get('category') as AgentCategory) || 'All',
  );
  const [tierFilter, setTierFilter] = useState<AgentTier | 'All'>(
    (searchParams.get('tier') as AgentTier) || 'All',
  );
  const [statusFilter, setStatusFilter] = useState<AgentStatus | 'All'>(
    (searchParams.get('status') as AgentStatus) || 'All',
  );
  const [sort, setSort] = useState(searchParams.get('sort') || 'revenue');
  const [order, setOrder] = useState<'asc' | 'desc'>(
    (searchParams.get('order') as 'asc' | 'desc') || 'desc',
  );

  const fetchAgents = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (categoryFilter !== 'All') params.set('category', categoryFilter);
      if (tierFilter !== 'All') params.set('tier', tierFilter);
      if (statusFilter !== 'All') params.set('status', statusFilter);
      if (sort) params.set('sort', sort);
      if (order) params.set('order', order);

      const response = await fetch(`/api/agents?${params.toString()}`);
      const data = await response.json();
      setAgents(data.agents || []);
    } catch (error) {
      console.error('Failed to fetch agents:', error);
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter, tierFilter, statusFilter, sort, order]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAgents();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchAgents]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (categoryFilter !== 'All') params.set('category', categoryFilter);
    if (tierFilter !== 'All') params.set('tier', tierFilter);
    if (statusFilter !== 'All') params.set('status', statusFilter);
    if (sort) params.set('sort', sort);
    if (order) params.set('order', order);
    router.push(`/discover?${params.toString()}`, { scroll: false });
  }, [search, categoryFilter, tierFilter, statusFilter, sort, order, router]);

  return (
    <div className="arca-page">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="font-display font-bold text-white text-3xl sm:text-5xl mb-3 sm:mb-4">
            Discover AI Agents
          </h1>
          <p className="text-white/85 text-base sm:text-xl">
            Browse verified agents with on chain performance and automatic buybacks
          </p>
        </motion.div>

        <div className="arca-surface p-4 sm:p-6 mb-8 space-y-5">
          <MdOutlinedTextField
            label="Search agents"
            value={search}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onInput={(e: any) => setSearch(e.target.value)}
          >
            <MdIcon slot="leading-icon">search</MdIcon>
          </MdOutlinedTextField>

          <div>
            <p className="text-xs uppercase tracking-wide text-chalk-dim mb-2 font-medium">Category</p>
            <MdChipSet>
              {CATEGORIES.map((c) => (
                <MdFilterChip
                  key={c}
                  label={c === 'All' ? 'All categories' : c}
                  selected={categoryFilter === c}
                  onClick={() => setCategoryFilter(c)}
                />
              ))}
            </MdChipSet>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-chalk-dim mb-2">Tier</p>
            <MdChipSet>
              {TIERS.map((t) => (
                <MdFilterChip
                  key={t}
                  label={t === 'All' ? 'All tiers' : t}
                  selected={tierFilter === t}
                  onClick={() => setTierFilter(t)}
                />
              ))}
            </MdChipSet>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-chalk-dim mb-2">Status</p>
            <MdChipSet>
              {STATUSES.map((s) => (
                <MdFilterChip
                  key={s}
                  label={s === 'All' ? 'All status' : s}
                  selected={statusFilter === s}
                  onClick={() => setStatusFilter(s)}
                />
              ))}
            </MdChipSet>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
            <div className="flex-1">
              <MdOutlinedSelect
                label="Sort by"
                value={sort}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onChange={(e: any) => setSort(e.target.value)}
              >
                <MdSelectOption value="revenue"><div slot="headline">Revenue</div></MdSelectOption>
                <MdSelectOption value="winRate"><div slot="headline">Win Rate</div></MdSelectOption>
                <MdSelectOption value="age"><div slot="headline">Age</div></MdSelectOption>
                <MdSelectOption value="raiseProgress"><div slot="headline">Raise Progress</div></MdSelectOption>
              </MdOutlinedSelect>
            </div>
            <MdIconButton
              onClick={() => setOrder(order === 'asc' ? 'desc' : 'asc')}
              aria-label={order === 'asc' ? 'Ascending' : 'Descending'}
            >
              <MdIcon>{order === 'asc' ? 'arrow_upward' : 'arrow_downward'}</MdIcon>
            </MdIconButton>
            <MdOutlinedButton onClick={() => setView(view === 'list' ? 'grid' : 'list')}>
              <MdIcon slot="icon">{view === 'list' ? 'grid_view' : 'view_list'}</MdIcon>
              {view === 'list' ? 'Grid' : 'List'}
            </MdOutlinedButton>
          </div>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <p className="text-white/80">
            {loading
              ? 'Loading…'
              : `${agents.length} agent${agents.length !== 1 ? 's' : ''} found`}
          </p>
        </div>

        {loading ? (
          <LoadingState label="Loading agents…" onBrand />
        ) : agents.length === 0 ? (
          <div className="arca-surface">
            <MdList>
              <MdListItem>
                <MdIcon slot="start">search_off</MdIcon>
                <div slot="headline">No Agents Match Your Filters</div>
                <div slot="supporting-text">Try clearing a filter chip or changing sort</div>
              </MdListItem>
            </MdList>
          </div>
        ) : view === 'list' ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <MdList>
              {agents.map((agent, index) => (
                <div key={agent.id}>
                  {index > 0 && <MdDivider />}
                  <MdListItem type="link" href={`/agents/${agent.slug}`}>
                    <MdIcon slot="start">smart_toy</MdIcon>
                    <div slot="overline">
                      {agent.tier} · {agent.status}
                    </div>
                    <div slot="headline">{agent.name}</div>
                    <div slot="supporting-text">
                      {agent.oneLiner} · {formatQuick(agent)}
                    </div>
                    <div slot="trailing-supporting-text">{agent.category}</div>
                    <MdIcon slot="end">chevron_right</MdIcon>
                  </MdListItem>
                </div>
              ))}
            </MdList>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {agents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}

function formatQuick(agent: Agent) {
  return `${agent.totalRevenue.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })} rev · ${(agent.winRate * 100).toFixed(0)}% win`;
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
