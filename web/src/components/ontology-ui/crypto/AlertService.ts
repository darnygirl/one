/**
 * AlertService - Price alert management using Effect.ts
 *
 * Handles alert creation, monitoring, and notification delivery
 */

import { Effect } from "effect";

export type AlertError =
  | { _tag: "ValidationError"; message: string }
  | { _tag: "NotificationError"; message: string }
  | { _tag: "DatabaseError"; message: string };

export interface Alert {
  id: string;
  symbol: string;
  condition: "above" | "below" | "percent_up" | "percent_down";
  targetValue: number;
  currentPrice: number;
  status: "active" | "triggered" | "snoozed" | "dismissed";
  createdAt: number;
  triggeredAt?: number;
  notifyEmail?: boolean;
  notifyPush?: boolean;
  snoozeUntil?: number;
}

export interface PriceUpdate {
  symbol: string;
  price: number;
  timestamp: number;
}

/**
 * Validate alert configuration
 */
export const validateAlert = (
  alert: Partial<Alert>
): Effect.Effect<Alert, AlertError> =>
  Effect.gen(function* () {
    if (!alert.symbol) {
      return yield* Effect.fail({
        _tag: "ValidationError",
        message: "Symbol is required",
      });
    }

    if (!alert.condition) {
      return yield* Effect.fail({
        _tag: "ValidationError",
        message: "Condition is required",
      });
    }

    if (alert.targetValue === undefined || alert.targetValue <= 0) {
      return yield* Effect.fail({
        _tag: "ValidationError",
        message: "Target value must be positive",
      });
    }

    if (alert.currentPrice === undefined || alert.currentPrice <= 0) {
      return yield* Effect.fail({
        _tag: "ValidationError",
        message: "Current price must be positive",
      });
    }

    return alert as Alert;
  });

/**
 * Check if alert should trigger based on price update
 */
export const shouldTriggerAlert = (
  alert: Alert,
  priceUpdate: PriceUpdate
): Effect.Effect<boolean, AlertError> =>
  Effect.gen(function* () {
    if (alert.symbol !== priceUpdate.symbol) {
      return false;
    }

    if (alert.status !== "active") {
      return false;
    }

    if (alert.snoozeUntil && alert.snoozeUntil > Date.now()) {
      return false;
    }

    const currentPrice = priceUpdate.price;

    switch (alert.condition) {
      case "above":
        return currentPrice >= alert.targetValue;

      case "below":
        return currentPrice <= alert.targetValue;

      case "percent_up": {
        const percentChange = ((currentPrice - alert.currentPrice) / alert.currentPrice) * 100;
        return percentChange >= alert.targetValue;
      }

      case "percent_down": {
        const percentChange = ((alert.currentPrice - currentPrice) / alert.currentPrice) * 100;
        return percentChange >= alert.targetValue;
      }

      default:
        return false;
    }
  });

/**
 * Send email notification
 */
export const sendEmailNotification = (
  alert: Alert,
  currentPrice: number
): Effect.Effect<void, AlertError> =>
  Effect.gen(function* () {
    try {
      // In production: integrate with email service (SendGrid, AWS SES, etc.)
      console.log(`📧 Email notification for ${alert.symbol} alert:`, {
        condition: alert.condition,
        target: alert.targetValue,
        current: currentPrice,
      });

      // Mock email send
      // await emailService.send({
      //   to: user.email,
      //   subject: `Price Alert: ${alert.symbol}`,
      //   body: generateEmailBody(alert, currentPrice),
      // });
    } catch (error) {
      return yield* Effect.fail({
        _tag: "NotificationError",
        message: `Failed to send email: ${error}`,
      });
    }
  });

/**
 * Send push notification
 */
export const sendPushNotification = (
  alert: Alert,
  currentPrice: number
): Effect.Effect<void, AlertError> =>
  Effect.gen(function* () {
    try {
      // In production: integrate with push service (Firebase, OneSignal, etc.)
      console.log(`🔔 Push notification for ${alert.symbol} alert:`, {
        condition: alert.condition,
        target: alert.targetValue,
        current: currentPrice,
      });

      // Mock push send
      // await pushService.send({
      //   title: `${alert.symbol} Alert Triggered`,
      //   body: generatePushBody(alert, currentPrice),
      //   data: { alertId: alert.id },
      // });
    } catch (error) {
      return yield* Effect.fail({
        _tag: "NotificationError",
        message: `Failed to send push notification: ${error}`,
      });
    }
  });

/**
 * Process triggered alert
 */
export const processTriggeredAlert = (
  alert: Alert,
  currentPrice: number
): Effect.Effect<void, AlertError> =>
  Effect.gen(function* () {
    // Send notifications based on user preferences
    if (alert.notifyEmail) {
      yield* sendEmailNotification(alert, currentPrice);
    }

    if (alert.notifyPush) {
      yield* sendPushNotification(alert, currentPrice);
    }

    // Update alert status
    // In production: update in database
    console.log(`✅ Alert ${alert.id} processed successfully`);
  });

/**
 * Monitor price updates and trigger alerts
 */
export const monitorAlerts = (
  alerts: Alert[],
  priceUpdate: PriceUpdate
): Effect.Effect<Alert[], AlertError> =>
  Effect.gen(function* () {
    const triggeredAlerts: Alert[] = [];

    for (const alert of alerts) {
      const shouldTrigger = yield* shouldTriggerAlert(alert, priceUpdate);

      if (shouldTrigger) {
        yield* processTriggeredAlert(alert, priceUpdate.price);
        triggeredAlerts.push({
          ...alert,
          status: "triggered",
          triggeredAt: Date.now(),
        });
      }
    }

    return triggeredAlerts;
  });

/**
 * Batch process multiple price updates
 */
export const batchMonitorAlerts = (
  alerts: Alert[],
  priceUpdates: PriceUpdate[]
): Effect.Effect<Alert[], AlertError> =>
  Effect.gen(function* () {
    const allTriggeredAlerts: Alert[] = [];

    for (const priceUpdate of priceUpdates) {
      const triggeredAlerts = yield* monitorAlerts(alerts, priceUpdate);
      allTriggeredAlerts.push(...triggeredAlerts);
    }

    return allTriggeredAlerts;
  });

/**
 * Snooze alert for specified duration
 */
export const snoozeAlert = (
  alert: Alert,
  durationMs: number
): Effect.Effect<Alert, AlertError> =>
  Effect.gen(function* () {
    if (durationMs <= 0) {
      return yield* Effect.fail({
        _tag: "ValidationError",
        message: "Snooze duration must be positive",
      });
    }

    return {
      ...alert,
      status: "snoozed",
      snoozeUntil: Date.now() + durationMs,
    };
  });

/**
 * Dismiss alert
 */
export const dismissAlert = (alert: Alert): Effect.Effect<Alert, AlertError> =>
  Effect.gen(function* () {
    return {
      ...alert,
      status: "dismissed",
    };
  });

/**
 * Reactivate snoozed alert
 */
export const reactivateAlert = (alert: Alert): Effect.Effect<Alert, AlertError> =>
  Effect.gen(function* () {
    if (alert.status !== "snoozed") {
      return yield* Effect.fail({
        _tag: "ValidationError",
        message: "Only snoozed alerts can be reactivated",
      });
    }

    return {
      ...alert,
      status: "active",
      snoozeUntil: undefined,
    };
  });

/**
 * Clean up expired snoozed alerts
 */
export const cleanupExpiredSnoozes = (
  alerts: Alert[]
): Effect.Effect<Alert[], AlertError> =>
  Effect.gen(function* () {
    const now = Date.now();

    return alerts.map((alert) => {
      if (alert.status === "snoozed" && alert.snoozeUntil && alert.snoozeUntil <= now) {
        return {
          ...alert,
          status: "active" as const,
          snoozeUntil: undefined,
        };
      }
      return alert;
    });
  });

/**
 * Get active alerts for symbol
 */
export const getActiveAlertsForSymbol = (
  alerts: Alert[],
  symbol: string
): Effect.Effect<Alert[], AlertError> =>
  Effect.gen(function* () {
    return alerts.filter((alert) => alert.symbol === symbol && alert.status === "active");
  });

/**
 * Get alerts summary statistics
 */
export const getAlertsSummary = (
  alerts: Alert[]
): Effect.Effect<
  {
    total: number;
    active: number;
    triggered: number;
    snoozed: number;
    dismissed: number;
  },
  AlertError
> =>
  Effect.gen(function* () {
    return {
      total: alerts.length,
      active: alerts.filter((a) => a.status === "active").length,
      triggered: alerts.filter((a) => a.status === "triggered").length,
      snoozed: alerts.filter((a) => a.status === "snoozed").length,
      dismissed: alerts.filter((a) => a.status === "dismissed").length,
    };
  });

// Helper function to generate email body
function generateEmailBody(alert: Alert, currentPrice: number): string {
  const conditionText = {
    above: `went above $${alert.targetValue}`,
    below: `went below $${alert.targetValue}`,
    percent_up: `increased by ${alert.targetValue}%`,
    percent_down: `decreased by ${alert.targetValue}%`,
  }[alert.condition];

  return `
    Your price alert for ${alert.symbol} has been triggered!

    ${alert.symbol} ${conditionText}
    Current Price: $${currentPrice.toLocaleString()}

    Alert created: ${new Date(alert.createdAt).toLocaleString()}

    View your portfolio: https://one.ie/portfolio
  `;
}

// Helper function to generate push notification body
function generatePushBody(alert: Alert, currentPrice: number): string {
  return `${alert.symbol}: $${currentPrice.toLocaleString()} - Alert triggered!`;
}
