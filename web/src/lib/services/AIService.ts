/**
 * AIService - Effect.ts service for AI operations
 *
 * Cycle 37: Effect.ts service for AI operations
 * - Functions: complete, stream, embed, moderate
 * - OpenRouter integration
 * - Effect streaming support
 */

import { Effect, Data, Stream } from "effect";

// ============================================================================
// Error Types
// ============================================================================

export class AIError extends Data.TaggedError("AIError")<{
  operation: "complete" | "stream" | "embed" | "moderate";
  reason: string;
}> {}

export class AIRateLimitError extends Data.TaggedError("AIRateLimitError")<{
  retryAfter: number; // seconds
  provider: string;
}> {}

export class AIInvalidInputError extends Data.TaggedError("AIInvalidInputError")<{
  field: string;
  message: string;
}> {}

export class AIContentFilterError extends Data.TaggedError("AIContentFilterError")<{
  category: string;
  reason: string;
}> {}

// ============================================================================
// Types
// ============================================================================

export type AIProvider = "openrouter" | "openai" | "anthropic" | "custom";

export type AIModel =
  | "gpt-4-turbo"
  | "gpt-3.5-turbo"
  | "claude-3-opus"
  | "claude-3-sonnet"
  | "claude-3-haiku"
  | "mistral-large"
  | "llama-3-70b"
  | string; // Allow custom models

export type Message = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type CompletionOptions = {
  model?: AIModel;
  temperature?: number; // 0-1
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stop?: string[];
  apiKey?: string;
  provider?: AIProvider;
};

export type CompletionResult = {
  content: string;
  model: string;
  tokens: {
    prompt: number;
    completion: number;
    total: number;
  };
  finishReason: "stop" | "length" | "content_filter" | "tool_calls";
};

export type StreamChunk = {
  delta: string;
  index: number;
  finishReason?: "stop" | "length" | "content_filter";
};

export type EmbeddingOptions = {
  model?: string;
  apiKey?: string;
  provider?: AIProvider;
};

export type EmbeddingResult = {
  embedding: number[];
  model: string;
  tokens: number;
};

export type ModerationResult = {
  flagged: boolean;
  categories: {
    sexual: boolean;
    hate: boolean;
    harassment: boolean;
    selfHarm: boolean;
    violence: boolean;
    graphicViolence: boolean;
  };
  categoryScores: {
    sexual: number;
    hate: number;
    harassment: number;
    selfHarm: number;
    violence: number;
    graphicViolence: number;
  };
};

// ============================================================================
// Configuration
// ============================================================================

const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";
const DEFAULT_MODEL: AIModel = "gpt-3.5-turbo";
const DEFAULT_MAX_TOKENS = 1000;
const DEFAULT_TEMPERATURE = 0.7;

// ============================================================================
// Validation
// ============================================================================

const validateMessages = (
  messages: Message[]
): Effect.Effect<Message[], AIInvalidInputError> =>
  Effect.gen(function* () {
    if (!messages || messages.length === 0) {
      return yield* new AIInvalidInputError({
        field: "messages",
        message: "At least one message is required",
      });
    }

    for (const message of messages) {
      if (!message.role || !["system", "user", "assistant"].includes(message.role)) {
        return yield* new AIInvalidInputError({
          field: "message.role",
          message: `Invalid role: ${message.role}`,
        });
      }

      if (!message.content || typeof message.content !== "string") {
        return yield* new AIInvalidInputError({
          field: "message.content",
          message: "Message content must be a non-empty string",
        });
      }
    }

    return messages;
  });

const validateAPIKey = (
  apiKey: string | undefined,
  provider: AIProvider
): Effect.Effect<string, AIInvalidInputError> =>
  Effect.gen(function* () {
    const key = apiKey || import.meta.env.OPENROUTER_API_KEY;

    if (!key) {
      return yield* new AIInvalidInputError({
        field: "apiKey",
        message: `API key required for provider: ${provider}`,
      });
    }

    return key;
  });

// ============================================================================
// OpenRouter API Client
// ============================================================================

const openRouterComplete = (
  messages: Message[],
  apiKey: string,
  options: CompletionOptions
): Effect.Effect<CompletionResult, AIError | AIRateLimitError> =>
  Effect.tryPromise({
    try: async () => {
      const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer": typeof window !== "undefined" ? window.location.origin : "",
          "X-Title": "ONE Platform",
        },
        body: JSON.stringify({
          model: options.model || DEFAULT_MODEL,
          messages,
          temperature: options.temperature ?? DEFAULT_TEMPERATURE,
          max_tokens: options.maxTokens ?? DEFAULT_MAX_TOKENS,
          top_p: options.topP,
          frequency_penalty: options.frequencyPenalty,
          presence_penalty: options.presencePenalty,
          stop: options.stop,
        }),
      });

      if (response.status === 429) {
        const retryAfter = parseInt(response.headers.get("retry-after") || "60", 10);
        throw new AIRateLimitError({
          retryAfter,
          provider: "openrouter",
        });
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(error.error?.message || `HTTP ${response.status}`);
      }

      const data = await response.json();

      return {
        content: data.choices[0]?.message?.content || "",
        model: data.model,
        tokens: {
          prompt: data.usage?.prompt_tokens || 0,
          completion: data.usage?.completion_tokens || 0,
          total: data.usage?.total_tokens || 0,
        },
        finishReason: data.choices[0]?.finish_reason || "stop",
      };
    },
    catch: (error) => {
      if (error instanceof AIRateLimitError) {
        return error;
      }
      return new AIError({
        operation: "complete",
        reason: error instanceof Error ? error.message : "Unknown error",
      });
    },
  });

// ============================================================================
// Service Functions
// ============================================================================

/**
 * Complete a chat conversation
 */
export const complete = (
  messages: Message[],
  options: CompletionOptions = {}
): Effect.Effect<CompletionResult, AIError | AIRateLimitError | AIInvalidInputError> =>
  Effect.gen(function* () {
    // Validate inputs
    const validMessages = yield* validateMessages(messages);
    const apiKey = yield* validateAPIKey(options.apiKey, options.provider || "openrouter");

    // Call provider
    const provider = options.provider || "openrouter";

    switch (provider) {
      case "openrouter":
        return yield* openRouterComplete(validMessages, apiKey, options);
      default:
        return yield* new AIError({
          operation: "complete",
          reason: `Unsupported provider: ${provider}`,
        });
    }
  });

/**
 * Stream a chat conversation
 */
export const stream = (
  messages: Message[],
  options: CompletionOptions = {}
): Effect.Effect<Stream.Stream<StreamChunk, AIError | AIRateLimitError | AIInvalidInputError>, AIError | AIInvalidInputError> =>
  Effect.gen(function* () {
    // Validate inputs
    const validMessages = yield* validateMessages(messages);
    const apiKey = yield* validateAPIKey(options.apiKey, options.provider || "openrouter");

    // Create stream
    return Stream.make(
      Effect.tryPromise({
        try: async () => {
          const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
              "HTTP-Referer": typeof window !== "undefined" ? window.location.origin : "",
              "X-Title": "ONE Platform",
            },
            body: JSON.stringify({
              model: options.model || DEFAULT_MODEL,
              messages: validMessages,
              temperature: options.temperature ?? DEFAULT_TEMPERATURE,
              max_tokens: options.maxTokens ?? DEFAULT_MAX_TOKENS,
              stream: true,
            }),
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }

          if (!response.body) {
            throw new Error("No response body");
          }

          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let buffer = "";
          let index = 0;

          const chunks: StreamChunk[] = [];

          while (true) {
            const { done, value } = await reader.read();

            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6);
                if (data === "[DONE]") break;

                try {
                  const parsed = JSON.parse(data);
                  const delta = parsed.choices[0]?.delta?.content || "";
                  const finishReason = parsed.choices[0]?.finish_reason;

                  if (delta || finishReason) {
                    chunks.push({
                      delta,
                      index: index++,
                      finishReason,
                    });
                  }
                } catch {
                  // Skip invalid JSON
                }
              }
            }
          }

          return chunks;
        },
        catch: (error) =>
          new AIError({
            operation: "stream",
            reason: error instanceof Error ? error.message : "Unknown error",
          }),
      })
    ).pipe(Stream.flatMap((chunks) => Stream.fromIterable(chunks)));
  });

/**
 * Generate embeddings for text
 */
export const embed = (
  text: string,
  options: EmbeddingOptions = {}
): Effect.Effect<EmbeddingResult, AIError | AIInvalidInputError> =>
  Effect.gen(function* () {
    if (!text || text.trim().length === 0) {
      return yield* new AIInvalidInputError({
        field: "text",
        message: "Text is required for embeddings",
      });
    }

    const apiKey = yield* validateAPIKey(options.apiKey, options.provider || "openrouter");

    return yield* Effect.tryPromise({
      try: async () => {
        const response = await fetch(`${OPENROUTER_BASE_URL}/embeddings`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: options.model || "text-embedding-ada-002",
            input: text,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        return {
          embedding: data.data[0]?.embedding || [],
          model: data.model,
          tokens: data.usage?.total_tokens || 0,
        };
      },
      catch: (error) =>
        new AIError({
          operation: "embed",
          reason: error instanceof Error ? error.message : "Unknown error",
        }),
    });
  });

/**
 * Moderate content for safety
 */
export const moderate = (
  text: string,
  options: { apiKey?: string } = {}
): Effect.Effect<ModerationResult, AIError | AIInvalidInputError> =>
  Effect.gen(function* () {
    if (!text || text.trim().length === 0) {
      return yield* new AIInvalidInputError({
        field: "text",
        message: "Text is required for moderation",
      });
    }

    const apiKey = yield* validateAPIKey(options.apiKey, "openrouter");

    return yield* Effect.tryPromise({
      try: async () => {
        const response = await fetch(`${OPENROUTER_BASE_URL}/moderations`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            input: text,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        const result = data.results[0];

        return {
          flagged: result.flagged,
          categories: {
            sexual: result.categories.sexual,
            hate: result.categories.hate,
            harassment: result.categories.harassment,
            selfHarm: result.categories["self-harm"],
            violence: result.categories.violence,
            graphicViolence: result.categories["violence/graphic"],
          },
          categoryScores: {
            sexual: result.category_scores.sexual,
            hate: result.category_scores.hate,
            harassment: result.category_scores.harassment,
            selfHarm: result.category_scores["self-harm"],
            violence: result.category_scores.violence,
            graphicViolence: result.category_scores["violence/graphic"],
          },
        };
      },
      catch: (error) =>
        new AIError({
          operation: "moderate",
          reason: error instanceof Error ? error.message : "Unknown error",
        }),
    });
  });

// ============================================================================
// Batch Operations
// ============================================================================

/**
 * Complete multiple conversations in parallel
 */
export const batchComplete = (
  requests: Array<{ messages: Message[]; options?: CompletionOptions }>
): Effect.Effect<CompletionResult[], AIError | AIRateLimitError | AIInvalidInputError> =>
  Effect.all(
    requests.map(({ messages, options }) => complete(messages, options)),
    { concurrency: 5 } // Limit concurrent requests
  );

/**
 * Embed multiple texts in parallel
 */
export const batchEmbed = (
  texts: string[],
  options: EmbeddingOptions = {}
): Effect.Effect<EmbeddingResult[], AIError | AIInvalidInputError> =>
  Effect.all(
    texts.map((text) => embed(text, options)),
    { concurrency: 10 }
  );

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Create a system message
 */
export const systemMessage = (content: string): Message => ({
  role: "system",
  content,
});

/**
 * Create a user message
 */
export const userMessage = (content: string): Message => ({
  role: "user",
  content,
});

/**
 * Create an assistant message
 */
export const assistantMessage = (content: string): Message => ({
  role: "assistant",
  content,
});

/**
 * Simple chat completion with single user message
 */
export const chat = (
  prompt: string,
  systemPrompt?: string,
  options?: CompletionOptions
): Effect.Effect<string, AIError | AIRateLimitError | AIInvalidInputError> =>
  Effect.gen(function* () {
    const messages: Message[] = [];

    if (systemPrompt) {
      messages.push(systemMessage(systemPrompt));
    }

    messages.push(userMessage(prompt));

    const result = yield* complete(messages, options);
    return result.content;
  });
