/**
 * OaaS Effect-TS Client (Cycles 85-86)
 *
 * Type-safe client for fetching OaaS packs with 402 payment flow
 * Uses Effect-TS for composable async operations
 */

import { Effect, pipe } from "effect";
import { z } from "zod";

// ============================================================================
// Schemas
// ============================================================================

/**
 * 402 Payment Required Response Headers
 */
export const X402HeadersSchema = z.object({
  "x402-amount": z.string(),
  "x402-recipient": z.string(),
  "x402-chains": z.string(),
  "x402-offer-url": z.string().optional(),
  "x402-nonce": z.string(),
  "x402-expected-accuracy": z.string().optional(),
  "x402-expected-cost-savings": z.string().optional(),
  "x402-expected-time-saved": z.string().optional(),
  "x402-expected-roi": z.string().optional(),
  "x402-token-efficiency": z.string().optional(),
  "x402-embedding-dim": z.string().optional(),
  "x402-rights-required": z.string().optional(),
  "x402-free-trial": z.string().optional(),
});

export type X402Headers = z.infer<typeof X402HeadersSchema>;

/**
 * Payment offer details
 */
export const PaymentOfferSchema = z.object({
  id: z.string(),
  price_usdc: z.number(),
  monthly_unlimited: z.number().optional(),
  free_trial_calls: z.number().optional(),
  expected_gains: z
    .object({
      accuracy_pct: z.number(),
      token_efficiency_pct: z.number(),
      cost_savings_usd: z.number(),
      time_saved_hours: z.number(),
      roi_multiple: z.number(),
    })
    .optional(),
  whats_included: z.array(z.string()).optional(),
  proof_of_value: z
    .object({
      agents_using: z.number(),
      avg_observed_savings: z.number(),
      avg_observed_accuracy: z.number(),
      satisfaction_score: z.number(),
    })
    .optional(),
});

export type PaymentOffer = z.infer<typeof PaymentOfferSchema>;

/**
 * 402 Response Body
 */
export const PaymentRequiredResponseSchema = z.object({
  error: z.literal("payment_required"),
  message: z.string(),
  offer: PaymentOfferSchema,
});

export type PaymentRequiredResponse = z.infer<
  typeof PaymentRequiredResponseSchema
>;

/**
 * Observed metrics from successful response
 */
export const ObservedMetricsSchema = z.object({
  "x-oaas-observed-accuracy-delta": z.string().optional(),
  "x-oaas-observed-tokens-saved": z.string().optional(),
  "x-oaas-latency-ms": z.string().optional(),
  "x-oaas-offer-id": z.string().optional(),
  "x-oaas-provenance-hash": z.string().optional(),
});

export type ObservedMetrics = z.infer<typeof ObservedMetricsSchema>;

/**
 * OaaS Pack Response
 */
export interface OaasPackResponse<T = any> {
  data: T;
  observed: ObservedMetrics;
  headers: Headers;
}

// ============================================================================
// Error Types
// ============================================================================

export class OaasError extends Error {
  constructor(
    public readonly _tag: string,
    message: string,
    public readonly details?: any
  ) {
    super(message);
    this.name = "OaasError";
  }
}

export class PaymentRequiredError extends OaasError {
  constructor(
    public readonly headers: X402Headers,
    public readonly offer: PaymentOffer
  ) {
    super(
      "PaymentRequired",
      `Payment required: ${offer.price_usdc} USDC`,
      { headers, offer }
    );
  }
}

export class NetworkError extends OaasError {
  constructor(message: string, public readonly status?: number) {
    super("NetworkError", message, { status });
  }
}

export class ValidationError extends OaasError {
  constructor(message: string, public readonly errors: any) {
    super("ValidationError", message, { errors });
  }
}

// ============================================================================
// Payment Function Type
// ============================================================================

/**
 * Payment function that agents provide
 * Receives 402 headers and offer, returns signed proof
 */
export type PaymentFunction = (
  headers: X402Headers,
  offer: PaymentOffer
) => Promise<string>; // Returns tx hash or signed payload

// ============================================================================
// Client Implementation
// ============================================================================

/**
 * Fetch OaaS pack with automatic 402 payment flow
 *
 * @param path - OaaS pack path (e.g., "packs/ontology/core-6d/schema")
 * @param payFn - Payment function (called on 402, returns proof)
 * @returns Effect with pack data + observed metrics
 *
 * @example
 * ```ts
 * const ontology = await getOaas(
 *   "packs/ontology/core-6d/schema",
 *   async (headers, offer) => {
 *     // Agent decides to pay
 *     const proof = await wallet.sign({ amount: offer.price_usdc, ... });
 *     return proof;
 *   }
 * ).pipe(Effect.runPromise);
 * ```
 */
export function getOaas<T = any>(
  path: string,
  payFn?: PaymentFunction
): Effect.Effect<OaasPackResponse<T>, OaasError> {
  return pipe(
    Effect.tryPromise({
      try: async () => {
        // First attempt: no payment
        const response = await fetch(`/api/oaas/${path}`, {
          credentials: "include", // Include auth cookies
        });

        return { response, isRetry: false };
      },
      catch: (error) =>
        new NetworkError(`Failed to fetch OaaS pack: ${error}`),
    }),
    Effect.flatMap(({ response, isRetry }) => {
      // Handle 402 Payment Required
      if (response.status === 402) {
        if (!payFn) {
          return Effect.fail(
            new NetworkError("Payment required but no payment function provided", 402)
          );
        }

        return pipe(
          // Parse 402 headers and offer
          Effect.tryPromise({
            try: async () => {
              const headers = parseX402Headers(response.headers);
              const body = await response.json();
              const parsed = PaymentRequiredResponseSchema.parse(body);
              return { headers, offer: parsed.offer };
            },
            catch: (error) =>
              new ValidationError("Failed to parse 402 response", error),
          }),
          // Call payment function
          Effect.flatMap(({ headers, offer }) =>
            Effect.tryPromise({
              try: async () => {
                const proof = await payFn(headers, offer);
                return { headers, offer, proof };
              },
              catch: (error) =>
                new NetworkError(`Payment failed: ${error}`, 402),
            })
          ),
          // Retry with proof
          Effect.flatMap(({ proof }) =>
            Effect.tryPromise({
              try: async () => {
                const retryResponse = await fetch(`/api/oaas/${path}`, {
                  credentials: "include",
                  headers: {
                    "X-Payment": proof,
                  },
                });

                return { response: retryResponse, isRetry: true };
              },
              catch: (error) =>
                new NetworkError(`Retry after payment failed: ${error}`),
            })
          ),
          // Process retry response
          Effect.flatMap(({ response: retryResponse }) =>
            processSuccessResponse<T>(retryResponse)
          )
        );
      }

      // Handle success (200)
      if (response.status === 200) {
        return processSuccessResponse<T>(response);
      }

      // Handle other errors
      return Effect.fail(
        new NetworkError(
          `Unexpected status: ${response.status}`,
          response.status
        )
      );
    })
  );
}

/**
 * Process successful 200 response
 */
function processSuccessResponse<T>(
  response: Response
): Effect.Effect<OaasPackResponse<T>, OaasError> {
  return Effect.tryPromise({
    try: async () => {
      const data = await response.json();
      const observed = parseObservedMetrics(response.headers);

      return {
        data: data as T,
        observed,
        headers: response.headers,
      };
    },
    catch: (error) =>
      new ValidationError("Failed to parse success response", error),
  });
}

/**
 * Parse X402-* headers from response
 */
function parseX402Headers(headers: Headers): X402Headers {
  const parsed: Record<string, string> = {};

  headers.forEach((value, key) => {
    if (key.toLowerCase().startsWith("x402-")) {
      parsed[key.toLowerCase()] = value;
    }
  });

  return X402HeadersSchema.parse(parsed);
}

/**
 * Parse X-OAAS-Observed-* headers
 */
function parseObservedMetrics(headers: Headers): ObservedMetrics {
  const parsed: Record<string, string> = {};

  headers.forEach((value, key) => {
    if (key.toLowerCase().startsWith("x-oaas-observed-")) {
      parsed[key.toLowerCase()] = value;
    }
  });

  return ObservedMetricsSchema.parse(parsed);
}

// ============================================================================
// React Hook (for use in components)
// ============================================================================

import { useState, useEffect } from "react";

export interface UseOaasOptions {
  enabled?: boolean; // Whether to auto-fetch
  payFn?: PaymentFunction; // Payment function
}

export interface UseOaasResult<T> {
  data: T | null;
  observed: ObservedMetrics | null;
  loading: boolean;
  error: OaasError | null;
  refetch: () => void;
}

/**
 * React hook for fetching OaaS packs
 *
 * @example
 * ```tsx
 * function OntologyViewer() {
 *   const { data, observed, loading, error } = useOaas(
 *     "packs/ontology/core-6d/schema",
 *     {
 *       payFn: async (headers, offer) => {
 *         // Show payment modal, get user confirmation
 *         const confirmed = await showPaymentModal(offer);
 *         if (confirmed) {
 *           return await wallet.sign({ ... });
 *         }
 *         throw new Error("Payment cancelled");
 *       }
 *     }
 *   );
 *
 *   if (loading) return <Spinner />;
 *   if (error) return <Error error={error} />;
 *   return <OntologyDisplay data={data} observed={observed} />;
 * }
 * ```
 */
export function useOaas<T = any>(
  path: string,
  options: UseOaasOptions = {}
): UseOaasResult<T> {
  const { enabled = true, payFn } = options;

  const [data, setData] = useState<T | null>(null);
  const [observed, setObserved] = useState<ObservedMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<OaasError | null>(null);

  const fetchData = async () => {
    if (!enabled) return;

    setLoading(true);
    setError(null);

    try {
      const result = await Effect.runPromise(getOaas<T>(path, payFn));
      setData(result.data);
      setObserved(result.observed);
    } catch (err) {
      setError(err instanceof OaasError ? err : new NetworkError(String(err)));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [path, enabled]);

  return {
    data,
    observed,
    loading,
    error,
    refetch: fetchData,
  };
}
