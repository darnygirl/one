# Crypto Wallet Components

**Cycles 1-7: Wallet Connection & Management**

7 production-ready components for Web3 wallet management. Built with React 19, TypeScript, viem, wagmi, and RainbowKit.

---

## Components

| # | Component | Description |
|---|-----------|-------------|
| 1 | **WalletConnectButton** | Multi-chain wallet connection (MetaMask, WalletConnect, Coinbase) |
| 2 | **WalletSwitcher** | Switch between multiple connected wallets with balances |
| 3 | **NetworkSwitcher** | Switch between chains (Ethereum, Polygon, Arbitrum, Optimism, Base) |
| 4 | **WalletBalance** | Display native token balance with real-time updates |
| 5 | **WalletAddress** | Display address with copy, ENS resolution, avatar |
| 6 | **WalletQRCode** | Generate QR code for receiving payments |
| 7 | **WalletExport** | Securely export private key/seed phrase |

---

## Quick Start

```tsx
import {
  WalletConnectButton,
  WalletSwitcher,
  NetworkSwitcher,
  WalletBalance,
  WalletAddress,
  WalletQRCode,
  WalletExport,
} from '@/components/ontology-ui/crypto/wallet';

// Basic wallet connection
<WalletConnectButton
  onConnect={(wallet) => console.log('Connected:', wallet)}
  showBalance
/>

// Display balance
<WalletBalance
  address="0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
  chainId={1}
  showUsd
/>

// Show address with copy
<WalletAddress
  address="0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
  ensName="vitalik.eth"
  showCopy
/>
```

---

## 1. WalletConnectButton

Multi-chain wallet connection with MetaMask, WalletConnect, Coinbase Wallet support.

### Props

```typescript
interface WalletConnectButtonProps {
  onConnect?: (wallet: Wallet) => void;
  onDisconnect?: () => void;
  label?: string;
  showBalance?: boolean;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  className?: string;
}
```

### Usage

```tsx
import { WalletConnectButton } from '@/components/ontology-ui/crypto/wallet';

function App() {
  return (
    <WalletConnectButton
      label="Connect Wallet"
      showBalance
      onConnect={(wallet) => {
        console.log('Wallet connected:', wallet);
      }}
      onDisconnect={() => {
        console.log('Wallet disconnected');
      }}
    />
  );
}
```

### Features

- Wallet connection flow
- Display connected address (truncated)
- Show wallet balance
- Copy address to clipboard
- Disconnect functionality
- Connection status badge

---

## 2. WalletSwitcher

Switch between multiple connected wallets.

### Props

```typescript
interface WalletSwitcherProps {
  wallets: Wallet[];
  currentWallet?: Wallet;
  onSwitch?: (wallet: Wallet) => void;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
}
```

### Usage

```tsx
import { WalletSwitcher } from '@/components/ontology-ui/crypto/wallet';

function App() {
  const wallets = [
    {
      address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      chainId: 1,
      balance: '1.234',
      connector: 'MetaMask',
    },
    {
      address: '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
      chainId: 1,
      balance: '5.678',
      connector: 'WalletConnect',
    },
  ];

  return (
    <WalletSwitcher
      wallets={wallets}
      currentWallet={wallets[0]}
      onSwitch={(wallet) => console.log('Switched to:', wallet)}
    />
  );
}
```

### Features

- List all connected wallets
- Show balance for each wallet
- Highlight active wallet
- One-click switching
- ENS name support
- Connector badge

---

## 3. NetworkSwitcher

Switch between blockchain networks.

### Props

```typescript
interface NetworkSwitcherProps {
  chains: Chain[];
  currentChain?: Chain;
  onSwitch?: (chain: Chain) => void;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
}
```

### Usage

```tsx
import { NetworkSwitcher } from '@/components/ontology-ui/crypto/wallet';

function App() {
  const chains = [
    {
      id: 1,
      name: 'Ethereum',
      nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
      rpcUrls: { default: 'https://eth.llamarpc.com' },
      blockExplorers: { default: { name: 'Etherscan', url: 'https://etherscan.io' } },
    },
    {
      id: 137,
      name: 'Polygon',
      nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
      rpcUrls: { default: 'https://polygon-rpc.com' },
      blockExplorers: { default: { name: 'PolygonScan', url: 'https://polygonscan.com' } },
    },
  ];

  return (
    <NetworkSwitcher
      chains={chains}
      currentChain={chains[0]}
      onSwitch={(chain) => console.log('Switched to:', chain.name)}
    />
  );
}
```

### Features

- Dropdown network selector
- Current network display
- Network icons (Ethereum, Polygon, etc.)
- Native currency info
- Block explorer links
- Loading states

---

## 4. WalletBalance

Display native token balance with real-time updates.

### Props

```typescript
interface WalletBalanceProps {
  address?: string;
  chainId?: ChainId;
  showUsd?: boolean;
  refreshInterval?: number;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
}
```

### Usage

```tsx
import { WalletBalance } from '@/components/ontology-ui/crypto/wallet';

function App() {
  return (
    <WalletBalance
      address="0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
      chainId={1}
      showUsd
      refreshInterval={10000} // 10 seconds
    />
  );
}
```

### Features

- Real-time balance updates
- USD value conversion
- Multi-chain support (ETH, MATIC, etc.)
- Refresh interval configuration
- Loading states
- Last updated timestamp

---

## 5. WalletAddress

Display wallet address with utilities.

### Props

```typescript
interface WalletAddressProps {
  address: string;
  ensName?: string | null;
  ensAvatar?: string | null;
  showCopy?: boolean;
  showQR?: boolean;
  truncate?: boolean;
  length?: number;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
}
```

### Usage

```tsx
import { WalletAddress } from '@/components/ontology-ui/crypto/wallet';

function App() {
  return (
    <WalletAddress
      address="0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
      ensName="vitalik.eth"
      ensAvatar="https://example.com/avatar.png"
      showCopy
      showQR
      truncate
      length={12}
    />
  );
}
```

### Features

- Address truncation with tooltip
- ENS name resolution
- ENS avatar display
- Identicon fallback
- Copy to clipboard
- QR code button
- Copy feedback

---

## 6. WalletQRCode

Generate QR code for receiving payments.

### Props

```typescript
interface WalletQRCodeProps {
  address: string;
  amount?: string;
  label?: string;
  size?: number;
  includeAmount?: boolean;
  downloadable?: boolean;
  variant?: "default" | "outline" | "ghost";
  className?: string;
}
```

### Usage

```tsx
import { WalletQRCode } from '@/components/ontology-ui/crypto/wallet';

function App() {
  return (
    <WalletQRCode
      address="0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
      amount="0.5"
      label="Payment for services"
      size={256}
      includeAmount
      downloadable
    />
  );
}
```

### Features

- QR code generation
- Optional amount inclusion
- Custom label
- Download QR image
- Address display
- Amount input field
- Copy address button

---

## 7. WalletExport

Securely export wallet credentials.

### Props

```typescript
interface WalletExportProps {
  onExportPrivateKey?: () => void;
  onExportSeedPhrase?: () => void;
  requirePassword?: boolean;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
}
```

### Usage

```tsx
import { WalletExport } from '@/components/ontology-ui/crypto/wallet';

function App() {
  return (
    <WalletExport
      requirePassword
      onExportPrivateKey={() => console.log('Private key exported')}
      onExportSeedPhrase={() => console.log('Seed phrase exported')}
    />
  );
}
```

### Features

- Security warnings
- Password verification
- Private key export (hidden by default)
- Seed phrase export (hidden by default)
- Copy to clipboard
- Best practices guide
- Destructive styling to indicate danger

---

## Integration with wagmi/viem

These components are designed to work with wagmi and viem. Here's how to integrate:

### 1. Setup wagmi

```tsx
// app/providers.tsx
import { WagmiProvider, createConfig } from 'wagmi';
import { mainnet, polygon, arbitrum } from 'wagmi/chains';
import { http } from 'viem';

const config = createConfig({
  chains: [mainnet, polygon, arbitrum],
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [arbitrum.id]: http(),
  },
});

export function Providers({ children }) {
  return (
    <WagmiProvider config={config}>
      {children}
    </WagmiProvider>
  );
}
```

### 2. Use wagmi hooks

```tsx
import { useAccount, useBalance, useEnsName } from 'wagmi';
import { WalletAddress, WalletBalance } from '@/components/ontology-ui/crypto/wallet';

function WalletInfo() {
  const { address } = useAccount();
  const { data: balance } = useBalance({ address });
  const { data: ensName } = useEnsName({ address });

  if (!address) return null;

  return (
    <div className="space-y-4">
      <WalletAddress
        address={address}
        ensName={ensName}
        showCopy
      />
      <WalletBalance
        address={address}
        chainId={1}
        showUsd
      />
    </div>
  );
}
```

---

## Effect.ts Integration

Use Effect.ts for business logic and error handling:

```tsx
import { Effect } from 'effect';
import type { WalletError } from '@/components/ontology-ui/crypto/wallet';

// Define wallet service
const connectWallet = (): Effect.Effect<Wallet, WalletError> =>
  Effect.gen(function* () {
    try {
      // Connect wallet logic here
      const wallet = yield* Effect.promise(() =>
        // Your wallet connection logic
      );
      return wallet;
    } catch (error) {
      return yield* Effect.fail({
        _tag: 'WalletConnectionError',
        message: 'Failed to connect wallet',
      });
    }
  });

// Use in component
function WalletConnector() {
  const handleConnect = async () => {
    const result = await Effect.runPromise(connectWallet());
    console.log('Connected:', result);
  };

  return <WalletConnectButton onConnect={handleConnect} />;
}
```

---

## Responsive Design

All components are mobile-first and responsive:

```tsx
// Mobile: Stacked layout
<div className="flex flex-col gap-4">
  <WalletConnectButton />
  <NetworkSwitcher chains={chains} />
  <WalletBalance address={address} />
</div>

// Desktop: Grid layout
<div className="grid grid-cols-3 gap-4">
  <WalletConnectButton />
  <NetworkSwitcher chains={chains} />
  <WalletBalance address={address} />
</div>
```

---

## Accessibility

All components follow WCAG 2.1 Level AA guidelines:

- Semantic HTML
- ARIA labels
- Keyboard navigation
- Focus management
- Screen reader support

---

## Security Best Practices

### Never Store Credentials in State

```tsx
// ❌ BAD
const [privateKey, setPrivateKey] = useState('0x...');

// ✅ GOOD
// Only display private key when user explicitly requests it
// Never persist it
```

### Always Use HTTPS

```tsx
// Ensure all RPC endpoints use HTTPS
const config = createConfig({
  transports: {
    [mainnet.id]: http('https://eth.llamarpc.com'), // ✅ HTTPS
  },
});
```

### Password Protection

```tsx
// Always require password for sensitive operations
<WalletExport requirePassword />
```

---

## Testing

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { WalletConnectButton } from '@/components/ontology-ui/crypto/wallet';

test('WalletConnectButton shows connect text', () => {
  render(<WalletConnectButton label="Connect Wallet" />);
  expect(screen.getByText('Connect Wallet')).toBeInTheDocument();
});

test('WalletConnectButton calls onConnect', async () => {
  const handleConnect = vi.fn();
  render(<WalletConnectButton onConnect={handleConnect} />);

  fireEvent.click(screen.getByText('Connect Wallet'));

  // Wait for connection
  await waitFor(() => {
    expect(handleConnect).toHaveBeenCalled();
  });
});
```

---

## Next Steps

**Cycles 8-13: Token Portfolio & Analysis**
- TokenPortfolio - Display all tokens with balances
- TokenBalance - Individual token balance
- TokenPrice - Real-time price with chart
- TokenChart - Price charts (1h, 1d, 1w, 1m, 1y)
- TokenStats - Market cap, volume, supply
- TokenSocials - Links to website, socials

---

## License

MIT License - Built for the ONE Platform

---

**7 components built. Wallet connection & management complete. Ready for multi-chain Web3 apps! 🚀**
