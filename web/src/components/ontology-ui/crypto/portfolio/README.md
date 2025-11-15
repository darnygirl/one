# Crypto Portfolio Components

**Token Portfolio & Analysis (Cycles 8-13)**

Production-ready React components for cryptocurrency token portfolio management and analysis.

---

## Components

### 1. TokenPortfolio

Display all tokens in wallet with virtualization for 1000+ tokens.

**Features:**
- Virtualized list using react-window (performance optimized)
- Sort by value, name, change %, balance
- Search and filter
- Total portfolio value
- 24h portfolio change
- Minimum value filters ($1, $100, $1K)

**Usage:**

```tsx
import { TokenPortfolio } from '@/components/ontology-ui/crypto/portfolio';

const balances = [
  {
    token: {
      id: 'ethereum',
      symbol: 'eth',
      name: 'Ethereum',
      image: 'https://...',
      current_price: 2000,
      price_change_percentage_24h: 5.2,
      // ... other token data
    },
    balance: '1500000000000000000', // 1.5 ETH in wei
    balanceFormatted: '1.5',
    valueUsd: 3000,
  },
  // ... more tokens
];

<TokenPortfolio
  balances={balances}
  onTokenSelect={(tokenId) => console.log('Selected:', tokenId)}
  autoRefresh={true}
  refreshInterval={30000}
/>
```

---

### 2. TokenBalance

Individual token balance display with icon, balance, and value.

**Features:**
- Token icon and name
- Balance in token units
- USD value
- 24h change percentage
- Compact and full variants

**Usage:**

```tsx
import { TokenBalance } from '@/components/ontology-ui/crypto/portfolio';

// Compact variant (for lists)
<TokenBalance
  balance={balance}
  onClick={() => handleClick(balance.token.id)}
  compact
/>

// Full variant (standalone card)
<TokenBalance
  balance={balance}
  showAddress={true}
/>
```

---

### 3. TokenPrice

Real-time token price display with sparkline chart.

**Features:**
- Current price (USD, ETH, BTC)
- 24h price change
- Mini sparkline chart
- Live price updates (30s interval)
- Multiple currency display

**Usage:**

```tsx
import { TokenPrice } from '@/components/ontology-ui/crypto/portfolio';

<TokenPrice
  tokenId="ethereum"
  tokenName="Ethereum"
  tokenSymbol="ETH"
  showSparkline={true}
  showMultipleCurrencies={true}
  autoRefresh={true}
  refreshInterval={30000}
  onPriceUpdate={(price) => console.log('New price:', price)}
/>
```

---

### 4. TokenChart

Interactive price chart with multiple time ranges and volume.

**Features:**
- Time ranges: 1h, 1d, 1w, 1m, 1y, all
- Line or area chart
- Volume bars
- Recharts integration
- Price tooltips
- Responsive design

**Usage:**

```tsx
import { TokenChart } from '@/components/ontology-ui/crypto/portfolio';

<TokenChart
  tokenId="ethereum"
  tokenName="Ethereum"
  tokenSymbol="ETH"
  defaultTimeRange="1d"
  showVolume={true}
  chartType="area"
/>
```

---

### 5. TokenStats

Market statistics with supply, market cap, and ATH/ATL.

**Features:**
- Market cap and rank
- 24h volume
- Circulating/total/max supply
- Supply percentage bar
- All-time high/low prices
- ATH/ATL dates and % change

**Usage:**

```tsx
import { TokenStats } from '@/components/ontology-ui/crypto/portfolio';

<TokenStats
  tokenId="ethereum"
  tokenName="Ethereum"
  tokenSymbol="ETH"
  showSupply={true}
  showATH={true}
/>
```

---

### 6. TokenSocials

Social media and community links.

**Features:**
- Website and whitepaper
- Twitter, Telegram, Reddit, Discord
- GitHub repositories with stars
- Block explorers (Etherscan, etc.)
- Community stats (followers, subscribers)

**Usage:**

```tsx
import { TokenSocials } from '@/components/ontology-ui/crypto/portfolio';

<TokenSocials
  tokenId="ethereum"
  tokenName="Ethereum"
  tokenSymbol="ETH"
/>
```

---

## Installation

### Required Dependencies

```bash
bun add react-window recharts react-sparklines effect
bun add -D @types/react-window
```

### Shadcn UI Components

These components are already installed:
- card
- button
- input
- select
- badge
- skeleton
- separator
- avatar

---

## CryptoService

Effect.ts service for cryptocurrency data from CoinGecko API.

### Setup

```typescript
import { CryptoService } from '@/lib/services/CryptoService';

// Create service instance
const cryptoService = new CryptoService();

// Or with API key for higher rate limits
const cryptoService = new CryptoService('your-api-key');
```

### Available Methods

```typescript
// Get token price
const price = await Effect.runPromise(
  cryptoService.getTokenPrice('ethereum', ['usd', 'eth'])
);

// Get multiple token prices
const prices = await Effect.runPromise(
  cryptoService.getTokenPrices(['ethereum', 'bitcoin'])
);

// Get token details
const details = await Effect.runPromise(
  cryptoService.getTokenDetails('ethereum')
);

// Get chart data
const chartData = await Effect.runPromise(
  cryptoService.getTokenChart('ethereum', 7) // 7 days
);

// Get market stats
const stats = await Effect.runPromise(
  cryptoService.getTokenStats('ethereum')
);

// Search tokens
const results = await Effect.runPromise(
  cryptoService.searchTokens('ethereum')
);

// Get trending tokens
const trending = await Effect.runPromise(
  cryptoService.getTrendingTokens()
);

// Get top tokens by market cap
const topTokens = await Effect.runPromise(
  cryptoService.getTopTokens(100, 1)
);
```

### Helper Functions

```typescript
import {
  formatTokenBalance,
  formatUsdValue,
  formatPriceChange,
  getPriceChangeColor,
  formatLargeNumber,
  calculatePortfolioValue,
  sortTokensByValue,
  filterTokensByValue,
} from '@/lib/services/CryptoService';

// Format token balance
formatTokenBalance('1500000000000000000', 18); // "1.5"

// Format USD value
formatUsdValue(1234567); // "$1.23M"

// Format price change
formatPriceChange(5.23); // "+5.23%"

// Get color class for price change
getPriceChangeColor(5.23); // "text-green-600 dark:text-green-400"

// Format large numbers
formatLargeNumber(1234567890); // "1.23B"

// Calculate total portfolio value
calculatePortfolioValue(balances); // 45678.90

// Sort tokens by value
sortTokensByValue(balances, 'desc');

// Filter tokens by minimum value
filterTokensByValue(balances, 100); // Only tokens worth $100+
```

---

## Complete Example

```tsx
import { useState, useEffect } from 'react';
import {
  TokenPortfolio,
  TokenPrice,
  TokenChart,
  TokenStats,
  TokenSocials,
} from '@/components/ontology-ui/crypto/portfolio';
import { CryptoService } from '@/lib/services/CryptoService';
import { Effect } from 'effect';

export function CryptoPortfolioPage() {
  const [balances, setBalances] = useState([]);
  const [selectedToken, setSelectedToken] = useState(null);
  const cryptoService = new CryptoService();

  // Fetch wallet balances (from blockchain)
  useEffect(() => {
    async function loadBalances() {
      // Your wallet balance fetching logic here
      // Then enrich with price data from CryptoService
      const tokenIds = ['ethereum', 'bitcoin', 'solana'];

      const prices = await Effect.runPromise(
        cryptoService.getTokenPrices(tokenIds)
      );

      // Combine with balance data
      const enrichedBalances = // ... your logic

      setBalances(enrichedBalances);
    }

    loadBalances();
  }, []);

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">My Crypto Portfolio</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Portfolio View */}
        <div className="lg:col-span-2">
          <TokenPortfolio
            balances={balances}
            onTokenSelect={setSelectedToken}
            autoRefresh={true}
          />
        </div>

        {/* Sidebar - Selected Token */}
        <div className="space-y-6">
          {selectedToken && (
            <>
              <TokenPrice
                tokenId={selectedToken}
                tokenName="Ethereum"
                tokenSymbol="ETH"
                showSparkline={true}
                autoRefresh={true}
              />

              <TokenStats
                tokenId={selectedToken}
                tokenName="Ethereum"
                tokenSymbol="ETH"
              />
            </>
          )}
        </div>
      </div>

      {/* Full-width Chart */}
      {selectedToken && (
        <div className="mt-8">
          <TokenChart
            tokenId={selectedToken}
            tokenName="Ethereum"
            tokenSymbol="ETH"
            defaultTimeRange="1w"
            showVolume={true}
          />
        </div>
      )}

      {/* Social Links */}
      {selectedToken && (
        <div className="mt-8">
          <TokenSocials
            tokenId={selectedToken}
            tokenName="Ethereum"
            tokenSymbol="ETH"
          />
        </div>
      )}
    </div>
  );
}
```

---

## Integration with Wallet Providers

### With viem (Ethereum)

```typescript
import { useAccount, useBalance } from 'wagmi';
import { formatUnits } from 'viem';

function MyPortfolio() {
  const { address } = useAccount();
  const { data: balance } = useBalance({ address });

  // Format balance for TokenBalance component
  const tokenBalance = {
    token: {
      id: 'ethereum',
      symbol: 'eth',
      name: 'Ethereum',
      // ... fetch from CryptoService
    },
    balance: balance?.value.toString() || '0',
    balanceFormatted: formatUnits(balance?.value || 0n, 18),
    valueUsd: // calculate from price
  };

  return <TokenBalance balance={tokenBalance} />;
}
```

### With Solana Web3.js

```typescript
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

function SolanaPortfolio() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();

  useEffect(() => {
    async function getBalance() {
      if (!publicKey) return;

      const balance = await connection.getBalance(publicKey);
      const solBalance = balance / LAMPORTS_PER_SOL;

      // Use in TokenBalance component
    }

    getBalance();
  }, [publicKey]);
}
```

---

## API Rate Limits

CoinGecko API has rate limits:

**Free tier:**
- 10-50 calls/minute
- 30 second cache built-in

**Pro tier (with API key):**
- 500 calls/minute
- Pass API key to CryptoService constructor

```typescript
const cryptoService = new CryptoService(import.meta.env.COINGECKO_API_KEY);
```

---

## Performance

**Virtualization:**
- TokenPortfolio uses react-window
- Handles 1000+ tokens smoothly
- Only renders visible rows

**Caching:**
- CryptoService caches API responses for 30s
- Reduces API calls and improves speed

**Auto-refresh:**
- All components support auto-refresh
- Configurable intervals (default 30s)

---

## Accessibility

All components include:
- Semantic HTML
- ARIA labels
- Keyboard navigation
- Focus management
- Screen reader support

---

## Theme Support

Components support dark/light themes via Tailwind CSS:

```tsx
// Automatically adapts to theme
<TokenPrice tokenId="ethereum" />
```

---

## Testing

```typescript
import { render, screen } from '@testing-library/react';
import { TokenBalance } from '@/components/ontology-ui/crypto/portfolio';

test('displays token balance', () => {
  const balance = {
    token: {
      id: 'ethereum',
      symbol: 'eth',
      name: 'Ethereum',
      current_price: 2000,
      price_change_percentage_24h: 5.2,
    },
    balance: '1500000000000000000',
    balanceFormatted: '1.5',
    valueUsd: 3000,
  };

  render(<TokenBalance balance={balance} compact />);

  expect(screen.getByText('Ethereum')).toBeInTheDocument();
  expect(screen.getByText('1.5')).toBeInTheDocument();
  expect(screen.getByText('$3,000')).toBeInTheDocument();
});
```

---

## Troubleshooting

**API errors:**
- Check CoinGecko API status
- Verify token IDs are correct
- Check rate limits

**Missing data:**
- Some tokens may not have all data fields
- Components handle missing data gracefully

**Performance issues:**
- Use virtualization for large lists
- Adjust refresh intervals
- Enable caching

---

## Next Steps

**Cycles 14-19: Token Analysis Tools**
- TokenAnalyzer
- TokenHolder
- TokenLiquidity
- TokenAudit
- TokenContract
- TokenTransactions

**Cycles 20-25: Advanced Portfolio**
- PortfolioTracker
- PortfolioAllocation
- PortfolioPnL
- PortfolioRebalance
- PortfolioAlert
- PortfolioExport

---

**Built with React 19, TypeScript, Effect.ts, and CoinGecko API.**
