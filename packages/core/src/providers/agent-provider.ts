/**
 * Agent Provider — interface for AI/LLM backend integrations.
 *
 * Implementations live in separate packages (e.g., @loquix/vercel-ai, @loquix/langchain).
 * The AgentController consumes this interface to manage conversations.
 *
 * @example
 * ```ts
 * import type { AgentProvider } from '@loquix/core/providers/agent-provider';
 *
 * class MyAgent implements AgentProvider {
 *   readonly name = 'my-ai';
 *   async send(messages, options) { ... }
 * }
 * ```
 */

/**
 * A single message in the conversation history.
 * Kept intentionally minimal — providers map to their own formats internally.
 */
export interface AgentMessage {
  /** Unique identifier */
  id: string;

  /** Who sent this message */
  role: 'user' | 'assistant' | 'system' | 'tool';

  /** Text content of the message */
  content: string;

  /** Optional attachment references (URLs from completed uploads) */
  attachments?: AgentMessageAttachment[];

  /** Provider-specific metadata (e.g., tool call results, token counts) */
  metadata?: Record<string, unknown>;
}

/** An attachment reference within a message */
export interface AgentMessageAttachment {
  /** URL of the uploaded file */
  url: string;

  /** MIME type */
  mimeType: string;

  /** Original filename */
  filename?: string;
}

/** Options for sending a message */
export interface AgentSendOptions {
  /** AbortSignal for cancellation */
  signal?: AbortSignal;

  /** Model identifier to use (e.g., "claude-sonnet-4-20250514") */
  model?: string;

  /** Inference parameters (temperature, top_p, max_tokens, etc.) */
  params?: Record<string, unknown>;

  /** System prompt override */
  systemPrompt?: string;
}

/**
 * Response from the agent — contains a streaming text response.
 *
 * The `stream` is a standard `ReadableStream<string>` that the AgentController
 * delegates to its internal StreamingController for consumption.
 */
export interface AgentResponse {
  /** Unique message ID for this response */
  id: string;

  /** ReadableStream of text chunks for streaming responses */
  stream: ReadableStream<string>;

  /** Provider-specific metadata (e.g., model used, token counts, finish reason) */
  metadata?: Record<string, unknown>;
}

/**
 * Contract for AI/LLM backend providers.
 *
 * Providers handle all integration-specific logic: API authentication, message format
 * conversion, streaming protocol parsing, etc. The AgentController handles conversation
 * state, streaming lifecycle, abort, and host updates.
 */
export interface AgentProvider {
  /** Human-readable name (e.g., "Vercel AI SDK", "Claude API", "LangChain") */
  readonly name: string;

  /**
   * Send a message and get a streaming response.
   *
   * The provider receives the full conversation history and returns
   * a `ReadableStream<string>` for the assistant's reply. The provider is
   * responsible for converting messages to its native format and parsing
   * the streaming response back to plain text chunks.
   *
   * @param messages - Full conversation history
   * @param options - Model, params, abort signal
   * @returns An AgentResponse with a text stream
   * @throws Error on failure (network, auth, rate limit, etc.)
   */
  send(messages: AgentMessage[], options: AgentSendOptions): Promise<AgentResponse>;

  /**
   * Optional: List available models from this provider.
   *
   * Useful for populating `<loquix-model-selector>` dynamically.
   * If not implemented, model selection should use static configuration.
   */
  listModels?(): Promise<Array<{ id: string; name: string; description?: string }>>;
}
