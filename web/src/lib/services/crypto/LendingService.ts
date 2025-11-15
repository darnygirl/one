/**
 * Lending Service
 *
 * Handles lending and borrowing operations with Effect.ts:
 * - Supply tokens to earn interest (Aave, Compound)
 * - Borrow against collateral
 * - Health factor monitoring
 * - Liquidation risk calculation
 * - Interest rate calculations
 * - Position management
 */

import { Effect } from "effect";

// ============================================================================
// Error Types
// ============================================================================

export type LendingError =
  | { _tag: "InsufficientCollateral"; required: string; available: string }
  | { _tag: "InsufficientBalance"; token: string; balance: string }
  | { _tag: "HealthFactorTooLow"; healthFactor: number; minimum: number }
  | { _tag: "LiquidationRisk"; healthFactor: number; liquidationThreshold: number }
  | { _tag: "MarketNotFound"; market: string }
  | { _tag: "ProtocolError"; protocol: string; reason: string }
  | { _tag: "InvalidAmount"; reason: string }
  | { _tag: "PositionNotFound"; positionId: string }
  | { _tag: "BorrowCapReached"; market: string; cap: string };

// ============================================================================
// Types
// ============================================================================

export interface LendingMarket {
  protocol: "aave" | "compound" | "maker";
  asset: string;
  supplyAPY: number;
  borrowAPY: number;
  totalSupply: string;
  totalBorrow: string;
  utilization: number;
  collateralFactor: number;
  liquidationThreshold: number;
  tvl: string;
  chain: string;
}

export interface LendPosition {
  id: string;
  protocol: string;
  asset: string;
  amount: string;
  apy: number;
  accrued: string;
  startDate: number;
  receiptToken?: string; // aToken, cToken
}

export interface BorrowPosition {
  id: string;
  protocol: string;
  asset: string;
  amount: string;
  apy: number;
  accrued: string;
  collateral: CollateralPosition[];
  healthFactor: number;
  liquidationPrice: string;
  startDate: number;
}

export interface CollateralPosition {
  asset: string;
  amount: string;
  value: string;
  collateralFactor: number;
}

export interface HealthFactorData {
  healthFactor: number;
  totalCollateralValue: string;
  totalBorrowValue: string;
  availableToBorrow: string;
  liquidationThreshold: string;
  riskLevel: "safe" | "warning" | "danger";
}

export interface InterestCalculation {
  principal: string;
  apy: number;
  period: number; // days
  simpleInterest: string;
  compoundInterest: string;
  totalSimple: string;
  totalCompound: string;
}

// ============================================================================
// Mock Data (Production: Replace with Aave SDK / Compound SDK)
// ============================================================================

const MOCK_MARKETS: LendingMarket[] = [
  {
    protocol: "aave",
    asset: "ETH",
    supplyAPY: 2.5,
    borrowAPY: 3.8,
    totalSupply: "2500000",
    totalBorrow: "1800000",
    utilization: 72,
    collateralFactor: 0.825,
    liquidationThreshold: 0.86,
    tvl: "4500000000",
    chain: "ethereum",
  },
  {
    protocol: "aave",
    asset: "USDC",
    supplyAPY: 4.2,
    borrowAPY: 5.5,
    totalSupply: "1200000000",
    totalBorrow: "950000000",
    utilization: 79,
    collateralFactor: 0.85,
    liquidationThreshold: 0.87,
    tvl: "1200000000",
    chain: "ethereum",
  },
  {
    protocol: "compound",
    asset: "DAI",
    supplyAPY: 3.8,
    borrowAPY: 4.9,
    totalSupply: "850000000",
    totalBorrow: "680000000",
    utilization: 80,
    collateralFactor: 0.80,
    liquidationThreshold: 0.85,
    tvl: "850000000",
    chain: "ethereum",
  },
  {
    protocol: "aave",
    asset: "WBTC",
    supplyAPY: 1.8,
    borrowAPY: 2.9,
    totalSupply: "45000",
    totalBorrow: "32000",
    utilization: 71,
    collateralFactor: 0.75,
    liquidationThreshold: 0.80,
    tvl: "1800000000",
    chain: "ethereum",
  },
];

// ============================================================================
// Market Operations
// ============================================================================

/**
 * Get all available lending markets
 */
export const getLendingMarkets = (
  filters?: {
    protocol?: string;
    asset?: string;
    chain?: string;
    minAPY?: number;
  }
): Effect.Effect<LendingMarket[], LendingError> =>
  Effect.gen(function* () {
    yield* Effect.sleep("300 millis");

    let markets = MOCK_MARKETS;

    if (filters?.protocol) {
      markets = markets.filter((m) => m.protocol === filters.protocol);
    }
    if (filters?.asset) {
      markets = markets.filter((m) => m.asset === filters.asset);
    }
    if (filters?.chain) {
      markets = markets.filter((m) => m.chain === filters.chain);
    }
    if (filters?.minAPY) {
      markets = markets.filter((m) => m.supplyAPY >= filters.minAPY);
    }

    return markets;
  });

/**
 * Get specific market details
 */
export const getMarketDetails = (
  protocol: string,
  asset: string
): Effect.Effect<LendingMarket, LendingError> =>
  Effect.gen(function* () {
    yield* Effect.sleep("200 millis");

    const market = MOCK_MARKETS.find(
      (m) => m.protocol === protocol && m.asset === asset
    );

    if (!market) {
      return yield* Effect.fail({
        _tag: "MarketNotFound" as const,
        market: `${protocol}:${asset}`,
      });
    }

    return market;
  });

// ============================================================================
// Lend Operations
// ============================================================================

/**
 * Lend tokens to earn interest
 */
export const lendToken = (params: {
  protocol: string;
  asset: string;
  amount: string;
  walletAddress: string;
}): Effect.Effect<LendPosition, LendingError> =>
  Effect.gen(function* () {
    // Validate amount
    const amount = parseFloat(params.amount);
    if (amount <= 0) {
      return yield* Effect.fail({
        _tag: "InvalidAmount" as const,
        reason: "Amount must be greater than 0",
      });
    }

    // Get market
    const market = yield* getMarketDetails(params.protocol, params.asset);

    // Simulate lending transaction
    yield* Effect.sleep("1000 millis");

    const position: LendPosition = {
      id: `lend_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      protocol: params.protocol,
      asset: params.asset,
      amount: params.amount,
      apy: market.supplyAPY,
      accrued: "0",
      startDate: Date.now(),
      receiptToken:
        params.protocol === "aave"
          ? `a${params.asset}`
          : `c${params.asset}`,
    };

    return position;
  });

/**
 * Withdraw lent tokens
 */
export const withdrawLent = (params: {
  positionId: string;
  amount: string;
  walletAddress: string;
}): Effect.Effect<{ withdrawn: string; accrued: string }, LendingError> =>
  Effect.gen(function* () {
    yield* Effect.sleep("800 millis");

    // Calculate accrued interest (mock)
    const accrued = (parseFloat(params.amount) * 0.025).toFixed(6);

    return {
      withdrawn: params.amount,
      accrued,
    };
  });

// ============================================================================
// Borrow Operations
// ============================================================================

/**
 * Borrow tokens against collateral
 */
export const borrowToken = (params: {
  protocol: string;
  asset: string;
  amount: string;
  collateral: CollateralPosition[];
  walletAddress: string;
}): Effect.Effect<BorrowPosition, LendingError> =>
  Effect.gen(function* () {
    // Validate amount
    const borrowAmount = parseFloat(params.amount);
    if (borrowAmount <= 0) {
      return yield* Effect.fail({
        _tag: "InvalidAmount" as const,
        reason: "Borrow amount must be greater than 0",
      });
    }

    // Get market
    const market = yield* getMarketDetails(params.protocol, params.asset);

    // Calculate total collateral value
    const totalCollateralValue = params.collateral.reduce(
      (sum, c) => sum + parseFloat(c.value),
      0
    );

    // Calculate max borrow amount based on collateral factor
    const maxBorrow = totalCollateralValue * market.collateralFactor;

    if (borrowAmount > maxBorrow) {
      return yield* Effect.fail({
        _tag: "InsufficientCollateral" as const,
        required: borrowAmount.toFixed(6),
        available: maxBorrow.toFixed(6),
      });
    }

    // Calculate health factor
    const healthFactor = yield* calculateHealthFactor({
      collateral: params.collateral,
      borrowed: [{ asset: params.asset, amount: params.amount }],
      protocol: params.protocol,
    });

    if (healthFactor.healthFactor < 1.5) {
      return yield* Effect.fail({
        _tag: "HealthFactorTooLow" as const,
        healthFactor: healthFactor.healthFactor,
        minimum: 1.5,
      });
    }

    // Simulate borrow transaction
    yield* Effect.sleep("1000 millis");

    const position: BorrowPosition = {
      id: `borrow_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      protocol: params.protocol,
      asset: params.asset,
      amount: params.amount,
      apy: market.borrowAPY,
      accrued: "0",
      collateral: params.collateral,
      healthFactor: healthFactor.healthFactor,
      liquidationPrice: calculateLiquidationPrice(
        totalCollateralValue,
        borrowAmount,
        market.liquidationThreshold
      ),
      startDate: Date.now(),
    };

    return position;
  });

/**
 * Repay borrowed tokens
 */
export const repayBorrow = (params: {
  positionId: string;
  amount: string;
  walletAddress: string;
}): Effect.Effect<{ repaid: string; remaining: string }, LendingError> =>
  Effect.gen(function* () {
    yield* Effect.sleep("800 millis");

    // Calculate remaining (mock)
    const remaining = "0";

    return {
      repaid: params.amount,
      remaining,
    };
  });

// ============================================================================
// Collateral Management
// ============================================================================

/**
 * Add collateral to position
 */
export const addCollateral = (params: {
  positionId: string;
  asset: string;
  amount: string;
  walletAddress: string;
}): Effect.Effect<{ newHealthFactor: number }, LendingError> =>
  Effect.gen(function* () {
    yield* Effect.sleep("800 millis");

    // Mock new health factor
    const newHealthFactor = 2.5;

    return { newHealthFactor };
  });

/**
 * Remove collateral from position
 */
export const removeCollateral = (params: {
  positionId: string;
  asset: string;
  amount: string;
  walletAddress: string;
}): Effect.Effect<{ newHealthFactor: number }, LendingError> =>
  Effect.gen(function* () {
    yield* Effect.sleep("800 millis");

    const newHealthFactor = 1.8;

    // Check if removal would cause liquidation
    if (newHealthFactor < 1.5) {
      return yield* Effect.fail({
        _tag: "HealthFactorTooLow" as const,
        healthFactor: newHealthFactor,
        minimum: 1.5,
      });
    }

    return { newHealthFactor };
  });

// ============================================================================
// Health Factor & Liquidation
// ============================================================================

/**
 * Calculate health factor for position
 */
export const calculateHealthFactor = (params: {
  collateral: CollateralPosition[];
  borrowed: { asset: string; amount: string }[];
  protocol: string;
}): Effect.Effect<HealthFactorData, LendingError> =>
  Effect.gen(function* () {
    yield* Effect.sleep("200 millis");

    // Calculate total collateral value
    const totalCollateralValue = params.collateral.reduce(
      (sum, c) => sum + parseFloat(c.value),
      0
    );

    // Calculate total borrow value
    const totalBorrowValue = params.borrowed.reduce(
      (sum, b) => sum + parseFloat(b.amount),
      0
    );

    // Calculate weighted liquidation threshold
    const weightedThreshold = params.collateral.reduce(
      (sum, c) => sum + parseFloat(c.value) * c.collateralFactor,
      0
    );

    // Health Factor = (Collateral × Liquidation Threshold) / Total Borrows
    const healthFactor =
      totalBorrowValue > 0
        ? weightedThreshold / totalBorrowValue
        : Number.MAX_SAFE_INTEGER;

    // Calculate available to borrow
    const availableToBorrow = Math.max(
      0,
      weightedThreshold - totalBorrowValue
    );

    // Determine risk level
    let riskLevel: "safe" | "warning" | "danger";
    if (healthFactor >= 2.0) {
      riskLevel = "safe";
    } else if (healthFactor >= 1.5) {
      riskLevel = "warning";
    } else {
      riskLevel = "danger";
    }

    return {
      healthFactor,
      totalCollateralValue: totalCollateralValue.toFixed(6),
      totalBorrowValue: totalBorrowValue.toFixed(6),
      availableToBorrow: availableToBorrow.toFixed(6),
      liquidationThreshold: weightedThreshold.toFixed(6),
      riskLevel,
    };
  });

/**
 * Monitor position for liquidation risk
 */
export const checkLiquidationRisk = (
  positionId: string
): Effect.Effect<
  {
    atRisk: boolean;
    healthFactor: number;
    priceDropToLiquidation: number;
  },
  LendingError
> =>
  Effect.gen(function* () {
    yield* Effect.sleep("200 millis");

    // Mock calculation
    const healthFactor = 1.6;
    const priceDropToLiquidation = 37; // % price drop to liquidation

    return {
      atRisk: healthFactor < 1.5,
      healthFactor,
      priceDropToLiquidation,
    };
  });

const calculateLiquidationPrice = (
  collateralValue: number,
  borrowValue: number,
  liquidationThreshold: number
): string => {
  // Liquidation Price = Borrowed Value / (Collateral Amount × Liquidation Threshold)
  const liquidationPrice = borrowValue / (collateralValue * liquidationThreshold);
  return liquidationPrice.toFixed(2);
};

// ============================================================================
// Interest Calculations
// ============================================================================

/**
 * Calculate interest earned/paid over time
 */
export const calculateInterest = (params: {
  principal: string;
  apy: number;
  days: number;
}): Effect.Effect<InterestCalculation, LendingError> =>
  Effect.gen(function* () {
    yield* Effect.sleep("100 millis");

    const principal = parseFloat(params.principal);
    const apy = params.apy / 100;
    const years = params.days / 365;

    // Simple Interest = Principal × Rate × Time
    const simpleInterest = principal * apy * years;
    const totalSimple = principal + simpleInterest;

    // Compound Interest (daily compounding)
    // A = P(1 + r/n)^(nt)
    const n = 365; // Daily compounding
    const compoundInterest =
      principal * Math.pow(1 + apy / n, n * years) - principal;
    const totalCompound = principal + compoundInterest;

    return {
      principal: params.principal,
      apy: params.apy,
      period: params.days,
      simpleInterest: simpleInterest.toFixed(6),
      compoundInterest: compoundInterest.toFixed(6),
      totalSimple: totalSimple.toFixed(6),
      totalCompound: totalCompound.toFixed(6),
    };
  });

/**
 * Get historical interest rates
 */
export const getHistoricalRates = (params: {
  protocol: string;
  asset: string;
  days: number;
}): Effect.Effect<{ date: number; supplyAPY: number; borrowAPY: number }[], LendingError> =>
  Effect.gen(function* () {
    yield* Effect.sleep("500 millis");

    // Generate mock historical data
    const data = [];
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;

    for (let i = params.days; i >= 0; i--) {
      data.push({
        date: now - i * dayMs,
        supplyAPY: 2.5 + Math.random() * 2,
        borrowAPY: 3.8 + Math.random() * 2,
      });
    }

    return data;
  });

// ============================================================================
// Position Management
// ============================================================================

/**
 * Get all user positions
 */
export const getUserPositions = (
  walletAddress: string
): Effect.Effect<
  {
    lending: LendPosition[];
    borrowing: BorrowPosition[];
    netAPY: number;
  },
  LendingError
> =>
  Effect.gen(function* () {
    yield* Effect.sleep("500 millis");

    // Mock positions
    const lending: LendPosition[] = [
      {
        id: "lend_1",
        protocol: "aave",
        asset: "USDC",
        amount: "10000",
        apy: 4.2,
        accrued: "105.25",
        startDate: Date.now() - 30 * 24 * 60 * 60 * 1000,
        receiptToken: "aUSDC",
      },
    ];

    const borrowing: BorrowPosition[] = [
      {
        id: "borrow_1",
        protocol: "aave",
        asset: "ETH",
        amount: "2.5",
        apy: 3.8,
        accrued: "0.0095",
        collateral: [
          {
            asset: "USDC",
            amount: "10000",
            value: "10000",
            collateralFactor: 0.85,
          },
        ],
        healthFactor: 2.4,
        liquidationPrice: "3200",
        startDate: Date.now() - 30 * 24 * 60 * 60 * 1000,
      },
    ];

    // Calculate net APY
    const totalLendValue = lending.reduce(
      (sum, p) => sum + parseFloat(p.amount),
      0
    );
    const totalBorrowValue = borrowing.reduce(
      (sum, p) => sum + parseFloat(p.amount),
      0
    );
    const lendEarnings = lending.reduce(
      (sum, p) => sum + parseFloat(p.amount) * (p.apy / 100),
      0
    );
    const borrowCost = borrowing.reduce(
      (sum, p) => sum + parseFloat(p.amount) * (p.apy / 100),
      0
    );
    const netAPY =
      totalLendValue > 0
        ? ((lendEarnings - borrowCost) / totalLendValue) * 100
        : 0;

    return {
      lending,
      borrowing,
      netAPY,
    };
  });

/**
 * Close lending position
 */
export const closePosition = (
  positionId: string
): Effect.Effect<{ closed: boolean; finalAmount: string }, LendingError> =>
  Effect.gen(function* () {
    yield* Effect.sleep("800 millis");

    return {
      closed: true,
      finalAmount: "10105.25",
    };
  });
