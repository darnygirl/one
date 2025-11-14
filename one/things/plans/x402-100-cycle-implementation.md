# x402 OaaS: 100-Cycle Implementation Plan

**Version:** 1.0.0
**Created:** 2025-11-14
**Status:** 🚀 Ready for Parallel Execution
**Based on:** Coinbase x402 TypeScript examples + ONE Platform architecture

---

## Executive Summary

**Transform Coinbase x402 examples into production ONE Platform Ontology-as-a-Service (OaaS).**

**What we're building:**
- Premium intelligence marketplace ($15-30 per call)
- Cloudflare Edge Workers (hot path)
- x402 payment verification (Base/USDC)
- Sui Rights NFTs (premium access)
- Better Auth integration (role-based pricing)
- Astro + React 19 frontend (SSR)
- Convex policy brain (analytics)

**Improvement strategy:**
1. **Adapt** Coinbase examples to ONE Platform stack
2. **Enhance** with premium pricing ($15-30 vs micropayments)
3. **Integrate** Better Auth + Sui Rights + Convex
4. **Scale** to edge-first architecture (Cloudflare Workers)
5. **Optimize** for observable ROI (X-OAAS-Observed-* headers)

---

## Analysis: Coinbase x402 Examples

### What We Learned from Examples

#### 1. Auth-Based Pricing (`auth_based_pricing/`)

**Pattern:** Dynamic pricing based on JWT authentication

```typescript
// Unauthenticated: $0.10/call
// Authenticated (JWT): $0.01/call

if (authHeader) {
  price = 0.01;  // Authenticated discount
} else {
  price = 0.10;  // Unauthenticated premium
}
```

**ONE Platform adaptation:**
- Better Auth roles instead of SIWE/JWT
- Premium pricing ($15 base, $7.50 with Pro role)
- Staff role = free (internal use)

#### 2. Mainnet Production (`mainnet/`)

**Pattern:** Next.js middleware with route protection

```typescript
// middleware.ts
export const config = {
  matcher: ['/protected/:path*']
};

paymentMiddleware(
  payTo: RESOURCE_WALLET_ADDRESS,
  routes: {
    '/protected': { price: 0.001, network: 'base' }
  },
  facilitator
);
```

**ONE Platform adaptation:**
- Cloudflare Workers instead of Next.js middleware
- Multiple routes: `/oaas/packs/ontology/*`, `/oaas/packs/playbook/*`
- KV cache for nonces + offers

#### 3. Browser Wallet (`browser-wallet-example/`)

**Pattern:** Client-side wallet connection + session management

```typescript
// Two payment models:
// 1. Extended Access ($1, 24hr session)
// 2. Single-Use ($0.10, 5min one-time)

// Flow:
connectWallet() → selectPayment() → signTx() → getSession() → accessResource()
```

**ONE Platform adaptation:**
- Effect-TS client (typed 402→pay→retry)
- Free trial (3 calls, no payment)
- Monthly unlimited ($30, session-based)

#### 4. Next Advanced (`next-advanced/`)

**Pattern:** Three-layer architecture

```typescript
// Layer 1: Middleware (check session cookie)
middleware.ts → redirect to /paywall if no cookie

// Layer 2: Paywall page (client payment)
app/paywall/page.tsx → create payment → sign → submit

// Layer 3: Server action (verify + set cookie)
app/actions.ts → verifyPayment() → setCookie() → redirect
```

**ONE Platform adaptation:**
- Astro SSR pages (instead of Next.js)
- Worker validates payment (no middleware)
- React islands for interactive components

### x402 Core Payment Flow (12 Steps)

```
1. Client → GET /oaas/packs/ontology/core-6d/schema
2. Server → 402 Payment Required
   {
     "payTo": "0xRECIPIENT",
     "amount": "15.00",
     "network": "base",
     "nonce": "uuid"
   }
3. Client → Create signed payload
   payload = sign({ payTo, amount, network, nonce }, privateKey)
4. Client → GET /oaas/... + X-Payment: <payload>
5. Server → Verify payload (facilitator or local)
6. Facilitator → Validate signature + amount + nonce
7. Server → Perform work (serve R2 object)
8. Server → Settle payment (facilitator submits on-chain)
9. Facilitator → Submit tx to Base blockchain
10. Facilitator → Wait for confirmation
11. Facilitator → Return execution confirmation
12. Server → Respond with resource + X-Payment-Response header
```

**ONE Platform enhancements:**
- Anti-replay (KV nonce tracking)
- Observed metrics (X-OAAS-Observed-* headers)
- Sui rights check (premium tier gate)
- D1 usage logging (analytics)

---

## 100-Cycle Implementation Plan

**Structure:** 10 phases × 10 cycles each = 100 cycles total

### Phase 1: Foundation (Cycles 1-10)

**Cycle 1-2: Repository Setup**
- [ ] Create `/workers/edge` directory structure
- [ ] Create `/apps/oaas-frontend` (Astro app)
- [ ] Set up monorepo workspace (pnpm + turbo)
- [ ] Configure TypeScript strict mode
- [ ] Install x402 SDK dependencies

**Cycle 3-4: Environment Configuration**
- [ ] Create `.env` templates (Worker, Astro, Convex)
- [ ] Set up Cloudflare wrangler.toml
- [ ] Configure bindings (R2, KV, D1, DO)
- [ ] Set environment variables (X402_RECIPIENT, BASE_RPC_URL, SUI_RPC_URL)
- [ ] Create development secrets

**Cycle 5-6: Database Schema**
- [ ] Design D1 schema (`usage_events` table)
- [ ] Create migration scripts
- [ ] Set up KV key patterns (offers, nonces, sui_rights)
- [ ] Design R2 directory structure
- [ ] Update Convex schema (offers, grants, usage_events, rights_cache)

**Cycle 7-8: Type Definitions**
- [ ] Define x402 types (`X402Proof`, `X402Challenge`, `PaymentPayload`)
- [ ] Define OaaS types (`OntologyPack`, `PlaybookPack`, `PricingOffer`)
- [ ] Define Sui Rights types (`SuiRight`, `RightCheck`)
- [ ] Define Better Auth types (`Session`, `Role`)
- [ ] Create Zod schemas for validation

**Cycle 9-10: Facilitator Integration**
- [ ] Research x402 facilitator endpoints (verify, settle, supported)
- [ ] Create facilitator client (`lib/facilitator.ts`)
- [ ] Test verify endpoint (mock payment)
- [ ] Test settle endpoint (testnet)
- [ ] Implement retry logic (exponential backoff)

---

### Phase 2: Core x402 Worker (Cycles 11-20)

**Cycle 11-12: Worker Skeleton**
- [ ] Create `workers/edge/worker.ts` (Hono server)
- [ ] Set up route handlers (GET /oaas/packs/*)
- [ ] Add healthcheck endpoint (GET /healthz)
- [ ] Configure CORS headers
- [ ] Add error handling middleware

**Cycle 13-14: 402 Challenge Logic**
- [ ] Create `lib/challenge.ts` (emit402 function)
- [ ] Mint nonces (KV with 5min TTL)
- [ ] Build 402 response headers (X402-Amount, X402-Nonce, etc.)
- [ ] Add offer URL (X402-Offer-Url)
- [ ] Include expected gains (X402-Expected-ROI, X402-Expected-Cost-Savings)

**Cycle 15-16: Payment Verification**
- [ ] Create `lib/x402.ts` (verifyX402 function)
- [ ] Parse X-Payment header (extract payload)
- [ ] Verify signature (facilitator /verify endpoint)
- [ ] Validate amount (≥ required price)
- [ ] Validate recipient (exact match)
- [ ] Validate nonce (exists in KV, not consumed)

**Cycle 17-18: Nonce Anti-Replay**
- [ ] Create `lib/nonce.ts` (mint, guardReplay, consume)
- [ ] Mint: Generate UUID, store in KV with TTL
- [ ] GuardReplay: Check if nonce exists and unconsumed
- [ ] Consume: Mark nonce as used (atomic operation)
- [ ] Handle edge cases (expired, duplicate, missing)

**Cycle 19-20: Payment Settlement**
- [ ] Create `lib/settle.ts` (settlePayment function)
- [ ] Call facilitator /settle endpoint
- [ ] Handle async settlement (non-blocking)
- [ ] Log settlement status to D1
- [ ] Implement idempotency (cache txHash → grant for 60s)

---

### Phase 3: Offer Management (Cycles 21-30)

**Cycle 21-22: Offer Loading**
- [ ] Create `lib/offers.ts` (getOffer function)
- [ ] Load from KV cache (60s TTL)
- [ ] Fallback to Convex query
- [ ] Fallback to R2 (offers/*.jsonld)
- [ ] Handle missing offers (404)

**Cycle 23-24: Dynamic Pricing**
- [ ] Implement role-based pricing (Better Auth)
- [ ] Staff: price = $0, skip x402
- [ ] Pro: price *= 0.5
- [ ] Customer: full price
- [ ] Agent (no session): full price

**Cycle 25-26: Surge Pricing**
- [ ] Query Convex for p95 latency
- [ ] Calculate demand factor (current load / SLO)
- [ ] Apply surge multiplier (1 + min(1.0, demandFactor))
- [ ] Cap maximum price (2× base)

**Cycle 27-28: JSON-LD Offers**
- [ ] Create `/docs/offers/core-6d-v2.jsonld`
- [ ] Create `/docs/offers/marketing-playbook-v1.jsonld`
- [ ] Create `/docs/offers/premium-3072-v1.jsonld`
- [ ] Upload to R2 bucket
- [ ] Validate JSON-LD schema

**Cycle 29-30: Offer Caching**
- [ ] Implement KV cache strategy
- [ ] Cache warming (preload popular offers)
- [ ] Cache invalidation (on update)
- [ ] Monitor cache hit rate
- [ ] Log cache misses

---

### Phase 4: Sui Rights Integration (Cycles 31-40)

**Cycle 31-32: Sui RPC Client**
- [ ] Create `lib/sui.ts` (checkSuiRight function)
- [ ] Connect to Sui RPC endpoint
- [ ] Query object ownership (getOwnedObjects)
- [ ] Verify object type (matches rightId)
- [ ] Check expiration (validUntil)

**Cycle 33-34: Rights Caching**
- [ ] Cache rights check in KV (1hr TTL)
- [ ] Key pattern: `sui:<agent>:<rightId>`
- [ ] Handle cache invalidation (on transfer)
- [ ] Monitor cache effectiveness

**Cycle 35-36: Rights Enforcement**
- [ ] Check `offer.requiresRight` flag
- [ ] If true, verify Sui right ownership
- [ ] Return 403 if right missing
- [ ] Log enforcement events to D1

**Cycle 37-38: Premium Tier Logic**
- [ ] Premium routes: 3072-dim embeddings, signals stream
- [ ] Require Sui right: `one:rights/oaas-premium-v1`
- [ ] Apply discount if right owned (50% off per-call)
- [ ] Log premium access events

**Cycle 39-40: Rights NFT Metadata**
- [ ] Design Sui NFT schema (OaaS Premium Access)
- [ ] Include capabilities list
- [ ] Include expiration timestamp
- [ ] Create minting script (testnet)

---

### Phase 5: R2 Storage & Serving (Cycles 41-50)

**Cycle 41-42: R2 Directory Structure**
- [ ] Create `/packs/ontology/core-6d/schema.jsonld`
- [ ] Create `/packs/ontology/core-6d/signals.jsonld`
- [ ] Create `/packs/ontology/core-6d/embeddings.json`
- [ ] Create `/packs/playbook/marketing/strategy.jsonld`
- [ ] Create `/packs/playbook/marketing/content-ops.jsonld`

**Cycle 43-44: Ontology Pack Generation**
- [ ] Parse `/one/knowledge/ontology.md`
- [ ] Convert to JSON-LD (6 dimensions)
- [ ] Add @context and schema constraints
- [ ] Generate embeddings (1536-dim, OpenAI API)
- [ ] Add provenance hash + signature

**Cycle 45-46: Marketing Pack Generation**
- [ ] Extract ICP frameworks from docs
- [ ] Extract POV positioning templates
- [ ] Extract messaging architecture
- [ ] Convert to JSON-LD format
- [ ] Add observable metrics metadata

**Cycle 47-48: R2 Upload Script**
- [ ] Create `infra/cloudflare/r2/seed.sh`
- [ ] Upload all packs to R2 bucket
- [ ] Set content-type headers
- [ ] Verify upload success
- [ ] Test retrieval

**Cycle 49-50: Serve R2 Objects**
- [ ] Create `lib/serve.ts` (serveR2Object function)
- [ ] Add response headers (X-OAAS-Observed-*, Content-Type)
- [ ] Handle 404 (object not found)
- [ ] Add cache headers (Cache-Control)
- [ ] Stream large files (avoid memory limits)

---

### Phase 6: D1 Usage Logging (Cycles 51-60)

**Cycle 51-52: D1 Schema Creation**
- [ ] Create `infra/cloudflare/d1/schema.sql`
- [ ] Table: usage_events (id, ts, payer, userId, roles, layer, price, status, observedAcc, tokensSaved, latencyMs, txHash)
- [ ] Indexes: (layer, ts), (payer), (status)
- [ ] Unique constraint: (txHash, nonce)

**Cycle 53-54: Usage Event Writer**
- [ ] Create `lib/usage.ts` (logUsageEvent function)
- [ ] Write to D1 asynchronously (non-blocking)
- [ ] Handle write failures (log to error stream)
- [ ] Batch writes (improve performance)

**Cycle 55-56: Event Types**
- [ ] payment_received (x402 tx confirmed)
- [ ] resource_accessed (pack served)
- [ ] authorization_granted (Sui right verified)
- [ ] nonce_consumed (anti-replay)
- [ ] inference_executed (agent used ontology)

**Cycle 57-58: Observable Metrics Collection**
- [ ] Query D1 for avg observedAcc by layer
- [ ] Query D1 for avg tokensSaved by layer
- [ ] Calculate p95 latency
- [ ] Store aggregates in KV (15min cache)

**Cycle 59-60: D1 Analytics Queries**
- [ ] usageByLayer(from, to) → revenue, calls, agents
- [ ] revByAgent(from, to) → top paying agents
- [ ] conversionFunnel() → free → paid rates
- [ ] retentionCohorts() → monthly retention

---

### Phase 7: Convex Backend (Cycles 61-70)

**Cycle 61-62: Convex Schema**
- [ ] Update `backend/convex/schema.ts`
- [ ] Table: offers (groupId, packId, price, expectedGains, slo, rightsRequired)
- [ ] Table: grants (groupId, agent, packId, grantedAt, expiresAt)
- [ ] Table: usage_events (mirror from D1 for analytics)
- [ ] Table: rights_cache (agent, rightId, valid, checkedAt)

**Cycle 63-64: Offer Management**
- [ ] Create `backend/convex/functions/offer.ts`
- [ ] getOffer(path) → pricing + SLO + rights
- [ ] listOffers(groupId) → all available packs
- [ ] updateOffer(id, fields) → admin function
- [ ] Map to 6D ontology (groupId scoping)

**Cycle 65-66: Authorization Service**
- [ ] Create `backend/convex/functions/authz.ts`
- [ ] authorizeAccess(proof, path, nonce, userId, roles)
- [ ] Check Better Auth session
- [ ] Apply role-based pricing
- [ ] Log authorization decision

**Cycle 67-68: Analytics Functions**
- [ ] Create `backend/convex/functions/analytics.ts`
- [ ] usageByLayer(from, to) → charts data
- [ ] revByAgent(from, to) → leaderboard
- [ ] observedMetrics(packId) → avg accuracy, tokens saved
- [ ] conversionFunnels() → free → paid → monthly

**Cycle 69-70: Edge-Only Fallback**
- [ ] Implement graceful degradation (Convex down)
- [ ] Worker uses KV + R2 only
- [ ] Default prices from embedded JSON
- [ ] Queue events for later sync
- [ ] Monitor Convex availability

---

### Phase 8: Durable Objects (SSE Streaming) (Cycles 71-80)

**Cycle 71-72: SignalsDO Implementation**
- [ ] Create `workers/edge/durable/SignalsDO.ts`
- [ ] Implement WebSocket accept/broadcast
- [ ] Store active connections in memory
- [ ] Handle connection lifecycle (open, close, error)

**Cycle 73-74: Authorization for Signals**
- [ ] Require 402 payment before connect
- [ ] Check Sui right: `one:rights/oaas-premium-v1`
- [ ] Validate session token
- [ ] Reject unauthorized connections

**Cycle 75-76: Rate Limiting**
- [ ] Per-payer rate limits (KV counters)
- [ ] 100 connections per agent
- [ ] 1000 messages per hour
- [ ] Return 429 on limit exceeded

**Cycle 77-78: Signal Broadcasting**
- [ ] Marketing signals (trending topics, message-fit scores)
- [ ] Ontology signals (schema updates, dimension changes)
- [ ] JSON lines format (one signal per line)
- [ ] Timestamp + signal type + payload

**Cycle 79-80: Replay Support**
- [ ] Store last 1000 signals in memory
- [ ] Accept `?lastId=<id>` query param
- [ ] Replay missed signals (within 5min window)
- [ ] Handle backpressure (slow consumers)

---

### Phase 9: Frontend (Astro + React) (Cycles 81-90)

**Cycle 81-82: Astro Setup**
- [ ] Create `apps/oaas-frontend` (Astro 5)
- [ ] Configure Cloudflare adapter (SSR)
- [ ] Set up Tailwind CSS v4
- [ ] Install shadcn/ui components
- [ ] Configure TypeScript paths

**Cycle 83-84: Better Auth Integration**
- [ ] Create `src/lib/auth/session.ts`
- [ ] getSession(request) → userId, roles
- [ ] Proxy routes: `/api/oaas/[...path].ts`
- [ ] Append X-Auth-User, X-Auth-Roles headers
- [ ] Handle session refresh

**Cycle 85-86: Effect-TS Client**
- [ ] Create `src/lib/effect/oaasClient.ts`
- [ ] getOaas(path, payFn) → Effect<OaasPack, OaasError>
- [ ] Parse 402 response (Zod schema)
- [ ] Call payFn → obtain proof → retry with X-Payment
- [ ] Return typed data + observed metrics

**Cycle 87-88: React Components**
- [ ] Create `src/components/PaywallDebugger.tsx`
- [ ] Display 402 headers, offer details
- [ ] Show observed vs expected metrics
- [ ] Manual payment testing UI
- [ ] Create `src/components/OaasPackCard.tsx` (pack listing)

**Cycle 89-90: Astro Pages**
- [ ] Create `src/pages/oaas/index.astro` (marketplace)
- [ ] Create `src/pages/oaas/packs/[packId].astro` (pack detail)
- [ ] Create `src/pages/dashboard.astro` (usage analytics)
- [ ] Server-side data fetching (ConvexHttpClient)
- [ ] Add `client:load` for interactive components

---

### Phase 10: Testing, Docs, Deployment (Cycles 91-100)

**Cycle 91-92: Unit Tests**
- [ ] Test x402 receipt parser/validator
- [ ] Test nonce mint/guard/replay
- [ ] Test Sui rights check (mock RPC)
- [ ] Test policy matrix (roles → price)
- [ ] Test offer loading (KV → Convex → R2)

**Cycle 93-94: Integration Tests (Miniflare)**
- [ ] Test 402 issuance (correct headers)
- [ ] Test accept paid retry
- [ ] Test reject underpay
- [ ] Test reject replay
- [ ] Test require Sui right for premium

**Cycle 95-96: Security Audit**
- [ ] Nonce anti-replay correctness
- [ ] Amount & recipient validation
- [ ] Time-bound tx acceptance
- [ ] Idempotency (txHash caching)
- [ ] PII protection (userId only)

**Cycle 97-98: Documentation**
- [ ] Create `/docs/API.md` (header contracts, curl examples)
- [ ] Create `/docs/AGENT_INTEGRATION.md` (how Claude uses OaaS)
- [ ] Create `/docs/DEPLOYMENT.md` (staging + prod)
- [ ] Update CLAUDE.md (OaaS section)
- [ ] Create video demo (5min walkthrough)

**Cycle 99: Deployment**
- [ ] Deploy Worker to Cloudflare (staging)
- [ ] Deploy Convex (staging environment)
- [ ] Seed R2 with packs
- [ ] Test end-to-end flow
- [ ] Monitor metrics (latency, payment success)

**Cycle 100: Launch & Observe**
- [ ] Deploy to production
- [ ] Announce to agent developers
- [ ] Observe first purchases
- [ ] Collect observed metrics
- [ ] Iterate on pricing based on ROI

---

## Parallel Execution Strategy

**Run in parallel wherever possible:**

### Group A: Backend (Cycles 11-60)
- **Agent: agent-backend** → Worker, x402, Sui, R2, D1
- Dependencies: Cycles 1-10 complete

### Group B: Convex (Cycles 61-70)
- **Agent: agent-backend** (same agent, different focus)
- Dependencies: Cycles 5-6 (schema design)

### Group C: Durable Objects (Cycles 71-80)
- **Agent: agent-backend** (same agent)
- Dependencies: Cycles 11-20 (Worker skeleton)

### Group D: Frontend (Cycles 81-90)
- **Agent: agent-frontend** → Astro, React, Effect-TS
- Dependencies: Cycles 1-4, 7-8 (repo setup, types)

### Group E: Testing & Docs (Cycles 91-100)
- **Agent: agent-quality** → Unit, integration, security
- **Agent: agent-documenter** → API docs, guides
- Dependencies: All implementation cycles (11-90)

**Coordination points:**
- Cycle 10: Foundation complete → spawn all agents
- Cycle 60: Backend complete → frontend can integrate
- Cycle 90: All code complete → testing begins
- Cycle 100: Launch

---

## Success Metrics (Per Cycle)

**Cycle completion criteria:**
- [ ] Code written and committed
- [ ] Types validated (TypeScript strict mode)
- [ ] Manual testing passed
- [ ] Documentation updated
- [ ] No regressions introduced

**Phase completion criteria:**
- [ ] All cycles in phase complete
- [ ] Integration tests pass
- [ ] Performance benchmarks met
- [ ] Security checklist completed

**Project completion criteria (Cycle 100):**
- [ ] Production deployment successful
- [ ] First agent purchase recorded
- [ ] Observed metrics collected
- [ ] $450+ revenue (month 1 goal)

---

## Key Improvements Over Coinbase Examples

### 1. Premium Pricing ($15-30 vs $0.001-0.10)
- **Why:** Agents value intelligence at $300+ savings, not micropayments
- **How:** X402-Expected-ROI headers, observable metrics proving value

### 2. Better Auth Integration (vs SIWE/JWT)
- **Why:** Unified auth across ONE Platform
- **How:** Role-based pricing (staff/pro/customer)

### 3. Sui Rights NFTs (vs simple paywalls)
- **Why:** Premium tier access, tradable on DEX
- **How:** Verify ownership via Sui RPC, cache results

### 4. Edge-First Architecture (vs Next.js middleware)
- **Why:** Global low latency, scales to millions
- **How:** Cloudflare Workers + R2 + KV + D1

### 5. Observable Metrics (vs basic payment receipt)
- **Why:** Agents learn what's worth buying (feedback loop)
- **How:** X-OAAS-Observed-Accuracy-Delta, X-OAAS-Observed-Cost-Savings

### 6. Multi-Pack Marketplace (vs single endpoint)
- **Why:** Different packs for different use cases
- **How:** Ontology, marketing playbook, premium 3072-dim

### 7. Free Trial (vs pay-first)
- **Why:** Prove value before purchase (20% conversion)
- **How:** 3 free calls per agent, track in KV

### 8. Convex Analytics (vs no tracking)
- **Why:** Understand usage, optimize pricing
- **How:** Mirror D1 events, build dashboards

### 9. Effect-TS Client (vs basic fetch)
- **Why:** Type-safe, composable, error handling
- **How:** Effect<OaasPack, OaasError> with retry logic

### 10. 6-Dimension Ontology Mapping (vs generic data)
- **Why:** Every feature maps to reality model
- **How:** groups, people, things, connections, events, knowledge

---

## Next Steps

**Ready for parallel execution!**

1. **Spawn agents** (one message, multiple Task calls):
   - `agent-backend` → Cycles 11-80 (Worker + Convex + DO)
   - `agent-frontend` → Cycles 81-90 (Astro + React + Effect-TS)
   - `agent-quality` → Cycles 91-96 (tests + security)
   - `agent-documenter` → Cycles 97-98 (docs)
   - `agent-ops` → Cycle 99-100 (deployment)

2. **Monitor progress** via GitHub commits

3. **Coordinate at cycle 60** (backend complete)

4. **Launch at cycle 100** 🚀

---

**Built on:** Coinbase x402 best practices + ONE Platform architecture
**Delivers:** Premium intelligence marketplace with observable ROI
**Timeline:** 100 cycles (inference-based, not days)

Let's build the future of AI agent commerce! 💰🤖
