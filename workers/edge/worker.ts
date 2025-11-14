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
import { getOffer, getOfferForPath, applyRolePricing, applySurgePricing } from './lib/offers';
import { enforceRight, checkSuiRight, applyPremiumDiscount } from './lib/sui';
import { serveR2Object } from './lib/serve';
import { logUsageEvent } from './lib/usage';

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
    // 1. Load offer for this path (with caching)
    let offer = await getOfferForPath(env, path);
    if (!offer) {
      return c.json({ error: 'offer_not_found', path }, 404);
    }

    // 2. Apply role-based pricing (if Better Auth session exists)
    const userId = c.req.header('X-Auth-User');
    const rolesHeader = c.req.header('X-Auth-Roles');
    const session = userId && rolesHeader ? {
      userId,
      roles: rolesHeader.split(','),
    } : undefined;

    offer = applyRolePricing(offer, session);

    // 3. Apply surge pricing (based on demand)
    offer = await applySurgePricing(env, offer);

    // 3a. Check Sui rights for premium routes (if required)
    const agent = c.req.header('X-Agent');
    if (offer.rightsRequired && agent) {
      const rightCheck = await checkSuiRight(env, agent, offer.rightsRequired);
      if (rightCheck.valid) {
        // Apply premium discount (50% off per-call)
        offer = {
          ...offer,
          price: applyPremiumDiscount(offer.price, true),
        };
        console.log(`Premium discount applied for agent: ${agent}`);
      }
    }

    // 4. Check for X-Payment header
    const paymentHeader = c.req.header('X-Payment');
    const proof = parsePaymentHeader(paymentHeader);

    // 4a. If staff role, bypass payment (free access)
    if (session?.roles.includes('staff') || session?.roles.includes('platform_owner')) {
      console.log(`Staff access granted for user: ${userId}`);
      return serveR2Object(env, path);
    }

    if (!proof) {
      // No payment provided, emit 402 challenge
      return emit402(env, offer, path);
    }

    // 4b. Enforce Sui right requirement (if specified and no right owned)
    if (offer.rightsRequired) {
      const agentAddr = agent || proof.recipient;
      const enforcement = await enforceRight(env, agentAddr, offer.rightsRequired);
      if (!enforcement.authorized) {
        return emit403(
          'right_required',
          `This premium resource requires Sui right: ${offer.rightsRequired}. ${enforcement.reason}`
        );
      }
    }

    // 5. Check idempotency (already processed?)
    const idempotency = await checkIdempotency(env, proof.txHash);
    if (idempotency.processed) {
      console.log(`Request already processed: ${proof.txHash}`);
      // Serve resource again (cached grant)
      return serveR2Object(env, path);
    }

    // 6. Verify nonce (anti-replay)
    const nonceCheck = await guardReplay(env, proof.nonce);
    if (!nonceCheck.valid) {
      return emit410(proof.nonce);
    }

    // 7. Verify payment (use final offer.price after role/surge adjustments)
    const verification = await verifyX402(
      env,
      proof,
      offer.price,
      env.X402_RECIPIENT
    );

    if (!verification.valid) {
      return emit403('invalid_payment', verification.reason || 'Unknown error');
    }

    // 8. Consume nonce (mark as used)
    const payer = c.req.header('X-Agent') || proof.recipient;
    const consumption = await consumeNonce(env, proof.nonce, payer);
    if (!consumption.consumed) {
      return emit410(proof.nonce);
    }

    // 9. Cache grant for idempotency
    await cacheGrant(env, proof.txHash, proof.nonce);

    // 10. Log usage event to D1 (async, non-blocking)
    c.executionCtx.waitUntil(
      logUsageEvent(env, {
        ts: Date.now(),
        payer,
        userId,
        roles: rolesHeader,
        layer: path,
        price: offer.price,
        status: 'granted',
        txHash: proof.txHash,
      })
    );

    // 11. Settle payment (async, non-blocking)
    c.executionCtx.waitUntil(settlePayment(env, proof));

    // 12. Serve R2 object
    return serveR2Object(env, path);
  } catch (error) {
    console.error('Pack request failed:', error);
    return emit500(`Internal error: ${error}`);
  }
}

// Offer, Sui, R2, and usage functions moved to lib/

// Export worker
export default app;
