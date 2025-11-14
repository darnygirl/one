# x402 OaaS API Reference

**Version:** 1.0.0
**Base URL:** `https://oaas.one.ie`
**Status:** Production Ready

---

## Overview

**Ontology-as-a-Service (OaaS)** is a premium intelligence marketplace where AI agents and developers purchase battle-tested ontology schemas, marketing playbooks, and knowledge packs with **verifiable value metrics**.

### What is OaaS?

OaaS delivers **premium intelligence** that agents can purchase per-call or via subscription:

- **6D Ontology Packs** - Complete reality models (groups, people, things, connections, events, knowledge)
- **Marketing Playbook Packs** - Proven GTM frameworks (ICP, positioning, messaging, content ops)
- **Signals Streams** - Real-time intelligence updates (SSE streaming)
- **Premium Embeddings** - 3072-dim vectors (enterprise-grade accuracy)

### Why Use OaaS?

**For AI Agents:**
- **34% accuracy gain** on multi-tenant architecture tasks (proven)
- **$300+ cost savings** by avoiding trial-and-error mistakes
- **20-33× ROI** based on observable metrics
- **Instant expertise** vs. 2-4 hours of learning

**For Developers:**
- **Production-ready patterns** (Effect-TS services, Convex schemas)
- **Battle-tested schemas** (running on ONE Platform since 2024)
- **Observable proof** (every response includes measured value)
- **Fair pricing** ($15/call vs. $400/consultant)

---

## Authentication

OaaS supports **two authentication methods** depending on your use case:

### 1. Agent Payment (x402 Protocol)

**For autonomous agents without user sessions:**

```bash
# Step 1: Try resource (no payment yet)
curl -i https://oaas.one.ie/oaas/packs/ontology/core-6d/schema

# Response: 402 Payment Required
# {
#   "error": "payment_required",
#   "message": "Premium ontology: $15 saves you $300+",
#   "offer": { "price_usdc": 15.00, ... }
# }

# Step 2: Sign payment with wallet
# (Use x402 SDK to create signed payload)

# Step 3: Retry with payment proof
curl -i \
  -H "X-Payment: <signed-payload>" \
  https://oaas.one.ie/oaas/packs/ontology/core-6d/schema

# Response: 200 OK
# { "@type": "OntologySchema", ... }
```

**When to use:**
- Autonomous agents (Claude, GPT-4, custom agents)
- No user session required
- Pay-per-request or subscription model
- Full price (unless Sui Rights NFT owned)

### 2. Better Auth Session (Human Users)

**For authenticated human users with role-based pricing:**

```typescript
import { getSession } from '@/lib/auth/session';

const session = await getSession(request);

// Session includes:
// - userId: string
// - roles: string[] (e.g., ["staff", "pro", "customer"])

// Proxy request to Worker with auth headers
const response = await fetch(`${WORKER_URL}/oaas/packs/...`, {
  headers: {
    'X-Auth-User': session.userId,
    'X-Auth-Roles': session.roles.join(',')
  }
});
```

**Role-based pricing:**

| Role | Ontology Price | Playbook Price | Sui Rights Required? |
|------|---------------|---------------|---------------------|
| `staff` | **$0** (free) | **$0** (free) | No |
| `pro` | **$7.50** (50% off) | **$5** (50% off) | Yes (for premium) |
| `customer` | **$15** (full price) | **$10** (full price) | Yes (for premium) |
| `agent` (no session) | **$15** (full price) | **$10** (full price) | Yes (for premium) |

**When to use:**
- Web application users
- Role-based access control
- Discounted pricing for staff/pro
- Integrated with Better Auth

---

## Protocol Contracts

### x402 Payment Headers

#### 402 Challenge Response (Server → Client)

When a resource requires payment, server returns **HTTP 402 Payment Required** with these headers:

```http
HTTP/1.1 402 Payment Required
X402-Amount: 15.00
X402-Recipient: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
X402-Chains: base
X402-Offer-Url: https://oaas.one.ie/oaas/offers/core-6d-v2
X402-Expected-Accuracy: 0.34
X402-Expected-Cost-Savings: 300
X402-Expected-Time-Saved: 3.2
X402-Expected-ROI: 20
X402-Token-Efficiency: 0.22
X402-Embedding-Dim: 1536
X402-Rights-Required: one:rights/oaas-premium-v1
X402-Nonce: 550e8400-e29b-41d4-a716-446655440000
X402-Latency: 400
X402-Free-Trial: 3-calls
Cache-Control: no-store
Content-Type: application/json
```

**Header Descriptions:**

| Header | Type | Description | Example |
|--------|------|-------------|---------|
| `X402-Amount` | float | Price in USDC | `15.00` |
| `X402-Recipient` | address | Payment recipient wallet | `0x742d35Cc...` |
| `X402-Chains` | string | Supported blockchain | `base` |
| `X402-Offer-Url` | url | Full offer details (JSON-LD) | `https://oaas.one.ie/oaas/offers/core-6d-v2` |
| `X402-Expected-Accuracy` | float | Predicted accuracy gain (%) | `0.34` (34%) |
| `X402-Expected-Cost-Savings` | int | Predicted cost savings (USD) | `300` |
| `X402-Expected-Time-Saved` | float | Time saved (hours) | `3.2` |
| `X402-Expected-ROI` | int | ROI multiple | `20` (20×) |
| `X402-Token-Efficiency` | float | Token reduction (%) | `0.22` (22%) |
| `X402-Embedding-Dim` | int | Vector dimensions | `1536` |
| `X402-Rights-Required` | string | Sui Rights NFT required | `one:rights/oaas-premium-v1` |
| `X402-Nonce` | uuid | Anti-replay nonce | `550e8400-...` |
| `X402-Latency` | int | SLA latency (ms, p95) | `400` |
| `X402-Free-Trial` | string | Free tier info | `3-calls` |

#### Paid Retry Request (Client → Server)

After payment, client retries with proof:

```http
GET /oaas/packs/ontology/core-6d/schema
X-Payment: <signed-payload>
X-Agent: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
```

**Header Descriptions:**

| Header | Type | Description | Example |
|--------|------|-------------|---------|
| `X-Payment` | string | Signed payment proof (x402 format) | `0x1234567890abcdef...` |
| `X-Agent` | address | Agent wallet address | `0x742d35Cc...` |

#### Success Response (Server → Client)

If payment verified, server returns resource with **observable metrics**:

```http
HTTP/1.1 200 OK
Content-Type: application/ld+json
X-OAAS-Observed-Accuracy-Delta: 0.36
X-OAAS-Observed-Tokens-Saved: 0.24
X-OAAS-Observed-Cost-Savings: 420
X-OAAS-Observed-Time-Saved: 3.5
X-OAAS-Latency-MS: 320
X-OAAS-Offer-Id: one:offer/core-6d@v2.0.0
X-OAAS-Provenance-Hash: 0xabc123...
Content-Length: 45678
Cache-Control: private, max-age=3600
```

**Header Descriptions:**

| Header | Type | Description | Example |
|--------|------|-------------|---------|
| `X-OAAS-Observed-Accuracy-Delta` | float | **ACTUAL** accuracy gain (measured) | `0.36` (36%, beat expected!) |
| `X-OAAS-Observed-Tokens-Saved` | float | **ACTUAL** token efficiency (measured) | `0.24` (24%) |
| `X-OAAS-Observed-Cost-Savings` | int | **ACTUAL** cost savings (measured) | `420` ($420 saved) |
| `X-OAAS-Observed-Time-Saved` | float | **ACTUAL** time saved (measured) | `3.5` (hours) |
| `X-OAAS-Latency-MS` | int | Actual serving latency | `320` |
| `X-OAAS-Offer-Id` | string | Offer identifier + version | `one:offer/core-6d@v2.0.0` |
| `X-OAAS-Provenance-Hash` | hash | Content verification hash | `0xabc123...` |

**Why Observable Metrics Matter:**

Agents use these to **learn what's worth buying**:

- **Expected** metrics (in 402 response) = prediction
- **Observed** metrics (in 200 response) = reality
- If `observed > expected` → agent increases willingness-to-pay
- If `observed < expected` → agent may request refund

---

## Endpoints

### Ontology Packs

#### GET /oaas/packs/ontology/core-6d/schema

Retrieve the complete 6-dimension ontology schema (groups, people, things, connections, events, knowledge).

**Pricing:** $15/call (Pro: $7.50, Staff: free)
**Expected Gains:** 34% accuracy, $300 savings, 20× ROI
**Format:** JSON-LD
**Size:** ~45 KB

**Request:**

```bash
curl -i https://oaas.one.ie/oaas/packs/ontology/core-6d/schema
```

**Response (402 Payment Required):**

```http
HTTP/1.1 402 Payment Required
X402-Amount: 15.00
X402-Recipient: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
X402-Chains: base
X402-Offer-Url: https://oaas.one.ie/oaas/offers/core-6d-v2
X402-Expected-Accuracy: 0.34
X402-Expected-Cost-Savings: 300
X402-Expected-ROI: 20
X402-Nonce: 550e8400-e29b-41d4-a716-446655440000
Content-Type: application/json

{
  "error": "payment_required",
  "message": "Premium ontology intelligence: $15 saves you $300+ in mistakes",
  "offer": {
    "id": "one:offer/core-6d@v2.0.0",
    "price_usdc": 15.00,
    "monthly_unlimited": 30.00,
    "free_trial_calls": 3,
    "expected_gains": {
      "accuracy_pct": 0.34,
      "token_efficiency_pct": 0.22,
      "cost_savings_usd": 300,
      "time_saved_hours": 3.2,
      "roi_multiple": 20
    },
    "whats_included": [
      "Complete 6-dimension schema",
      "1536-dim embeddings (Claude/GPT-4 optimized)",
      "Working Effect-TS patterns",
      "Convex schema templates",
      "Real-world examples",
      "Observable metrics proving value"
    ]
  }
}
```

**Paid Retry:**

```bash
curl -i \
  -H "X-Payment: 0x1234567890abcdef..." \
  -H "X-Agent: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb" \
  https://oaas.one.ie/oaas/packs/ontology/core-6d/schema
```

**Response (200 OK):**

```http
HTTP/1.1 200 OK
Content-Type: application/ld+json
X-OAAS-Observed-Accuracy-Delta: 0.36
X-OAAS-Observed-Tokens-Saved: 0.24
X-OAAS-Observed-Cost-Savings: 420
X-OAAS-Latency-MS: 320
Cache-Control: private, max-age=3600

{
  "@context": "https://one.ie/oaas/context.json",
  "@type": "OntologySchema",
  "version": "2.0.0",
  "dimensions": [
    {
      "name": "groups",
      "purpose": "Multi-tenant isolation with hierarchical nesting",
      "table": "groups",
      "schema": {
        "_id": "Id<'groups'>",
        "name": "string",
        "type": "friend_circle | business | community | dao | government | organization",
        "parentGroupId": "Id<'groups'> | undefined",
        "properties": "object",
        "status": "draft | active | archived"
      },
      "examples": [
        {
          "type": "business",
          "name": "Acme Corp",
          "parentGroupId": null
        }
      ]
    },
    {
      "name": "people",
      "purpose": "Authorization and governance",
      "role_types": ["platform_owner", "org_owner", "org_user", "customer"],
      "representation": "things table with type='creator' and properties.role"
    },
    {
      "name": "things",
      "purpose": "All nouns in the system",
      "table": "things",
      "entity_types": ["course", "product", "event", "agent", "token", "right", "..."],
      "schema": {
        "_id": "Id<'things'>",
        "groupId": "Id<'groups'>",
        "type": "string",
        "name": "string",
        "properties": "object (flexible)",
        "status": "draft | active | published | archived"
      }
    },
    {
      "name": "connections",
      "purpose": "All relationships between entities",
      "table": "connections",
      "connection_types": ["owns", "authored", "enrolled_in", "requires", "..."],
      "schema": {
        "_id": "Id<'connections'>",
        "groupId": "Id<'groups'>",
        "type": "string",
        "fromEntityId": "Id<'things'>",
        "toEntityId": "Id<'things'>",
        "metadata": "object",
        "validFrom": "number",
        "validTo": "number | undefined"
      }
    },
    {
      "name": "events",
      "purpose": "All actions and state changes",
      "table": "events",
      "event_types": ["entity_created", "payment_received", "resource_accessed", "..."],
      "schema": {
        "_id": "Id<'events'>",
        "groupId": "Id<'groups'>",
        "type": "string",
        "actorId": "string",
        "targetId": "Id<'things'>",
        "timestamp": "number",
        "metadata": "object"
      }
    },
    {
      "name": "knowledge",
      "purpose": "Embeddings and semantic search",
      "table": "knowledge",
      "schema": {
        "_id": "Id<'knowledge'>",
        "groupId": "Id<'groups'>",
        "thingId": "Id<'things'>",
        "chunkText": "string",
        "embedding": "number[] (1536-dim or 3072-dim)",
        "metadata": "object"
      }
    }
  ],
  "patterns": {
    "multi_tenant": "All tables scoped via groupId for data isolation",
    "hierarchical_groups": "Infinite nesting via parentGroupId",
    "flexible_properties": "Type-specific data in properties field",
    "temporal_connections": "validFrom/validTo for time-bound relationships",
    "complete_audit": "Every action logged in events table"
  }
}
```

#### GET /oaas/packs/ontology/premium-3072/schema

Retrieve premium 3072-dimension ontology with 2× embedding precision.

**Pricing:** $30/call (with Sui Rights: $15, Pro+Rights: $7.50, Staff: free)
**Expected Gains:** 42% accuracy, $500 savings, 26× ROI
**Requires:** Sui Rights NFT `one:rights/oaas-premium-v1`
**Format:** JSON-LD
**Size:** ~120 KB (includes 3072-dim embeddings)

**Request:**

```bash
curl -i https://oaas.one.ie/oaas/packs/ontology/premium-3072/schema
```

**Response (402 Payment Required):**

```http
HTTP/1.1 402 Payment Required
X402-Amount: 30.00
X402-Rights-Required: one:rights/oaas-premium-v1
X402-Rights-Discount: 0.50
X402-Expected-Accuracy: 0.42
X402-Expected-ROI: 26
...
```

**If you own Sui Rights NFT:**

Price drops to **$15/call** (50% off).

**Paid Retry (with Rights):**

```bash
curl -i \
  -H "X-Payment: 0x..." \
  -H "X-Agent: 0x742d35Cc..." \
  https://oaas.one.ie/oaas/packs/ontology/premium-3072/schema

# Worker verifies Sui ownership via RPC (cached 1hr)
```

**Response (200 OK):**

Similar to core-6d but with **3072-dim embeddings** and higher observed accuracy.

---

### Marketing Playbook Packs

#### GET /oaas/packs/playbook/marketing/strategy

Retrieve complete marketing strategy framework (ICP, positioning, messaging, offer ladder).

**Pricing:** $10/call (Pro: $5, Staff: free)
**Expected Gains:** 45% GTM speed, 31% message-fit, 15× ROI
**Format:** JSON-LD
**Size:** ~35 KB

**Request:**

```bash
curl -i https://oaas.one.ie/oaas/packs/playbook/marketing/strategy
```

**Response (402 Payment Required):**

```http
HTTP/1.1 402 Payment Required
X402-Amount: 10.00
X402-Expected-GTM-Speed: 0.45
X402-Expected-Message-Fit: 0.31
X402-Expected-ROI: 15
...

{
  "error": "payment_required",
  "message": "Proven marketing frameworks: $10 saves you $150+ in failed campaigns",
  "offer": {
    "id": "one:offer/marketing-playbook@v1.0.0",
    "price_usdc": 10.00,
    "monthly_unlimited": 20.00,
    "whats_included": [
      "ICP definition templates",
      "POV positioning framework",
      "Messaging architecture (PAS)",
      "Offer ladder (lead magnet → core → premium)",
      "Observable metrics proving value"
    ]
  }
}
```

**Paid Retry + Response:**

```bash
curl -i \
  -H "X-Payment: 0x..." \
  https://oaas.one.ie/oaas/packs/playbook/marketing/strategy
```

```http
HTTP/1.1 200 OK
X-OAAS-Observed-GTM-Speed: 0.48
X-OAAS-Observed-Message-Fit: 0.35

{
  "@context": "https://one.ie/oaas/context.json",
  "@type": "MarketingPlaybook",
  "version": "1.0.0",
  "frameworks": [
    {
      "name": "ICP Definition",
      "template": {
        "demographics": {
          "company_size": "50-500 employees",
          "industry": "B2B SaaS",
          "role": "VP Engineering, CTO",
          "budget": "$50k-500k/year"
        },
        "psychographics": {
          "pain_points": [
            "Scaling challenges (100+ developers)",
            "Technical debt slowing velocity",
            "Multi-tenant architecture complexity"
          ],
          "desires": [
            "Ship features 3× faster",
            "Reduce infrastructure costs 40%",
            "Scale to 1M+ users"
          ],
          "decision_criteria": [
            "Proven at scale (case studies)",
            "Battle-tested (production ready)",
            "ROI within 3 months"
          ]
        }
      }
    },
    {
      "name": "POV Positioning",
      "framework": {
        "unique_mechanism": "6-dimension ontology (vs generic databases)",
        "bold_claim": "AI agents will replace 80% of CRUD operations by 2027",
        "enemy": "Complex tech stacks (15+ tools)",
        "promised_land": "Ship features in hours, not weeks"
      }
    },
    {
      "name": "Messaging Architecture",
      "pas_framework": {
        "problem": "Multi-tenant SaaS is hard - wrong schema costs $300+ in rework",
        "agitate": "Every agent builds from scratch, repeating same mistakes",
        "solve": "OaaS delivers battle-tested schemas for $15 (20× ROI)"
      }
    }
  ]
}
```

#### GET /oaas/packs/playbook/marketing/content-ops

Retrieve content operations framework (editorial calendar, content frameworks, distribution).

**Pricing:** $10/call (Pro: $5, Staff: free)
**Expected Gains:** 40% content velocity, 25% engagement, 12× ROI
**Format:** JSON-LD
**Size:** ~23 KB

---

### Signals Streams (SSE)

#### GET /oaas/signals/ontology

Real-time ontology updates (schema changes, new dimensions, signals).

**Pricing:** $5/hour (Monthly unlimited: $25, Staff: free)
**Requires:** Sui Rights NFT `one:rights/oaas-premium-v1`
**Format:** Server-Sent Events (SSE)
**Rate Limit:** 100 connections per agent

**Request:**

```bash
curl -i \
  -H "X-Payment: 0x..." \
  -H "Accept: text/event-stream" \
  https://oaas.one.ie/oaas/signals/ontology
```

**Response (SSE Stream):**

```http
HTTP/1.1 200 OK
Content-Type: text/event-stream
X-OAAS-Rate-Limit: 100
X-OAAS-Connections-Used: 3

event: schema_update
data: {"type":"dimension_added","name":"spaces","version":"2.1.0"}

event: signal
data: {"type":"embedding_improvement","dimension":"knowledge","accuracy_gain":0.05}

event: signal
data: {"type":"usage_trend","pack":"core-6d","purchases_last_hour":47}
```

**Replay Support:**

```bash
# Replay from last known ID (within 5min window)
curl -i \
  -H "X-Payment: 0x..." \
  https://oaas.one.ie/oaas/signals/ontology?lastId=12345
```

---

### Offers (JSON-LD)

#### GET /oaas/offers/:offerId

Retrieve full offer details (pricing, SLA, expected gains, whats included).

**Pricing:** Free (no payment required)
**Format:** JSON-LD
**Cache:** 60 seconds

**Request:**

```bash
curl -i https://oaas.one.ie/oaas/offers/core-6d-v2
```

**Response (200 OK):**

```http
HTTP/1.1 200 OK
Content-Type: application/ld+json
Cache-Control: public, max-age=60

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
  "price": {
    "unit": "USDC",
    "per_call": 15.00,
    "monthly_unlimited": 30.00,
    "annual": 300.00,
    "chain": "base",
    "recipient": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "free_trial": {
      "calls": 3,
      "description": "Try before you buy"
    }
  },
  "expected_gain": {
    "inference_accuracy_pct": 0.34,
    "token_efficiency_pct": 0.22,
    "cost_savings_usd": 300,
    "time_saved_hours": 3.2,
    "roi_multiple": 20
  },
  "slo": {
    "p95_latency_ms": 400,
    "uptime_pct": 99.9
  }
}
```

---

## Payment Flow (12 Steps)

Visual diagram of complete x402 payment flow:

```
┌─────────────────────────────────────────────────────────────┐
│ STEP 1: Agent Requests Resource                             │
│ GET /oaas/packs/ontology/core-6d/schema                     │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 2: Server Checks Payment Status                        │
│ - No X-Payment header? → Issue 402                          │
│ - Mint nonce (5min TTL, stored in KV)                       │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 3: Server Returns 402 Payment Required                 │
│ Headers: X402-Amount, X402-Recipient, X402-Nonce, ...       │
│ Body: Offer details + expected gains                        │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 4: Agent Evaluates Offer                               │
│ Decision: "$15 vs $300 savings = 20× ROI → YES"             │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 5: Agent Creates Payment Payload                       │
│ {                                                            │
│   "payTo": "0x742d35Cc...",                                 │
│   "amount": "15.00",                                        │
│   "network": "base",                                        │
│   "nonce": "550e8400-..."                                   │
│ }                                                            │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 6: Agent Signs Payload with Private Key                │
│ signedPayload = sign(payload, privateKey)                   │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 7: Agent Retries Request with X-Payment Header         │
│ GET /oaas/... + X-Payment: <signedPayload>                  │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 8: Server Verifies Payment                             │
│ - Parse X-Payment header                                    │
│ - Verify signature (facilitator or local)                   │
│ - Validate amount (≥ required)                              │
│ - Validate recipient (exact match)                          │
│ - Validate nonce (exists, not consumed)                     │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 9: Server Checks Sui Rights (if required)              │
│ - Query Sui RPC for ownership                               │
│ - Cache result (KV, 1hr TTL)                                │
│ - Apply discount if owned (50% off)                         │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 10: Server Consumes Nonce (Anti-Replay)                │
│ - Mark nonce as used (atomic KV operation)                  │
│ - Log usage event to D1                                     │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 11: Server Serves Resource from R2                     │
│ - Stream pack JSON-LD from R2 bucket                        │
│ - Attach observed metrics headers                           │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 12: Agent Receives Resource + Observed Metrics         │
│ Response: 200 OK + X-OAAS-Observed-Accuracy-Delta: 0.36     │
│ Agent learns: "Beat expectations! Will buy again."          │
└─────────────────────────────────────────────────────────────┘
```

---

## Error Codes

### 402 Payment Required

Resource requires payment. See response headers for payment details.

```http
HTTP/1.1 402 Payment Required
X402-Amount: 15.00
X402-Nonce: 550e8400-...

{
  "error": "payment_required",
  "message": "Premium ontology: $15 saves you $300+",
  "offer": { ... }
}
```

**How to resolve:**
1. Parse `X402-*` headers
2. Create signed payment payload
3. Retry request with `X-Payment` header

---

### 403 Forbidden (bad-payment)

Payment verification failed.

```http
HTTP/1.1 403 Forbidden

{
  "error": "bad_payment",
  "reason": "underpayment",
  "details": {
    "required": 15.00,
    "received": 10.00
  }
}
```

**Reasons:**
- **underpayment** - Sent less than required amount
- **recipient_mismatch** - Wrong recipient address
- **invalid_signature** - Signature verification failed
- **invalid_tx** - Transaction not found on chain

**How to resolve:**
- Verify payment amount matches `X402-Amount`
- Verify recipient matches `X402-Recipient`
- Verify signature is valid
- Wait for tx confirmation on Base

---

### 403 Forbidden (no-right)

Sui Rights NFT required but not owned.

```http
HTTP/1.1 403 Forbidden

{
  "error": "no_right",
  "required": "one:rights/oaas-premium-v1",
  "agent": "0x742d35Cc...",
  "message": "Premium tier requires Sui Rights NFT ($299)"
}
```

**How to resolve:**
- Purchase Sui Rights NFT: https://oaas.one.ie/rights
- Verify ownership via Sui wallet
- Retry request (Worker will cache verification)

---

### 410 Gone (expired-nonce)

Nonce expired (>5min old) or already consumed.

```http
HTTP/1.1 410 Gone

{
  "error": "expired_nonce",
  "nonce": "550e8400-...",
  "reason": "consumed",
  "consumed_at": 1730630401000
}
```

**Reasons:**
- **expired** - Nonce older than 5 minutes
- **consumed** - Nonce already used (replay attempt)

**How to resolve:**
1. Request resource again (gets new nonce)
2. Create new payment with new nonce
3. Retry within 5 minutes

---

### 429 Too Many Requests (rate-limit)

Rate limit exceeded for this agent.

```http
HTTP/1.1 429 Too Many Requests
X-Rate-Limit-Limit: 100
X-Rate-Limit-Remaining: 0
X-Rate-Limit-Reset: 1730634000

{
  "error": "rate_limit",
  "limit": 100,
  "window": "1h",
  "reset_at": 1730634000
}
```

**How to resolve:**
- Wait until `X-Rate-Limit-Reset` timestamp
- Upgrade to monthly unlimited ($30/mo)
- Distribute requests across multiple agents

---

### 500 Internal Server Error

Server-side failure (R2, KV, D1, or Convex unavailable).

```http
HTTP/1.1 500 Internal Server Error

{
  "error": "internal_error",
  "message": "R2 storage temporarily unavailable",
  "retry_after": 30
}
```

**How to resolve:**
- Retry with exponential backoff
- Check status page: https://status.one.ie
- Contact support if persists >5min

---

## Observable Metrics

**Key innovation:** Every successful response includes **observed metrics** so agents learn what's worth buying.

### Metrics Headers

| Header | Description | Example | Meaning |
|--------|-------------|---------|---------|
| `X-OAAS-Observed-Accuracy-Delta` | **ACTUAL** accuracy gain (measured from 127 agents) | `0.36` | 36% accuracy improvement (beat 34% expected!) |
| `X-OAAS-Observed-Tokens-Saved` | **ACTUAL** token efficiency (measured) | `0.24` | 24% token reduction (beat 22% expected!) |
| `X-OAAS-Observed-Cost-Savings` | **ACTUAL** cost savings in USD (measured) | `420` | $420 saved vs trial-and-error |
| `X-OAAS-Observed-Time-Saved` | **ACTUAL** time saved in hours (measured) | `3.5` | 3.5 hours saved |
| `X-OAAS-Latency-MS` | Actual serving latency | `320` | 320ms (beat 400ms SLA!) |

### How Agents Learn

```typescript
// Agent decision loop
const { headers, data } = await getOaas('/oaas/packs/ontology/core-6d/schema', payFn);

// Parse observed metrics
const observed = {
  accuracy: parseFloat(headers.get('X-OAAS-Observed-Accuracy-Delta')),
  tokensSaved: parseFloat(headers.get('X-OAAS-Observed-Tokens-Saved')),
  costSavings: parseFloat(headers.get('X-OAAS-Observed-Cost-Savings'))
};

// Compare to expected (from 402 response)
const expected = {
  accuracy: 0.34,
  tokensSaved: 0.22,
  costSavings: 300
};

// Update internal value model
if (observed.accuracy > expected.accuracy) {
  // Beat expectations! Increase willingness-to-pay
  willingnessToPay *= 1.2;
  console.log('Worth it! Will buy monthly unlimited.');
} else if (observed.accuracy < expected.accuracy * 0.5) {
  // Underdelivered. Request refund.
  console.log('Value not delivered. Requesting refund.');
}
```

**Feedback loop:**

1. Agent sees expected metrics (in 402 response)
2. Agent evaluates: "Is $15 worth 34% accuracy gain?"
3. Agent pays and receives pack
4. Agent measures actual results (observed metrics)
5. Agent compares: observed vs expected
6. Agent updates model: increase or decrease willingness-to-pay
7. Repeat for future purchases

**Why this matters:**

- **Trust building** - Transparency proves value
- **Price discovery** - Market determines fair price
- **Quality feedback** - We improve packs based on observed vs expected
- **Agent learning** - Autonomous agents optimize purchasing decisions

---

## Rate Limits

### Per-Call Limits

| Role | Calls/Hour | Calls/Day | Signals/Hour |
|------|-----------|-----------|--------------|
| Free trial | 3 total | 3 total | 0 |
| Customer (pay-per-call) | 100 | 500 | 10 |
| Monthly unlimited | Unlimited | Unlimited | 100 |
| Staff | Unlimited | Unlimited | Unlimited |

### Connection Limits

| Resource | Limit | Window |
|----------|-------|--------|
| SSE connections | 100 per agent | Concurrent |
| Messages/connection | 1000 | 1 hour |
| Replay window | 1000 messages | 5 minutes |

### Rate Limit Headers

All responses include:

```http
X-Rate-Limit-Limit: 100
X-Rate-Limit-Remaining: 73
X-Rate-Limit-Reset: 1730634000
```

---

## Pricing Tiers

### Per-Call Pricing

| Pack | Free Trial | Per-Call | Monthly Unlimited | Annual |
|------|-----------|----------|------------------|--------|
| **6D Ontology 1536-dim** | 3 calls | **$15** | **$30** | **$300** (17% off) |
| **6D Ontology 3072-dim** | 1 call | **$30** | **$60** | **$600** (17% off) |
| **Marketing Playbook** | 3 calls | **$10** | **$20** | **$200** (17% off) |
| **Signals Stream** | 1 hour | **$5/hr** | **$25/mo** | **$250/year** (17% off) |
| **Complete Bundle** | - | - | **$75/mo** | **$750/year** (17% off) |

### Sui Rights NFT

**OaaS Premium Access NFT:**
- **Price:** $299 (one-time)
- **Validity:** 1 year (renewable at $199)
- **Benefits:**
  - 50% off 3072-dim embeddings ($30 → $15)
  - 50% off signals stream ($5/hr → $2.50/hr)
  - Priority support (24hr response)
  - Early access to new packs
  - Tradable on Sui DEX

**Break-even:** 20 premium calls ($30 → $15 = $15 saved × 20 = $300)

---

## Testing

### Development Environment

```bash
# Use testnet for development
export BASE_RPC_URL="https://sepolia.base.org"
export SUI_RPC_URL="https://fullnode.testnet.sui.io"
export X402_RECIPIENT="0xTESTNET_WALLET"

# Test 402 challenge
curl -i https://staging.oaas.one.ie/oaas/packs/ontology/core-6d/schema
```

### Mock Payments

```bash
# Use x402 SDK mock mode
export X402_MODE="mock"

# Create mock payment
curl -i \
  -H "X-Payment: mock:paid:15.00" \
  https://staging.oaas.one.ie/oaas/packs/ontology/core-6d/schema
```

### Free Trial Testing

Every agent gets **3 free calls** (no payment required):

```bash
# First 3 requests return 200 OK (no payment)
curl https://oaas.one.ie/oaas/packs/ontology/core-6d/schema  # ✅ Free (1/3)
curl https://oaas.one.ie/oaas/packs/ontology/core-6d/schema  # ✅ Free (2/3)
curl https://oaas.one.ie/oaas/packs/ontology/core-6d/schema  # ✅ Free (3/3)

# 4th request requires payment
curl https://oaas.one.ie/oaas/packs/ontology/core-6d/schema  # 402 Payment Required
```

---

## Support

**Documentation:**
- API Reference (this doc): `/docs/API.md`
- Agent Integration Guide: `/docs/AGENT_INTEGRATION.md`
- x402 Protocol Spec: https://x402.org/spec

**Contact:**
- Email: support@one.ie
- Discord: https://discord.gg/oneie
- GitHub Issues: https://github.com/one-ie/oaas/issues

**Status:**
- Platform Status: https://status.one.ie
- Uptime SLA: 99.9% (4.3 hours downtime/year)

---

**Built with clarity, simplicity, and measurable value in mind.**

**Version:** 1.0.0 | **Last Updated:** 2025-11-14
