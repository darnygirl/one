# Installation Guide - @one/x402

Complete guide to installing and configuring X402 payments in your Astro + React project.

## Prerequisites

- Node.js 18+ or Bun
- Astro 4+ project
- React 18+ or 19+
- Basic understanding of crypto wallets

## Step 1: Install Dependencies

### Using Bun (Recommended)
```bash
bun add @one/x402 wagmi viem @rainbow-me/rainbowkit
```

### Using npm
```bash
npm install @one/x402 wagmi viem @rainbow-me/rainbowkit
```

### Using pnpm
```bash
pnpm add @one/x402 wagmi viem @rainbow-me/rainbowkit
```

## Step 2: Configure Environment Variables

Create or update your `.env` file:

```bash
# Copy example
cp node_modules/@one/x402/.env.example .env

# Or create manually
cat > .env << EOF
PUBLIC_X402_ENABLED=true
PUBLIC_USDC_CONTRACT_ADDRESS=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
PUBLIC_MERCHANT_WALLET=0xYourWalletAddressHere
PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
EOF
```

### Get Your WalletConnect Project ID

1. Visit [cloud.walletconnect.com](https://cloud.walletconnect.com)
2. Sign up or log in (free)
3. Click "Create Project"
4. Enter project name (e.g., "My Store")
5. Copy your Project ID
6. Paste into `PUBLIC_WALLETCONNECT_PROJECT_ID`

### Get Your Merchant Wallet Address

This is your Ethereum/Base wallet address where you'll receive USDC payments.

**Options:**
- Use MetaMask: Click your account → Copy address
- Use Coinbase Wallet: Settings → Your address
- Use any Ethereum wallet address (0x...)

**Important:** This address will receive all USDC payments on Base network.

## Step 3: Setup Web3 Provider

Wrap your app with the Web3Provider:

```astro
---
// src/layouts/BaseLayout.astro
import { Web3Provider } from '@one/x402/components/Web3Provider';
---

<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>{title}</title>
  </head>
  <body>
    <Web3Provider client:load>
      <slot />
    </Web3Provider>
  </body>
</html>
```

## Step 4: Add Payment Button

### Simple Payment Button

```astro
---
// src/pages/checkout.astro
import { X402PaymentButton } from '@one/x402/components/X402PaymentButton';
---

<X402PaymentButton
  client:load
  amount={99.99}
  recipientAddress={import.meta.env.PUBLIC_MERCHANT_WALLET}
  onSuccess={(txHash) => console.log('Payment successful:', txHash)}
/>
```

### Complete Checkout Flow

```astro
---
// src/pages/checkout-full.astro
import { X402CheckoutFlow } from '@one/x402/components/X402CheckoutFlow';

const cartItems = [
  {
    id: '1',
    name: 'Premium Product',
    price: 299.99,
    quantity: 1,
    image: '/product.jpg'
  }
];
---

<X402CheckoutFlow
  client:load
  cartItems={cartItems}
  total={299.99}
  onSuccess={(txHash) => {
    window.location.href = `/confirmation?tx=${txHash}`;
  }}
/>
```

## Step 5: Test Payment

### Get Test USDC on Base

1. **Get Base ETH for gas:**
   - Visit [Base Faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet)
   - Enter your wallet address
   - Request test ETH

2. **Bridge to Base:**
   - Visit [bridge.base.org](https://bridge.base.org)
   - Connect wallet
   - Bridge small amount of ETH to Base

3. **Swap for USDC:**
   - Visit [app.uniswap.org](https://app.uniswap.org)
   - Connect wallet
   - Select Base network
   - Swap ETH → USDC

4. **Test payment:**
   - Visit your checkout page
   - Connect wallet
   - Make test payment
   - Verify USDC received in merchant wallet

## Step 6: Production Deployment

### Update Environment Variables

Set environment variables in your hosting platform:

**Vercel:**
```bash
vercel env add PUBLIC_X402_ENABLED
vercel env add PUBLIC_USDC_CONTRACT_ADDRESS
vercel env add PUBLIC_MERCHANT_WALLET
vercel env add PUBLIC_WALLETCONNECT_PROJECT_ID
```

**Netlify:**
```bash
netlify env:set PUBLIC_X402_ENABLED true
netlify env:set PUBLIC_USDC_CONTRACT_ADDRESS 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
netlify env:set PUBLIC_MERCHANT_WALLET 0xYourAddress
netlify env:set PUBLIC_WALLETCONNECT_PROJECT_ID your_id
```

**Cloudflare Pages:**
- Go to Settings → Environment Variables
- Add each variable with value

### Verify Production

1. Deploy your site
2. Test payment flow with real wallet
3. Verify USDC received in merchant wallet
4. Check transaction on [Basescan](https://basescan.org)

## Troubleshooting

### "Wallet not connected"
- Ensure Web3Provider wraps your app
- Check browser has wallet extension installed
- Try connecting wallet manually first

### "USDC contract not found"
- Verify `PUBLIC_USDC_CONTRACT_ADDRESS` is correct
- Ensure using Base network (Chain ID: 8453)
- Check wallet is on Base network

### "Transaction failed"
- Ensure customer has USDC balance
- Verify merchant wallet address is correct
- Check network connection

### "WalletConnect error"
- Verify `PUBLIC_WALLETCONNECT_PROJECT_ID` is correct
- Check project is active on cloud.walletconnect.com
- Try different wallet app

## Next Steps

- [API Reference](./API.md) - Component props and hooks
- [Examples](./EXAMPLES.md) - Code examples
- [Best Practices](./BEST-PRACTICES.md) - Security and UX tips

## Support

- [GitHub Issues](https://github.com/one-platform/x402/issues)
- [Discord](https://discord.gg/one-platform)
- [Documentation](https://docs.one.ie/x402)
