'use client';

import { useEffect, useState } from 'react';
import { MdCircularProgress, MdTextButton } from '@/components/material';
import { formatCommaNumber, formatRelativeTime, formatUsd } from '@/lib/format';

type WalletChain = 'solana' | 'robinhood';

interface WalletStats {
  nativeSymbol: 'SOL' | 'ETH';
  balanceNative: number | null;
  balanceUsd: number | null;
  txCount: number | null;
  txCountCapped: boolean;
  walletAgeDays: number | null;
  walletAgeTruncated: boolean;
  lastActivityAt: string | null;
  source?: string;
}

const SOLANA_RE = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
const EVM_RE = /^0x[a-fA-F0-9]{40}$/;

function isValidWalletAddress(address: string, chain: WalletChain): boolean {
  if (chain === 'solana') return SOLANA_RE.test(address);
  return EVM_RE.test(address);
}

function formatWalletAge(days: number | null, truncated = false): string {
  if (days == null || !Number.isFinite(days) || days < 0) return 'n/a';
  let text: string;
  if (days < 1) text = '<1d';
  else if (days < 60) text = `${Math.floor(days)}d`;
  else {
    const months = Math.round(days / 30);
    if (months < 24) text = `${months}mo`;
    else {
      const years = days / 365;
      const yearText = years >= 10 ? years.toFixed(0) : years.toFixed(1).replace(/\.0$/, '');
      text = `${yearText}y`;
    }
  }
  return truncated ? (days < 1 ? '≥ 0d' : `≥ ${text}`) : text;
}

function formatNativeBalance(amount: number | null, symbol: string): string {
  if (amount == null || !Number.isFinite(amount)) return 'n/a';
  const abs = Math.abs(amount);
  const digits = abs > 0 && abs < 0.001 ? 6 : abs >= 1_000 ? 2 : 4;
  const text = amount.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  });
  return `${text} ${symbol}`;
}

type Status = 'idle' | 'loading' | 'connected' | 'failed';

interface WalletStatsPanelProps {
  address: string;
  chain: WalletChain;
}

export function WalletStatsPanel({ address, chain }: WalletStatsPanelProps) {
  const [status, setStatus] = useState<Status>('idle');
  const [stats, setStats] = useState<WalletStats | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [retryTick, setRetryTick] = useState(0);

  useEffect(() => {
    const trimmed = address.trim();
    if (!trimmed) {
      setStatus('idle');
      setStats(null);
      setMessage(null);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      if (!isValidWalletAddress(trimmed, chain)) {
        setStats(null);
        setStatus('failed');
        setMessage('Invalid wallet address');
        return;
      }

      setStatus('loading');
      setMessage(null);
      try {
        const response = await fetch(
          `/api/wallets/stats?address=${encodeURIComponent(trimmed)}&chain=${chain}`,
          { signal: controller.signal },
        );
        const data = (await response.json()) as WalletStats & { error?: string };
        if (!response.ok) {
          throw new Error(data.error || 'Failed to pull wallet stats');
        }
        setStats(data);
        setStatus('connected');
        setMessage(null);
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setStats(null);
        setStatus('failed');
        setMessage(error instanceof Error ? error.message : 'Failed to pull wallet stats');
      }
    }, 600);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [address, chain, retryTick]);

  const statusLabel =
    status === 'loading'
      ? 'Reading the chain'
      : status === 'connected'
        ? 'Live on-chain'
        : status === 'failed'
          ? 'Unavailable'
          : 'Waiting for address';

  const statusClass =
    status === 'connected'
      ? 'text-mint'
      : status === 'failed'
        ? 'text-error'
        : 'text-chalk-dim';

  const connected = status === 'connected' && stats;
  const placeholder = status === 'loading' ? 'loading' : 'empty';

  const cards: {
    label: string;
    value: string;
    hint?: string;
  }[] = [
    {
      label: 'Balance',
      value: connected
        ? formatNativeBalance(stats.balanceNative, stats.nativeSymbol)
        : placeholder === 'loading'
          ? '…'
          : 'n/a',
      hint:
        connected && stats.balanceUsd != null
          ? `${formatUsd(stats.balanceUsd, 2)} spot`
          : undefined,
    },
    {
      label: 'Transactions',
      value: connected
        ? stats.txCount != null
          ? formatCommaNumber(stats.txCount)
          : 'n/a'
        : placeholder === 'loading'
          ? '…'
          : 'n/a',
      hint:
        connected && stats.txCountCapped
          ? 'History truncated — exact count unavailable'
          : undefined,
    },
    {
      label: 'Wallet Age',
      value: connected
        ? formatWalletAge(stats.walletAgeDays, stats.walletAgeTruncated)
        : placeholder === 'loading'
          ? '…'
          : 'n/a',
      hint:
        connected && stats.walletAgeTruncated
          ? 'From oldest sampled signature'
          : undefined,
    },
    {
      label: 'Last Activity',
      value: connected
        ? stats.lastActivityAt
          ? formatRelativeTime(stats.lastActivityAt)
          : 'n/a'
        : placeholder === 'loading'
          ? '…'
          : 'n/a',
    },
  ];

  return (
    <div className="arca-surface-muted p-4">
      <div className="flex items-center gap-2 mb-1 min-w-0">
        {status === 'loading' && (
          <MdCircularProgress
            indeterminate
            style={{ width: 16, height: 16 }}
            aria-hidden
          />
        )}
        <p className={`text-sm font-medium ${statusClass}`} aria-live="polite">
          {statusLabel}
        </p>
        {status === 'failed' && message !== 'Invalid wallet address' && (
          <MdTextButton
            type="button"
            onClick={() => setRetryTick((n) => n + 1)}
            aria-label="Retry wallet stats"
          >
            Retry
          </MdTextButton>
        )}
      </div>
      {message && (
        <p className="text-error text-xs mb-3" role="alert">
          {message}
        </p>
      )}
      {!message && status === 'connected' && (
        <p className="text-chalk-dim text-xs mb-3">
          On-chain only. Revenue and win rate cannot be inferred from an address.
        </p>
      )}
      {!message && status !== 'connected' && status !== 'failed' && (
        <p className="text-chalk-dim text-xs mb-3">
          {status === 'loading'
            ? 'Pulling live balance, signatures, and activity'
            : 'Stats pull from the chain once a wallet is entered'}
        </p>
      )}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 min-w-0">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-ink rounded-lg p-3 border border-white/10 min-w-0 min-h-[4.75rem]"
          >
            <p className="text-chalk-dim text-xs mb-1">{card.label}</p>
            {status === 'loading' ? (
              <p
                className="h-5 w-16 rounded bg-white/10 motion-safe:animate-pulse"
                aria-hidden
              />
            ) : (
              <p className="text-chalk font-mono text-sm tabular-nums break-words">{card.value}</p>
            )}
            {card.hint && status === 'connected' && (
              <p className="text-chalk-dim text-[11px] mt-1 leading-snug">{card.hint}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
