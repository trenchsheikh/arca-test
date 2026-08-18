'use client';

import { useEffect, useRef, useState } from 'react';
import type { Agent, AgentTier } from '@/lib/mock-data';
import { DiscoverProjectCard } from '@/components/DiscoverProjectCard';
import { MdIcon, MdIconButton } from '@/components/material';

const tierMeta: Record<AgentTier, { title: string; blurb: string }> = {
  Seed: {
    title: 'Seed',
    blurb: 'Little starter agents. A good place to begin.',
  },
  Core: {
    title: 'Core',
    blurb: 'Middle agents. A bit bigger and stronger.',
  },
  Pro: {
    title: 'Pro',
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

  // Vertical wheel/touch must reach Lenis. Only steal clearly horizontal gestures.
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const stopLerp = () => cancelAnimationFrame(frameRef.current);

    const onWheel = (event: WheelEvent) => {
      const shiftAsHorizontal =
        event.shiftKey && Math.abs(event.deltaX) <= Math.abs(event.deltaY);
      const deltaX = shiftAsHorizontal ? event.deltaY : event.deltaX;
      const deltaY = shiftAsHorizontal ? 0 : event.deltaY;

      if (Math.abs(deltaY) >= Math.abs(deltaX)) return;

      event.preventDefault();
      event.stopPropagation();
      stopLerp();
      el.scrollLeft += deltaX;
    };

    const touch = { x: 0, y: 0, axis: null as 'x' | 'y' | null };
    const AXIS_LOCK_PX = 8;

    const onTouchStart = (event: TouchEvent) => {
      const point = event.touches[0];
      if (!point) return;
      touch.x = point.clientX;
      touch.y = point.clientY;
      touch.axis = null;
    };

    const onTouchMove = (event: TouchEvent) => {
      const point = event.touches[0];
      if (!point) return;

      const dx = point.clientX - touch.x;
      const dy = point.clientY - touch.y;

      if (touch.axis === null) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) < AXIS_LOCK_PX) return;
        touch.axis = Math.abs(dx) >= Math.abs(dy) ? 'x' : 'y';
      }

      touch.x = point.clientX;
      touch.y = point.clientY;

      if (touch.axis === 'y') return;

      event.preventDefault();
      event.stopPropagation();
      stopLerp();
      el.scrollLeft -= dx;
    };

    const onTouchEnd = () => {
      touch.axis = null;
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd, { passive: true });
    el.addEventListener('touchcancel', onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
      el.removeEventListener('touchcancel', onTouchEnd);
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
