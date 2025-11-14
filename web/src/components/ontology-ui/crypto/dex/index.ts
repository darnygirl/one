/**
 * DEX Trading Components
 *
 * Decentralized exchange components for token swaps, limit orders,
 * DCA strategies, and transaction settings.
 *
 * @module crypto/dex
 */

export { TokenSwap } from "./TokenSwap";
export { SwapQuote } from "./SwapQuote";
export { SwapHistory } from "./SwapHistory";
export { LimitOrder } from "./LimitOrder";
export { DCAStrategy } from "./DCAStrategy";
export { SlippageSettings } from "./SlippageSettings";
export { GasSettings } from "./GasSettings";

export type {
  Token,
  SwapRoute,
  SwapQuoteData,
  SwapTransaction,
  LimitOrderData,
  DCAStrategyData,
  SlippageConfig,
  GasConfig,
  TokenSwapProps,
  SwapQuoteProps,
  SwapHistoryProps,
  LimitOrderProps,
  DCAStrategyProps,
  SlippageSettingsProps,
  GasSettingsProps,
} from "./types";
