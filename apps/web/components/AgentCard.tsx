'use client';

import Image from 'next/image';
import type { Agent } from '@/lib/mock-data';
import { TierBadge } from './TierBadge';
import { BuybackLiveIndicator } from './BuybackLiveIndicator';
import { MiniSparkline } from './MiniSparkline';
import { formatCurrency, formatPercent } from '@/lib/format';
import {
  MdListItem,
  MdIcon,
  MdFilledButton,
  MdLinearProgress,
  MdChipSet,
  MdAssistChip,
} from '@/components/material';

interface AgentCardProps {
  agent: Agent;
}

export function AgentCard({ agent }: AgentCardProps) {
  const isLive = agent.status === 'ICO Live';
  const isTrading = agent.status === 'Trading';
  const progress = Math.min(agent.amountRaised / agent.raiseTarget, 1);

  const priceData =
    agent.drawdownHistory && agent.drawdownHistory.length > 0
      ? agent.drawdownHistory.map((dd) => agent.currentPrice * (1 + dd / 100))
      : Array.from(
          { length: 10 },
          (_, i) => agent.currentPrice * (1 + Math.sin(i) * 0.05),
        );

  return (
    <article className="arca-surface overflow-hidden card-hover h-full flex flex-col">
      <MdListItem type="link" href={`/agents/${agent.slug}`}>
        <span slot="start" className="inline-flex">
          {agent.logoUrl ? (
            <Image
              src={agent.logoUrl}
              alt={agent.name}
              width={48}
              height={48}
              className="rounded-xl object-cover"
            />
          ) : (
            <span className="w-12 h-12 rounded-xl bg-brand/15 flex items-center justify-center text-brand font-bold">
              {agent.name.charAt(0)}
            </span>
          )}
        </span>
        <div slot="headline">{agent.name}</div>
        <div slot="supporting-text">
          {agent.category} · {agent.oneLiner}
        </div>
        <span slot="end">
          <TierBadge tier={agent.tier} />
        </span>
      </MdListItem>

      <div className="px-4 pb-4 flex-1 flex flex-col gap-3">
        <MdChipSet>
          <MdAssistChip label={agent.status}>
            <MdIcon slot="icon">
              {isTrading ? 'trending_up' : isLive ? 'bolt' : 'schedule'}
            </MdIcon>
          </MdAssistChip>
          <MdAssistChip label={`${formatCurrency(agent.totalRevenue)} rev`} />
          <MdAssistChip label={`${formatPercent(agent.winRate)} win`} />
        </MdChipSet>

        {isTrading && (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-chalk font-semibold">${agent.currentPrice.toFixed(5)}</p>
              <p
                className={`text-sm ${agent.priceChange24h >= 0 ? 'text-brand' : 'text-error'}`}
              >
                {agent.priceChange24h >= 0 ? '+' : ''}
                {formatPercent(agent.priceChange24h)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <MiniSparkline
                data={priceData}
                color={agent.priceChange24h >= 0 ? '#5D74E5' : '#D93025'}
              />
              <BuybackLiveIndicator lastBuybackTime={agent.lastBuybackTime} size="sm" />
            </div>
          </div>
        )}

        {isLive && (
          <div>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-chalk-dim">Raise progress</span>
              <span className="text-chalk font-semibold">{formatPercent(progress)}</span>
            </div>
            <MdLinearProgress value={progress} max={1} style={{ width: '100%' }} />
          </div>
        )}

        <a href={`/agents/${agent.slug}${isLive ? '/ico' : ''}`} className="mt-auto block">
          <MdFilledButton style={{ width: '100%' }}>
            <MdIcon slot="icon">
              {isLive ? 'payments' : isTrading ? 'candlestick_chart' : 'visibility'}
            </MdIcon>
            {isLive ? 'Participate' : isTrading ? 'Trade' : 'View'}
          </MdFilledButton>
        </a>
      </div>
    </article>
  );
}
