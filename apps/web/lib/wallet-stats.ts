/**
 * Live on-chain wallet stats for Apply → Revenue Verification.
 *
 * Only values that can be read from the chain (or a chain explorer index)
 * are returned. Trading P&L, revenue, volume, and win rate cannot be known
 * from a raw address and are not estimated.
 *
 * Solana:
 *   getBalance, getSignaturesForAddress (Helius RPC if HELIUS_API_KEY is set,
 *   else SOLANA_RPC_URL when it is not devnet, else public mainnet RPC)
 *
 * Robinhood / EVM:
 *   eth_getBalance; first/last tx and tx count from Blockscout when reachable
 */

export type WalletChain = 'solana' | 'robinhood';

export interface WalletStats {
  address: string;
  chain: WalletChain;
  nativeSymbol: 'SOL' | 'ETH';
  /** Null when the native-balance RPC call failed. */
  balanceNative: number | null;
  /** Spot USD of native SOL/ETH only when a live price feed succeeds. Never revenue. */
  balanceUsd: number | null;
  /** Exact signature/tx count, or null when history was truncated. */
  txCount: number | null;
  txCountCapped: boolean;
  walletAgeDays: number | null;
  /** True when oldest sampled signature is not proven to be the first tx. */
  walletAgeTruncated: boolean;
  lastActivityAt: string | null;
  firstTxAt: string | null;
  source: string;
}

export class WalletStatsError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'WalletStatsError';
  }
}

const SOLANA_RE = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
const EVM_RE = /^0x[a-fA-F0-9]{40}$/;

const LAMPORTS_PER_SOL = 1_000_000_000;
const WEI_PER_ETH = 1e18;
const MS_PER_DAY = 86_400_000;
const PRICE_TTL_MS = 60_000;
const STATS_TTL_MS = 10_000;
const SIG_PAGE_SIZE = 1000;
const SIG_MAX_PAGES_HELIUS = 20;
const SIG_MAX_PAGES_PUBLIC = 5;
const SIG_PAGE_BUDGET_MS = 8_000;

const PUBLIC_SOLANA_RPC = [
  'https://api.mainnet-beta.solana.com',
  'https://solana-rpc.publicnode.com',
];

const DEFAULT_RH_TESTNET_RPC = 'https://rpc.testnet.chain.robinhood.com';
const RH_MAINNET_EXPLORER = 'https://robinhoodchain.blockscout.com';
const RH_TESTNET_EXPLORER = 'https://explorer.testnet.chain.robinhood.com';

type PriceCache = { at: number; sol: number | null; eth: number | null };
let priceCache: PriceCache | null = null;

const statsCache = new Map<string, { at: number; value: WalletStats }>();

export function isValidWalletAddress(address: string, chain: WalletChain): boolean {
  const value = address.trim();
  if (chain === 'solana') return SOLANA_RE.test(value);
  return EVM_RE.test(value);
}

export function formatWalletAge(days: number | null, truncated = false): string {
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

export async function fetchWalletStats(
  address: string,
  chain: WalletChain,
): Promise<WalletStats> {
  const trimmed = address.trim();
  if (!trimmed) {
    throw new WalletStatsError('Wallet address is required', 400);
  }
  if (chain !== 'solana' && chain !== 'robinhood') {
    throw new WalletStatsError('Chain must be solana or robinhood', 400);
  }
  if (!isValidWalletAddress(trimmed, chain)) {
    throw new WalletStatsError('Invalid wallet address', 400);
  }

  const cacheKey = `${chain}:${trimmed}`;
  const cached = statsCache.get(cacheKey);
  if (cached && Date.now() - cached.at < STATS_TTL_MS) {
    return cached.value;
  }

  const stats =
    chain === 'solana'
      ? await fetchSolanaStats(trimmed)
      : await fetchRobinhoodStats(trimmed);

  statsCache.set(cacheKey, { at: Date.now(), value: stats });
  return stats;
}

function env(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value || undefined;
}

function solanaRpcPlan(): { urls: string[]; label: string; maxPages: number } {
  const urls: string[] = [];
  const helius = env('HELIUS_API_KEY');
  if (helius) {
    urls.push(`https://mainnet.helius-rpc.com/?api-key=${helius}`);
  }
  const configured = env('SOLANA_RPC_URL');
  // Apply verification is mainnet history; a configured devnet URL would lie.
  if (configured && !/devnet/i.test(configured) && !urls.includes(configured)) {
    urls.push(configured);
  }
  for (const url of PUBLIC_SOLANA_RPC) {
    if (!urls.includes(url)) urls.push(url);
  }
  return {
    urls,
    label: helius ? 'helius-rpc' : configured && !/devnet/i.test(configured) ? 'solana-rpc' : 'solana-rpc (public mainnet)',
    maxPages: helius ? SIG_MAX_PAGES_HELIUS : SIG_MAX_PAGES_PUBLIC,
  };
}

function robinhoodNetwork(): { urls: string[]; explorer: string; isTestnet: boolean } {
  const configured = env('RH_RPC_URL');
  const urls: string[] = [];
  if (configured) urls.push(configured);
  else urls.push(DEFAULT_RH_TESTNET_RPC);
  const isTestnet =
    urls.some((url) => /testnet/i.test(url)) || env('NEXT_PUBLIC_RH_CHAIN_ID') === '46630';
  return {
    urls,
    explorer: isTestnet ? RH_TESTNET_EXPLORER : RH_MAINNET_EXPLORER,
    isTestnet,
  };
}

async function jsonRpc<T>(urls: string[], method: string, params: unknown[]): Promise<T> {
  let lastError: Error | null = null;

  for (const url of urls) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
        signal: AbortSignal.timeout(12_000),
      });
      if (!response.ok) {
        lastError = new Error(`RPC HTTP ${response.status}`);
        continue;
      }
      const body = (await response.json()) as {
        result?: T;
        error?: { message?: string };
      };
      if (body.error) {
        const message = String(body.error.message || 'RPC error');
        if (/invalid/i.test(message)) {
          throw new WalletStatsError('Invalid wallet address', 400);
        }
        lastError = new Error(message);
        continue;
      }
      return body.result as T;
    } catch (error) {
      if (error instanceof WalletStatsError) throw error;
      lastError = error instanceof Error ? error : new Error('RPC failed');
    }
  }

  throw new WalletStatsError(lastError?.message || 'RPC request failed', 502);
}

interface SolanaSignature {
  signature: string;
  blockTime: number | null;
}

async function fetchSolanaStats(address: string): Promise<WalletStats> {
  const plan = solanaRpcPlan();
  const [balanceResult, sigResult, solPrice] = await Promise.all([
    jsonRpc<{ value?: number } | number>(plan.urls, 'getBalance', [address]).then(
      (value) => ({ ok: true as const, value }),
      (error: unknown) => ({ ok: false as const, error }),
    ),
    jsonRpc<SolanaSignature[]>(plan.urls, 'getSignaturesForAddress', [
      address,
      { limit: SIG_PAGE_SIZE },
    ]).then(
      (value) => ({ ok: true as const, value }),
      (error: unknown) => ({ ok: false as const, error }),
    ),
    fetchSolUsd(),
  ]);

  if (!balanceResult.ok && !sigResult.ok) {
    const message =
      (balanceResult.error instanceof Error && balanceResult.error.message) ||
      (sigResult.error instanceof Error && sigResult.error.message) ||
      'Solana RPC request failed';
    throw new WalletStatsError(message, 502);
  }

  const lamports = balanceResult.ok
    ? Number(
        (balanceResult.value as { value?: number } | null)?.value ??
          (typeof balanceResult.value === 'number' ? balanceResult.value : 0),
      )
    : null;
  const sol = lamports == null ? null : lamports > 0 ? lamports / LAMPORTS_PER_SOL : 0;

  let txCount: number | null = null;
  let txCountCapped = false;
  let walletAgeDays: number | null = null;
  let walletAgeTruncated = false;
  let lastActivityAt: string | null = null;
  let firstTxAt: string | null = null;

  if (sigResult.ok) {
    const history = await collectSolanaHistory(plan.urls, address, sigResult.value, plan.maxPages);
    txCount = history.txCount;
    txCountCapped = history.txCountCapped;
    lastActivityAt = history.lastActivityAt;
    firstTxAt = history.firstTxAt;
    walletAgeDays = history.walletAgeDays;
    walletAgeTruncated = history.walletAgeTruncated;
  }

  const methods = [
    balanceResult.ok ? 'getBalance' : null,
    sigResult.ok ? 'getSignaturesForAddress' : null,
    solPrice != null ? 'coingecko/binance SOLUSD' : null,
  ].filter(Boolean);

  return {
    address,
    chain: 'solana',
    nativeSymbol: 'SOL',
    balanceNative: sol,
    balanceUsd: sol != null && solPrice != null ? sol * solPrice : null,
    txCount,
    txCountCapped,
    walletAgeDays,
    walletAgeTruncated,
    lastActivityAt,
    firstTxAt,
    source: `${plan.label} ${methods.join(' + ')}`,
  };
}

async function collectSolanaHistory(
  urls: string[],
  address: string,
  firstPage: SolanaSignature[] | null | undefined,
  maxPages: number,
): Promise<{
  txCount: number | null;
  txCountCapped: boolean;
  lastActivityAt: string | null;
  firstTxAt: string | null;
  walletAgeDays: number | null;
  walletAgeTruncated: boolean;
}> {
  const signatures = Array.isArray(firstPage) ? firstPage : [];
  if (signatures.length === 0) {
    return {
      txCount: 0,
      txCountCapped: false,
      lastActivityAt: null,
      firstTxAt: null,
      walletAgeDays: null,
      walletAgeTruncated: false,
    };
  }

  const newestWithTime = signatures.find((row) => row.blockTime);
  const lastActivityAt = unixToIso(newestWithTime?.blockTime ?? null);

  let txCount = signatures.length;
  let oldest = signatures[signatures.length - 1];
  let capped = signatures.length === SIG_PAGE_SIZE;
  let page = 1;
  const deadline = Date.now() + SIG_PAGE_BUDGET_MS;

  try {
    while (capped && page < maxPages && oldest?.signature && Date.now() < deadline) {
      const next = await jsonRpc<SolanaSignature[]>(urls, 'getSignaturesForAddress', [
        address,
        { limit: SIG_PAGE_SIZE, before: oldest.signature },
      ]);
      if (!next?.length) {
        capped = false;
        break;
      }
      txCount += next.length;
      oldest = next[next.length - 1];
      capped = next.length === SIG_PAGE_SIZE;
      page += 1;
    }
  } catch {
    capped = true;
  }

  const firstTime = oldest?.blockTime ? oldest.blockTime * 1000 : null;
  const firstTxAt = firstTime != null ? new Date(firstTime).toISOString() : null;
  const walletAgeDays =
    firstTime != null ? Math.max(0, Math.floor((Date.now() - firstTime) / MS_PER_DAY)) : null;

  return {
    txCount: capped ? null : txCount,
    txCountCapped: capped,
    lastActivityAt,
    firstTxAt,
    walletAgeDays,
    walletAgeTruncated: capped,
  };
}

async function fetchRobinhoodStats(address: string): Promise<WalletStats> {
  const network = robinhoodNetwork();
  const normalized = address.toLowerCase();

  const [balanceResult, explorer, ethPrice] = await Promise.all([
    jsonRpc<string>(network.urls, 'eth_getBalance', [normalized, 'latest']).then(
      (value) => ({ ok: true as const, value }),
      (error: unknown) => ({ ok: false as const, error }),
    ),
    fetchRobinhoodExplorer(network.explorer, normalized),
    network.isTestnet ? Promise.resolve(null) : fetchEthUsd(),
  ]);

  if (!balanceResult.ok && !explorer) {
    const message =
      (balanceResult.error instanceof Error && balanceResult.error.message) ||
      'Robinhood RPC request failed';
    throw new WalletStatsError(message, 502);
  }

  const native = balanceResult.ok ? hexToNumber(balanceResult.value) / WEI_PER_ETH : null;

  const methods = [
    balanceResult.ok ? 'eth_getBalance' : null,
    explorer ? 'blockscout txlist/counters' : null,
    ethPrice != null ? 'coingecko/binance ETHUSD' : null,
  ].filter(Boolean);

  return {
    address: normalized,
    chain: 'robinhood',
    nativeSymbol: 'ETH',
    balanceNative: native,
    balanceUsd: native != null && ethPrice != null ? native * ethPrice : null,
    txCount: explorer?.txCount ?? null,
    txCountCapped: false,
    walletAgeDays: explorer?.walletAgeDays ?? null,
    walletAgeTruncated: false,
    lastActivityAt: explorer?.lastActivityAt ?? null,
    firstTxAt: explorer?.firstTxAt ?? null,
    source: `${network.isTestnet ? 'robinhood-testnet-rpc' : 'robinhood-rpc'} ${methods.join(' + ')}`,
  };
}

async function fetchRobinhoodExplorer(
  explorer: string,
  address: string,
): Promise<{
  txCount: number | null;
  walletAgeDays: number | null;
  firstTxAt: string | null;
  lastActivityAt: string | null;
} | null> {
  try {
    const [firstRes, lastRes, countersRes] = await Promise.all([
      fetch(
        `${explorer}/api?module=account&action=txlist&address=${address}&sort=asc&page=1&offset=1`,
        { signal: AbortSignal.timeout(8_000) },
      ),
      fetch(
        `${explorer}/api?module=account&action=txlist&address=${address}&sort=desc&page=1&offset=1`,
        { signal: AbortSignal.timeout(8_000) },
      ),
      fetch(`${explorer}/api/v2/addresses/${address}/counters`, {
        signal: AbortSignal.timeout(8_000),
      }),
    ]);

    const firstTxAt = firstRes.ok ? await readExplorerTxTimestamp(firstRes) : null;
    const lastActivityAt = lastRes.ok ? await readExplorerTxTimestamp(lastRes) : null;

    let txCount: number | null = null;
    if (countersRes.ok) {
      const counters = (await countersRes.json()) as {
        transactions_count?: string | number;
      };
      const parsed = Number(counters.transactions_count);
      if (Number.isFinite(parsed)) txCount = parsed;
    }

    const walletAgeDays =
      firstTxAt != null
        ? Math.max(0, Math.floor((Date.now() - Date.parse(firstTxAt)) / MS_PER_DAY))
        : null;

    if (txCount == null && firstTxAt == null && lastActivityAt == null) {
      return null;
    }

    return { txCount, walletAgeDays, firstTxAt, lastActivityAt };
  } catch {
    return null;
  }
}

async function readExplorerTxTimestamp(response: Response): Promise<string | null> {
  try {
    const body = (await response.json()) as {
      result?: Array<{ timeStamp?: string }> | string;
    };
    const rows = Array.isArray(body.result) ? body.result : [];
    const ts = rows[0]?.timeStamp ? Number(rows[0].timeStamp) * 1000 : NaN;
    if (!Number.isFinite(ts) || ts <= 0) return null;
    return new Date(ts).toISOString();
  } catch {
    return null;
  }
}

function hexToNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value !== 'string' || value.length === 0) return 0;
  try {
    return Number(BigInt(value));
  } catch {
    return 0;
  }
}

function unixToIso(seconds: number | null | undefined): string | null {
  if (seconds == null || !Number.isFinite(seconds) || seconds <= 0) return null;
  return new Date(seconds * 1000).toISOString();
}

async function fetchSolUsd(): Promise<number | null> {
  const prices = await getUsdPrices();
  return prices.sol;
}

async function fetchEthUsd(): Promise<number | null> {
  const prices = await getUsdPrices();
  return prices.eth;
}

async function getUsdPrices(): Promise<{ sol: number | null; eth: number | null }> {
  if (priceCache && Date.now() - priceCache.at < PRICE_TTL_MS) {
    return { sol: priceCache.sol, eth: priceCache.eth };
  }

  let sol: number | null = null;
  let eth: number | null = null;

  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=solana,ethereum&vs_currencies=usd',
      { signal: AbortSignal.timeout(6_000) },
    );
    if (response.ok) {
      const json = (await response.json()) as {
        solana?: { usd?: number };
        ethereum?: { usd?: number };
      };
      sol = Number.isFinite(json.solana?.usd) ? Number(json.solana?.usd) : null;
      eth = Number.isFinite(json.ethereum?.usd) ? Number(json.ethereum?.usd) : null;
    }
  } catch {
    // fall through to Binance
  }

  if (sol == null) sol = await fetchBinancePrice('SOLUSDT');
  if (eth == null) eth = await fetchBinancePrice('ETHUSDT');

  priceCache = { at: Date.now(), sol, eth };
  return { sol, eth };
}

async function fetchBinancePrice(symbol: string): Promise<number | null> {
  try {
    const response = await fetch(
      `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`,
      { signal: AbortSignal.timeout(6_000) },
    );
    if (!response.ok) return null;
    const json = (await response.json()) as { price?: string };
    const price = Number(json.price);
    return Number.isFinite(price) ? price : null;
  } catch {
    return null;
  }
}
