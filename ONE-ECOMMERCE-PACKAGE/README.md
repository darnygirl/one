# 🛍️ ONE E-Commerce Package

**Beautiful, production-ready e-commerce system for Astro + shadcn/ui**

Drop this into any Astro project and start accepting payments in minutes.

---

## ✨ What's Included

- 🎨 **Beautiful UI** - Minimalist black/white design (shadcn-compatible)
- 💳 **Stripe Payments** - Full card payment integration
- 💎 **Crypto Payments** - USDC on Base network (X402 protocol)
- 🛒 **Complete Shop** - Marketplace, checkout, order confirmation
- 📦 **Modular** - Use all or pick what you need
- 🎯 **TypeScript** - Fully typed
- 📱 **Responsive** - Mobile-first design
- 🌙 **Dark Mode** - Built-in theme support

---

## 📦 Package Structure

```
ONE-ECOMMERCE-PACKAGE/
│
├── 📁 src/
│   ├── 📁 components/
│   │   ├── 📁 shop/                    # Shop UI components
│   │   │   ├── ProductHeader.tsx       # Navigation header
│   │   │   ├── ProductCard.tsx         # Product display
│   │   │   ├── CartButton.tsx          # Shopping cart
│   │   │   ├── ThemeToggle.tsx         # Dark/light toggle
│   │   │   └── ...
│   │   │
│   │   └── 📁 web3/                    # Payment components
│   │       ├── Web3Provider.tsx        # Wagmi provider
│   │       ├── WalletConnectButton.tsx # Wallet connection
│   │       ├── X402PaymentButton.tsx   # Simple payment
│   │       ├── ImprovedX402PaymentButton.tsx  # Enhanced payment
│   │       └── X402CheckoutFlow.tsx    # Complete checkout
│   │
│   ├── 📁 pages/
│   │   └── 📁 shop/                    # Ready-to-use pages
│   │       ├── marketplace.astro       # Product listing
│   │       ├── checkout.astro          # Stripe + X402 checkout
│   │       ├── order-confirmation.astro # Success page
│   │       └── product-landing.astro   # Single product template
│   │
│   ├── 📁 hooks/
│   │   └── useX402Payment.ts          # Payment hook with sessions
│   │
│   ├── 📁 lib/
│   │   ├── 📁 web3/
│   │   │   └── config.ts              # Web3 configuration
│   │   └── 📁 utils/
│   │       └── helpers.ts             # Utility functions
│   │
│   └── 📁 layouts/
│       └── ShopLayout.astro           # Shop page layout
│
├── 📁 docs/
│   ├── STRIPE-SETUP.md                # Stripe integration guide
│   ├── X402-SETUP.md                  # Crypto payment setup
│   ├── COMPARISON.md                  # Payment methods comparison
│   └── EXAMPLES.md                    # Usage examples
│
├── 📄 INSTALL.md                      # Installation instructions
├── 📄 QUICK-START.md                  # 5-minute quick start
├── 📄 .env.example                    # Environment variables
└── 📄 package.json                    # Dependencies list
```

---

## 🚀 Quick Install (3 Steps)

### Step 1: Copy Files

```bash
# From your Astro project root
cp -r ONE-ECOMMERCE-PACKAGE/src/* src/
```

### Step 2: Install Dependencies

```bash
# Core dependencies (always needed)
bun add stripe

# X402 dependencies (optional, for crypto payments)
bun add wagmi viem @tanstack/react-query @rainbow-me/rainbowkit
```

### Step 3: Configure Environment

```bash
# Copy environment template
cp ONE-ECOMMERCE-PACKAGE/.env.example .env

# Add your keys
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxx
PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxx
PUBLIC_X402_ENABLED=true
```

**Done!** Visit `/shop/checkout` to see it in action.

---

## 📚 Documentation

Each doc is self-contained and focused:

- **INSTALL.md** - Complete installation guide
- **QUICK-START.md** - Get started in 5 minutes
- **docs/STRIPE-SETUP.md** - Stripe integration (10 min)
- **docs/X402-SETUP.md** - Crypto payments (15 min)
- **docs/COMPARISON.md** - Stripe vs X402 comparison
- **docs/EXAMPLES.md** - Code examples and patterns

---

## 🎯 Usage Patterns

### Pattern 1: Use Complete System

Copy everything and get full e-commerce:
- Product marketplace
- Shopping cart
- Stripe checkout
- X402 crypto payments
- Order confirmation

### Pattern 2: Stripe Only

Skip Web3 components, use Stripe only:
- Copy: `components/shop/`, `pages/shop/checkout.astro`
- Skip: `components/web3/`, `hooks/useX402Payment.ts`

### Pattern 3: X402 Only

Use crypto payments without Stripe:
- Copy: `components/web3/`, `hooks/useX402Payment.ts`
- Skip: Stripe configuration

### Pattern 4: Custom Integration

Pick individual components:
- `ImprovedX402PaymentButton.tsx` - Drop-in payment button
- `useX402Payment.ts` - Payment hook for custom UI
- `checkout.astro` - Template for your checkout

---

## 🎨 Design System

All components follow a consistent design language:

```css
/* Core Principles */
- Minimalist black/white
- 2px borders everywhere
- Bold uppercase labels (tracking: 0.2em)
- Tabular numbers for prices
- Clean hover states (opacity: 0.8)
- Mobile-first responsive
```

**Matches perfectly with:**
- shadcn/ui components
- Tailwind CSS
- Radix UI primitives

---

## 🔧 Configuration

### Stripe Configuration

```typescript
// In your .env
STRIPE_SECRET_KEY=sk_test_xxxxx
PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
```

### X402 Configuration

```typescript
// In your .env
PUBLIC_X402_ENABLED=true
PUBLIC_WALLETCONNECT_PROJECT_ID=xxxxx
PUBLIC_X402_RECIPIENT_ADDRESS=0xYourAddress
```

### Custom Styling

All components accept `className` prop:

```tsx
<ImprovedX402PaymentButton
  className="custom-button-class"
  variant="primary"
/>
```

---

## 🌟 Key Features

### Session-Based Payments
```tsx
// Pay once, access 24 hours
<ImprovedX402PaymentButton
  amount="10.00"
  sessionEnabled={true}
  sessionDuration={86400}
/>
```

### Stripe Checkout
```tsx
// Redirect to Stripe's secure checkout
<form action="/shop/checkout" method="POST">
  <button>Pay with Card</button>
</form>
```

### Order Confirmation
```tsx
// Automatic payment verification
/shop/order-confirmation?session_id=xxx  // Stripe
/shop/order-confirmation?tx=0xabc...     // X402
```

---

## 📊 File Sizes

| File | Size | Purpose |
|------|------|---------|
| `checkout.astro` | 380 lines | Main checkout page |
| `order-confirmation.astro` | 340 lines | Success page |
| `ImprovedX402PaymentButton.tsx` | 250 lines | Payment button |
| `useX402Payment.ts` | 280 lines | Payment hook |
| `Web3Provider.tsx` | 50 lines | Web3 setup |
| **Total** | ~1,300 lines | Complete system |

Small, focused, maintainable.

---

## 🎁 Bonus Features

Included but optional:

- **Session Management** - localStorage sessions with expiration
- **Dark Mode** - `ThemeToggle.tsx` component
- **Mobile Responsive** - All breakpoints covered
- **Accessibility** - ARIA labels, keyboard navigation
- **TypeScript** - Full type safety
- **Error Handling** - User-friendly error messages
- **Loading States** - Clear feedback at every step

---

## 🚀 Getting Started

1. **Read** `QUICK-START.md` (5 minutes)
2. **Copy** files to your project
3. **Install** dependencies
4. **Configure** environment variables
5. **Test** with Stripe test cards
6. **Deploy** to production

---

## 📖 Learn More

- [Stripe Documentation](https://stripe.com/docs)
- [X402 Protocol](https://x402.org)
- [Coinbase Base](https://base.org)
- [Wagmi Docs](https://wagmi.sh)

---

## 🤝 Support

- Check `docs/` folder for guides
- Read `EXAMPLES.md` for code patterns
- See `COMPARISON.md` for payment method comparison

---

## ✅ Compatibility

- ✅ Astro 4.x, 5.x
- ✅ React 18, 19
- ✅ Tailwind CSS 3.x, 4.x
- ✅ shadcn/ui components
- ✅ TypeScript 5.x
- ✅ Node 18+, Bun

---

**Built with love for the Astro + shadcn community** ❤️

**Version:** 1.0.0
**License:** MIT
**Author:** ONE Platform
