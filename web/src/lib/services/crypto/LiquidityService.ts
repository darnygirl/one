/**
 * Liquidity Service
 *
 * Handles liquidity pool operations with Effect.ts:
 * - Add/remove liquidity
 * - Pool statistics (APY, TVL, volume)
 * - Staking operations
 * - Yield farming
 * - Impermanent loss calculations
 * - Auto-compound management
 */

import { Effect } from "effect";

// ============================================================================
// Error Types
// ============================================================================

export type LiquidityError =
  | { _tag: "PoolNotFound"; poolId: string }
  | { _tag: "InsufficientBalance"; token: string; required: number; available: number }
  | { _tag: "SlippageExceeded"; expected: number; actual: number }
  | { _tag: "MinimumLiquidityNotMet"; minimum: number }
  | { _tag: "StakeNotFound"; stakeId: string }
  | { _tag: "UnstakeLocked"; unlockDate: number }
  | { _tag: "RewardsNotAvailable"; reason: string }
  | { _tag: "InvalidConfiguration"; field: string; reason: string };

// ============================================================================
// Types
// ============================================================================

export interface Pool {
  id: string;
  token0: string;
  token1: string;
  reserve0: number;
  reserve1: number;
  totalSupply: number;
  feeTier: number;
  tvl: number;
  volume24h: number;
  apy: number;
}

export interface AddLiquidityParams {
  poolId: string;
  amount0: number;
  amount1: number;
  slippage: number;
  deadline: number;
  walletAddress: string;
}

export interface RemoveLiquidityParams {
  poolId: string;
  lpTokens: number;
  minAmount0: number;
  minAmount1: number;
  deadline: number;
  walletAddress: string;
}

export interface StakeParams {
  token: string;
  amount: number;
  lockPeriod: "flexible" | "30d" | "90d" | "180d" | "365d";
  autoCompound: boolean;
  walletAddress: string;
}

export interface StakePosition {
  id: string;
  token: string;
  amount: number;
  apy: number;
  startDate: number;
  unlockDate: number;
  pendingRewards: number;
  autoCompoundEnabled: boolean;
}

export interface PoolStats {
  pool: Pool;
  feeApy: number;
  rewardApy: number;
  impermanentLoss: number;
  userShare: number;
}

export interface ImpermanentLossResult {
  ilPercent: number;
  ilDollar: number;
  hodlValue: number;
  lpValue: number;
  feesEarned: number;
  netReturn: number;
}

// ============================================================================
// Mock Data
// ============================================================================

const MOCK_POOLS = new Map<string, Pool>([
  [
    "eth-usdc",
    {
      id: "eth-usdc",
      token0: "ETH",
      token1: "USDC",
      reserve0: 10000,
      reserve1: 20000000,
      totalSupply: 141421,
      feeTier: 0.3,
      tvl: 40000000,
      volume24h: 5000000,
      apy: 15.5
    }
  ],
  [
    "btc-eth",
    {
      id: "btc-eth",
      token0: "BTC",
      token1: "ETH",
      reserve0: 500,
      reserve1: 10000,
      totalSupply: 2236,
      feeTier: 0.3,
      tvl: 30000000,
      volume24h: 3000000,
      apy: 12.3
    }
  ]
]);

const LOCK_PERIOD_APY = {
  flexible: 5,
  "30d": 8,
  "90d": 12,
  "180d": 18,
  "365d": 25
};

// ============================================================================
// Pool Operations
// ============================================================================

/**
 * Get pool information
 */
export const getPool = (poolId: string): Effect.Effect<Pool, LiquidityError> =>
  Effect.gen(function* () {
    yield* Effect.sleep("200 millis");

    const pool = MOCK_POOLS.get(poolId);
    if (!pool) {
      return yield* Effect.fail({
        _tag: "PoolNotFound" as const,
        poolId
      });
    }

    return pool;
  });

/**
 * Add liquidity to pool
 */
export const addLiquidity = (
  params: AddLiquidityParams
): Effect.Effect<{ lpTokens: number; txHash: string }, LiquidityError> =>
  Effect.gen(function* () {
    // Get pool
    const pool = yield* getPool(params.poolId);

    // Validate amounts
    if (params.amount0 <= 0 || params.amount1 <= 0) {
      return yield* Effect.fail({
        _tag: "MinimumLiquidityNotMet" as const,
        minimum: 0.001
      });
    }

    // Check pool ratio
    const expectedRatio = pool.reserve1 / pool.reserve0;
    const actualRatio = params.amount1 / params.amount0;
    const slippage = Math.abs((actualRatio - expectedRatio) / expectedRatio) * 100;

    if (slippage > params.slippage) {
      return yield* Effect.fail({
        _tag: "SlippageExceeded" as const,
        expected: params.slippage,
        actual: slippage
      });
    }

    // Calculate LP tokens
    const liquidity = Math.sqrt(params.amount0 * params.amount1);
    const lpTokens = (liquidity / Math.sqrt(pool.reserve0 * pool.reserve1)) * pool.totalSupply;

    // Simulate transaction
    yield* Effect.sleep("1 second");

    return {
      lpTokens,
      txHash: `0x${Math.random().toString(16).substring(2, 66)}`
    };
  });

/**
 * Remove liquidity from pool
 */
export const removeLiquidity = (
  params: RemoveLiquidityParams
): Effect.Effect<{ amount0: number; amount1: number; txHash: string }, LiquidityError> =>
  Effect.gen(function* () {
    // Get pool
    const pool = yield* getPool(params.poolId);

    // Validate LP tokens
    if (params.lpTokens <= 0 || params.lpTokens > pool.totalSupply) {
      return yield* Effect.fail({
        _tag: "InsufficientBalance" as const,
        token: "LP",
        required: params.lpTokens,
        available: pool.totalSupply
      });
    }

    // Calculate amounts to receive
    const sharePercent = params.lpTokens / pool.totalSupply;
    const amount0 = pool.reserve0 * sharePercent;
    const amount1 = pool.reserve1 * sharePercent;

    // Check minimum amounts
    if (amount0 < params.minAmount0 || amount1 < params.minAmount1) {
      return yield* Effect.fail({
        _tag: "SlippageExceeded" as const,
        expected: 0,
        actual: 100
      });
    }

    // Simulate transaction
    yield* Effect.sleep("1 second");

    return {
      amount0,
      amount1,
      txHash: `0x${Math.random().toString(16).substring(2, 66)}`
    };
  });

/**
 * Get pool statistics
 */
export const getPoolStats = (
  poolId: string,
  userLpTokens: number = 0
): Effect.Effect<PoolStats, LiquidityError> =>
  Effect.gen(function* () {
    const pool = yield* getPool(poolId);

    // Calculate fee APY (from trading volume)
    const dailyFees = pool.volume24h * (pool.feeTier / 100);
    const yearlyFees = dailyFees * 365;
    const feeApy = (yearlyFees / pool.tvl) * 100;

    // Calculate reward APY (liquidity mining)
    const rewardApy = pool.apy - feeApy;

    // Calculate user share
    const userShare = userLpTokens > 0 ? (userLpTokens / pool.totalSupply) * 100 : 0;

    return {
      pool,
      feeApy,
      rewardApy,
      impermanentLoss: 0, // Would be calculated based on price history
      userShare
    };
  });

// ============================================================================
// Staking Operations
// ============================================================================

/**
 * Stake tokens
 */
export const stake = (
  params: StakeParams
): Effect.Effect<{ stakeId: string; unlockDate: number }, LiquidityError> =>
  Effect.gen(function* () {
    // Validate amount
    if (params.amount <= 0) {
      return yield* Effect.fail({
        _tag: "InsufficientBalance" as const,
        token: params.token,
        required: params.amount,
        available: 0
      });
    }

    // Calculate unlock date
    const lockDays = {
      flexible: 0,
      "30d": 30,
      "90d": 90,
      "180d": 180,
      "365d": 365
    };
    const unlockDate = Date.now() + lockDays[params.lockPeriod] * 86400000;

    // Simulate transaction
    yield* Effect.sleep("1 second");

    return {
      stakeId: `stake_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      unlockDate
    };
  });

/**
 * Unstake tokens
 */
export const unstake = (
  stakeId: string,
  acceptPenalty: boolean = false
): Effect.Effect<{ amount: number; penalty: number; txHash: string }, LiquidityError> =>
  Effect.gen(function* () {
    if (!stakeId.startsWith("stake_")) {
      return yield* Effect.fail({
        _tag: "StakeNotFound" as const,
        stakeId
      });
    }

    // Simulate checking lock period
    const isLocked = Math.random() > 0.5;
    const unlockDate = Date.now() + 86400000 * 30;

    if (isLocked && !acceptPenalty) {
      return yield* Effect.fail({
        _tag: "UnstakeLocked" as const,
        unlockDate
      });
    }

    const amount = 100; // Mock amount
    const penalty = isLocked ? amount * 0.05 : 0;

    // Simulate transaction
    yield* Effect.sleep("1 second");

    return {
      amount: amount - penalty,
      penalty,
      txHash: `0x${Math.random().toString(16).substring(2, 66)}`
    };
  });

/**
 * Claim staking rewards
 */
export const claimRewards = (
  stakeId: string
): Effect.Effect<{ amount: number; txHash: string }, LiquidityError> =>
  Effect.gen(function* () {
    if (!stakeId.startsWith("stake_")) {
      return yield* Effect.fail({
        _tag: "StakeNotFound" as const,
        stakeId
      });
    }

    // Simulate checking rewards
    const rewards = Math.random() * 10;

    if (rewards < 0.001) {
      return yield* Effect.fail({
        _tag: "RewardsNotAvailable" as const,
        reason: "No rewards available to claim"
      });
    }

    // Simulate transaction
    yield* Effect.sleep("1 second");

    return {
      amount: rewards,
      txHash: `0x${Math.random().toString(16).substring(2, 66)}`
    };
  });

// ============================================================================
// Impermanent Loss Calculations
// ============================================================================

/**
 * Calculate impermanent loss
 */
export const calculateImpermanentLoss = (
  initialPrice: number,
  currentPrice: number,
  investmentAmount: number,
  feesEarned: number = 0
): Effect.Effect<ImpermanentLossResult, LiquidityError> =>
  Effect.gen(function* () {
    if (initialPrice <= 0 || currentPrice <= 0 || investmentAmount <= 0) {
      return yield* Effect.fail({
        _tag: "InvalidConfiguration" as const,
        field: "prices",
        reason: "Prices and investment must be positive"
      });
    }

    yield* Effect.sleep("100 millis");

    // Price ratio
    const priceRatio = currentPrice / initialPrice;

    // Impermanent Loss formula
    const ilMultiplier = (2 * Math.sqrt(priceRatio)) / (1 + priceRatio);
    const ilPercent = (ilMultiplier - 1) * 100;

    // HODL strategy value
    const hodlValue = investmentAmount * (1 + (priceRatio - 1) / 2);

    // LP position value (with IL)
    const lpValue = investmentAmount * ilMultiplier;

    // Dollar value of IL
    const ilDollar = hodlValue - lpValue;

    // Net return (LP value + fees - initial investment)
    const netReturn = lpValue + feesEarned - investmentAmount;

    return {
      ilPercent,
      ilDollar,
      hodlValue,
      lpValue,
      feesEarned,
      netReturn
    };
  });

/**
 * Calculate break-even price for IL
 */
export const calculateBreakEvenPrice = (
  initialPrice: number,
  feeTier: number,
  volume24h: number,
  investmentAmount: number
): Effect.Effect<number, LiquidityError> =>
  Effect.gen(function* () {
    yield* Effect.sleep("100 millis");

    // Simplified calculation
    // Fees needed to offset IL = f(price_change)
    // This is a rough estimate

    const dailyFees = volume24h * (feeTier / 100) * (investmentAmount / 1000000);
    const daysToBreakEven = 30; // Estimate

    // Price movement that creates IL equal to fees earned
    const breakEvenRatio = 1.1; // 10% typically needs ~30 days of fees

    return initialPrice * breakEvenRatio;
  });

// ============================================================================
// Auto-Compound Operations
// ============================================================================

export interface AutoCompoundConfig {
  enabled: boolean;
  frequency: "daily" | "weekly" | "optimal";
  minHarvestAmount: number;
  maxGasCost: number;
}

/**
 * Update auto-compound configuration
 */
export const updateAutoCompoundConfig = (
  config: AutoCompoundConfig
): Effect.Effect<{ success: boolean }, LiquidityError> =>
  Effect.gen(function* () {
    if (config.minHarvestAmount < 0 || config.maxGasCost < 0) {
      return yield* Effect.fail({
        _tag: "InvalidConfiguration" as const,
        field: "amounts",
        reason: "Amounts must be non-negative"
      });
    }

    yield* Effect.sleep("300 millis");

    return { success: true };
  });

/**
 * Execute compound operation
 */
export const compound = (
  stakeId: string
): Effect.Effect<{ amount: number; newTotal: number; txHash: string }, LiquidityError> =>
  Effect.gen(function* () {
    if (!stakeId.startsWith("stake_")) {
      return yield* Effect.fail({
        _tag: "StakeNotFound" as const,
        stakeId
      });
    }

    // Claim and restake rewards
    const rewards = yield* claimRewards(stakeId);

    yield* Effect.sleep("500 millis");

    return {
      amount: rewards.amount,
      newTotal: 100 + rewards.amount, // Mock total
      txHash: `0x${Math.random().toString(16).substring(2, 66)}`
    };
  });

/**
 * Calculate optimal compound frequency
 */
export const calculateOptimalCompoundFrequency = (
  pendingRewards: number,
  gasCost: number,
  apy: number
): Effect.Effect<{ frequency: string; reason: string }, LiquidityError> =>
  Effect.gen(function* () {
    yield* Effect.sleep("100 millis");

    // Compound when rewards > 3x gas cost
    if (pendingRewards < gasCost * 3) {
      return {
        frequency: "wait",
        reason: "Rewards too low to cover gas costs efficiently"
      };
    }

    // High APY benefits from frequent compounding
    if (apy > 20 && pendingRewards > gasCost * 5) {
      return {
        frequency: "daily",
        reason: "High APY benefits from frequent compounding"
      };
    }

    if (pendingRewards > gasCost * 10) {
      return {
        frequency: "compound_now",
        reason: "Rewards are sufficient to compound profitably"
      };
    }

    return {
      frequency: "weekly",
      reason: "Balanced approach for moderate rewards"
    };
  });
