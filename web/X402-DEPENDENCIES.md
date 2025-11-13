# X402 Frontend Dependencies

## Required npm Packages

To use the X402 crypto payment components, install these dependencies:

```bash
# Using bun (recommended)
bun add wagmi viem @tanstack/react-query @rainbow-me/rainbowkit

# Or using npm
npm install wagmi viem @tanstack/react-query @rainbow-me/rainbowkit

# Or using yarn
yarn add wagmi viem @tanstack/react-query @rainbow-me/rainbowkit
```

## Package Versions

```json
{
  "dependencies": {
    "wagmi": "^2.14.0",
    "viem": "^2.26.0",
    "@tanstack/react-query": "^5.64.0",
    "@rainbow-me/rainbowkit": "^2.2.0"
  }
}
```

## What These Packages Do

### wagmi
- **Purpose**: React Hooks for Ethereum
- **Used for**: Wallet connection, contract interactions, account management
- **Docs**: https://wagmi.sh

### viem
- **Purpose**: TypeScript interface for Ethereum
- **Used for**: ABI encoding, transaction signing, utility functions
- **Docs**: https://viem.sh

### @tanstack/react-query
- **Purpose**: Data fetching and state management
- **Used for**: Caching wallet data, managing async blockchain queries
- **Docs**: https://tanstack.com/query

### @rainbow-me/rainbowkit
- **Purpose**: Beautiful wallet connection UI
- **Used for**: Wallet selection modal, account management UI
- **Docs**: https://www.rainbowkit.com

## Environment Variables

Add these to your `.env` file:

```bash
# WalletConnect Project ID (get from https://cloud.walletconnect.com/)
PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here

# X402 Payment Recipient Address (your treasury/merchant address)
PUBLIC_X402_RECIPIENT_ADDRESS=0x742d35Cc6634C0532925a3b844Bc454e4438f44e

# Enable X402 payments (set to "true" to enable)
PUBLIC_X402_ENABLED=true
```

## Installation Steps

1. **Install dependencies**:
   ```bash
   cd web/
   bun add wagmi viem @tanstack/react-query @rainbow-me/rainbowkit
   ```

2. **Create `.env` file** with WalletConnect Project ID:
   ```bash
   echo "PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id" >> .env
   echo "PUBLIC_X402_RECIPIENT_ADDRESS=0x742d35Cc6634C0532925a3b844Bc454e4438f44e" >> .env
   echo "PUBLIC_X402_ENABLED=true" >> .env
   ```

3. **Get WalletConnect Project ID**:
   - Go to https://cloud.walletconnect.com/
   - Sign up (free)
   - Create a new project
   - Copy the Project ID
   - Paste it in `.env`

4. **Test the integration**:
   ```bash
   bun run dev
   # Visit http://localhost:4321/shop/checkout-x402
   ```

## Troubleshooting

### "Module not found: wagmi"
- Run `bun add wagmi viem @tanstack/react-query @rainbow-me/rainbowkit`
- Restart the dev server

### "WalletConnect Project ID is required"
- Add `PUBLIC_WALLETCONNECT_PROJECT_ID` to `.env`
- Get a free Project ID from https://cloud.walletconnect.com/

### "Please switch to Base network"
- The app only supports Base mainnet for USDC payments
- Switch your wallet to Base network (Chain ID: 8453)

### "Insufficient USDC balance"
- You need USDC on Base network to make payments
- Bridge USDC to Base using the official Base bridge: https://bridge.base.org/

## Next Steps

After installing dependencies:
1. Update checkout pages to use `<X402CheckoutFlow />`
2. Test wallet connection and payments
3. Configure your merchant wallet address in `.env`
4. Deploy to production

## Support

- **Wagmi Docs**: https://wagmi.sh
- **Viem Docs**: https://viem.sh
- **RainbowKit Docs**: https://www.rainbowkit.com
- **X402 Protocol**: https://x402.org
- **Base Network**: https://base.org
