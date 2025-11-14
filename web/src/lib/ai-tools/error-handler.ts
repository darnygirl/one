/**
 * Error Handler for AI Tools
 * Graceful degradation, retry logic, and user-friendly error messages
 */

export interface ToolError {
  tool: string;
  error: Error;
  attempt: number;
  timestamp: number;
}

export interface RetryConfig {
  maxAttempts: number;
  initialDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2,
};

/**
 * Execute tool with exponential backoff retry
 */
export async function executeWithRetry<T>(
  toolName: string,
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const retryConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= retryConfig.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Log error for analytics
      logToolError({
        tool: toolName,
        error: lastError,
        attempt,
        timestamp: Date.now(),
      });

      // Don't retry on last attempt
      if (attempt === retryConfig.maxAttempts) {
        break;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        retryConfig.initialDelay * Math.pow(retryConfig.backoffMultiplier, attempt - 1),
        retryConfig.maxDelay
      );

      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  // All attempts failed
  throw new Error(
    getUserFriendlyMessage(toolName, lastError!)
  );
}

/**
 * Convert technical errors to user-friendly messages
 */
export function getUserFriendlyMessage(toolName: string, error: Error): string {
  const message = error.message.toLowerCase();

  // Network errors
  if (message.includes('fetch') || message.includes('network') || message.includes('ECONNREFUSED')) {
    return `Unable to connect to ${toolName} service. Please check your internet connection and try again.`;
  }

  // Rate limiting
  if (message.includes('429') || message.includes('rate limit')) {
    return `${toolName} is currently rate limited. Please wait a moment and try again.`;
  }

  // Authentication
  if (message.includes('401') || message.includes('403') || message.includes('unauthorized')) {
    return `Authentication failed for ${toolName}. Please check your API credentials.`;
  }

  // Not found
  if (message.includes('404') || message.includes('not found')) {
    return `The requested resource could not be found in ${toolName}.`;
  }

  // Timeout
  if (message.includes('timeout') || message.includes('timed out')) {
    return `${toolName} request timed out. The service may be slow or unavailable.`;
  }

  // Invalid input
  if (message.includes('invalid') || message.includes('malformed')) {
    return `Invalid input provided to ${toolName}. Please check your parameters and try again.`;
  }

  // Service unavailable
  if (message.includes('500') || message.includes('502') || message.includes('503')) {
    return `${toolName} service is temporarily unavailable. Please try again later.`;
  }

  // Generic error with context
  return `${toolName} error: ${error.message}. Please try again or contact support if the issue persists.`;
}

/**
 * Get fallback suggestions when a tool fails
 */
export function getFallbackSuggestions(toolName: string): string[] {
  const fallbacks: Record<string, string[]> = {
    get_weather: [
      'Try searching "weather in [location]" for general results',
      'Check https://wttr.in directly for weather data',
      'Use time zone tool to check if location name is correct',
    ],
    web_search: [
      'Try a different search engine manually',
      'Simplify your search query',
      'Check if the site you\'re searching supports API access',
    ],
    calculator: [
      'Try simplifying the mathematical expression',
      'Use parentheses to clarify order of operations',
      'Break complex calculations into smaller steps',
    ],
    translation: [
      'Try a different translation service',
      'Check if the language code is supported',
      'Simplify the text for translation',
    ],
  };

  return fallbacks[toolName] || [
    `Try ${toolName} again with different parameters`,
    'Check your internet connection',
    'Wait a moment and retry',
  ];
}

/**
 * Log tool error for analytics
 */
function logToolError(error: ToolError): void {
  // Store in localStorage for analytics
  try {
    const errors = JSON.parse(localStorage.getItem('tool_errors') || '[]');
    errors.push(error);

    // Keep only last 100 errors
    const recentErrors = errors.slice(-100);
    localStorage.setItem('tool_errors', JSON.stringify(recentErrors));
  } catch {
    // Ignore localStorage errors
  }
}

/**
 * Get tool error statistics
 */
export function getToolErrorStats(): Record<string, number> {
  try {
    const errors: ToolError[] = JSON.parse(localStorage.getItem('tool_errors') || '[]');
    const stats: Record<string, number> = {};

    errors.forEach(error => {
      stats[error.tool] = (stats[error.tool] || 0) + 1;
    });

    return stats;
  } catch {
    return {};
  }
}

/**
 * Clear error logs
 */
export function clearErrorLogs(): void {
  try {
    localStorage.removeItem('tool_errors');
  } catch {
    // Ignore
  }
}
