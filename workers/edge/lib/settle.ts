/**
 * Payment Settlement (Cycles 19-20)
 *
 * Handles async settlement of x402 payments via facilitator.
 * Maps to "events" dimension: payment_settled event type.
 */

import type { Env, X402Proof } from '../types';

/**
 * Settle payment via facilitator (async, non-blocking)
 *
 * This function submits the payment to the facilitator for on-chain settlement.
 * It's called asynchronously after serving the resource to avoid blocking.
 */
export async function settlePayment(
  env: Env,
  proof: X402Proof
): Promise<{ settled: boolean; reason?: string }> {
  if (!env.X402_GATEWAY_URL) {
    console.warn('No facilitator URL configured, skipping settlement');
    return { settled: false, reason: 'no_facilitator' };
  }

  try {
    const response = await fetch(`${env.X402_GATEWAY_URL}/settle`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        txHash: proof.txHash,
        amount: proof.amount,
        recipient: proof.recipient,
        nonce: proof.nonce,
        timestamp: proof.timestamp,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Settlement failed:', error);
      return {
        settled: false,
        reason: `settlement_error: ${error}`,
      };
    }

    const result = await response.json();
    return {
      settled: true,
    };
  } catch (error) {
    console.error('Settlement request failed:', error);
    return {
      settled: false,
      reason: `settlement_unreachable: ${error}`,
    };
  }
}

/**
 * Queue settlement for later processing (if facilitator is down)
 *
 * Writes to D1 with status='pending_settlement' for retry
 */
export async function queueSettlement(
  env: Env,
  proof: X402Proof,
  path: string
): Promise<void> {
  try {
    await env.D1_DATABASE.prepare(
      `INSERT INTO usage_events (ts, payer, layer, price, status, txHash)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
      .bind(
        Date.now(),
        proof.recipient, // payer wallet
        path,
        proof.amount,
        'pending_settlement',
        proof.txHash
      )
      .run();

    console.log(`Queued settlement for txHash: ${proof.txHash}`);
  } catch (error) {
    console.error('Failed to queue settlement:', error);
  }
}

/**
 * Log settlement status to D1 (non-blocking)
 */
export async function logSettlement(
  env: Env,
  txHash: string,
  settled: boolean,
  reason?: string
): Promise<void> {
  try {
    await env.D1_DATABASE.prepare(
      `UPDATE usage_events
       SET status = ?, updatedAt = ?
       WHERE txHash = ?`
    )
      .bind(settled ? 'settled' : 'settlement_failed', Date.now(), txHash)
      .run();
  } catch (error) {
    console.error('Failed to log settlement:', error);
  }
}
