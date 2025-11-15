# DEX Trading Components

Complete decentralized exchange (DEX) trading interface with support for Uniswap, Sushiswap, 1inch, and Jupiter.

## Components

### TokenSwap
Full-featured token swap interface with multi-chain support.

**Features:**
- Token selection with balance display
- Real-time price quotes
- Multi-hop routing visualization
- Slippage tolerance settings
- Price impact warnings
- Swap confirmation modal
- Support for Ethereum, Polygon, and Solana

**Usage:**
```tsx
import { TokenSwap } from '@/components/ontology-ui/crypto/dex';

<TokenSwap
  walletAddress="0x..."
  chainId={1}
  onSwap={(txHash) => console.log('Swap executed:', txHash)}
  onError={(error) => console.error('Swap failed:', error)}
/>
```

**Props:**
- `walletAddress` - Connected wallet address
- `chainId` - Network chain ID (1=Ethereum, 137=Polygon, etc.)
- `tokens` - Available tokens for swap
- `defaultFrom` - Default source token
- `defaultTo` - Default destination token
- `onSwap` - Callback when swap is executed
- `onError` - Callback on error

---

### SwapQuote
Multi-DEX quote comparison to find the best swap rate.

**Features:**
- Compare quotes from multiple DEXes
- Show best rate with savings percentage
- Route visualization (direct or multi-hop)
- Gas cost comparison
- Price impact calculation
- Auto-refresh every 30 seconds

**Usage:**
```tsx
import { SwapQuote } from '@/components/ontology-ui/crypto/dex';

<SwapQuote
  fromToken={ethToken}
  toToken={usdcToken}
  amount="1.0"
  dexes={['Uniswap', 'Sushiswap', '1inch']}
  onQuoteSelect={(quote) => console.log('Selected:', quote)}
  autoRefresh={true}
/>
```

**Props:**
- `fromToken` - Source token
- `toToken` - Destination token
- `amount` - Amount to swap
- `dexes` - DEXes to query (optional, defaults to all)
- `onQuoteSelect` - Callback when quote is selected
- `autoRefresh` - Enable auto-refresh (default: true)

---

### SwapHistory
Transaction history with filtering and export capabilities.

**Features:**
- List of past swaps with virtualization
- Filter by token pair and status
- Search by hash or address
- Date range filtering
- Total volume and fees statistics
- Profit/loss tracking
- Export to CSV

**Usage:**
```tsx
import { SwapHistory } from '@/components/ontology-ui/crypto/dex';

<SwapHistory
  walletAddress="0x..."
  chainId={1}
  showProfitLoss={true}
  onExport={() => console.log('History exported')}
/>
```

**Props:**
- `walletAddress` - Wallet to show history for
- `chainId` - Network chain ID
- `transactions` - Transaction history (optional, fetched automatically)
- `showProfitLoss` - Show P/L column (default: true)
- `onExport` - Callback on export

---

### LimitOrder
Create and manage limit orders for automated trading.

**Features:**
- Token pair selection
- Target price input
- Amount and expiration settings
- Active orders list with status
- Cancel order functionality
- Order filled notifications
- Partial fill tracking

**Usage:**
```tsx
import { LimitOrder } from '@/components/ontology-ui/crypto/dex';

<LimitOrder
  walletAddress="0x..."
  chainId={1}
  fromToken={ethToken}
  toToken={usdcToken}
  onOrderCreate={(orderId) => console.log('Order created:', orderId)}
  onOrderCancel={(orderId) => console.log('Order cancelled:', orderId)}
/>
```

**Props:**
- `walletAddress` - Connected wallet address
- `chainId` - Network chain ID
- `fromToken` - Default source token
- `toToken` - Default destination token
- `openOrders` - Active orders (optional)
- `onOrderCreate` - Callback on order creation
- `onOrderCancel` - Callback on order cancellation

---

### DCAStrategy
Dollar-cost averaging automation for recurring purchases.

**Features:**
- Token pair selection
- Frequency options (hourly, daily, weekly)
- Amount per purchase configuration
- Total duration and investment calculation
- Historical performance tracking
- Start/pause/stop controls
- ROI and average price display

**Usage:**
```tsx
import { DCAStrategy } from '@/components/ontology-ui/crypto/dex';

<DCAStrategy
  walletAddress="0x..."
  chainId={1}
  fromToken={usdcToken}
  toToken={ethToken}
  onStrategyCreate={(id) => console.log('DCA started:', id)}
  onStrategyPause={(id) => console.log('DCA paused:', id)}
/>
```

**Props:**
- `walletAddress` - Connected wallet address
- `chainId` - Network chain ID
- `fromToken` - Token to spend
- `toToken` - Token to buy
- `strategies` - Active strategies (optional)
- `onStrategyCreate` - Callback on strategy creation
- `onStrategyPause` - Callback on strategy pause

---

### SlippageSettings
Configure slippage tolerance and transaction settings.

**Features:**
- Preset slippage buttons (0.1%, 0.5%, 1%, 3%, 5%)
- Custom slippage input
- Auto slippage based on liquidity
- Warning alerts for high slippage
- MEV protection toggle
- Transaction deadline configuration

**Usage:**
```tsx
import { SlippageSettings } from '@/components/ontology-ui/crypto/dex';

<SlippageSettings
  defaultSlippage={0.5}
  onSlippageChange={(config) => console.log('Slippage:', config)}
  showWarnings={true}
/>
```

**Props:**
- `defaultSlippage` - Initial slippage value (default: 0.5)
- `onSlippageChange` - Callback when settings change
- `showWarnings` - Show warning alerts (default: true)

---

### GasSettings
Gas price configuration for optimal transaction costs.

**Features:**
- Gas speed presets (slow, average, fast, instant)
- EIP-1559 support (base + priority fee)
- Custom gas limit input
- USD cost estimation
- Historical gas trends
- Simple and advanced modes

**Usage:**
```tsx
import { GasSettings } from '@/components/ontology-ui/crypto/dex';

<GasSettings
  chainId={1}
  currentGasPrice="30"
  onGasChange={(config) => console.log('Gas config:', config)}
  showOptimizations={true}
/>
```

**Props:**
- `chainId` - Network chain ID
- `currentGasPrice` - Current network gas price
- `onGasChange` - Callback when gas settings change
- `showOptimizations` - Show optimization tips (default: true)

---

## Integration Guide

### 1. Install Dependencies

```bash
bun add viem wagmi @rainbow-me/rainbowkit @solana/web3.js effect
```

### 2. Setup Wallet Connection

```tsx
import { WagmiConfig, createConfig } from 'wagmi';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';

// Configure chains and providers
const config = createConfig({
  // ... wagmi config
});

function App() {
  return (
    <WagmiConfig config={config}>
      <RainbowKitProvider>
        {/* Your app */}
      </RainbowKitProvider>
    </WagmiConfig>
  );
}
```

### 3. Use DEX Components

```tsx
import { TokenSwap, SwapQuote, LimitOrder } from '@/components/ontology-ui/crypto/dex';
import { useAccount } from 'wagmi';

function TradingInterface() {
  const { address, chain } = useAccount();

  return (
    <div className="grid grid-cols-2 gap-4">
      <TokenSwap
        walletAddress={address}
        chainId={chain?.id}
        onSwap={(hash) => {
          console.log('Swap executed:', hash);
          // Update UI, show notification, etc.
        }}
      />

      <SwapQuote
        fromToken={ethToken}
        toToken={usdcToken}
        amount="1.0"
        onQuoteSelect={(quote) => {
          // Use selected quote for swap
        }}
      />

      <LimitOrder
        walletAddress={address}
        chainId={chain?.id}
        onOrderCreate={(orderId) => {
          // Track order, show notification
        }}
      />
    </div>
  );
}
```

### 4. Integrate with DEXService

All components use the DEXService from `@/lib/services/crypto/DEXService`:

```typescript
import * as DEXService from '@/lib/services/crypto/DEXService';
import { Effect } from 'effect';

// Execute a swap
const swapResult = await Effect.runPromise(
  DEXService.executeSwap({
    fromToken: '0x...',
    toToken: '0x...',
    amount: '1.0',
    slippage: 0.5,
    deadline: 20,
    chainId: 1,
    walletAddress: '0x...',
  })
);

// Get quotes from multiple DEXes
const quotes = await Effect.runPromise(
  DEXService.getQuotes({
    fromToken: '0x...',
    toToken: '0x...',
    amount: '1.0',
    chainId: 1,
  })
);
```

### 5. Error Handling

All components handle Effect.ts error types:

```typescript
try {
  const result = await Effect.runPromise(
    DEXService.executeSwap(params)
  );
} catch (err) {
  if (err._tag === 'InsufficientLiquidity') {
    console.error('Not enough liquidity for', err.pair);
  } else if (err._tag === 'ExcessiveSlippage') {
    console.error('Slippage too high');
  } else if (err._tag === 'PriceImpactTooHigh') {
    console.error('Price impact:', err.impact);
  }
}
```

---

## DEX Support

### Ethereum (Chain ID: 1)
- **Uniswap V3** - Most popular DEX with concentrated liquidity
- **Sushiswap** - Community-driven DEX with diverse pairs
- **Curve** - Optimized for stablecoin swaps
- **1inch** - DEX aggregator for best rates

### Polygon (Chain ID: 137)
- **QuickSwap** - Native Polygon DEX
- **Uniswap V3** - Cross-chain deployment
- **Sushiswap** - Multi-chain support

### Solana
- **Jupiter** - Leading Solana DEX aggregator
- **Raydium** - AMM and order book
- **Orca** - User-friendly concentrated liquidity

---

## Advanced Features

### Multi-Hop Routing
Automatically find optimal routes through multiple pools:
```
ETH → USDC (direct)
ETH → WBTC → USDC (2-hop for better rate)
```

### MEV Protection
Enable private mempool routing to prevent:
- Front-running attacks
- Sandwich attacks
- Transaction reordering

### Auto-Slippage
Dynamically adjust slippage based on:
- Pool liquidity
- Token volatility
- Market conditions

### Gas Optimization
- EIP-1559 support (base + priority fee)
- Real-time gas price tracking
- Cost-effective transaction timing

---

## Example: Complete Trading Flow

```tsx
import { useState } from 'react';
import {
  TokenSwap,
  SwapQuote,
  SwapHistory,
  SlippageSettings,
  GasSettings,
} from '@/components/ontology-ui/crypto/dex';

function DEXTrading() {
  const [slippageConfig, setSlippageConfig] = useState({ preset: '0.5' });
  const [gasConfig, setGasConfig] = useState({ speed: 'average' });

  return (
    <div className="space-y-4">
      {/* Settings */}
      <div className="grid grid-cols-2 gap-4">
        <SlippageSettings onSlippageChange={setSlippageConfig} />
        <GasSettings onGasChange={setGasConfig} />
      </div>

      {/* Trading */}
      <div className="grid grid-cols-2 gap-4">
        <TokenSwap
          walletAddress="0x..."
          chainId={1}
          onSwap={(hash) => console.log('Swap:', hash)}
        />
        <SwapQuote
          fromToken={ethToken}
          toToken={usdcToken}
          amount="1.0"
        />
      </div>

      {/* History */}
      <SwapHistory
        walletAddress="0x..."
        chainId={1}
        showProfitLoss={true}
      />
    </div>
  );
}
```

---

## Production Considerations

### Security
- ✅ Slippage protection
- ✅ MEV protection available
- ✅ Transaction simulation before execution
- ✅ Deadline enforcement
- ✅ Input validation

### Performance
- ✅ Real-time quote updates
- ✅ Parallel DEX queries
- ✅ Optimized route finding
- ✅ Gas cost estimation

### User Experience
- ✅ Clear price impact warnings
- ✅ Transaction status tracking
- ✅ Error handling with user-friendly messages
- ✅ Responsive design
- ✅ Dark mode support

---

## API Reference

See individual component documentation above for detailed props and usage.

For DEXService API, see `/web/src/lib/services/crypto/DEXService.ts`.

---

**Built for ONE Platform • Cycles 51-57 Complete**
