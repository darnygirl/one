# Lending & Borrowing Components (Cycles 65-71)

Complete DeFi lending and borrowing interface with multi-protocol support (Aave V3, Compound V3).

## Components Overview

### 65. LendingMarket
View and compare lending markets across protocols.

**Features:**
- List of lending protocols (Aave, Compound, etc.)
- Available markets with APY comparison
- Supply/borrow APY display
- Filter by asset, chain, protocol, APY
- Sort by TVL, APY, utilization
- Market overview dashboard with aggregate stats

**Usage:**
```tsx
import { LendingMarket } from '@/components/ontology-ui/crypto/lending';

<LendingMarket
  markets={markets}
  onSelectMarket={(market) => console.log('Selected:', market)}
  isLoading={false}
/>
```

### 66. LendToken
Lend tokens to earn interest with real-time calculations.

**Features:**
- Asset selection from wallet
- Amount input with max button
- Current supply APY display
- Projected earnings calculator (daily, monthly, yearly)
- Supply confirmation with preview
- Receipt tokens display (aTokens, cTokens)

**Usage:**
```tsx
import { LendToken } from '@/components/ontology-ui/crypto/lending';

<LendToken
  markets={markets}
  tokens={walletTokens}
  userAddress={address}
  onLend={async (market, amount) => {
    await lendToken({ protocol: market.protocol, asset: market.asset, amount });
  }}
/>
```

### 67. BorrowToken
Borrow tokens against collateral with health factor preview.

**Features:**
- Asset to borrow selection
- Borrow amount input with validation
- Borrow APY display
- Collateral requirement calculation
- Health factor preview (live updates)
- Liquidation price calculation
- Risk warnings for low health factor

**Usage:**
```tsx
import { BorrowToken } from '@/components/ontology-ui/crypto/lending';

<BorrowToken
  markets={markets}
  collateral={userCollateral}
  userAddress={address}
  onBorrow={async (market, amount) => {
    await borrowToken({ protocol: market.protocol, asset: market.asset, amount, collateral });
  }}
/>
```

### 68. CollateralManager
Manage collateral ratio with health factor monitoring.

**Features:**
- Current collateral value display
- Borrowed amount tracking
- Health factor visualization (safe/warning/danger)
- Liquidation price warning
- Add/remove collateral actions
- Collateral composition chart
- Real-time health factor updates

**Usage:**
```tsx
import { CollateralManager } from '@/components/ontology-ui/crypto/lending';

<CollateralManager
  collateral={userCollateral}
  borrowPositions={borrowPositions}
  healthFactor={currentHealthFactor}
  userAddress={address}
  onAddCollateral={async (asset, amount) => {
    await addCollateral({ asset, amount });
  }}
  onRemoveCollateral={async (asset, amount) => {
    await removeCollateral({ asset, amount });
  }}
/>
```

### 69. LiquidationWarning
Real-time liquidation risk monitoring with alerts.

**Features:**
- Health factor monitor with live updates
- Real-time price tracking
- Liquidation price calculation
- Risk level indicator (safe/warning/danger)
- Add collateral quick action
- Repay loan quick action
- Alert notifications for risk changes
- Price drop percentage to liquidation
- Historical health factor chart

**Usage:**
```tsx
import { LiquidationWarning } from '@/components/ontology-ui/crypto/lending';

<LiquidationWarning
  position={borrowPosition}
  currentPrice={assetPrice}
  onAddCollateral={() => navigate('/add-collateral')}
  onRepayLoan={() => navigate('/repay')}
  realTimeUpdates={true}
/>
```

### 70. InterestCalculator
Calculate interest rates for lending and borrowing.

**Features:**
- Supply/borrow amount input
- Time period selector (days, months, years)
- Interest calculation (simple + compound)
- APY vs APR comparison
- Total earnings/cost projection
- Historical rate chart
- Comparison across different protocols

**Usage:**
```tsx
import { InterestCalculator } from '@/components/ontology-ui/crypto/lending';

<InterestCalculator
  defaultAPY={4.2}
  defaultAmount="1000"
/>
```

### 71. PositionManager
Manage all lending and borrowing positions.

**Features:**
- All active positions dashboard
- Supplied assets with APY display
- Borrowed assets with APY display
- Net APY calculation (earnings - costs)
- Close position functionality
- Position history tracking
- Total portfolio value
- Quick actions (add collateral, repay, withdraw)

**Usage:**
```tsx
import { PositionManager } from '@/components/ontology-ui/crypto/lending';

<PositionManager
  lendingPositions={lendPositions}
  borrowPositions={borrowPositions}
  netAPY={netAPY}
  onClosePosition={async (positionId, type) => {
    await closePosition(positionId, type);
  }}
  onWithdraw={async (positionId, amount) => {
    await withdrawLent({ positionId, amount });
  }}
  onRepay={async (positionId, amount) => {
    await repayBorrow({ positionId, amount });
  }}
/>
```

## LendingService Integration

All components use the `LendingService` for business logic:

```typescript
import { Effect } from 'effect';
import * as LendingService from '@/lib/services/crypto/LendingService';

// Get lending markets
const markets = await Effect.runPromise(
  LendingService.getLendingMarkets({
    protocol: 'aave',
    chain: 'ethereum',
    minAPY: 2.0
  })
);

// Lend tokens
const position = await Effect.runPromise(
  LendingService.lendToken({
    protocol: 'aave',
    asset: 'USDC',
    amount: '1000',
    walletAddress: address
  })
);

// Borrow tokens
const borrowPosition = await Effect.runPromise(
  LendingService.borrowToken({
    protocol: 'aave',
    asset: 'ETH',
    amount: '2.5',
    collateral: [
      { asset: 'USDC', amount: '10000', value: '10000', collateralFactor: 0.85 }
    ],
    walletAddress: address
  })
);

// Calculate health factor
const healthFactorData = await Effect.runPromise(
  LendingService.calculateHealthFactor({
    collateral: userCollateral,
    borrowed: [{ asset: 'ETH', amount: '2.5' }],
    protocol: 'aave'
  })
);

// Calculate interest
const interestCalc = await Effect.runPromise(
  LendingService.calculateInterest({
    principal: '1000',
    apy: 4.2,
    days: 365
  })
);

// Get user positions
const positions = await Effect.runPromise(
  LendingService.getUserPositions(address)
);
```

## Protocol Integration Guide

### Aave V3 Integration

**Installation:**
```bash
bun add @aave/contract-helpers @aave/math-utils
```

**Setup:**
```typescript
import { Pool } from '@aave/contract-helpers';
import { ethers } from 'ethers';

const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();

// Initialize Aave Pool
const pool = new Pool(provider, {
  POOL: '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2', // Ethereum mainnet
});

// Supply (Lend)
const txs = await pool.supply({
  user: address,
  reserve: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
  amount: '1000000000', // 1000 USDC (6 decimals)
});

// Borrow
const txs = await pool.borrow({
  user: address,
  reserve: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
  amount: '1000000000000000000', // 1 ETH
  interestRateMode: 2, // Variable rate
});

// Repay
const txs = await pool.repay({
  user: address,
  reserve: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  amount: '1000000000000000000',
  interestRateMode: 2,
});
```

### Compound V3 Integration

**Installation:**
```bash
bun add @compound-finance/compound-js
```

**Setup:**
```typescript
import Compound from '@compound-finance/compound-js';

const compound = new Compound(window.ethereum);

// Supply
const tx = await compound.supply({
  asset: Compound.USDC,
  amount: 1000,
});

// Borrow
const tx = await compound.borrow({
  asset: Compound.ETH,
  amount: 2.5,
});

// Repay
const tx = await compound.repay({
  asset: Compound.ETH,
  amount: 2.5,
});
```

## Health Factor Calculation

**Formula:**
```
Health Factor = (Total Collateral in USD × Liquidation Threshold) / Total Borrowed in USD
```

**Risk Levels:**
- **Safe** (HF ≥ 2.0): Low risk, sufficient collateral buffer
- **Warning** (1.5 ≤ HF < 2.0): Moderate risk, should monitor closely
- **Danger** (HF < 1.5): High risk, may be liquidated soon

**Example:**
```typescript
// Collateral: 10,000 USDC (LT: 0.85)
// Borrowed: 3,000 USDC
// Health Factor = (10,000 × 0.85) / 3,000 = 2.83 (Safe)

// If borrowed increases to 5,000:
// Health Factor = (10,000 × 0.85) / 5,000 = 1.70 (Warning)

// If borrowed increases to 6,000:
// Health Factor = (10,000 × 0.85) / 6,000 = 1.42 (Danger!)
```

## Liquidation Mechanics

**What happens during liquidation:**
1. When Health Factor < 1.0, position can be liquidated
2. Liquidators repay part of the debt
3. They receive collateral at a discount (liquidation bonus)
4. User loses collateral but debt is reduced

**Liquidation Price:**
```
Liquidation Price = Total Borrowed / (Total Collateral × Liquidation Threshold)
```

**Protection strategies:**
- Keep Health Factor > 2.0 for safety
- Set up alerts for price movements
- Use stablecoins as collateral (less volatile)
- Monitor positions daily
- Have plan to add collateral quickly

## Interest Rate Models

### Supply APY
Rate earned on supplied assets. Increases with utilization.

### Borrow APY
Rate paid on borrowed assets. Higher than supply APY.

### Utilization Rate
```
Utilization = Total Borrowed / Total Supplied
```

Higher utilization → Higher APYs (both supply and borrow)

### Compound Interest (Daily)
```typescript
// Formula: A = P(1 + r/n)^(nt)
// Where:
// P = Principal
// r = Annual rate (as decimal)
// n = Compounding periods per year (365 for daily)
// t = Time in years

const principal = 1000;
const apy = 0.042; // 4.2%
const n = 365;
const t = 1;

const total = principal * Math.pow(1 + apy / n, n * t);
const interest = total - principal;
// Interest: ~42.86 USDC
```

## Convex Schema Integration

**Events to track:**
```typescript
// Lend events
{
  type: 'token_lent',
  data: {
    protocol: 'aave',
    asset: 'USDC',
    amount: '1000',
    apy: 4.2,
    receiptToken: 'aUSDC'
  }
}

// Borrow events
{
  type: 'token_borrowed',
  data: {
    protocol: 'aave',
    asset: 'ETH',
    amount: '2.5',
    apy: 3.8,
    collateral: [...],
    healthFactor: 2.4
  }
}

// Liquidation warning events
{
  type: 'liquidation_warning',
  data: {
    positionId: 'borrow_1',
    healthFactor: 1.6,
    riskLevel: 'warning'
  }
}
```

## Real-Time Monitoring

**Set up price feeds:**
```typescript
import { WebSocketProvider } from 'ethers';

const ws = new WebSocketProvider('wss://eth-mainnet.g.alchemy.com/v2/YOUR-KEY');

// Listen for price updates
ws.on('block', async (blockNumber) => {
  // Fetch latest prices
  const ethPrice = await getPrice('ETH');

  // Recalculate health factor
  const healthFactor = calculateHealthFactor(collateral, borrowed, ethPrice);

  // Update UI
  updateHealthFactorDisplay(healthFactor);
});
```

## Best Practices

1. **Always maintain HF > 2.0** for safety buffer
2. **Use stablecoins as collateral** to reduce volatility risk
3. **Monitor positions daily** or set up automated alerts
4. **Start with small amounts** to test the system
5. **Understand liquidation mechanics** before borrowing
6. **Compare rates across protocols** to maximize APY
7. **Account for gas costs** in calculations
8. **Keep emergency funds** to add collateral if needed

## Testing

**Mock data for development:**
```typescript
const mockMarkets: LendingMarket[] = [
  {
    protocol: 'aave',
    asset: 'USDC',
    supplyAPY: 4.2,
    borrowAPY: 5.5,
    totalSupply: '1200000000',
    totalBorrow: '950000000',
    utilization: 79,
    collateralFactor: 0.85,
    liquidationThreshold: 0.87,
    tvl: '1200000000',
    chain: 'ethereum',
  },
];

const mockPosition: BorrowPosition = {
  id: 'borrow_1',
  protocol: 'aave',
  asset: 'ETH',
  amount: '2.5',
  apy: 3.8,
  accrued: '0.0095',
  collateral: [
    { asset: 'USDC', amount: '10000', value: '10000', collateralFactor: 0.85 }
  ],
  healthFactor: 2.4,
  liquidationPrice: '3200',
  startDate: Date.now() - 30 * 24 * 60 * 60 * 1000,
};
```

## Related Components

- **DEX Components** (Cycles 51-57): Token swapping
- **Liquidity Components** (Cycles 58-64): Liquidity provision
- **Advanced DeFi** (Cycles 72-75): Options, futures, yield aggregation

## Resources

- [Aave V3 Docs](https://docs.aave.com/developers/getting-started/v3-overview)
- [Compound V3 Docs](https://docs.compound.finance/)
- [DeFi Pulse](https://www.defipulse.com/) - TVL rankings
- [DeFiLlama](https://defillama.com/) - Protocol analytics

---

**Built for Cycles 65-71 of the Cryptocurrency Components plan.**
