# Liquidity & Staking Components

Comprehensive DeFi liquidity pool and staking management components built with React 19, TypeScript, Effect.ts, and shadcn/ui.

## Components (Cycles 58-64)

### 58. LiquidityPool
Add and remove liquidity from DeFi pools with automatic ratio calculation.

**Features:**
- Token pair selection
- Dual amount input (token A + token B)
- Auto-balance based on pool ratio
- LP token preview
- Pool share percentage
- Add/remove liquidity actions
- Impermanent loss warning

**Usage:**
```tsx
import { LiquidityPool } from '@/components/ontology-ui/crypto/liquidity';

<LiquidityPool
  pools={[
    {
      token0: { symbol: "ETH", name: "Ethereum", balance: 10, address: "0x..." },
      token1: { symbol: "USDC", name: "USD Coin", balance: 20000, address: "0x..." },
      reserve0: 10000,
      reserve1: 20000000,
      totalSupply: 141421,
      feeTier: 0.3
    }
  ]}
  onAddLiquidity={async (pool, amount0, amount1) => {
    // Handle add liquidity
  }}
  onRemoveLiquidity={async (pool, lpAmount) => {
    // Handle remove liquidity
  }}
/>
```

### 59. PoolStats
Display comprehensive pool statistics including APY, TVL, and volume.

**Features:**
- Pool overview dashboard
- TVL (Total Value Locked)
- 24h trading volume
- APY calculation (fees + rewards)
- Fee tier display
- Historical charts (TVL, volume, APY)
- Pool composition breakdown

**Usage:**
```tsx
import { PoolStats } from '@/components/ontology-ui/crypto/liquidity';

<PoolStats
  pool={{
    id: "eth-usdc",
    token0Symbol: "ETH",
    token1Symbol: "USDC",
    feeTier: 0.3,
    tvl: 40000000,
    volume24h: 5000000,
    apy: 15.5,
    feeApy: 8.2,
    rewardApy: 7.3,
    reserve0: 10000,
    reserve1: 20000000,
    token0Price: 2000,
    token1Price: 1
  }}
  tvlHistory={[/* historical data */]}
  volumeHistory={[/* historical data */]}
  apyHistory={[/* historical data */]}
/>
```

### 60. StakingPool
Stake tokens to earn rewards with flexible lock periods.

**Features:**
- Token selection for staking
- Amount input with balance display
- Lock period selector (flexible, 30d, 90d, 180d, 365d)
- APY display based on lock period
- Stake confirmation modal
- Early unstake penalty warning
- Current stake display

**Usage:**
```tsx
import { StakingPool } from '@/components/ontology-ui/crypto/liquidity';

<StakingPool
  tokens={[
    { symbol: "ETH", name: "Ethereum", balance: 10, address: "0x..." }
  ]}
  currentStake={{
    amount: 5,
    token: "ETH",
    lockPeriod: "90d",
    unlockDate: Date.now() + 7776000000,
    rewards: 0.15
  }}
  onStake={async (token, amount, lockPeriod) => {
    // Handle staking
  }}
  onUnstake={async (amount, acceptPenalty) => {
    // Handle unstaking
  }}
/>
```

### 61. StakingRewards
View and manage staking rewards with detailed analytics.

**Features:**
- Total staked amount display
- Rewards earned (pending + claimed)
- APY and daily rate calculation
- Claim rewards button
- Auto-compound toggle
- Rewards history chart
- Projected earnings

**Usage:**
```tsx
import { StakingRewards } from '@/components/ontology-ui/crypto/liquidity';

<StakingRewards
  positions={[
    {
      id: "stake1",
      token: "ETH",
      amount: 10,
      apy: 12,
      startDate: Date.now() - 2592000000,
      lockPeriod: "90d",
      autoCompound: true
    }
  ]}
  pendingRewards={0.25}
  claimedRewards={0.75}
  rewardHistory={[/* history items */]}
  onClaimRewards={async () => {
    // Claim rewards
  }}
  onToggleAutoCompound={async (positionIndex, enabled) => {
    // Toggle auto-compound
  }}
/>
```

### 62. YieldFarming
Discover and manage yield farming opportunities across DeFi protocols.

**Features:**
- List of farming pools with filters
- Sort by APY, TVL, risk score
- Token pair and rewards token display
- Deposit/withdraw functionality
- Pending rewards display
- Harvest rewards button
- Multi-protocol support

**Usage:**
```tsx
import { YieldFarming } from '@/components/ontology-ui/crypto/liquidity';

<YieldFarming
  pools={[
    {
      id: "pool1",
      protocol: "Uniswap",
      token0: "ETH",
      token1: "USDC",
      rewardToken: "UNI",
      apy: 35.5,
      tvl: 50000000,
      dailyRewards: 10000,
      riskScore: 2,
      userDeposit: 1000,
      pendingRewards: 5.25
    }
  ]}
  onDeposit={async (poolId, amount) => {
    // Deposit to farm
  }}
  onWithdraw={async (poolId, amount) => {
    // Withdraw from farm
  }}
  onHarvest={async (poolId) => {
    // Harvest rewards
  }}
/>
```

### 63. ImpermanentLoss
Calculate and visualize impermanent loss for liquidity providers.

**Features:**
- Token pair input
- Initial price and current price
- Amount invested
- IL calculation ($ and %)
- Fees earned offset
- Break-even price calculator
- Price scenario analysis
- Educational content

**Usage:**
```tsx
import { ImpermanentLoss } from '@/components/ontology-ui/crypto/liquidity';

<ImpermanentLoss
  token0Symbol="ETH"
  token1Symbol="USDC"
  initialPrice={2000}
  currentPrice={2500}
  investmentAmount={10000}
  feeTier={0.3}
  volume24h={5000000}
/>
```

### 64. AutoCompound
Configure and manage automatic reward compounding.

**Features:**
- Enable/disable auto-compound toggle
- Frequency selector (daily/weekly/optimal)
- Minimum harvest amount threshold
- Gas cost consideration
- Projected APY with compounding
- Compound history log
- Cost-benefit analysis

**Usage:**
```tsx
import { AutoCompound } from '@/components/ontology-ui/crypto/liquidity';

<AutoCompound
  positions={[
    {
      id: "stake1",
      token: "ETH",
      amount: 10,
      apy: 12,
      pendingRewards: 0.15,
      autoCompoundEnabled: true,
      lastCompounded: Date.now() - 86400000
    }
  ]}
  config={{
    enabled: true,
    frequency: "optimal",
    minHarvestAmount: 10,
    maxGasCost: 5
  }}
  history={[/* compound history */]}
  estimatedGasCost={3}
  onUpdateConfig={async (config) => {
    // Update configuration
  }}
  onTogglePosition={async (positionId, enabled) => {
    // Toggle position auto-compound
  }}
  onManualCompound={async (positionId) => {
    // Manual compound
  }}
/>
```

## Effect.ts Service Integration

All components integrate with `LiquidityService.ts` for business logic:

```typescript
import * as LiquidityService from '@/lib/services/crypto/LiquidityService';
import { Effect } from 'effect';

// Add liquidity
const addLiquidity = await Effect.runPromise(
  LiquidityService.addLiquidity({
    poolId: "eth-usdc",
    amount0: 1,
    amount1: 2000,
    slippage: 0.5,
    deadline: Date.now() + 1200000,
    walletAddress: "0x..."
  })
);

// Calculate impermanent loss
const ilResult = await Effect.runPromise(
  LiquidityService.calculateImpermanentLoss(
    2000,  // initial price
    2500,  // current price
    10000, // investment
    150    // fees earned
  )
);

// Stake tokens
const stakeResult = await Effect.runPromise(
  LiquidityService.stake({
    token: "ETH",
    amount: 10,
    lockPeriod: "90d",
    autoCompound: true,
    walletAddress: "0x..."
  })
);
```

## Protocol Integration

### Uniswap V3
```typescript
import { Pool, Position } from '@uniswap/v3-sdk';
import { Token } from '@uniswap/sdk-core';

// Integrate with Uniswap SDK for real data
const pool = new Pool(
  token0,
  token1,
  FeeAmount.MEDIUM,
  sqrtPriceX96,
  liquidity,
  tickCurrent
);
```

### Sushiswap
```typescript
// Use Sushiswap contracts for liquidity operations
const router = new ethers.Contract(
  SUSHISWAP_ROUTER_ADDRESS,
  ROUTER_ABI,
  signer
);

await router.addLiquidity(
  token0Address,
  token1Address,
  amount0,
  amount1,
  minAmount0,
  minAmount1,
  to,
  deadline
);
```

### Curve Finance
```typescript
// Integrate with Curve for stablecoin pools
const curvePool = new ethers.Contract(
  CURVE_POOL_ADDRESS,
  CURVE_ABI,
  signer
);

await curvePool.add_liquidity([amount0, amount1], minMintAmount);
```

## APY Calculations

### Trading Fee APY
```typescript
const dailyFees = volume24h * (feeTier / 100);
const yearlyFees = dailyFees * 365;
const feeApy = (yearlyFees / tvl) * 100;
```

### Compound APY
```typescript
const n = frequency === "daily" ? 365 : 52; // daily or weekly
const r = baseApy / 100;
const compoundApy = (Math.pow(1 + r / n, n) - 1) * 100;
```

### Impermanent Loss
```typescript
const priceRatio = currentPrice / initialPrice;
const ilMultiplier = (2 * Math.sqrt(priceRatio)) / (1 + priceRatio);
const ilPercent = (ilMultiplier - 1) * 100;
```

## Best Practices

### Gas Optimization
- Batch operations when possible
- Use optimal compound frequency
- Set minimum harvest amounts (3x gas cost)
- Monitor gas prices for transactions

### Risk Management
- Display impermanent loss warnings
- Show early unstake penalties
- Provide risk scores for pools
- Educational content for users

### UX Guidelines
- Real-time price updates
- Clear confirmation dialogs
- Loading states for transactions
- Error handling with user-friendly messages
- Mobile-responsive layouts

## Testing

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { LiquidityPool } from './LiquidityPool';

test('adds liquidity successfully', async () => {
  const handleAdd = jest.fn();

  render(
    <LiquidityPool
      pools={mockPools}
      onAddLiquidity={handleAdd}
    />
  );

  const amountInput = screen.getByPlaceholderText('0.0');
  fireEvent.change(amountInput, { target: { value: '1' } });

  const addButton = screen.getByText('Add Liquidity');
  fireEvent.click(addButton);

  expect(handleAdd).toHaveBeenCalled();
});
```

## Error Handling

All components handle errors gracefully using Effect.ts:

```typescript
const result = await Effect.runPromise(
  Effect.gen(function* () {
    const data = yield* LiquidityService.addLiquidity(params);
    return data;
  }).pipe(
    Effect.catchTag("SlippageExceeded", (error) =>
      Effect.succeed({ error: "Slippage tolerance exceeded" })
    ),
    Effect.catchTag("InsufficientBalance", (error) =>
      Effect.succeed({ error: `Insufficient ${error.token} balance` })
    )
  )
);
```

## Performance

- Lazy loading for charts and heavy components
- Debounced input handling
- Memoized calculations
- Optimized re-renders with React.memo
- Virtual scrolling for large lists

## Accessibility

- ARIA labels on all interactive elements
- Keyboard navigation support
- Screen reader friendly
- High contrast mode support
- Focus management in dialogs

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

MIT

---

**Built with Effect.ts for type-safe DeFi operations** 🚀
