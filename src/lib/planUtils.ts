// Plan configuration and utility functions

export interface PlanQuotas {
  ai_generations: number;
  deep_scans: number;
}

export interface PlanInfo {
  name: string;
  displayName: string;
  quotas: PlanQuotas;
  features: string[];
}

// Define plan configurations with quotas matching pricing page
export const PLAN_CONFIGS: Record<string, PlanInfo> = {
  basic: {
    name: 'basic',
    displayName: 'Base',
    quotas: {
      ai_generations: 10, // "10 Concierge AI Autofills / month"
      deep_scans: 0, // No deep scans in Base plan
    },
    features: [
      "Unlimited Grant Capture & Tracking",
      "Central Dashboard Access", 
      "10 Concierge AI Autofills / month",
      "Standard Page Analysis",
      "Deadline Notifications",
      "Standard Email Support"
    ]
  },
  pro: {
    name: 'pro',
    displayName: 'Proof',
    quotas: {
      ai_generations: 150, // "150 Concierge AI Autofills / month"
      deep_scans: 5, // Reasonable default for Proof plan
    },
    features: [
      "Everything in Base, plus:",
      "150 Concierge AI Autofills / month",
      "Unlimited AI Answer Refinement Engine",
      "One-Click Pitch Deck Analysis",
      "Priority Email Support"
    ]
  },
  enterprise: {
    name: 'enterprise',
    displayName: 'Growth',
    quotas: {
      ai_generations: 400, // "400 Concierge AI Autofills / month"
      deep_scans: 25, // "25 Deep Scans / month (with HyperBrowser)"
    },
    features: [
      "Everything in Proof, plus:",
      "400 Concierge AI Autofills / month",
      "25 Deep Scans / month (with HyperBrowser)",
      "Analytics Dashboard",
      "Data Export Capabilities",
      "Priority Email & Phone Support"
    ]
  }
};

/**
 * Get plan information by tier
 */
export function getPlanInfo(tier: string): PlanInfo {
  const normalizedTier = tier?.toLowerCase() || 'basic';
  return PLAN_CONFIGS[normalizedTier] || PLAN_CONFIGS.basic;
}

/**
 * Get plan quotas by tier
 */
export function getPlanQuotas(tier: string): PlanQuotas {
  return getPlanInfo(tier).quotas;
}

/**
 * Get plan display name by tier
 */
export function getPlanDisplayName(tier: string): string {
  return getPlanInfo(tier).displayName;
}

/**
 * Check if a tier has access to a specific feature
 */
export function hasFeatureAccess(tier: string, feature: 'ai_generations' | 'deep_scans'): boolean {
  const quotas = getPlanQuotas(tier);
  return quotas[feature] > 0;
}

/**
 * Get usage percentage for a quota
 */
export function calculateUsagePercentage(used: number, limit: number): number {
  if (limit === 0) return 0;
  return Math.min(Math.round((used / limit) * 100), 100);
}

/**
 * Check if usage is near limit (above 80%)
 */
export function isNearLimit(used: number, limit: number): boolean {
  return calculateUsagePercentage(used, limit) >= 80;
}

/**
 * Check if usage has exceeded limit
 */
export function hasExceededLimit(used: number, limit: number): boolean {
  return used >= limit;
}
