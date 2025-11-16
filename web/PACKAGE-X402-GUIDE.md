# Package X402 - Installation Guide

**Location:** `/package/x402/`

This is a standalone, production-ready npm package for X402 gasless crypto payments.

## 📦 What's in the Package

### Structure
```
package/x402/
├── package.json                 # npm package configuration
├── README.md                    # Comprehensive documentation
├── MANIFEST.md                  # Complete file inventory
├── .env.example                 # Environment template
│
├── src/
│   ├── index.ts                 # Main exports
│   ├── components/              # 5 React components
│   │   ├── Web3Provider.tsx
│   │   ├── WalletConnectButton.tsx
│   │   ├── X402PaymentButton.tsx
│   │   ├── ImprovedX402PaymentButton.tsx
│   │   └── X402CheckoutFlow.tsx
│   │
│   ├── hooks/                   # 1 payment hook
│   │   └── useX402Payment.ts
│   │
│   ├── lib/                     # 1 config utility
│   │   └── config.ts
│   │
│   ├── types/                   # TypeScript definitions
│   │   └── index.ts
│   │
│   └── pages/                   # 3 example pages
│       ├── checkout.astro
│       ├── features.astro
│       └── tutorial.astro
│
└── docs/                        # Documentation
    ├── INSTALLATION.md          # Step-by-step setup
    └── API.md                   # Complete API reference
```

## 📊 Package Stats

- **Total Files:** 18 (15 source + 3 docs)
- **Total Lines:** 5,040+
- **Components:** 5 (1,030+ lines)
- **Hooks:** 1 (150+ lines)
- **Pages:** 3 (1,600+ lines)
- **Documentation:** 4 files (2,100+ lines)

## 🚀 How to Use This Package

### Option 1: Copy Directly (Recommended for Now)

Since the package isn't published to npm yet, copy files directly:

```bash
# From your Astro project:
cd your-project

# Copy components
cp -r ../one/package/x402/src/components src/components/x402

# Copy hooks
mkdir -p src/hooks/x402
cp ../one/package/x402/src/hooks/useX402Payment.ts src/hooks/x402/

# Copy lib
mkdir -p src/lib/x402
cp ../one/package/x402/src/lib/config.ts src/lib/x402/

# Copy pages (optional)
mkdir -p src/pages/x402
cp ../one/package/x402/src/pages/*.astro src/pages/x402/

# Copy types
mkdir -p src/types
cp ../one/package/x402/src/types/index.ts src/types/x402.ts
```

### Option 2: Future npm Install

When published to npm:

```bash
bun add @one/x402 wagmi viem @rainbow-me/rainbowkit
```

Then import:

```tsx
import { X402PaymentButton } from '@one/x402';
```

## 🎯 What Each Component Does

### Components

1. **Web3Provider.tsx** (150 lines)
   - RainbowKit + wagmi configuration for Base network
   - Must wrap your app to enable X402
   - Configures wallet connection UI

2. **WalletConnectButton.tsx** (80 lines)
   - Multi-wallet connection button
   - Supports MetaMask, Coinbase Wallet, WalletConnect
   - Shows connected address and network

3. **X402PaymentButton.tsx** (200 lines)
   - Basic payment button for single transactions
   - Customer signs message (free)
   - Merchant pays gas (~$0.0001)
   - Props: amount, recipientAddress, onSuccess, onError

4. **ImprovedX402PaymentButton.tsx** (250 lines)
   - Enhanced payment with session management
   - Backend verification support
   - Unlock digital content after payment
   - Better error handling and UX

5. **X402CheckoutFlow.tsx** (350 lines)
   - Complete checkout flow with cart
   - Wallet connection
   - Balance checking
   - Payment execution
   - Order confirmation

### Hooks

1. **useX402Payment.ts** (150 lines)
   - React hook for payment logic
   - Returns: status, error, txHash, initiatePayment, reset
   - Handles: signing, submitting, confirming
   - Full TypeScript support

### Utilities

1. **config.ts** (80 lines)
   - Base network configuration (Chain ID: 8453)
   - USDC contract address on Base
   - Merchant wallet address
   - WalletConnect project ID

### Pages (Examples)

1. **checkout.astro** (350 lines)
   - Complete X402-only checkout page
   - Shopping cart display
   - Wallet connection
   - Payment flow

2. **features.astro** (700 lines)
   - X402 features showcase
   - Comparison table (Stripe vs X402 vs traditional crypto)
   - Cost analysis
   - Use cases

3. **tutorial.astro** (550 lines)
   - Step-by-step setup guide
   - WalletConnect configuration
   - Test payment instructions
   - Troubleshooting

## 📖 Documentation Files

1. **README.md** (400 lines)
   - Package overview
   - Quick start guide
   - Usage examples
   - Cost comparison
   - Links and resources

2. **INSTALLATION.md** (400 lines)
   - Prerequisites
   - Step-by-step installation
   - Environment configuration
   - Get WalletConnect ID
   - Test payment flow
   - Production deployment
   - Troubleshooting

3. **API.md** (1,100 lines)
   - Complete API reference
   - All component props
   - Hook usage
   - Type definitions
   - Event lifecycle
   - Best practices

4. **MANIFEST.md** (200 lines)
   - Complete file inventory
   - Line counts
   - File purposes
   - Export structure

## ⚙️ Environment Variables Needed

```bash
# .env
PUBLIC_X402_ENABLED=true
PUBLIC_USDC_CONTRACT_ADDRESS=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
PUBLIC_MERCHANT_WALLET=0xYourWalletAddressHere
PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
```

## 🔧 Dependencies

### Required (Peer Dependencies)
```json
{
  "wagmi": "^2.0.0",
  "viem": "^2.0.0",
  "@rainbow-me/rainbowkit": "^2.0.0",
  "react": "^18.0.0 || ^19.0.0",
  "react-dom": "^18.0.0 || ^19.0.0"
}
```

Install with:
```bash
bun add wagmi viem @rainbow-me/rainbowkit
```

## 💡 Quick Start Example

```astro
---
// src/pages/checkout.astro
import { Web3Provider } from '@/components/x402/Web3Provider';
import { X402CheckoutFlow } from '@/components/x402/X402CheckoutFlow';
---

<Web3Provider client:load>
  <X402CheckoutFlow
    client:load
    cartItems={[
      {
        id: '1',
        name: 'Premium Product',
        price: 299.99,
        quantity: 1
      }
    ]}
    total={299.99}
    onSuccess={(txHash) => {
      window.location.href = `/confirmation?tx=${txHash}`;
    }}
  />
</Web3Provider>
```

## 🎯 Key Features

✅ **Zero gas for customers** - Only sign a message
✅ **Instant settlement** - 1-2 seconds on Base
✅ **Ultra-low fees** - ~$0.0001 per transaction
✅ **Type-safe** - Full TypeScript support
✅ **Beautiful UI** - Pre-built components with dark mode
✅ **Mobile ready** - Responsive RainbowKit wallet UI
✅ **Production ready** - Battle-tested components

## 🌐 Live URLs (When Deployed)

After copying to your project:

- `/x402/checkout` - X402-only checkout
- `/x402/features` - Features showcase
- `/x402/tutorial` - Setup guide

## 📚 Learn More

Inside the package:
- Read `package/x402/README.md` - Main documentation
- Read `package/x402/docs/INSTALLATION.md` - Setup guide
- Read `package/x402/docs/API.md` - API reference
- Read `package/x402/MANIFEST.md` - File inventory

External resources:
- [EIP-3009 Spec](https://eips.ethereum.org/EIPS/eip-3009)
- [Base Network](https://base.org)
- [RainbowKit Docs](https://rainbowkit.com)
- [USDC by Circle](https://www.circle.com/en/usdc)

## 🔄 Future: npm Publishing

To publish this package to npm:

```bash
cd package/x402

# Build
bun run build

# Publish
npm publish --access public
```

Then users can install with:
```bash
bun add @one/x402
```

---

**Package Location:** `/package/x402/`
**Total Size:** 5,040+ lines across 18 files
**License:** MIT
**Status:** ✅ Ready to use (copy method)
**Future:** 📦 Publishable to npm
