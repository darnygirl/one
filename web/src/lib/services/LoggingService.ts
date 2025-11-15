/**
 * LoggingService - Effect.ts Structured Logging
 *
 * Provides structured logging with log levels, filtering,
 * context tracking, and integration with logging platforms.
 *
 * Features:
 * - Structured log messages
 * - Log levels (debug, info, warn, error)
 * - Log filtering by level
 * - Context tracking across operations
 * - Automatic enrichment with metadata
 * - Type-safe error handling
 *
 * @example
 * ```ts
 * import { Effect } from "effect";
 * import { LoggingService } from "@/lib/services/LoggingService";
 *
 * const program = Effect.gen(function* () {
 *   const logger = yield* LoggingService;
 *
 *   // Info log
 *   yield* logger.info("User logged in", {
 *     userId: "user-123",
 *     timestamp: Date.now()
 *   });
 *
 *   // Error log
 *   yield* logger.error("Payment failed", {
 *     error: "Insufficient funds",
 *     amount: 99.99
 *   });
 *
 *   // With context
 *   yield* logger.withContext({ requestId: "req-456" }, function* () {
 *     yield* logger.info("Processing request");
 *     // All logs in this scope will include requestId
 *   });
 * });
 * ```
 */

import { Effect, Context } from "effect";

// ============================================================================
// ERROR TYPES
// ============================================================================

export class LoggingError {
  readonly _tag = "LoggingError";
  constructor(
    readonly message: string,
    readonly cause?: unknown
  ) {}
}

export class LogTransportError {
  readonly _tag = "LogTransportError";
  constructor(
    readonly transport: string,
    readonly message: string,
    readonly cause?: unknown
  ) {}
}

// ============================================================================
// TYPES
// ============================================================================

export type LogLevel = "debug" | "info" | "warn" | "error" | "fatal";

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: number;
  context?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

export interface LoggingConfig {
  minLevel?: LogLevel;
  transports?: LogTransport[];
  enableConsole?: boolean;
  enableRemote?: boolean;
  remoteEndpoint?: string;
  context?: Record<string, unknown>;
  format?: "json" | "text" | "pretty";
}

export interface LogTransport {
  name: string;
  minLevel?: LogLevel;
  send: (entry: LogEntry) => Promise<void> | Effect.Effect<void, unknown>;
}

// ============================================================================
// SERVICE INTERFACE
// ============================================================================

export interface ILoggingService {
  /**
   * Log a debug message
   *
   * @param message - Log message
   * @param metadata - Additional metadata
   * @returns void
   */
  debug: (
    message: string,
    metadata?: Record<string, unknown>
  ) => Effect.Effect<void, never>;

  /**
   * Log an info message
   *
   * @param message - Log message
   * @param metadata - Additional metadata
   * @returns void
   */
  info: (
    message: string,
    metadata?: Record<string, unknown>
  ) => Effect.Effect<void, never>;

  /**
   * Log a warning message
   *
   * @param message - Log message
   * @param metadata - Additional metadata
   * @returns void
   */
  warn: (
    message: string,
    metadata?: Record<string, unknown>
  ) => Effect.Effect<void, never>;

  /**
   * Log an error message
   *
   * @param message - Log message
   * @param error - Error object or metadata
   * @returns void
   */
  error: (
    message: string,
    error?: Error | Record<string, unknown>
  ) => Effect.Effect<void, never>;

  /**
   * Log a fatal error message
   *
   * @param message - Log message
   * @param error - Error object or metadata
   * @returns void
   */
  fatal: (
    message: string,
    error?: Error | Record<string, unknown>
  ) => Effect.Effect<void, never>;

  /**
   * Generic log method
   *
   * @param level - Log level
   * @param message - Log message
   * @param metadata - Additional metadata
   * @returns void
   */
  log: (
    level: LogLevel,
    message: string,
    metadata?: Record<string, unknown>
  ) => Effect.Effect<void, never>;

  /**
   * Add context to all logs in scope
   *
   * @param context - Context key-value pairs
   * @param program - Effect program to run with context
   * @returns Result of program
   */
  withContext: <R, E, A>(
    context: Record<string, unknown>,
    program: Effect.Effect<A, E, R>
  ) => Effect.Effect<A, E, R>;

  /**
   * Set minimum log level
   *
   * @param level - Minimum level to log
   * @returns void
   */
  setLevel: (level: LogLevel) => Effect.Effect<void, never>;

  /**
   * Add a log transport
   *
   * @param transport - Transport configuration
   * @returns void
   */
  addTransport: (transport: LogTransport) => Effect.Effect<void, never>;

  /**
   * Flush all pending logs
   *
   * @returns void
   */
  flush: () => Effect.Effect<void, LoggingError>;
}

// ============================================================================
// SERVICE IMPLEMENTATION
// ============================================================================

export class LoggingServiceImpl implements ILoggingService {
  private minLevel: LogLevel;
  private transports: LogTransport[];
  private context: Record<string, unknown>;
  private pendingLogs: LogEntry[] = [];
  private levelPriority: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
    fatal: 4,
  };

  constructor(private readonly config: LoggingConfig = {}) {
    this.minLevel = config.minLevel || "info";
    this.transports = config.transports || [];
    this.context = config.context || {};

    // Add console transport if enabled
    if (config.enableConsole !== false) {
      this.transports.push(this.createConsoleTransport());
    }

    // Add remote transport if enabled
    if (config.enableRemote && config.remoteEndpoint) {
      this.transports.push(this.createRemoteTransport(config.remoteEndpoint));
    }
  }

  debug = (
    message: string,
    metadata?: Record<string, unknown>
  ): Effect.Effect<void, never> => this.log("debug", message, metadata);

  info = (
    message: string,
    metadata?: Record<string, unknown>
  ): Effect.Effect<void, never> => this.log("info", message, metadata);

  warn = (
    message: string,
    metadata?: Record<string, unknown>
  ): Effect.Effect<void, never> => this.log("warn", message, metadata);

  error = (
    message: string,
    error?: Error | Record<string, unknown>
  ): Effect.Effect<void, never> =>
    Effect.gen(this, function* () {
      const metadata =
        error instanceof Error
          ? {
              error: {
                name: error.name,
                message: error.message,
                stack: error.stack,
              },
            }
          : error;

      yield* this.log("error", message, metadata);
    });

  fatal = (
    message: string,
    error?: Error | Record<string, unknown>
  ): Effect.Effect<void, never> =>
    Effect.gen(this, function* () {
      const metadata =
        error instanceof Error
          ? {
              error: {
                name: error.name,
                message: error.message,
                stack: error.stack,
              },
            }
          : error;

      yield* this.log("fatal", message, metadata);
    });

  log = (
    level: LogLevel,
    message: string,
    metadata?: Record<string, unknown>
  ): Effect.Effect<void, never> =>
    Effect.gen(this, function* () {
      // Check if log level is enabled
      if (!this.shouldLog(level)) {
        return;
      }

      const entry: LogEntry = {
        level,
        message,
        timestamp: Date.now(),
        context: { ...this.context },
        metadata,
        error:
          metadata?.error && typeof metadata.error === "object"
            ? (metadata.error as LogEntry["error"])
            : undefined,
      };

      // Buffer the log
      this.pendingLogs.push(entry);

      // Send to all transports
      yield* this.sendToTransports(entry);
    });

  withContext = <R, E, A>(
    context: Record<string, unknown>,
    program: Effect.Effect<A, E, R>
  ): Effect.Effect<A, E, R> =>
    Effect.gen(this, function* () {
      const previousContext = { ...this.context };

      // Merge context
      this.context = { ...this.context, ...context };

      try {
        return yield* program;
      } finally {
        // Restore previous context
        this.context = previousContext;
      }
    });

  setLevel = (level: LogLevel): Effect.Effect<void, never> =>
    Effect.gen(this, function* () {
      this.minLevel = level;
    });

  addTransport = (transport: LogTransport): Effect.Effect<void, never> =>
    Effect.gen(this, function* () {
      this.transports.push(transport);
    });

  flush = (): Effect.Effect<void, LoggingError> =>
    Effect.gen(this, function* () {
      const logs = [...this.pendingLogs];
      this.pendingLogs = [];

      // Send all pending logs
      for (const entry of logs) {
        yield* this.sendToTransports(entry);
      }
    });

  // ============================================================================
  // PRIVATE HELPERS
  // ============================================================================

  private shouldLog = (level: LogLevel): boolean => {
    return this.levelPriority[level] >= this.levelPriority[this.minLevel];
  };

  private sendToTransports = (entry: LogEntry): Effect.Effect<void, never> =>
    Effect.gen(this, function* () {
      const effects = this.transports
        .filter((transport) => {
          if (!transport.minLevel) return true;
          return (
            this.levelPriority[entry.level] >=
            this.levelPriority[transport.minLevel]
          );
        })
        .map((transport) => this.sendToTransport(transport, entry));

      // Send to all transports in parallel, ignore errors
      yield* Effect.all(effects, {
        concurrency: 10,
        discard: true,
      }).pipe(Effect.catchAll(() => Effect.void));
    });

  private sendToTransport = (
    transport: LogTransport,
    entry: LogEntry
  ): Effect.Effect<void, never> =>
    Effect.gen(this, function* () {
      try {
        const sendEffect =
          transport.send instanceof Effect
            ? transport.send
            : Effect.tryPromise({
                try: () => Promise.resolve(transport.send(entry)),
                catch: () => undefined,
              });

        yield* sendEffect.pipe(Effect.catchAll(() => Effect.void));
      } catch (error) {
        // Silently ignore transport errors
        console.error(`Transport ${transport.name} failed:`, error);
      }
    });

  private createConsoleTransport = (): LogTransport => ({
    name: "console",
    send: (entry: LogEntry) => {
      const format = this.config.format || "pretty";

      if (format === "json") {
        console.log(JSON.stringify(entry));
      } else if (format === "text") {
        console.log(
          `[${entry.level.toUpperCase()}] ${entry.message}`,
          entry.metadata || ""
        );
      } else {
        // Pretty format
        const timestamp = new Date(entry.timestamp).toISOString();
        const level = entry.level.toUpperCase().padEnd(5);
        const contextStr = Object.keys(entry.context || {}).length
          ? ` [${JSON.stringify(entry.context)}]`
          : "";
        const metadataStr = entry.metadata
          ? ` ${JSON.stringify(entry.metadata, null, 2)}`
          : "";

        const logFn =
          entry.level === "error" || entry.level === "fatal"
            ? console.error
            : entry.level === "warn"
            ? console.warn
            : console.log;

        logFn(`${timestamp} ${level} ${entry.message}${contextStr}${metadataStr}`);
      }
    },
  });

  private createRemoteTransport = (endpoint: string): LogTransport => ({
    name: "remote",
    minLevel: "warn", // Only send warnings and errors to remote
    send: async (entry: LogEntry) => {
      try {
        await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(entry),
        });
      } catch (error) {
        // Silently ignore remote logging errors
        console.error("Remote logging failed:", error);
      }
    },
  });

  private formatError = (error: unknown): LogEntry["error"] => {
    if (error instanceof Error) {
      return {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    }

    return {
      name: "Unknown",
      message: String(error),
    };
  };
}

// ============================================================================
// SERVICE TAG (Dependency Injection)
// ============================================================================

export class LoggingService extends Context.Tag("LoggingService")<
  LoggingService,
  ILoggingService
>() {}

// ============================================================================
// LAYER FACTORY
// ============================================================================

/**
 * Create LoggingService layer with configuration
 *
 * @param config - Service configuration
 * @returns Effect Layer
 */
export const makeLoggingServiceLayer = (config?: LoggingConfig) =>
  LoggingService.of({
    ...new LoggingServiceImpl(config),
  });

/**
 * Default LoggingService layer
 */
export const LoggingServiceLive = makeLoggingServiceLayer();
