/**
 * Crypto Payment & Checkout Types
 * Types for crypto payment processing components
 */

import type { CardProps } from "../../types";

// ============================================================================
// Payment Types
// ============================================================================

export type CryptoPaymentStatus =
  | "pending"
  | "confirming"
  | "confirmed"
  | "expired"
  | "failed"
  | "refunded";

export type CryptoCurrency = "ETH" | "USDC" | "USDT" | "DAI" | "MATIC" | "BTC";

export interface CryptoPrice {
  currency: CryptoCurrency;
  amount: string;
  usdValue: number;
  network: string;
  address: string;
}

export interface PaymentRequest {
  id: string;
  productName: string;
  productDescription?: string;
  usdAmount: number;
  cryptoPrices: CryptoPrice[];
  createdAt: number;
  expiresAt: number;
  status: CryptoPaymentStatus;
  paymentAddress?: string;
  selectedCurrency?: CryptoCurrency;
}

export interface PaymentConfirmation {
  paymentId: string;
  transactionHash: string;
  amount: string;
  currency: CryptoCurrency;
  status: CryptoPaymentStatus;
  confirmations: number;
  timestamp: number;
  receiptUrl?: string;
}

// ============================================================================
// Invoice Types
// ============================================================================

export type InvoiceStatus = "draft" | "pending" | "paid" | "overdue" | "cancelled";

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface CryptoInvoice {
  id: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  tax?: number;
  taxRate?: number;
  total: number;
  currency: "USD" | "EUR" | "GBP";
  cryptoPrices: CryptoPrice[];
  dueDate: number;
  issuedAt: number;
  paidAt?: number;
  paymentAddress?: string;
  transactionHash?: string;
  notes?: string;
  customerName?: string;
  customerEmail?: string;
}

export interface InvoicePaymentHistory {
  id: string;
  invoiceId: string;
  amount: string;
  currency: CryptoCurrency;
  transactionHash: string;
  timestamp: number;
  confirmations: number;
  status: CryptoPaymentStatus;
}

// ============================================================================
// Subscription Types
// ============================================================================

export type SubscriptionInterval = "daily" | "weekly" | "monthly" | "yearly";
export type SubscriptionStatus = "active" | "paused" | "cancelled" | "expired" | "past_due";

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  amount: number;
  currency: "USD" | "EUR" | "GBP";
  interval: SubscriptionInterval;
  features: string[];
}

export interface CryptoSubscription {
  id: string;
  planId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  currentPeriodStart: number;
  currentPeriodEnd: number;
  nextBillingDate?: number;
  paymentMethod: {
    type: "crypto";
    currency: CryptoCurrency;
    network: string;
  };
  cancelAtPeriodEnd: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface SubscriptionBillingHistory {
  id: string;
  subscriptionId: string;
  amount: string;
  currency: CryptoCurrency;
  transactionHash: string;
  status: "success" | "failed" | "pending";
  billingDate: number;
  paidAt?: number;
}

// ============================================================================
// Refund Types
// ============================================================================

export type RefundStatus = "pending" | "processing" | "completed" | "failed" | "cancelled";
export type RefundReason =
  | "duplicate"
  | "fraudulent"
  | "customer_request"
  | "defective_product"
  | "not_as_described"
  | "other";

export interface RefundRequest {
  paymentId: string;
  amount: string;
  currency: CryptoCurrency;
  reason: RefundReason;
  notes?: string;
  refundAddress: string;
}

export interface CryptoRefund {
  id: string;
  paymentId: string;
  amount: string;
  currency: CryptoCurrency;
  status: RefundStatus;
  reason: RefundReason;
  notes?: string;
  refundAddress: string;
  transactionHash?: string;
  processedAt?: number;
  createdAt: number;
}

// ============================================================================
// Component Props
// ============================================================================

export interface CheckoutWidgetProps extends CardProps {
  productName: string;
  productDescription?: string;
  productImage?: string;
  usdAmount: number;
  onPaymentComplete?: (confirmation: PaymentConfirmation) => void;
  onExpire?: () => void;
  expiryMinutes?: number;
  supportedCurrencies?: CryptoCurrency[];
}

export interface PaymentProcessorProps extends CardProps {
  paymentRequest: PaymentRequest;
  onConfirmation?: (confirmation: PaymentConfirmation) => void;
  onStatusChange?: (status: CryptoPaymentStatus) => void;
  webhookUrl?: string;
  confirmationsRequired?: number;
}

export interface PaymentConfirmationProps extends CardProps {
  confirmation: PaymentConfirmation;
  onDownloadReceipt?: () => void;
  onClose?: () => void;
  showSupportInfo?: boolean;
  supportEmail?: string;
}

export interface InvoiceGeneratorProps extends CardProps {
  onGenerate?: (invoice: CryptoInvoice) => void;
  defaultCurrency?: "USD" | "EUR" | "GBP";
  defaultTaxRate?: number;
  customerInfo?: {
    name: string;
    email: string;
  };
}

export interface InvoicePaymentProps extends CardProps {
  invoice: CryptoInvoice;
  onPayment?: (payment: InvoicePaymentHistory) => void;
  allowPartialPayment?: boolean;
  showHistory?: boolean;
}

export interface RefundProcessorProps extends CardProps {
  paymentId: string;
  maxAmount: string;
  currency: CryptoCurrency;
  onRefund?: (refund: CryptoRefund) => void;
  onCancel?: () => void;
  allowPartialRefund?: boolean;
}

export interface SubscriptionPaymentProps extends CardProps {
  plans: SubscriptionPlan[];
  currentSubscription?: CryptoSubscription;
  onSubscribe?: (subscription: CryptoSubscription) => void;
  onCancel?: (subscriptionId: string) => void;
  onPause?: (subscriptionId: string) => void;
  showBillingHistory?: boolean;
}

// ============================================================================
// Webhook Types
// ============================================================================

export type WebhookEventType =
  | "payment.created"
  | "payment.confirmed"
  | "payment.failed"
  | "payment.expired"
  | "invoice.created"
  | "invoice.paid"
  | "invoice.overdue"
  | "subscription.created"
  | "subscription.renewed"
  | "subscription.cancelled"
  | "refund.created"
  | "refund.completed";

export interface WebhookPayload {
  event: WebhookEventType;
  data: PaymentRequest | CryptoInvoice | CryptoSubscription | CryptoRefund;
  timestamp: number;
  signature: string;
}
