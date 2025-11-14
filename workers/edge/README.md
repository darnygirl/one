# OaaS Edge Worker

**Cloudflare Worker for x402 Ontology-as-a-Service (OaaS) payment system.**

## Architecture

This worker implements the hot path for x402 payments:

1. **402 Challenge** - Emit payment required with nonce
2. **Payment Verification** - Verify x402 proof via Base RPC
3. **Anti-Replay** - Guard nonces in KV (5min TTL)
4. **R2 Serving** - Stream ontology/playbook packs
5. **Usage Logging** - Write events to D1 (analytics)
6. **Observable Metrics** - Return X-OAAS-Observed-* headers

## Implementation Status

**Cycles 11-20: COMPLETE** ✅
- [x] Worker skeleton with Hono routes
- [x] 402 challenge logic
- [x] Payment verification (Base RPC + facilitator)
- [x] Nonce anti-replay (KV atomic operations)
- [x] Payment settlement (async)

**Cycles 21-30: COMPLETE** ✅
- [x] Offer loading (KV → Convex → R2 fallback)
- [x] Role-based pricing (Better Auth integration)
- [x] Dynamic pricing (surge based on demand)
- [x] JSON-LD offers (3 packs created)

**Cycles 31-40: COMPLETE** ✅
- [x] Sui RPC client (query ownership)
- [x] Rights caching (KV with 1hr TTL)
- [x] Premium tier enforcement (50% discount)

**Cycles 41-50: COMPLETE** ✅
- [x] R2 serving with observable metrics
- [x] Streaming large files
- [x] Object metadata queries

**Cycles 51-60: COMPLETE** ✅
- [x] Usage event writer (D1 async)
- [x] Observable metrics aggregation
- [x] Analytics queries (usageByLayer, revByAgent, conversionFunnel)
- [x] Batch event writing

**Cycles 61-70: SPECIFICATION COMPLETE** 📋
- [x] Convex schema spec (offers, grants, usageEvents, rightsCache)
- [x] Function specs (offer mgmt, authz, analytics)
- [x] Edge-only fallback strategy
- [ ] Implementation in /backend (pending)

**Cycles 71-80: COMPLETE** ✅
- [x] SignalsDO implementation
- [x] WebSocket accept/broadcast
- [x] Rate limiting (100 connections, 1000 messages/hr)
- [x] Signal generation & replay

## Setup

### 1. Install Dependencies

```bash
cd workers/edge
npm install
```

### 2. Create D1 Database

```bash
wrangler d1 create oaas-usage
wrangler d1 execute oaas-usage --file=./schema.sql
```

### 3. Create KV Namespace

```bash
wrangler kv:namespace create KV_NAMESPACE
wrangler kv:namespace create KV_NAMESPACE --preview
```

### 4. Create R2 Bucket

```bash
wrangler r2 bucket create oaas-packs
```

### 5. Update wrangler.toml

Update the IDs in `wrangler.toml`:
- `kv_namespaces.id`
- `kv_namespaces.preview_id`
- `d1_databases.database_id`

### 6. Set Secrets (Production)

```bash
wrangler secret put BASE_RPC_URL
wrangler secret put SUI_RPC_URL
wrangler secret put X402_GATEWAY_URL
```

## Development

```bash
# Start local dev server (Miniflare)
npm run dev

# Deploy to staging
npm run deploy

# Deploy to production
npm run deploy:production

# Tail logs
npm run tail
```

## Testing

### Manual Test Flow

1. **Request without payment** (should get 402):
```bash
curl -i http://localhost:8787/oaas/packs/ontology/core-6d/schema
```

Expected:
```
HTTP/1.1 402 Payment Required
X402-Amount: 15.00
X402-Recipient: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
X402-Nonce: <uuid>
X402-Expected-ROI: 20
```

2. **Request with payment** (should get 200 + resource):
```bash
curl -i http://localhost:8787/oaas/packs/ontology/core-6d/schema \
  -H "X-Payment: {\"txHash\":\"0x123\",\"amount\":15,\"recipient\":\"0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb\",\"nonce\":\"<uuid>\",\"timestamp\":$(date +%s)000}"
```

Expected:
```
HTTP/1.1 200 OK
X-OAAS-Observed-Accuracy-Delta: 0.36
X-OAAS-Observed-Tokens-Saved: 0.24
X-OAAS-Latency-MS: 320
Content-Type: application/ld+json
```

3. **Replay attack** (should get 410):
```bash
# Same request again with same nonce
```

Expected:
```
HTTP/1.1 410 Gone
{"error":"expired_nonce","message":"Nonce <uuid> has expired or was already used"}
```

## Routes

- `GET /healthz` - Healthcheck
- `GET /oaas/packs/ontology/:pack/:layer` - Ontology packs
- `GET /oaas/packs/playbook/:pack/:layer` - Marketing playbooks
- `GET /oaas/offers/:offerId` - Pricing offers

## Environment Variables

- `CONVEX_URL` - Convex backend URL
- `X402_RECIPIENT` - USDC recipient wallet address
- `BASE_RPC_URL` - Base blockchain RPC endpoint
- `SUI_RPC_URL` - Sui blockchain RPC endpoint
- `X402_GATEWAY_URL` - x402 facilitator gateway URL

## Bindings

- `R2_BUCKET` - R2 bucket for packs storage
- `KV_NAMESPACE` - KV for offers, nonces, sui_rights cache
- `D1_DATABASE` - D1 database for usage_events
- `SIGNALS_DO` - Durable Object for SSE streaming

## Mapping to 6-Dimension Ontology

### 1. Groups
- All usage events scoped to groupId (ONE.ie organization)
- Multi-tenant: Each org can sell their own OaaS packs

### 2. People
- Better Auth roles determine pricing (staff, pro, customer)
- Every action has an actor (payer wallet or userId)

### 3. Things
- OaaS packs are "things" with type "knowledge_pack"
- Pricing offers are "things" with type "pricing_offer"
- Sui Rights NFTs are "things" with type "digital_right"

### 4. Connections
- Pack authored by organization
- Pack requires right (premium tier)
- Agent owns right

### 5. Events
- payment_received (x402 tx confirmed)
- resource_accessed (pack served)
- authorization_granted (Sui right verified)
- nonce_consumed (anti-replay)
- payment_settled (facilitator confirmed)

### 6. Knowledge
- Ontology embeddings (1536-dim or 3072-dim)
- Marketing playbook content
- Observable metrics (accuracy, tokens saved)

## Security

- **Anti-replay**: Nonces tracked in KV with 5min TTL
- **Payment verification**: Base RPC or facilitator validation
- **Idempotency**: txHash cached to prevent double-spend
- **Rate limiting**: TODO in Cycles 71-80
- **PII protection**: Only userId and roles stored (no email, no IP)

## Performance

- **p95 latency target**: <400ms (ontology), <450ms (playbook)
- **Uptime target**: 99.9% (ontology), 99.5% (playbook)
- **KV cache hit rate**: >80% (offers, metrics)
- **D1 write latency**: <50ms (async, non-blocking)

## Next Steps

**Immediate (Cycles 61-70):**
1. Implement Convex backend functions (see `CONVEX_SPEC.md`)
2. Deploy Convex schema updates
3. Test worker → Convex integration

**Deployment (Cycles 91-100):**
1. Deploy Worker to Cloudflare (staging)
2. Deploy Convex (staging)
3. Upload sample packs to R2
4. Test end-to-end flow
5. Deploy to production
6. Monitor metrics
7. Announce to agent developers

**Manual Testing Checklist:**
- [ ] 402 challenge returns correct headers
- [ ] Payment verification works (testnet)
- [ ] Nonce replay protection works
- [ ] Staff bypass works (free access)
- [ ] Pro role discount works (50% off)
- [ ] Sui right verification works (premium tier)
- [ ] R2 serving works with observable metrics
- [ ] D1 usage logging works
- [ ] SignalsDO WebSocket streaming works

## References

- **Architecture**: `/home/user/one/one/things/plans/x402-payment-system.md`
- **Implementation Plan**: `/home/user/one/one/things/plans/x402-100-cycle-implementation.md`
- **ONE Platform**: `/home/user/one/CLAUDE.md`
- **6D Ontology**: `/home/user/one/one/knowledge/ontology.md`

---

**Built with:** Hono + Cloudflare Workers + x402 + 6-Dimension Ontology
**Status:** Cycles 11-20 complete ✅
