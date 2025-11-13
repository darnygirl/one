# 📚 Usage Examples

**Complete code examples for every use case.**

---

## Table of Contents

1. [Simple Payment Button](#1-simple-payment-button)
2. [Stripe Checkout Page](#2-stripe-checkout-page)
3. [X402 Crypto Payments](#3-x402-crypto-payments)
4. [Session-Based Access](#4-session-based-access)
5. [Protected Content](#5-protected-content)
6. [Custom Payment Flow](#6-custom-payment-flow)
7. [Product Marketplace](#7-product-marketplace)
8. [Multiple Payment Tiers](#8-multiple-payment-tiers)

---

## 1. Simple Payment Button

**Use case:** Accept a one-time payment for a single item.

```tsx
// src/pages/article.astro
---
import { ImprovedX402PaymentButton } from '@/components/web3/ImprovedX402PaymentButton';
---

<div class="max-w-2xl mx-auto p-8">
  <h1>Premium Article</h1>
  <p>Unlock this article for $0.10</p>

  <ImprovedX402PaymentButton
    client:load
    amount="0.10"
    label="Unlock Article"
    onSuccess={(data) => {
      console.log('Payment successful!', data.txHash);
      // Unlock content
      document.getElementById('content').classList.remove('hidden');
    }}
  />

  <div id="content" class="hidden">
    <!-- Your premium content here -->
  </div>
</div>
```

---

## 2. Stripe Checkout Page

**Use case:** Full Stripe checkout with cart items.

```astro
---
// src/pages/checkout.astro
import ShopLayout from '@/layouts/ShopLayout.astro';

// Handle POST request for Stripe
if (Astro.request.method === 'POST') {
  const { default: Stripe } = await import('stripe');
  const stripe = new Stripe(import.meta.env.STRIPE_SECRET_KEY);

  const formData = await Astro.request.formData();
  const email = formData.get('email');
  const cartData = JSON.parse(formData.get('cartData'));

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: cartData.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: { name: item.name },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    })),
    mode: 'payment',
    success_url: `${Astro.url.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${Astro.url.origin}/checkout`,
    customer_email: email,
  });

  return new Response(JSON.stringify({ url: session.url }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
---

<ShopLayout title="Checkout">
  <form id="checkout-form">
    <input type="email" name="email" required placeholder="your@email.com" />
    <button type="submit">Pay with Card</button>
  </form>

  <script>
    const form = document.getElementById('checkout-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const cartItems = [
        { name: 'Product 1', price: 29.99, quantity: 1 },
        { name: 'Product 2', price: 49.99, quantity: 2 },
      ];

      const formData = new FormData();
      formData.append('email', form.email.value);
      formData.append('cartData', JSON.stringify(cartItems));

      const response = await fetch('/checkout', {
        method: 'POST',
        body: formData,
      });

      const { url } = await response.json();
      window.location.href = url; // Redirect to Stripe
    });
  </script>
</ShopLayout>
```

---

## 3. X402 Crypto Payments

**Use case:** Accept USDC payments on Base network.

```tsx
// src/pages/crypto-checkout.astro
---
import { ImprovedX402PaymentButton } from '@/components/web3/ImprovedX402PaymentButton';
---

<div class="max-w-md mx-auto p-8">
  <h1>Pay with Crypto</h1>
  <p class="text-lg mb-8">$10.00 USDC on Base</p>

  <ImprovedX402PaymentButton
    client:load
    amount="10.00"
    label="Pay $10 USDC"
    onSuccess={(data) => {
      console.log('Transaction:', data.txHash);
      console.log('Amount:', data.amount);
      console.log('Network:', data.network);

      // Redirect to success page
      window.location.href = `/success?tx=${data.txHash}`;
    }}
    onError={(error) => {
      console.error('Payment failed:', error);
      alert(error.message);
    }}
  />

  <div class="mt-4 text-sm opacity-60">
    <p>Network: Base</p>
    <p>Asset: USDC</p>
    <p>Fee: ~$0.0001</p>
  </div>
</div>
```

---

## 4. Session-Based Access

**Use case:** Pay once, access 24 hours (like a day pass).

```tsx
// src/pages/paywall.astro
---
import { ImprovedX402PaymentButton } from '@/components/web3/ImprovedX402PaymentButton';
---

<div class="max-w-lg mx-auto p-8">
  <h1>Premium Access</h1>
  <p>Get unlimited access to all content for 24 hours</p>

  <div class="border-2 border-black p-6 mt-8">
    <h3 class="text-2xl font-bold mb-2">24-Hour Pass</h3>
    <p class="text-4xl font-light mb-4">$10.00</p>

    <ul class="mb-6 space-y-2">
      <li>✓ Unlimited articles</li>
      <li>✓ HD video access</li>
      <li>✓ Download content</li>
      <li>✓ No ads</li>
    </ul>

    <ImprovedX402PaymentButton
      client:load
      amount="10.00"
      label="Get 24-Hour Pass"
      sessionEnabled={true}
      sessionDuration={86400}
      onSuccess={(data) => {
        // Save session to localStorage
        localStorage.setItem('premium_session', data.sessionId);

        // Redirect to premium content
        window.location.href = '/dashboard';
      }}
    />
  </div>
</div>
```

---

## 5. Protected Content

**Use case:** Check if user has valid session before showing content.

```tsx
// src/pages/premium/dashboard.astro
---
import { isSessionValid, getSessionData } from '@/hooks/useX402Payment';

// Server-side session check
const sessionId = Astro.cookies.get('premium_session')?.value;

if (!sessionId || !isSessionValid(sessionId)) {
  return Astro.redirect('/paywall');
}

const sessionData = getSessionData(sessionId);
---

<div class="p-8">
  <div class="bg-green-50 border border-green-500 p-4 mb-8">
    <p class="font-bold">✓ Premium Access Active</p>
    <p class="text-sm">
      Valid until: {new Date(sessionData.expiresAt).toLocaleString()}
    </p>
  </div>

  <h1>Premium Dashboard</h1>
  <!-- Your premium content here -->
</div>

<script>
  // Client-side session check
  import { isSessionValid } from '@/hooks/useX402Payment';

  const checkSession = () => {
    const sessionId = localStorage.getItem('premium_session');

    if (!sessionId || !isSessionValid(sessionId)) {
      alert('Your session has expired. Please purchase a new pass.');
      window.location.href = '/paywall';
    }
  };

  // Check on mount
  checkSession();

  // Check every minute
  setInterval(checkSession, 60000);
</script>
```

---

## 6. Custom Payment Flow

**Use case:** Build your own UI with the payment hook.

```tsx
// src/components/CustomCheckout.tsx
import { useState } from 'react';
import { useX402Payment } from '@/hooks/useX402Payment';
import { useRouter } from 'next/navigation';

export function CustomCheckout() {
  const router = useRouter();
  const [amount, setAmount] = useState('10.00');

  const {
    pay,
    isLoading,
    isProcessing,
    isSuccess,
    error,
    paymentData,
    reset,
  } = useX402Payment({
    amount,
    onSuccess: (data) => {
      console.log('Payment successful!', data);
      router.push(`/success?tx=${data.txHash}`);
    },
  });

  return (
    <div className="space-y-6">
      {/* Amount Selector */}
      <div>
        <label className="block text-sm font-bold mb-2">Amount</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={isLoading}
          className="w-full px-4 py-2 border-2 border-black"
        />
      </div>

      {/* Custom Button */}
      <button
        onClick={pay}
        disabled={isLoading}
        className={`w-full px-8 py-4 text-white font-bold ${
          isLoading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-black hover:opacity-80'
        }`}
      >
        {isProcessing && 'Confirm in Wallet...'}
        {isLoading && !isProcessing && 'Processing...'}
        {!isLoading && `Pay $${amount}`}
      </button>

      {/* Success Message */}
      {isSuccess && paymentData && (
        <div className="p-4 border-2 border-green-500 bg-green-50">
          <p className="font-bold">✓ Payment Successful!</p>
          <p className="text-sm font-mono break-all mt-2">
            {paymentData.txHash}
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 border-2 border-red-500 bg-red-50">
          <p className="font-bold text-red-600">Payment Failed</p>
          <p className="text-sm mt-1">{error.message}</p>
          <button
            onClick={reset}
            className="mt-2 text-sm underline"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}
```

---

## 7. Product Marketplace

**Use case:** Display products with "Buy Now" buttons.

```astro
---
// src/pages/shop/marketplace.astro
const products = [
  { id: '1', name: 'Product A', price: 29.99, image: 'a.jpg' },
  { id: '2', name: 'Product B', price: 49.99, image: 'b.jpg' },
  { id: '3', name: 'Product C', price: 79.99, image: 'c.jpg' },
];
---

<div class="grid md:grid-cols-3 gap-8 p-8">
  {products.map(product => (
    <div class="border-2 border-black p-6">
      <img src={product.image} alt={product.name} class="w-full h-48 object-cover mb-4" />
      <h3 class="text-xl font-bold mb-2">{product.name}</h3>
      <p class="text-2xl mb-4">${product.price}</p>

      <ImprovedX402PaymentButton
        client:load
        amount={product.price.toString()}
        label="Buy Now"
        onSuccess={(data) => {
          // Add to orders
          const orders = JSON.parse(localStorage.getItem('orders') || '[]');
          orders.push({
            productId: product.id,
            txHash: data.txHash,
            timestamp: Date.now(),
          });
          localStorage.setItem('orders', JSON.stringify(orders));

          // Redirect
          window.location.href = `/success?tx=${data.txHash}`;
        }}
      />
    </div>
  ))}
</div>
```

---

## 8. Multiple Payment Tiers

**Use case:** Offer different access levels (basic, premium, enterprise).

```tsx
// src/pages/pricing.astro
---
import { ImprovedX402PaymentButton } from '@/components/web3/ImprovedX402PaymentButton';

const tiers = [
  {
    name: 'Basic',
    price: '5.00',
    duration: 3600, // 1 hour
    features: ['10 articles', 'Basic support'],
  },
  {
    name: 'Premium',
    price: '10.00',
    duration: 86400, // 24 hours
    features: ['Unlimited articles', 'HD video', 'Priority support'],
    featured: true,
  },
  {
    name: 'Enterprise',
    price: '50.00',
    duration: 2592000, // 30 days
    features: ['Everything', 'API access', 'Dedicated support', 'Custom branding'],
  },
];
---

<div class="grid md:grid-cols-3 gap-8 p-8">
  {tiers.map(tier => (
    <div class={`border-2 border-black p-6 ${tier.featured ? 'bg-black text-white' : ''}`}>
      <h3 class="text-xl font-bold mb-2">{tier.name}</h3>
      <p class="text-4xl font-light mb-4">${tier.price}</p>

      <ul class="space-y-2 mb-6">
        {tier.features.map(feature => (
          <li>✓ {feature}</li>
        ))}
      </ul>

      <ImprovedX402PaymentButton
        client:load
        amount={tier.price}
        label={`Get ${tier.name}`}
        sessionEnabled={true}
        sessionDuration={tier.duration}
        variant={tier.featured ? 'secondary' : 'primary'}
        onSuccess={(data) => {
          localStorage.setItem('subscription_tier', tier.name);
          localStorage.setItem('subscription_session', data.sessionId);
          window.location.href = '/dashboard';
        }}
      />
    </div>
  ))}
</div>
```

---

## 🎨 Styling Examples

### Custom Button Styles

```tsx
<ImprovedX402PaymentButton
  className="bg-blue-600 text-white hover:bg-blue-700 border-blue-800"
  amount="10.00"
/>
```

### Custom Error Handling

```tsx
<ImprovedX402PaymentButton
  amount="10.00"
  onError={(error) => {
    // Custom error handling
    if (error.message.includes('insufficient')) {
      alert('You don't have enough USDC. Please top up your wallet.');
    } else if (error.message.includes('rejected')) {
      alert('Transaction was cancelled. Please try again.');
    } else {
      alert(`Error: ${error.message}`);
    }
  }}
/>
```

### Loading State Customization

```tsx
const { pay, isLoading, isProcessing } = useX402Payment({ amount: '10.00' });

return (
  <button onClick={pay} disabled={isLoading}>
    {isProcessing && '⏳ Waiting for wallet confirmation...'}
    {isLoading && !isProcessing && '🔄 Processing transaction...'}
    {!isLoading && '💳 Pay Now'}
  </button>
);
```

---

## 📚 More Examples

Check out these additional resources:

- **docs/STRIPE-SETUP.md** - Complete Stripe examples
- **docs/X402-SETUP.md** - Crypto payment patterns
- **docs/COMPARISON.md** - Payment method comparison

---

**Need a custom example?** Check the source code in `src/components/` - all components are well-documented and easy to understand!
