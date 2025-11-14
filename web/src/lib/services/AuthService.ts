/**
 * Cycle 32: AuthService - Effect.ts authentication service
 *
 * Provides authentication with Better Auth integration.
 * Uses Effect.ts for error handling, logging, and session management.
 */

import { Context, Effect, Layer, pipe } from "effect";
import { OntologyErrors } from "@/lib/ontology/errors";
import type {
  UnauthorizedError,
  ValidationError,
  OperationFailedError,
} from "@/lib/ontology/errors";

// ============================================================================
// Auth Types
// ============================================================================

export interface Session {
  id: string;
  userId: string;
  email: string;
  expiresAt: number;
  createdAt: number;
  metadata?: Record<string, unknown>;
}

export interface AuthToken {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// ============================================================================
// Service Interface
// ============================================================================

export interface IAuthService {
  /**
   * Login with email and password
   */
  login(
    credentials: LoginCredentials
  ): Effect.Effect<
    { session: Session; token: AuthToken },
    ValidationError | UnauthorizedError
  >;

  /**
   * Logout and invalidate session
   */
  logout(sessionId: string): Effect.Effect<void, UnauthorizedError>;

  /**
   * Validate a session
   */
  validateSession(
    sessionId: string
  ): Effect.Effect<Session, UnauthorizedError>;

  /**
   * Refresh access token
   */
  refreshToken(
    request: RefreshTokenRequest
  ): Effect.Effect<AuthToken, UnauthorizedError | OperationFailedError>;

  /**
   * Get current session
   */
  getCurrentSession(): Effect.Effect<Session | null, never>;

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): Effect.Effect<boolean, never>;

  /**
   * Register new user
   */
  register(
    email: string,
    password: string,
    name?: string
  ): Effect.Effect<
    { session: Session; token: AuthToken },
    ValidationError | OperationFailedError
  >;

  /**
   * Request password reset
   */
  requestPasswordReset(
    email: string
  ): Effect.Effect<void, ValidationError>;

  /**
   * Reset password with token
   */
  resetPassword(
    token: string,
    newPassword: string
  ): Effect.Effect<void, ValidationError | UnauthorizedError>;
}

// ============================================================================
// Service Context Tag
// ============================================================================

export class AuthService extends Context.Tag("AuthService")<
  AuthService,
  IAuthService
>() {}

// ============================================================================
// Service Implementation
// ============================================================================

export const makeAuthService = (): IAuthService => {
  // In-memory stores for demo (replace with Better Auth integration)
  const sessions = new Map<string, Session>();
  const refreshTokens = new Map<string, string>(); // refreshToken -> userId
  const users = new Map<
    string,
    { email: string; password: string; name?: string }
  >();

  let currentSession: Session | null = null;

  return {
    login: (credentials: LoginCredentials) =>
      Effect.gen(function* () {
        yield* Effect.log("AuthService.login", { email: credentials.email });

        // Validate credentials
        if (!credentials.email || !credentials.email.includes("@")) {
          return yield* Effect.fail(
            OntologyErrors.validation(
              "email",
              credentials.email,
              "Invalid email address"
            )
          );
        }

        if (!credentials.password || credentials.password.length < 8) {
          return yield* Effect.fail(
            OntologyErrors.validation(
              "password",
              "",
              "Password must be at least 8 characters"
            )
          );
        }

        // Check user exists (mock)
        const user = users.get(credentials.email);
        if (!user || user.password !== credentials.password) {
          return yield* Effect.fail(
            OntologyErrors.unauthorized("not_authenticated")
          );
        }

        // Create session
        const session: Session = {
          id: \`session_\${Date.now()}_\${Math.random().toString(36).substr(2, 9)}\`,
          userId: \`user_\${credentials.email}\`,
          email: credentials.email,
          expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
          createdAt: Date.now(),
        };

        sessions.set(session.id, session);
        currentSession = session;

        // Generate tokens
        const token: AuthToken = {
          accessToken: \`access_\${Date.now()}_\${Math.random().toString(36).substr(2, 9)}\`,
          refreshToken: \`refresh_\${Date.now()}_\${Math.random().toString(36).substr(2, 9)}\`,
          expiresIn: 3600, // 1 hour
        };

        refreshTokens.set(token.refreshToken, session.userId);

        yield* Effect.log("AuthService.login.success", {
          userId: session.userId,
          sessionId: session.id,
        });

        return { session, token };
      }),

    logout: (sessionId: string) =>
      Effect.gen(function* () {
        yield* Effect.log("AuthService.logout", { sessionId });

        const session = sessions.get(sessionId);
        if (!session) {
          return yield* Effect.fail(
            OntologyErrors.unauthorized("not_authenticated")
          );
        }

        // Remove session
        sessions.delete(sessionId);

        // Clear current session if it matches
        if (currentSession?.id === sessionId) {
          currentSession = null;
        }

        // Remove associated refresh tokens
        for (const [token, userId] of refreshTokens.entries()) {
          if (userId === session.userId) {
            refreshTokens.delete(token);
          }
        }

        yield* Effect.log("AuthService.logout.success", { sessionId });
      }),

    validateSession: (sessionId: string) =>
      Effect.gen(function* () {
        yield* Effect.log("AuthService.validateSession", { sessionId });

        const session = sessions.get(sessionId);
        if (!session) {
          return yield* Effect.fail(
            OntologyErrors.unauthorized("not_authenticated")
          );
        }

        // Check expiration
        if (session.expiresAt < Date.now()) {
          sessions.delete(sessionId);
          return yield* Effect.fail(
            OntologyErrors.unauthorized("not_authenticated")
          );
        }

        yield* Effect.log("AuthService.validateSession.success", {
          sessionId,
        });

        return session;
      }),

    refreshToken: (request: RefreshTokenRequest) =>
      Effect.gen(function* () {
        yield* Effect.log("AuthService.refreshToken");

        const userId = refreshTokens.get(request.refreshToken);
        if (!userId) {
          return yield* Effect.fail(
            OntologyErrors.unauthorized("not_authenticated")
          );
        }

        // Generate new tokens
        const token: AuthToken = {
          accessToken: \`access_\${Date.now()}_\${Math.random().toString(36).substr(2, 9)}\`,
          refreshToken: \`refresh_\${Date.now()}_\${Math.random().toString(36).substr(2, 9)}\`,
          expiresIn: 3600, // 1 hour
        };

        // Remove old refresh token
        refreshTokens.delete(request.refreshToken);

        // Store new refresh token
        refreshTokens.set(token.refreshToken, userId);

        yield* Effect.log("AuthService.refreshToken.success", { userId });

        return token;
      }),

    getCurrentSession: () =>
      Effect.gen(function* () {
        yield* Effect.log("AuthService.getCurrentSession");

        if (!currentSession) {
          return null;
        }

        // Check if expired
        if (currentSession.expiresAt < Date.now()) {
          sessions.delete(currentSession.id);
          currentSession = null;
          return null;
        }

        return currentSession;
      }),

    isAuthenticated: () =>
      Effect.gen(function* () {
        const session = yield* Effect.succeed(currentSession);

        if (!session) {
          return false;
        }

        // Check if expired
        if (session.expiresAt < Date.now()) {
          return false;
        }

        return true;
      }),

    register: (email: string, password: string, name?: string) =>
      Effect.gen(function* () {
        yield* Effect.log("AuthService.register", { email, name });

        // Validate input
        if (!email || !email.includes("@")) {
          return yield* Effect.fail(
            OntologyErrors.validation("email", email, "Invalid email address")
          );
        }

        if (!password || password.length < 8) {
          return yield* Effect.fail(
            OntologyErrors.validation(
              "password",
              "",
              "Password must be at least 8 characters"
            )
          );
        }

        // Check if user already exists
        if (users.has(email)) {
          return yield* Effect.fail(
            OntologyErrors.operationFailed(
              "register",
              "Email already registered"
            )
          );
        }

        // Create user
        users.set(email, { email, password, name });

        // Create session
        const session: Session = {
          id: \`session_\${Date.now()}_\${Math.random().toString(36).substr(2, 9)}\`,
          userId: \`user_\${email}\`,
          email,
          expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
          createdAt: Date.now(),
          metadata: { name },
        };

        sessions.set(session.id, session);
        currentSession = session;

        // Generate tokens
        const token: AuthToken = {
          accessToken: \`access_\${Date.now()}_\${Math.random().toString(36).substr(2, 9)}\`,
          refreshToken: \`refresh_\${Date.now()}_\${Math.random().toString(36).substr(2, 9)}\`,
          expiresIn: 3600, // 1 hour
        };

        refreshTokens.set(token.refreshToken, session.userId);

        yield* Effect.log("AuthService.register.success", {
          userId: session.userId,
          sessionId: session.id,
        });

        return { session, token };
      }),

    requestPasswordReset: (email: string) =>
      Effect.gen(function* () {
        yield* Effect.log("AuthService.requestPasswordReset", { email });

        // Validate email
        if (!email || !email.includes("@")) {
          return yield* Effect.fail(
            OntologyErrors.validation("email", email, "Invalid email address")
          );
        }

        // In production, send reset email
        yield* Effect.log("AuthService.requestPasswordReset.success", {
          email,
          message: "Password reset email sent (mock)",
        });
      }),

    resetPassword: (token: string, newPassword: string) =>
      Effect.gen(function* () {
        yield* Effect.log("AuthService.resetPassword");

        // Validate password
        if (!newPassword || newPassword.length < 8) {
          return yield* Effect.fail(
            OntologyErrors.validation(
              "password",
              "",
              "Password must be at least 8 characters"
            )
          );
        }

        // In production, validate token and update password
        yield* Effect.log("AuthService.resetPassword.success", {
          message: "Password reset successful (mock)",
        });
      }),
  };
};

// ============================================================================
// Service Layer
// ============================================================================

export const AuthServiceLive = Layer.succeed(AuthService, makeAuthService());

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Run an AuthService effect with live dependencies
 */
export const runAuthService = <E, A>(
  effect: Effect.Effect<A, E, AuthService>
): Promise<A> =>
  pipe(effect, Effect.provide(AuthServiceLive), Effect.runPromise);
