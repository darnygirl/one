# X402 Examples

Ready-to-use examples showing different ways to integrate X402 payments.

## 📁 Examples

### 1. basic-payment.astro
**Simplest implementation** - Single payment button

```astro
import { X402PaymentButton } from '@one/x402';

<X402PaymentButton
  amount={99.99}
  recipientAddress="0x..."
  onSuccess={(txHash) => console.log(txHash)}
/>
```

**Use for:**
- Single product purchases
- Donations
- Tips/gratuities
- Simple pay-to-unlock content

---

### 2. checkout-flow.astro
**Complete shopping cart** - Full checkout with multiple items

```astro
import { X402CheckoutFlow } from '@one/x402';

<X402CheckoutFlow
  cartItems={[...]}
  total={379.98}
  onSuccess={(txHash) => {
    // Store order, send email, redirect
  }}
/>
```

**Use for:**
- E-commerce stores
- Multi-item purchases
- Shopping cart checkout
- Subscription bundles

---

### 3. custom-payment-component.tsx
**Custom UI with hook** - Build your own payment flow

```tsx
import { useX402Payment } from '@one/x402/hooks';

const { status, error, txHash, initiatePayment } = useX402Payment();
```

**Use for:**
- Custom designs
- Specific UX requirements
- Complex payment flows
- Advanced integrations

---

## 🚀 Quick Start

### Step 1: Copy Example

```bash
# Copy example to your project
cp node_modules/@one/x402/examples/basic-payment.astro src/pages/buy.astro
```

### Step 2: Install Dependencies

```bash
bun add @one/x402 wagmi viem @rainbow-me/rainbowkit
```

### Step 3: Configure Environment

```bash
# .env
PUBLIC_MERCHANT_WALLET=0xYourWalletAddress
PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
```

### Step 4: Run

```bash
bun run dev
# Visit http://localhost:4321/buy
```

---

## 📖 Example Details

### Basic Payment Button

**File:** `basic-payment.astro`
**Lines:** ~50
**Complexity:** ⭐️ Simple

**Features:**
- Minimal setup
- Single button
- Success/error handling
- Redirect on success

**Perfect for:**
First-time users, simple use cases

---

### Checkout Flow

**File:** `checkout-flow.astro`
**Lines:** ~90
**Complexity:** ⭐️⭐️ Medium

**Features:**
- Shopping cart display
- Multiple items
- Quantity management
- Order storage
- Email confirmation

**Perfect for:**
E-commerce sites, multi-product stores

---

### Custom Component

**File:** `custom-payment-component.tsx`
**Lines:** ~120
**Complexity:** ⭐️⭐️⭐️ Advanced

**Features:**
- Direct hook usage
- Full state control
- Custom UI/UX
- Email collection
- Status indicators

**Perfect for:**
Developers who need complete control

---

## 🎨 Customization

### Styling

All examples use minimal styling. Add your own:

```astro
<style>
  .pay-button {
    background: your-brand-color;
    border-radius: 8px;
    padding: 16px 32px;
  }
</style>
```

### Callbacks

Handle success/error your way:

```tsx
onSuccess={(txHash) => {
  // Store in database
  await db.orders.create({ txHash, ... });

  // Send confirmation email
  await sendEmail(email, { txHash });

  // Track in analytics
  analytics.track('purchase', { amount, txHash });

  // Redirect
  window.location.href = '/success';
}}
```

---

## 🔧 Common Patterns

### 1. Verify on Backend

```tsx
onSuccess={async (txHash) => {
  const response = await fetch('/api/verify-payment', {
    method: 'POST',
    body: JSON.stringify({ txHash })
  });

  if (response.ok) {
    // Payment verified, grant access
  }
}}
```

### 2. Store Order

```tsx
onSuccess={async (txHash) => {
  await fetch('/api/orders', {
    method: 'POST',
    body: JSON.stringify({
      txHash,
      items: cartItems,
      total,
      customerEmail: email,
      timestamp: Date.now()
    })
  });
}}
```

### 3. Send Confirmation Email

```tsx
onSuccess={async (txHash) => {
  await fetch('/api/send-receipt', {
    method: 'POST',
    body: JSON.stringify({
      to: email,
      txHash,
      amount,
      items
    })
  });
}}
```

---

## 🐛 Debugging

### Check Wallet Connection

```tsx
import { useAccount } from 'wagmi';

const { address, isConnected } = useAccount();

console.log('Connected:', isConnected);
console.log('Address:', address);
```

### Monitor Transaction

```tsx
onSuccess={(txHash) => {
  console.log('View transaction:');
  console.log(`https://basescan.org/tx/${txHash}`);
}}
```

### Handle Errors

```tsx
onError={(error) => {
  if (error.message.includes('insufficient funds')) {
    alert('Not enough USDC in wallet');
  } else if (error.message.includes('rejected')) {
    alert('Payment cancelled');
  } else {
    console.error('Payment error:', error);
  }
}}
```

---

## 📚 Next Steps

- [API Reference](../docs/API.md)
- [Installation Guide](../docs/INSTALLATION.md)
- [Main README](../README.md)

---

## 💡 Tips

1. **Always wrap with Web3Provider**
   ```tsx
   <Web3Provider>
     <YourPaymentComponent />
   </Web3Provider>
   ```

2. **Test with small amounts first**
   - Use testnet or small USDC amounts
   - Verify everything works before production

3. **Verify payments on backend**
   - Never trust client-side only
   - Always verify transaction on-chain

4. **Handle errors gracefully**
   - Show user-friendly messages
   - Log errors for debugging
   - Offer fallback payment methods

5. **Monitor transactions**
   - Check on Basescan
   - Set up alerts for failed payments
   - Track conversion rates

---

**More questions?** Check the [docs](../docs/) or [open an issue](https://github.com/one-platform/x402/issues).
