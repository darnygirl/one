/**
 * Usage Event Logging (Cycles 51-60)
 *
 * Write usage events to D1 for analytics and observability.
 * Maps to "events" dimension: payment_received, resource_accessed, etc.
 */

import type { Env, UsageEvent } from '../types';

/**
 * Log usage event to D1
 * Cycles 53-54: Event writer
 */
export async function logUsageEvent(
  env: Env,
  event: UsageEvent
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
    // Don't throw - logging should be non-blocking
  }
}

/**
 * Get observed metrics for a pack (from D1 aggregates)
 * Cycles 57-58: Observable metrics collection
 */
export async function getObservedMetrics(
  env: Env,
  layer: string
): Promise<{ accuracyDelta: number; tokensSaved: number }> {
  const cacheKey = `metrics:${layer}`;

  // Try cache first (15min TTL)
  const cached = await env.KV_NAMESPACE.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  // Query D1 for aggregates (last 7 days)
  try {
    const result = await env.D1_DATABASE.prepare(
      `SELECT AVG(observedAcc) as avgAcc, AVG(tokensSaved) as avgTokens
       FROM usage_events
       WHERE layer = ? AND status = 'granted' AND ts > ?`
    )
      .bind(layer, Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
      .first();

    const metrics = {
      accuracyDelta: result?.avgAcc || 0.36, // Default if no data
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
 * Analytics query: Usage by layer
 * Cycles 59-60: D1 analytics queries
 */
export async function usageByLayer(
  env: Env,
  from: number,
  to: number
): Promise<
  Array<{
    layer: string;
    calls: number;
    revenue: number;
    agents: number;
  }>
> {
  try {
    const result = await env.D1_DATABASE.prepare(
      `SELECT
         layer,
         COUNT(*) as calls,
         SUM(price) as revenue,
         COUNT(DISTINCT payer) as agents
       FROM usage_events
       WHERE status = 'granted' AND ts BETWEEN ? AND ?
       GROUP BY layer
       ORDER BY revenue DESC`
    )
      .bind(from, to)
      .all();

    return result.results as any[];
  } catch (error) {
    console.error('Failed to query usage by layer:', error);
    return [];
  }
}

/**
 * Analytics query: Revenue by agent (top payers)
 */
export async function revByAgent(
  env: Env,
  from: number,
  to: number,
  limit: number = 10
): Promise<
  Array<{
    payer: string;
    totalSpent: number;
    calls: number;
  }>
> {
  try {
    const result = await env.D1_DATABASE.prepare(
      `SELECT
         payer,
         SUM(price) as totalSpent,
         COUNT(*) as calls
       FROM usage_events
       WHERE status = 'granted' AND ts BETWEEN ? AND ?
       GROUP BY payer
       ORDER BY totalSpent DESC
       LIMIT ?`
    )
      .bind(from, to, limit)
      .all();

    return result.results as any[];
  } catch (error) {
    console.error('Failed to query revenue by agent:', error);
    return [];
  }
}

/**
 * Conversion funnel analytics
 */
export async function conversionFunnel(
  env: Env,
  from: number,
  to: number
): Promise<{
  total402: number;
  totalPaid: number;
  totalGranted: number;
  conversionRate: number;
}> {
  try {
    const result = await env.D1_DATABASE.prepare(
      `SELECT
         COUNT(*) as total,
         SUM(CASE WHEN status = 'granted' THEN 1 ELSE 0 END) as granted,
         SUM(CASE WHEN status IN ('denied', 'replay', 'underpay') THEN 1 ELSE 0 END) as denied
       FROM usage_events
       WHERE ts BETWEEN ? AND ?`
    )
      .bind(from, to)
      .first();

    const total = (result?.total as number) || 0;
    const granted = (result?.granted as number) || 0;

    return {
      total402: total,
      totalPaid: total, // Assume all 402s resulted in payment attempt
      totalGranted: granted,
      conversionRate: total > 0 ? granted / total : 0,
    };
  } catch (error) {
    console.error('Failed to query conversion funnel:', error);
    return {
      total402: 0,
      totalPaid: 0,
      totalGranted: 0,
      conversionRate: 0,
    };
  }
}

/**
 * Batch write usage events (for performance)
 * Cycles 53-54: Batch writes
 */
export async function batchLogEvents(
  env: Env,
  events: UsageEvent[]
): Promise<void> {
  if (events.length === 0) return;

  try {
    // Use D1 batch API for better performance
    const statements = events.map((event) =>
      env.D1_DATABASE.prepare(
        `INSERT INTO usage_events (ts, payer, userId, roles, layer, price, status, observedAcc, tokensSaved, latencyMs, txHash)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(
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
    );

    await env.D1_DATABASE.batch(statements);

    console.log(`Batch logged ${events.length} usage events`);
  } catch (error) {
    console.error('Failed to batch log events:', error);
  }
}
