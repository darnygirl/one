/**
 * Offer Management (Cycles 21-30)
 *
 * Load offers from KV cache → Convex → R2 fallback.
 * Apply role-based pricing and surge pricing.
 * Maps to "things" dimension: pricing offers.
 */

import type { Env, PricingOffer, BetterAuthSession } from '../types';

const OFFER_CACHE_TTL = 60; // 60 seconds

/**
 * Get offer by ID
 * Load from KV cache, fallback to Convex, then R2
 */
export async function getOffer(
  env: Env,
  offerId: string
): Promise<PricingOffer | null> {
  const cacheKey = `offer:${offerId}`;

  // 1. Try KV cache first (60s TTL)
  const cached = await env.KV_NAMESPACE.get(cacheKey);
  if (cached) {
    console.log(`Offer cache HIT: ${offerId}`);
    return JSON.parse(cached);
  }

  console.log(`Offer cache MISS: ${offerId}`);

  // 2. Try Convex backend
  const offer = await loadOfferFromConvex(env, offerId);
  if (offer) {
    await cacheOffer(env, offerId, offer);
    return offer;
  }

  // 3. Fallback to R2
  const offerFromR2 = await loadOfferFromR2(env, offerId);
  if (offerFromR2) {
    await cacheOffer(env, offerId, offerFromR2);
    return offerFromR2;
  }

  return null;
}

/**
 * Get offer for a specific pack path
 * Maps path to offerId
 */
export async function getOfferForPath(
  env: Env,
  path: string
): Promise<PricingOffer | null> {
  const offerId = mapPathToOfferId(path);
  if (!offerId) {
    return null;
  }

  return getOffer(env, offerId);
}

/**
 * Apply role-based pricing to offer
 * Cycles 23-24: Dynamic pricing based on Better Auth roles
 */
export function applyRolePricing(
  offer: PricingOffer,
  session?: BetterAuthSession
): PricingOffer {
  if (!session) {
    // No session = full price
    return offer;
  }

  const { roles } = session;

  // Staff: free (price = 0)
  if (roles.includes('staff') || roles.includes('platform_owner')) {
    return {
      ...offer,
      price: 0,
    };
  }

  // Pro: 50% off
  if (roles.includes('pro')) {
    return {
      ...offer,
      price: offer.price * 0.5,
    };
  }

  // Customer: full price
  return offer;
}

/**
 * Apply surge pricing based on demand
 * Cycles 25-26: Dynamic pricing based on load and SLO
 */
export async function applySurgePricing(
  env: Env,
  offer: PricingOffer
): Promise<PricingOffer> {
  try {
    // Query Convex for current p95 latency
    const metrics = await fetch(`${env.CONVEX_URL}/api/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        path: 'analytics:currentLoad',
        args: { packId: offer.packId },
      }),
    });

    if (!metrics.ok) {
      // Convex down, skip surge pricing
      return offer;
    }

    const data = await metrics.json();
    const { p95LatencyMs, currentLoad } = data;

    // Calculate demand factor
    // If p95 latency > SLO, increase price
    const latencyFactor = p95LatencyMs / offer.slo.p95LatencyMs;
    const demandFactor = currentLoad || 1.0;

    // Apply surge multiplier (max 2×)
    const surgeMultiplier = Math.min(
      2.0,
      1 + Math.max(0, latencyFactor - 1) * 0.5 + (demandFactor - 1) * 0.3
    );

    if (surgeMultiplier > 1.1) {
      console.log(
        `Applying surge pricing: ${surgeMultiplier.toFixed(2)}× for ${offer.offerId}`
      );
      return {
        ...offer,
        price: offer.price * surgeMultiplier,
      };
    }

    return offer;
  } catch (error) {
    console.error('Failed to apply surge pricing:', error);
    return offer;
  }
}

/**
 * Load offer from Convex backend
 */
async function loadOfferFromConvex(
  env: Env,
  offerId: string
): Promise<PricingOffer | null> {
  try {
    const response = await fetch(`${env.CONVEX_URL}/api/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        path: 'offer:getOffer',
        args: { offerId },
      }),
    });

    if (!response.ok) {
      console.warn(`Convex query failed: ${response.status}`);
      return null;
    }

    const offer = await response.json();
    return offer || null;
  } catch (error) {
    console.error('Failed to load offer from Convex:', error);
    return null;
  }
}

/**
 * Load offer from R2 bucket
 */
async function loadOfferFromR2(
  env: Env,
  offerId: string
): Promise<PricingOffer | null> {
  try {
    const r2Path = `offers/${offerId}.json`;
    const object = await env.R2_BUCKET.get(r2Path);

    if (!object) {
      return null;
    }

    const offer = await object.json<PricingOffer>();
    return offer;
  } catch (error) {
    console.error('Failed to load offer from R2:', error);
    return null;
  }
}

/**
 * Cache offer in KV
 */
async function cacheOffer(
  env: Env,
  offerId: string,
  offer: PricingOffer
): Promise<void> {
  const cacheKey = `offer:${offerId}`;
  await env.KV_NAMESPACE.put(cacheKey, JSON.stringify(offer), {
    expirationTtl: OFFER_CACHE_TTL,
  });
}

/**
 * Map pack path to offer ID
 */
function mapPathToOfferId(path: string): string | null {
  // Extract pack name from path
  // Example: packs/ontology/core-6d/schema → core-6d-v2
  const parts = path.split('/');

  if (parts.length < 3) {
    return null;
  }

  const category = parts[1]; // "ontology" or "playbook"
  const packName = parts[2]; // e.g., "core-6d"

  // Map pack to offer ID
  const offerIdMap: Record<string, string> = {
    'core-6d': 'core-6d-v2',
    'marketing': 'marketing-playbook-v1',
    'premium-3072': 'premium-3072-v1',
  };

  const offerId = offerIdMap[packName];
  return offerId || null;
}

/**
 * Preload popular offers into cache (cache warming)
 * Cycle 29-30: Cache warming strategy
 */
export async function warmOfferCache(env: Env): Promise<void> {
  const popularOffers = ['core-6d-v2', 'marketing-playbook-v1'];

  for (const offerId of popularOffers) {
    try {
      const offer = await getOffer(env, offerId);
      if (offer) {
        console.log(`Warmed cache for offer: ${offerId}`);
      }
    } catch (error) {
      console.error(`Failed to warm cache for ${offerId}:`, error);
    }
  }
}

/**
 * Invalidate offer cache (on update)
 */
export async function invalidateOfferCache(
  env: Env,
  offerId: string
): Promise<void> {
  const cacheKey = `offer:${offerId}`;
  await env.KV_NAMESPACE.delete(cacheKey);
  console.log(`Invalidated cache for offer: ${offerId}`);
}
