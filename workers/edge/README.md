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

**Cycles 21-30: Offer Management** (Next)
- [ ] Offer loading (KV → Convex → R2)
- [ ] Role-based pricing (Better Auth)
- [ ] Dynamic pricing (surge)
- [ ] JSON-LD offers

**Cycles 31-40: Sui Rights** (Next)
- [ ] Sui RPC client
- [ ] Rights caching
- [ ] Premium tier enforcement

**Cycles 41-50: R2 Storage** (Next)
- [ ] Pack generation scripts
- [ ] R2 upload
- [ ] Streaming large files

**Cycles 51-60: D1 Logging** (Next)
- [ ] Usage event writer
- [ ] Observable metrics aggregation
- [ ] Analytics queries

**Cycles 61-70: Convex Backend** (Next)
- [ ] Schema update (offers, grants, usage_events)
- [ ] Offer management functions
- [ ] Authorization service
- [ ] Analytics dashboard

**Cycles 71-80: Durable Objects** (Next)
- [ ] SignalsDO implementation
- [ ] WebSocket accept/broadcast
- [ ] Rate limiting
- [ ] Signal generation

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

1. Implement Cycles 21-30 (Offer Management)
2. Implement Cycles 31-40 (Sui Rights)
3. Implement Cycles 41-50 (R2 Storage)
4. Implement Cycles 51-60 (D1 Logging)
5. Implement Cycles 61-70 (Convex Backend)
6. Implement Cycles 71-80 (Durable Objects)
7. Deploy to staging
8. Test end-to-end
9. Deploy to production
10. Announce to agent developers

## References

- **Architecture**: `/home/user/one/one/things/plans/x402-payment-system.md`
- **Implementation Plan**: `/home/user/one/one/things/plans/x402-100-cycle-implementation.md`
- **ONE Platform**: `/home/user/one/CLAUDE.md`
- **6D Ontology**: `/home/user/one/one/knowledge/ontology.md`

---

**Built with:** Hono + Cloudflare Workers + x402 + 6-Dimension Ontology
**Status:** Cycles 11-20 complete ✅
