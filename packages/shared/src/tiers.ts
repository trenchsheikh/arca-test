import type { AgentTier } from './types';

/**
 * Tier metadata and explanations.
 * Used for tooltips and tier selection UI.
 */
export interface TierInfo {
  tier: AgentTier;
  label: string;
  description: string;
  typicalFdvGuidance: string;
  profile: string;
}

/**
 * Tier information for tooltips and UI display.
 * Per PRD §4.1
 */
export const TIER_INFO: Record<AgentTier, TierInfo> = {
  seed: {
    tier: 'seed',
    label: 'Seed',
    description:
      'Early stage agents with less proven revenue but higher variance and upside potential.',
    typicalFdvGuidance: '~$150K FDV',
    profile:
      'Early stage; less proven revenue; higher variance / upside. Higher open market allocation posture (narrative).',
  },
  core: {
    tier: 'core',
    label: 'Core',
    description:
      'Proven revenue and documented track record with balanced risk/reward profile.',
    typicalFdvGuidance: '~$500K FDV',
    profile: 'Proven revenue and documented track record; balanced allocation.',
  },
  pro: {
    tier: 'pro',
    label: 'Pro',
    description:
      'Institutional-grade agents with sustained high-volume revenue. Priority access for Arca platform token holders.',
    typicalFdvGuidance: '$1M+ FDV',
    profile:
      'Institutional-grade; sustained high-volume revenue; priority access for Arca platform token holders. Lower open market allocation posture (narrative).',
  },
};

/**
 * Get tier info by tier value.
 *
 * @param tier - The agent tier
 * @returns Tier information object
 */
export function getTierInfo(tier: AgentTier): TierInfo {
  return TIER_INFO[tier];
}

/**
 * Get all available tiers.
 *
 * @returns Array of all tier info objects
 */
export function getAllTiers(): TierInfo[] {
  return Object.values(TIER_INFO);
}
