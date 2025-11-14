# Crypto Payment Components

**7 production-ready components for sending, receiving, and managing cryptocurrency payments.**

## Components Overview

### 1. SendToken
Send ERC-20/SPL tokens with full gas estimation and ENS support.

```tsx
import { SendToken } from "@/components/ontology-ui/crypto/payments";

<SendToken
  walletAddress="0x..."
  chainId={1}
  onSend={(txHash) => console.log("Sent:", txHash)}
  onError={(error) => console.error(error)}
/>
```

**Features:**
- Token selection dropdown with balances
- Amount input with "Max" button
- ENS name resolution
- Real-time gas estimation
- Transaction confirmation modal
- USD value preview

---

### 2. SendNative
Send native cryptocurrency (ETH/SOL/MATIC) with simplified interface.

```tsx
import { SendNative } from "@/components/ontology-ui/crypto/payments";

<SendNative
  walletAddress="0x..."
  chainId={1}
  balance="1.234"
  symbol="ETH"
  onSend={(txHash) => console.log("Sent:", txHash)}
/>
```

**Features:**
- Quick amount buttons ($10, $50, $100, $500)
- Max button with gas reservation
- USD value preview
- Simplified interface
- Multi-chain support

---

### 3. ReceivePayment
Generate payment requests with QR codes and shareable links.

```tsx
import { ReceivePayment } from "@/components/ontology-ui/crypto/payments";

<ReceivePayment
  address="0x..."
  chainId={1}
  currencies={["ETH", "USDC", "USDT"]}
  showQR={true}
  onCopy={() => console.log("Copied!")}
/>
```

**Features:**
- QR code generation
- Copy address button
- Optional amount field
- Share link generation
- Multiple currency support

---

### 4. PaymentLink
Create shareable payment links with custom settings.

```tsx
import { PaymentLink } from "@/components/ontology-ui/crypto/payments";

<PaymentLink
  defaultAmount="0.1"
  defaultCurrency="ETH"
  onLinkCreated={(link) => console.log("Link:", link)}
/>
```

**Features:**
- Custom amount and description
- Expiration time (1h, 24h, 7d, 30d, never)
- Success/cancel redirect URLs
- QR code preview
- Share functionality

---

### 5. BatchSend
Send to multiple addresses at once (up to 100 recipients).

```tsx
import { BatchSend } from "@/components/ontology-ui/crypto/payments";

<BatchSend
  walletAddress="0x..."
  chainId={1}
  maxRecipients={100}
  onSend={(txHash) => console.log("Batch sent:", txHash)}
/>
```

**Features:**
- CSV upload support (address,amount,memo)
- Manual address entry
- Preview total amounts
- Progress tracking
- Transaction result summary

**CSV Format:**
```csv
0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb,0.1,Payment 1
0x456...,0.2,Payment 2
0x789...,0.3,Payment 3
```

---

### 6. RecurringPayment
Schedule automatic recurring payments.

```tsx
import { RecurringPayment } from "@/components/ontology-ui/crypto/payments";

<RecurringPayment
  walletAddress="0x..."
  chainId={1}
  onSchedule={(id) => console.log("Scheduled:", id)}
  onCancel={(id) => console.log("Cancelled:", id)}
/>
```

**Features:**
- Frequency selection (daily, weekly, monthly)
- Start/end date
- Auto-execute or manual approval
- Payment history
- Pause/resume/cancel

---

### 7. GasEstimator
Estimate transaction gas fees with optimization tips.

```tsx
import { GasEstimator } from "@/components/ontology-ui/crypto/payments";

<GasEstimator
  to="0x..."
  value="0.1"
  chainId={1}
  showTrends={true}
  showOptimizations={true}
/>
```

**Features:**
- Real-time gas prices (slow/average/fast)
- USD cost estimates
- EIP-1559 support (base fee + priority fee)
- Historical trends (24h avg/low/high)
- Gas optimization tips

---

## Integration with Effect.ts

All components use the `PaymentService` for blockchain interactions:

```typescript
import { Effect } from "effect";
import * as PaymentService from "@/lib/services/crypto/PaymentService";

// Send token
const tx = await Effect.runPromise(
  PaymentService.sendToken({
    tokenAddress: "0x...",
    recipientAddress: "0x...",
    amount: "1.5",
    chainId: 1,
  })
);

// Estimate gas
const estimate = await Effect.runPromise(
  PaymentService.estimateGas("0x...", "0.1", undefined, 1)
);

// Create payment link
const link = await Effect.runPromise(
  PaymentService.createPaymentLink("0.1", "ETH", "Coffee payment")
);
```

---

## Error Handling

All components handle errors with Effect.ts tagged unions:

```typescript
type PaymentError =
  | { _tag: "InsufficientBalance"; required: string; available: string }
  | { _tag: "InvalidAddress"; address: string }
  | { _tag: "InvalidAmount"; amount: string }
  | { _tag: "GasEstimationFailed"; message: string }
  | { _tag: "TransactionFailed"; txHash: string; message: string }
  | { _tag: "UserRejected"; message: string };
```

---

## Styling

All components use:
- **shadcn/ui** for base components
- **Tailwind CSS v4** for styling
- **Dark mode** support built-in
- **Responsive** design (mobile-first)

---

## Backend Integration (Optional)

Components work standalone with mock data. To connect real blockchain:

1. **Install dependencies:**
```bash
bun add viem wagmi @rainbow-me/rainbowkit
```

2. **Update PaymentService.ts:**
```typescript
// Replace MOCK_MODE = true with:
const MOCK_MODE = false;

// Implement real blockchain calls using viem/wagmi
```

3. **Add wallet connection:**
```tsx
import { WalletConnectButton } from "@/components/ontology-ui/crypto/wallet";

<WalletConnectButton onConnect={(wallet) => setWallet(wallet)} />
```

---

## Customization

### Props Available on All Components

```typescript
interface CommonProps {
  variant?: "default" | "compact" | "expanded";
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  className?: string;
}
```

### Example Customizations

```tsx
// Compact variant
<SendToken variant="compact" size="sm" />

// Custom styling
<GasEstimator className="max-w-md mx-auto" />

// Non-interactive (display only)
<ReceivePayment interactive={false} />
```

---

## Multi-Chain Support

All components support multiple chains:

```typescript
const SUPPORTED_CHAINS = {
  1: "Ethereum",
  137: "Polygon",
  42161: "Arbitrum",
  10: "Optimism",
  8453: "Base",
};
```

Switch chains:
```tsx
<SendNative chainId={137} symbol="MATIC" />
<GasEstimator chainId={42161} />
```

---

## Testing

Components include mock data for development:

```typescript
// PaymentService.ts
const MOCK_MODE = true; // Enable mock data

// Mock tokens
const MOCK_TOKENS = [
  { symbol: "USDC", balance: "1000.50", ... },
  { symbol: "USDT", balance: "500.25", ... },
];
```

---

## Production Deployment

**Before production:**

1. Set `MOCK_MODE = false` in `PaymentService.ts`
2. Add real wallet connection (wagmi/RainbowKit)
3. Configure API keys (Etherscan, Alchemy, Infura)
4. Add transaction signing with user wallets
5. Test on testnets (Goerli, Sepolia, Mumbai)

---

## Examples

### Complete Payment Flow

```tsx
import {
  SendToken,
  ReceivePayment,
  GasEstimator,
} from "@/components/ontology-ui/crypto/payments";

export function PaymentPage() {
  const [wallet, setWallet] = useState<Wallet | null>(null);

  return (
    <div className="grid grid-cols-2 gap-4">
      <SendToken
        walletAddress={wallet?.address}
        onSend={(txHash) => console.log("Transaction:", txHash)}
      />
      <ReceivePayment
        address={wallet?.address || "0x..."}
        showQR={true}
      />
      <GasEstimator
        chainId={wallet?.chainId || 1}
        showTrends={true}
      />
    </div>
  );
}
```

### Subscription Service

```tsx
import { RecurringPayment } from "@/components/ontology-ui/crypto/payments";

<RecurringPayment
  walletAddress="0x..."
  onSchedule={(id) => {
    // Save to database
    saveSubscription({ id, status: "active" });
  }}
  onCancel={(id) => {
    // Cancel subscription
    cancelSubscription(id);
  }}
/>
```

---

## Resources

- **Payment Service**: `/web/src/lib/services/crypto/PaymentService.ts`
- **Type Definitions**: `/web/src/components/ontology-ui/crypto/payments/types.ts`
- **shadcn/ui Docs**: https://ui.shadcn.com
- **viem Docs**: https://viem.sh
- **wagmi Docs**: https://wagmi.sh

---

**Built with Effect.ts, React 19, TypeScript, and shadcn/ui.**
