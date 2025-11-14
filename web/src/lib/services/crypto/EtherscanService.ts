/**
 * Etherscan Service - Effect.ts-based API client for blockchain data
 *
 * Provides type-safe access to:
 * - Token holder information
 * - Contract verification status
 * - Transaction history
 * - Security audit data
 * - Liquidity pool information
 */

import { Effect } from "effect";

// ============================================================================
// Types
// ============================================================================

export interface TokenHolder {
  address: string;
  balance: string;
  percentage: number;
  ensName?: string;
  isWhale: boolean;
}

export interface LiquidityPool {
  dex: string;
  address: string;
  tvl: number;
  volume24h: number;
  apy: number;
  token0: string;
  token1: string;
}

export interface SecurityAudit {
  provider: string;
  score: number;
  date: string;
  pdfUrl?: string;
  findings: AuditFinding[];
  verified: boolean;
}

export interface AuditFinding {
  severity: 'critical' | 'high' | 'medium' | 'low' | 'informational';
  title: string;
  description: string;
  status: 'open' | 'resolved';
}

export interface ContractInfo {
  address: string;
  verified: boolean;
  sourceCode?: string;
  abi?: string;
  compiler: string;
  constructorArgs?: string;
  contractName?: string;
}

export interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  valueUSD: number;
  timestamp: number;
  type: 'buy' | 'sell' | 'transfer';
  blockNumber: number;
}

export interface TokenAnalysis {
  address: string;
  name: string;
  symbol: string;
  totalSupply: string;
  holders: number;
  marketCap: number;
  price: number;
  volume24h: number;
  liquidity: number;
  securityScore: number;
  isVerified: boolean;
}

// ============================================================================
// Error Types
// ============================================================================

export type EtherscanError =
  | { _tag: "NetworkError"; message: string }
  | { _tag: "InvalidAddress"; address: string }
  | { _tag: "RateLimitError"; retryAfter: number }
  | { _tag: "NotFoundError"; resource: string }
  | { _tag: "ApiError"; code: string; message: string };

// ============================================================================
// Configuration
// ============================================================================

const ETHERSCAN_API_KEY = import.meta.env.PUBLIC_ETHERSCAN_API_KEY || "";
const ETHERSCAN_API_URL = "https://api.etherscan.io/api";

// Mock data for development (remove when implementing real API)
const MOCK_MODE = !ETHERSCAN_API_KEY;

// ============================================================================
// Helper Functions
// ============================================================================

function validateAddress(address: string): Effect.Effect<string, EtherscanError> {
  return Effect.gen(function* () {
    if (!address || address.length !== 42 || !address.startsWith("0x")) {
      return yield* Effect.fail({
        _tag: "InvalidAddress",
        address,
      });
    }
    return address;
  });
}

function fetchWithRetry(
  url: string,
  retries = 3
): Effect.Effect<Response, EtherscanError> {
  return Effect.gen(function* () {
    for (let i = 0; i < retries; i++) {
      try {
        const response = yield* Effect.tryPromise({
          try: () => fetch(url),
          catch: (error) => ({
            _tag: "NetworkError" as const,
            message: String(error),
          }),
        });

        if (response.status === 429) {
          return yield* Effect.fail({
            _tag: "RateLimitError",
            retryAfter: 60,
          });
        }

        if (!response.ok) {
          return yield* Effect.fail({
            _tag: "ApiError",
            code: String(response.status),
            message: response.statusText,
          });
        }

        return response;
      } catch (error) {
        if (i === retries - 1) {
          return yield* Effect.fail({
            _tag: "NetworkError",
            message: "Max retries exceeded",
          });
        }
        yield* Effect.sleep("1 second");
      }
    }

    return yield* Effect.fail({
      _tag: "NetworkError",
      message: "Failed to fetch",
    });
  });
}

// ============================================================================
// Mock Data Generators (for development)
// ============================================================================

function generateMockHolders(count: number): TokenHolder[] {
  const holders: TokenHolder[] = [];
  let remainingPercentage = 100;

  for (let i = 0; i < count; i++) {
    const percentage = i === count - 1
      ? remainingPercentage
      : Math.random() * (remainingPercentage / (count - i));

    remainingPercentage -= percentage;

    holders.push({
      address: `0x${Math.random().toString(16).substr(2, 40)}`,
      balance: String(Math.floor(Math.random() * 1000000)),
      percentage: Number(percentage.toFixed(2)),
      ensName: Math.random() > 0.7 ? `holder${i}.eth` : undefined,
      isWhale: percentage > 5,
    });
  }

  return holders.sort((a, b) => b.percentage - a.percentage);
}

function generateMockPools(): LiquidityPool[] {
  const dexes = ['Uniswap V3', 'Sushiswap', 'Curve', 'Balancer'];

  return dexes.map((dex) => ({
    dex,
    address: `0x${Math.random().toString(16).substr(2, 40)}`,
    tvl: Math.floor(Math.random() * 10000000),
    volume24h: Math.floor(Math.random() * 1000000),
    apy: Number((Math.random() * 100).toFixed(2)),
    token0: 'USDC',
    token1: 'TOKEN',
  }));
}

function generateMockAudit(): SecurityAudit {
  const providers = ['Certik', 'Slowmist', 'Hacken', 'Trail of Bits'];
  const provider = providers[Math.floor(Math.random() * providers.length)];

  return {
    provider,
    score: Math.floor(Math.random() * 30) + 70,
    date: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
    pdfUrl: `https://example.com/audits/${provider.toLowerCase()}.pdf`,
    findings: [
      {
        severity: 'medium',
        title: 'Reentrancy Protection',
        description: 'Consider adding reentrancy guard to transfer functions',
        status: 'resolved',
      },
      {
        severity: 'low',
        title: 'Gas Optimization',
        description: 'Storage variables can be optimized',
        status: 'open',
      },
    ],
    verified: true,
  };
}

function generateMockTransactions(count: number): Transaction[] {
  const types: Array<'buy' | 'sell' | 'transfer'> = ['buy', 'sell', 'transfer'];

  return Array.from({ length: count }, (_, i) => ({
    hash: `0x${Math.random().toString(16).substr(2, 64)}`,
    from: `0x${Math.random().toString(16).substr(2, 40)}`,
    to: `0x${Math.random().toString(16).substr(2, 40)}`,
    value: String(Math.floor(Math.random() * 100000)),
    valueUSD: Number((Math.random() * 10000).toFixed(2)),
    timestamp: Date.now() - i * 60000,
    type: types[Math.floor(Math.random() * types.length)],
    blockNumber: 18000000 + Math.floor(Math.random() * 100000),
  }));
}

// ============================================================================
// Service Functions
// ============================================================================

/**
 * Get top token holders
 */
export function getTokenHolders(
  tokenAddress: string,
  limit = 100
): Effect.Effect<TokenHolder[], EtherscanError> {
  return Effect.gen(function* () {
    yield* validateAddress(tokenAddress);

    if (MOCK_MODE) {
      yield* Effect.sleep("500 millis");
      return generateMockHolders(limit);
    }

    const url = `${ETHERSCAN_API_URL}?module=token&action=tokenholderlist&contractaddress=${tokenAddress}&page=1&offset=${limit}&apikey=${ETHERSCAN_API_KEY}`;
    const response = yield* fetchWithRetry(url);
    const data = yield* Effect.tryPromise({
      try: () => response.json(),
      catch: () => ({
        _tag: "ApiError" as const,
        code: "PARSE_ERROR",
        message: "Failed to parse response",
      }),
    });

    // Transform API response to our format
    return data.result?.map((holder: any) => ({
      address: holder.address,
      balance: holder.value,
      percentage: Number(holder.share || 0),
      isWhale: Number(holder.share || 0) > 5,
    })) || [];
  });
}

/**
 * Get liquidity pools for token
 */
export function getLiquidityPools(
  tokenAddress: string
): Effect.Effect<LiquidityPool[], EtherscanError> {
  return Effect.gen(function* () {
    yield* validateAddress(tokenAddress);

    if (MOCK_MODE) {
      yield* Effect.sleep("500 millis");
      return generateMockPools();
    }

    // In production, this would query DEX aggregators like 1inch, 0x, etc.
    return [];
  });
}

/**
 * Get security audit information
 */
export function getSecurityAudit(
  tokenAddress: string
): Effect.Effect<SecurityAudit | null, EtherscanError> {
  return Effect.gen(function* () {
    yield* validateAddress(tokenAddress);

    if (MOCK_MODE) {
      yield* Effect.sleep("500 millis");
      return Math.random() > 0.3 ? generateMockAudit() : null;
    }

    // In production, this would query audit providers' APIs
    return null;
  });
}

/**
 * Get contract verification info
 */
export function getContractInfo(
  contractAddress: string
): Effect.Effect<ContractInfo, EtherscanError> {
  return Effect.gen(function* () {
    yield* validateAddress(contractAddress);

    if (MOCK_MODE) {
      yield* Effect.sleep("500 millis");
      return {
        address: contractAddress,
        verified: Math.random() > 0.2,
        sourceCode: 'pragma solidity ^0.8.0;\n\ncontract Token {\n  // Contract code here\n}',
        abi: '[{"inputs":[],"name":"totalSupply","outputs":[{"type":"uint256"}],"type":"function"}]',
        compiler: 'v0.8.19+commit.7dd6d404',
        constructorArgs: '0x000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000a0',
        contractName: 'TokenContract',
      };
    }

    const url = `${ETHERSCAN_API_URL}?module=contract&action=getsourcecode&address=${contractAddress}&apikey=${ETHERSCAN_API_KEY}`;
    const response = yield* fetchWithRetry(url);
    const data = yield* Effect.tryPromise({
      try: () => response.json(),
      catch: () => ({
        _tag: "ApiError" as const,
        code: "PARSE_ERROR",
        message: "Failed to parse response",
      }),
    });

    const result = data.result?.[0];
    return {
      address: contractAddress,
      verified: result?.ABI !== "Contract source code not verified",
      sourceCode: result?.SourceCode || undefined,
      abi: result?.ABI || undefined,
      compiler: result?.CompilerVersion || "Unknown",
      constructorArgs: result?.ConstructorArguments || undefined,
      contractName: result?.ContractName || undefined,
    };
  });
}

/**
 * Get recent token transactions
 */
export function getTokenTransactions(
  tokenAddress: string,
  limit = 50
): Effect.Effect<Transaction[], EtherscanError> {
  return Effect.gen(function* () {
    yield* validateAddress(tokenAddress);

    if (MOCK_MODE) {
      yield* Effect.sleep("500 millis");
      return generateMockTransactions(limit);
    }

    const url = `${ETHERSCAN_API_URL}?module=account&action=tokentx&contractaddress=${tokenAddress}&page=1&offset=${limit}&sort=desc&apikey=${ETHERSCAN_API_KEY}`;
    const response = yield* fetchWithRetry(url);
    const data = yield* Effect.tryPromise({
      try: () => response.json(),
      catch: () => ({
        _tag: "ApiError" as const,
        code: "PARSE_ERROR",
        message: "Failed to parse response",
      }),
    });

    return data.result?.map((tx: any) => ({
      hash: tx.hash,
      from: tx.from,
      to: tx.to,
      value: tx.value,
      valueUSD: 0, // Would need price API integration
      timestamp: Number(tx.timeStamp) * 1000,
      type: 'transfer' as const,
      blockNumber: Number(tx.blockNumber),
    })) || [];
  });
}

/**
 * Get comprehensive token analysis
 */
export function getTokenAnalysis(
  tokenAddress: string
): Effect.Effect<TokenAnalysis, EtherscanError> {
  return Effect.gen(function* () {
    yield* validateAddress(tokenAddress);

    if (MOCK_MODE) {
      yield* Effect.sleep("1 second");
      return {
        address: tokenAddress,
        name: 'Example Token',
        symbol: 'EXT',
        totalSupply: '1000000000',
        holders: Math.floor(Math.random() * 100000),
        marketCap: Math.floor(Math.random() * 100000000),
        price: Number((Math.random() * 100).toFixed(6)),
        volume24h: Math.floor(Math.random() * 10000000),
        liquidity: Math.floor(Math.random() * 5000000),
        securityScore: Math.floor(Math.random() * 30) + 70,
        isVerified: Math.random() > 0.2,
      };
    }

    // In production, aggregate data from multiple sources
    return yield* Effect.fail({
      _tag: "NotFoundError",
      resource: "token analysis",
    });
  });
}

/**
 * Calculate security score based on various factors
 */
export function calculateSecurityScore(
  contractInfo: ContractInfo,
  audit: SecurityAudit | null,
  holders: TokenHolder[]
): number {
  let score = 0;

  // Contract verification (30 points)
  if (contractInfo.verified) score += 30;

  // Security audit (40 points)
  if (audit) {
    score += audit.score * 0.4;

    // Deduct for unresolved critical findings
    const criticalOpen = audit.findings.filter(
      f => f.severity === 'critical' && f.status === 'open'
    ).length;
    score -= criticalOpen * 10;
  }

  // Holder distribution (30 points)
  const topHolderPercentage = holders[0]?.percentage || 0;
  const top10Percentage = holders.slice(0, 10).reduce(
    (sum, h) => sum + h.percentage,
    0
  );

  if (topHolderPercentage < 10) score += 10;
  else if (topHolderPercentage < 20) score += 5;

  if (top10Percentage < 50) score += 20;
  else if (top10Percentage < 70) score += 10;

  return Math.max(0, Math.min(100, score));
}
