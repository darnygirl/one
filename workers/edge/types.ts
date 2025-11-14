/**
 * Type definitions for x402 OaaS Worker
 *
 * Maps to 6-dimension ontology:
 * - things: OaasPack, PricingOffer
 * - events: payment_received, resource_accessed, authorization_granted
 * - knowledge: embeddings, labels
 */

import { z } from 'zod';

// Cloudflare bindings
export interface Env {
  R2_BUCKET: R2Bucket;
  KV_NAMESPACE: KVNamespace;
  D1_DATABASE: D1Database;
  SIGNALS_DO: DurableObjectNamespace;
  CONVEX_URL: string;
  X402_RECIPIENT: string;
  BASE_RPC_URL?: string;
  SUI_RPC_URL?: string;
  X402_GATEWAY_URL?: string;
}

// x402 Types
export const X402ProofSchema = z.object({
  txHash: z.string(),
  amount: z.number(),
  recipient: z.string(),
  nonce: z.string(),
  timestamp: z.number(),
  signature: z.string().optional(),
});

export type X402Proof = z.infer<typeof X402ProofSchema>;

export const X402ChallengeSchema = z.object({
  amount: z.number(),
  recipient: z.string(),
  nonce: z.string(),
  offerId: z.string(),
  expectedROI: z.number(),
  expectedCostSavings: z.number(),
  expectedAccuracy: z.number(),
  tokenEfficiency: z.number(),
  embeddingDim: z.number(),
  rightsRequired: z.string().optional(),
  freeTrialCalls: z.number().optional(),
});

export type X402Challenge = z.infer<typeof X402ChallengeSchema>;

// OaaS Pack Types (maps to "things" in 6D ontology)
export interface OaasPack {
  id: string;
  name: string;
  type: 'ontology' | 'playbook';
  version: string;
  r2Path: string;
  embeddingDim: number;
  expectedGains: {
    accuracyPct: number;
    tokenEfficiencyPct: number;
    costSavingsUsd: number;
    timeSavedHours: number;
    roiMultiple: number;
  };
  slo: {
    p95LatencyMs: number;
    uptimePct: number;
  };
  provenanceHash?: string;
  sig?: string;
}

// Pricing Offer (maps to "things" with type "knowledge_pack")
export interface PricingOffer {
  offerId: string;
  packId: string;
  price: number; // USDC
  monthlyUnlimited?: number;
  annual?: number;
  rightsRequired?: string;
  freeTrialCalls?: number;
  expectedGains: OaasPack['expectedGains'];
  slo: OaasPack['slo'];
}

// Better Auth Session
export interface BetterAuthSession {
  userId: string;
  roles: string[]; // ['staff', 'pro', 'customer']
}

// Sui Rights
export interface SuiRight {
  rightId: string;
  suiObjectId: string;
  owner: string;
  validUntil: number;
  capabilities: string[];
}

export interface RightCheckResult {
  valid: boolean;
  cached: boolean;
  expiresAt?: number;
  error?: string;
}

// D1 Usage Event (maps to "events" in 6D ontology)
export interface UsageEvent {
  ts: number;
  payer: string; // wallet address or userId
  userId?: string; // if Better Auth session exists
  roles?: string; // comma-separated
  layer: string; // pack path
  price: number;
  status: 'granted' | 'denied' | 'replay' | 'underpay';
  observedAcc?: number;
  tokensSaved?: number;
  latencyMs?: number;
  txHash?: string;
}

// Response headers
export interface ObservedMetrics {
  accuracyDelta: number;
  tokensSaved: number;
  costSavings: number;
  latencyMs: number;
}

// Nonce tracking
export interface NonceRecord {
  mintedAt: number;
  usedBy?: string;
  consumedAt?: number;
}

// Error types
export type OaasError =
  | { _tag: 'PaymentRequired'; challenge: X402Challenge }
  | { _tag: 'InvalidPayment'; reason: string }
  | { _tag: 'ExpiredNonce'; nonce: string }
  | { _tag: 'ReplayDetected'; nonce: string }
  | { _tag: 'InsufficientPayment'; expected: number; received: number }
  | { _tag: 'RightRequired'; rightId: string }
  | { _tag: 'NotFound'; path: string }
  | { _tag: 'RateLimited'; retryAfter: number }
  | { _tag: 'InternalError'; message: string };
