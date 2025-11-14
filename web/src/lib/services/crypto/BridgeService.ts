/**
 * BridgeService - Effect.ts-based cross-chain bridge service
 *
 * Provides type-safe access to:
 * - Cross-chain token bridging
 * - Multiple bridge providers (Hop, Across, Stargate, etc.)
 * - Route optimization and fee comparison
 * - Bridge transaction tracking
 * - Arrival time estimation
 */

import { Effect } from "effect";

// ============================================================================
// Types
// ============================================================================

export interface Chain {
  id: number;
  name: string;
  symbol: string;
  rpcUrl: string;
  explorerUrl: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

export interface BridgeToken {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoUrl?: string;
}

export interface BridgeRoute {
  provider: string;
  sourceChain: Chain;
  destinationChain: Chain;
  token: BridgeToken;
  amount: string;
  estimatedFee: string;
  estimatedTime: number; // seconds
  estimatedArrival: number; // timestamp
  gasEstimate: string;
  totalCost: string;
  steps: BridgeStep[];
}

export interface BridgeStep {
  type: 'bridge' | 'swap' | 'wrap';
  description: string;
  estimatedTime: number;
  gasCost: string;
}

export interface BridgeTransaction {
  id: string;
  hash: string;
  sourceChain: number;
  destinationChain: number;
  status: 'pending' | 'confirmed' | 'bridging' | 'completed' | 'failed';
  amount: string;
  token: string;
  timestamp: number;
  confirmations: number;
  requiredConfirmations: number;
  estimatedCompletion: number;
}

export interface BridgeProvider {
  name: string;
  displayName: string;
  logoUrl: string;
  supportedChains: number[];
  supportedTokens: string[];
  minAmount: string;
  maxAmount: string;
  estimatedTime: number;
  securityScore: number;
}

// ============================================================================
// Error Types
// ============================================================================

export type BridgeError =
  | { _tag: "NetworkError"; message: string }
  | { _tag: "InvalidChain"; chainId: number }
  | { _tag: "InvalidToken"; token: string }
  | { _tag: "InsufficientLiquidity"; amount: string }
  | { _tag: "AmountTooLow"; minAmount: string }
  | { _tag: "AmountTooHigh"; maxAmount: string }
  | { _tag: "UnsupportedRoute"; from: number; to: number }
  | { _tag: "TransactionNotFound"; txHash: string }
  | { _tag: "ApiError"; code: string; message: string };

// ============================================================================
// Configuration
// ============================================================================

const HOP_PROTOCOL_API = "https://api.hop.exchange/v1";
const ACROSS_PROTOCOL_API = "https://across.to/api";
const STARGATE_API = "https://api.stargate.finance/v1";

// Supported chains
export const SUPPORTED_CHAINS: Chain[] = [
  {
    id: 1,
    name: "Ethereum",
    symbol: "ETH",
    rpcUrl: "https://eth.llamarpc.com",
    explorerUrl: "https://etherscan.io",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  },
  {
    id: 137,
    name: "Polygon",
    symbol: "MATIC",
    rpcUrl: "https://polygon-rpc.com",
    explorerUrl: "https://polygonscan.com",
    nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
  },
  {
    id: 42161,
    name: "Arbitrum",
    symbol: "ARB",
    rpcUrl: "https://arb1.arbitrum.io/rpc",
    explorerUrl: "https://arbiscan.io",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  },
  {
    id: 10,
    name: "Optimism",
    symbol: "OP",
    rpcUrl: "https://mainnet.optimism.io",
    explorerUrl: "https://optimistic.etherscan.io",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  },
  {
    id: 8453,
    name: "Base",
    symbol: "BASE",
    rpcUrl: "https://mainnet.base.org",
    explorerUrl: "https://basescan.org",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  },
  {
    id: 43114,
    name: "Avalanche",
    symbol: "AVAX",
    rpcUrl: "https://api.avax.network/ext/bc/C/rpc",
    explorerUrl: "https://snowtrace.io",
    nativeCurrency: { name: "AVAX", symbol: "AVAX", decimals: 18 },
  },
];

// Bridge providers
export const BRIDGE_PROVIDERS: BridgeProvider[] = [
  {
    name: "hop",
    displayName: "Hop Protocol",
    logoUrl: "https://hop.exchange/logo.svg",
    supportedChains: [1, 137, 42161, 10, 8453],
    supportedTokens: ["USDC", "USDT", "DAI", "ETH"],
    minAmount: "10",
    maxAmount: "1000000",
    estimatedTime: 300, // 5 minutes
    securityScore: 95,
  },
  {
    name: "across",
    displayName: "Across Protocol",
    logoUrl: "https://across.to/logo.svg",
    supportedChains: [1, 137, 42161, 10, 8453],
    supportedTokens: ["USDC", "ETH", "WBTC"],
    minAmount: "5",
    maxAmount: "5000000",
    estimatedTime: 180, // 3 minutes
    securityScore: 92,
  },
  {
    name: "stargate",
    displayName: "Stargate Finance",
    logoUrl: "https://stargate.finance/logo.svg",
    supportedChains: [1, 137, 42161, 10, 43114],
    supportedTokens: ["USDC", "USDT", "ETH"],
    minAmount: "20",
    maxAmount: "2000000",
    estimatedTime: 420, // 7 minutes
    securityScore: 90,
  },
];

// Mock mode for development
const MOCK_MODE = true;

// ============================================================================
// Helper Functions
// ============================================================================

function getChainById(chainId: number): Effect.Effect<Chain, BridgeError> {
  return Effect.gen(function* () {
    const chain = SUPPORTED_CHAINS.find((c) => c.id === chainId);

    if (!chain) {
      return yield* Effect.fail({
        _tag: "InvalidChain",
        chainId,
      });
    }

    return chain;
  });
}

function validateAmount(
  amount: string,
  provider: BridgeProvider
): Effect.Effect<void, BridgeError> {
  return Effect.gen(function* () {
    const amountNum = Number(amount);

    if (amountNum < Number(provider.minAmount)) {
      return yield* Effect.fail({
        _tag: "AmountTooLow",
        minAmount: provider.minAmount,
      });
    }

    if (amountNum > Number(provider.maxAmount)) {
      return yield* Effect.fail({
        _tag: "AmountTooHigh",
        maxAmount: provider.maxAmount,
      });
    }
  });
}

// ============================================================================
// Mock Data Generators
// ============================================================================

function generateMockRoutes(
  fromChain: Chain,
  toChain: Chain,
  token: BridgeToken,
  amount: string
): BridgeRoute[] {
  return BRIDGE_PROVIDERS.filter((provider) =>
    provider.supportedChains.includes(fromChain.id) &&
    provider.supportedChains.includes(toChain.id) &&
    provider.supportedTokens.includes(token.symbol)
  ).map((provider) => {
    const baseFee = Number(amount) * 0.001; // 0.1% base fee
    const gasEstimate = (0.002 + Math.random() * 0.003).toFixed(6);
    const totalFee = baseFee + Number(gasEstimate) * 2000;

    return {
      provider: provider.displayName,
      sourceChain: fromChain,
      destinationChain: toChain,
      token,
      amount,
      estimatedFee: totalFee.toFixed(6),
      estimatedTime: provider.estimatedTime,
      estimatedArrival: Date.now() + provider.estimatedTime * 1000,
      gasEstimate,
      totalCost: (Number(amount) + totalFee).toFixed(6),
      steps: [
        {
          type: 'bridge',
          description: `Bridge from ${fromChain.name} to ${toChain.name}`,
          estimatedTime: provider.estimatedTime,
          gasCost: gasEstimate,
        },
      ],
    };
  });
}

function generateMockTransaction(
  route: BridgeRoute
): BridgeTransaction {
  return {
    id: `bridge_${Date.now()}`,
    hash: `0x${Math.random().toString(16).substr(2, 64)}`,
    sourceChain: route.sourceChain.id,
    destinationChain: route.destinationChain.id,
    status: 'pending',
    amount: route.amount,
    token: route.token.symbol,
    timestamp: Date.now(),
    confirmations: 0,
    requiredConfirmations: 12,
    estimatedCompletion: route.estimatedArrival,
  };
}

// ============================================================================
// Service Functions
// ============================================================================

/**
 * Get available bridge routes between chains
 */
export function getBridgeRoutes(
  fromChainId: number,
  toChainId: number,
  tokenSymbol: string,
  amount: string
): Effect.Effect<BridgeRoute[], BridgeError> {
  return Effect.gen(function* () {
    const fromChain = yield* getChainById(fromChainId);
    const toChain = yield* getChainById(toChainId);

    // Mock token data (in production, fetch from token list)
    const token: BridgeToken = {
      address: "0x0000000000000000000000000000000000000000",
      symbol: tokenSymbol,
      name: tokenSymbol,
      decimals: 6,
    };

    if (MOCK_MODE) {
      yield* Effect.sleep("800 millis");
      return generateMockRoutes(fromChain, toChain, token, amount);
    }

    // In production, query multiple bridge APIs
    return [];
  });
}

/**
 * Get best bridge route (lowest cost + fastest)
 */
export function getBestRoute(
  fromChainId: number,
  toChainId: number,
  tokenSymbol: string,
  amount: string,
  prioritize: 'cost' | 'speed' = 'cost'
): Effect.Effect<BridgeRoute | null, BridgeError> {
  return Effect.gen(function* () {
    const routes = yield* getBridgeRoutes(fromChainId, toChainId, tokenSymbol, amount);

    if (routes.length === 0) {
      return null;
    }

    if (prioritize === 'cost') {
      return routes.reduce((best, current) =>
        Number(current.totalCost) < Number(best.totalCost) ? current : best
      );
    } else {
      return routes.reduce((best, current) =>
        current.estimatedTime < best.estimatedTime ? current : best
      );
    }
  });
}

/**
 * Execute bridge transaction
 */
export function executeBridge(
  route: BridgeRoute,
  walletAddress: string
): Effect.Effect<BridgeTransaction, BridgeError> {
  return Effect.gen(function* () {
    if (MOCK_MODE) {
      yield* Effect.sleep("1 second");
      return generateMockTransaction(route);
    }

    // In production:
    // 1. Approve token spending
    // 2. Call bridge contract
    // 3. Wait for transaction confirmation
    // 4. Return transaction details

    return yield* Effect.fail({
      _tag: "ApiError",
      code: "NOT_IMPLEMENTED",
      message: "Bridge execution not implemented",
    });
  });
}

/**
 * Track bridge transaction status
 */
export function trackBridgeTransaction(
  txHash: string
): Effect.Effect<BridgeTransaction, BridgeError> {
  return Effect.gen(function* () {
    if (MOCK_MODE) {
      yield* Effect.sleep("500 millis");

      // Simulate transaction progression
      const progress = Math.random();
      let status: BridgeTransaction['status'];
      let confirmations = 0;

      if (progress < 0.2) {
        status = 'pending';
        confirmations = Math.floor(Math.random() * 3);
      } else if (progress < 0.4) {
        status = 'confirmed';
        confirmations = 12;
      } else if (progress < 0.8) {
        status = 'bridging';
        confirmations = 12;
      } else if (progress < 0.95) {
        status = 'completed';
        confirmations = 12;
      } else {
        status = 'failed';
        confirmations = 0;
      }

      return {
        id: `bridge_${Date.now()}`,
        hash: txHash,
        sourceChain: 1,
        destinationChain: 137,
        status,
        amount: "1000",
        token: "USDC",
        timestamp: Date.now() - 300000,
        confirmations,
        requiredConfirmations: 12,
        estimatedCompletion: Date.now() + 180000,
      };
    }

    return yield* Effect.fail({
      _tag: "TransactionNotFound",
      txHash,
    });
  });
}

/**
 * Get bridge provider by name
 */
export function getBridgeProvider(
  name: string
): BridgeProvider | undefined {
  return BRIDGE_PROVIDERS.find(
    (p) => p.name === name || p.displayName === name
  );
}

/**
 * Calculate bridge fee breakdown
 */
export function calculateBridgeFees(
  amount: string,
  provider: BridgeProvider,
  gasPrice: string
): {
  baseFee: number;
  gasFee: number;
  protocolFee: number;
  totalFee: number;
  finalAmount: number;
} {
  const amountNum = Number(amount);
  const baseFee = amountNum * 0.001; // 0.1%
  const gasFee = Number(gasPrice) * 200000; // Estimated 200k gas
  const protocolFee = amountNum * 0.0005; // 0.05%
  const totalFee = baseFee + gasFee + protocolFee;
  const finalAmount = amountNum - totalFee;

  return {
    baseFee,
    gasFee,
    protocolFee,
    totalFee,
    finalAmount,
  };
}

/**
 * Estimate bridge arrival time
 */
export function estimateArrivalTime(
  route: BridgeRoute,
  currentConfirmations: number
): {
  estimatedSeconds: number;
  estimatedTimestamp: number;
  confidence: 'high' | 'medium' | 'low';
} {
  const baseTime = route.estimatedTime;
  const confirmationProgress = currentConfirmations / 12;
  const remainingTime = baseTime * (1 - confirmationProgress);

  let confidence: 'high' | 'medium' | 'low' = 'medium';
  if (confirmationProgress > 0.8) confidence = 'high';
  if (confirmationProgress < 0.2) confidence = 'low';

  return {
    estimatedSeconds: Math.max(0, remainingTime),
    estimatedTimestamp: Date.now() + remainingTime * 1000,
    confidence,
  };
}

/**
 * Check if route is supported
 */
export function isRouteSupported(
  fromChainId: number,
  toChainId: number,
  tokenSymbol: string
): boolean {
  return BRIDGE_PROVIDERS.some(
    (provider) =>
      provider.supportedChains.includes(fromChainId) &&
      provider.supportedChains.includes(toChainId) &&
      provider.supportedTokens.includes(tokenSymbol)
  );
}

/**
 * Format bridge time estimate
 */
export function formatBridgeTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
}
