# ⚡ Quick Start (5 Minutes)

**Get ONE E-Commerce running in your Astro project in 5 minutes.**

---

## Step 1: Copy Files (1 minute)

```bash
# From your Astro project root
cp -r ONE-ECOMMERCE-PACKAGE/src/* src/
```

That's it! All components, pages, and utilities are now in your project.

---

## Step 2: Install Dependencies (2 minutes)

### For Stripe Payments (Cards)

```bash
bun add stripe
```

### For X402 Payments (Crypto) - Optional

```bash
bun add wagmi viem @tanstack/react-query @rainbow-me/rainbowkit
```

---

## Step 3: Add Stripe Keys (1 minute)

Create `.env`:

```bash
# Get keys from: https://dashboard.stripe.com/apikeys
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxx
PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxx
```

**Don't have Stripe account?** Create free one: https://dashboard.stripe.com/register

---

## Step 4: Start & Test (1 minute)

```bash
bun run dev
```

Visit:
- **http://localhost:4321/shop/checkout** - See checkout page
- **http://localhost:4321/shop/marketplace** - Browse products

---

## Test Payment

Use Stripe test card:

```
Card: 4242 4242 4242 4242
Expiry: 12/34
CVC: 123
ZIP: 12345
```

Click "Pay with Card" → Enter email → Redirects to Stripe → Enter card → Success!

---

## 🎉 Done!

You now have:
- ✅ Beautiful checkout page
- ✅ Stripe payment processing
- ✅ Order confirmation page
- ✅ Product marketplace
- ✅ Mobile-responsive design
- ✅ Dark mode support

---

## 🚀 Next Steps

### Add Your Products

Edit `src/pages/shop/marketplace.astro`:

```astro
const products = [
  {
    id: '1',
    name: 'Your Product',
    price: 29.99,
    image: 'your-image.jpg',
  },
  // ...
];
```

### Customize Styling

Components accept `className`:

```tsx
<ImprovedX402PaymentButton
  className="bg-blue-500 text-white"
/>
```

### Add Crypto Payments

Enable X402 in `.env`:

```bash
PUBLIC_X402_ENABLED=true
PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
PUBLIC_X402_RECIPIENT_ADDRESS=0xYourWallet
```

Get WalletConnect ID: https://cloud.walletconnect.com/

---

## 📚 Learn More

- **INSTALL.md** - Detailed installation guide
- **docs/STRIPE-SETUP.md** - Complete Stripe setup
- **docs/X402-SETUP.md** - Crypto payment guide
- **docs/EXAMPLES.md** - Usage examples

---

## 🎯 Usage Examples

### Simple Payment Button

```tsx
import { ImprovedX402PaymentButton } from '@/components/web3/ImprovedX402PaymentButton';

<ImprovedX402PaymentButton
  amount="10.00"
  label="Pay $10"
  onSuccess={() => alert('Paid!')}
/>
```

### Stripe Checkout

```astro
<!-- Already working in /shop/checkout -->
<form action="/shop/checkout" method="POST">
  <input type="email" name="email" required />
  <button>Checkout</button>
</form>
```

### Session-Based Access (24h Pass)

```tsx
<ImprovedX402PaymentButton
  amount="10.00"
  sessionEnabled={true}
  sessionDuration={86400}
  onSuccess={(data) => {
    localStorage.setItem('session', data.sessionId);
    router.push('/premium');
  }}
/>
```

---

## 🔧 Configuration

### Change Payment Recipient

```bash
# .env
PUBLIC_X402_RECIPIENT_ADDRESS=0xYOUR_WALLET
```

### Enable/Disable Payment Methods

```bash
# Stripe only (no crypto)
STRIPE_SECRET_KEY=sk_test_xxx
# Don't set PUBLIC_X402_ENABLED

# Crypto only (no Stripe)
PUBLIC_X402_ENABLED=true
# Don't set STRIPE_SECRET_KEY

# Both methods
STRIPE_SECRET_KEY=sk_test_xxx
PUBLIC_X402_ENABLED=true
```

---

## 🐛 Common Issues

**"Module not found"** → Add to `tsconfig.json`:
```json
"paths": { "@/*": ["./src/*"] }
```

**"stripe is not defined"** → Install:
```bash
bun add stripe
```

**Styles not working** → Add `client:load`:
```astro
<Component client:load />
```

---

## ✅ Quick Checklist

- [ ] Files copied
- [ ] Dependencies installed
- [ ] `.env` configured
- [ ] Dev server running
- [ ] Test payment successful

**All done?** You're ready for production! 🚀

---

**Time taken:** ~5 minutes
**Lines of code added:** ~1,300
**Features gained:** Full e-commerce system

**Not bad for 5 minutes of work! 😎**
