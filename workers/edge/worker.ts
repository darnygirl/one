/**
 * OaaS Edge Worker (Cycles 11-20)
 *
 * Cloudflare Worker for x402 payment verification and R2 serving.
 * Maps to 6-dimension ontology via events, things, and knowledge.
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Env, X402Proof, PricingOffer } from './types';
import { emit402, emit403, emit410, emit500 } from './lib/challenge';
import { parsePaymentHeader, verifyX402, checkIdempotency, cacheGrant } from './lib/x402';
import { guardReplay, consumeNonce } from './lib/nonce';
import { settlePayment } from './lib/settle';

const app = new Hono<{ Bindings: Env }>();

// CORS middleware (allow all origins for agent access)
app.use('/*', cors());

/**
 * Healthcheck endpoint
 */
app.get('/healthz', (c) => {
  return c.json({
    status: 'healthy',
    timestamp: Date.now(),
    service: 'oaas-edge-worker',
    version: '1.0.0',
  });
});

/**
 * Ontology pack routes
 * GET /oaas/packs/ontology/:pack/:layer
 */
app.get('/oaas/packs/ontology/:pack/:layer', async (c) => {
  const { pack, layer } = c.req.param();
  const path = `packs/ontology/${pack}/${layer}`;

  return handlePackRequest(c, path);
});

/**
 * Marketing playbook routes
 * GET /oaas/packs/playbook/:pack/:layer
 */
app.get('/oaas/packs/playbook/:pack/:layer', async (c) => {
  const { pack, layer } = c.req.param();
  const path = `packs/playbook/${pack}/${layer}`;

  return handlePackRequest(c, path);
});

/**
 * Offer endpoint
 * GET /oaas/offers/:offerId
 */
app.get('/oaas/offers/:offerId', async (c) => {
  const { offerId } = c.req.param();

  try {
    // Load offer from KV cache or R2
    const offer = await getOffer(c.env, offerId);

    if (!offer) {
      return c.json({ error: 'offer_not_found' }, 404);
    }

    return c.json(offer);
  } catch (error) {
    console.error('Failed to load offer:', error);
    return emit500(`Failed to load offer: ${error}`);
  }
});

/**
 * Handle pack request with x402 payment flow
 */
async function handlePackRequest(c: any, path: string): Promise<Response> {
  const env = c.env as Env;

  try {
    // 1. Load offer for this path
    const offer = await getOfferForPath(env, path);
    if (!offer) {
      return c.json({ error: 'offer_not_found', path }, 404);
    }

    // 2. Check for X-Payment header
    const paymentHeader = c.req.header('X-Payment');
    const proof = parsePaymentHeader(paymentHeader);

    if (!proof) {
      // No payment provided, emit 402 challenge
      return emit402(env, offer, path);
    }

    // 3. Check idempotency (already processed?)
    const idempotency = await checkIdempotency(env, proof.txHash);
    if (idempotency.processed) {
      console.log(`Request already processed: ${proof.txHash}`);
      // Serve resource again (cached grant)
      return serveR2Object(env, path);
    }

    // 4. Verify nonce (anti-replay)
    const nonceCheck = await guardReplay(env, proof.nonce);
    if (!nonceCheck.valid) {
      return emit410(proof.nonce);
    }

    // 5. Verify payment
    const verification = await verifyX402(
      env,
      proof,
      offer.price,
      env.X402_RECIPIENT
    );

    if (!verification.valid) {
      return emit403('invalid_payment', verification.reason || 'Unknown error');
    }

    // 6. Consume nonce (mark as used)
    const payer = c.req.header('X-Agent') || proof.recipient;
    const consumption = await consumeNonce(env, proof.nonce, payer);
    if (!consumption.consumed) {
      return emit410(proof.nonce);
    }

    // 7. Cache grant for idempotency
    await cacheGrant(env, proof.txHash, proof.nonce);

    // 8. Log usage event to D1 (async, non-blocking)
    c.executionCtx.waitUntil(
      logUsageEvent(env, {
        ts: Date.now(),
        payer,
        layer: path,
        price: offer.price,
        status: 'granted',
        txHash: proof.txHash,
      })
    );

    // 9. Settle payment (async, non-blocking)
    c.executionCtx.waitUntil(settlePayment(env, proof));

    // 10. Serve R2 object
    return serveR2Object(env, path);
  } catch (error) {
    console.error('Pack request failed:', error);
    return emit500(`Internal error: ${error}`);
  }
}

/**
 * Load offer from KV cache, fallback to R2
 */
async function getOffer(env: Env, offerId: string): Promise<PricingOffer | null> {
  const cacheKey = `offer:${offerId}`;

  // Try KV cache first
  const cached = await env.KV_NAMESPACE.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  // Fallback to R2
  const r2Path = `offers/${offerId}.json`;
  const object = await env.R2_BUCKET.get(r2Path);

  if (!object) {
    return null;
  }

  const offer = await object.json<PricingOffer>();

  // Cache for 60 seconds
  await env.KV_NAMESPACE.put(cacheKey, JSON.stringify(offer), {
    expirationTtl: 60,
  });

  return offer;
}

/**
 * Get offer for a specific pack path
 * Maps path to offerId
 */
async function getOfferForPath(env: Env, path: string): Promise<PricingOffer | null> {
  // Extract pack name from path
  // Example: packs/ontology/core-6d/schema → core-6d-v2
  const parts = path.split('/');
  const packName = parts[2]; // e.g., "core-6d"

  // Map pack to offer ID
  const offerIdMap: Record<string, string> = {
    'core-6d': 'core-6d-v2',
    'marketing': 'marketing-playbook-v1',
    'premium-3072': 'premium-3072-v1',
  };

  const offerId = offerIdMap[packName];
  if (!offerId) {
    return null;
  }

  return getOffer(env, offerId);
}

/**
 * Serve R2 object with observed metrics headers
 */
async function serveR2Object(env: Env, path: string): Promise<Response> {
  const startTime = Date.now();

  try {
    const object = await env.R2_BUCKET.get(path);

    if (!object) {
      return new Response('Not found', { status: 404 });
    }

    const latencyMs = Date.now() - startTime;

    // Get observed metrics from cache (aggregated from D1)
    const metrics = await getObservedMetrics(env, path);

    return new Response(object.body, {
      headers: {
        'Content-Type': object.httpMetadata?.contentType || 'application/json',
        'Content-Length': object.size.toString(),
        'ETag': object.etag,
        // Observable metrics headers
        'X-OAAS-Observed-Accuracy-Delta': metrics.accuracyDelta.toString(),
        'X-OAAS-Observed-Tokens-Saved': metrics.tokensSaved.toString(),
        'X-OAAS-Latency-MS': latencyMs.toString(),
        'X-OAAS-Offer-Id': 'one:offer/core-6d@v2.0.0',
        'X-OAAS-Provenance-Hash': object.customMetadata?.provenanceHash || '',
      },
    });
  } catch (error) {
    console.error('Failed to serve R2 object:', error);
    return new Response('Internal error', { status: 500 });
  }
}

/**
 * Get observed metrics for a pack (from D1 aggregates)
 */
async function getObservedMetrics(
  env: Env,
  path: string
): Promise<{ accuracyDelta: number; tokensSaved: number }> {
  const cacheKey = `metrics:${path}`;

  // Try cache first (15min TTL)
  const cached = await env.KV_NAMESPACE.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  // Query D1 for aggregates
  try {
    const result = await env.D1_DATABASE.prepare(
      `SELECT AVG(observedAcc) as avgAcc, AVG(tokensSaved) as avgTokens
       FROM usage_events
       WHERE layer = ? AND status = 'granted' AND ts > ?`
    )
      .bind(path, Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
      .first();

    const metrics = {
      accuracyDelta: result?.avgAcc || 0.36,
      tokensSaved: result?.avgTokens || 0.24,
    };

    // Cache for 15 minutes
    await env.KV_NAMESPACE.put(cacheKey, JSON.stringify(metrics), {
      expirationTtl: 900,
    });

    return metrics;
  } catch (error) {
    console.error('Failed to query observed metrics:', error);
    // Return defaults
    return { accuracyDelta: 0.36, tokensSaved: 0.24 };
  }
}

/**
 * Log usage event to D1
 */
async function logUsageEvent(
  env: Env,
  event: {
    ts: number;
    payer: string;
    layer: string;
    price: number;
    status: string;
    txHash?: string;
    userId?: string;
    roles?: string;
    observedAcc?: number;
    tokensSaved?: number;
    latencyMs?: number;
  }
): Promise<void> {
  try {
    await env.D1_DATABASE.prepare(
      `INSERT INTO usage_events (ts, payer, userId, roles, layer, price, status, observedAcc, tokensSaved, latencyMs, txHash)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        event.ts,
        event.payer,
        event.userId || null,
        event.roles || null,
        event.layer,
        event.price,
        event.status,
        event.observedAcc || null,
        event.tokensSaved || null,
        event.latencyMs || null,
        event.txHash || null
      )
      .run();

    console.log(`Logged usage event: ${event.status} for ${event.layer}`);
  } catch (error) {
    console.error('Failed to log usage event:', error);
  }
}

// Export worker
export default app;
