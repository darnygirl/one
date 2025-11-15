# 📦 E-Commerce Package - Organized Copy Guide

**Beautifully structured for easy copying into any Astro + shadcn/ui project**

---

## 🎯 Recommended Project Structure

```
your-project/
├── src/
│   ├── components/
│   │   ├── shop/              # General e-commerce components (17 files)
│   │   └── x402/              # X402 crypto payment components (5 files)
│   │
│   ├── hooks/
│   │   ├── shop/              # General shop hooks (future)
│   │   └── x402/              # X402 payment hooks (1 file)
│   │
│   ├── lib/
│   │   ├── shop/              # Shop utilities (future)
│   │   └── x402/              # X402 utilities (1 file)
│   │
│   ├── layouts/
│   │   └── ShopLayout.astro   # Base shop layout (1 file)
│   │
│   └── pages/
│       ├── shop/              # General shop pages (6 files)
│       │   ├── product-landing.astro
│       │   ├── marketplace.astro
│       │   ├── checkout.astro
│       │   ├── order-confirmation.astro
│       │   ├── [productId].astro
│       │   └── demo/
│       │       └── components.astro
│       │
│       ├── x402/              # X402-specific pages (3 files)
│       │   ├── checkout.astro
│       │   ├── features.astro
│       │   └── tutorial.astro
│       │
│       ├── demo/              # Demo showcase (1 file)
│       │   └── index.astro
│       │
│       ├── tutorial/          # Setup tutorials (2 files)
│       │   ├── index.astro
│       │   └── stripe.astro
│       │
│       └── api/               # API routes (future)
│           └── x402/          # X402 payment endpoints
│               └── webhooks.ts
```

---

## 🚀 Quick Copy Commands

### Complete Package (All Files)
```bash
# Navigate to your new project
cd your-project/src

# 1. Components
mkdir -p components/{shop,x402}
cp -r /path/to/one/web/src/components/shop/* components/shop/
cp -r /path/to/one/web/src/components/web3/* components/x402/

# 2. Hooks
mkdir -p hooks/x402
cp /path/to/one/web/src/hooks/useX402Payment.ts hooks/x402/

# 3. Lib
mkdir -p lib/x402
cp /path/to/one/web/src/lib/web3/config.ts lib/x402/

# 4. Layouts
mkdir -p layouts
cp /path/to/one/web/src/layouts/ShopLayout.astro layouts/

# 5. Pages - Shop
mkdir -p pages/shop/demo
cp /path/to/one/web/src/pages/shop/product-landing.astro pages/shop/
cp /path/to/one/web/src/pages/shop/marketplace.astro pages/shop/
cp /path/to/one/web/src/pages/shop/checkout.astro pages/shop/
cp /path/to/one/web/src/pages/shop/order-confirmation.astro pages/shop/
cp /path/to/one/web/src/pages/shop/\[productId\].astro pages/shop/
cp /path/to/one/web/src/pages/shop/demo/components.astro pages/shop/demo/

# 6. Pages - X402
mkdir -p pages/x402
cp /path/to/one/web/src/pages/shop/checkout-x402.astro pages/x402/checkout.astro
cp /path/to/one/web/src/pages/shop/x402-features.astro pages/x402/features.astro
cp /path/to/one/web/src/pages/shop/tutorial/x402.astro pages/x402/tutorial.astro

# 7. Pages - Demo
mkdir -p pages/demo
cp /path/to/one/web/src/pages/shop/demo.astro pages/demo/index.astro

# 8. Pages - Tutorial
mkdir -p pages/tutorial
cp /path/to/one/web/src/pages/shop/tutorial.astro pages/tutorial/index.astro
cp /path/to/one/web/src/pages/shop/tutorial/stripe.astro pages/tutorial/stripe.astro
```

---

## 📁 File Mapping (Source → Destination)

### Components (22 files)

#### Shop Components (17 files)
| Source | Destination | Purpose |
|--------|-------------|---------|
| `components/shop/FAQ.tsx` | `components/shop/FAQ.tsx` | Full FAQ with search |
| `components/shop/FAQMinimal.tsx` | `components/shop/FAQMinimal.tsx` | Compact FAQ |
| `components/shop/FeaturesList.tsx` | `components/shop/FeaturesList.tsx` | Feature list |
| `components/shop/FeaturesWithImages.tsx` | `components/shop/FeaturesWithImages.tsx` | Rich features |
| `components/shop/FragranceNotes.tsx` | `components/shop/FragranceNotes.tsx` | Tiered attributes |
| `components/shop/InlineUrgencyBanner.tsx` | `components/shop/InlineUrgencyBanner.tsx` | Scarcity messages |
| `components/shop/ProductHeader.tsx` | `components/shop/ProductHeader.tsx` | Breadcrumbs |
| `components/shop/ProductHero.tsx` | `components/shop/ProductHero.tsx` | Product hero |
| `components/shop/ProductSpecs.tsx` | `components/shop/ProductSpecs.tsx` | Specs grid |
| `components/shop/RecentPurchaseToast.tsx` | `components/shop/RecentPurchaseToast.tsx` | Social proof |
| `components/shop/ReviewsSection.tsx` | `components/shop/ReviewsSection.tsx` | Reviews |
| `components/shop/ShopHero.tsx` | `components/shop/ShopHero.tsx` | Shop hero |
| `components/shop/StickyBuyBar.tsx` | `components/shop/StickyBuyBar.tsx` | Mobile buy bar |
| `components/shop/StickyCartButton.tsx` | `components/shop/StickyCartButton.tsx` | Cart button |
| `components/shop/ThemeToggle.tsx` | `components/shop/ThemeToggle.tsx` | Dark mode |
| `components/shop/TopBar.tsx` | `components/shop/TopBar.tsx` | Navigation |
| `components/shop/ValueProposition.tsx` | `components/shop/ValueProposition.tsx` | Benefits |

#### X402 Components (5 files)
| Source | Destination | Purpose |
|--------|-------------|---------|
| `components/web3/Web3Provider.tsx` | `components/x402/Web3Provider.tsx` | RainbowKit setup |
| `components/web3/WalletConnectButton.tsx` | `components/x402/WalletConnectButton.tsx` | Wallet connection |
| `components/web3/X402PaymentButton.tsx` | `components/x402/X402PaymentButton.tsx` | Basic payment |
| `components/web3/ImprovedX402PaymentButton.tsx` | `components/x402/ImprovedX402PaymentButton.tsx` | Enhanced payment |
| `components/web3/X402CheckoutFlow.tsx` | `components/x402/X402CheckoutFlow.tsx` | Complete checkout |

---

### Hooks (1 file)

| Source | Destination | Purpose |
|--------|-------------|---------|
| `hooks/useX402Payment.ts` | `hooks/x402/useX402Payment.ts` | X402 payment hook |

---

### Lib/Utils (1 file)

| Source | Destination | Purpose |
|--------|-------------|---------|
| `lib/web3/config.ts` | `lib/x402/config.ts` | Web3 configuration |

---

### Layouts (1 file)

| Source | Destination | Purpose |
|--------|-------------|---------|
| `layouts/ShopLayout.astro` | `layouts/ShopLayout.astro` | Base shop layout |

---

### Pages (12 files)

#### Shop Pages (6 files)
| Source | Destination | Purpose |
|--------|-------------|---------|
| `pages/shop/product-landing.astro` | `pages/shop/product-landing.astro` | Product sales page |
| `pages/shop/marketplace.astro` | `pages/shop/marketplace.astro` | Product catalog |
| `pages/shop/checkout.astro` | `pages/shop/checkout.astro` | Dual checkout (Stripe + X402) |
| `pages/shop/order-confirmation.astro` | `pages/shop/order-confirmation.astro` | Success page |
| `pages/shop/[productId].astro` | `pages/shop/[productId].astro` | Dynamic products |
| `pages/shop/demo/components.astro` | `pages/shop/demo/components.astro` | Component gallery |

#### X402 Pages (3 files)
| Source | Destination | Purpose |
|--------|-------------|---------|
| `pages/shop/checkout-x402.astro` | `pages/x402/checkout.astro` | X402-only checkout |
| `pages/shop/x402-features.astro` | `pages/x402/features.astro` | Features showcase |
| `pages/shop/tutorial/x402.astro` | `pages/x402/tutorial.astro` | X402 setup guide |

#### Demo Pages (1 file)
| Source | Destination | Purpose |
|--------|-------------|---------|
| `pages/shop/demo.astro` | `pages/demo/index.astro` | Main demo showcase |

#### Tutorial Pages (2 files)
| Source | Destination | Purpose |
|--------|-------------|---------|
| `pages/shop/tutorial.astro` | `pages/tutorial/index.astro` | Main setup guide |
| `pages/shop/tutorial/stripe.astro` | `pages/tutorial/stripe.astro` | Stripe guide |

---

## 📊 File Summary by Category

| Category | Folder | Files | Lines | Description |
|----------|--------|-------|-------|-------------|
| **Shop Components** | `components/shop/` | 17 | 1,880+ | General e-commerce UI |
| **X402 Components** | `components/x402/` | 5 | 1,030+ | Crypto payment UI |
| **X402 Hooks** | `hooks/x402/` | 1 | 150+ | Payment logic |
| **X402 Utils** | `lib/x402/` | 1 | 80+ | Configuration |
| **Layouts** | `layouts/` | 1 | 100+ | Base layout |
| **Shop Pages** | `pages/shop/` | 6 | 3,150+ | Core shop pages |
| **X402 Pages** | `pages/x402/` | 3 | 1,600+ | X402-specific pages |
| **Demo Pages** | `pages/demo/` | 1 | 350+ | Showcase |
| **Tutorial Pages** | `pages/tutorial/` | 2 | 1,000+ | Setup guides |
| **TOTAL** | | **37** | **9,240+** | Complete system |

---

## 🎯 Import Path Updates

After copying with the new structure, update these import paths:

### In X402 Components
```typescript
// OLD (from components/web3/)
import { useX402Payment } from '@/hooks/useX402Payment';
import config from '@/lib/web3/config';

// NEW (from components/x402/)
import { useX402Payment } from '@/hooks/x402/useX402Payment';
import config from '@/lib/x402/config';
```

### In X402 Pages
```astro
---
// OLD
import { X402CheckoutFlow } from '@/components/web3/X402CheckoutFlow';

// NEW
import { X402CheckoutFlow } from '@/components/x402/X402CheckoutFlow';
---
```

### In Shop Pages Using X402
```astro
---
// pages/shop/checkout.astro
// OLD
import { X402CheckoutFlow } from '@/components/web3/X402CheckoutFlow';

// NEW
import { X402CheckoutFlow } from '@/components/x402/X402CheckoutFlow';
---
```

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

## ⚙️ Environment Variables

```bash
# Stripe (Required)
STRIPE_SECRET_KEY=sk_test_your_key_here
PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here

# X402 (Optional)
PUBLIC_X402_ENABLED=true
PUBLIC_USDC_CONTRACT_ADDRESS=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
PUBLIC_MERCHANT_WALLET=0xYourWalletAddressHere
PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
```

---

## 🔧 Configuration Updates

### Update lib/x402/config.ts
```typescript
// lib/x402/config.ts
export const X402_CONFIG = {
  usdcAddress: import.meta.env.PUBLIC_USDC_CONTRACT_ADDRESS,
  merchantWallet: import.meta.env.PUBLIC_MERCHANT_WALLET,
  walletConnectProjectId: import.meta.env.PUBLIC_WALLETCONNECT_PROJECT_ID,
  chainId: 8453, // Base mainnet
};
```

---

## 🚀 Quick Start (5 Steps)

### Step 1: Copy Files
```bash
cd your-project/src

# Run the copy commands from the "Quick Copy Commands" section above
```

### Step 2: Update Imports
```bash
# Update import paths in copied files
# components/x402/* → update to use @/hooks/x402/ and @/lib/x402/
# pages/x402/* → update to use @/components/x402/
```

### Step 3: Install Dependencies
```bash
cd your-project
bun add stripe @types/stripe

# Optional:
bun add wagmi viem @rainbow-me/rainbowkit
```

### Step 4: Configure Environment
```bash
cat > .env << EOF
STRIPE_SECRET_KEY=sk_test_...
PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
EOF
```

### Step 5: Run
```bash
bun run dev

# Visit:
# http://localhost:4321/shop/product-landing
# http://localhost:4321/demo
# http://localhost:4321/x402/features
```

---

## 📍 New URL Structure

After reorganization, your URLs will be:

### Shop Pages
- `/shop/product-landing` - Product sales page
- `/shop/marketplace` - Product catalog
- `/shop/checkout` - Dual checkout (Stripe + X402)
- `/shop/order-confirmation` - Success page
- `/shop/headphones` - Dynamic product

### X402 Pages
- `/x402/checkout` - X402-only checkout
- `/x402/features` - Features showcase
- `/x402/tutorial` - Setup guide

### Demo Pages
- `/demo` - Main showcase
- `/shop/demo/components` - Component gallery

### Tutorial Pages
- `/tutorial` - Main setup guide
- `/tutorial/stripe` - Stripe guide

---

## ✨ Benefits of This Structure

✅ **Clear Separation** - Shop vs X402 clearly separated
✅ **Easy to Find** - All X402 files in x402/ folders
✅ **Scalable** - Easy to add more payment methods
✅ **Clean URLs** - `/x402/*` for all crypto features
✅ **Import Clarity** - `@/components/x402/` vs `@/components/shop/`
✅ **Optional** - Remove entire x402/ folder to disable crypto

---

## 🎨 Folder Colors (VSCode)

Add to `.vscode/settings.json`:
```json
{
  "workbench.colorCustomizations": {
    "tree.foreground": {
      "src/components/shop": "#00FF00",
      "src/components/x402": "#FF6B00",
      "src/pages/shop": "#00FF00",
      "src/pages/x402": "#FF6B00"
    }
  }
}
```

---

## 📝 Complete File List

### Components (22 files)
```
components/
├── shop/ (17 files)
│   ├── FAQ.tsx
│   ├── FAQMinimal.tsx
│   ├── FeaturesList.tsx
│   ├── FeaturesWithImages.tsx
│   ├── FragranceNotes.tsx
│   ├── InlineUrgencyBanner.tsx
│   ├── ProductHeader.tsx
│   ├── ProductHero.tsx
│   ├── ProductSpecs.tsx
│   ├── RecentPurchaseToast.tsx
│   ├── ReviewsSection.tsx
│   ├── ShopHero.tsx
│   ├── StickyBuyBar.tsx
│   ├── StickyCartButton.tsx
│   ├── ThemeToggle.tsx
│   ├── TopBar.tsx
│   └── ValueProposition.tsx
│
└── x402/ (5 files)
    ├── Web3Provider.tsx
    ├── WalletConnectButton.tsx
    ├── X402PaymentButton.tsx
    ├── ImprovedX402PaymentButton.tsx
    └── X402CheckoutFlow.tsx
```

### Hooks (1 file)
```
hooks/
└── x402/
    └── useX402Payment.ts
```

### Lib (1 file)
```
lib/
└── x402/
    └── config.ts
```

### Layouts (1 file)
```
layouts/
└── ShopLayout.astro
```

### Pages (12 files)
```
pages/
├── shop/ (6 files)
│   ├── product-landing.astro
│   ├── marketplace.astro
│   ├── checkout.astro
│   ├── order-confirmation.astro
│   ├── [productId].astro
│   └── demo/
│       └── components.astro
│
├── x402/ (3 files)
│   ├── checkout.astro
│   ├── features.astro
│   └── tutorial.astro
│
├── demo/ (1 file)
│   └── index.astro
│
└── tutorial/ (2 files)
    ├── index.astro
    └── stripe.astro
```

---

## 🎯 Minimal Setup (Stripe Only)

If you only want Stripe (no crypto), skip these folders:

❌ **Skip:**
- `components/x402/` (entire folder)
- `hooks/x402/` (entire folder)
- `lib/x402/` (entire folder)
- `pages/x402/` (entire folder)

✅ **Keep:**
- `components/shop/` (all 17 files)
- `layouts/` (1 file)
- `pages/shop/` (6 files)
- `pages/demo/` (1 file)
- `pages/tutorial/` (2 files, including Stripe guide)

**Result:** 27 files instead of 37

---

**Total:** 37 files, 9,240+ lines, beautifully organized and ready to copy! 🚀
