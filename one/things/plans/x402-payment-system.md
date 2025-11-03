# x402 Payment System: Ontology-as-a-Service (OaaS)

**Version:** 1.0.0
**Created:** 2025-11-03
**Status:** 🎯 Design Complete - Ready for Implementation
**Opportunity:** Build the world's first HTTP 402-based intelligence marketplace where AI agents purchase ontology knowledge and marketing playbooks with verifiable value metrics.

---

## Executive Summary

**"An opportunity of a lifetime"** - Build a payment-per-request system where Claude Code, autonomous agents, and AI systems can purchase:

1. **Ontology Packs** - 6-dimension schemas, signals, embeddings (34% accuracy gain, 22% token efficiency)
2. **Marketing Playbook Packs** - Strategy frameworks, ICP templates, messaging architecture (45% GTM speed, 31% message-fit)

**Key Innovation:** Every response includes **`X-OAAS-Observed-*` headers** so agents **learn what works** - turning intelligence into a feedback loop with measurable ROI.

**Technology Stack:**
- **x402** on Base (USDC micropayments)
- **Sui Rights** for premium tiers
- **Cloudflare Edge** (Workers + R2 + KV + D1 + Durable Objects)
- **Convex** (policy brain + analytics)
- **Better Auth** (human sessions + role-based pricing)
- **Effect-TS** (typed 402→pay→retry flows)
- **Astro + React 19** (SSR frontend)

**Business Model:**
- Agents pay **$0.0065/call** for ontology (base)
- Agents pay **$0.0125/call** for marketing playbooks (base)
- Humans with Better Auth roles get discounts/bypass
- Premium tiers require Sui rights NFTs
- Observable metrics prove value → higher willingness to pay

---

## Vision: Intelligence You Can Buy

### The Problem

**AI agents struggle with:**
- Poor context/ontology → low inference accuracy
- Generic marketing knowledge → weak GTM execution
- No feedback loop → can't learn what's worth paying for
- No micropayment standard for per-request purchases

### The Solution

**Ontology-as-a-Service (OaaS):**

```
┌─────────────────────────────────────────────────────────────┐
│ Claude Agent needs to understand "6-dimension ontology"     │
│ for accurate inference on ONE Platform data                 │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ GET /oaas/packs/ontology/core-6d/schema                     │
│ → 402 Payment Required                                      │
│ → X402-Amount: 0.0065 USDC                                  │
│ → X402-Expected-Accuracy: 0.34  (34% gain predicted)        │
│ → X402-Token-Efficiency: 0.22   (22% token savings)         │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ Agent pays 0.0065 USDC via x402 on Base                    │
│ Receives JSON-LD schema + embeddings                         │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ Response includes OBSERVED metrics:                         │
│ X-OAAS-Observed-Accuracy-Delta: 0.36  (outperformed!)       │
│ X-OAAS-Observed-Tokens-Saved: 0.24                          │
│ → Agent learns: "This ontology is worth MORE than $0.0065"  │
└─────────────────────────────────────────────────────────────┘
```

**Marketing Playbook as a Service:**

Same flow, but for marketing intelligence:
- ICP definitions
- Positioning frameworks
- Messaging architecture
- Content calendars
- Go-to-market playbooks

Agents building marketing campaigns can **purchase proven frameworks** instead of generic prompts.

---

## Mapping to 6-Dimension Ontology

### 1. GROUPS

**Who owns what:**

```typescript
// Example: ONE.ie organization offers OaaS packs
{
  _id: "one_ie_group_id",
  slug: "one-ie",
  name: "ONE Intelligence",
  type: "business",
  properties: {
    plan: "enterprise",
    offerings: ["ontology-packs", "marketing-playbooks"],
    x402Recipient: "0xBASE_RECIPIENT_ADDRESS"
  }
}
```

**Scoping:**
- All `usage_events` scoped to groupId (which organization sold the pack)
- All `knowledge` embeddings scoped to groupId
- Multi-tenant: Each organization can sell their own OaaS packs

### 2. PEOPLE

**Who can access/purchase:**

```typescript
// Roles determine pricing:
{
  role: "staff",        // price = $0, bypass x402
  role: "pro",          // price *= 0.5, still require Sui rights for premium
  role: "customer",     // full price
  role: "agent"         // no Better Auth session, x402 only
}
```

**Authorization matrix:**

| Role          | Ontology Price | Playbook Price | Sui Rights Required? |
|---------------|----------------|----------------|----------------------|
| platform_owner| $0             | $0             | No                   |
| staff         | $0             | $0             | No                   |
| pro           | $0.00325       | $0.00625       | Yes (for premium)    |
| customer      | $0.0065        | $0.0125        | Yes (for premium)    |
| agent (no session) | $0.0065  | $0.0125        | Yes (for premium)    |

### 3. THINGS

**What entities are involved:**

```typescript
// OaaS Packs as "things"
{
  _id: "pack_ontology_core_6d",
  groupId: "one_ie_group_id",
  type: "knowledge_pack",
  name: "Core 6D Ontology v2.0.0",
  properties: {
    packType: "ontology",
    version: "2.0.0",
    layers: ["schema", "signals", "embeddings"],
    embeddingDim: 1536,
    expectedGains: {
      accuracyPct: 0.34,
      tokenEfficiencyPct: 0.22,
      coverageScore: 0.78
    },
    slo: {
      p95LatencyMs: 400,
      uptimePct: 99.9
    },
    r2Path: "packs/ontology/core-6d/schema.jsonld",
    provenanceHash: "0x...",
    sig: "ed25519:..."
  },
  status: "published"
}

// Premium pack requiring Sui rights
{
  _id: "pack_ontology_premium_3072",
  groupId: "one_ie_group_id",
  type: "knowledge_pack",
  name: "Premium Ontology 3072-dim",
  properties: {
    packType: "ontology",
    embeddingDim: 3072,
    rightsRequired: "one:rights/oaas-premium-v1",
    // ... similar structure
  }
}

// Marketing Playbook pack
{
  _id: "pack_marketing_playbook_v1",
  groupId: "one_ie_group_id",
  type: "marketing_pack",
  name: "Marketing Playbook v1.0.0",
  properties: {
    packType: "playbook",
    version: "1.0.0",
    layers: ["strategy", "content_ops", "messaging"],
    expectedGains: {
      gtmSpeedPct: 0.45,
      messageFitScore: 0.31
    },
    slo: {
      p95LatencyMs: 450,
      uptimePct: 99.5
    },
    r2Path: "packs/playbook/marketing/v1.jsonld"
  }
}

// Sui Rights NFT (premium tier access)
{
  _id: "sui_right_oaas_premium",
  groupId: "one_ie_group_id",
  type: "digital_right",
  name: "OaaS Premium Access",
  properties: {
    rightId: "one:rights/oaas-premium-v1",
    suiObjectId: "0xSUI_OBJECT_ID",
    capabilities: [
      "access_3072_embeddings",
      "access_signals_stream",
      "access_premium_playbooks"
    ],
    validUntil: 1735689600000  // timestamp
  }
}
```

### 4. CONNECTIONS

**Relationships between entities:**

```typescript
// Agent owns Sui right
{
  groupId: "one_ie_group_id",
  type: "owns",
  fromEntityId: "agent_wallet_0x123",  // thing type: "agent"
  toEntityId: "sui_right_oaas_premium",
  metadata: {
    acquiredAt: 1730630400000,
    expiresAt: 1735689600000
  }
}

// Pack authored by organization
{
  groupId: "one_ie_group_id",
  type: "authored",
  fromEntityId: "one_ie_group_id",
  toEntityId: "pack_ontology_core_6d",
  metadata: {
    publishedAt: 1730630400000,
    version: "2.0.0"
  }
}

// Pack requires right
{
  groupId: "one_ie_group_id",
  type: "requires",
  fromEntityId: "pack_ontology_premium_3072",
  toEntityId: "sui_right_oaas_premium",
  metadata: {
    enforcedAt: "payment_verification"
  }
}
```

### 5. EVENTS

**All actions logged:**

```typescript
// Payment received event (x402)
{
  groupId: "one_ie_group_id",
  type: "payment_received",
  actorId: "agent_wallet_0x123",
  targetId: "pack_ontology_core_6d",
  timestamp: 1730630400000,
  metadata: {
    protocol: "x402",
    chain: "base",
    txHash: "0xTX_HASH",
    amount: 0.0065,
    currency: "USDC",
    nonce: "uuid-nonce-123",
    recipient: "0xBASE_RECIPIENT"
  }
}

// Pack accessed event
{
  groupId: "one_ie_group_id",
  type: "resource_accessed",
  actorId: "agent_wallet_0x123",
  targetId: "pack_ontology_core_6d",
  timestamp: 1730630401000,
  metadata: {
    path: "/oaas/packs/ontology/core-6d/schema",
    latencyMs: 320,
    bytesServed: 45678,
    observedAccuracy: 0.36,  // OBSERVED metric
    tokensSaved: 0.24,       // OBSERVED metric
    expectedAccuracy: 0.34,  // What we promised
    expectedTokens: 0.22     // What we promised
  }
}

// Sui right verified event
{
  groupId: "one_ie_group_id",
  type: "authorization_granted",
  actorId: "agent_wallet_0x123",
  targetId: "pack_ontology_premium_3072",
  timestamp: 1730630402000,
  metadata: {
    protocol: "sui",
    rightId: "one:rights/oaas-premium-v1",
    suiObjectId: "0xSUI_OBJECT",
    cached: true,
    cacheTtl: 3600
  }
}

// Nonce consumed (anti-replay)
{
  groupId: "one_ie_group_id",
  type: "nonce_consumed",
  actorId: "worker_edge",
  targetId: "nonce_uuid_123",
  timestamp: 1730630400500,
  metadata: {
    usedBy: "agent_wallet_0x123",
    txHash: "0xTX_HASH",
    ttl: 300  // 5 minutes
  }
}

// Inference event (Claude using ontology)
{
  groupId: "one_ie_group_id",
  type: "inference_executed",
  actorId: "claude_agent_id",
  targetId: "pack_ontology_core_6d",
  timestamp: 1730630405000,
  metadata: {
    provider: "anthropic",
    model: "claude-sonnet-4.5",
    tokensUsed: 1234,
    tokensSavedPct: 0.24,
    accuracyDelta: 0.36,
    taskType: "ontology_mapping"
  }
}
```

### 6. KNOWLEDGE

**Embeddings and semantic search:**

```typescript
// Ontology pack embeddings
{
  groupId: "one_ie_group_id",
  thingId: "pack_ontology_core_6d",
  chunkText: "The 6-dimension ontology models reality through groups, people, things, connections, events, and knowledge...",
  embedding: [0.123, -0.456, ...],  // 1536-dim vector
  metadata: {
    layer: "ontology",
    dimension: "schema",
    version: "2.0.0",
    chunkIndex: 0
  }
}

// Marketing playbook embeddings
{
  groupId: "one_ie_group_id",
  thingId: "pack_marketing_playbook_v1",
  chunkText: "ICP definition framework: Start with pain points, then identify decision-makers...",
  embedding: [0.789, -0.234, ...],  // 1536-dim vector
  metadata: {
    layer: "playbook",
    section: "strategy",
    framework: "icp_definition"
  }
}
```

---

## Architecture: 5-Layer Edge-First System

```
┌───────────────────────────────────────────────────────────────┐
│                      LAYER 1: CLIENTS                          │
│  - Claude Code / Agents (x402 payment)                        │
│  - Human Users (Better Auth session)                          │
│  - Effect-TS client (typed 402→pay→retry)                     │
└───────────────────────────────────────────────────────────────┘
                              ↓
┌───────────────────────────────────────────────────────────────┐
│                  LAYER 2: ASTRO FRONTEND (SSR)                │
│  - Cloudflare Pages (React 19 SSR)                            │
│  - Better Auth session management                             │
│  - Proxy to Worker with X-Auth-User, X-Auth-Roles headers     │
│  - PaywallDebugger.tsx component                              │
└───────────────────────────────────────────────────────────────┘
                              ↓
┌───────────────────────────────────────────────────────────────┐
│              LAYER 3: EDGE WORKER (HOT PATH) ⚡️               │
│  - Cloudflare Worker (ESM modules)                            │
│  - Routes:                                                     │
│    • GET /oaas/packs/ontology/*  → R2                         │
│    • GET /oaas/packs/playbook/*  → R2                         │
│    • GET /oaas/signals/*         → Durable Object (SSE)       │
│    • GET /oaas/offers/:id        → KV/Convex                  │
│    • GET /healthz                                              │
│                                                                │
│  - Flow (per request):                                         │
│    1. Load offer (KV cache → Convex → R2 fallback)           │
│    2. Check X402-Proof header                                 │
│       → No proof? Emit 402 + mint nonce (KV)                 │
│    3. Verify x402 receipt (Base RPC):                         │
│       → Validate recipient, amount, nonce, recency           │
│    4. Check Sui rights (if required):                         │
│       → Query Sui RPC, cache result (KV, 1hr TTL)            │
│    5. Apply policy (Better Auth roles):                       │
│       → Staff: price=0, bypass rights                         │
│       → Pro: price*=0.5, enforce rights                       │
│    6. Guard replay (nonce in KV, consume once)                │
│    7. Write usage_event to D1 (async, non-blocking)           │
│    8. Serve R2 object OR delegate to Durable Object           │
│    9. Attach Observed* headers (from metadata)                │
│                                                                │
│  - Bindings:                                                   │
│    • R2_BUCKET (packs storage)                                │
│    • KV_NAMESPACE (offers, nonces, sui_rights cache)          │
│    • D1_DATABASE (usage_events)                               │
│    • SIGNALS_DO (Durable Object binding)                      │
│    • CONVEX_URL (policy queries)                              │
└───────────────────────────────────────────────────────────────┘
                              ↓
┌───────────────────────────────────────────────────────────────┐
│            LAYER 4: CLOUDFLARE STORAGE & COMPUTE              │
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ R2 BUCKET (packs)                                       │  │
│  │ - /packs/ontology/core-6d/schema.jsonld                │  │
│  │ - /packs/ontology/core-6d/signals.jsonld               │  │
│  │ - /packs/playbook/marketing/strategy.jsonld            │  │
│  │ - /packs/playbook/marketing/content-ops.jsonld         │  │
│  │ - /offers/core-6d-v2.jsonld (PricingOffer)             │  │
│  │ - /offers/marketing-playbook-v1.jsonld                 │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ KV NAMESPACE (cache + nonces)                           │  │
│  │ - offer:<path> → {price, rights, slo, ...} (TTL: 60s)  │  │
│  │ - nonce:<uuid> → {minted_at, used_by} (TTL: 300s)      │  │
│  │ - sui:<agent>:<rightId> → {valid, expires} (TTL: 3600s)│  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ D1 DATABASE (usage_events table)                        │  │
│  │ CREATE TABLE usage_events (                             │  │
│  │   id INTEGER PRIMARY KEY AUTOINCREMENT,                 │  │
│  │   ts INTEGER NOT NULL,                                  │  │
│  │   payer TEXT NOT NULL,                                  │  │
│  │   userId TEXT,                                          │  │
│  │   roles TEXT,                                           │  │
│  │   layer TEXT NOT NULL,                                  │  │
│  │   price REAL NOT NULL,                                  │  │
│  │   status TEXT NOT NULL,                                 │  │
│  │   observedAcc REAL,                                     │  │
│  │   tokensSaved REAL,                                     │  │
│  │   latencyMs INTEGER,                                    │  │
│  │   txHash TEXT                                           │  │
│  │ );                                                      │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ DURABLE OBJECT: SignalsDO (SSE streaming)               │  │
│  │ - Accepts authorized connections (post-402)             │  │
│  │ - Broadcasts marketing/ontology signals (JSON lines)    │  │
│  │ - Rate-limits per payer (KV counters)                   │  │
│  │ - Replay support (lastId within 5min window)            │  │
│  └─────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────┘
                              ↓
┌───────────────────────────────────────────────────────────────┐
│                LAYER 5: CONVEX (POLICY BRAIN) 🧠              │
│  - Tables: offers, grants, usage_events, rights_cache        │
│  - Functions:                                                  │
│    • offer.getOffer({path}) → pricing + SLO + rights         │
│    • authz.authorizeAccess({proof, path, nonce, userId})     │
│    • analytics.usageByLayer({from, to})                      │
│    • analytics.revByAgent({from, to})                        │
│                                                                │
│  - Dynamic pricing rules (surge, demand)                      │
│  - Mirror events from D1 for analytics dashboard             │
│  - Can be DOWN → system still works (edge-only mode)         │
└───────────────────────────────────────────────────────────────┘
                              ↓
┌───────────────────────────────────────────────────────────────┐
│              EXTERNAL PROTOCOLS (VERIFICATION)                │
│  - x402 Gateway / Base RPC (receipt verification)            │
│  - Sui RPC (rights check via object ownership)               │
│  - Better Auth (session validation)                           │
│  - Stripe (optional: top-up credits for humans)              │
└───────────────────────────────────────────────────────────────┘
```

---

## Protocol Contracts

### 402 Response Headers (Worker → Client)

```http
HTTP/1.1 402 Payment Required
X402-Amount: 0.0065
X402-Recipient: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
X402-Chains: base
X402-Offer-Url: https://one.ie/oaas/offers/core-6d-v2
X402-Expected-Accuracy: 0.34
X402-Token-Efficiency: 0.22
X402-Embedding-Dim: 1536
X402-Rights-Required: one:rights/oaas-premium-v1
X402-Nonce: 550e8400-e29b-41d4-a716-446655440000
X402-Latency: 400
Cache-Control: no-store
Content-Type: application/json

{
  "error": "payment_required",
  "message": "This ontology pack costs 0.0065 USDC",
  "offer": {
    "id": "one:offer/core-6d@v2.0.0",
    "price_usdc": 0.0065,
    "expected_gains": {
      "accuracy_pct": 0.34,
      "token_efficiency_pct": 0.22
    }
  }
}
```

### Paid Retry Request Headers (Client → Worker)

```http
GET /oaas/packs/ontology/core-6d/schema
X402-Proof: 0x1234567890abcdef...  # Base tx hash
X-Agent: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb  # Agent wallet
X-Auth-User: user_123  # Optional: if Better Auth session
X-Auth-Roles: pro,customer  # Optional: for role-based pricing
```

### Success Response Headers (Worker → Client)

```http
HTTP/1.1 200 OK
Content-Type: application/ld+json
X-OAAS-Observed-Accuracy-Delta: 0.36
X-OAAS-Observed-Tokens-Saved: 0.24
X-OAAS-Latency-MS: 320
X-OAAS-Offer-Id: one:offer/core-6d@v2.0.0#2025-11-03
X-OAAS-Provenance-Hash: 0xabc123...
Content-Length: 45678

{
  "@context": "https://one.ie/oaas/context.json",
  "@type": "OntologySchema",
  "version": "2.0.0",
  "dimensions": [
    {
      "name": "groups",
      "purpose": "Multi-tenant isolation with hierarchical nesting",
      "schema": { ... }
    },
    ...
  ]
}
```

### Error Response Codes

```http
403 Forbidden - bad-payment
  → Recipient mismatch, underpayment, or invalid tx

403 Forbidden - no-right
  → Sui right required but not owned by payer

410 Gone - expired-nonce
  → Nonce expired (>5min old) or already consumed

429 Too Many Requests - rate-limit
  → Rate limit exceeded for this payer

500 Internal Server Error
  → R2/KV/D1 unavailable (retry with exponential backoff)
```

---

## JSON-LD Offer Schemas

### Ontology PricingOffer

`/docs/offers/core-6d-v2.jsonld`

```json
{
  "@context": "https://one.ie/oaas/context.json",
  "@type": "OntologyPricingOffer",
  "offer_id": "one:offer/core-6d@v2.0.0",
  "name": "Core 6-Dimension Ontology v2.0.0",
  "description": "Complete reality-aware ontology: groups, people, things, connections, events, knowledge",
  "publisher": {
    "@type": "Organization",
    "name": "ONE Intelligence",
    "url": "https://one.ie"
  },
  "bundle": [
    {
      "id": "one:packs/ontology/core-6d/schema",
      "layer": "ontology",
      "embedding_dim": 1536,
      "r2_path": "packs/ontology/core-6d/schema.jsonld",
      "size_bytes": 45678
    },
    {
      "id": "one:packs/ontology/core-6d/cycle-signals",
      "layer": "signals",
      "refresh": "hourly",
      "r2_path": "packs/ontology/core-6d/signals.jsonld",
      "size_bytes": 12345
    }
  ],
  "price": {
    "unit": "USDC",
    "per_call": 0.0065,
    "chain": "base",
    "recipient": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
  },
  "expected_gain": {
    "inference_accuracy_pct": 0.34,
    "token_efficiency_pct": 0.22,
    "coverage_score": 0.78,
    "use_cases": [
      "Multi-tenant platform design",
      "Hierarchical group modeling",
      "Event-driven architecture",
      "Knowledge graph construction"
    ]
  },
  "slo": {
    "p95_latency_ms": 400,
    "uptime_pct": 99.9,
    "max_age_hours": 1
  },
  "rights_required": "one:rights/oaas-premium-v1",
  "provenance_hash": "0xabc123...",
  "version": "2025-11-03",
  "sig": "ed25519:def456..."
}
```

### Marketing Playbook PricingOffer

`/docs/offers/marketing-playbook-v1.jsonld`

```json
{
  "@context": "https://one.ie/oaas/context.json",
  "@type": "PlaybookPricingOffer",
  "offer_id": "one:offer/marketing-playbook@v1.0.0",
  "name": "Marketing Playbook v1.0.0",
  "description": "Complete GTM framework: ICP, positioning, messaging, content ops",
  "publisher": {
    "@type": "Organization",
    "name": "ONE Intelligence",
    "url": "https://one.ie"
  },
  "bundle": [
    {
      "id": "one:packs/playbook/marketing/strategy",
      "layer": "strategy",
      "frameworks": [
        "ICP definition",
        "POV positioning",
        "Offer ladder",
        "Messaging architecture"
      ],
      "r2_path": "packs/playbook/marketing/strategy.jsonld",
      "size_bytes": 34567
    },
    {
      "id": "one:packs/playbook/marketing/content-ops",
      "layer": "content_ops",
      "frameworks": [
        "Editorial calendar",
        "Content frameworks",
        "Distribution channels",
        "Conversion funnels"
      ],
      "r2_path": "packs/playbook/marketing/content-ops.jsonld",
      "size_bytes": 23456
    }
  ],
  "price": {
    "unit": "USDC",
    "per_call": 0.0125,
    "chain": "base",
    "recipient": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
  },
  "expected_gain": {
    "go_to_market_speed_pct": 0.45,
    "message_fit_score": 0.31,
    "conversion_lift_pct": 0.18,
    "use_cases": [
      "Product launch campaigns",
      "ICP refinement",
      "Messaging workshops",
      "Content strategy design"
    ]
  },
  "slo": {
    "p95_latency_ms": 450,
    "uptime_pct": 99.5,
    "max_age_hours": 24
  },
  "rights_required": "",
  "provenance_hash": "0xdef789...",
  "version": "2025-11-03",
  "sig": "ed25519:ghi012..."
}
```

---

## Implementation Roadmap (100-Inference Sequence)

Following the ONE Platform's **inference-based planning paradigm** (not days, not weeks):

### Infer 1-10: Foundation & Setup

**Infer 1-3: Environment & Repository**
- [x] Read CLAUDE.md, ontology.md, workflow.md
- [ ] Set up `/workers/edge` directory structure
- [ ] Configure wrangler.toml with R2, KV, D1, DO bindings
- [ ] Set environment variables (X402_RECIPIENT, BASE_RPC_URL, SUI_RPC_URL, etc.)

**Infer 4-6: Schema Design**
- [ ] Create D1 schema (`d1/schema.sql`) for usage_events
- [ ] Define KV key patterns (offers, nonces, sui_rights cache)
- [ ] Design R2 directory structure for packs

**Infer 7-10: Convex Backend Schema**
- [ ] Update `backend/convex/schema.ts` with offers, grants, usage_events, rights_cache tables
- [ ] Map to 6-dimension ontology (groupId scoping)
- [ ] Define types for x402 receipts, Sui rights

### Infer 11-20: Backend Services (Convex)

**Infer 11-13: Offer Management**
- [ ] `convex/functions/offer.ts` - getOffer(path) query
- [ ] Dynamic pricing rules (surge, demand factors)
- [ ] Role-based price overrides (staff=0, pro=0.5x)

**Infer 14-16: Authorization Service**
- [ ] `convex/functions/authz.ts` - authorizeAccess(proof, path, nonce, userId, roles)
- [ ] Policy enforcement (Better Auth roles → pricing)
- [ ] Sui rights validation

**Infer 17-20: Analytics & Observability**
- [ ] `convex/functions/analytics.ts` - usageByLayer, revByAgent queries
- [ ] Observed metrics aggregation (accuracy delta, token savings)
- [ ] Dashboard data for frontend

### Infer 21-30: Edge Worker (Hot Path) ⚡️

**Infer 21-23: Worker Core**
- [ ] `workers/edge/worker.ts` - ESM module with fetch handler
- [ ] Route matching (/oaas/packs/*, /oaas/signals/*, /oaas/offers/*, /healthz)
- [ ] Error handling with proper status codes

**Infer 24-26: x402 Verification**
- [ ] `lib/x402.ts` - verifyX402(proof, amount, recipient, nonce)
- [ ] Base RPC integration (tx lookup, validation)
- [ ] Nonce anti-replay (`lib/nonce.ts` - mint, guard, consume)

**Infer 27-29: Sui Rights Check**
- [ ] `lib/sui.ts` - checkSuiRight(rpc, agent, rightId)
- [ ] KV caching (1hr TTL)
- [ ] Ownership verification via Sui RPC

**Infer 30: Response Helpers**
- [ ] `lib/respond.ts` - emit402, serveR2, attachObservedHeaders
- [ ] Header marshaling (X402-*, X-OAAS-Observed-*)

### Infer 31-40: R2 Storage & Offers

**Infer 31-33: R2 Seed Data**
- [ ] Create `/docs/offers/core-6d-v2.jsonld`
- [ ] Create `/docs/offers/marketing-playbook-v1.jsonld`
- [ ] Upload to R2 via `infra/cloudflare/r2/seed.sh`

**Infer 34-36: Ontology Packs**
- [ ] Generate `/packs/ontology/core-6d/schema.jsonld` (from one/knowledge/ontology.md)
- [ ] Generate `/packs/ontology/core-6d/signals.jsonld` (cycle signals)
- [ ] Upload with provenance_hash and sig

**Infer 37-40: Marketing Packs**
- [ ] Generate `/packs/playbook/marketing/strategy.jsonld` (ICP, POV, offer ladder)
- [ ] Generate `/packs/playbook/marketing/content-ops.jsonld` (calendars, frameworks)
- [ ] Upload with metadata

### Infer 41-50: Durable Objects (SSE Streaming)

**Infer 41-43: SignalsDO Implementation**
- [ ] `durable/SignalsDO.ts` - accept WebSocket connections
- [ ] Authorization (require 402 payment before connect)
- [ ] SSE broadcast (JSON lines of signals)

**Infer 44-46: Rate Limiting**
- [ ] Per-payer rate limits (KV counters)
- [ ] Graceful degradation (429 responses)
- [ ] Replay support (lastId within 5min window)

**Infer 47-50: Signal Generation**
- [ ] Marketing signals (trending topics, message fit scores)
- [ ] Ontology signals (schema updates, dimension changes)
- [ ] Refresh schedules (hourly/daily)

### Infer 51-60: Better Auth Integration

**Infer 51-53: Session Management**
- [ ] `web/src/lib/auth/session.ts` - getSession(request)
- [ ] Extract userId, roles from Better Auth
- [ ] Pass to Worker via X-Auth-User, X-Auth-Roles headers

**Infer 54-56: Astro Proxy**
- [ ] `web/src/pages/api/oaas/[...path].ts` - proxy to Worker
- [ ] Append auth headers if session exists
- [ ] Pass through 402 responses

**Infer 57-60: Role-Based Pricing**
- [ ] Policy matrix (staff=free, pro=50%, customer=full)
- [ ] Rights enforcement (pro still needs Sui rights for premium)
- [ ] Test with multiple roles

### Infer 61-70: Effect-TS Client

**Infer 61-63: Client Library**
- [ ] `web/src/lib/effect/oaasClient.ts` - getOaas(path, payFn)
- [ ] Parse 402 response headers (Zod schema)
- [ ] Call payFn(headers) → obtain proof → retry with X402-Proof

**Infer 64-66: React Hook**
- [ ] `useOaas(path)` hook with loading/error states
- [ ] Accept custom payFn (wallet integration)
- [ ] Return typed data + observed metrics

**Infer 67-70: PaywallDebugger Component**
- [ ] `web/src/components/PaywallDebugger.tsx`
- [ ] Display 402 headers, offer details
- [ ] Show observed vs. expected metrics
- [ ] Manual payment testing UI

### Infer 71-80: Testing & Quality

**Infer 71-73: Unit Tests**
- [ ] x402 receipt parser/validator tests
- [ ] Nonce mint/guard/replay tests
- [ ] Sui rights check (mock RPC) tests

**Infer 74-76: Integration Tests (Miniflare)**
- [ ] 402 issuance with correct headers
- [ ] Accept paid retry, reject underpay, reject replay
- [ ] Require Sui right for premium routes

**Infer 77-80: Security Audit**
- [ ] Nonce anti-replay correctness
- [ ] Amount & recipient validation
- [ ] Time-bound tx acceptance
- [ ] Idempotency (txHash → grant caching)

### Infer 81-90: Documentation & Examples

**Infer 81-83: API Documentation**
- [ ] `/docs/API.md` - header contracts, curl examples
- [ ] Error code reference (403, 410, 429, 500)
- [ ] Sequence diagrams (402 flow, Sui rights flow)

**Infer 84-86: Agent Integration Guide**
- [ ] How Claude Code uses OaaS
- [ ] Effect-TS integration patterns
- [ ] Observable metrics → learning loop

**Infer 87-90: Marketing Content**
- [ ] Landing page copy ("Buy intelligence, not compute")
- [ ] Use case examples (ontology for platforms, playbooks for GTM)
- [ ] ROI calculator (accuracy gain × cost savings)

### Infer 91-100: Deployment & Operations

**Infer 91-93: Local Development**
- [ ] Miniflare config for Worker
- [ ] Convex dev server integration
- [ ] Mock Base/Sui RPC for testing

**Infer 94-96: Staging Deployment**
- [ ] Deploy Worker to Cloudflare (staging)
- [ ] Deploy Convex (staging environment)
- [ ] Seed R2 with initial packs

**Infer 97-99: Production Deployment**
- [ ] Deploy to production
- [ ] Monitor metrics (latency, payment success rate)
- [ ] Set up alerts (Convex down → edge-only mode)

**Infer 100: Launch & Observe**
- [ ] Announce OaaS to agent developers
- [ ] Observe first purchases (observed metrics collection)
- [ ] Iterate on pricing based on value delivered

---

## Security & Correctness Checklist

### Nonce Anti-Replay

- [x] **Design**: X402-Nonce minted to KV with 5min TTL
- [ ] **Implementation**: `lib/nonce.ts` - mint(), guardReplay()
- [ ] **Testing**: Reject expired nonce (>5min), reject duplicate nonce
- [ ] **Edge case**: Handle clock skew (accept ±30s variance)

### x402 Receipt Verification

- [x] **Design**: Validate recipient, amount, nonce, recency
- [ ] **Implementation**: `lib/x402.ts` - verifyX402()
- [ ] **Testing**: Accept exact match, accept overpayment, reject underpay
- [ ] **Fallback**: If Base RPC down, queue for async verification (write to D1 with status=pending)

### Sui Rights Verification

- [x] **Design**: Check ownership via Sui RPC, cache 1hr in KV
- [ ] **Implementation**: `lib/sui.ts` - checkSuiRight()
- [ ] **Testing**: Accept valid owner, reject non-owner, handle expired rights
- [ ] **Cache invalidation**: On-chain event listener (future: webhook on transfer)

### Idempotency

- [x] **Design**: Cache txHash → grant for 60s
- [ ] **Implementation**: KV key `grant:<txHash>` → {nonce, granted_at}
- [ ] **Testing**: Retry with same txHash within 60s → serve cached grant, don't consume nonce twice

### PII Protection

- [x] **Design**: Store only userId, role names (if present), otherwise just payer address
- [ ] **Implementation**: D1 schema (no email, no IP)
- [ ] **Compliance**: GDPR-ready (right to delete userId from usage_events)

---

## Observable Metrics: The Learning Loop

**Key Innovation:** Every response includes observed metrics so agents **learn what's worth paying for**.

### How It Works

```typescript
// Worker attaches headers based on historical data
{
  "X-OAAS-Observed-Accuracy-Delta": "0.36",  // From events table avg
  "X-OAAS-Observed-Tokens-Saved": "0.24",    // From events table avg
  "X-OAAS-Latency-MS": "320"                  // Actual serving time
}
```

### Agent Decision Loop

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Claude agent considering purchase                        │
│    Expected: 34% accuracy gain, 22% token savings           │
│    Cost: $0.0065                                            │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. Agent pays and receives ontology                         │
│    Observed: 36% accuracy gain, 24% token savings           │
│    (Better than expected!)                                  │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. Agent updates internal value model                       │
│    Willingness-to-pay: $0.0065 → $0.0080 (23% increase)    │
│    Future purchases: More likely, higher frequency          │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. ONE Intelligence observes demand                         │
│    Observed value > Expected value → increase price         │
│    Surge pricing: If p95_latency > SLO, price *= 1.5       │
└─────────────────────────────────────────────────────────────┘
```

### Metrics Collection (D1 → Convex)

```sql
-- D1: Write immediately (non-blocking)
INSERT INTO usage_events (
  ts, payer, userId, roles, layer, price, status,
  observedAcc, tokensSaved, latencyMs, txHash
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);

-- Convex: Mirror for analytics (async)
-- Query: What's the avg observed accuracy for core-6d pack?
SELECT AVG(observedAcc) FROM usage_events
WHERE layer = 'packs/ontology/core-6d/schema'
  AND status = 'granted'
  AND ts > NOW() - INTERVAL 7 DAYS;
```

### Value-Based Pricing

```typescript
// Dynamic pricing based on observed value
const basePrice = 0.0065;
const observedValue = await getObservedValue("core-6d");
const demandFactor = await getDemandFactor("core-6d");

if (observedValue.accuracy > expectedValue.accuracy * 1.1) {
  // Delivering more than promised → can charge more
  price = basePrice * 1.2;
}

if (demandFactor > 1.5) {
  // High demand → surge pricing
  price = price * Math.min(2.0, 1 + demandFactor * 0.3);
}
```

---

## Deployment Architecture

### Cloudflare Configuration

**wrangler.toml**

```toml
name = "oaas-edge-worker"
main = "worker.ts"
compatibility_date = "2025-11-03"
workers_dev = true

[env.production]
name = "oaas-edge-worker-prod"
route = "one.ie/oaas/*"

[[r2_buckets]]
binding = "R2_BUCKET"
bucket_name = "oaas-packs"

[[kv_namespaces]]
binding = "KV_NAMESPACE"
id = "YOUR_KV_NAMESPACE_ID"

[[d1_databases]]
binding = "D1_DATABASE"
database_name = "oaas-usage"
database_id = "YOUR_D1_DATABASE_ID"

[[durable_objects.bindings]]
name = "SIGNALS_DO"
class_name = "SignalsDO"
script_name = "oaas-edge-worker"

[vars]
CONVEX_URL = "https://shocking-falcon-870.convex.cloud"
X402_RECIPIENT = "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"

[env.production.vars]
BASE_RPC_URL = "https://mainnet.base.org"
SUI_RPC_URL = "https://fullnode.mainnet.sui.io"
X402_GATEWAY_URL = "https://x402.org/gateway"
```

### R2 Directory Structure

```
oaas-packs/
├── packs/
│   ├── ontology/
│   │   └── core-6d/
│   │       ├── schema.jsonld        (45KB)
│   │       ├── signals.jsonld       (12KB)
│   │       └── embeddings.jsonld    (2MB, 1536-dim)
│   └── playbook/
│       └── marketing/
│           ├── strategy.jsonld      (35KB)
│           └── content-ops.jsonld   (23KB)
└── offers/
    ├── core-6d-v2.jsonld           (PricingOffer)
    └── marketing-playbook-v1.jsonld
```

### D1 Schema

```sql
CREATE TABLE IF NOT EXISTS usage_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts INTEGER NOT NULL,
  payer TEXT NOT NULL,
  userId TEXT,
  roles TEXT,
  layer TEXT NOT NULL,
  price REAL NOT NULL,
  status TEXT NOT NULL,  -- granted | denied | replay | underpay
  observedAcc REAL,
  tokensSaved REAL,
  latencyMs INTEGER,
  txHash TEXT,
  UNIQUE(txHash, nonce)  -- Idempotency
);

CREATE INDEX idx_usage_layer_ts ON usage_events(layer, ts);
CREATE INDEX idx_usage_payer ON usage_events(payer);
CREATE INDEX idx_usage_status ON usage_events(status);
```

---

## Business Model & Economics

### Pricing Tiers

| Product                | Base Price | Staff | Pro    | Premium (Sui Right) |
|------------------------|------------|-------|--------|---------------------|
| Ontology 1536-dim      | $0.0065    | $0    | $0.00325 | Required            |
| Ontology 3072-dim      | $0.0130    | $0    | $0.0065  | Required            |
| Marketing Playbook     | $0.0125    | $0    | $0.00625 | Not required        |
| Signals Stream (hourly)| $0.0050/hr | $0    | $0.0025  | Required            |

### Revenue Model

**Assumptions:**
- 1,000 agent purchases/day
- Avg price: $0.0075
- 30% Better Auth users (50% discount)
- 70% agents (full price)

**Monthly Revenue:**
```
Agents: 700 purchases/day × $0.0075 × 30 days = $157.50
Humans: 300 purchases/day × $0.00375 × 30 days = $33.75
Total: $191.25/mo (small-scale example)

At scale (100k purchases/day):
$191.25 × 100 = $19,125/mo = $229,500/year
```

**Value Delivered:**
- Accuracy gain: 34% → saves ~$50-200 in compute per agent
- Token efficiency: 22% → saves ~$10-40 in API costs per agent
- **ROI for agent:** $0.0065 cost → $60-240 value = **9,230-36,923% ROI**

### Sui Rights NFT Model

**Premium Access NFT:**
- One-time purchase: $99
- Grants access to:
  - 3072-dim embeddings
  - Signals stream (real-time)
  - Premium playbooks
- Tradable on Sui DEX
- Can be revoked/expired (time-bound)

**Economics:**
- 1,000 NFTs sold = $99,000
- Recurring revenue from per-call fees
- NFT holders become loyal customers (sunk cost)

---

## Future Enhancements (Post-Launch)

### Infer 101-110: Advanced Features

**Infer 101-103: Multi-Chain Support**
- [ ] Ethereum L2s (Optimism, Arbitrum)
- [ ] Solana (SPL token payments)
- [ ] Lightning Network (BTC micropayments)

**Infer 104-106: Subscription Model**
- [ ] Monthly unlimited access (Stripe)
- [ ] Wallet credits (top-up USDC, spend over time)
- [ ] Enterprise contracts (volume discounts)

**Infer 107-110: Advanced Analytics**
- [ ] Agent cohort analysis (which agents buy most?)
- [ ] Value attribution (which packs deliver highest ROI?)
- [ ] Churn prediction (agents who stop buying)

### Infer 111-120: Marketplace Expansion

**Infer 111-113: Third-Party Packs**
- [ ] Allow other creators to list ontology/playbook packs
- [ ] Revenue share (70/30 split)
- [ ] Quality verification (provenance, signatures)

**Infer 114-116: Custom Ontologies**
- [ ] Enterprise customers upload private ontologies
- [ ] Scoped to groupId (multi-tenant)
- [ ] Higher pricing ($0.50+ per call)

**Infer 117-120: AI Model Fine-Tuning**
- [ ] Collect usage patterns → fine-tune pricing model
- [ ] Predict agent willingness-to-pay
- [ ] Dynamic pricing per agent (personalized)

---

## Success Metrics (KPIs)

### Week 1 (Launch)

- [ ] 10 agent purchases (proof of concept)
- [ ] 0 payment failures (x402 verification works)
- [ ] <500ms p95 latency (meets SLO)

### Month 1

- [ ] 100+ agent purchases
- [ ] 5+ Better Auth users with pro/staff roles
- [ ] Observed accuracy ≥ expected accuracy (pack quality validated)
- [ ] 1 Sui rights NFT sold

### Month 3

- [ ] 1,000+ agent purchases
- [ ] $200+ revenue
- [ ] 10+ Sui rights NFTs sold
- [ ] Convex analytics dashboard live

### Month 6

- [ ] 10,000+ agent purchases
- [ ] $2,000+ revenue
- [ ] Third-party pack listed (marketplace proof)
- [ ] Partnership with Claude API (official integration)

### Year 1

- [ ] 100,000+ agent purchases
- [ ] $20,000+ revenue
- [ ] 100+ Sui rights NFTs sold
- [ ] Featured in Anthropic blog / case study

---

## Risks & Mitigations

### Risk 1: Low Adoption (Agents don't buy)

**Mitigation:**
- Free tier (10 calls/mo) to prove value
- Observable metrics → agents see ROI
- Partnerships with agent frameworks (LangChain, CrewAI)

### Risk 2: x402 Gateway Downtime

**Mitigation:**
- Fallback to Base RPC direct
- Queue unverified requests → async verification
- Cache verified txHash → grant pairs (60s idempotency)

### Risk 3: Price Too High / Too Low

**Mitigation:**
- Start with conservative pricing ($0.0065)
- Monitor observed value vs. price
- Adjust every 2 weeks based on demand

### Risk 4: Pack Quality (Observed << Expected)

**Mitigation:**
- Rigorous testing before launch (unit + integration)
- Version control (v2.0.0 → v2.1.0 with improvements)
- Refund policy (if observed < 50% of expected)

### Risk 5: Sui Rights Complexity

**Mitigation:**
- Make premium tier optional (base tier has value)
- Clear docs + video tutorials
- Partner with Sui Foundation for wallet integration

---

## Conclusion: An Opportunity of a Lifetime

This x402 payment system represents a **paradigm shift**:

1. **From compute-pricing to value-pricing** - Agents pay for intelligence, not tokens
2. **From opaque APIs to observable value** - Every response proves ROI
3. **From static docs to living ontologies** - Signals stream updates in real-time
4. **From centralized to decentralized** - x402 + Sui rights = permissionless access

**Working with Claude Code:**
- Claude purchases ontology packs → improves inference accuracy
- Claude observes metrics → learns what's worth buying
- Claude recommends packs to users → drives adoption
- **Feedback loop:** Better ontology → better Claude → more purchases → better ontology

**Next Steps:**
1. Review this plan (you + Claude Code)
2. Execute Infer 1-10 (foundation)
3. Build first 402 route (Infer 21-30)
4. Deploy staging (Infer 91-96)
5. Launch with 1 ontology pack (Infer 97-100)
6. Observe, learn, iterate

**Let's build the intelligence marketplace together.** 🚀

---

**Document Status:** ✅ Ready for Implementation
**Next Inference:** Infer 1 (Set up `/workers/edge` directory)
**Owner:** Human + Claude Code (collaborative implementation)
**Timeline:** 100 inferences (context-light, parallel-friendly)

---

*"We don't plan in days. We plan in inferences. This is inference 1 of 100."*
