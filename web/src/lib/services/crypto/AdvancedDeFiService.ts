/**
 * Advanced DeFi Service
 *
 * Effect.ts service for options, futures, yield aggregation, and risk scoring.
 * Handles complex DeFi calculations with type-safe error handling.
 */

import { Effect, Data } from "effect";

// ============================================================================
// Error Types
// ============================================================================

export class OptionsCalculationError extends Data.TaggedError("OptionsCalculationError")<{
  message: string;
}> {}

export class FuturesCalculationError extends Data.TaggedError("FuturesCalculationError")<{
  message: string;
}> {}

export class YieldAggregationError extends Data.TaggedError("YieldAggregationError")<{
  message: string;
}> {}

export class RiskAssessmentError extends Data.TaggedError("RiskAssessmentError")<{
  message: string;
}> {}

export type AdvancedDeFiError =
  | OptionsCalculationError
  | FuturesCalculationError
  | YieldAggregationError
  | RiskAssessmentError;

// ============================================================================
// Options Trading
// ============================================================================

export interface OptionsGreeks {
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
  rho: number;
}

export interface OptionsPricing {
  premium: number;
  intrinsicValue: number;
  timeValue: number;
  breakEvenPrice: number;
  maxProfit: number;
  maxLoss: number;
}

/**
 * Calculate options Greeks (Delta, Gamma, Theta, Vega, Rho)
 * Using Black-Scholes model
 */
export const calculateOptionsGreeks = (
  spotPrice: number,
  strikePrice: number,
  timeToExpiry: number, // in years
  volatility: number, // implied volatility (0.20 = 20%)
  riskFreeRate: number, // 0.05 = 5%
  optionType: "call" | "put"
): Effect.Effect<OptionsGreeks, OptionsCalculationError> =>
  Effect.gen(function* () {
    if (spotPrice <= 0 || strikePrice <= 0 || timeToExpiry <= 0) {
      return yield* Effect.fail(
        new OptionsCalculationError({
          message: "Invalid input parameters for Greeks calculation",
        })
      );
    }

    // Black-Scholes d1 and d2
    const d1 =
      (Math.log(spotPrice / strikePrice) +
        (riskFreeRate + (volatility ** 2) / 2) * timeToExpiry) /
      (volatility * Math.sqrt(timeToExpiry));

    const d2 = d1 - volatility * Math.sqrt(timeToExpiry);

    // Standard normal distribution functions
    const normCdf = (x: number) => {
      return (1 + erf(x / Math.sqrt(2))) / 2;
    };

    const normPdf = (x: number) => {
      return Math.exp(-(x ** 2) / 2) / Math.sqrt(2 * Math.PI);
    };

    // Error function approximation
    const erf = (x: number) => {
      const sign = x >= 0 ? 1 : -1;
      x = Math.abs(x);
      const a1 = 0.254829592;
      const a2 = -0.284496736;
      const a3 = 1.421413741;
      const a4 = -1.453152027;
      const a5 = 1.061405429;
      const p = 0.3275911;
      const t = 1.0 / (1.0 + p * x);
      const y =
        1.0 -
        ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
      return sign * y;
    };

    // Calculate Greeks
    const delta = optionType === "call" ? normCdf(d1) : normCdf(d1) - 1;

    const gamma =
      normPdf(d1) / (spotPrice * volatility * Math.sqrt(timeToExpiry));

    const theta =
      optionType === "call"
        ? -(spotPrice * normPdf(d1) * volatility) / (2 * Math.sqrt(timeToExpiry)) -
          riskFreeRate * strikePrice * Math.exp(-riskFreeRate * timeToExpiry) * normCdf(d2)
        : -(spotPrice * normPdf(d1) * volatility) / (2 * Math.sqrt(timeToExpiry)) +
          riskFreeRate * strikePrice * Math.exp(-riskFreeRate * timeToExpiry) * normCdf(-d2);

    const vega = spotPrice * normPdf(d1) * Math.sqrt(timeToExpiry);

    const rho =
      optionType === "call"
        ? strikePrice * timeToExpiry * Math.exp(-riskFreeRate * timeToExpiry) * normCdf(d2)
        : -strikePrice * timeToExpiry * Math.exp(-riskFreeRate * timeToExpiry) * normCdf(-d2);

    return {
      delta: Number(delta.toFixed(4)),
      gamma: Number(gamma.toFixed(4)),
      theta: Number((theta / 365).toFixed(4)), // Daily theta
      vega: Number((vega / 100).toFixed(4)), // Per 1% change in IV
      rho: Number((rho / 100).toFixed(4)), // Per 1% change in interest rate
    };
  });

/**
 * Calculate options premium and pricing details
 */
export const calculateOptionsPricing = (
  spotPrice: number,
  strikePrice: number,
  timeToExpiry: number,
  volatility: number,
  riskFreeRate: number,
  optionType: "call" | "put"
): Effect.Effect<OptionsPricing, OptionsCalculationError> =>
  Effect.gen(function* () {
    // Black-Scholes formula
    const d1 =
      (Math.log(spotPrice / strikePrice) +
        (riskFreeRate + (volatility ** 2) / 2) * timeToExpiry) /
      (volatility * Math.sqrt(timeToExpiry));

    const d2 = d1 - volatility * Math.sqrt(timeToExpiry);

    const normCdf = (x: number) => (1 + erf(x / Math.sqrt(2))) / 2;
    const erf = (x: number) => {
      const sign = x >= 0 ? 1 : -1;
      x = Math.abs(x);
      const t = 1.0 / (1.0 + 0.3275911 * x);
      const y =
        1.0 -
        ((((1.061405429 * t + -1.453152027) * t + 1.421413741) * t + -0.284496736) * t +
          0.254829592) *
          t *
          Math.exp(-x * x);
      return sign * y;
    };

    let premium: number;
    let intrinsicValue: number;

    if (optionType === "call") {
      premium =
        spotPrice * normCdf(d1) -
        strikePrice * Math.exp(-riskFreeRate * timeToExpiry) * normCdf(d2);
      intrinsicValue = Math.max(0, spotPrice - strikePrice);
    } else {
      premium =
        strikePrice * Math.exp(-riskFreeRate * timeToExpiry) * normCdf(-d2) -
        spotPrice * normCdf(-d1);
      intrinsicValue = Math.max(0, strikePrice - spotPrice);
    }

    const timeValue = premium - intrinsicValue;
    const breakEvenPrice =
      optionType === "call" ? strikePrice + premium : strikePrice - premium;

    const maxProfit = optionType === "call" ? Infinity : strikePrice - premium;
    const maxLoss = premium;

    return {
      premium: Number(premium.toFixed(4)),
      intrinsicValue: Number(intrinsicValue.toFixed(4)),
      timeValue: Number(timeValue.toFixed(4)),
      breakEvenPrice: Number(breakEvenPrice.toFixed(2)),
      maxProfit: maxProfit === Infinity ? maxProfit : Number(maxProfit.toFixed(2)),
      maxLoss: Number(maxLoss.toFixed(4)),
    };
  });

// ============================================================================
// Futures Trading
// ============================================================================

export interface FuturesCalculation {
  liquidationPrice: number;
  marginRequired: number;
  notionalValue: number;
  potentialProfit: number;
  potentialLoss: number;
  riskRewardRatio: number;
  fundingRate: number;
  dailyFundingCost: number;
}

/**
 * Calculate futures trading parameters
 */
export const calculateFuturesPosition = (
  entryPrice: number,
  positionSize: number,
  leverage: number,
  direction: "long" | "short",
  takeProfitPrice?: number,
  stopLossPrice?: number,
  fundingRate = 0.01 // 1% default
): Effect.Effect<FuturesCalculation, FuturesCalculationError> =>
  Effect.gen(function* () {
    if (entryPrice <= 0 || positionSize <= 0 || leverage <= 0 || leverage > 100) {
      return yield* Effect.fail(
        new FuturesCalculationError({
          message: "Invalid futures parameters",
        })
      );
    }

    const notionalValue = entryPrice * positionSize;
    const marginRequired = notionalValue / leverage;

    // Liquidation price calculation
    const liquidationPrice =
      direction === "long"
        ? entryPrice * (1 - 1 / leverage + 0.005) // 0.5% maintenance margin
        : entryPrice * (1 + 1 / leverage - 0.005);

    // Profit/Loss calculations
    const potentialProfit = takeProfitPrice
      ? Math.abs(takeProfitPrice - entryPrice) * positionSize * (direction === "long" ? 1 : -1)
      : 0;

    const potentialLoss = stopLossPrice
      ? Math.abs(stopLossPrice - entryPrice) * positionSize * (direction === "long" ? -1 : 1)
      : marginRequired;

    const riskRewardRatio =
      potentialLoss > 0 ? potentialProfit / potentialLoss : 0;

    const dailyFundingCost = notionalValue * fundingRate;

    return {
      liquidationPrice: Number(liquidationPrice.toFixed(2)),
      marginRequired: Number(marginRequired.toFixed(2)),
      notionalValue: Number(notionalValue.toFixed(2)),
      potentialProfit: Number(potentialProfit.toFixed(2)),
      potentialLoss: Number(Math.abs(potentialLoss).toFixed(2)),
      riskRewardRatio: Number(riskRewardRatio.toFixed(2)),
      fundingRate: fundingRate,
      dailyFundingCost: Number(dailyFundingCost.toFixed(2)),
    };
  });

// ============================================================================
// Yield Aggregation
// ============================================================================

export interface YieldOpportunity {
  protocol: string;
  strategy: "lending" | "staking" | "liquidity-pool";
  apy: number;
  tvl: number;
  riskScore: number;
  riskAdjustedReturn: number;
  minDeposit: number;
  lockPeriod?: number; // in days
  autoCompound: boolean;
}

/**
 * Scan protocols and find best yield opportunities
 */
export const aggregateYields = (
  amount: number,
  riskTolerance: "low" | "medium" | "high" = "medium"
): Effect.Effect<YieldOpportunity[], YieldAggregationError> =>
  Effect.gen(function* () {
    // Mock yield opportunities (in production, fetch from DeFi Llama, etc.)
    const opportunities: YieldOpportunity[] = [
      {
        protocol: "Aave V3",
        strategy: "lending",
        apy: 4.5,
        tvl: 5000000000,
        riskScore: 15,
        riskAdjustedReturn: 4.5 / 15,
        minDeposit: 0,
        autoCompound: true,
      },
      {
        protocol: "Compound",
        strategy: "lending",
        apy: 3.8,
        tvl: 3000000000,
        riskScore: 12,
        riskAdjustedReturn: 3.8 / 12,
        minDeposit: 0,
        autoCompound: true,
      },
      {
        protocol: "Lido",
        strategy: "staking",
        apy: 5.2,
        tvl: 15000000000,
        riskScore: 18,
        riskAdjustedReturn: 5.2 / 18,
        minDeposit: 0.01,
        autoCompound: true,
      },
      {
        protocol: "Curve Finance",
        strategy: "liquidity-pool",
        apy: 8.5,
        tvl: 4000000000,
        riskScore: 35,
        riskAdjustedReturn: 8.5 / 35,
        minDeposit: 100,
        autoCompound: false,
      },
      {
        protocol: "Uniswap V3",
        strategy: "liquidity-pool",
        apy: 12.3,
        tvl: 3500000000,
        riskScore: 55,
        riskAdjustedReturn: 12.3 / 55,
        minDeposit: 1000,
        lockPeriod: 7,
        autoCompound: false,
      },
      {
        protocol: "Rocket Pool",
        strategy: "staking",
        apy: 5.8,
        tvl: 2000000000,
        riskScore: 22,
        riskAdjustedReturn: 5.8 / 22,
        minDeposit: 0.01,
        autoCompound: true,
      },
    ];

    // Filter by risk tolerance
    const maxRiskScore =
      riskTolerance === "low" ? 25 : riskTolerance === "medium" ? 50 : 100;

    const filtered = opportunities
      .filter((opp) => opp.riskScore <= maxRiskScore)
      .filter((opp) => amount >= opp.minDeposit)
      .sort((a, b) => b.riskAdjustedReturn - a.riskAdjustedReturn);

    if (filtered.length === 0) {
      return yield* Effect.fail(
        new YieldAggregationError({
          message: `No opportunities found for ${riskTolerance} risk tolerance`,
        })
      );
    }

    return filtered;
  });

/**
 * Calculate optimal portfolio allocation across yields
 */
export const calculateOptimalAllocation = (
  totalAmount: number,
  opportunities: YieldOpportunity[],
  diversification: "low" | "medium" | "high" = "medium"
): Effect.Effect<Array<YieldOpportunity & { allocation: number }>, YieldAggregationError> =>
  Effect.gen(function* () {
    if (opportunities.length === 0) {
      return yield* Effect.fail(
        new YieldAggregationError({ message: "No opportunities to allocate" })
      );
    }

    const maxPositions =
      diversification === "low" ? 2 : diversification === "medium" ? 4 : 6;

    const topOpportunities = opportunities.slice(0, maxPositions);
    const totalWeight = topOpportunities.reduce(
      (sum, opp) => sum + opp.riskAdjustedReturn,
      0
    );

    const allocations = topOpportunities.map((opp) => ({
      ...opp,
      allocation: (opp.riskAdjustedReturn / totalWeight) * totalAmount,
    }));

    return allocations;
  });

// ============================================================================
// Risk Scoring
// ============================================================================

export interface RiskFactors {
  auditScore: number; // 0-30
  tvlScore: number; // 0-20
  longevityScore: number; // 0-15
  teamScore: number; // 0-15
  insuranceScore: number; // 0-10
  exploitHistoryScore: number; // 0-10
}

export interface RiskScorecard {
  protocolName: string;
  overallScore: number; // 0-100
  rating: "Very High Risk" | "High Risk" | "Medium Risk" | "Low Risk";
  factors: RiskFactors;
  recommendations: string[];
}

/**
 * Calculate comprehensive risk score for a DeFi protocol
 */
export const calculateRiskScore = (
  protocolName: string,
  hasAudit: boolean,
  auditFirms: string[],
  tvl: number,
  launchDate: Date,
  teamKnown: boolean,
  hasInsurance: boolean,
  exploitHistory: number // number of past exploits
): Effect.Effect<RiskScorecard, RiskAssessmentError> =>
  Effect.gen(function* () {
    // Audit Score (0-30)
    let auditScore = 0;
    if (hasAudit) {
      auditScore = 10 + auditFirms.length * 5;
      auditScore = Math.min(auditScore, 30);
    }

    // TVL Score (0-20)
    let tvlScore = 0;
    if (tvl > 1000000000) tvlScore = 20;
    else if (tvl > 500000000) tvlScore = 18;
    else if (tvl > 100000000) tvlScore = 15;
    else if (tvl > 50000000) tvlScore = 12;
    else if (tvl > 10000000) tvlScore = 8;
    else if (tvl > 1000000) tvlScore = 5;

    // Longevity Score (0-15)
    const ageInMonths =
      (Date.now() - launchDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
    let longevityScore = 0;
    if (ageInMonths > 24) longevityScore = 15;
    else if (ageInMonths > 12) longevityScore = 12;
    else if (ageInMonths > 6) longevityScore = 8;
    else if (ageInMonths > 3) longevityScore = 5;
    else longevityScore = 2;

    // Team Score (0-15)
    const teamScore = teamKnown ? 15 : 5;

    // Insurance Score (0-10)
    const insuranceScore = hasInsurance ? 10 : 0;

    // Exploit History Score (0-10)
    let exploitHistoryScore = 10;
    if (exploitHistory > 0) {
      exploitHistoryScore = Math.max(0, 10 - exploitHistory * 3);
    }

    const factors: RiskFactors = {
      auditScore,
      tvlScore,
      longevityScore,
      teamScore,
      insuranceScore,
      exploitHistoryScore,
    };

    const overallScore =
      auditScore +
      tvlScore +
      longevityScore +
      teamScore +
      insuranceScore +
      exploitHistoryScore;

    // Rating based on score
    let rating: RiskScorecard["rating"];
    if (overallScore >= 80) rating = "Low Risk";
    else if (overallScore >= 60) rating = "Medium Risk";
    else if (overallScore >= 40) rating = "High Risk";
    else rating = "Very High Risk";

    // Generate recommendations
    const recommendations: string[] = [];
    if (auditScore < 20)
      recommendations.push("Consider protocols with multiple audits");
    if (tvlScore < 15)
      recommendations.push("Higher TVL indicates more trust and stability");
    if (longevityScore < 10)
      recommendations.push("Newer protocols carry higher risk");
    if (teamScore < 10)
      recommendations.push("Anonymous teams increase risk profile");
    if (insuranceScore === 0)
      recommendations.push("Look for protocols with insurance coverage");
    if (exploitHistoryScore < 10)
      recommendations.push("Past exploits indicate potential vulnerabilities");

    return {
      protocolName,
      overallScore,
      rating,
      factors,
      recommendations:
        recommendations.length > 0
          ? recommendations
          : ["This protocol meets most safety criteria"],
    };
  });

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Calculate implied volatility from option price (Newton-Raphson method)
 */
export const calculateImpliedVolatility = (
  optionPrice: number,
  spotPrice: number,
  strikePrice: number,
  timeToExpiry: number,
  riskFreeRate: number,
  optionType: "call" | "put"
): Effect.Effect<number, OptionsCalculationError> =>
  Effect.gen(function* () {
    let volatility = 0.3; // Initial guess: 30%
    const tolerance = 0.0001;
    const maxIterations = 100;

    for (let i = 0; i < maxIterations; i++) {
      const pricing = yield* calculateOptionsPricing(
        spotPrice,
        strikePrice,
        timeToExpiry,
        volatility,
        riskFreeRate,
        optionType
      );

      const diff = pricing.premium - optionPrice;
      if (Math.abs(diff) < tolerance) {
        return Number(volatility.toFixed(4));
      }

      const greeks = yield* calculateOptionsGreeks(
        spotPrice,
        strikePrice,
        timeToExpiry,
        volatility,
        riskFreeRate,
        optionType
      );

      volatility = volatility - diff / (greeks.vega * 100);

      if (volatility <= 0) volatility = 0.01;
      if (volatility > 5) volatility = 5;
    }

    return yield* Effect.fail(
      new OptionsCalculationError({
        message: "Failed to converge on implied volatility",
      })
    );
  });
