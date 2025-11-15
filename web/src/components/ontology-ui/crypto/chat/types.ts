/**
 * Chat Payment Component Types
 * Types for in-chat payment components
 */

import type { CardProps } from "../../types";

// ============================================================================
// Chat Payment Types
// ============================================================================

export interface ChatUser {
  id: string;
  name: string;
  address: string;
  avatar?: string;
  ensName?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  content: string;
  timestamp: number;
  type: "text" | "payment" | "request" | "invoice" | "tip" | "split" | "escrow";
  paymentData?: any;
}

export interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  balance?: string;
  usdValue?: number;
  icon?: string;
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: string;
  total: string;
}

export interface Milestone {
  id: string;
  description: string;
  percentage: number;
  released: boolean;
  releasedAt?: number;
}

// ============================================================================
// Component Props
// ============================================================================

export interface ChatPaymentProps extends CardProps {
  chatId: string;
  recipientId?: string;
  recipientName?: string;
  recipientAddress?: string;
  tokens?: Token[];
  defaultToken?: string;
  defaultAmount?: string;
  onSend?: (txHash: string) => void;
  onError?: (error: string) => void;
}

export interface ChatRequestProps extends CardProps {
  chatId: string;
  tokens?: Token[];
  defaultToken?: string;
  defaultAmount?: string;
  onRequestCreated?: (requestId: string) => void;
  onPaymentReceived?: (txHash: string) => void;
}

export interface ChatInvoiceProps extends CardProps {
  chatId: string;
  tokens?: Token[];
  defaultToken?: string;
  onInvoiceCreated?: (invoiceId: string) => void;
  onPaymentReceived?: (txHash: string) => void;
}

export interface ChatTipProps extends CardProps {
  chatId: string;
  recipientId: string;
  recipientName: string;
  recipientAddress: string;
  tokens?: Token[];
  defaultToken?: string;
  quickAmounts?: string[];
  showLeaderboard?: boolean;
  onTipSent?: (txHash: string) => void;
  onError?: (error: string) => void;
}

export interface ChatSplitProps extends CardProps {
  chatId: string;
  participants: ChatUser[];
  tokens?: Token[];
  defaultToken?: string;
  onSplitCreated?: (splitId: string) => void;
  onPaymentMade?: (participantId: string, txHash: string) => void;
}

export interface ChatEscrowProps extends CardProps {
  chatId: string;
  recipientId: string;
  recipientName: string;
  recipientAddress: string;
  tokens?: Token[];
  defaultToken?: string;
  onEscrowCreated?: (escrowId: string) => void;
  onFundsReleased?: (amount: string) => void;
}

export interface ChatReceiptProps extends CardProps {
  txHash: string;
  type: "payment" | "tip" | "invoice" | "split" | "escrow";
  from: string;
  fromEns?: string;
  to: string;
  toEns?: string;
  amount: string;
  token: string;
  usdValue?: string;
  timestamp: number;
  confirmations?: number;
  gasUsed?: string;
  gasCost?: string;
  description?: string;
  invoiceNumber?: string;
  showDownload?: boolean;
  onDownload?: () => void;
}

// ============================================================================
// State Types
// ============================================================================

export interface PaymentRequestState {
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

export interface InvoiceState {
  id: string;
  invoiceNumber: string;
  items: InvoiceLineItem[];
  subtotal: string;
  total: string;
  token: string;
  dueDate?: number;
  notes?: string;
  status: "pending" | "paid" | "overdue" | "cancelled";
  paidBy?: string;
  paidAt?: number;
  txHash?: string;
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

export interface BillSplitState {
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

export interface EscrowState {
  id: string;
  amount: string;
  token: string;
  sender: string;
  recipient: string;
  terms: string;
  deadline?: number;
  milestones?: Milestone[];
  status: "pending" | "active" | "released" | "disputed" | "cancelled";
  createdAt: number;
  txHash?: string;
  amountReleased: string;
  amountRemaining: string;
}

export interface TipLeaderboard {
  userId: string;
  userName: string;
  totalTips: string;
  rank: number;
}
