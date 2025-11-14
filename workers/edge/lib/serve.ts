/**
 * R2 Object Serving (Cycles 41-50)
 *
 * Stream R2 objects with observed metrics headers.
 * Maps to "knowledge" dimension: ontology packs, playbooks.
 */

import type { Env, ObservedMetrics } from '../types';
import { getObservedMetrics } from './usage';

/**
 * Serve R2 object with observed metrics headers
 * Cycles 49-50: Serve R2 objects
 */
export async function serveR2Object(
  env: Env,
  path: string
): Promise<Response> {
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
      status: 200,
      headers: {
        'Content-Type': object.httpMetadata?.contentType || 'application/json',
        'Content-Length': object.size.toString(),
        'ETag': object.etag,
        'Cache-Control': 'public, max-age=3600', // 1 hour cache
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
 * Stream large R2 object (avoid memory limits)
 * For files >10MB, use streaming
 */
export async function streamR2Object(
  env: Env,
  path: string
): Promise<Response> {
  try {
    const object = await env.R2_BUCKET.get(path);

    if (!object) {
      return new Response('Not found', { status: 404 });
    }

    // For large files, stream the body
    return new Response(object.body, {
      status: 200,
      headers: {
        'Content-Type': object.httpMetadata?.contentType || 'application/octet-stream',
        'Content-Length': object.size.toString(),
        'ETag': object.etag,
        'Cache-Control': 'public, max-age=86400', // 24 hours
      },
    });
  } catch (error) {
    console.error('Failed to stream R2 object:', error);
    return new Response('Internal error', { status: 500 });
  }
}

/**
 * Check if R2 object exists
 */
export async function objectExists(env: Env, path: string): Promise<boolean> {
  try {
    const object = await env.R2_BUCKET.head(path);
    return object !== null;
  } catch (error) {
    return false;
  }
}

/**
 * Get R2 object metadata (without downloading body)
 */
export async function getObjectMetadata(
  env: Env,
  path: string
): Promise<R2ObjectBody | null> {
  try {
    return await env.R2_BUCKET.head(path);
  } catch (error) {
    console.error('Failed to get R2 metadata:', error);
    return null;
  }
}

/**
 * List objects in R2 bucket (for debugging)
 */
export async function listObjects(
  env: Env,
  prefix?: string
): Promise<string[]> {
  try {
    const listed = await env.R2_BUCKET.list({
      prefix,
      limit: 1000,
    });

    return listed.objects.map((obj) => obj.key);
  } catch (error) {
    console.error('Failed to list R2 objects:', error);
    return [];
  }
}
