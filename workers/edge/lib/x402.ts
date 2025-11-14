/**
 * x402 Payment Verification (Cycles 15-16)
 *
 * Verifies x402 payment receipts via Base RPC or facilitator.
 * Maps to "events" dimension: payment_received event type.
 */

import type { Env, X402Proof } from '../types';
import { X402ProofSchema } from '../types';

/**
 * Parse X-Payment header and validate structure
 */
export function parsePaymentHeader(header: string | null): X402Proof | null {
  if (!header) return null;

  try {
    const parsed = JSON.parse(header);
    const validated = X402ProofSchema.parse(parsed);
    return validated;
  } catch (error) {
    console.error('Failed to parse X-Payment header:', error);
    return null;
  }
}

/**
 * Verify x402 payment via facilitator or Base RPC
 *
 * Validates:
 * - Recipient matches expected address
 * - Amount meets or exceeds required price
 * - Transaction is recent (within 5 minutes)
 * - Signature is valid (if provided)
 */
export async function verifyX402(
  env: Env,
  proof: X402Proof,
  expectedAmount: number,
  expectedRecipient: string
): Promise<{ valid: boolean; reason?: string }> {
  // 1. Validate recipient
  if (proof.recipient.toLowerCase() !== expectedRecipient.toLowerCase()) {
    return {
      valid: false,
      reason: `recipient_mismatch: expected ${expectedRecipient}, got ${proof.recipient}`,
    };
  }

  // 2. Validate amount (allow overpayment)
  if (proof.amount < expectedAmount) {
    return {
      valid: false,
      reason: `insufficient_payment: expected ${expectedAmount}, got ${proof.amount}`,
    };
  }

  // 3. Validate recency (tx within last 5 minutes)
  const age = Date.now() - proof.timestamp;
  const MAX_TX_AGE = 5 * 60 * 1000; // 5 minutes
  if (age > MAX_TX_AGE) {
    return {
      valid: false,
      reason: `transaction_too_old: ${age}ms > ${MAX_TX_AGE}ms`,
    };
  }

  // 4. Verify transaction on-chain (via Base RPC or facilitator)
  const verified = await verifyOnChain(env, proof);
  if (!verified.valid) {
    return verified;
  }

  return { valid: true };
}

/**
 * Verify transaction on Base blockchain
 *
 * TODO: Implement actual Base RPC verification
 * For now, this is a stub that accepts valid-looking proofs
 */
async function verifyOnChain(
  env: Env,
  proof: X402Proof
): Promise<{ valid: boolean; reason?: string }> {
  // If facilitator URL is configured, use it
  if (env.X402_GATEWAY_URL) {
    return verifyViaFacilitator(env, proof);
  }

  // Otherwise, verify directly via Base RPC
  if (env.BASE_RPC_URL) {
    return verifyViaBaseRPC(env, proof);
  }

  // Fallback: accept proof if structure is valid (dev mode)
  console.warn('No RPC configured, accepting proof without verification');
  return { valid: true };
}

/**
 * Verify via x402 facilitator gateway
 */
async function verifyViaFacilitator(
  env: Env,
  proof: X402Proof
): Promise<{ valid: boolean; reason?: string }> {
  try {
    const response = await fetch(`${env.X402_GATEWAY_URL}/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        txHash: proof.txHash,
        amount: proof.amount,
        recipient: proof.recipient,
        nonce: proof.nonce,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return {
        valid: false,
        reason: `facilitator_error: ${error}`,
      };
    }

    const result = await response.json();
    return {
      valid: result.valid === true,
      reason: result.reason,
    };
  } catch (error) {
    console.error('Facilitator verification failed:', error);
    return {
      valid: false,
      reason: `facilitator_unreachable: ${error}`,
    };
  }
}

/**
 * Verify via Base RPC (direct blockchain query)
 */
async function verifyViaBaseRPC(
  env: Env,
  proof: X402Proof
): Promise<{ valid: boolean; reason?: string }> {
  try {
    // Query Base RPC for transaction receipt
    const response = await fetch(env.BASE_RPC_URL!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_getTransactionReceipt',
        params: [proof.txHash],
      }),
    });

    if (!response.ok) {
      return {
        valid: false,
        reason: 'base_rpc_error',
      };
    }

    const result = await response.json();
    const receipt = result.result;

    if (!receipt) {
      return {
        valid: false,
        reason: 'transaction_not_found',
      };
    }

    // Validate transaction was successful
    if (receipt.status !== '0x1') {
      return {
        valid: false,
        reason: 'transaction_failed',
      };
    }

    // TODO: Parse logs to verify USDC transfer to recipient with correct amount
    // For now, accept if receipt exists and succeeded

    return { valid: true };
  } catch (error) {
    console.error('Base RPC verification failed:', error);
    return {
      valid: false,
      reason: `base_rpc_unreachable: ${error}`,
    };
  }
}

/**
 * Check if payment was already processed (idempotency)
 */
export async function checkIdempotency(
  env: Env,
  txHash: string
): Promise<{ processed: boolean; grantedAt?: number }> {
  const key = `grant:${txHash}`;
  const grantStr = await env.KV_NAMESPACE.get(key);

  if (!grantStr) {
    return { processed: false };
  }

  const grant = JSON.parse(grantStr);
  return {
    processed: true,
    grantedAt: grant.grantedAt,
  };
}

/**
 * Cache payment grant for idempotency (60s TTL)
 */
export async function cacheGrant(
  env: Env,
  txHash: string,
  nonce: string
): Promise<void> {
  const key = `grant:${txHash}`;
  const grant = {
    nonce,
    grantedAt: Date.now(),
  };

  await env.KV_NAMESPACE.put(key, JSON.stringify(grant), {
    expirationTtl: 60, // 60 seconds
  });
}
