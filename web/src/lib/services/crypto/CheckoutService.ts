/**
 * CheckoutService - Effect.ts Crypto Payment Integration
 *
 * Provides crypto payment processing capabilities including:
 * - Payment request creation with multi-currency support
 * - Real-time payment monitoring
 * - Invoice generation and management
 * - Subscription billing
 * - Refund processing
 * - Webhook signature verification
 *
 * @example
 * ```ts
 * import { Effect } from "effect";
 * import { CheckoutService } from "@/lib/services/crypto/CheckoutService";
 *
 * const program = Effect.gen(function* () {
 *   const checkout = yield* CheckoutService;
 *
 *   // Create payment request
 *   const payment = yield* checkout.createPayment({
 *     productName: "Premium Plan",
 *     usdAmount: 99.99,
 *     currencies: ["ETH", "USDC"],
 *     expiryMinutes: 15
 *   });
 * });
 * ```
 */

import { Effect, Context } from "effect";
import type {
  PaymentRequest,
  PaymentConfirmation,
  CryptoInvoice,
  InvoiceLineItem,
  CryptoSubscription,
  SubscriptionPlan,
  CryptoRefund,
  RefundRequest,
  CryptoCurrency,
  CryptoPaymentStatus,
  WebhookPayload,
} from "@/components/ontology-ui/crypto/checkout/types";

// ============================================================================
// ERROR TYPES
// ============================================================================

export class PaymentCreationError {
  readonly _tag = "PaymentCreationError";
  constructor(
    readonly message: string,
    readonly cause?: unknown
  ) {}
}

export class PaymentMonitorError {
  readonly _tag = "PaymentMonitorError";
  constructor(
    readonly paymentId: string,
    readonly message: string,
    readonly cause?: unknown
  ) {}
}

export class InvoiceError {
  readonly _tag = "InvoiceError";
  constructor(
    readonly message: string,
    readonly cause?: unknown
  ) {}
}

export class SubscriptionError {
  readonly _tag = "SubscriptionError";
  constructor(
    readonly message: string,
    readonly cause?: unknown
  ) {}
}

export class RefundError {
  readonly _tag = "RefundError";
  constructor(
    readonly paymentId: string,
    readonly message: string,
    readonly cause?: unknown
  ) {}
}

export class WebhookError {
  readonly _tag = "WebhookError";
  constructor(
    readonly message: string,
    readonly cause?: unknown
  ) {}
}

export class CryptoNetworkError {
  readonly _tag = "CryptoNetworkError";
  constructor(
    readonly message: string,
    readonly cause?: unknown
  ) {}
}

export type CheckoutError =
  | PaymentCreationError
  | PaymentMonitorError
  | InvoiceError
  | SubscriptionError
  | RefundError
  | WebhookError
  | CryptoNetworkError;

// ============================================================================
// TYPES
// ============================================================================

export interface PaymentParams {
  productName: string;
  productDescription?: string;
  usdAmount: number;
  currencies?: CryptoCurrency[];
  expiryMinutes?: number;
  metadata?: Record<string, string>;
}

export interface InvoiceParams {
  lineItems: InvoiceLineItem[];
  taxRate?: number;
  dueDate: number;
  customerName?: string;
  customerEmail?: string;
  notes?: string;
  currencies?: CryptoCurrency[];
}

export interface SubscriptionParams {
  planId: string;
  currency: CryptoCurrency;
  network: string;
  startDate?: number;
}

export interface CheckoutConfig {
  networkEndpoints: Record<string, string>;
  confirmationsRequired?: number;
  webhookSecret?: string;
  expiryMinutes?: number;
}

// ============================================================================
// SERVICE INTERFACE
// ============================================================================

export interface ICheckoutService {
  /**
   * Create a payment request
   *
   * Generates a crypto payment request with multi-currency support
   *
   * @param params - Payment parameters
   * @returns Payment request with addresses for each currency
   */
  createPayment: (params: PaymentParams) => Effect.Effect<PaymentRequest, CheckoutError>;

  /**
   * Monitor payment status
   *
   * Monitors blockchain for payment confirmation
   *
   * @param paymentId - Payment request ID
   * @returns Payment confirmation when detected
   */
  monitorPayment: (
    paymentId: string
  ) => Effect.Effect<PaymentConfirmation, CheckoutError>;

  /**
   * Generate invoice
   *
   * Creates a crypto invoice with line items and pricing
   *
   * @param params - Invoice parameters
   * @returns Generated invoice
   */
  generateInvoice: (params: InvoiceParams) => Effect.Effect<CryptoInvoice, CheckoutError>;

  /**
   * Create subscription
   *
   * Sets up recurring crypto payments
   *
   * @param params - Subscription parameters
   * @returns Created subscription
   */
  createSubscription: (
    params: SubscriptionParams
  ) => Effect.Effect<CryptoSubscription, CheckoutError>;

  /**
   * Cancel subscription
   *
   * Cancels a subscription at period end or immediately
   *
   * @param subscriptionId - Subscription ID
   * @param immediately - Cancel immediately or at period end
   * @returns Updated subscription
   */
  cancelSubscription: (
    subscriptionId: string,
    immediately?: boolean
  ) => Effect.Effect<CryptoSubscription, CheckoutError>;

  /**
   * Process refund
   *
   * Refunds a crypto payment partially or fully
   *
   * @param request - Refund request
   * @returns Created refund
   */
  processRefund: (request: RefundRequest) => Effect.Effect<CryptoRefund, CheckoutError>;

  /**
   * Verify webhook
   *
   * Validates webhook signature and payload
   *
   * @param payload - Webhook payload
   * @param signature - Webhook signature
   * @returns Verified webhook data
   */
  verifyWebhook: (
    payload: string,
    signature: string
  ) => Effect.Effect<WebhookPayload, CheckoutError>;
}

// ============================================================================
// SERVICE IMPLEMENTATION
// ============================================================================

export class CheckoutServiceImpl implements ICheckoutService {
  constructor(private readonly config: CheckoutConfig) {}

  createPayment = (params: PaymentParams): Effect.Effect<PaymentRequest, CheckoutError> =>
    Effect.gen(this, function* () {
      try {
        const currencies = params.currencies || ["ETH", "USDC", "USDT"];
        const expiryMinutes = params.expiryMinutes || this.config.expiryMinutes || 15;

        // Generate payment addresses for each currency
        const cryptoPrices = yield* Effect.all(
          currencies.map((currency) =>
            this.generateCryptoPrice(currency, params.usdAmount)
          )
        );

        const paymentRequest: PaymentRequest = {
          id: this.generateId("pay"),
          productName: params.productName,
          productDescription: params.productDescription,
          usdAmount: params.usdAmount,
          cryptoPrices,
          createdAt: Date.now(),
          expiresAt: Date.now() + expiryMinutes * 60 * 1000,
          status: "pending",
        };

        return paymentRequest;
      } catch (error) {
        return yield* Effect.fail(
          new PaymentCreationError(
            error instanceof Error ? error.message : "Payment creation failed",
            error
          )
        );
      }
    });

  monitorPayment = (
    paymentId: string
  ): Effect.Effect<PaymentConfirmation, CheckoutError> =>
    Effect.gen(this, function* () {
      try {
        // Mock monitoring - replace with actual blockchain monitoring
        // In production, use:
        // - ethers/viem for Ethereum networks
        // - @solana/web3.js for Solana
        // - WebSocket connections for real-time updates

        yield* Effect.sleep("2s");

        const confirmation: PaymentConfirmation = {
          paymentId,
          transactionHash: `0x${Math.random().toString(16).slice(2, 66)}`,
          amount: "0.05",
          currency: "ETH",
          status: "confirmed",
          confirmations: 12,
          timestamp: Date.now(),
        };

        return confirmation;
      } catch (error) {
        return yield* Effect.fail(
          new PaymentMonitorError(
            paymentId,
            error instanceof Error ? error.message : "Payment monitoring failed",
            error
          )
        );
      }
    });

  generateInvoice = (params: InvoiceParams): Effect.Effect<CryptoInvoice, CheckoutError> =>
    Effect.gen(this, function* () {
      try {
        const subtotal = params.lineItems.reduce((sum, item) => sum + item.total, 0);
        const tax = params.taxRate ? subtotal * params.taxRate : 0;
        const total = subtotal + tax;

        const currencies = params.currencies || ["ETH", "USDC", "USDT"];
        const cryptoPrices = yield* Effect.all(
          currencies.map((currency) => this.generateCryptoPrice(currency, total))
        );

        const invoice: CryptoInvoice = {
          id: this.generateId("inv"),
          invoiceNumber: this.generateInvoiceNumber(),
          status: "pending",
          lineItems: params.lineItems,
          subtotal,
          tax: params.taxRate ? tax : undefined,
          taxRate: params.taxRate,
          total,
          currency: "USD",
          cryptoPrices,
          dueDate: params.dueDate,
          issuedAt: Date.now(),
          notes: params.notes,
          customerName: params.customerName,
          customerEmail: params.customerEmail,
        };

        return invoice;
      } catch (error) {
        return yield* Effect.fail(
          new InvoiceError(
            error instanceof Error ? error.message : "Invoice generation failed",
            error
          )
        );
      }
    });

  createSubscription = (
    params: SubscriptionParams
  ): Effect.Effect<CryptoSubscription, CheckoutError> =>
    Effect.gen(this, function* () {
      try {
        // Mock plan data - replace with actual plan lookup
        const plan: SubscriptionPlan = {
          id: params.planId,
          name: "Premium Plan",
          description: "Full access to all features",
          amount: 29.99,
          currency: "USD",
          interval: "monthly",
          features: ["Unlimited access", "Priority support", "Advanced features"],
        };

        const startDate = params.startDate || Date.now();
        const nextBillingDate = this.calculateNextBillingDate(startDate, plan.interval);

        const subscription: CryptoSubscription = {
          id: this.generateId("sub"),
          planId: params.planId,
          plan,
          status: "active",
          currentPeriodStart: startDate,
          currentPeriodEnd: nextBillingDate,
          nextBillingDate,
          paymentMethod: {
            type: "crypto",
            currency: params.currency,
            network: params.network,
          },
          cancelAtPeriodEnd: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        return subscription;
      } catch (error) {
        return yield* Effect.fail(
          new SubscriptionError(
            error instanceof Error ? error.message : "Subscription creation failed",
            error
          )
        );
      }
    });

  cancelSubscription = (
    subscriptionId: string,
    immediately: boolean = false
  ): Effect.Effect<CryptoSubscription, CheckoutError> =>
    Effect.gen(this, function* () {
      try {
        // Mock cancellation - replace with actual subscription lookup and update
        const subscription: CryptoSubscription = {
          id: subscriptionId,
          planId: "plan_123",
          plan: {
            id: "plan_123",
            name: "Premium Plan",
            description: "Full access",
            amount: 29.99,
            currency: "USD",
            interval: "monthly",
            features: [],
          },
          status: immediately ? "cancelled" : "active",
          currentPeriodStart: Date.now() - 15 * 24 * 60 * 60 * 1000,
          currentPeriodEnd: Date.now() + 15 * 24 * 60 * 60 * 1000,
          nextBillingDate: immediately ? undefined : Date.now() + 15 * 24 * 60 * 60 * 1000,
          paymentMethod: {
            type: "crypto",
            currency: "ETH",
            network: "ethereum",
          },
          cancelAtPeriodEnd: !immediately,
          createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
          updatedAt: Date.now(),
        };

        return subscription;
      } catch (error) {
        return yield* Effect.fail(
          new SubscriptionError(
            error instanceof Error ? error.message : "Subscription cancellation failed",
            error
          )
        );
      }
    });

  processRefund = (request: RefundRequest): Effect.Effect<CryptoRefund, CheckoutError> =>
    Effect.gen(this, function* () {
      try {
        const refund: CryptoRefund = {
          id: this.generateId("ref"),
          paymentId: request.paymentId,
          amount: request.amount,
          currency: request.currency,
          status: "processing",
          reason: request.reason,
          notes: request.notes,
          refundAddress: request.refundAddress,
          createdAt: Date.now(),
        };

        // Mock refund processing - replace with actual transaction
        yield* Effect.sleep("2s");

        refund.status = "completed";
        refund.transactionHash = `0x${Math.random().toString(16).slice(2, 66)}`;
        refund.processedAt = Date.now();

        return refund;
      } catch (error) {
        return yield* Effect.fail(
          new RefundError(
            request.paymentId,
            error instanceof Error ? error.message : "Refund processing failed",
            error
          )
        );
      }
    });

  verifyWebhook = (
    payload: string,
    signature: string
  ): Effect.Effect<WebhookPayload, CheckoutError> =>
    Effect.gen(this, function* () {
      try {
        if (!this.config.webhookSecret) {
          return yield* Effect.fail(
            new WebhookError("Webhook secret not configured")
          );
        }

        // TODO: Implement actual signature verification
        // const expectedSignature = await crypto.subtle.sign(...)
        // if (signature !== expectedSignature) {
        //   return yield* Effect.fail(new WebhookError("Invalid signature"));
        // }

        const webhookData = JSON.parse(payload) as WebhookPayload;

        return webhookData;
      } catch (error) {
        return yield* Effect.fail(
          new WebhookError(
            error instanceof Error ? error.message : "Webhook verification failed",
            error
          )
        );
      }
    });

  // ============================================================================
  // PRIVATE HELPERS
  // ============================================================================

  private generateCryptoPrice = (
    currency: CryptoCurrency,
    usdAmount: number
  ): Effect.Effect<any, CheckoutError> =>
    Effect.gen(this, function* () {
      // Mock exchange rates - replace with actual price API
      const rates: Record<CryptoCurrency, number> = {
        ETH: 2000,
        USDC: 1,
        USDT: 1,
        DAI: 1,
        MATIC: 0.7,
        BTC: 40000,
      };

      const rate = rates[currency] || 1;
      const amount = (usdAmount / rate).toFixed(currency === "BTC" ? 8 : 6);

      return {
        currency,
        amount,
        usdValue: usdAmount,
        network: this.getNetwork(currency),
        address: this.generateAddress(currency),
      };
    });

  private generateId = (prefix: string): string => {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  };

  private generateInvoiceNumber = (): string => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const random = Math.floor(Math.random() * 10000);
    return `INV-${year}${month}-${String(random).padStart(4, "0")}`;
  };

  private generateAddress = (currency: CryptoCurrency): string => {
    // Mock address generation - replace with actual wallet integration
    if (currency === "BTC") {
      return `bc1q${Math.random().toString(36).substring(2, 42)}`;
    }
    return `0x${Math.random().toString(16).substring(2, 42)}`;
  };

  private getNetwork = (currency: CryptoCurrency): string => {
    const networks: Record<CryptoCurrency, string> = {
      ETH: "ethereum",
      USDC: "ethereum",
      USDT: "ethereum",
      DAI: "ethereum",
      MATIC: "polygon",
      BTC: "bitcoin",
    };
    return networks[currency] || "ethereum";
  };

  private calculateNextBillingDate = (
    startDate: number,
    interval: string
  ): number => {
    const date = new Date(startDate);

    switch (interval) {
      case "daily":
        date.setDate(date.getDate() + 1);
        break;
      case "weekly":
        date.setDate(date.getDate() + 7);
        break;
      case "monthly":
        date.setMonth(date.getMonth() + 1);
        break;
      case "yearly":
        date.setFullYear(date.getFullYear() + 1);
        break;
    }

    return date.getTime();
  };
}

// ============================================================================
// SERVICE TAG (Dependency Injection)
// ============================================================================

export class CheckoutService extends Context.Tag("CheckoutService")<
  CheckoutService,
  ICheckoutService
>() {}

// ============================================================================
// LAYER FACTORY
// ============================================================================

/**
 * Create CheckoutService layer with configuration
 *
 * @param config - Service configuration
 * @returns Effect Layer
 */
export const makeCheckoutServiceLayer = (config: CheckoutConfig) =>
  CheckoutService.of({
    ...new CheckoutServiceImpl(config),
  });

/**
 * Default CheckoutService layer
 */
export const CheckoutServiceLive = makeCheckoutServiceLayer({
  networkEndpoints: {
    ethereum: import.meta.env.PUBLIC_ETHEREUM_RPC || "https://eth.llamarpc.com",
    polygon: import.meta.env.PUBLIC_POLYGON_RPC || "https://polygon.llamarpc.com",
    bitcoin: import.meta.env.PUBLIC_BITCOIN_RPC || "https://blockstream.info/api",
  },
  confirmationsRequired: 12,
  webhookSecret: import.meta.env.WEBHOOK_SECRET,
  expiryMinutes: 15,
});
