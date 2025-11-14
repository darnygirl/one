/**
 * Sui Rights Integration (Cycles 31-40)
 *
 * Verify Sui NFT ownership for premium tier access.
 * Maps to "things" dimension: digital rights (NFTs).
 * Maps to "events" dimension: authorization_granted.
 */

import type { Env, SuiRight, RightCheckResult } from '../types';

const RIGHTS_CACHE_TTL = 3600; // 1 hour in seconds
const RIGHTS_CACHE_PREFIX = 'sui:';

/**
 * Check if agent owns required Sui right
 * Cycles 31-32: Sui RPC client
 */
export async function checkSuiRight(
  env: Env,
  agent: string,
  rightId: string
): Promise<RightCheckResult> {
  // 1. Check cache first (1hr TTL)
  const cacheKey = `${RIGHTS_CACHE_PREFIX}${agent}:${rightId}`;
  const cached = await env.KV_NAMESPACE.get(cacheKey);

  if (cached) {
    const result: RightCheckResult = JSON.parse(cached);
    console.log(`Rights cache HIT: ${agent}:${rightId}`);
    return { ...result, cached: true };
  }

  console.log(`Rights cache MISS: ${agent}:${rightId}`);

  // 2. Query Sui RPC
  if (!env.SUI_RPC_URL) {
    console.warn('No SUI_RPC_URL configured, skipping rights check');
    return { valid: false, cached: false, error: 'no_sui_rpc' };
  }

  const result = await queryRightOwnership(env, agent, rightId);

  // 3. Cache result
  await cacheRightCheck(env, agent, rightId, result);

  return { ...result, cached: false };
}

/**
 * Query Sui RPC for right ownership
 */
async function queryRightOwnership(
  env: Env,
  agent: string,
  rightId: string
): Promise<RightCheckResult> {
  try {
    // Query owned objects filtered by right type
    const response = await fetch(env.SUI_RPC_URL!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'suix_getOwnedObjects',
        params: [
          agent, // owner address
          {
            filter: {
              StructType: `${rightId}::OaasRight::OaasRight`,
            },
            options: {
              showType: true,
              showOwner: true,
              showContent: true,
            },
          },
        ],
      }),
    });

    if (!response.ok) {
      return {
        valid: false,
        error: `sui_rpc_error: ${response.status}`,
      };
    }

    const data = await response.json();

    if (data.error) {
      return {
        valid: false,
        error: `sui_error: ${data.error.message}`,
      };
    }

    const ownedObjects = data.result?.data || [];

    if (ownedObjects.length === 0) {
      return {
        valid: false,
        error: 'right_not_owned',
      };
    }

    // Check if any owned right is still valid (not expired)
    for (const obj of ownedObjects) {
      const content = obj.data?.content;
      if (!content) continue;

      const validUntil = content.fields?.validUntil;
      if (!validUntil) {
        // No expiration, valid forever
        return { valid: true };
      }

      const expiresAt = parseInt(validUntil);
      if (expiresAt > Date.now()) {
        return { valid: true, expiresAt };
      }
    }

    return {
      valid: false,
      error: 'right_expired',
    };
  } catch (error) {
    console.error('Sui RPC query failed:', error);
    return {
      valid: false,
      error: `sui_rpc_unreachable: ${error}`,
    };
  }
}

/**
 * Cache rights check result
 * Cycles 33-34: Rights caching
 */
async function cacheRightCheck(
  env: Env,
  agent: string,
  rightId: string,
  result: RightCheckResult
): Promise<void> {
  const cacheKey = `${RIGHTS_CACHE_PREFIX}${agent}:${rightId}`;

  // Cache for 1 hour (or until expiration if sooner)
  let ttl = RIGHTS_CACHE_TTL;
  if (result.valid && result.expiresAt) {
    const timeUntilExpiry = Math.floor((result.expiresAt - Date.now()) / 1000);
    ttl = Math.min(ttl, Math.max(0, timeUntilExpiry));
  }

  await env.KV_NAMESPACE.put(cacheKey, JSON.stringify(result), {
    expirationTtl: ttl,
  });
}

/**
 * Invalidate rights cache (on transfer or expiration)
 * Cycles 39-40: Cache invalidation
 */
export async function invalidateRightCache(
  env: Env,
  agent: string,
  rightId: string
): Promise<void> {
  const cacheKey = `${RIGHTS_CACHE_PREFIX}${agent}:${rightId}`;
  await env.KV_NAMESPACE.delete(cacheKey);
  console.log(`Invalidated rights cache: ${agent}:${rightId}`);
}

/**
 * Enforce Sui right requirement for premium routes
 * Cycles 35-36: Rights enforcement
 */
export async function enforceRight(
  env: Env,
  agent: string,
  rightId?: string
): Promise<{ authorized: boolean; reason?: string }> {
  if (!rightId) {
    // No right required, allow access
    return { authorized: true };
  }

  const result = await checkSuiRight(env, agent, rightId);

  if (!result.valid) {
    return {
      authorized: false,
      reason: result.error || 'right_not_owned',
    };
  }

  return { authorized: true };
}

/**
 * Get all rights owned by an agent
 * (for debugging and user dashboards)
 */
export async function getAgentRights(
  env: Env,
  agent: string
): Promise<SuiRight[]> {
  if (!env.SUI_RPC_URL) {
    return [];
  }

  try {
    const response = await fetch(env.SUI_RPC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'suix_getOwnedObjects',
        params: [
          agent,
          {
            filter: {
              MatchAll: [
                {
                  StructType: '0x::OaasRight::OaasRight',
                },
              ],
            },
            options: {
              showType: true,
              showOwner: true,
              showContent: true,
            },
          },
        ],
      }),
    });

    if (!response.ok) {
      console.error('Failed to fetch agent rights:', response.status);
      return [];
    }

    const data = await response.json();
    const ownedObjects = data.result?.data || [];

    const rights: SuiRight[] = [];

    for (const obj of ownedObjects) {
      const content = obj.data?.content;
      if (!content) continue;

      const fields = content.fields;
      const right: SuiRight = {
        rightId: fields.rightId || 'unknown',
        suiObjectId: obj.data.objectId,
        owner: agent,
        validUntil: fields.validUntil ? parseInt(fields.validUntil) : 0,
        capabilities: fields.capabilities || [],
      };

      rights.push(right);
    }

    return rights;
  } catch (error) {
    console.error('Failed to get agent rights:', error);
    return [];
  }
}

/**
 * Premium tier discount (if right owned)
 * Cycles 37-38: Premium tier logic
 */
export function applyPremiumDiscount(
  price: number,
  hasRight: boolean
): number {
  if (!hasRight) {
    return price;
  }

  // Premium right holders get 50% off per-call pricing
  return price * 0.5;
}
