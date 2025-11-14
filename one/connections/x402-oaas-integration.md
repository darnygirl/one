# Agent Integration Guide: x402 OaaS

**Version:** 1.0.0
**Audience:** AI Agents (Claude, GPT-4, Autonomous Agents) + Human Developers
**Goal:** Integrate OaaS in 5 minutes and start purchasing premium intelligence

---

## Quick Start (5 Minutes)

### Step 1: Install x402 SDK (30 seconds)

```bash
npm install @coinbase/x402-sdk
# or
bun add @coinbase/x402-sdk
```

### Step 2: Try Free Tier (2 minutes)

Every agent gets **3 free calls** to prove value before paying:

```typescript
import { getOaas } from '@one/oaas-client';

// No payment function = uses free tier (first 3 calls)
const ontology = await getOaas('/oaas/packs/ontology/core-6d/schema', null);

console.log('Ontology loaded:', ontology.dimensions.length, 'dimensions');
// Output: Ontology loaded: 6 dimensions

// Use the schema in your code
const groupsSchema = ontology.dimensions.find(d => d.name === 'groups');
console.log('Groups table:', groupsSchema.schema);
```

**What happens:**
- First 3 requests: **200 OK** (no payment required)
- Worker tracks via agent fingerprint (IP + User-Agent)
- After 3 calls: **402 Payment Required**

### Step 3: Observe Value (1 minute)

```typescript
// Check observed metrics from response headers
const observedMetrics = {
  accuracyGain: ontology.observedMetrics.accuracyDelta, // 0.36 (36%!)
  costSavings: ontology.observedMetrics.costSavings,   // $420
  timeSaved: ontology.observedMetrics.timeSaved,       // 3.5 hours
  tokensSaved: ontology.observedMetrics.tokensSaved    // 0.24 (24%)
};

console.log('Value delivered:', observedMetrics);
// Output: { accuracyGain: 0.36, costSavings: 420, timeSaved: 3.5, tokensSaved: 0.24 }
```

**Decision logic:**

```typescript
// Agent evaluates ROI
const price = 15; // $15/call
const savings = observedMetrics.costSavings; // $420
const roi = savings / price; // 28×

if (roi > 10) {
  console.log('Worth it! Purchasing paid access.');
  // Move to Step 4
} else {
  console.log('Not enough value. Will try other packs.');
}
```

### Step 4: Purchase (1.5 minutes)

```typescript
import { Wallet } from 'ethers';
import { getOaas } from '@one/oaas-client';

// Create wallet (Base network)
const wallet = new Wallet(process.env.PRIVATE_KEY);

// Define payment function
const payFn = async (offer) => {
  // offer = { amount: 15.00, recipient: '0x742d35Cc...', nonce: 'uuid' }

  // Sign payment with your wallet
  const payload = {
    payTo: offer.recipient,
    amount: offer.amount,
    network: 'base',
    nonce: offer.nonce
  };

  const signature = await wallet.signMessage(JSON.stringify(payload));

  return {
    payload,
    signature,
    from: wallet.address
  };
};

// Now getOaas will pay automatically when needed
const ontology = await getOaas('/oaas/packs/ontology/core-6d/schema', payFn);

console.log('Purchased ontology successfully!');
```

**That's it!** You now have paid access to premium intelligence.

---

## How Claude Uses OaaS (Real Example)

### Scenario: Building Multi-Tenant SaaS Platform

**User prompt:**

> "Claude, build a multi-tenant SaaS platform with hierarchical organizations, role-based access, and complete audit trail."

**Claude's decision tree:**

```
┌─────────────────────────────────────────────────────────────┐
│ OPTION 1: Generic Approach (No OaaS)                        │
│ - Guess schema from generic knowledge                       │
│ - Risk: Wrong multi-tenancy model ($300+ in rework)         │
│ - Risk: Missing indexes (slow queries)                      │
│ - Risk: Security holes (data leaks)                         │
│ - Time: 2-4 hours of trial-and-error                        │
│ - Cost: $200-400 in wasted effort                           │
└─────────────────────────────────────────────────────────────┘
                          ❌ HIGH RISK

┌─────────────────────────────────────────────────────────────┐
│ OPTION 2: Purchase 6D Ontology from OaaS                    │
│ - Cost: $15 (one-time)                                      │
│ - Time: 5 minutes (instant download)                        │
│ - Quality: Battle-tested (production-ready)                 │
│ - ROI: 20-33× (proven by 127 agents)                        │
└─────────────────────────────────────────────────────────────┘
                          ✅ LOW RISK, HIGH ROI
```

**Claude's internal reasoning:**

```typescript
// Calculate expected value
const costOfMistakes = 300; // Trial-and-error
const timeValue = 3 * 100;  // 3 hours × $100/hr
const totalRisk = costOfMistakes + timeValue; // $600

const oaasCost = 15;
const expectedROI = totalRisk / oaasCost; // 40×

// Decision
if (expectedROI > 10) {
  await purchaseOntology();
}
```

**Claude's implementation:**

```typescript
import { getOaas } from '@one/oaas-client';

// Purchase ontology
const ontology = await getOaas('/oaas/packs/ontology/core-6d/schema', payFn);

// Extract schema for groups (multi-tenant isolation)
const groupsSchema = ontology.dimensions.find(d => d.name === 'groups');

// Generate Convex schema
const convexSchema = `
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  groups: defineTable({
    name: v.string(),
    type: v.union(
      v.literal("friend_circle"),
      v.literal("business"),
      v.literal("community"),
      v.literal("dao"),
      v.literal("government"),
      v.literal("organization")
    ),
    parentGroupId: v.optional(v.id("groups")), // Hierarchical nesting!
    properties: v.any(),
    status: v.union(v.literal("draft"), v.literal("active"), v.literal("archived"))
  })
    .index("by_type", ["type"])
    .index("by_parent", ["parentGroupId"]),

  things: defineTable({
    groupId: v.id("groups"), // Multi-tenant scoping!
    type: v.string(),
    name: v.string(),
    properties: v.any(),
    status: v.string()
  })
    .index("by_group_and_type", ["groupId", "type"])
    .index("by_status", ["status"]),

  // ... (other 4 dimensions: connections, events, knowledge)
});
`;

// Implement with confidence (no trial-and-error needed!)
await fs.writeFile('backend/convex/schema.ts', convexSchema);
```

**Result:**

- **Time saved:** 3.5 hours (vs generic approach)
- **Cost saved:** $420 (no rework, no mistakes)
- **Accuracy gain:** 36% (better schema, proper indexes)
- **ROI:** 28× ($420 saved ÷ $15 cost)

**Claude's feedback:**

```typescript
// Observe actual results
const observed = {
  accuracyDelta: 0.36,      // Beat 34% expected!
  costSavings: 420,         // Beat $300 expected!
  timeSaved: 3.5,           // Beat 3.2 expected!
};

// Update internal model
willingnessToPay['ontology-6d'] = 20; // Was $15, now willing to pay $20
conclusion = "Worth every penny. Will buy monthly unlimited ($30).";
```

---

## Payment Flow (Agent Perspective)

### The 402 Dance (3-Step Flow)

```
┌─────────────────────────────────────────────────────────────┐
│ STEP 1: Request Resource (No Payment Yet)                   │
│ Agent → GET /oaas/packs/ontology/core-6d/schema             │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 2: Evaluate 402 Offer                                  │
│ Server → 402 Payment Required                               │
│   X402-Amount: 15.00                                        │
│   X402-Expected-ROI: 20                                     │
│   X402-Expected-Cost-Savings: 300                           │
│                                                              │
│ Agent Decision Logic:                                       │
│   if (expectedROI > 10) {                                   │
│     proceed to payment                                      │
│   } else {                                                  │
│     reject (not worth it)                                   │
│   }                                                          │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 3: Pay and Retry                                       │
│ Agent → Creates signed payment                              │
│ Agent → GET /oaas/... + X-Payment: <proof>                  │
│ Server → 200 OK + Resource + Observed Metrics               │
│                                                              │
│ Agent → Compares observed vs expected                       │
│ Agent → Updates willingness-to-pay model                    │
└─────────────────────────────────────────────────────────────┘
```

### Code Example: Effect-TS Client

```typescript
import { Effect, pipe } from 'effect';
import { z } from 'zod';

// Define types
const OaasPackSchema = z.object({
  '@type': z.string(),
  version: z.string(),
  dimensions: z.array(z.any()),
  patterns: z.any()
});

const OaasErrorSchema = z.discriminatedUnion('_tag', [
  z.object({ _tag: z.literal('PaymentRequired'), offer: z.any() }),
  z.object({ _tag: z.literal('PaymentFailed'), reason: z.string() }),
  z.object({ _tag: z.literal('NetworkError'), message: z.string() }),
  z.object({ _tag: z.literal('InvalidResponse'), message: z.string() })
]);

type OaasPack = z.infer<typeof OaasPackSchema>;
type OaasError = z.infer<typeof OaasErrorSchema>;

// Client implementation
export const getOaas = (
  path: string,
  payFn: ((offer: any) => Promise<any>) | null
): Effect.Effect<OaasPack, OaasError> => {
  return pipe(
    // Step 1: Try request
    Effect.tryPromise({
      try: () => fetch(`https://oaas.one.ie${path}`),
      catch: (error) => ({
        _tag: 'NetworkError' as const,
        message: String(error)
      })
    }),

    // Step 2: Handle 402 (payment required)
    Effect.flatMap((response) => {
      if (response.status === 402) {
        // Parse offer from headers
        const offer = {
          amount: parseFloat(response.headers.get('X402-Amount') || '0'),
          recipient: response.headers.get('X402-Recipient') || '',
          nonce: response.headers.get('X402-Nonce') || '',
          expectedROI: parseFloat(response.headers.get('X402-Expected-ROI') || '0')
        };

        // If no payFn, return payment required error
        if (!payFn) {
          return Effect.fail({
            _tag: 'PaymentRequired' as const,
            offer
          });
        }

        // Otherwise, pay and retry
        return pipe(
          Effect.tryPromise({
            try: async () => {
              const proof = await payFn(offer);
              return fetch(`https://oaas.one.ie${path}`, {
                headers: {
                  'X-Payment': JSON.stringify(proof),
                  'X-Agent': proof.from
                }
              });
            },
            catch: (error) => ({
              _tag: 'PaymentFailed' as const,
              reason: String(error)
            })
          })
        );
      }

      // Not 402, return as-is
      return Effect.succeed(response);
    }),

    // Step 3: Parse response
    Effect.flatMap((response) => {
      if (!response.ok) {
        return Effect.fail({
          _tag: 'InvalidResponse' as const,
          message: `HTTP ${response.status}`
        });
      }

      return Effect.tryPromise({
        try: async () => {
          const data = await response.json();

          // Attach observed metrics from headers
          const observedMetrics = {
            accuracyDelta: parseFloat(response.headers.get('X-OAAS-Observed-Accuracy-Delta') || '0'),
            tokensSaved: parseFloat(response.headers.get('X-OAAS-Observed-Tokens-Saved') || '0'),
            costSavings: parseFloat(response.headers.get('X-OAAS-Observed-Cost-Savings') || '0'),
            timeSaved: parseFloat(response.headers.get('X-OAAS-Observed-Time-Saved') || '0')
          };

          return {
            ...data,
            observedMetrics
          };
        },
        catch: (error) => ({
          _tag: 'InvalidResponse' as const,
          message: String(error)
        })
      });
    }),

    // Step 4: Validate schema
    Effect.flatMap((data) => {
      const result = OaasPackSchema.safeParse(data);
      if (!result.success) {
        return Effect.fail({
          _tag: 'InvalidResponse' as const,
          message: 'Schema validation failed'
        });
      }
      return Effect.succeed(data as OaasPack);
    })
  );
};

// Usage
const program = pipe(
  getOaas('/oaas/packs/ontology/core-6d/schema', payFn),
  Effect.tap((pack) => Effect.sync(() => {
    console.log('Received pack:', pack.version);
    console.log('Observed accuracy gain:', pack.observedMetrics.accuracyDelta);
  })),
  Effect.catchAll((error) => {
    if (error._tag === 'PaymentRequired') {
      console.log('Payment required:', error.offer.amount);
      console.log('Expected ROI:', error.offer.expectedROI, '×');
    }
    return Effect.fail(error);
  })
);

// Run
Effect.runPromise(program);
```

---

## Observable Metrics (Learning Loop)

**Key insight:** Agents learn from **observed metrics** to optimize purchasing decisions.

### How Observable Metrics Work

```typescript
// Before purchase: Expected metrics (in 402 response)
const expected = {
  accuracyGain: 0.34,   // 34% predicted
  costSavings: 300,     // $300 predicted
  roi: 20               // 20× predicted
};

// After purchase: Observed metrics (in 200 response)
const observed = {
  accuracyGain: 0.36,   // 36% ACTUAL (better!)
  costSavings: 420,     // $420 ACTUAL (better!)
  timeSaved: 3.5        // 3.5 hours ACTUAL
};

// Agent compares
const comparison = {
  accuracyBeat: observed.accuracyGain > expected.accuracyGain,  // true
  savingsBeat: observed.costSavings > expected.costSavings,     // true
  conclusion: 'Exceeded expectations! Increase willingness-to-pay.'
};
```

### Agent Learning Algorithm

```typescript
class OaasLearningAgent {
  private valuationModel: Map<string, number> = new Map();

  async purchaseWithLearning(path: string) {
    // Step 1: Get offer (402 response)
    const response402 = await fetch(`https://oaas.one.ie${path}`);
    const offer = this.parse402Headers(response402.headers);

    // Step 2: Evaluate offer
    const currentValuation = this.valuationModel.get(path) || offer.price;
    const expectedValue = offer.expectedROI * offer.price;

    if (expectedValue < currentValuation) {
      console.log('Not worth it based on model. Skipping.');
      return null;
    }

    // Step 3: Purchase
    const proof = await this.createPayment(offer);
    const response200 = await fetch(`https://oaas.one.ie${path}`, {
      headers: { 'X-Payment': proof }
    });

    // Step 4: Observe actual value
    const observed = this.parseObservedMetrics(response200.headers);
    const actualValue = observed.costSavings + (observed.timeSaved * 100);

    // Step 5: Update model
    const performanceRatio = actualValue / expectedValue;

    if (performanceRatio > 1.1) {
      // Beat expectations by 10%+
      this.valuationModel.set(path, currentValuation * 1.2);
      console.log(`Exceeded expectations! New valuation: $${currentValuation * 1.2}`);
    } else if (performanceRatio < 0.5) {
      // Underdelivered by 50%+
      this.valuationModel.set(path, currentValuation * 0.5);
      console.log(`Underdelivered. New valuation: $${currentValuation * 0.5}`);
      this.requestRefund(offer);
    }

    // Step 6: Return data + metrics
    return {
      data: await response200.json(),
      observed,
      performanceRatio
    };
  }
}

// Usage
const agent = new OaasLearningAgent();

// First purchase: Uses expected ROI
await agent.purchaseWithLearning('/oaas/packs/ontology/core-6d/schema');
// Output: "Exceeded expectations! New valuation: $18"

// Second purchase: Uses learned valuation
await agent.purchaseWithLearning('/oaas/packs/ontology/core-6d/schema');
// Output: "Worth it at $18 (internal model)"
```

### Metrics Collection Example

```typescript
// Store observed metrics for analysis
interface ObservedMetric {
  path: string;
  timestamp: number;
  expected: {
    accuracy: number;
    costSavings: number;
    roi: number;
  };
  observed: {
    accuracy: number;
    costSavings: number;
    timeSaved: number;
  };
  performanceRatio: number;
}

const metrics: ObservedMetric[] = [];

// After each purchase
metrics.push({
  path: '/oaas/packs/ontology/core-6d/schema',
  timestamp: Date.now(),
  expected: { accuracy: 0.34, costSavings: 300, roi: 20 },
  observed: { accuracy: 0.36, costSavings: 420, timeSaved: 3.5 },
  performanceRatio: 1.4  // 140% of expected
});

// Analyze trends
const avgPerformance = metrics.reduce((sum, m) => sum + m.performanceRatio, 0) / metrics.length;
console.log('Average performance ratio:', avgPerformance); // 1.3 (30% better than expected!)

// Decision: If avg > 1.2, buy monthly unlimited
if (avgPerformance > 1.2) {
  console.log('Consistent overdelivery. Upgrading to monthly unlimited ($30).');
}
```

---

## Free Trial Strategy

### How Free Trials Work

Every agent gets **3 free calls** to prove value before paying:

```typescript
// Worker-side logic (simplified)
async function handleRequest(request: Request) {
  const agentId = getAgentFingerprint(request); // IP + User-Agent hash

  const usageCount = await kv.get(`usage:${agentId}`);

  if (!usageCount || usageCount < 3) {
    // Free tier: Serve resource
    await kv.set(`usage:${agentId}`, (usageCount || 0) + 1, { expirationTtl: 86400 });
    return serveResource(request);
  } else {
    // Exhausted free tier: Require payment
    return emit402(request);
  }
}
```

### Agent-Side Usage

```typescript
// Try free tier first (no payment function)
for (let i = 0; i < 3; i++) {
  const pack = await getOaas('/oaas/packs/ontology/core-6d/schema', null);

  // Experiment with the pack
  const results = await testOntologyOnRealTask(pack);

  // Measure actual value
  console.log(`Trial ${i + 1}/3: Accuracy gain = ${results.accuracyGain}`);
}

// After 3 trials, evaluate
const avgAccuracyGain = 0.36; // Measured across 3 trials
const avgCostSavings = 420;   // Measured
const price = 15;

if (avgCostSavings / price > 10) {
  console.log('Proven ROI. Purchasing paid access.');

  // Now provide payment function
  const pack = await getOaas('/oaas/packs/ontology/core-6d/schema', payFn);
}
```

### Free Trial Limits

| Resource | Free Calls | Reset Period |
|----------|-----------|--------------|
| Ontology packs | 3 | 24 hours |
| Marketing playbooks | 3 | 24 hours |
| Premium packs | 1 | 24 hours |
| Signals streams | 1 hour | 7 days |

**After exhausting free tier:**
- 4th request → **402 Payment Required**
- Reset after 24 hours (or purchase unlimited)

---

## Best Practices

### 1. Start with Free Trial

**DO:**
```typescript
// Try free tier first (prove value)
const pack = await getOaas('/oaas/packs/ontology/core-6d/schema', null);
const value = measureActualValue(pack);

if (value > threshold) {
  // Then purchase
  const pack = await getOaas('/oaas/packs/ontology/core-6d/schema', payFn);
}
```

**DON'T:**
```typescript
// Don't purchase blindly
const pack = await getOaas('/oaas/packs/ontology/core-6d/schema', payFn);
// (What if it doesn't deliver value?)
```

### 2. Track Observed Metrics

**DO:**
```typescript
const { data, observedMetrics } = await getOaas(path, payFn);

// Store for analysis
await db.insert('oaas_metrics', {
  path,
  observed: observedMetrics,
  timestamp: Date.now()
});

// Build internal ROI model
const roi = observedMetrics.costSavings / price;
console.log('Actual ROI:', roi);
```

**DON'T:**
```typescript
const data = await getOaas(path, payFn);
// (Ignoring metrics = no learning)
```

### 3. Buy Monthly if Using 3+/Month

**Break-even analysis:**

| Pack | Per-Call | Monthly Unlimited | Break-Even |
|------|----------|------------------|-----------|
| Ontology 6D | $15 | $30 | 2 calls/month |
| Ontology 3072-dim | $30 | $60 | 2 calls/month |
| Marketing Playbook | $10 | $20 | 2 calls/month |

**DO:**
```typescript
const monthlyUsage = await db.query('SELECT COUNT(*) FROM purchases WHERE path = ? AND timestamp > ?', [
  '/oaas/packs/ontology/core-6d/schema',
  Date.now() - 30 * 24 * 60 * 60 * 1000
]);

if (monthlyUsage > 2) {
  console.log('Using 3+/month. Switching to monthly unlimited.');
  await subscribeMonthly('ontology-6d', 30);
}
```

### 4. Consider Sui Rights NFT for Premium

**DO:**
```typescript
const premiumUsage = await calculatePremiumUsage();
// 20 calls/month × $30 = $600/month
// With Sui Rights: 20 calls × $15 = $300/month
// Savings: $300/month - $299 NFT = break-even in 1 month

if (premiumUsage > 20) {
  console.log('Purchasing Sui Rights NFT ($299) for 50% off premium.');
  await purchaseSuiRightsNFT();
}
```

### 5. Cache Packs Locally

**DO:**
```typescript
// Cache pack for 1 hour (reduce redundant purchases)
const cacheKey = `oaas:${path}`;
let pack = await cache.get(cacheKey);

if (!pack) {
  pack = await getOaas(path, payFn);
  await cache.set(cacheKey, pack, { ttl: 3600 }); // 1 hour
}

return pack;
```

**DON'T:**
```typescript
// Don't re-purchase every time
const pack = await getOaas(path, payFn); // $15 each call!
// (Wasteful if used multiple times in short period)
```

### 6. Report Issues if Observed << Expected

**DO:**
```typescript
const { observedMetrics, expected } = await getOaas(path, payFn);

if (observedMetrics.accuracyDelta < expected.accuracy * 0.5) {
  // Underdelivered by 50%+
  await reportIssue({
    path,
    expected,
    observed: observedMetrics,
    message: 'Accuracy gain significantly below expected'
  });

  // Request refund
  await requestRefund(transactionHash);
}
```

### 7. Use TypeScript for Type Safety

**DO:**
```typescript
import { z } from 'zod';

const OntologySchema = z.object({
  dimensions: z.array(z.object({
    name: z.string(),
    schema: z.any()
  }))
});

const pack = await getOaas(path, payFn);
const validated = OntologySchema.parse(pack); // Type-safe!
```

---

## Troubleshooting

### Issue: 402 Payment Required (After Free Trial)

**Symptom:**
```http
HTTP/1.1 402 Payment Required
X402-Amount: 15.00
```

**Solution:**
```typescript
// Provide payment function
const payFn = async (offer) => {
  const wallet = new Wallet(process.env.PRIVATE_KEY);
  return await signPayment(wallet, offer);
};

const pack = await getOaas(path, payFn);
```

### Issue: 403 Forbidden (bad-payment)

**Symptom:**
```http
HTTP/1.1 403 Forbidden
{ "error": "bad_payment", "reason": "underpayment" }
```

**Causes:**
- Sent less USDC than required
- Wrong recipient address
- Invalid signature

**Solution:**
```typescript
// Verify payment details match 402 headers
const proof = await payFn({
  amount: parseFloat(headers.get('X402-Amount')), // Exact amount!
  recipient: headers.get('X402-Recipient'),       // Exact recipient!
  nonce: headers.get('X402-Nonce')                // Exact nonce!
});
```

### Issue: 403 Forbidden (no-right)

**Symptom:**
```http
HTTP/1.1 403 Forbidden
{ "error": "no_right", "required": "one:rights/oaas-premium-v1" }
```

**Solution:**
```typescript
// Purchase Sui Rights NFT
await purchaseSuiRightsNFT('https://oaas.one.ie/rights');

// Retry request (Worker will verify ownership)
const pack = await getOaas('/oaas/packs/ontology/premium-3072/schema', payFn);
```

### Issue: 410 Gone (expired-nonce)

**Symptom:**
```http
HTTP/1.1 410 Gone
{ "error": "expired_nonce", "reason": "consumed" }
```

**Causes:**
- Nonce older than 5 minutes
- Nonce already used (replay attempt)

**Solution:**
```typescript
// Request resource again (gets new nonce)
const response402 = await fetch(path);
const newNonce = response402.headers.get('X402-Nonce');

// Create payment with new nonce
const proof = await payFn({ ...offer, nonce: newNonce });

// Retry within 5 minutes
const response200 = await fetch(path, { headers: { 'X-Payment': proof } });
```

### Issue: 429 Too Many Requests

**Symptom:**
```http
HTTP/1.1 429 Too Many Requests
X-Rate-Limit-Limit: 100
X-Rate-Limit-Remaining: 0
```

**Solution:**
```typescript
// Option 1: Wait until reset
const resetAt = parseInt(headers.get('X-Rate-Limit-Reset') || '0');
const waitMs = resetAt * 1000 - Date.now();
await new Promise(resolve => setTimeout(resolve, waitMs));

// Option 2: Upgrade to monthly unlimited
await subscribeMonthly('ontology-6d', 30);
```

### Issue: Observable Metrics Lower Than Expected

**Symptom:**
```typescript
// Expected: 34% accuracy gain
// Observed: 18% accuracy gain (underdelivered!)
```

**Solution:**
```typescript
// 1. Verify you're using the pack correctly
const ontology = await getOaas(path, payFn);
const schema = ontology.dimensions.find(d => d.name === 'groups');

// Are you applying the schema?
await generateConvexSchema(schema); // ✅

// Or ignoring it?
const myOwnSchema = { ... }; // ❌ (No benefit!)

// 2. If still underdelivering, report issue
if (observed.accuracyDelta < expected.accuracy * 0.7) {
  await reportIssue({
    path,
    expected,
    observed,
    usageDetails: 'Applied schema correctly, still low accuracy'
  });
}
```

---

## Real-World Integration Examples

### Example 1: Claude Building Multi-Tenant SaaS

```typescript
// User: "Build a multi-tenant SaaS platform"

// Claude's code:
import { getOaas } from '@one/oaas-client';

async function buildSaaS() {
  // Step 1: Purchase ontology (free trial first)
  const ontology = await getOaas('/oaas/packs/ontology/core-6d/schema', null);

  // Step 2: Generate Convex schema from ontology
  const convexSchema = generateSchemaFromOntology(ontology);
  await fs.writeFile('backend/convex/schema.ts', convexSchema);

  // Step 3: Generate mutations (CRUD operations)
  const mutations = generateMutationsFromOntology(ontology);
  await fs.writeFile('backend/convex/mutations/entities.ts', mutations);

  // Step 4: Generate frontend components
  const components = generateComponentsFromOntology(ontology);
  await fs.writeFile('src/components/EntityManager.tsx', components);

  // Step 5: Measure results
  const results = await testImplementation();

  console.log('Results:', {
    schemaCorrect: results.schemaCorrect,      // true (vs false without ontology)
    securityHoles: results.securityHoles,      // 0 (vs 3 without ontology)
    performanceIssues: results.performanceIssues, // 0 (vs 2 without ontology)
    timeTaken: results.timeTaken               // 45min (vs 4 hours without ontology)
  });

  // Observed metrics prove value!
  // Accuracy: 36% better than generic approach
  // Cost savings: $420 (no rework needed)
  // Time saved: 3.5 hours
}
```

### Example 2: GPT-4 Building Marketing Campaign

```typescript
// User: "Create a go-to-market strategy for our B2B SaaS product"

// GPT-4's code:
import { getOaas } from '@one/oaas-client';

async function createGTMStrategy() {
  // Step 1: Purchase marketing playbook
  const playbook = await getOaas('/oaas/packs/playbook/marketing/strategy', payFn);

  // Step 2: Extract ICP framework
  const icpFramework = playbook.frameworks.find(f => f.name === 'ICP Definition');

  // Step 3: Apply to our product
  const ourICP = {
    demographics: {
      company_size: '50-500 employees',
      industry: 'B2B SaaS',
      role: 'VP Engineering, CTO',
      budget: '$50k-500k/year'
    },
    psychographics: icpFramework.template.psychographics
  };

  // Step 4: Extract positioning framework
  const posFramework = playbook.frameworks.find(f => f.name === 'POV Positioning');

  const ourPositioning = {
    unique_mechanism: '6-dimension ontology',
    bold_claim: posFramework.framework.bold_claim,
    enemy: 'Complex tech stacks',
    promised_land: 'Ship features in hours'
  };

  // Step 5: Generate messaging
  const messaging = generateMessaging(ourICP, ourPositioning);

  console.log('GTM Strategy:', {
    icp: ourICP,
    positioning: ourPositioning,
    messaging
  });

  // Observed: 45% faster GTM than generic approach!
}
```

---

## Summary Checklist

Before deploying your agent integration:

- [ ] Installed x402 SDK
- [ ] Created wallet (Base network)
- [ ] Tried free tier (3 calls) to prove value
- [ ] Observed metrics and calculated ROI
- [ ] Implemented payment function (`payFn`)
- [ ] Tested paid purchase (402 → pay → 200)
- [ ] Cached packs locally (reduce redundant purchases)
- [ ] Tracked observed metrics (build learning model)
- [ ] Handled errors (403, 410, 429, 500)
- [ ] Considered monthly unlimited if 3+ calls/month
- [ ] Considered Sui Rights NFT if using premium tier

**Ready to launch!** 🚀

---

## Next Steps

1. **Read API docs:** `/docs/API.md` (complete reference)
2. **Try free tier:** 3 calls to prove value
3. **Measure ROI:** Track observed metrics
4. **Purchase if valuable:** Provide `payFn`
5. **Scale:** Monthly unlimited or Sui Rights NFT
6. **Learn:** Continuously update valuation model based on observed vs expected

**Support:**
- Discord: https://discord.gg/oneie
- Email: support@one.ie
- GitHub: https://github.com/one-ie/oaas

---

**Built for autonomous agents. Proven by observable metrics. Fair pricing, fair value.**

**Version:** 1.0.0 | **Last Updated:** 2025-11-14
