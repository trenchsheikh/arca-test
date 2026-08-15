import type { Agent, Contributor } from '@/lib/mock-data';

const HANDLES = [
  'anonwhale',
  'interneth',
  'bagsized',
  'serliquidity',
  'apeexit',
  'ngmi_maxxing',
  'basedbuyer',
  'degen_desk',
  'moonbagjoe',
  'liquidchef',
  'fomodriven',
  'chadstack',
  'exitliq',
  'onchainape',
  'rektproof',
  'yieldgoblin',
  'perpnikita',
  'solmaxooor',
  'rhodeski',
  'ticksize',
];

/** Deterministic mock contributors for an agent raise. */
export function buildContributors(agent: Agent): Contributor[] {
  const total = Math.max(0, agent.amountRaised);
  if (total <= 0) return [];

  const seed = agent.slug.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const count = 5 + (seed % 5);
  const weights: number[] = [];
  let weightSum = 0;

  for (let i = 0; i < count; i++) {
    const w = ((seed * (i + 3)) % 17) + 4;
    weights.push(w);
    weightSum += w;
  }

  const contributors: Contributor[] = weights.map((w, i) => {
    const handle = HANDLES[(seed + i * 5) % HANDLES.length];
    return {
      handle: `@${handle}`,
      amount: Math.round((total * w) / weightSum),
    };
  });

  // Keep deployer as top contributor slice when they participated
  const deployerAmount = Math.round(total * 0.12);
  contributors.unshift({
    handle: agent.deployer,
    amount: Math.max(deployerAmount, contributors[0]?.amount ?? deployerAmount),
  });

  // Normalize so amounts roughly equal raised total
  const sum = contributors.reduce((acc, c) => acc + c.amount, 0);
  if (sum > 0 && sum !== total) {
    const scale = total / sum;
    for (const c of contributors) {
      c.amount = Math.round(c.amount * scale);
    }
  }

  return contributors
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 8);
}

export function contributorCount(agent: Agent): number {
  const base = Math.max(3, Math.round(agent.amountRaised / 850));
  const seed = agent.slug.length * 17;
  return base + (seed % 40);
}

/** 0–100 heat score from raise progress + activity. */
export function apeMeterScore(agent: Agent): number {
  const progress =
    agent.raiseTarget > 0 ? agent.amountRaised / agent.raiseTarget : 0;
  const buybackBoost = Math.min(agent.totalBuybacks / 80, 0.35);
  const liveBoost =
    agent.status === 'ICO Live' ? 0.15 : agent.status === 'Trading' ? 0.1 : 0;
  return Math.min(100, Math.round((progress * 0.7 + buybackBoost + liveBoost) * 100));
}
