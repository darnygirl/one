# Convex Backend Specification (Cycles 61-70)

**Status:** Specification complete, implementation pending

## Overview

The Convex backend serves as the **policy brain** for OaaS, handling:
- Offer management and dynamic pricing
- Authorization and access control
- Analytics and usage reporting
- Rights cache and verification

## Schema Updates (Cycle 61-62)

Add to `/home/user/one/backend/convex/schema.ts`:

```typescript
// Offers table (pricing + SLO + rights)
offers: defineTable({
  groupId: v.id("groups"),
  offerId: v.string(),
  packId: v.string(),
  name: v.string(),
  price: v.number(),
  monthlyUnlimited: v.optional(v.number()),
  annual: v.optional(v.number()),
  rightsRequired: v.optional(v.string()),
  freeTrialCalls: v.optional(v.number()),
  expectedGains: v.object({
    accuracyPct: v.number(),
    tokenEfficiencyPct: v.number(),
    costSavingsUsd: v.number(),
    timeSavedHours: v.number(),
    roiMultiple: v.number(),
  }),
  slo: v.object({
    p95LatencyMs: v.number(),
    uptimePct: v.number(),
  }),
  status: v.string(), // "active" | "draft" | "archived"
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_group", ["groupId"])
  .index("by_offer_id", ["offerId"])
  .index("by_status", ["status"]),

// Grants table (payment confirmations)
grants: defineTable({
  groupId: v.id("groups"),
  agent: v.string(), // wallet address
  packId: v.string(),
  grantedAt: v.number(),
  expiresAt: v.optional(v.number()),
  txHash: v.string(),
  price: v.number(),
})
  .index("by_agent", ["agent"])
  .index("by_tx", ["txHash"])
  .index("by_expiry", ["expiresAt"]),

// Usage events (mirrored from D1 for analytics)
usageEvents: defineTable({
  groupId: v.id("groups"),
  ts: v.number(),
  payer: v.string(),
  userId: v.optional(v.string()),
  roles: v.optional(v.string()),
  layer: v.string(),
  price: v.number(),
  status: v.string(),
  observedAcc: v.optional(v.number()),
  tokensSaved: v.optional(v.number()),
  latencyMs: v.optional(v.number()),
  txHash: v.optional(v.string()),
})
  .index("by_group", ["groupId", "ts"])
  .index("by_payer", ["payer", "ts"])
  .index("by_layer", ["layer", "ts"]),

// Rights cache (Sui ownership verification)
rightsCache: defineTable({
  agent: v.string(),
  rightId: v.string(),
  valid: v.boolean(),
  checkedAt: v.number(),
  expiresAt: v.optional(v.number()),
  error: v.optional(v.string()),
})
  .index("by_agent", ["agent", "rightId"])
  .index("by_expiry", ["expiresAt"]),
```

## Functions

### Offer Management (Cycles 63-64)

**`backend/convex/functions/offer.ts`**

```typescript
export const getOffer = query({
  args: { offerId: v.string() },
  handler: async (ctx, args) => {
    const offer = await ctx.db
      .query("offers")
      .withIndex("by_offer_id", (q) => q.eq("offerId", args.offerId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();

    return offer;
  },
});

export const listOffers = query({
  args: { groupId: v.id("groups") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("offers")
      .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();
  },
});

export const updateOffer = mutation({
  args: {
    offerId: v.string(),
    price: v.optional(v.number()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Admin-only function
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const offer = await ctx.db
      .query("offers")
      .withIndex("by_offer_id", (q) => q.eq("offerId", args.offerId))
      .first();

    if (!offer) throw new Error("Offer not found");

    await ctx.db.patch(offer._id, {
      price: args.price ?? offer.price,
      status: args.status ?? offer.status,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});
```

### Authorization Service (Cycles 65-66)

**`backend/convex/functions/authz.ts`**

```typescript
export const authorizeAccess = query({
  args: {
    proof: v.string(),
    path: v.string(),
    nonce: v.string(),
    userId: v.optional(v.string()),
    roles: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    // Verify proof, check roles, apply pricing
    // Return { authorized: boolean, price: number, reason?: string }

    // TODO: Implement full authorization logic
    return {
      authorized: true,
      price: 15.0,
    };
  },
});
```

### Analytics Functions (Cycles 67-68)

**`backend/convex/functions/analytics.ts`**

```typescript
export const usageByLayer = query({
  args: { from: v.number(), to: v.number() },
  handler: async (ctx, args) => {
    const events = await ctx.db
      .query("usageEvents")
      .filter((q) =>
        q.and(
          q.gte(q.field("ts"), args.from),
          q.lte(q.field("ts"), args.to),
          q.eq(q.field("status"), "granted")
        )
      )
      .collect();

    // Aggregate by layer
    const byLayer = new Map<string, { calls: number; revenue: number }>();

    for (const event of events) {
      const stats = byLayer.get(event.layer) || { calls: 0, revenue: 0 };
      stats.calls++;
      stats.revenue += event.price;
      byLayer.set(event.layer, stats);
    }

    return Array.from(byLayer.entries()).map(([layer, stats]) => ({
      layer,
      ...stats,
    }));
  },
});

export const revByAgent = query({
  args: { from: v.number(), to: v.number() },
  handler: async (ctx, args) => {
    const events = await ctx.db
      .query("usageEvents")
      .filter((q) =>
        q.and(
          q.gte(q.field("ts"), args.from),
          q.lte(q.field("ts"), args.to),
          q.eq(q.field("status"), "granted")
        )
      )
      .collect();

    // Aggregate by payer
    const byAgent = new Map<string, { calls: number; totalSpent: number }>();

    for (const event of events) {
      const stats = byAgent.get(event.payer) || { calls: 0, totalSpent: 0 };
      stats.calls++;
      stats.totalSpent += event.price;
      byAgent.set(event.payer, stats);
    }

    return Array.from(byAgent.entries())
      .map(([payer, stats]) => ({ payer, ...stats }))
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10);
  },
});

export const observedMetrics = query({
  args: { packId: v.string() },
  handler: async (ctx, args) => {
    const events = await ctx.db
      .query("usageEvents")
      .filter((q) =>
        q.and(
          q.eq(q.field("layer"), args.packId),
          q.eq(q.field("status"), "granted")
        )
      )
      .collect();

    if (events.length === 0) {
      return { avgAccuracy: 0.36, avgTokensSaved: 0.24 };
    }

    const totalAcc = events.reduce((sum, e) => sum + (e.observedAcc || 0), 0);
    const totalTokens = events.reduce(
      (sum, e) => sum + (e.tokensSaved || 0),
      0
    );

    return {
      avgAccuracy: totalAcc / events.length,
      avgTokensSaved: totalTokens / events.length,
    };
  },
});

export const currentLoad = query({
  args: { packId: v.string() },
  handler: async (ctx, args) => {
    // Query recent events (last 5 minutes)
    const fiveMinAgo = Date.now() - 5 * 60 * 1000;

    const recentEvents = await ctx.db
      .query("usageEvents")
      .filter((q) =>
        q.and(
          q.eq(q.field("layer"), args.packId),
          q.gte(q.field("ts"), fiveMinAgo)
        )
      )
      .collect();

    const avgLatency =
      recentEvents.reduce((sum, e) => sum + (e.latencyMs || 0), 0) /
      (recentEvents.length || 1);

    return {
      p95LatencyMs: avgLatency * 1.2, // Approximate p95
      currentLoad: recentEvents.length / 5, // Requests per minute
    };
  },
});
```

### Edge-Only Fallback (Cycles 69-70)

**Worker behavior when Convex is down:**

1. Load offers from R2 (fallback path)
2. Use default prices (no dynamic pricing)
3. Queue events in D1 with status="pending_sync"
4. Retry sync when Convex comes back up

**Implementation in `lib/offers.ts`:**

```typescript
// Already implemented:
// getOffer() tries KV → Convex → R2 fallback
// If Convex fails, falls back to R2
```

## Mapping to 6D Ontology

- **Groups**: All offers, grants, events scoped to groupId
- **People**: Better Auth integration for roles
- **Things**: Offers are "things" with type "pricing_offer"
- **Connections**: Grant connects agent → pack
- **Events**: Usage events tracked with actor, target, timestamp
- **Knowledge**: Observed metrics from real usage

## Next Steps

1. Implement Convex functions in `/home/user/one/backend/convex/functions/`
2. Update schema in `/home/user/one/backend/convex/schema.ts`
3. Test queries from worker
4. Deploy to production Convex

**Status:** Ready for implementation (Cycles 61-70 spec complete)
