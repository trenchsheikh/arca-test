'use client';

import { useEffect, useRef, useState } from 'react';
import type { Agent, AgentTier } from '@/lib/mock-data';
import { DiscoverProjectCard } from '@/components/DiscoverProjectCard';
import { MdIcon, MdIconButton } from '@/components/material';

const tierMeta: Record<
  AgentTier,
  { title: string; icon: string; blurb: string }
> = {
  Seed: {
    title: 'Seed',
    icon: 'spa',
    blurb: 'Little starter agents. A good place to begin.',
  },
  Core: {
    title: 'Core',
    icon: 'verified',
    blurb: 'Middle agents. A bit bigger and stronger.',
  },
  Pro: {
    title: 'Pro',
    icon: 'workspace_premium',
    blurb: 'The big agents. They do the heavy stuff.',
  },
};

/** Match site Lenis lerp so arrow clicks coast the same way */
const LERP = 0.07;

export function DiscoverTierRail({
  tier,
  agents,
}: {
  tier: AgentTier;
  agents: Agent[];
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef(0);
  const targetRef = useRef(0);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const meta = tierMeta[tier];

  const updateArrows = () => {
    const el = scrollerRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft < max - 4);
  };

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    updateArrows();
    el.addEventListener('scroll', updateArrows, { passive: true });
    window.addEventListener('resize', updateArrows);
    return () => {
      el.removeEventListener('scroll', updateArrows);
      window.removeEventListener('resize', updateArrows);
      cancelAnimationFrame(frameRef.current);
    };
  }, [agents]);

  const scrollByCards = (dir: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;

    const item = el.querySelector('.discover-tier-item') as HTMLElement | null;
    const styles = getComputedStyle(el);
    const gap = Number.parseFloat(styles.columnGap || styles.gap || '12') || 12;
    const cardWidth = item?.offsetWidth ?? 220;
    const page = Math.max(1, Math.floor((el.clientWidth - 32) / (cardWidth + gap)));
    const delta = dir * (cardWidth + gap) * page;

    const max = Math.max(0, el.scrollWidth - el.clientWidth);
    targetRef.current = Math.max(0, Math.min(max, el.scrollLeft + delta));

    cancelAnimationFrame(frameRef.current);

    const step = () => {
      const target = targetRef.current;
      const diff = target - el.scrollLeft;

      if (Math.abs(diff) < 0.4) {
        el.scrollLeft = target;
        updateArrows();
        return;
      }

      el.scrollLeft += diff * LERP;
      frameRef.current = requestAnimationFrame(step);
    };

    frameRef.current = requestAnimationFrame(step);
  };

  if (agents.length === 0) return null;

  return (
    <section className="discover-tier-rail" aria-labelledby={`tier-${tier}`}>
      <div className="discover-tier-header">
        <div className="discover-tier-copy min-w-0">
          <div className="flex min-w-0 items-center gap-2">
            <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-brand/15 text-brand">
              <MdIcon>{meta.icon}</MdIcon>
            </span>
            <h2
              id={`tier-${tier}`}
              className="font-display text-lg sm:text-xl font-bold text-chalk tracking-tight"
            >
              {meta.title}
            </h2>
            <span className="text-xs text-chalk-dim font-semibold tracking-wide uppercase">
              {agents.length}
            </span>
          </div>
          <p className="discover-tier-blurb">{meta.blurb}</p>
        </div>

        <div className="flex shrink-0 items-center gap-0.5 self-start">
          <MdIconButton
            aria-label={`Previous ${meta.title}`}
            disabled={!canPrev}
            onClick={() => scrollByCards(-1)}
          >
            <MdIcon>chevron_left</MdIcon>
          </MdIconButton>
          <MdIconButton
            aria-label={`Next ${meta.title}`}
            disabled={!canNext}
            onClick={() => scrollByCards(1)}
          >
            <MdIcon>chevron_right</MdIcon>
          </MdIconButton>
        </div>
      </div>

      <div
        ref={scrollerRef}
        className="discover-tier-scroller"
        role="list"
        data-lenis-prevent
      >
        {agents.map((agent) => (
          <div key={agent.id} className="discover-tier-item" role="listitem">
            <DiscoverProjectCard agent={agent} />
          </div>
        ))}
      </div>
    </section>
  );
}
