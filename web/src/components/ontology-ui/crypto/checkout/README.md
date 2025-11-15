# Crypto Checkout & Payment Processing Components

**Cycles 40-46: Complete E-commerce Checkout Flow for Crypto Payments**

Production-ready components for accepting cryptocurrency payments with full payment lifecycle management.

---

## Components Overview

### 40. CheckoutWidget
**Crypto checkout for purchases**
- Product/service display with image
- Price in USD with live crypto conversion
- Multiple crypto options (ETH, USDC, USDT, etc.)
- QR code payment support
- Connect wallet or scan to pay
- Payment timer (15 min expiry)

```tsx
import { CheckoutWidget } from '@/components/ontology-ui/crypto/checkout';

<CheckoutWidget
  productName="Premium Plan"
  productDescription="Full access to all features"
  productImage="/product.jpg"
  usdAmount={99.99}
  onPaymentComplete={(confirmation) => {
    console.log('Payment received:', confirmation);
  }}
  onExpire={() => console.log('Payment expired')}
  expiryMinutes={15}
  supportedCurrencies={['ETH', 'USDC', 'USDT']}
/>
```

### 41. PaymentProcessor
**Process crypto payments with blockchain monitoring**
- Monitor payment address for incoming transactions
- Confirm payment received with block confirmations
- Handle partial payments (show remaining amount)
- Handle overpayments (automatic refund)
- Webhook notifications on status changes
- Real-time payment status updates

```tsx
import { PaymentProcessor } from '@/components/ontology-ui/crypto/checkout';

<PaymentProcessor
  paymentRequest={paymentRequest}
  onConfirmation={(confirmation) => {
    console.log('Payment confirmed:', confirmation);
  }}
  onStatusChange={(status) => {
    console.log('Status changed:', status);
  }}
  webhookUrl="/api/webhooks/payment"
  confirmationsRequired={12}
/>
```

### 42. PaymentConfirmation
**Payment confirmation screen**
- Success animation and checkmark
- Transaction hash with block explorer link
- Receipt download (PDF/CSV)
- Order details summary
- Next steps and instructions
- Support contact information

```tsx
import { PaymentConfirmation } from '@/components/ontology-ui/crypto/checkout';

<PaymentConfirmation
  confirmation={{
    paymentId: 'pay_123',
    transactionHash: '0x...',
    amount: '0.05',
    currency: 'ETH',
    status: 'confirmed',
    confirmations: 12,
    timestamp: Date.now(),
  }}
  onDownloadReceipt={() => console.log('Downloading receipt')}
  onClose={() => console.log('Closing confirmation')}
  showSupportInfo={true}
  supportEmail="support@example.com"
/>
```

### 43. InvoiceGenerator
**Generate crypto invoices**
- Add/remove line items with quantities
- Calculate subtotal, tax, total
- Support multiple fiat currencies (USD, EUR, GBP)
- Set due date
- Add customer information
- Generate payment instructions
- Export to PDF

```tsx
import { InvoiceGenerator } from '@/components/ontology-ui/crypto/checkout';

<InvoiceGenerator
  onGenerate={(invoice) => {
    console.log('Invoice generated:', invoice);
    // Send to customer, store in database, etc.
  }}
  defaultCurrency="USD"
  defaultTaxRate={0.1}
  customerInfo={{
    name: 'John Doe',
    email: 'john@example.com',
  }}
/>
```

### 44. InvoicePayment
**Pay crypto invoices**
- Display invoice details (line items, totals)
- Show payment amount in selected crypto
- Generate QR code for payment
- Support partial payments
- Show payment history
- Mark invoice as paid

```tsx
import { InvoicePayment } from '@/components/ontology-ui/crypto/checkout';

<InvoicePayment
  invoice={invoice}
  onPayment={(payment) => {
    console.log('Payment received:', payment);
  }}
  allowPartialPayment={true}
  showHistory={true}
/>
```

### 45. RefundProcessor
**Handle payment refunds**
- Refund request form with reason
- Support partial/full refunds
- Track refund status (pending, processing, completed, failed)
- Automatic refund execution to source address
- Refund notifications
- Display refund history

```tsx
import { RefundProcessor } from '@/components/ontology-ui/crypto/checkout';

<RefundProcessor
  paymentId="pay_123"
  maxAmount="0.05"
  currency="ETH"
  onRefund={(refund) => {
    console.log('Refund processed:', refund);
  }}
  onCancel={() => console.log('Refund cancelled')}
  allowPartialRefund={true}
/>
```

### 46. SubscriptionPayment
**Recurring subscription payments**
- Display subscription plans with features
- Select payment currency and network
- Set up auto-renewal
- View billing history
- Cancel or pause subscription
- Renewal reminders and notifications

```tsx
import { SubscriptionPayment } from '@/components/ontology-ui/crypto/checkout';

<SubscriptionPayment
  plans={[
    {
      id: 'plan_1',
      name: 'Basic',
      description: 'Essential features',
      amount: 9.99,
      currency: 'USD',
      interval: 'monthly',
      features: ['Feature 1', 'Feature 2'],
    },
    {
      id: 'plan_2',
      name: 'Premium',
      description: 'All features',
      amount: 29.99,
      currency: 'USD',
      interval: 'monthly',
      features: ['All Basic features', 'Priority support', 'Advanced analytics'],
    },
  ]}
  currentSubscription={currentSubscription}
  onSubscribe={(subscription) => {
    console.log('Subscribed:', subscription);
  }}
  onCancel={(subscriptionId) => {
    console.log('Cancelled:', subscriptionId);
  }}
  onPause={(subscriptionId) => {
    console.log('Paused:', subscriptionId);
  }}
  showBillingHistory={true}
/>
```

---

## CheckoutService (Effect.ts)

All components integrate with the `CheckoutService` for payment processing:

```typescript
import { Effect } from "effect";
import { CheckoutService, CheckoutServiceLive } from "@/lib/services/crypto/CheckoutService";

// Create a payment request
const program = Effect.gen(function* () {
  const checkout = yield* CheckoutService;

  const payment = yield* checkout.createPayment({
    productName: "Premium Plan",
    usdAmount: 99.99,
    currencies: ["ETH", "USDC"],
    expiryMinutes: 15,
  });

  console.log('Payment created:', payment);
});

// Run the program
await Effect.runPromise(program.pipe(Effect.provide(CheckoutServiceLive)));
```

### Service Methods

```typescript
// Create payment request
createPayment(params: PaymentParams): Effect<PaymentRequest, CheckoutError>

// Monitor payment status
monitorPayment(paymentId: string): Effect<PaymentConfirmation, CheckoutError>

// Generate invoice
generateInvoice(params: InvoiceParams): Effect<CryptoInvoice, CheckoutError>

// Create subscription
createSubscription(params: SubscriptionParams): Effect<CryptoSubscription, CheckoutError>

// Cancel subscription
cancelSubscription(subscriptionId: string, immediately?: boolean): Effect<CryptoSubscription, CheckoutError>

// Process refund
processRefund(request: RefundRequest): Effect<CryptoRefund, CheckoutError>

// Verify webhook
verifyWebhook(payload: string, signature: string): Effect<WebhookPayload, CheckoutError>
```

---

## Webhook Integration

### Setting up Webhooks

The `PaymentProcessor` component can send webhook notifications on payment status changes:

```typescript
<PaymentProcessor
  paymentRequest={paymentRequest}
  webhookUrl="/api/webhooks/payment"
  onStatusChange={(status) => {
    // Handle status change in UI
  }}
/>
```

### Webhook Endpoint (Astro/Node.js)

Create a webhook endpoint to receive payment notifications:

```typescript
// src/pages/api/webhooks/payment.ts
import type { APIRoute } from 'astro';
import { Effect } from 'effect';
import { CheckoutService, CheckoutServiceLive } from '@/lib/services/crypto/CheckoutService';

export const POST: APIRoute = async ({ request }) => {
  const payload = await request.text();
  const signature = request.headers.get('x-webhook-signature') || '';

  const program = Effect.gen(function* () {
    const checkout = yield* CheckoutService;

    // Verify webhook signature
    const webhookData = yield* checkout.verifyWebhook(payload, signature);

    // Handle different event types
    switch (webhookData.event) {
      case 'payment.confirmed':
        // Update order status, send confirmation email, etc.
        console.log('Payment confirmed:', webhookData.data);
        break;

      case 'payment.failed':
        // Handle failed payment
        console.log('Payment failed:', webhookData.data);
        break;

      case 'invoice.paid':
        // Mark invoice as paid
        console.log('Invoice paid:', webhookData.data);
        break;

      case 'subscription.renewed':
        // Update subscription, charge for next period
        console.log('Subscription renewed:', webhookData.data);
        break;

      case 'refund.completed':
        // Update refund status
        console.log('Refund completed:', webhookData.data);
        break;
    }

    return { success: true };
  });

  try {
    const result = await Effect.runPromise(
      program.pipe(Effect.provide(CheckoutServiceLive))
    );
    return new Response(JSON.stringify(result), { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({ error: 'Webhook processing failed' }), {
      status: 500,
    });
  }
};
```

### Webhook Event Types

```typescript
type WebhookEventType =
  | "payment.created"      // Payment request created
  | "payment.confirmed"    // Payment confirmed on blockchain
  | "payment.failed"       // Payment failed or expired
  | "payment.expired"      // Payment timer expired
  | "invoice.created"      // Invoice generated
  | "invoice.paid"         // Invoice fully paid
  | "invoice.overdue"      // Invoice past due date
  | "subscription.created" // Subscription started
  | "subscription.renewed" // Subscription auto-renewed
  | "subscription.cancelled" // Subscription cancelled
  | "refund.created"       // Refund requested
  | "refund.completed";    // Refund processed
```

### Webhook Payload Structure

```typescript
interface WebhookPayload {
  event: WebhookEventType;
  data: PaymentRequest | CryptoInvoice | CryptoSubscription | CryptoRefund;
  timestamp: number;
  signature: string; // HMAC signature for verification
}
```

---

## Convex Schema Integration

Store payments, invoices, and subscriptions in Convex:

```typescript
// backend/convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ... existing tables ...

  crypto_payments: defineTable({
    groupId: v.string(),
    paymentId: v.string(),
    productName: v.string(),
    usdAmount: v.number(),
    cryptoCurrency: v.string(),
    cryptoAmount: v.string(),
    status: v.string(),
    transactionHash: v.optional(v.string()),
    confirmations: v.optional(v.number()),
    createdAt: v.number(),
    expiresAt: v.number(),
    confirmedAt: v.optional(v.number()),
  }).index("by_group", ["groupId"]),

  crypto_invoices: defineTable({
    groupId: v.string(),
    invoiceNumber: v.string(),
    status: v.string(),
    customerId: v.optional(v.string()),
    customerName: v.optional(v.string()),
    customerEmail: v.optional(v.string()),
    lineItems: v.array(v.object({
      id: v.string(),
      description: v.string(),
      quantity: v.number(),
      unitPrice: v.number(),
      total: v.number(),
    })),
    subtotal: v.number(),
    tax: v.optional(v.number()),
    total: v.number(),
    currency: v.string(),
    dueDate: v.number(),
    issuedAt: v.number(),
    paidAt: v.optional(v.number()),
  }).index("by_group", ["groupId"]),

  crypto_subscriptions: defineTable({
    groupId: v.string(),
    userId: v.string(),
    planId: v.string(),
    status: v.string(),
    cryptoCurrency: v.string(),
    network: v.string(),
    currentPeriodStart: v.number(),
    currentPeriodEnd: v.number(),
    nextBillingDate: v.optional(v.number()),
    cancelAtPeriodEnd: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_group", ["groupId"]),

  crypto_refunds: defineTable({
    groupId: v.string(),
    paymentId: v.string(),
    amount: v.string(),
    currency: v.string(),
    status: v.string(),
    reason: v.string(),
    refundAddress: v.string(),
    transactionHash: v.optional(v.string()),
    processedAt: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_group", ["groupId"]),
});
```

---

## Environment Variables

Configure your crypto payment environment:

```bash
# .env
PUBLIC_ETHEREUM_RPC=https://eth.llamarpc.com
PUBLIC_POLYGON_RPC=https://polygon.llamarpc.com
PUBLIC_BITCOIN_RPC=https://blockstream.info/api

# Webhook secret for signature verification
WEBHOOK_SECRET=your_webhook_secret_here

# Optional: Price feed APIs
PUBLIC_COINGECKO_API_KEY=your_api_key
PUBLIC_COINMARKETCAP_API_KEY=your_api_key
```

---

## Production Considerations

### Security
- ✅ Validate all payment amounts server-side
- ✅ Verify webhook signatures to prevent spoofing
- ✅ Use HTTPS for all webhook endpoints
- ✅ Monitor for double-spending attacks
- ✅ Implement rate limiting on payment endpoints

### Blockchain Monitoring
- Replace mock monitoring with real blockchain RPC calls
- Use WebSocket connections for real-time updates
- Consider using services like:
  - **Alchemy** - Ethereum/Polygon monitoring
  - **Infura** - Multi-chain RPC provider
  - **QuickNode** - Fast blockchain access
  - **Blockstream** - Bitcoin monitoring

### Price Feeds
- Integrate real-time price APIs:
  - **CoinGecko** - Free tier available
  - **CoinMarketCap** - Reliable pricing data
  - **Chainlink** - Decentralized oracle network

### Payment Expiry
- Implement automatic cleanup of expired payments
- Send expiry notifications before timeout
- Allow payment extension if needed

### Network Fees
- Calculate and display network fees (gas)
- Warn users about high fees during congestion
- Offer Layer 2 alternatives (Polygon, Arbitrum) for lower fees

### Refunds
- Implement multi-sig approval for large refunds
- Track refund reasons for analytics
- Automate refunds for common cases

### Subscriptions
- Implement grace periods for failed renewals
- Send renewal reminders 3-7 days in advance
- Support subscription upgrades/downgrades

---

## Testing

### Test Payment Flow

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { CheckoutWidget } from './CheckoutWidget';

test('checkout widget displays product and price', () => {
  render(
    <CheckoutWidget
      productName="Premium Plan"
      usdAmount={99.99}
      onPaymentComplete={jest.fn()}
    />
  );

  expect(screen.getByText('Premium Plan')).toBeInTheDocument();
  expect(screen.getByText('$99.99')).toBeInTheDocument();
});

test('timer counts down correctly', async () => {
  jest.useFakeTimers();

  render(
    <CheckoutWidget
      productName="Test Product"
      usdAmount={10}
      expiryMinutes={1}
      onPaymentComplete={jest.fn()}
    />
  );

  expect(screen.getByText('⏱️ 1:00')).toBeInTheDocument();

  jest.advanceTimersByTime(30000); // 30 seconds

  expect(screen.getByText('⏱️ 0:30')).toBeInTheDocument();

  jest.useRealTimers();
});
```

---

## Examples

### Complete Checkout Flow

```tsx
import { useState } from 'react';
import {
  CheckoutWidget,
  PaymentProcessor,
  PaymentConfirmation,
} from '@/components/ontology-ui/crypto/checkout';
import type { PaymentRequest, PaymentConfirmation } from '@/components/ontology-ui/crypto/checkout';

export function CompleteCheckoutFlow() {
  const [step, setStep] = useState<'checkout' | 'processing' | 'confirmation'>('checkout');
  const [paymentRequest, setPaymentRequest] = useState<PaymentRequest | null>(null);
  const [confirmation, setConfirmation] = useState<PaymentConfirmation | null>(null);

  return (
    <div>
      {step === 'checkout' && (
        <CheckoutWidget
          productName="Premium Membership"
          usdAmount={99.99}
          onPaymentComplete={(request) => {
            setPaymentRequest(request as any);
            setStep('processing');
          }}
        />
      )}

      {step === 'processing' && paymentRequest && (
        <PaymentProcessor
          paymentRequest={paymentRequest}
          onConfirmation={(conf) => {
            setConfirmation(conf);
            setStep('confirmation');
          }}
        />
      )}

      {step === 'confirmation' && confirmation && (
        <PaymentConfirmation
          confirmation={confirmation}
          onClose={() => setStep('checkout')}
        />
      )}
    </div>
  );
}
```

---

## License

MIT

---

**Built with Effect.ts, React 19, and Convex for production-ready crypto commerce! 🚀**
