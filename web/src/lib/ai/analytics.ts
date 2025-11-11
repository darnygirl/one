/**
 * Analytics & Error Tracking
 *
 * Lightweight tracking for chat events and error monitoring
 * Privacy-focused, user-controlled analytics
 */

export interface AnalyticsEvent {
  type: string;
  properties?: Record<string, any>;
  timestamp: number;
  sessionId: string;
}

export interface ErrorEvent {
  message: string;
  stack?: string;
  context?: Record<string, any>;
  timestamp: number;
  sessionId: string;
}

// ============================================================================
// SESSION MANAGEMENT
// ============================================================================

let sessionId: string;

function getSessionId(): string {
  if (typeof window === 'undefined') return 'server';

  if (!sessionId) {
    sessionId = localStorage.getItem('chat:sessionId') || generateSessionId();
    localStorage.setItem('chat:sessionId', sessionId);
  }
  return sessionId;
}

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// ============================================================================
// EVENT TRACKING
// ============================================================================

const eventQueue: AnalyticsEvent[] = [];
const MAX_QUEUE_SIZE = 100;

export function trackEvent(type: string, properties?: Record<string, any>): void {
  const event: AnalyticsEvent = {
    type,
    properties,
    timestamp: Date.now(),
    sessionId: getSessionId(),
  };

  eventQueue.push(event);

  // Keep queue size manageable
  if (eventQueue.length > MAX_QUEUE_SIZE) {
    eventQueue.shift();
  }

  // Log to console in development
  if (import.meta.env.DEV) {
    console.log('[Analytics]', type, properties);
  }

  // Store in localStorage for later analysis
  if (typeof window !== 'undefined') {
    try {
      const stored = JSON.parse(localStorage.getItem('chat:analytics') || '[]');
      stored.push(event);
      // Keep last 1000 events
      if (stored.length > 1000) stored.shift();
      localStorage.setItem('chat:analytics', JSON.stringify(stored.slice(-1000)));
    } catch (e) {
      console.error('Failed to store analytics:', e);
    }
  }
}

// ============================================================================
// PREDEFINED EVENTS
// ============================================================================

export const ChatEvents = {
  // Session events
  SESSION_STARTED: 'session.started',
  SESSION_ENDED: 'session.ended',

  // Model events
  MODEL_SELECTED: 'model.selected',
  MODEL_SWITCHED: 'model.switched',

  // Message events
  MESSAGE_SENT: 'message.sent',
  MESSAGE_RECEIVED: 'message.received',
  MESSAGE_ERROR: 'message.error',
  MESSAGE_COPIED: 'message.copied',
  MESSAGE_REGENERATED: 'message.regenerated',

  // Suggestion events
  SUGGESTION_CLICKED: 'suggestion.clicked',
  SUGGESTION_GENERATED: 'suggestion.generated',

  // UI events
  THEME_CHANGED: 'theme.changed',
  SETTINGS_OPENED: 'settings.opened',
  EXPORT_TRIGGERED: 'export.triggered',

  // API events
  API_KEY_ADDED: 'api_key.added',
  API_KEY_REMOVED: 'api_key.removed',
  API_ERROR: 'api.error',

  // Performance events
  RESPONSE_TIME: 'response.time',
  TOKEN_USAGE: 'token.usage',
} as const;

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

export function trackModelSwitch(fromModel: string, toModel: string): void {
  trackEvent(ChatEvents.MODEL_SWITCHED, {
    from: fromModel,
    to: toModel,
  });
}

export function trackMessageSent(modelId: string, messageLength: number): void {
  trackEvent(ChatEvents.MESSAGE_SENT, {
    model: modelId,
    length: messageLength,
  });
}

export function trackMessageReceived(
  modelId: string,
  responseLength: number,
  responseTime: number
): void {
  trackEvent(ChatEvents.MESSAGE_RECEIVED, {
    model: modelId,
    length: responseLength,
    timeMs: responseTime,
  });

  // Track response time separately for analysis
  trackEvent(ChatEvents.RESPONSE_TIME, {
    model: modelId,
    timeMs: responseTime,
  });
}

export function trackSuggestionClick(suggestionId: string, suggestionText: string): void {
  trackEvent(ChatEvents.SUGGESTION_CLICKED, {
    id: suggestionId,
    text: suggestionText,
  });
}

export function trackTokenUsage(
  modelId: string,
  inputTokens: number,
  outputTokens: number,
  cost: number
): void {
  trackEvent(ChatEvents.TOKEN_USAGE, {
    model: modelId,
    input: inputTokens,
    output: outputTokens,
    total: inputTokens + outputTokens,
    cost,
  });
}

// ============================================================================
// ERROR TRACKING
// ============================================================================

const errorQueue: ErrorEvent[] = [];

export function trackError(
  message: string,
  stack?: string,
  context?: Record<string, any>
): void {
  const error: ErrorEvent = {
    message,
    stack,
    context,
    timestamp: Date.now(),
    sessionId: getSessionId(),
  };

  errorQueue.push(error);

  // Log to console
  console.error('[Error Tracked]', error);

  // Store in localStorage
  if (typeof window !== 'undefined') {
    try {
      const stored = JSON.parse(localStorage.getItem('chat:errors') || '[]');
      stored.push(error);
      localStorage.setItem('chat:errors', JSON.stringify(stored.slice(-100)));
    } catch (e) {
      console.error('Failed to store error:', e);
    }
  }

  // Track as analytics event
  trackEvent('error.occurred', {
    message,
    ...context,
  });
}

// ============================================================================
// GLOBAL ERROR HANDLER
// ============================================================================

export function initErrorTracking(): void {
  if (typeof window === 'undefined') return;

  // Catch unhandled errors
  window.addEventListener('error', (event) => {
    trackError(
      event.message,
      event.error?.stack,
      {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      }
    );
  });

  // Catch unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    trackError(
      `Unhandled Promise Rejection: ${event.reason}`,
      event.reason?.stack,
      {
        reason: event.reason,
      }
    );
  });
}

// ============================================================================
// ANALYTICS REPORTING
// ============================================================================

export interface AnalyticsReport {
  sessionId: string;
  totalEvents: number;
  totalErrors: number;
  modelUsage: Record<string, number>;
  messageCounts: {
    sent: number;
    received: number;
    errors: number;
  };
  suggestionClicks: number;
  averageResponseTime: number;
  totalTokens: number;
  totalCost: number;
  sessionDuration: number;
}

export function getAnalyticsReport(): AnalyticsReport {
  const events = eventQueue;
  const errors = errorQueue;

  const modelUsage: Record<string, number> = {};
  let messageSent = 0;
  let messageReceived = 0;
  let messageErrors = 0;
  let suggestionClicks = 0;
  let totalResponseTime = 0;
  let responseCount = 0;
  let totalTokens = 0;
  let totalCost = 0;

  const startTime = events[0]?.timestamp || Date.now();
  const endTime = events[events.length - 1]?.timestamp || Date.now();

  for (const event of events) {
    switch (event.type) {
      case ChatEvents.MESSAGE_SENT:
        messageSent++;
        if (event.properties?.model) {
          modelUsage[event.properties.model] = (modelUsage[event.properties.model] || 0) + 1;
        }
        break;

      case ChatEvents.MESSAGE_RECEIVED:
        messageReceived++;
        if (event.properties?.timeMs) {
          totalResponseTime += event.properties.timeMs;
          responseCount++;
        }
        break;

      case ChatEvents.MESSAGE_ERROR:
        messageErrors++;
        break;

      case ChatEvents.SUGGESTION_CLICKED:
        suggestionClicks++;
        break;

      case ChatEvents.TOKEN_USAGE:
        if (event.properties) {
          totalTokens += event.properties.total || 0;
          totalCost += event.properties.cost || 0;
        }
        break;
    }
  }

  return {
    sessionId: getSessionId(),
    totalEvents: events.length,
    totalErrors: errors.length,
    modelUsage,
    messageCounts: {
      sent: messageSent,
      received: messageReceived,
      errors: messageErrors,
    },
    suggestionClicks,
    averageResponseTime: responseCount > 0 ? totalResponseTime / responseCount : 0,
    totalTokens,
    totalCost,
    sessionDuration: endTime - startTime,
  };
}

// ============================================================================
// PRIVACY CONTROLS
// ============================================================================

export function clearAnalytics(): void {
  eventQueue.length = 0;
  errorQueue.length = 0;

  if (typeof window !== 'undefined') {
    localStorage.removeItem('chat:analytics');
    localStorage.removeItem('chat:errors');
  }
}

export function exportAnalytics(): string {
  return JSON.stringify({
    report: getAnalyticsReport(),
    events: eventQueue,
    errors: errorQueue,
  }, null, 2);
}

// ============================================================================
// INITIALIZATION
// ============================================================================

export function initAnalytics(): void {
  if (typeof window === 'undefined') return;

  initErrorTracking();

  trackEvent(ChatEvents.SESSION_STARTED, {
    userAgent: navigator.userAgent,
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
    },
  });

  // Track session end
  window.addEventListener('beforeunload', () => {
    trackEvent(ChatEvents.SESSION_ENDED, {
      duration: Date.now() - (eventQueue[0]?.timestamp || Date.now()),
    });
  });
}
