/**
 * DEX Trading Component Types
 * Types for DEX swap, liquidity, and trading components
 */

import type { CardProps } from "../../types";

// ============================================================================
// DEX Types
// ============================================================================

export interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  balance?: string;
  usdValue?: number;
  icon?: string;
  chainId?: number;
}

export interface SwapRoute {
  dex: string;
  path: string[];
  priceImpact: number;
  gasEstimate: string;
  outputAmount: string;
  fee: number;
}

export interface SwapQuoteData {
  dex: string;
  inputAmount: string;
  outputAmount: string;
  priceImpact: number;
  route: string[];
  fee: number;
  gasEstimate: string;
  estimatedTime: number;
  logo?: string;
}

export interface SwapTransaction {
  hash: string;
  timestamp: number;
  fromToken: Token;
  toToken: Token;
  fromAmount: string;
  toAmount: string;
  priceImpact: number;
  gasUsed: string;
  status: "pending" | "success" | "failed";
  profitLoss?: number;
}

export interface LimitOrderData {
  id: string;
  fromToken: Token;
  toToken: Token;
  targetPrice: string;
  amount: string;
  expiresAt: number;
  createdAt: number;
  status: "open" | "filled" | "cancelled" | "expired";
  filled?: number;
}

export interface DCAStrategyData {
  id: string;
  fromToken: Token;
  toToken: Token;
  amount: string;
  frequency: "hourly" | "daily" | "weekly";
  startDate: number;
  endDate?: number;
  totalInvested: number;
  totalReceived: number;
  averagePrice: number;
  executionCount: number;
  status: "active" | "paused" | "completed";
}

export interface SlippageConfig {
  preset: "0.1" | "0.5" | "1" | "3" | "5" | "custom";
  customValue?: number;
  autoSlippage: boolean;
  deadline: number; // minutes
}

export interface GasConfig {
  speed: "slow" | "average" | "fast" | "custom";
  gasPrice?: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
  gasLimit?: string;
  gasToken?: string;
  estimatedTime: number;
  estimatedCost: string;
}

// ============================================================================
// Component Props
// ============================================================================

export interface TokenSwapProps extends CardProps {
  walletAddress?: string;
  chainId?: number;
  tokens?: Token[];
  defaultFrom?: Token;
  defaultTo?: Token;
  onSwap?: (txHash: string) => void;
  onError?: (error: string) => void;
}

export interface SwapQuoteProps extends CardProps {
  fromToken?: Token;
  toToken?: Token;
  amount?: string;
  dexes?: string[];
  onQuoteSelect?: (quote: SwapQuoteData) => void;
  autoRefresh?: boolean;
}

export interface SwapHistoryProps extends CardProps {
  walletAddress?: string;
  chainId?: number;
  transactions?: SwapTransaction[];
  showProfitLoss?: boolean;
  onExport?: () => void;
}

export interface LimitOrderProps extends CardProps {
  walletAddress?: string;
  chainId?: number;
  fromToken?: Token;
  toToken?: Token;
  openOrders?: LimitOrderData[];
  onOrderCreate?: (orderId: string) => void;
  onOrderCancel?: (orderId: string) => void;
}

export interface DCAStrategyProps extends CardProps {
  walletAddress?: string;
  chainId?: number;
  fromToken?: Token;
  toToken?: Token;
  strategies?: DCAStrategyData[];
  onStrategyCreate?: (strategyId: string) => void;
  onStrategyPause?: (strategyId: string) => void;
}

export interface SlippageSettingsProps extends CardProps {
  defaultSlippage?: number;
  onSlippageChange?: (config: SlippageConfig) => void;
  showWarnings?: boolean;
}

export interface GasSettingsProps extends CardProps {
  chainId?: number;
  currentGasPrice?: string;
  onGasChange?: (config: GasConfig) => void;
  showOptimizations?: boolean;
}
