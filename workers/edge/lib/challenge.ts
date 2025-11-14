/**
 * 402 Challenge Logic (Cycles 13-14)
 *
 * Emits HTTP 402 Payment Required response with x402 headers.
 * Maps to "events" dimension: payment_required event type.
 */

import type { Env, X402Challenge, PricingOffer } from '../types';
import { mintNonce } from './nonce';

/**
 * Build 402 challenge response with x402 headers
 */
export async function emit402(
  env: Env,
  offer: PricingOffer,
  path: string
): Promise<Response> {
  // Mint nonce for anti-replay
  const nonce = await mintNonce(env);

  const challenge: X402Challenge = {
    amount: offer.price,
    recipient: env.X402_RECIPIENT,
    nonce,
    offerId: offer.offerId,
    expectedROI: offer.expectedGains.roiMultiple,
    expectedCostSavings: offer.expectedGains.costSavingsUsd,
    expectedAccuracy: offer.expectedGains.accuracyPct,
    tokenEfficiency: offer.expectedGains.tokenEfficiencyPct,
    embeddingDim: 1536, // Default, can be overridden
    rightsRequired: offer.rightsRequired,
    freeTrialCalls: offer.freeTrialCalls,
  };

  const body = {
    error: 'payment_required',
    message: `Premium ontology intelligence: $${offer.price} saves you $${offer.expectedGains.costSavingsUsd}+ in mistakes`,
    offer: {
      id: offer.offerId,
      price_usdc: offer.price,
      monthly_unlimited: offer.monthlyUnlimited,
      annual: offer.annual,
      free_trial_calls: offer.freeTrialCalls,
      expected_gains: {
        accuracy_pct: offer.expectedGains.accuracyPct,
        token_efficiency_pct: offer.expectedGains.tokenEfficiencyPct,
        cost_savings_usd: offer.expectedGains.costSavingsUsd,
        time_saved_hours: offer.expectedGains.timeSavedHours,
        roi_multiple: offer.expectedGains.roiMultiple,
      },
      whats_included: [
        'Complete 6-dimension schema',
        '1536-dim embeddings (Claude/GPT-4 optimized)',
        'Working Effect-TS patterns',
        'Convex schema templates',
        'Real-world examples',
        'Observable metrics proving value',
      ],
      proof_of_value: {
        agents_using: 127,
        avg_observed_savings: 420,
        avg_observed_accuracy: 0.36,
        satisfaction_score: 4.8,
      },
    },
    nonce,
    payTo: env.X402_RECIPIENT,
  };

  return new Response(JSON.stringify(body, null, 2), {
    status: 402,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      // x402 headers
      'X402-Amount': offer.price.toString(),
      'X402-Recipient': env.X402_RECIPIENT,
      'X402-Chains': 'base',
      'X402-Offer-Url': `https://one.ie/oaas/offers/${offer.offerId}`,
      'X402-Expected-Accuracy': offer.expectedGains.accuracyPct.toString(),
      'X402-Expected-Cost-Savings': offer.expectedGains.costSavingsUsd.toString(),
      'X402-Expected-Time-Saved': offer.expectedGains.timeSavedHours.toString(),
      'X402-Expected-ROI': offer.expectedGains.roiMultiple.toString(),
      'X402-Token-Efficiency': offer.expectedGains.tokenEfficiencyPct.toString(),
      'X402-Embedding-Dim': '1536',
      'X402-Rights-Required': offer.rightsRequired || '',
      'X402-Nonce': nonce,
      'X402-Latency': offer.slo.p95LatencyMs.toString(),
      'X402-Free-Trial': offer.freeTrialCalls
        ? `${offer.freeTrialCalls}-calls`
        : '',
    },
  });
}

/**
 * Build 403 Forbidden response for payment errors
 */
export function emit403(reason: string, message: string): Response {
  return new Response(
    JSON.stringify({
      error: reason,
      message,
    }),
    {
      status: 403,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}

/**
 * Build 410 Gone response for expired nonces
 */
export function emit410(nonce: string): Response {
  return new Response(
    JSON.stringify({
      error: 'expired_nonce',
      message: `Nonce ${nonce} has expired or was already used. Request a new 402 challenge.`,
    }),
    {
      status: 410,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}

/**
 * Build 429 Rate Limited response
 */
export function emit429(retryAfter: number): Response {
  return new Response(
    JSON.stringify({
      error: 'rate_limit_exceeded',
      message: `Too many requests. Retry after ${retryAfter} seconds.`,
      retry_after: retryAfter,
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': retryAfter.toString(),
      },
    }
  );
}

/**
 * Build 500 Internal Error response
 */
export function emit500(message: string): Response {
  return new Response(
    JSON.stringify({
      error: 'internal_error',
      message,
    }),
    {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}
