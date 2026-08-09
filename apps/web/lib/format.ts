export function formatCurrency(amount: number, decimals = 0): string {
  if (amount >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(decimals)}M`;
  }
  if (amount >= 1_000) {
    return `$${(amount / 1_000).toFixed(decimals)}K`;
  }
  return `$${amount.toFixed(decimals)}`;
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
