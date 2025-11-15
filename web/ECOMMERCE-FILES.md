# 📦 E-Commerce Package - File Manifest

**Complete list of all e-commerce files ready to copy into a new Astro + shadcn/ui project**

---

## 🎯 Copy Commands

### Option 1: Copy Everything (Full Package)
```bash
# From your-project root, run these commands:

# 1. Components
cp -r ../one/web/src/components/shop src/components/
cp -r ../one/web/src/components/web3 src/components/

# 2. Pages
cp -r ../one/web/src/pages/shop src/pages/

# 3. Hooks
mkdir -p src/hooks
cp ../one/web/src/hooks/useX402Payment.ts src/hooks/

# 4. Lib
mkdir -p src/lib/web3
cp ../one/web/src/lib/web3/config.ts src/lib/web3/

# 5. Layouts
mkdir -p src/layouts
cp ../one/web/src/layouts/ShopLayout.astro src/layouts/
```

### Option 2: Stripe Only (No Crypto)
```bash
# Skip web3 components and X402 pages:

# 1. Components (shop only)
cp -r ../one/web/src/components/shop src/components/

# 2. Pages (exclude X402)
mkdir -p src/pages/shop/{demo,tutorial}
cp ../one/web/src/pages/shop/product-landing.astro src/pages/shop/
cp ../one/web/src/pages/shop/marketplace.astro src/pages/shop/
cp ../one/web/src/pages/shop/checkout.astro src/pages/shop/
cp ../one/web/src/pages/shop/order-confirmation.astro src/pages/shop/
cp ../one/web/src/pages/shop/[productId].astro src/pages/shop/
cp ../one/web/src/pages/shop/demo.astro src/pages/shop/
cp ../one/web/src/pages/shop/demo/components.astro src/pages/shop/demo/
cp ../one/web/src/pages/shop/tutorial/*.astro src/pages/shop/tutorial/

# 3. Layout
cp ../one/web/src/layouts/ShopLayout.astro src/layouts/
```

---

## 📁 File Structure (37 files total)

```
src/
├── components/
│   ├── shop/                          # 17 files, 1,880+ lines
│   │   ├── FAQ.tsx
│   │   ├── FAQMinimal.tsx
│   │   ├── FeaturesList.tsx
│   │   ├── FeaturesWithImages.tsx
│   │   ├── FragranceNotes.tsx
│   │   ├── InlineUrgencyBanner.tsx
│   │   ├── ProductHeader.tsx
│   │   ├── ProductHero.tsx
│   │   ├── ProductSpecs.tsx
│   │   ├── RecentPurchaseToast.tsx
│   │   ├── ReviewsSection.tsx
│   │   ├── ShopHero.tsx
│   │   ├── StickyBuyBar.tsx
│   │   ├── StickyCartButton.tsx
│   │   ├── ThemeToggle.tsx
│   │   ├── TopBar.tsx
│   │   └── ValueProposition.tsx
│   │
│   └── web3/                          # 5 files, 1,030+ lines
│       ├── ImprovedX402PaymentButton.tsx
│       ├── WalletConnectButton.tsx
│       ├── Web3Provider.tsx
│       ├── X402CheckoutFlow.tsx
│       └── X402PaymentButton.tsx
│
├── pages/
│   └── shop/                          # 12 files, 6,000+ lines
│       ├── [productId].astro          # Dynamic product pages
│       ├── checkout.astro             # Stripe + X402 checkout
│       ├── checkout-x402.astro        # X402-only checkout
│       ├── demo.astro                 # Main demo
│       ├── marketplace.astro          # Product catalog
│       ├── order-confirmation.astro   # Success page
│       ├── product-landing.astro      # Product sales page
│       ├── x402-features.astro        # X402 features
│       │
│       ├── demo/
│       │   └── components.astro       # Component gallery
│       │
│       └── tutorial/
│           ├── index.astro            # Setup tutorial
│           ├── stripe.astro           # Stripe guide
│           └── x402.astro             # X402 guide
│
├── hooks/
│   └── useX402Payment.ts              # 1 file, 150+ lines
│
├── lib/
│   └── web3/
│       └── config.ts                  # 1 file, 80+ lines
│
└── layouts/
    └── ShopLayout.astro               # 1 file, 100+ lines
```

---

## 📊 Summary by Category

| Category | Files | Lines | Description |
|----------|-------|-------|-------------|
| **Shop Components** | 17 | 1,880+ | UI components for e-commerce |
| **Web3 Components** | 5 | 1,030+ | X402 crypto payment components |
| **Pages** | 12 | 6,000+ | Complete pages (sales, demos, tutorials) |
| **Hooks** | 1 | 150+ | X402 payment hook |
| **Utils** | 2 | 180+ | Web3 config + layout |
| **TOTAL** | **37** | **9,240+** | Production-ready e-commerce system |

---

## 🛠️ Component Details

### Shop Components (17)

1. **FAQ.tsx** (200 lines) - Full FAQ with search, categories, accordions
2. **FAQMinimal.tsx** (100 lines) - Compact FAQ for product pages
3. **FeaturesList.tsx** (80 lines) - Bulleted feature list with icons
4. **FeaturesWithImages.tsx** (150 lines) - Rich feature showcase
5. **FragranceNotes.tsx** (100 lines) - Tiered product attributes
6. **InlineUrgencyBanner.tsx** (60 lines) - "Only 7 left!" scarcity messages
7. **ProductHeader.tsx** (80 lines) - Product page breadcrumbs
8. **ProductHero.tsx** (150 lines) - Product detail hero with image/price
9. **ProductSpecs.tsx** (100 lines) - Technical specifications grid
10. **RecentPurchaseToast.tsx** (120 lines) - "John just bought..." popups
11. **ReviewsSection.tsx** (200 lines) - Customer reviews with photos
12. **ShopHero.tsx** (150 lines) - Main shop homepage hero
13. **StickyBuyBar.tsx** (80 lines) - Fixed mobile purchase bar
14. **StickyCartButton.tsx** (90 lines) - Floating add-to-cart button
15. **ThemeToggle.tsx** (70 lines) - Dark/light mode switcher
16. **TopBar.tsx** (150 lines) - Site navigation with cart/search
17. **ValueProposition.tsx** (100 lines) - Key benefits section

### Web3/X402 Components (5)

1. **Web3Provider.tsx** (150 lines) - RainbowKit + wagmi provider setup
2. **WalletConnectButton.tsx** (80 lines) - Multi-wallet connection (MetaMask, Coinbase)
3. **X402PaymentButton.tsx** (200 lines) - Basic X402 payment button
4. **ImprovedX402PaymentButton.tsx** (250 lines) - Enhanced with session management
5. **X402CheckoutFlow.tsx** (350 lines) - Complete checkout with cart

### Pages (12)

**Core Pages (6):**
1. **product-landing.astro** (600 lines) - Complete sales page + Stripe checkout
2. **marketplace.astro** (400 lines) - Product catalog with filters
3. **checkout.astro** (500 lines) - Dual payment (Stripe + X402)
4. **checkout-x402.astro** (350 lines) - X402-only checkout
5. **order-confirmation.astro** (300 lines) - Post-purchase success
6. **[productId].astro** (400 lines) - Dynamic product pages

**Demo Pages (3):**
7. **demo.astro** (350 lines) - Main demo showcase
8. **demo/components.astro** (900 lines) - Interactive component gallery
9. **x402-features.astro** (700 lines) - X402 features + comparison table

**Tutorial Pages (3):**
10. **tutorial/index.astro** (450 lines) - 6-step setup guide
11. **tutorial/stripe.astro** (550 lines) - Stripe integration guide
12. **tutorial/x402.astro** (500 lines) - X402 crypto payment setup

---

## 📦 Dependencies

### Required (Stripe Only)
```bash
bun add stripe
bun add -D @types/stripe
```

### Optional (X402 Crypto)
```bash
bun add wagmi viem @rainbow-me/rainbowkit
```

---

## ⚙️ Environment Setup

Create `.env` file:

```bash
# Stripe (Required)
STRIPE_SECRET_KEY=sk_test_your_key_here
PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here

# X402 (Optional - only if using crypto)
PUBLIC_X402_ENABLED=true
PUBLIC_USDC_CONTRACT_ADDRESS=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
PUBLIC_MERCHANT_WALLET=0xYourWalletAddressHere
PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
```

---

## ✅ Post-Copy Checklist

After copying files:

1. **Install Dependencies**
   ```bash
   bun add stripe @types/stripe
   # Optional: bun add wagmi viem @rainbow-me/rainbowkit
   ```

2. **Configure Environment**
   - Create `.env` file
   - Add Stripe keys from dashboard.stripe.com
   - (Optional) Add X402 config

3. **Test Dev Server**
   ```bash
   bun run dev
   ```

4. **Visit Demo Pages**
   - http://localhost:4321/shop/product-landing
   - http://localhost:4321/shop/demo
   - http://localhost:4321/shop/tutorial

5. **Customize**
   - Update product names/prices in pages
   - Replace product images
   - Update merchant wallet in `lib/web3/config.ts`
   - Customize colors in Tailwind config

---

## 🎨 Design System

All components use:
- **Style:** Minimalist black/white, brutalist
- **Borders:** 2px everywhere
- **Font:** Inter (variable weight)
- **Framework:** Astro 5 + React 19
- **UI:** shadcn/ui components
- **Dark Mode:** Full support
- **Responsive:** Mobile-first

---

## 🚀 Quick Start (5 minutes)

```bash
# 1. Copy files
cp -r ../one/web/src/components/shop src/components/
cp -r ../one/web/src/pages/shop src/pages/
cp ../one/web/src/layouts/ShopLayout.astro src/layouts/

# 2. Install
bun add stripe @types/stripe

# 3. Configure
cat > .env << EOF
STRIPE_SECRET_KEY=sk_test_...
PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
EOF

# 4. Run
bun run dev

# 5. Visit
open http://localhost:4321/shop/product-landing
```

---

## 📚 Live Documentation

Once running, visit these pages:

- **Demo Showcase:** `/shop/demo`
- **Component Gallery:** `/shop/demo/components`
- **Setup Tutorial:** `/shop/tutorial`
- **Stripe Guide:** `/shop/tutorial/stripe`
- **X402 Guide:** `/shop/tutorial/x402`
- **X402 Features:** `/shop/x402-features`

---

## 🎯 Minimal vs Full Setup

### Minimal (Stripe Only) - 27 files
- 17 shop components
- 8 pages (no X402)
- 1 layout
- 1 hook (optional)

### Full (Stripe + X402) - 37 files
- All 22 components
- All 12 pages
- All hooks/utils
- Complete crypto payment support

---

**Total Package:** 37 files, 9,240+ lines, production-ready 🚀
