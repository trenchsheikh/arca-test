'use client';

import { useEffect, useState } from 'react';
import type { BuybackEvent } from '@/lib/mock-data';
import {
  formatCurrency,
  formatTokenAmount,
  formatRelativeTime,
  getExplorerUrl,
} from '@/lib/format';
import {
  MdList,
  MdListItem,
  MdIcon,
  MdDivider,
  MdAssistChip,
  MdChipSet,
} from '@/components/material';

interface LiveBuybackFeedProps {
  events: BuybackEvent[];
  agentId?: string;
  limit?: number;
}

export function LiveBuybackFeed({
  events: initialEvents,
  agentId,
  limit = 5,
}: LiveBuybackFeedProps) {
  const [events, setEvents] = useState(initialEvents);
  const [live, setLive] = useState(false);

  useEffect(() => {
    setEvents(initialEvents);
  }, [initialEvents]);

  useEffect(() => {
    if (!agentId) return;

    const raw =
      process.env.NEXT_PUBLIC_WS_URL ||
      (process.env.NODE_ENV === 'development' ? 'ws://localhost:3001' : '');
    if (!raw) return;

    const wsUrl = raw.replace(/^http/, 'ws');
    let ws: WebSocket | null = null;
    let closed = false;

    try {
      ws = new WebSocket(wsUrl);
      ws.onopen = () => {
        if (closed) return;
        setLive(true);
        ws?.send(
          JSON.stringify({
            type: 'subscribe',
            channel: `agent:${agentId}:buybacks`,
          }),
        );
      };
      ws.onmessage = (msg) => {
        try {
          const data = JSON.parse(msg.data as string);
          if (data.type === 'subscribed') return;
          const payload = data.payload ?? data;
          if (!payload?.revenueSpent && !payload?.agentTokensBought) return;

          const next: BuybackEvent = {
            id: payload.id || `live-${Date.now()}`,
            agentId: payload.agentId || agentId,
            timestamp: new Date(payload.timestamp || Date.now()),
            revenueSpent: Number(payload.revenueSpent ?? 0),
            agentTokensBought: Number(payload.agentTokensBought ?? 0),
            platformTokensBought: Number(payload.platformTokensBought ?? 0),
            txHash: payload.txHash || 'pending…',
            chain: payload.chain === 'robinhood' ? 'robinhood' : 'solana',
          };
          setEvents((prev) => [next, ...prev].slice(0, 50));
        } catch {
          /* ignore malformed */
        }
      };
      ws.onclose = () => setLive(false);
      ws.onerror = () => setLive(false);
    } catch {
      setLive(false);
    }

    return () => {
      closed = true;
      ws?.close();
    };
  }, [agentId]);

  const displayEvents = events.slice(0, limit);

  return (
    <div className="arca-surface buyback-glow overflow-hidden">
      <div className="flex items-center gap-2 px-4 pt-4 pb-2">
        <MdIcon style={{ color: '#5D74E5' }}>sensors</MdIcon>
        <h3 className="font-display font-bold text-chalk text-lg flex-1">Live Buyback Feed</h3>
        <MdChipSet>
          <MdAssistChip label={live ? 'Connected' : 'Cached'}>
            <MdIcon slot="icon">{live ? 'wifi' : 'wifi_off'}</MdIcon>
          </MdAssistChip>
        </MdChipSet>
      </div>

      {displayEvents.length === 0 ? (
        <MdList>
          <MdListItem>
            <MdIcon slot="start">hourglass_empty</MdIcon>
            <div slot="headline">No buyback events yet</div>
            <div slot="supporting-text">
              Buybacks execute automatically when revenue is generated
            </div>
          </MdListItem>
        </MdList>
      ) : (
        <MdList>
          {displayEvents.map((event, index) => (
            <div key={event.id}>
              {index > 0 && <MdDivider />}
              <MdListItem
                type="link"
                href={getExplorerUrl(event.chain, event.txHash)}
                target="_blank"
              >
                <MdIcon slot="start">autorenew</MdIcon>
                <div slot="overline">{formatRelativeTime(event.timestamp)}</div>
                <div slot="headline">
                  {formatCurrency(event.revenueSpent)} · 90/10 split
                </div>
                <div slot="supporting-text">
                  Agent {formatTokenAmount(event.agentTokensBought)} · Platform{' '}
                  {formatTokenAmount(event.platformTokensBought)} · {event.chain}
                </div>
                <div slot="trailing-supporting-text">tx</div>
                <MdIcon slot="end">open_in_new</MdIcon>
              </MdListItem>
            </div>
          ))}
        </MdList>
      )}
    </div>
  );
}
