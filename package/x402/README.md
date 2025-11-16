# @one/x402

**Gasless crypto payments for your Astro + React applications**

[![npm version](https://img.shields.io/npm/v/@one/x402.svg)](https://www.npmjs.com/package/@one/x402)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

X402 is a complete payment solution using EIP-3009 (transferWithAuthorization) for gasless USDC transfers on Base network.

## ✨ Features

- 🆓 **Zero gas for customers** - Only sign a message, merchant pays ~$0.0001
- ⚡ **Instant settlement** - 1-2 second confirmation on Base
- 💰 **Ultra-low fees** - ~$0.0001 vs 2.9% + 30¢ for cards
- 🔒 **Secure** - Built on EIP-3009 standard by Circle
- 🎨 **Beautiful UI** - Pre-built components with dark mode
- 📱 **Mobile ready** - Responsive design with RainbowKit
- 🔧 **Type-safe** - Full TypeScript support

## 🚀 Quick Start

### Installation

```bash
# Using bun
bun add @one/x402 wagmi viem @rainbow-me/rainbowkit

# Using npm
npm install @one/x402 wagmi viem @rainbow-me/rainbowkit

# Using pnpm
pnpm add @one/x402 wagmi viem @rainbow-me/rainbowkit
```

### Basic Usage

```astro
---
// src/pages/checkout.astro
import { Web3Provider } from '@one/x402/components/Web3Provider';
import { X402CheckoutFlow } from '@one/x402/components/X402CheckoutFlow';
---

<Web3Provider client:load>
  <X402CheckoutFlow
    client:load
    cartItems={[
      {
        id: '1',
        name: 'Premium Product',
        price: 299.99,
        quantity: 1,
        image: '/product.jpg'
      }
    ]}
    total={299.99}
  />
</Web3Provider>
```

### Environment Variables

```bash
# .env
PUBLIC_X402_ENABLED=true
PUBLIC_USDC_CONTRACT_ADDRESS=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
PUBLIC_MERCHANT_WALLET=0xYourWalletAddress
PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
```

## 📦 What's Included

### Components (5)

- **Web3Provider** - RainbowKit + wagmi configuration
- **WalletConnectButton** - Multi-wallet connection (MetaMask, Coinbase, etc.)
- **X402PaymentButton** - Single payment button
- **ImprovedX402PaymentButton** - Enhanced payment with session management
- **X402CheckoutFlow** - Complete checkout flow with cart

### Hooks (1)

- **useX402Payment** - Payment logic and transaction handling

### Utilities (1)

- **config.ts** - Base network, USDC contract, and merchant wallet setup

### Pages (3)

- **checkout.astro** - Complete checkout page
- **features.astro** - X402 features showcase
- **tutorial.astro** - Setup guide

## 🎯 Usage Examples

### Simple Payment Button

```tsx
import { X402PaymentButton } from '@one/x402/components/X402PaymentButton';

<X402PaymentButton
  amount={99.99}
  recipientAddress="0xYourMerchantWallet"
  onSuccess={(txHash) => console.log('Payment successful:', txHash)}
  onError={(error) => console.error('Payment failed:', error)}
/>
```

### Wallet Connection

```tsx
import { WalletConnectButton } from '@one/x402/components/WalletConnectButton';

<WalletConnectButton />
```

### Complete Checkout Flow

```tsx
import { X402CheckoutFlow } from '@one/x402/components/X402CheckoutFlow';

<X402CheckoutFlow
  cartItems={cartItems}
  total={totalAmount}
  onSuccess={(txHash) => {
    // Redirect to confirmation page
    window.location.href = `/order-confirmation?tx=${txHash}`;
  }}
/>
```

## 🔧 Configuration

### Update lib/config.ts

```typescript
export const X402_CONFIG = {
  usdcAddress: import.meta.env.PUBLIC_USDC_CONTRACT_ADDRESS,
  merchantWallet: import.meta.env.PUBLIC_MERCHANT_WALLET,
  walletConnectProjectId: import.meta.env.PUBLIC_WALLETCONNECT_PROJECT_ID,
  chainId: 8453, // Base mainnet
};
```

### Get WalletConnect Project ID

1. Visit [cloud.walletconnect.com](https://cloud.walletconnect.com)
2. Sign up / log in
3. Create new project
4. Copy your Project ID

## 📖 Documentation

### How X402 Works

1. **Customer connects wallet** - RainbowKit shows wallet options
2. **Customer signs authorization** - FREE, no gas required
3. **Merchant submits transaction** - Pays ~$0.0001 gas on Base
4. **USDC transfers** - Instant settlement (1-2 seconds)

### EIP-3009: transferWithAuthorization

X402 uses [EIP-3009](https://eips.ethereum.org/EIPS/eip-3009), a standard for gasless token transfers:

```solidity
function transferWithAuthorization(
  address from,        // Customer wallet
  address to,          // Merchant wallet
  uint256 value,       // Amount in USDC
  uint256 validAfter,  // Valid after timestamp
  uint256 validBefore, // Expiry timestamp
  bytes32 nonce,       // Unique nonce
  uint8 v, bytes32 r, bytes32 s  // Signature
)
```

### Base Network

- **Chain ID:** 8453 (mainnet)
- **Gas fees:** ~$0.0001 per transaction
- **Block time:** 1-2 seconds
- **Security:** Ethereum L2, backed by Coinbase

### USDC Stablecoin

- **Contract:** `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` (Base)
- **Peg:** 1 USDC = 1 USD
- **Issuer:** Circle
- **Backing:** Cash and short-term US Treasuries

## 🎨 Customization

### Styling

All components use Tailwind CSS with minimalist black/white design:

```tsx
<X402PaymentButton
  className="custom-button-styles"
  amount={99.99}
/>
```

### Theme

Components support dark mode via Tailwind's `dark:` classes:

```tsx
<div className="bg-white dark:bg-black text-black dark:text-white">
  <X402CheckoutFlow {...props} />
</div>
```

## 💡 Use Cases

Perfect for:
- 🎓 Online courses
- 💎 Digital goods
- 🛍️ E-commerce
- 🎮 Gaming items
- 📱 SaaS subscriptions
- 🌍 Global sales

## 📊 Cost Comparison

| Payment Method | Customer Fee | Merchant Fee ($100 sale) | Settlement |
|----------------|--------------|------------------------|------------|
| Credit Cards | $0 | $3.20 (2.9% + 30¢) | 2-7 days |
| Traditional Crypto | $2-10 gas | ~$0.50-2 | 12-600 sec |
| **X402 on Base** | **$0** | **$0.0001** | **1-2 sec** |

**Savings:** $3.20 per $100 sale compared to Stripe!

## 🛠️ Development

### Local Setup

```bash
# Clone repository
git clone https://github.com/one-platform/x402
cd x402

# Install dependencies
bun install

# Build
bun run build

# Type check
bun run typecheck
```

### Testing

```bash
# Run tests
bun test

# Test with local Astro project
cd examples/basic
bun run dev
```

## 🤝 Contributing

Contributions welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) first.

## 📄 License

MIT © ONE Platform

## 🔗 Links

- [Documentation](https://docs.one.ie/x402)
- [GitHub](https://github.com/one-platform/x402)
- [npm](https://www.npmjs.com/package/@one/x402)
- [Base Network](https://base.org)
- [EIP-3009 Spec](https://eips.ethereum.org/EIPS/eip-3009)
- [RainbowKit](https://rainbowkit.com)

## 🆘 Support

- [GitHub Issues](https://github.com/one-platform/x402/issues)
- [Discord](https://discord.gg/one-platform)
- [Twitter](https://twitter.com/oneplatform)

---

**Built with ❤️ for the future of payments**
