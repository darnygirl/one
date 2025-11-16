# API Reference - @one/x402

Complete API documentation for all components, hooks, and utilities.

## Components

### Web3Provider

RainbowKit + wagmi provider for wallet connection.

```tsx
import { Web3Provider } from '@one/x402/components/Web3Provider';

<Web3Provider>
  {/* Your app */}
</Web3Provider>
```

**Props:** None

**Required:** Must wrap your app to enable X402 payments.

---

### WalletConnectButton

Multi-wallet connection button with RainbowKit UI.

```tsx
import { WalletConnectButton } from '@one/x402/components/WalletConnectButton';

<WalletConnectButton />
```

**Props:** None

**Features:**
- Supports MetaMask, Coinbase Wallet, WalletConnect, and more
- Shows connected address
- Network switching
- Disconnect option

---

### X402PaymentButton

Basic X402 payment button for single transactions.

```tsx
import { X402PaymentButton } from '@one/x402/components/X402PaymentButton';

<X402PaymentButton
  amount={99.99}
  recipientAddress="0x..."
  onSuccess={(txHash) => console.log(txHash)}
  onError={(error) => console.error(error)}
  className="custom-class"
  disabled={false}
/>
```

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `amount` | `number` | ✅ | Amount in USDC (e.g., 99.99) |
| `recipientAddress` | `string` | ✅ | Merchant wallet address (0x...) |
| `onSuccess` | `(txHash: string) => void` | ❌ | Called when payment succeeds |
| `onError` | `(error: Error) => void` | ❌ | Called when payment fails |
| `className` | `string` | ❌ | Additional CSS classes |
| `disabled` | `boolean` | ❌ | Disable button |

**Returns:** `<button>` element

---

### ImprovedX402PaymentButton

Enhanced payment button with session management and backend verification.

```tsx
import { ImprovedX402PaymentButton } from '@one/x402/components/ImprovedX402PaymentButton';

<ImprovedX402PaymentButton
  amount={99.99}
  recipientAddress="0x..."
  sessionId="unique-session-id"
  onSuccess={(txHash) => console.log(txHash)}
  onError={(error) => console.error(error)}
/>
```

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `amount` | `number` | ✅ | Amount in USDC |
| `recipientAddress` | `string` | ✅ | Merchant wallet address |
| `sessionId` | `string` | ❌ | Session ID for backend verification |
| `onSuccess` | `(txHash: string) => void` | ❌ | Success callback |
| `onError` | `(error: Error) => void` | ❌ | Error callback |
| `className` | `string` | ❌ | CSS classes |
| `disabled` | `boolean` | ❌ | Disable button |

**Features:**
- Session-based access control
- Backend payment verification
- Unlock digital content after payment
- Better error handling

---

### X402CheckoutFlow

Complete checkout flow with shopping cart, wallet connection, and payment.

```tsx
import { X402CheckoutFlow } from '@one/x402/components/X402CheckoutFlow';

<X402CheckoutFlow
  cartItems={[
    {
      id: '1',
      name: 'Product Name',
      description: 'Product description',
      price: 99.99,
      quantity: 1,
      image: '/product.jpg'
    }
  ]}
  total={99.99}
  onSuccess={(txHash) => window.location.href = '/confirmation'}
  onError={(error) => alert(error.message)}
/>
```

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `cartItems` | `CartItem[]` | ✅ | Array of cart items |
| `total` | `number` | ✅ | Total amount in USDC |
| `onSuccess` | `(txHash: string) => void` | ❌ | Success callback |
| `onError` | `(error: Error) => void` | ❌ | Error callback |

**CartItem Type:**

```typescript
interface CartItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  image?: string;
}
```

**Features:**
- Shopping cart display
- Wallet connection
- Balance checking
- Payment execution
- Transaction status
- Order confirmation

---

## Hooks

### useX402Payment

React hook for X402 payment logic.

```tsx
import { useX402Payment } from '@one/x402/hooks/useX402Payment';

function MyComponent() {
  const { status, error, txHash, initiatePayment, reset } = useX402Payment();

  const handlePay = async () => {
    try {
      await initiatePayment({
        amount: 99.99,
        recipientAddress: '0x...',
        itemName: 'Premium Product',
        metadata: { orderId: '12345' }
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <button onClick={handlePay}>Pay {status === 'idle' ? '✓' : '...'}</button>
      {error && <p>Error: {error.message}</p>}
      {txHash && <p>Success! TX: {txHash}</p>}
    </div>
  );
}
```

**Returns:**

| Property | Type | Description |
|----------|------|-------------|
| `status` | `TransactionStatus` | Current payment status |
| `error` | `Error \| null` | Error if payment failed |
| `txHash` | `string \| null` | Transaction hash if successful |
| `initiatePayment` | `(data: PaymentData) => Promise<void>` | Start payment |
| `reset` | `() => void` | Reset state |

**TransactionStatus:**
```typescript
type TransactionStatus =
  | 'idle'          // Not started
  | 'connecting'    // Connecting wallet
  | 'signing'       // Customer signing message
  | 'submitting'    // Submitting to blockchain
  | 'confirming'    // Waiting for confirmation
  | 'success'       // Payment confirmed
  | 'error';        // Payment failed
```

**PaymentData:**
```typescript
interface PaymentData {
  amount: number;
  recipientAddress: string;
  itemName?: string;
  itemDescription?: string;
  metadata?: Record<string, any>;
}
```

---

## Utilities

### X402_CONFIG

Configuration object for X402 payments.

```typescript
import { X402_CONFIG } from '@one/x402/lib/config';

console.log(X402_CONFIG.usdcAddress);      // USDC contract address
console.log(X402_CONFIG.merchantWallet);   // Your merchant wallet
console.log(X402_CONFIG.chainId);          // Base chain ID (8453)
```

**Properties:**

| Property | Type | Description |
|----------|------|-------------|
| `usdcAddress` | `string` | USDC contract on Base |
| `merchantWallet` | `string` | Your merchant wallet address |
| `walletConnectProjectId` | `string` | WalletConnect project ID |
| `chainId` | `number` | Base network chain ID (8453) |

---

## Types

### PaymentData

```typescript
interface PaymentData {
  amount: number;
  recipientAddress: string;
  itemName?: string;
  itemDescription?: string;
  metadata?: Record<string, any>;
}
```

### CartItem

```typescript
interface CartItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  image?: string;
}
```

### TransactionStatus

```typescript
type TransactionStatus =
  | 'idle'
  | 'connecting'
  | 'signing'
  | 'submitting'
  | 'confirming'
  | 'success'
  | 'error';
```

### X402Config

```typescript
interface X402Config {
  usdcAddress: string;
  merchantWallet: string;
  walletConnectProjectId: string;
  chainId: number;
}
```

---

## Environment Variables

### Required

```bash
PUBLIC_X402_ENABLED=true
PUBLIC_USDC_CONTRACT_ADDRESS=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
PUBLIC_MERCHANT_WALLET=0xYourWalletAddressHere
PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
```

### Optional

```bash
PUBLIC_BASE_RPC_URL=https://mainnet.base.org
```

---

## Events

### Payment Lifecycle

1. **Idle** → User clicks pay button
2. **Connecting** → Wallet connection initiated
3. **Signing** → User signs authorization message (free)
4. **Submitting** → Transaction submitted to Base network
5. **Confirming** → Waiting for block confirmation (1-2 sec)
6. **Success** → Payment confirmed, USDC transferred
7. **Error** → Payment failed, user can retry

### Error Handling

```tsx
<X402PaymentButton
  amount={99.99}
  recipientAddress="0x..."
  onError={(error) => {
    if (error.message.includes('insufficient funds')) {
      alert('Not enough USDC in wallet');
    } else if (error.message.includes('rejected')) {
      alert('Payment cancelled by user');
    } else {
      alert('Payment failed: ' + error.message);
    }
  }}
/>
```

---

## Best Practices

### 1. Always Wrap with Web3Provider

```tsx
// ❌ Wrong
<X402PaymentButton amount={99.99} recipientAddress="0x..." />

// ✅ Correct
<Web3Provider>
  <X402PaymentButton amount={99.99} recipientAddress="0x..." />
</Web3Provider>
```

### 2. Handle Errors Gracefully

```tsx
<X402PaymentButton
  onError={(error) => {
    console.error(error);
    // Show user-friendly message
    // Log to error tracking (Sentry, etc.)
    // Offer alternative payment method
  }}
/>
```

### 3. Verify Payments on Backend

```typescript
// After onSuccess callback, verify on backend
await fetch('/api/verify-payment', {
  method: 'POST',
  body: JSON.stringify({ txHash })
});
```

### 4. Use TypeScript

```typescript
import type { PaymentData } from '@one/x402/types';

const data: PaymentData = {
  amount: 99.99,
  recipientAddress: '0x...'
};
```

---

## Support

- [GitHub Issues](https://github.com/one-platform/x402/issues)
- [Documentation](https://docs.one.ie/x402)
- [Discord](https://discord.gg/one-platform)
