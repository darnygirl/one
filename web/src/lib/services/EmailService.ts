/**
 * EmailService - Effect.ts email notifications
 *
 * Cycle 39: Effect.ts email notifications
 * - Functions: send, sendTemplate, sendBatch
 * - Email provider integration
 * - Effect queuing
 */

import { Effect, Data, Queue } from "effect";

// ============================================================================
// Error Types
// ============================================================================

export class EmailError extends Data.TaggedError("EmailError")<{
  operation: "send" | "sendTemplate" | "sendBatch";
  reason: string;
}> {}

export class EmailValidationError extends Data.TaggedError("EmailValidationError")<{
  field: string;
  message: string;
}> {}

export class EmailRateLimitError extends Data.TaggedError("EmailRateLimitError")<{
  retryAfter: number; // seconds
}> {}

export class EmailTemplateNotFoundError extends Data.TaggedError("EmailTemplateNotFoundError")<{
  templateId: string;
}> {}

// ============================================================================
// Types
// ============================================================================

export type EmailAddress = {
  email: string;
  name?: string;
};

export type Email = {
  from: EmailAddress;
  to: EmailAddress[];
  cc?: EmailAddress[];
  bcc?: EmailAddress[];
  subject: string;
  text?: string;
  html?: string;
  attachments?: EmailAttachment[];
  headers?: Record<string, string>;
  tags?: string[];
  metadata?: Record<string, unknown>;
};

export type EmailAttachment = {
  filename: string;
  content: string | Buffer; // Base64 or Buffer
  contentType?: string;
  contentId?: string; // For inline images
};

export type EmailTemplate = {
  id: string;
  name: string;
  subject: string;
  html: string;
  text?: string;
  variables: string[];
};

export type EmailTemplateData = Record<string, string | number | boolean>;

export type SendEmailOptions = {
  provider?: EmailProvider;
  apiKey?: string;
  dryRun?: boolean; // Don't actually send, just validate
  priority?: "high" | "normal" | "low";
  scheduledAt?: Date; // Send at specific time
};

export type EmailProvider = "resend" | "sendgrid" | "mailgun" | "ses" | "postmark";

export type SendEmailResult = {
  id: string;
  status: "sent" | "queued" | "scheduled";
  provider: EmailProvider;
  sentAt: number;
};

export type EmailStats = {
  sent: number;
  failed: number;
  queued: number;
  provider: EmailProvider;
};

// ============================================================================
// Configuration
// ============================================================================

const DEFAULT_PROVIDER: EmailProvider = "resend";
const DEFAULT_FROM: EmailAddress = {
  email: "noreply@one.ie",
  name: "ONE Platform",
};

// ============================================================================
// Validation
// ============================================================================

const validateEmailAddress = (
  email: string
): Effect.Effect<string, EmailValidationError> =>
  Effect.gen(function* () {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || !email.trim()) {
      return yield* new EmailValidationError({
        field: "email",
        message: "Email address is required",
      });
    }

    if (!emailRegex.test(email)) {
      return yield* new EmailValidationError({
        field: "email",
        message: `Invalid email format: ${email}`,
      });
    }

    return email.trim().toLowerCase();
  });

const validateEmail = (
  email: Email
): Effect.Effect<Email, EmailValidationError> =>
  Effect.gen(function* () {
    // Validate from address
    yield* validateEmailAddress(email.from.email);

    // Validate to addresses
    if (!email.to || email.to.length === 0) {
      return yield* new EmailValidationError({
        field: "to",
        message: "At least one recipient is required",
      });
    }

    for (const recipient of email.to) {
      yield* validateEmailAddress(recipient.email);
    }

    // Validate cc addresses
    if (email.cc) {
      for (const recipient of email.cc) {
        yield* validateEmailAddress(recipient.email);
      }
    }

    // Validate bcc addresses
    if (email.bcc) {
      for (const recipient of email.bcc) {
        yield* validateEmailAddress(recipient.email);
      }
    }

    // Validate subject
    if (!email.subject || email.subject.trim().length === 0) {
      return yield* new EmailValidationError({
        field: "subject",
        message: "Email subject is required",
      });
    }

    // Validate content
    if (!email.text && !email.html) {
      return yield* new EmailValidationError({
        field: "content",
        message: "Email must have either text or html content",
      });
    }

    return email;
  });

// ============================================================================
// Email Providers
// ============================================================================

/**
 * Send email via Resend
 */
const sendViaResend = (
  email: Email,
  apiKey: string
): Effect.Effect<SendEmailResult, EmailError | EmailRateLimitError> =>
  Effect.tryPromise({
    try: async () => {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          from: email.from.name
            ? `${email.from.name} <${email.from.email}>`
            : email.from.email,
          to: email.to.map((r) =>
            r.name ? `${r.name} <${r.email}>` : r.email
          ),
          cc: email.cc?.map((r) =>
            r.name ? `${r.name} <${r.email}>` : r.email
          ),
          bcc: email.bcc?.map((r) =>
            r.name ? `${r.name} <${r.email}>` : r.email
          ),
          subject: email.subject,
          text: email.text,
          html: email.html,
          attachments: email.attachments,
          tags: email.tags,
        }),
      });

      if (response.status === 429) {
        const retryAfter = parseInt(response.headers.get("retry-after") || "60", 10);
        throw new EmailRateLimitError({ retryAfter });
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      const data = await response.json();

      return {
        id: data.id,
        status: "sent" as const,
        provider: "resend" as const,
        sentAt: Date.now(),
      };
    },
    catch: (error) => {
      if (error instanceof EmailRateLimitError) {
        return error;
      }
      return new EmailError({
        operation: "send",
        reason: error instanceof Error ? error.message : "Unknown error",
      });
    },
  });

/**
 * Send email via provider
 */
const sendViaProvider = (
  email: Email,
  provider: EmailProvider,
  apiKey: string
): Effect.Effect<SendEmailResult, EmailError | EmailRateLimitError> =>
  Effect.gen(function* () {
    switch (provider) {
      case "resend":
        return yield* sendViaResend(email, apiKey);

      case "sendgrid":
      case "mailgun":
      case "ses":
      case "postmark":
        // TODO: Implement other providers
        return yield* new EmailError({
          operation: "send",
          reason: `Provider ${provider} not yet implemented`,
        });

      default:
        return yield* new EmailError({
          operation: "send",
          reason: `Unknown provider: ${provider}`,
        });
    }
  });

// ============================================================================
// Service Functions
// ============================================================================

/**
 * Send a single email
 */
export const send = (
  email: Email,
  options: SendEmailOptions = {}
): Effect.Effect<SendEmailResult, EmailError | EmailValidationError | EmailRateLimitError> =>
  Effect.gen(function* () {
    // Validate email
    const validEmail = yield* validateEmail(email);

    // Dry run mode
    if (options.dryRun) {
      console.log("[EmailService] Dry run - would send:", validEmail);
      return {
        id: `dryrun_${Date.now()}`,
        status: "sent" as const,
        provider: options.provider || DEFAULT_PROVIDER,
        sentAt: Date.now(),
      };
    }

    // Get API key
    const apiKey = options.apiKey || import.meta.env.RESEND_API_KEY;
    if (!apiKey) {
      return yield* new EmailError({
        operation: "send",
        reason: "API key not configured",
      });
    }

    // Get provider
    const provider = options.provider || DEFAULT_PROVIDER;

    // Handle scheduled emails
    if (options.scheduledAt) {
      // In a real implementation, this would queue the email
      console.log(`[EmailService] Scheduled email for ${options.scheduledAt}`);
      return {
        id: `scheduled_${Date.now()}`,
        status: "scheduled" as const,
        provider,
        sentAt: Date.now(),
      };
    }

    // Send email
    return yield* sendViaProvider(validEmail, provider, apiKey);
  });

/**
 * Send email using template
 */
export const sendTemplate = (
  templateId: string,
  to: EmailAddress[],
  data: EmailTemplateData,
  options: SendEmailOptions = {}
): Effect.Effect<SendEmailResult, EmailError | EmailValidationError | EmailTemplateNotFoundError | EmailRateLimitError> =>
  Effect.gen(function* () {
    // Get template
    const template = yield* getTemplate(templateId);

    // Render template
    const subject = renderTemplate(template.subject, data);
    const html = template.html ? renderTemplate(template.html, data) : undefined;
    const text = template.text ? renderTemplate(template.text, data) : undefined;

    // Create email
    const email: Email = {
      from: DEFAULT_FROM,
      to,
      subject,
      html,
      text,
    };

    // Send email
    return yield* send(email, options);
  });

/**
 * Send multiple emails in batch
 */
export const sendBatch = (
  emails: Email[],
  options: SendEmailOptions = {}
): Effect.Effect<SendEmailResult[], EmailError | EmailValidationError | EmailRateLimitError> =>
  Effect.gen(function* () {
    // Process emails in parallel with rate limiting
    return yield* Effect.all(
      emails.map((email) => send(email, options)),
      { concurrency: 5 } // Max 5 concurrent sends
    );
  });

/**
 * Send batch with retry on individual failures
 */
export const sendBatchWithRetry = (
  emails: Email[],
  options: SendEmailOptions = {},
  maxRetries: number = 3
): Effect.Effect<Array<SendEmailResult | EmailError>, never> =>
  Effect.all(
    emails.map((email) =>
      send(email, options).pipe(
        Effect.retry({ times: maxRetries }),
        Effect.either
      )
    ),
    { concurrency: 5 }
  ).pipe(
    Effect.map((results) =>
      results.map((result) =>
        result._tag === "Right" ? result.right : result.left
      )
    )
  );

// ============================================================================
// Email Templates
// ============================================================================

const TEMPLATES: Record<string, EmailTemplate> = {
  welcome: {
    id: "welcome",
    name: "Welcome Email",
    subject: "Welcome to {{platformName}}!",
    html: `
      <h1>Welcome to {{platformName}}, {{userName}}!</h1>
      <p>We're excited to have you on board.</p>
      <p>Get started by exploring our platform.</p>
    `,
    text: "Welcome to {{platformName}}, {{userName}}! We're excited to have you on board.",
    variables: ["platformName", "userName"],
  },
  passwordReset: {
    id: "passwordReset",
    name: "Password Reset",
    subject: "Reset your password",
    html: `
      <h1>Reset your password</h1>
      <p>Click the link below to reset your password:</p>
      <a href="{{resetUrl}}">Reset Password</a>
      <p>This link will expire in {{expiresIn}} minutes.</p>
    `,
    text: "Reset your password: {{resetUrl}} (expires in {{expiresIn}} minutes)",
    variables: ["resetUrl", "expiresIn"],
  },
  invitation: {
    id: "invitation",
    name: "Team Invitation",
    subject: "You've been invited to {{teamName}}",
    html: `
      <h1>You've been invited to join {{teamName}}</h1>
      <p>{{inviterName}} has invited you to join their team.</p>
      <a href="{{inviteUrl}}">Accept Invitation</a>
    `,
    text: "You've been invited to join {{teamName}} by {{inviterName}}. Accept: {{inviteUrl}}",
    variables: ["teamName", "inviterName", "inviteUrl"],
  },
  notification: {
    id: "notification",
    name: "Generic Notification",
    subject: "{{title}}",
    html: `
      <h1>{{title}}</h1>
      <p>{{message}}</p>
      {{#if actionUrl}}
      <a href="{{actionUrl}}">{{actionText}}</a>
      {{/if}}
    `,
    text: "{{title}}\n\n{{message}}",
    variables: ["title", "message", "actionUrl", "actionText"],
  },
};

/**
 * Get email template
 */
const getTemplate = (
  templateId: string
): Effect.Effect<EmailTemplate, EmailTemplateNotFoundError> =>
  Effect.gen(function* () {
    const template = TEMPLATES[templateId];

    if (!template) {
      return yield* new EmailTemplateNotFoundError({ templateId });
    }

    return template;
  });

/**
 * Render template with data
 */
const renderTemplate = (template: string, data: EmailTemplateData): string => {
  let result = template;

  for (const [key, value] of Object.entries(data)) {
    const regex = new RegExp(`{{${key}}}`, "g");
    result = result.replace(regex, String(value));
  }

  return result;
};

/**
 * List available templates
 */
export const listTemplates = (): Effect.Effect<EmailTemplate[], never> =>
  Effect.succeed(Object.values(TEMPLATES));

// ============================================================================
// Email Queue
// ============================================================================

export type EmailQueue = Queue.Queue<Email>;

/**
 * Create email queue
 */
export const createQueue = (capacity: number = 1000): Effect.Effect<EmailQueue, never> =>
  Queue.bounded<Email>(capacity);

/**
 * Add email to queue
 */
export const enqueue = (
  queue: EmailQueue,
  email: Email
): Effect.Effect<void, never> =>
  Queue.offer(queue, email).pipe(
    Effect.map(() => undefined)
  );

/**
 * Process email queue
 */
export const processQueue = (
  queue: EmailQueue,
  options: SendEmailOptions = {}
): Effect.Effect<void, never> =>
  Effect.gen(function* () {
    while (true) {
      const email = yield* Queue.take(queue);

      // Send email with error handling
      yield* send(email, options).pipe(
        Effect.catchAll((error) =>
          Effect.sync(() => {
            console.error("[EmailService] Queue processing error:", error);
          })
        )
      );
    }
  }).pipe(Effect.forever);

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Create email address
 */
export const createAddress = (email: string, name?: string): EmailAddress => ({
  email,
  name,
});

/**
 * Create simple text email
 */
export const createTextEmail = (
  to: string | EmailAddress[],
  subject: string,
  text: string,
  from?: EmailAddress
): Email => ({
  from: from || DEFAULT_FROM,
  to: Array.isArray(to) ? to : [{ email: to }],
  subject,
  text,
});

/**
 * Create HTML email
 */
export const createHtmlEmail = (
  to: string | EmailAddress[],
  subject: string,
  html: string,
  from?: EmailAddress
): Email => ({
  from: from || DEFAULT_FROM,
  to: Array.isArray(to) ? to : [{ email: to }],
  subject,
  html,
});

/**
 * Send welcome email
 */
export const sendWelcomeEmail = (
  to: EmailAddress,
  userName: string,
  options?: SendEmailOptions
): Effect.Effect<SendEmailResult, EmailError | EmailValidationError | EmailTemplateNotFoundError | EmailRateLimitError> =>
  sendTemplate(
    "welcome",
    [to],
    {
      platformName: "ONE Platform",
      userName,
    },
    options
  );

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = (
  to: EmailAddress,
  resetUrl: string,
  expiresIn: number = 30,
  options?: SendEmailOptions
): Effect.Effect<SendEmailResult, EmailError | EmailValidationError | EmailTemplateNotFoundError | EmailRateLimitError> =>
  sendTemplate(
    "passwordReset",
    [to],
    {
      resetUrl,
      expiresIn,
    },
    options
  );

/**
 * Send team invitation email
 */
export const sendInvitationEmail = (
  to: EmailAddress,
  teamName: string,
  inviterName: string,
  inviteUrl: string,
  options?: SendEmailOptions
): Effect.Effect<SendEmailResult, EmailError | EmailValidationError | EmailTemplateNotFoundError | EmailRateLimitError> =>
  sendTemplate(
    "invitation",
    [to],
    {
      teamName,
      inviterName,
      inviteUrl,
    },
    options
  );

/**
 * Get email statistics
 */
export const getStats = (
  provider: EmailProvider = DEFAULT_PROVIDER
): Effect.Effect<EmailStats, EmailError> =>
  Effect.succeed({
    sent: 0,
    failed: 0,
    queued: 0,
    provider,
  });
