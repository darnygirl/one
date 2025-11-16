# @one/x402 - File Manifest

Complete list of all files in the X402 package.

## 📦 Package Structure

```
package/x402/
├── README.md                    # Main documentation
├── MANIFEST.md                  # This file
├── package.json                 # Package configuration
├── .env.example                 # Environment template
├── tsconfig.json                # TypeScript configuration (to be added)
│
├── src/
│   ├── index.ts                 # Main entry point (exports)
│   │
│   ├── components/              # React components (5 files)
│   │   ├── Web3Provider.tsx             # RainbowKit + wagmi setup
│   │   ├── WalletConnectButton.tsx      # Wallet connection button
│   │   ├── X402PaymentButton.tsx        # Basic payment button
│   │   ├── ImprovedX402PaymentButton.tsx # Enhanced payment button
│   │   └── X402CheckoutFlow.tsx         # Complete checkout flow
│   │
│   ├── hooks/                   # React hooks (1 file)
│   │   └── useX402Payment.ts    # Payment logic hook
│   │
│   ├── lib/                     # Utilities (1 file)
│   │   └── config.ts            # X402 configuration
│   │
│   ├── pages/                   # Example pages (3 files)
│   │   ├── checkout.astro       # X402-only checkout page
│   │   ├── features.astro       # Features showcase page
│   │   └── tutorial.astro       # Setup tutorial page
│   │
│   └── types/                   # TypeScript types (1 file)
│       └── index.ts             # Type definitions
│
└── docs/                        # Documentation (2+ files)
    ├── INSTALLATION.md          # Installation guide
    └── API.md                   # API reference
```

## 📊 File Inventory

### Core Files (6)
| File | Lines | Purpose |
|------|-------|---------|
| `README.md` | 400+ | Main documentation |
| `package.json` | 50 | Package configuration |
| `.env.example` | 12 | Environment template |
| `MANIFEST.md` | 200+ | This file |
| `src/index.ts` | 30 | Main exports |
| `src/types/index.ts` | 80 | Type definitions |

### Components (5 files, 1,030+ lines)
| File | Lines | Purpose |
|------|-------|---------|
| `Web3Provider.tsx` | 150 | RainbowKit + wagmi provider setup |
| `WalletConnectButton.tsx` | 80 | Multi-wallet connection UI |
| `X402PaymentButton.tsx` | 200 | Basic payment button |
| `ImprovedX402PaymentButton.tsx` | 250 | Enhanced payment with session |
| `X402CheckoutFlow.tsx` | 350 | Complete checkout flow |

### Hooks (1 file, 150+ lines)
| File | Lines | Purpose |
|------|-------|---------|
| `useX402Payment.ts` | 150 | Payment logic and state management |

### Utilities (1 file, 80+ lines)
| File | Lines | Purpose |
|------|-------|---------|
| `config.ts` | 80 | Base network, USDC, merchant wallet config |

### Pages (3 files, 1,600+ lines)
| File | Lines | Purpose |
|------|-------|---------|
| `checkout.astro` | 350 | X402-only checkout page |
| `features.astro` | 700 | Features showcase and comparison |
| `tutorial.astro` | 550 | Complete setup guide |

### Documentation (2+ files, 1,500+ lines)
| File | Lines | Purpose |
|------|-------|---------|
| `docs/INSTALLATION.md` | 400 | Step-by-step installation |
| `docs/API.md` | 1,100 | Complete API reference |

## 📝 Total Summary

| Category | Files | Lines | Description |
|----------|-------|-------|-------------|
| **Components** | 5 | 1,030+ | React UI components |
| **Hooks** | 1 | 150+ | Payment logic |
| **Utilities** | 1 | 80+ | Configuration |
| **Types** | 1 | 80+ | TypeScript definitions |
| **Pages** | 3 | 1,600+ | Example Astro pages |
| **Documentation** | 4 | 2,100+ | Guides and reference |
| **TOTAL** | **15** | **5,040+** | Complete X402 package |

## 🎯 Usage by File Type

### TypeScript/TSX Files (7)
- `src/components/Web3Provider.tsx`
- `src/components/WalletConnectButton.tsx`
- `src/components/X402PaymentButton.tsx`
- `src/components/ImprovedX402PaymentButton.tsx`
- `src/components/X402CheckoutFlow.tsx`
- `src/hooks/useX402Payment.ts`
- `src/lib/config.ts`

### Astro Files (3)
- `src/pages/checkout.astro`
- `src/pages/features.astro`
- `src/pages/tutorial.astro`

### Documentation Files (4)
- `README.md`
- `MANIFEST.md`
- `docs/INSTALLATION.md`
- `docs/API.md`

### Configuration Files (2)
- `package.json`
- `.env.example`

## 📦 Dependencies

### Peer Dependencies (Required by users)
- `wagmi` (^2.0.0)
- `viem` (^2.0.0)
- `@rainbow-me/rainbowkit` (^2.0.0)
- `react` (^18.0.0 || ^19.0.0)
- `react-dom` (^18.0.0 || ^19.0.0)

### Dev Dependencies
- `typescript` (^5.0.0)
- `@types/react` (^18.0.0)
- `@types/react-dom` (^18.0.0)

## 🚀 Export Structure

```typescript
// Main exports from src/index.ts
import {
  // Components
  Web3Provider,
  WalletConnectButton,
  X402PaymentButton,
  ImprovedX402PaymentButton,
  X402CheckoutFlow,

  // Hooks
  useX402Payment,

  // Config
  X402_CONFIG,

  // Types
  type PaymentData,
  type TransactionStatus,
  type X402Config,
} from '@one/x402';
```

## 📖 Quick Start

```bash
# Install
bun add @one/x402 wagmi viem @rainbow-me/rainbowkit

# Configure .env
cp node_modules/@one/x402/.env.example .env

# Use in Astro
import { X402PaymentButton } from '@one/x402';
```

## 🔗 Links

- **npm:** https://www.npmjs.com/package/@one/x402
- **GitHub:** https://github.com/one-platform/x402
- **Docs:** https://docs.one.ie/x402
- **Base:** https://base.org
- **EIP-3009:** https://eips.ethereum.org/EIPS/eip-3009

---

**Total Package Size:** ~5,000+ lines across 15 files
**License:** MIT
**Version:** 1.0.0
