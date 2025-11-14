/**
 * Chat Payment Service - Effect.ts-based in-chat payment service
 *
 * Provides type-safe access to:
 * - In-chat payments and tips
 * - Payment requests and invoices
 * - Bill splitting
 * - Escrow transactions
 * - Payment receipts
 */

import { Effect } from "effect";

// ============================================================================
// Types
// ============================================================================

export interface ChatPaymentParams {
  recipientId: string;
  recipientAddress: string;
  amount: string;
  token: string;
  message?: string;
  chatId: string;
}

export interface ChatPaymentResult {
  id: string;
  txHash: string;
  amount: string;
  token: string;
  recipient: string;
  sender: string;
  timestamp: number;
  receiptUrl: string;
}

export interface PaymentRequestParams {
  amount: string;
  token: string;
  description?: string;
  expiresIn?: number;
  chatId: string;
}

export interface PaymentRequest {
  id: string;
  amount: string;
  token: string;
  description?: string;
  qrCode: string;
  expiresAt?: number;
  status: "pending" | "paid" | "expired" | "cancelled";
  paidBy?: string;
  paidAt?: number;
  txHash?: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: string;
  total: string;
}

export interface InvoiceParams {
  items: InvoiceItem[];
  token: string;
  dueDate?: number;
  notes?: string;
  chatId: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  items: InvoiceItem[];
  subtotal: string;
  total: string;
  token: string;
  dueDate?: number;
  notes?: string;
  status: "pending" | "paid" | "overdue" | "cancelled";
  paidBy?: string;
  paidAt?: number;
  txHash?: string;
  createdAt: number;
}

export interface TipParams {
  recipientId: string;
  recipientAddress: string;
  amount: string;
  token: string;
  message?: string;
  chatId: string;
}

export interface TipResult {
  id: string;
  txHash: string;
  amount: string;
  token: string;
  recipient: string;
  sender: string;
  message?: string;
  timestamp: number;
  leaderboardPosition?: number;
}

export interface SplitParticipant {
  id: string;
  name: string;
  address: string;
  amount: string;
  paid: boolean;
  paidAt?: number;
  txHash?: string;
}

export interface BillSplitParams {
  totalAmount: string;
  token: string;
  participants: Array<{
    id: string;
    name: string;
    address: string;
    customAmount?: string;
  }>;
  description: string;
  chatId: string;
}

export interface BillSplit {
  id: string;
  totalAmount: string;
  token: string;
  participants: SplitParticipant[];
  description: string;
  createdAt: number;
  status: "pending" | "partial" | "complete";
  amountPaid: string;
  amountRemaining: string;
}

export interface EscrowParams {
  amount: string;
  token: string;
  recipient: string;
  terms: string;
  deadline?: number;
  milestones?: Array<{
    description: string;
    percentage: number;
  }>;
  chatId: string;
}

export interface Escrow {
  id: string;
  amount: string;
  token: string;
  sender: string;
  recipient: string;
  terms: string;
  deadline?: number;
  milestones?: Array<{
    description: string;
    percentage: number;
    released: boolean;
    releasedAt?: number;
  }>;
  status: "pending" | "active" | "released" | "disputed" | "cancelled";
  createdAt: number;
  txHash?: string;
  amountReleased: string;
  amountRemaining: string;
}

export interface Receipt {
  id: string;
  type: "payment" | "tip" | "invoice" | "split" | "escrow";
  from: string;
  fromEns?: string;
  to: string;
  toEns?: string;
  amount: string;
  token: string;
  usdValue?: string;
  txHash: string;
  explorerUrl: string;
  timestamp: number;
  confirmations: number;
  gasUsed?: string;
  gasCost?: string;
  description?: string;
  invoiceNumber?: string;
  pdfUrl?: string;
}

// ============================================================================
// Error Types
// ============================================================================

export type ChatPaymentError =
  | { _tag: "InvalidRecipient"; recipientId: string }
  | { _tag: "InvalidAmount"; amount: string }
  | { _tag: "InsufficientBalance"; required: string; available: string }
  | { _tag: "PaymentExpired"; requestId: string }
  | { _tag: "InvoiceNotFound"; invoiceId: string }
  | { _tag: "ParticipantNotFound"; participantId: string }
  | { _tag: "EscrowNotActive"; escrowId: string }
  | { _tag: "TransactionFailed"; message: string }
  | { _tag: "NetworkError"; message: string };

// ============================================================================
// Helper Functions
// ============================================================================

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function generateQRCode(data: string): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(data)}`;
}

function generateInvoiceNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const random = Math.random().toString(36).substr(2, 6).toUpperCase();
  return `INV-${year}${month}-${random}`;
}

function calculateSplitAmount(total: string, participantCount: number): string {
  return (parseFloat(total) / participantCount).toFixed(6);
}

function validateAmount(amount: string): Effect.Effect<string, ChatPaymentError> {
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

// ============================================================================
// Mock Mode
// ============================================================================

const MOCK_MODE = true;

// ============================================================================
// Service Functions
// ============================================================================

/**
 * Send payment in chat
 */
export function sendChatPayment(
  params: ChatPaymentParams
): Effect.Effect<ChatPaymentResult, ChatPaymentError> {
  return Effect.gen(function* () {
    yield* validateAmount(params.amount);

    if (MOCK_MODE) {
      yield* Effect.sleep("1 second");
      const txHash = `0x${Math.random().toString(16).substr(2, 64)}`;
      return {
        id: generateId("chat_pay"),
        txHash,
        amount: params.amount,
        token: params.token,
        recipient: params.recipientAddress,
        sender: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
        timestamp: Date.now(),
        receiptUrl: `/receipt/${txHash}`,
      };
    }

    return yield* Effect.fail({
      _tag: "NetworkError",
      message: "Not implemented",
    });
  });
}

/**
 * Create payment request
 */
export function createPaymentRequest(
  params: PaymentRequestParams
): Effect.Effect<PaymentRequest, ChatPaymentError> {
  return Effect.gen(function* () {
    yield* validateAmount(params.amount);

    const id = generateId("req");
    const expiresAt = params.expiresIn ? Date.now() + params.expiresIn : undefined;
    const qrCode = generateQRCode(`payment:${id}:${params.amount}:${params.token}`);

    return {
      id,
      amount: params.amount,
      token: params.token,
      description: params.description,
      qrCode,
      expiresAt,
      status: "pending",
    };
  });
}

/**
 * Pay a payment request
 */
export function payRequest(
  requestId: string,
  payerAddress: string
): Effect.Effect<PaymentRequest, ChatPaymentError> {
  return Effect.gen(function* () {
    if (MOCK_MODE) {
      yield* Effect.sleep("1 second");
      const txHash = `0x${Math.random().toString(16).substr(2, 64)}`;
      return {
        id: requestId,
        amount: "10.00",
        token: "USDC",
        qrCode: generateQRCode(`payment:${requestId}`),
        status: "paid",
        paidBy: payerAddress,
        paidAt: Date.now(),
        txHash,
      };
    }

    return yield* Effect.fail({
      _tag: "NetworkError",
      message: "Not implemented",
    });
  });
}

/**
 * Create invoice
 */
export function createInvoice(
  params: InvoiceParams
): Effect.Effect<Invoice, ChatPaymentError> {
  return Effect.gen(function* () {
    const subtotal = params.items.reduce(
      (sum, item) => sum + parseFloat(item.total),
      0
    ).toFixed(2);

    return {
      id: generateId("inv"),
      invoiceNumber: generateInvoiceNumber(),
      items: params.items,
      subtotal,
      total: subtotal,
      token: params.token,
      dueDate: params.dueDate,
      notes: params.notes,
      status: "pending",
      createdAt: Date.now(),
    };
  });
}

/**
 * Pay invoice
 */
export function payInvoice(
  invoiceId: string,
  payerAddress: string
): Effect.Effect<Invoice, ChatPaymentError> {
  return Effect.gen(function* () {
    if (MOCK_MODE) {
      yield* Effect.sleep("1.5 seconds");
      const txHash = `0x${Math.random().toString(16).substr(2, 64)}`;
      return {
        id: invoiceId,
        invoiceNumber: generateInvoiceNumber(),
        items: [],
        subtotal: "100.00",
        total: "100.00",
        token: "USDC",
        status: "paid",
        paidBy: payerAddress,
        paidAt: Date.now(),
        txHash,
        createdAt: Date.now() - 86400000,
      };
    }

    return yield* Effect.fail({
      _tag: "NetworkError",
      message: "Not implemented",
    });
  });
}

/**
 * Send tip
 */
export function sendTip(
  params: TipParams
): Effect.Effect<TipResult, ChatPaymentError> {
  return Effect.gen(function* () {
    yield* validateAmount(params.amount);

    if (MOCK_MODE) {
      yield* Effect.sleep("800 millis");
      const txHash = `0x${Math.random().toString(16).substr(2, 64)}`;
      return {
        id: generateId("tip"),
        txHash,
        amount: params.amount,
        token: params.token,
        recipient: params.recipientAddress,
        sender: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
        message: params.message,
        timestamp: Date.now(),
        leaderboardPosition: Math.floor(Math.random() * 10) + 1,
      };
    }

    return yield* Effect.fail({
      _tag: "NetworkError",
      message: "Not implemented",
    });
  });
}

/**
 * Create bill split
 */
export function createBillSplit(
  params: BillSplitParams
): Effect.Effect<BillSplit, ChatPaymentError> {
  return Effect.gen(function* () {
    yield* validateAmount(params.totalAmount);

    const splitAmount = calculateSplitAmount(
      params.totalAmount,
      params.participants.length
    );

    const participants: SplitParticipant[] = params.participants.map((p) => ({
      id: p.id,
      name: p.name,
      address: p.address,
      amount: p.customAmount || splitAmount,
      paid: false,
    }));

    return {
      id: generateId("split"),
      totalAmount: params.totalAmount,
      token: params.token,
      participants,
      description: params.description,
      createdAt: Date.now(),
      status: "pending",
      amountPaid: "0.00",
      amountRemaining: params.totalAmount,
    };
  });
}

/**
 * Pay split share
 */
export function paySplitShare(
  splitId: string,
  participantId: string
): Effect.Effect<BillSplit, ChatPaymentError> {
  return Effect.gen(function* () {
    if (MOCK_MODE) {
      yield* Effect.sleep("1 second");
      const txHash = `0x${Math.random().toString(16).substr(2, 64)}`;

      const participants: SplitParticipant[] = [
        {
          id: participantId,
          name: "Alice",
          address: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
          amount: "25.00",
          paid: true,
          paidAt: Date.now(),
          txHash,
        },
      ];

      return {
        id: splitId,
        totalAmount: "100.00",
        token: "USDC",
        participants,
        description: "Dinner split",
        createdAt: Date.now() - 3600000,
        status: "partial",
        amountPaid: "25.00",
        amountRemaining: "75.00",
      };
    }

    return yield* Effect.fail({
      _tag: "NetworkError",
      message: "Not implemented",
    });
  });
}

/**
 * Create escrow
 */
export function createEscrow(
  params: EscrowParams
): Effect.Effect<Escrow, ChatPaymentError> {
  return Effect.gen(function* () {
    yield* validateAmount(params.amount);

    if (MOCK_MODE) {
      yield* Effect.sleep("1.5 seconds");
      const txHash = `0x${Math.random().toString(16).substr(2, 64)}`;

      return {
        id: generateId("escrow"),
        amount: params.amount,
        token: params.token,
        sender: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
        recipient: params.recipient,
        terms: params.terms,
        deadline: params.deadline,
        milestones: params.milestones?.map(m => ({
          ...m,
          released: false,
        })),
        status: "active",
        createdAt: Date.now(),
        txHash,
        amountReleased: "0.00",
        amountRemaining: params.amount,
      };
    }

    return yield* Effect.fail({
      _tag: "NetworkError",
      message: "Not implemented",
    });
  });
}

/**
 * Release escrow funds
 */
export function releaseEscrow(
  escrowId: string,
  amount?: string
): Effect.Effect<Escrow, ChatPaymentError> {
  return Effect.gen(function* () {
    if (MOCK_MODE) {
      yield* Effect.sleep("1 second");
      const releaseAmount = amount || "100.00";

      return {
        id: escrowId,
        amount: "100.00",
        token: "USDC",
        sender: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
        recipient: "0x1234567890123456789012345678901234567890",
        terms: "Complete project deliverables",
        status: "released",
        createdAt: Date.now() - 86400000,
        amountReleased: releaseAmount,
        amountRemaining: "0.00",
      };
    }

    return yield* Effect.fail({
      _tag: "NetworkError",
      message: "Not implemented",
    });
  });
}

/**
 * Generate payment receipt
 */
export function generateReceipt(
  txHash: string,
  type: Receipt["type"]
): Effect.Effect<Receipt, ChatPaymentError> {
  return Effect.gen(function* () {
    if (MOCK_MODE) {
      yield* Effect.sleep("500 millis");

      return {
        id: generateId("receipt"),
        type,
        from: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
        fromEns: "alice.eth",
        to: "0x1234567890123456789012345678901234567890",
        toEns: "bob.eth",
        amount: "10.00",
        token: "USDC",
        usdValue: "10.00",
        txHash,
        explorerUrl: `https://etherscan.io/tx/${txHash}`,
        timestamp: Date.now(),
        confirmations: 12,
        gasUsed: "65000",
        gasCost: "0.0025",
        description: "Payment via chat",
        pdfUrl: `/receipt/${txHash}.pdf`,
      };
    }

    return yield* Effect.fail({
      _tag: "NetworkError",
      message: "Not implemented",
    });
  });
}

/**
 * Get tip leaderboard
 */
export function getTipLeaderboard(
  chatId: string,
  period: "day" | "week" | "month" | "all" = "all"
): Effect.Effect<Array<{ userId: string; userName: string; totalTips: string; rank: number }>, ChatPaymentError> {
  return Effect.gen(function* () {
    if (MOCK_MODE) {
      yield* Effect.sleep("300 millis");

      return [
        { userId: "user1", userName: "Alice", totalTips: "125.50", rank: 1 },
        { userId: "user2", userName: "Bob", totalTips: "89.25", rank: 2 },
        { userId: "user3", userName: "Charlie", totalTips: "67.00", rank: 3 },
        { userId: "user4", userName: "Diana", totalTips: "45.75", rank: 4 },
        { userId: "user5", userName: "Eve", totalTips: "23.00", rank: 5 },
      ];
    }

    return yield* Effect.fail({
      _tag: "NetworkError",
      message: "Not implemented",
    });
  });
}
