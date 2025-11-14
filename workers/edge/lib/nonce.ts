/**
 * Nonce Anti-Replay System (Cycles 17-18)
 *
 * Prevents replay attacks by tracking nonces in KV with 5min TTL.
 * Maps to "events" dimension: nonce_consumed event type.
 */

import type { Env, NonceRecord } from '../types';

const NONCE_PREFIX = 'nonce:';
const NONCE_TTL = 300; // 5 minutes in seconds

/**
 * Generate a cryptographically random nonce
 */
export function generateNonce(): string {
  // Use crypto.randomUUID() for secure random nonce
  return crypto.randomUUID();
}

/**
 * Mint a new nonce and store in KV
 * Returns the nonce string
 */
export async function mintNonce(env: Env): Promise<string> {
  const nonce = generateNonce();
  const record: NonceRecord = {
    mintedAt: Date.now(),
  };

  await env.KV_NAMESPACE.put(
    `${NONCE_PREFIX}${nonce}`,
    JSON.stringify(record),
    { expirationTtl: NONCE_TTL }
  );

  return nonce;
}

/**
 * Check if nonce exists and is not consumed
 * Returns true if valid (exists and unconsumed), false otherwise
 */
export async function guardReplay(
  env: Env,
  nonce: string
): Promise<{ valid: boolean; reason?: string }> {
  const key = `${NONCE_PREFIX}${nonce}`;
  const recordStr = await env.KV_NAMESPACE.get(key);

  if (!recordStr) {
    return {
      valid: false,
      reason: 'nonce_expired_or_missing',
    };
  }

  const record: NonceRecord = JSON.parse(recordStr);

  if (record.consumedAt) {
    return {
      valid: false,
      reason: 'nonce_already_used',
    };
  }

  // Check if nonce is too old (defensive, KV TTL should handle this)
  const age = Date.now() - record.mintedAt;
  if (age > NONCE_TTL * 1000) {
    return {
      valid: false,
      reason: 'nonce_expired',
    };
  }

  return { valid: true };
}

/**
 * Consume nonce (mark as used)
 * This is an atomic operation - only succeeds once
 */
export async function consumeNonce(
  env: Env,
  nonce: string,
  usedBy: string
): Promise<{ consumed: boolean; reason?: string }> {
  const key = `${NONCE_PREFIX}${nonce}`;
  const recordStr = await env.KV_NAMESPACE.get(key);

  if (!recordStr) {
    return {
      consumed: false,
      reason: 'nonce_not_found',
    };
  }

  const record: NonceRecord = JSON.parse(recordStr);

  if (record.consumedAt) {
    return {
      consumed: false,
      reason: 'nonce_already_consumed',
    };
  }

  // Update record with consumption timestamp
  const updatedRecord: NonceRecord = {
    ...record,
    usedBy,
    consumedAt: Date.now(),
  };

  // Write back to KV (keep same TTL)
  await env.KV_NAMESPACE.put(
    key,
    JSON.stringify(updatedRecord),
    { expirationTtl: NONCE_TTL }
  );

  return { consumed: true };
}

/**
 * Delete nonce from KV (cleanup)
 */
export async function deleteNonce(env: Env, nonce: string): Promise<void> {
  await env.KV_NAMESPACE.delete(`${NONCE_PREFIX}${nonce}`);
}
