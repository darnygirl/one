/**
 * WebhookService - Effect.ts Webhook Handling
 *
 * Provides webhook registration, triggering, and verification
 * with signature validation and retry logic.
 *
 * Features:
 * - Webhook registration and management
 * - Event triggering with retries
 * - Signature generation and verification
 * - Exponential backoff retry strategy
 * - Type-safe error handling
 *
 * @example
 * ```ts
 * import { Effect } from "effect";
 * import { WebhookService } from "@/lib/services/WebhookService";
 *
 * const program = Effect.gen(function* () {
 *   const webhooks = yield* WebhookService;
 *
 *   // Register a webhook
 *   const id = yield* webhooks.register({
 *     url: "https://api.example.com/webhooks",
 *     events: ["payment.succeeded", "subscription.created"],
 *     secret: "whsec_..."
 *   });
 *
 *   // Trigger an event
 *   yield* webhooks.trigger({
 *     event: "payment.succeeded",
 *     data: { amount: 99.99, currency: "USD" }
 *   });
 * });
 * ```
 */

import { Effect, Context, Schedule } from "effect";

// ============================================================================
// ERROR TYPES
// ============================================================================

export class WebhookRegistrationError {
  readonly _tag = "WebhookRegistrationError";
  constructor(
    readonly message: string,
    readonly cause?: unknown
  ) {}
}

export class WebhookTriggerError {
  readonly _tag = "WebhookTriggerError";
  constructor(
    readonly webhookId: string,
    readonly event: string,
    readonly message: string,
    readonly cause?: unknown
  ) {}
}

export class WebhookVerificationError {
  readonly _tag = "WebhookVerificationError";
  constructor(
    readonly message: string,
    readonly cause?: unknown
  ) {}
}

export class WebhookRetryExhaustedError {
  readonly _tag = "WebhookRetryExhaustedError";
  constructor(
    readonly webhookId: string,
    readonly attempts: number,
    readonly message: string
  ) {}
}

export type WebhookError =
  | WebhookRegistrationError
  | WebhookTriggerError
  | WebhookVerificationError
  | WebhookRetryExhaustedError;

// ============================================================================
// TYPES
// ============================================================================

export interface Webhook {
  id: string;
  url: string;
  events: string[];
  secret: string;
  active: boolean;
  createdAt: number;
  metadata?: Record<string, unknown>;
}

export interface WebhookRegistration {
  url: string;
  events: string[];
  secret?: string;
  metadata?: Record<string, unknown>;
}

export interface WebhookEvent {
  id: string;
  event: string;
  data: Record<string, unknown>;
  timestamp: number;
  signature?: string;
}

export interface WebhookDelivery {
  id: string;
  webhookId: string;
  event: WebhookEvent;
  status: "pending" | "success" | "failed";
  attempts: number;
  lastAttemptAt?: number;
  nextRetryAt?: number;
  error?: string;
}

export interface WebhookConfig {
  maxRetries?: number;
  retryDelay?: number;
  timeout?: number;
  signatureAlgorithm?: "hmac-sha256" | "hmac-sha512";
}

// ============================================================================
// SERVICE INTERFACE
// ============================================================================

export interface IWebhookService {
  /**
   * Register a webhook
   *
   * Creates a new webhook subscription
   *
   * @param registration - Webhook registration details
   * @returns Webhook ID
   */
  register: (
    registration: WebhookRegistration
  ) => Effect.Effect<string, WebhookError>;

  /**
   * Unregister a webhook
   *
   * Removes a webhook subscription
   *
   * @param id - Webhook ID
   * @returns void
   */
  unregister: (id: string) => Effect.Effect<void, WebhookError>;

  /**
   * Trigger a webhook event
   *
   * Sends an event to all registered webhooks with retry logic
   *
   * @param event - Event details
   * @returns Array of delivery IDs
   */
  trigger: (event: {
    event: string;
    data: Record<string, unknown>;
  }) => Effect.Effect<string[], WebhookError>;

  /**
   * Verify webhook signature
   *
   * Validates that a webhook payload came from a trusted source
   *
   * @param payload - Raw request body
   * @param signature - Signature from header
   * @param secret - Webhook secret
   * @returns true if valid
   */
  verify: (
    payload: string,
    signature: string,
    secret: string
  ) => Effect.Effect<boolean, WebhookError>;

  /**
   * Get webhook by ID
   *
   * @param id - Webhook ID
   * @returns Webhook details
   */
  getWebhook: (id: string) => Effect.Effect<Webhook, WebhookError>;

  /**
   * List all webhooks
   *
   * @returns Array of webhooks
   */
  listWebhooks: () => Effect.Effect<Webhook[], WebhookError>;

  /**
   * Get delivery status
   *
   * @param deliveryId - Delivery ID
   * @returns Delivery details
   */
  getDelivery: (deliveryId: string) => Effect.Effect<WebhookDelivery, WebhookError>;
}

// ============================================================================
// SERVICE IMPLEMENTATION
// ============================================================================

export class WebhookServiceImpl implements IWebhookService {
  private webhooks = new Map<string, Webhook>();
  private deliveries = new Map<string, WebhookDelivery>();

  constructor(private readonly config: WebhookConfig = {}) {}

  register = (
    registration: WebhookRegistration
  ): Effect.Effect<string, WebhookError> =>
    Effect.gen(this, function* () {
      try {
        const id = `wh_${Math.random().toString(36).substring(2, 15)}`;
        const secret = registration.secret || this.generateSecret();

        const webhook: Webhook = {
          id,
          url: registration.url,
          events: registration.events,
          secret,
          active: true,
          createdAt: Date.now(),
          metadata: registration.metadata,
        };

        this.webhooks.set(id, webhook);

        return id;
      } catch (error) {
        return yield* Effect.fail(
          new WebhookRegistrationError(
            error instanceof Error ? error.message : "Registration failed",
            error
          )
        );
      }
    });

  unregister = (id: string): Effect.Effect<void, WebhookError> =>
    Effect.gen(this, function* () {
      const webhook = this.webhooks.get(id);

      if (!webhook) {
        return yield* Effect.fail(
          new WebhookRegistrationError(`Webhook ${id} not found`)
        );
      }

      this.webhooks.delete(id);
    });

  trigger = (event: {
    event: string;
    data: Record<string, unknown>;
  }): Effect.Effect<string[], WebhookError> =>
    Effect.gen(this, function* () {
      const eventId = `evt_${Math.random().toString(36).substring(2, 15)}`;

      const webhookEvent: WebhookEvent = {
        id: eventId,
        event: event.event,
        data: event.data,
        timestamp: Date.now(),
      };

      // Find all webhooks subscribed to this event
      const matchingWebhooks = Array.from(this.webhooks.values()).filter(
        (wh) => wh.active && wh.events.includes(event.event)
      );

      // Trigger all webhooks in parallel
      const deliveryEffects = matchingWebhooks.map((webhook) =>
        this.deliverWebhook(webhook, webhookEvent)
      );

      const deliveryIds = yield* Effect.all(deliveryEffects, {
        concurrency: 10,
      });

      return deliveryIds;
    });

  verify = (
    payload: string,
    signature: string,
    secret: string
  ): Effect.Effect<boolean, WebhookError> =>
    Effect.gen(this, function* () {
      try {
        const expectedSignature = yield* this.generateSignature(payload, secret);

        // Constant-time comparison to prevent timing attacks
        if (signature.length !== expectedSignature.length) {
          return false;
        }

        let mismatch = 0;
        for (let i = 0; i < signature.length; i++) {
          mismatch |= signature.charCodeAt(i) ^ expectedSignature.charCodeAt(i);
        }

        return mismatch === 0;
      } catch (error) {
        return yield* Effect.fail(
          new WebhookVerificationError(
            error instanceof Error ? error.message : "Verification failed",
            error
          )
        );
      }
    });

  getWebhook = (id: string): Effect.Effect<Webhook, WebhookError> =>
    Effect.gen(this, function* () {
      const webhook = this.webhooks.get(id);

      if (!webhook) {
        return yield* Effect.fail(
          new WebhookRegistrationError(`Webhook ${id} not found`)
        );
      }

      return webhook;
    });

  listWebhooks = (): Effect.Effect<Webhook[], WebhookError> =>
    Effect.gen(this, function* () {
      return Array.from(this.webhooks.values());
    });

  getDelivery = (deliveryId: string): Effect.Effect<WebhookDelivery, WebhookError> =>
    Effect.gen(this, function* () {
      const delivery = this.deliveries.get(deliveryId);

      if (!delivery) {
        return yield* Effect.fail(
          new WebhookTriggerError(
            "",
            "",
            `Delivery ${deliveryId} not found`
          )
        );
      }

      return delivery;
    });

  // ============================================================================
  // PRIVATE HELPERS
  // ============================================================================

  private deliverWebhook = (
    webhook: Webhook,
    event: WebhookEvent
  ): Effect.Effect<string, WebhookError> =>
    Effect.gen(this, function* () {
      const deliveryId = `del_${Math.random().toString(36).substring(2, 15)}`;

      const delivery: WebhookDelivery = {
        id: deliveryId,
        webhookId: webhook.id,
        event,
        status: "pending",
        attempts: 0,
      };

      this.deliveries.set(deliveryId, delivery);

      // Generate signature
      const payload = JSON.stringify(event);
      const signature = yield* this.generateSignature(payload, webhook.secret);

      // Attach signature to event
      event.signature = signature;

      // Send with retry logic
      const sendProgram = this.sendWebhook(webhook, event, delivery);

      const retryPolicy = Schedule.exponential(
        this.config.retryDelay || 1000
      ).pipe(
        Schedule.compose(Schedule.recurs(this.config.maxRetries || 3))
      );

      try {
        yield* Effect.retry(sendProgram, retryPolicy);
        delivery.status = "success";
      } catch (error) {
        delivery.status = "failed";
        delivery.error =
          error instanceof Error ? error.message : "Delivery failed";

        return yield* Effect.fail(
          new WebhookRetryExhaustedError(
            webhook.id,
            delivery.attempts,
            delivery.error
          )
        );
      }

      return deliveryId;
    });

  private sendWebhook = (
    webhook: Webhook,
    event: WebhookEvent,
    delivery: WebhookDelivery
  ): Effect.Effect<void, WebhookError> =>
    Effect.gen(this, function* () {
      delivery.attempts++;
      delivery.lastAttemptAt = Date.now();

      const timeout = this.config.timeout || 10000;

      const response = yield* Effect.tryPromise({
        try: () =>
          fetch(webhook.url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Webhook-Signature": event.signature || "",
              "X-Webhook-Event": event.event,
              "X-Webhook-ID": event.id,
            },
            body: JSON.stringify(event),
            signal: AbortSignal.timeout(timeout),
          }),
        catch: (error) =>
          new WebhookTriggerError(
            webhook.id,
            event.event,
            error instanceof Error ? error.message : "Network error",
            error
          ),
      });

      if (!response.ok) {
        return yield* Effect.fail(
          new WebhookTriggerError(
            webhook.id,
            event.event,
            `HTTP ${response.status}: ${response.statusText}`
          )
        );
      }
    });

  private generateSignature = (
    payload: string,
    secret: string
  ): Effect.Effect<string, WebhookVerificationError> =>
    Effect.gen(this, function* () {
      try {
        const algorithm = this.config.signatureAlgorithm || "hmac-sha256";
        const encoder = new TextEncoder();

        const key = yield* Effect.tryPromise({
          try: () =>
            crypto.subtle.importKey(
              "raw",
              encoder.encode(secret),
              { name: "HMAC", hash: algorithm.replace("hmac-", "").toUpperCase() },
              false,
              ["sign"]
            ),
          catch: (error) =>
            new WebhookVerificationError("Failed to import key", error),
        });

        const signature = yield* Effect.tryPromise({
          try: () =>
            crypto.subtle.sign("HMAC", key, encoder.encode(payload)),
          catch: (error) =>
            new WebhookVerificationError("Failed to sign payload", error),
        });

        // Convert to hex string
        const hashArray = Array.from(new Uint8Array(signature));
        const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

        return hashHex;
      } catch (error) {
        return yield* Effect.fail(
          new WebhookVerificationError(
            error instanceof Error ? error.message : "Signature generation failed",
            error
          )
        );
      }
    });

  private generateSecret = (): string => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return `whsec_${Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("")}`;
  };
}

// ============================================================================
// SERVICE TAG (Dependency Injection)
// ============================================================================

export class WebhookService extends Context.Tag("WebhookService")<
  WebhookService,
  IWebhookService
>() {}

// ============================================================================
// LAYER FACTORY
// ============================================================================

/**
 * Create WebhookService layer with configuration
 *
 * @param config - Service configuration
 * @returns Effect Layer
 */
export const makeWebhookServiceLayer = (config?: WebhookConfig) =>
  WebhookService.of({
    ...new WebhookServiceImpl(config),
  });

/**
 * Default WebhookService layer
 */
export const WebhookServiceLive = makeWebhookServiceLayer();
