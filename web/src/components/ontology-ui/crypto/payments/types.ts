/**
 * Crypto Payment Component Types
 * Types for payment and transaction components
 */

import type { CardProps } from "../../types";

// ============================================================================
// Payment Types
// ============================================================================

export interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  balance?: string;
  usdValue?: number;
  icon?: string;
}

export interface PaymentRecipient {
  address: string;
  ensName?: string;
  amount: string;
  memo?: string;
}

export interface GasPriceOption {
  speed: "slow" | "average" | "fast";
  gasPrice: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
  estimatedTime: number;
  usdCost: number;
}

export interface RecurringPaymentSchedule {
  frequency: "daily" | "weekly" | "monthly";
  startDate: number;
  endDate?: number;
  nextPayment: number;
}

// ============================================================================
// Component Props
// ============================================================================

export interface SendTokenProps extends CardProps {
  walletAddress?: string;
  chainId?: number;
  tokens?: Token[];
  onSend?: (txHash: string) => void;
  onError?: (error: string) => void;
}

export interface SendNativeProps extends CardProps {
  walletAddress?: string;
  chainId?: number;
  balance?: string;
  symbol?: string;
  onSend?: (txHash: string) => void;
  onError?: (error: string) => void;
}

export interface ReceivePaymentProps extends CardProps {
  address: string;
  chainId?: number;
  currencies?: string[];
  showQR?: boolean;
  onCopy?: () => void;
}

export interface PaymentLinkProps extends CardProps {
  defaultAmount?: string;
  defaultCurrency?: string;
  onLinkCreated?: (link: string) => void;
}

export interface BatchSendProps extends CardProps {
  walletAddress?: string;
  chainId?: number;
  maxRecipients?: number;
  onSend?: (txHash: string) => void;
  onError?: (error: string) => void;
}

export interface RecurringPaymentProps extends CardProps {
  walletAddress?: string;
  chainId?: number;
  onSchedule?: (paymentId: string) => void;
  onCancel?: (paymentId: string) => void;
}

export interface GasEstimatorProps extends CardProps {
  to?: string;
  value?: string;
  chainId?: number;
  showTrends?: boolean;
  showOptimizations?: boolean;
}

// ============================================================================
// Transaction Types
// ============================================================================

export interface TransactionStatus {
  hash: string;
  status: "pending" | "success" | "failed";
  confirmations: number;
  timestamp: number;
}

export interface PaymentConfirmation {
  recipient: string;
  amount: string;
  currency: string;
  gasUsed?: string;
  totalCost?: string;
}
