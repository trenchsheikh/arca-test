import type { Agent } from '@/lib/mock-data';

export function formatCurrency(amount: number, decimals = 0): string {
  if (amount >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(decimals)}M`;
  }
  if (amount >= 1_000) {
    return `$${(amount / 1_000).toFixed(decimals)}K`;
  }
  return `$${amount.toFixed(decimals)}`;
}

/** Full currency with grouping: $1,250.00, $46,000.00 */
export function formatUsd(amount: number, decimals = 2): string {
  if (!Number.isFinite(amount)) return decimals > 0 ? '$0.00' : '$0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}

export function formatSignedUsd(amount: number, decimals = 2): string {
  if (!Number.isFinite(amount) || amount === 0) return formatUsd(0, decimals);
  const body = formatUsd(Math.abs(amount), decimals);
  return amount > 0 ? `+${body}` : `-${body}`;
}

/** Grouped integers: 1,250 */
export function formatCommaNumber(value: number, decimals = 0): string {
  if (!Number.isFinite(value)) return '0';
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Headline stats: $1,250.00 with commas; compact $1.2M when the figure
 * would overflow a card.
 */
export function formatStatCurrency(amount: number): string {
  if (!Number.isFinite(amount)) return '$0';
  const abs = Math.abs(amount);
  const body =
    abs >= 1_000_000 ? formatCompactCurrency(abs) : formatUsd(abs, 2);
  return amount < 0 ? `-${body}` : body;
}

/** Compact market-cap style: $46K, $250K, $1.2M */
export function formatCompactCurrency(amount: number): string {
  if (!Number.isFinite(amount) || amount <= 0) return '$0';
  if (amount >= 1_000_000) {
    const millions = amount / 1_000_000;
    const text =
      millions >= 10
        ? millions.toFixed(0)
        : millions.toFixed(1).replace(/\.0$/, '');
    return `$${text}M`;
  }
  return formatCurrency(amount, 0);
}

/**
 * Prefer circulatingSupply * price; fall back to launch FDV when
 * circulating supply or price is missing.
 */
export function getMarketCap(input: {
  circulatingSupply: number;
  price: number;
  launchFdv: number;
}): number {
  const { circulatingSupply, price, launchFdv } = input;
  if (circulatingSupply > 0 && price > 0) {
    return circulatingSupply * price;
  }
  return launchFdv;
}

/**
 * Discover card / Featured CTA copy by raise status.
 * ICO Live (still raising) → Participate. Buy + market cap only after launch (Trading).
 */
export function discoverCtaLabel(agent: Agent): string {
  if (agent.status === 'ICO Live') {
    return 'Participate';
  }
  if (agent.status === 'Trading') {
    const price = agent.currentPrice > 0 ? agent.currentPrice : agent.tokenPrice;
    const capText = formatCompactCurrency(
      getMarketCap({
        circulatingSupply: agent.circulatingSupply,
        price,
        launchFdv: agent.launchFdv,
      }),
    );
    return `Buy ${agent.ticker} | ${capText}`;
  }
  if (agent.status === 'ICO Upcoming') {
    return `View ${agent.ticker}`;
  }
  return `Open ${agent.ticker}`;
}

export function formatPercent(value: number, decimals = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

export function formatNumber(value: number, decimals = 0): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(decimals)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(decimals)}K`;
  }
  return value.toFixed(decimals);
}

export function toDate(value: Date | string | number): Date {
  return value instanceof Date ? value : new Date(value);
}

export function formatRelativeTime(date: Date | string | number): string {
  const parsed = toDate(date);
  if (Number.isNaN(parsed.getTime())) return 'n/a';

  const now = new Date();
  const diffMs = now.getTime() - parsed.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return `${diffSec}s ago`;
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 30) return `${diffDay}d ago`;

  return parsed.toLocaleDateString();
}

export function formatTokenAmount(amount: number): string {
  return formatNumber(amount, 0);
}

export function getExplorerUrl(chain: 'solana' | 'robinhood', txHash: string): string {
  if (chain === 'solana') {
    return `https://explorer.solana.com/tx/${txHash}`;
  }
  return `https://robinhoodchain.blockscout.com/tx/${txHash}`;
}
