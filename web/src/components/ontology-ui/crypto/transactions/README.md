# Transaction Management Components

Complete transaction management system with history tracking, real-time status updates, and tax export functionality.

## Components

### 1. TransactionHistory
Full transaction history with virtualized list, filtering, and pagination.

**Features:**
- Virtualized list for thousands of transactions
- Filter by type (send/receive/swap/etc.)
- Search by address or hash
- Date range filtering
- CSV export
- Pagination

**Usage:**
```tsx
import { TransactionHistory } from "@/components/ontology-ui/crypto/transactions";

<TransactionHistory
  transactions={transactions}
  onTransactionClick={(tx) => console.log(tx)}
  onExport={(format) => console.log("Export:", format)}
  pageSize={50}
  enableVirtualization={true}
/>
```

---

### 2. TransactionDetail
Transaction details modal with complete information.

**Features:**
- Full transaction information
- Block explorer link
- Copy transaction hash
- Gas details and cost
- ENS address resolution
- Timestamp and confirmations
- Status badge

**Usage:**
```tsx
import { TransactionDetail } from "@/components/ontology-ui/crypto/transactions";

<TransactionDetail
  transaction={transaction}
  trigger={<Button>View Details</Button>}
  open={isOpen}
  onOpenChange={setIsOpen}
/>
```

---

### 3. TransactionStatus
Real-time transaction status with progress tracking.

**Features:**
- Pending confirmations counter
- Progress bar (0-12 confirmations)
- Estimated time remaining
- WebSocket real-time updates
- Success/failure notifications
- Live status updates

**Usage:**
```tsx
import { TransactionStatus } from "@/components/ontology-ui/crypto/transactions";

<TransactionStatus
  transaction={transaction}
  targetConfirmations={12}
  onComplete={(tx) => console.log("Confirmed!", tx)}
  enableRealtime={true}
/>
```

---

### 4. TransactionReceipt
Printable transaction receipt with professional design.

**Features:**
- Professional receipt layout
- Transaction summary
- QR code with tx hash
- Print/download PDF
- Company logo support
- Receipt number generation
- Print-optimized styles

**Usage:**
```tsx
import { TransactionReceipt } from "@/components/ontology-ui/crypto/transactions";

<TransactionReceipt
  transaction={transaction}
  companyName="Your Company"
  companyLogo="/logo.png"
  receiptNumber="RCP-123456"
  showQRCode={true}
/>
```

---

### 5. PendingTransactions
Live feed of pending transactions with management actions.

**Features:**
- Live pending transaction feed
- Speed up transaction (increase gas)
- Cancel transaction
- Estimated confirmation time
- Auto-refresh
- Progress indicators

**Usage:**
```tsx
import { PendingTransactions } from "@/components/ontology-ui/crypto/transactions";

<PendingTransactions
  transactions={pendingTxs}
  onSpeedUp={(hash, gasPrice) => console.log("Speed up:", hash, gasPrice)}
  onCancel={(hash) => console.log("Cancel:", hash)}
  onRefresh={() => console.log("Refresh")}
  autoRefresh={true}
  refreshInterval={10000}
/>
```

---

### 6. FailedTransactions
Failed transaction handling with retry functionality.

**Features:**
- List of failed transactions
- Error message parsing
- Retry with adjusted gas
- Suggested gas prices
- Support contact
- Accordion layout

**Usage:**
```tsx
import { FailedTransactions } from "@/components/ontology-ui/crypto/transactions";

<FailedTransactions
  transactions={failedTxs}
  onRetry={(hash, gasPrice) => console.log("Retry:", hash, gasPrice)}
  onContactSupport={(hash) => console.log("Support:", hash)}
/>
```

---

### 7. TransactionExport
Export transactions for tax purposes.

**Features:**
- Export to CSV
- Koinly format export
- CoinTracker format export
- Form 8949 (IRS) compatible
- Custom date ranges
- Transaction type filtering
- Metadata options

**Usage:**
```tsx
import { TransactionExport } from "@/components/ontology-ui/crypto/transactions";

<TransactionExport
  transactions={transactions}
  walletAddress="0x..."
  onExport={(format, txs) => console.log("Export:", format, txs.length)}
/>
```

---

## Database Schema (Convex)

### Transactions Table

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  transactions: defineTable({
    // User reference
    userId: v.string(),

    // Transaction data
    hash: v.string(),
    from: v.string(),
    to: v.string(),
    value: v.string(),
    valueUsd: v.optional(v.number()),

    // Gas details
    gasUsed: v.optional(v.string()),
    gasPrice: v.optional(v.string()),
    gasCost: v.optional(v.string()),
    gasCostUsd: v.optional(v.number()),

    // Block information
    blockNumber: v.optional(v.number()),
    confirmations: v.number(),

    // Status and metadata
    timestamp: v.number(),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("failed"),
      v.literal("cancelled"),
      v.literal("replaced")
    ),
    type: v.union(
      v.literal("send"),
      v.literal("receive"),
      v.literal("swap"),
      v.literal("approve"),
      v.literal("contract"),
      v.literal("mint"),
      v.literal("burn"),
      v.literal("stake"),
      v.literal("unstake")
    ),

    // Network
    chainId: v.number(),
    chainName: v.string(),

    // Token (optional)
    token: v.optional(v.object({
      address: v.string(),
      symbol: v.string(),
      decimals: v.number(),
    })),

    // Additional metadata
    metadata: v.optional(v.any()),
    error: v.optional(v.string()),
    nonce: v.optional(v.number()),
    data: v.optional(v.string()),

    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
  })
  .index("by_user", ["userId"])
  .index("by_hash", ["hash"])
  .index("by_status", ["userId", "status"])
  .index("by_type", ["userId", "type"])
  .index("by_chain", ["userId", "chainId"])
  .index("by_timestamp", ["userId", "timestamp"])
  .index("by_user_and_chain", ["userId", "chainId", "timestamp"]),
});
```

---

## Convex Queries

### List Transactions

```typescript
// convex/queries/transactions.ts
import { query } from "../_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    userId: v.string(),
    status: v.optional(v.string()),
    type: v.optional(v.string()),
    chainId: v.optional(v.number()),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("transactions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId));

    if (args.status) {
      query = ctx.db
        .query("transactions")
        .withIndex("by_status", (q) =>
          q.eq("userId", args.userId).eq("status", args.status)
        );
    }

    if (args.type) {
      query = ctx.db
        .query("transactions")
        .withIndex("by_type", (q) =>
          q.eq("userId", args.userId).eq("type", args.type)
        );
    }

    if (args.chainId) {
      query = ctx.db
        .query("transactions")
        .withIndex("by_chain", (q) =>
          q.eq("userId", args.userId).eq("chainId", args.chainId)
        );
    }

    const transactions = await query
      .order("desc")
      .take(args.limit || 100);

    return transactions.slice(args.offset || 0);
  },
});

export const getByHash = query({
  args: {
    hash: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("transactions")
      .withIndex("by_hash", (q) => q.eq("hash", args.hash))
      .first();
  },
});
```

---

## Convex Mutations

### Create Transaction

```typescript
// convex/mutations/transactions.ts
import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    userId: v.string(),
    hash: v.string(),
    from: v.string(),
    to: v.string(),
    value: v.string(),
    chainId: v.number(),
    chainName: v.string(),
    type: v.string(),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    return await ctx.db.insert("transactions", {
      ...args,
      confirmations: 0,
      timestamp: now,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateStatus = mutation({
  args: {
    hash: v.string(),
    status: v.string(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const transaction = await ctx.db
      .query("transactions")
      .withIndex("by_hash", (q) => q.eq("hash", args.hash))
      .first();

    if (!transaction) {
      throw new Error("Transaction not found");
    }

    await ctx.db.patch(transaction._id, {
      status: args.status as any,
      metadata: args.metadata,
      updatedAt: Date.now(),
    });
  },
});

export const updateConfirmations = mutation({
  args: {
    hash: v.string(),
    confirmations: v.number(),
    blockNumber: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const transaction = await ctx.db
      .query("transactions")
      .withIndex("by_hash", (q) => q.eq("hash", args.hash))
      .first();

    if (!transaction) {
      throw new Error("Transaction not found");
    }

    await ctx.db.patch(transaction._id, {
      confirmations: args.confirmations,
      blockNumber: args.blockNumber,
      status: args.confirmations >= 12 ? "confirmed" : transaction.status,
      updatedAt: Date.now(),
    });
  },
});
```

---

## Integration with TransactionService

```typescript
// Example: Using TransactionService with Convex
import { TransactionService } from "@/lib/services/crypto/TransactionService";
import { ConvexHttpClient } from "convex/browser";

const convexClient = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

const transactionService = new TransactionService(
  {
    1: process.env.ETHEREUM_RPC_URL!,
    137: process.env.POLYGON_RPC_URL!,
  },
  convexClient
);

// Get transaction and store in Convex
const tx = await Effect.runPromise(
  transactionService.getTransaction(hash, chainId)
);

await Effect.runPromise(
  transactionService.storeTransaction(tx, userId)
);
```

---

## Real-Time Updates

### WebSocket Integration (Recommended)

```typescript
// Example: Real-time transaction updates
import { useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

function useTransactionUpdates(userId: string) {
  // Automatically updates when transactions change
  const transactions = useQuery(api.queries.transactions.list, { userId });

  return transactions;
}
```

---

## Export Formats

### CSV Format
Standard CSV with all transaction fields.

### Koinly Format
Compatible with Koinly tax software:
- Date, Sent Amount, Sent Currency
- Received Amount, Received Currency
- Fee Amount, Fee Currency
- Label, Description, TxHash

### CoinTracker Format
Compatible with CoinTracker:
- Date, Received Quantity/Currency
- Sent Quantity/Currency
- Fee Amount/Currency
- Tag, Transaction Hash

### Form 8949 (IRS)
US tax form compatible:
- Description of property
- Date acquired/sold
- Proceeds, Cost basis
- Gain/Loss calculation

---

## Performance Considerations

1. **Virtualized Lists**: Use react-window for 1000+ transactions
2. **Pagination**: Default 50 items per page
3. **Caching**: 10-second cache for RPC calls
4. **Indexes**: Optimized Convex indexes for fast queries
5. **Real-time**: Convex subscriptions auto-update UI

---

## Security Notes

1. **Never expose private keys** in transaction data
2. **Validate all inputs** before RPC calls
3. **Rate limit** export operations
4. **Sanitize metadata** before storage
5. **Audit transaction operations** for compliance

---

## Built With

- React 19
- TypeScript
- shadcn/ui components
- Effect.ts for error handling
- Convex for real-time database
- viem for blockchain interactions
- react-window for virtualization
- jsPDF for PDF generation (TransactionReceipt)

---

**Transaction management for the modern Web3 experience! 🚀**
