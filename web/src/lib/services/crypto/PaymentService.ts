/**
 * Payment Service - Effect.ts-based crypto payment service
 *
 * Provides type-safe access to:
 * - Token and native currency sending
 * - Payment requests and links
 * - Batch payments
 * - Recurring payments
 * - Gas estimation
 */

import { Effect } from "effect";

// ============================================================================
// Types
// ============================================================================

export interface SendTokenParams {
  tokenAddress: string;
  recipientAddress: string;
  amount: string;
  chainId: number;
}

export interface SendNativeParams {
  recipientAddress: string;
  amount: string;
  chainId: number;
  reserveGas?: boolean;
}

export interface PaymentRequest {
  id: string;
  address: string;
  amount?: string;
  currency?: string;
  qrCode: string;
  link: string;
  expiresAt?: number;
}

export interface PaymentLink {
  id: string;
  url: string;
  amount: string;
  currency: string;
  description?: string;
  expiresAt?: number;
  successUrl?: string;
  cancelUrl?: string;
  qrCode: string;
}

export interface BatchPayment {
  recipient: string;
  amount: string;
  memo?: string;
}

export interface BatchSendResult {
  txHash: string;
  successful: number;
  failed: number;
  payments: Array<{
    recipient: string;
    amount: string;
    status: "success" | "failed";
    error?: string;
  }>;
}

export interface RecurringPayment {
  id: string;
  recipient: string;
  amount: string;
  currency: string;
  frequency: "daily" | "weekly" | "monthly";
  startDate: number;
  endDate?: number;
  autoExecute: boolean;
  nextPayment: number;
  status: "active" | "paused" | "cancelled";
  history: PaymentHistory[];
}

export interface PaymentHistory {
  date: number;
  amount: string;
  txHash?: string;
  status: "pending" | "success" | "failed";
}

export interface GasEstimate {
  slow: {
    gasPrice: string;
    maxFeePerGas?: string;
    maxPriorityFeePerGas?: string;
    estimatedTime: number;
    usdCost: number;
  };
  average: {
    gasPrice: string;
    maxFeePerGas?: string;
    maxPriorityFeePerGas?: string;
    estimatedTime: number;
    usdCost: number;
  };
  fast: {
    gasPrice: string;
    maxFeePerGas?: string;
    maxPriorityFeePerGas?: string;
    estimatedTime: number;
    usdCost: number;
  };
  gasLimit: string;
  currentBaseFee?: string;
}

export interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  gasUsed: string;
  status: "pending" | "success" | "failed";
  timestamp: number;
  confirmations: number;
}

// ============================================================================
// Error Types
// ============================================================================

export type PaymentError =
  | { _tag: "InsufficientBalance"; required: string; available: string }
  | { _tag: "InvalidAddress"; address: string }
  | { _tag: "InvalidAmount"; amount: string }
  | { _tag: "GasEstimationFailed"; message: string }
  | { _tag: "TransactionFailed"; txHash: string; message: string }
  | { _tag: "NetworkError"; message: string }
  | { _tag: "UserRejected"; message: string }
  | { _tag: "ContractError"; message: string };

// ============================================================================
// Helper Functions
// ============================================================================

function validateAddress(address: string): Effect.Effect<string, PaymentError> {
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

function validateAmount(amount: string): Effect.Effect<string, PaymentError> {
  return Effect.gen(function* () {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return yield* Effect.fail({
        _tag: "InvalidAmount",
        amount,
      });
    }
    return amount;
  });
}

function generateQRCode(data: string): string {
  // In production, use a QR code library
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(data)}`;
}

function generateId(): string {
  return `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// ============================================================================
// Mock Data (for development)
// ============================================================================

const MOCK_MODE = true;

function generateMockGasEstimate(): GasEstimate {
  const baseFee = 20 + Math.random() * 50;
  const gasLimit = "21000";

  return {
    slow: {
      gasPrice: `${(baseFee * 0.8).toFixed(2)}`,
      maxFeePerGas: `${(baseFee * 0.8).toFixed(2)}`,
      maxPriorityFeePerGas: "1.0",
      estimatedTime: 180,
      usdCost: Number(((baseFee * 0.8 * 21000) / 1e9 * 2400).toFixed(2)),
    },
    average: {
      gasPrice: `${baseFee.toFixed(2)}`,
      maxFeePerGas: `${baseFee.toFixed(2)}`,
      maxPriorityFeePerGas: "1.5",
      estimatedTime: 60,
      usdCost: Number(((baseFee * 21000) / 1e9 * 2400).toFixed(2)),
    },
    fast: {
      gasPrice: `${(baseFee * 1.2).toFixed(2)}`,
      maxFeePerGas: `${(baseFee * 1.2).toFixed(2)}`,
      maxPriorityFeePerGas: "2.0",
      estimatedTime: 15,
      usdCost: Number(((baseFee * 1.2 * 21000) / 1e9 * 2400).toFixed(2)),
    },
    gasLimit,
    currentBaseFee: baseFee.toFixed(2),
  };
}

// ============================================================================
// Service Functions
// ============================================================================

/**
 * Send ERC-20/SPL tokens
 */
export function sendToken(
  params: SendTokenParams
): Effect.Effect<Transaction, PaymentError> {
  return Effect.gen(function* () {
    yield* validateAddress(params.recipientAddress);
    yield* validateAddress(params.tokenAddress);
    yield* validateAmount(params.amount);

    if (MOCK_MODE) {
      yield* Effect.sleep("1 second");
      return {
        hash: `0x${Math.random().toString(16).substr(2, 64)}`,
        from: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
        to: params.recipientAddress,
        value: params.amount,
        gasUsed: "65000",
        status: "success" as const,
        timestamp: Date.now(),
        confirmations: 12,
      };
    }

    // In production, use wagmi/viem to send transaction
    return yield* Effect.fail({
      _tag: "NetworkError",
      message: "Not implemented",
    });
  });
}

/**
 * Send native currency (ETH/SOL/MATIC)
 */
export function sendNative(
  params: SendNativeParams
): Effect.Effect<Transaction, PaymentError> {
  return Effect.gen(function* () {
    yield* validateAddress(params.recipientAddress);
    yield* validateAmount(params.amount);

    if (MOCK_MODE) {
      yield* Effect.sleep("1 second");
      return {
        hash: `0x${Math.random().toString(16).substr(2, 64)}`,
        from: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
        to: params.recipientAddress,
        value: params.amount,
        gasUsed: "21000",
        status: "success" as const,
        timestamp: Date.now(),
        confirmations: 12,
      };
    }

    return yield* Effect.fail({
      _tag: "NetworkError",
      message: "Not implemented",
    });
  });
}

/**
 * Generate payment request
 */
export function createPaymentRequest(
  address: string,
  amount?: string,
  currency?: string,
  expiresIn?: number
): Effect.Effect<PaymentRequest, PaymentError> {
  return Effect.gen(function* () {
    yield* validateAddress(address);

    const id = generateId();
    const expiresAt = expiresIn ? Date.now() + expiresIn : undefined;
    const paymentUrl = `ethereum:${address}${amount ? `@1?value=${amount}` : ""}`;

    return {
      id,
      address,
      amount,
      currency: currency || "ETH",
      qrCode: generateQRCode(paymentUrl),
      link: paymentUrl,
      expiresAt,
    };
  });
}

/**
 * Create shareable payment link
 */
export function createPaymentLink(
  amount: string,
  currency: string,
  description?: string,
  expiresIn?: number,
  successUrl?: string,
  cancelUrl?: string
): Effect.Effect<PaymentLink, PaymentError> {
  return Effect.gen(function* () {
    yield* validateAmount(amount);

    const id = generateId();
    const expiresAt = expiresIn ? Date.now() + expiresIn : undefined;
    const url = `https://pay.example.com/${id}`;

    return {
      id,
      url,
      amount,
      currency,
      description,
      expiresAt,
      successUrl,
      cancelUrl,
      qrCode: generateQRCode(url),
    };
  });
}

/**
 * Send to multiple addresses (batch send)
 */
export function batchSend(
  payments: BatchPayment[],
  chainId: number
): Effect.Effect<BatchSendResult, PaymentError> {
  return Effect.gen(function* () {
    // Validate all addresses and amounts
    for (const payment of payments) {
      yield* validateAddress(payment.recipient);
      yield* validateAmount(payment.amount);
    }

    if (MOCK_MODE) {
      yield* Effect.sleep("2 seconds");
      return {
        txHash: `0x${Math.random().toString(16).substr(2, 64)}`,
        successful: payments.length,
        failed: 0,
        payments: payments.map((p) => ({
          recipient: p.recipient,
          amount: p.amount,
          status: "success" as const,
        })),
      };
    }

    return yield* Effect.fail({
      _tag: "NetworkError",
      message: "Not implemented",
    });
  });
}

/**
 * Create recurring payment
 */
export function createRecurringPayment(
  recipient: string,
  amount: string,
  currency: string,
  frequency: "daily" | "weekly" | "monthly",
  startDate: number,
  endDate?: number,
  autoExecute: boolean = false
): Effect.Effect<RecurringPayment, PaymentError> {
  return Effect.gen(function* () {
    yield* validateAddress(recipient);
    yield* validateAmount(amount);

    const id = generateId();
    const now = Date.now();
    const nextPayment = startDate > now ? startDate : now;

    return {
      id,
      recipient,
      amount,
      currency,
      frequency,
      startDate,
      endDate,
      autoExecute,
      nextPayment,
      status: "active",
      history: [],
    };
  });
}

/**
 * Estimate gas for transaction
 */
export function estimateGas(
  to: string,
  value: string,
  data?: string,
  chainId: number = 1
): Effect.Effect<GasEstimate, PaymentError> {
  return Effect.gen(function* () {
    yield* validateAddress(to);

    if (MOCK_MODE) {
      yield* Effect.sleep("500 millis");
      return generateMockGasEstimate();
    }

    return yield* Effect.fail({
      _tag: "GasEstimationFailed",
      message: "Not implemented",
    });
  });
}

/**
 * Execute recurring payment
 */
export function executeRecurringPayment(
  payment: RecurringPayment
): Effect.Effect<Transaction, PaymentError> {
  return Effect.gen(function* () {
    const tx = yield* sendNative({
      recipientAddress: payment.recipient,
      amount: payment.amount,
      chainId: 1,
    });

    return tx;
  });
}

/**
 * Cancel recurring payment
 */
export function cancelRecurringPayment(
  paymentId: string
): Effect.Effect<RecurringPayment, PaymentError> {
  return Effect.gen(function* () {
    if (MOCK_MODE) {
      yield* Effect.sleep("500 millis");
      return {
        id: paymentId,
        recipient: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
        amount: "0.1",
        currency: "ETH",
        frequency: "monthly" as const,
        startDate: Date.now(),
        autoExecute: false,
        nextPayment: Date.now(),
        status: "cancelled" as const,
        history: [],
      };
    }

    return yield* Effect.fail({
      _tag: "NetworkError",
      message: "Not implemented",
    });
  });
}

/**
 * Resolve ENS name to address
 */
export function resolveENS(
  ensName: string
): Effect.Effect<string, PaymentError> {
  return Effect.gen(function* () {
    if (!ensName.endsWith(".eth")) {
      return yield* Effect.fail({
        _tag: "InvalidAddress",
        address: ensName,
      });
    }

    if (MOCK_MODE) {
      yield* Effect.sleep("500 millis");
      return "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb";
    }

    return yield* Effect.fail({
      _tag: "NetworkError",
      message: "Not implemented",
    });
  });
}
