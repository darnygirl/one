# Cryptocurrency Components & Web3 Integration

Complete cryptocurrency component library for the ONE Platform. 100 components planned across 4 phases.

---

## Progress

**Completed: Cycles 1-7 (Wallet Connection & Management)**

| Phase | Cycles | Status | Components |
|-------|--------|--------|------------|
| **Phase 1: Token Analysis & Wallet Management** | 1-25 | ✅ 7/25 | Wallet components complete |
| Phase 2: Crypto Payments & Transactions | 26-50 | ⏳ Pending | Coming soon |
| Phase 3: DeFi Integration & Trading | 51-75 | ⏳ Pending | Coming soon |
| Phase 4: Chat Commerce & Web3 Integration | 76-100 | ⏳ Pending | Coming soon |

---

## Phase 1: Token Analysis & Wallet Management (Cycles 1-25)

### ✅ Cycles 1-7: Wallet Connection & Management (COMPLETE)

| # | Component | Description | Status |
|---|-----------|-------------|--------|
| 1 | **WalletConnectButton** | Multi-chain wallet connection | ✅ Built |
| 2 | **WalletSwitcher** | Switch between wallets | ✅ Built |
| 3 | **NetworkSwitcher** | Switch between chains | ✅ Built |
| 4 | **WalletBalance** | Display native balance | ✅ Built |
| 5 | **WalletAddress** | Display address with utils | ✅ Built |
| 6 | **WalletQRCode** | Generate payment QR code | ✅ Built |
| 7 | **WalletExport** | Export credentials securely | ✅ Built |

📂 **Location:** `/web/src/components/ontology-ui/crypto/wallet/`
📖 **Docs:** [Wallet Components README](./wallet/README.md)

### 🔜 Cycles 8-13: Token Portfolio & Analysis (NEXT)

| # | Component | Description | Status |
|---|-----------|-------------|--------|
| 8 | **TokenPortfolio** | Display all tokens with balances | ⏳ Planned |
| 9 | **TokenBalance** | Individual token balance | ⏳ Planned |
| 10 | **TokenPrice** | Real-time price with chart | ⏳ Planned |
| 11 | **TokenChart** | Price charts (1h-all time) | ⏳ Planned |
| 12 | **TokenStats** | Market cap, volume, supply | ⏳ Planned |
| 13 | **TokenSocials** | Website, Twitter, Discord links | ⏳ Planned |

### 🔜 Cycles 14-19: Token Analysis Tools

| # | Component | Description | Status |
|---|-----------|-------------|--------|
| 14 | **TokenAnalyzer** | Comprehensive analysis | ⏳ Planned |
| 15 | **TokenHolder** | Top holders list | ⏳ Planned |
| 16 | **TokenLiquidity** | Liquidity pools & DEX | ⏳ Planned |
| 17 | **TokenAudit** | Security audits | ⏳ Planned |
| 18 | **TokenContract** | Contract verification | ⏳ Planned |
| 19 | **TokenTransactions** | Recent transactions | ⏳ Planned |

### 🔜 Cycles 20-25: Advanced Portfolio Features

| # | Component | Description | Status |
|---|-----------|-------------|--------|
| 20 | **PortfolioTracker** | Track value over time | ⏳ Planned |
| 21 | **PortfolioAllocation** | Pie chart allocation | ⏳ Planned |
| 22 | **PortfolioPnL** | Profit/loss calculator | ⏳ Planned |
| 23 | **PortfolioRebalance** | Rebalancing suggestions | ⏳ Planned |
| 24 | **PortfolioAlert** | Price alerts | ⏳ Planned |
| 25 | **PortfolioExport** | Export to CSV/PDF | ⏳ Planned |

---

## Technology Stack

- **Blockchain**: Ethereum, Solana, Polygon, Base, Arbitrum
- **Web3 Libraries**: viem, wagmi, @solana/web3.js
- **Wallet Connection**: RainbowKit, WalletConnect v2, Phantom, MetaMask
- **Token Standards**: ERC-20, ERC-721 (NFTs), ERC-1155, SPL Tokens
- **DeFi Protocols**: Uniswap, Aave, Compound, Jupiter (Solana)
- **Price APIs**: CoinGecko, CoinMarketCap, DeFi Llama
- **Effect.ts**: Business logic and error handling
- **React 19**: UI components
- **shadcn/ui**: Base components
- **Tailwind CSS v4**: Styling

---

## Quick Start

### 1. Install Dependencies

```bash
bun add viem wagmi @rainbow-me/rainbowkit @tanstack/react-query
```

### 2. Setup Providers

```tsx
// app/providers.tsx
import { WagmiProvider, createConfig, http } from 'wagmi';
import { mainnet, polygon, arbitrum } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const config = createConfig({
  chains: [mainnet, polygon, arbitrum],
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [arbitrum.id]: http(),
  },
});

const queryClient = new QueryClient();

export function Providers({ children }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
```

### 3. Use Components

```tsx
import {
  WalletConnectButton,
  WalletBalance,
  NetworkSwitcher,
} from '@/components/ontology-ui/crypto/wallet';

function App() {
  return (
    <div className="space-y-4">
      <WalletConnectButton showBalance />
      <NetworkSwitcher chains={chains} />
      <WalletBalance address={address} showUsd />
    </div>
  );
}
```

---

## Integration with 6-Dimension Ontology

### GROUPS
- Multi-tenant wallet management
- Group treasury and shared wallets
- DAO governance tokens

### PEOPLE
- User wallet addresses as identity
- NFT-based roles and permissions
- Token-gated access control

### THINGS
- Tokens as things (type: 'token')
- NFTs as things (type: 'nft')
- Wallets as things (type: 'wallet')
- Transactions as things (type: 'transaction')

### CONNECTIONS
- `wallet_owns_token`
- `user_sent_payment`
- `user_received_payment`
- `token_traded_for_token`

### EVENTS
- `wallet_connected`
- `token_sent`
- `token_received`
- `payment_completed`
- `swap_executed`

### KNOWLEDGE
- Token metadata and descriptions
- Transaction labels and notes
- Portfolio tags

---

## Development Roadmap

### Phase 1: Token Analysis & Wallet Management (Cycles 1-25)
- ✅ Wallet Connection (Cycles 1-7) - **COMPLETE**
- 🔜 Token Portfolio (Cycles 8-13) - **NEXT**
- 🔜 Token Analysis (Cycles 14-19)
- 🔜 Advanced Portfolio (Cycles 20-25)

### Phase 2: Crypto Payments & Transactions (Cycles 26-50)
- Send & Receive Crypto (Cycles 26-32)
- Transaction Management (Cycles 33-39)
- Payment Processing (Cycles 40-46)
- Multi-Currency Support (Cycles 47-50)

### Phase 3: DeFi Integration & Trading (Cycles 51-75)
- DEX Trading (Cycles 51-57)
- Liquidity & Staking (Cycles 58-64)
- Lending & Borrowing (Cycles 65-71)
- Advanced DeFi (Cycles 72-75)

### Phase 4: Chat Commerce & Web3 Integration (Cycles 76-100)
- In-Chat Payments (Cycles 76-82)
- NFT Integration (Cycles 83-89)
- Token Gating & Access (Cycles 90-96)
- Advanced Web3 Features (Cycles 97-100)

---

## Example: Building a Wallet Dashboard

```tsx
import {
  WalletConnectButton,
  WalletSwitcher,
  NetworkSwitcher,
  WalletBalance,
  WalletAddress,
  WalletQRCode,
} from '@/components/ontology-ui/crypto/wallet';

function WalletDashboard() {
  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <WalletConnectButton />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Wallet Info */}
        <WalletAddress
          address={address}
          showCopy
          showQR
        />

        {/* Balance */}
        <WalletBalance
          address={address}
          chainId={chain?.id}
          showUsd
        />

        {/* Network Switcher */}
        <NetworkSwitcher
          chains={chains}
          currentChain={chain}
        />

        {/* QR Code */}
        <WalletQRCode
          address={address}
          includeAmount
          downloadable
        />

        {/* Wallet Switcher */}
        <WalletSwitcher
          wallets={wallets}
          currentWallet={currentWallet}
        />
      </div>
    </div>
  );
}
```

---

## Security Best Practices

1. **Never store private keys in state or localStorage**
2. **Always use HTTPS for RPC endpoints**
3. **Require password for sensitive operations**
4. **Display security warnings for exports**
5. **Validate all user inputs**
6. **Use Effect.ts for error handling**
7. **Implement rate limiting for API calls**
8. **Use secure WebSocket connections**

---

## Testing

```tsx
import { render, screen } from '@testing-library/react';
import { WalletConnectButton } from '@/components/ontology-ui/crypto/wallet';

test('renders wallet connect button', () => {
  render(<WalletConnectButton />);
  expect(screen.getByText('Connect Wallet')).toBeInTheDocument();
});
```

---

## Documentation

- **Wallet Components**: [wallet/README.md](./wallet/README.md)
- **Architecture**: `/one/knowledge/architecture.md`
- **Ontology**: `/one/knowledge/ontology.md`
- **Cycle Plan**: `CRYPTO-CYCLE-PLAN.md`

---

## License

MIT License - Built for the ONE Platform

---

**Built with clarity, simplicity, and infinite scale in mind.**

7/100 components complete. Wallet management ready. Next: Token portfolio & analysis. 🚀
