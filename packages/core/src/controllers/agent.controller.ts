import type { ReactiveController, ReactiveControllerHost } from 'lit';
import { StreamingController } from './streaming.controller.js';
import type {
  AgentProvider,
  AgentMessage,
  AgentMessageAttachment,
  AgentResponse,
} from '../providers/agent-provider.js';

export type AgentState = 'idle' | 'sending' | 'streaming' | 'paused' | 'complete' | 'error';

export interface AgentControllerOptions {
  /** Model identifier (e.g. "claude-sonnet-4-20250514") */
  model?: string;
  /** Inference parameters (temperature, top_p, max_tokens, etc.) */
  params?: Record<string, unknown>;
  /** System prompt to prepend to every send */
  systemPrompt?: string;

  /**
   * Timeout for provider.send() promise resolution in ms. Default: 60_000.
   * This is the time until the ReadableStream is returned, NOT until first chunk.
   */
  sendTimeout?: number;

  /** Maximum character length for a single message content. Default: 100_000 */
  maxMessageLength?: number;
  /** Maximum number of messages in conversation. Default: 200 */
  maxMessages?: number;

  // --- Callbacks ---

  /** Called when the response stream begins */
  onResponseStart?: (messageId: string) => void;
  /** Called for each text chunk */
  onResponseChunk?: (chunk: string, accumulated: string) => void;
  /** Called when the full response is received */
  onResponseComplete?: (message: AgentMessage) => void;
  /** Called on error */
  onError?: (error: Error) => void;
  /** Called when the controller state changes */
  onStateChange?: (state: AgentState) => void;
  /** Called when the messages array changes (for external sync/persistence) */
  onMessagesChange?: (messages: readonly AgentMessage[]) => void;
}

let _nextMsgId = 0;
function generateMessageId(): string {
  return `msg-${Date.now()}-${++_nextMsgId}`;
}

/**
 * AgentController — orchestrates AI/LLM conversations via an AgentProvider.
 *
 * Composes StreamingController internally for response streaming. Manages
 * conversation history, send lifecycle, abort, pause/resume, and payload limits.
 *
 * @example
 * ```ts
 * import { AgentController } from '@loquix/core/controllers/agent.controller';
 * import { MyAIProvider } from './my-ai-provider';
 *
 * class MyChat extends LitElement {
 *   private _agent = new AgentController(this, new MyAIProvider(), {
 *     model: 'claude-sonnet-4-20250514',
 *     onResponseComplete: (msg) => { ... },
 *   });
 *
 *   async handleSend(text: string) {
 *     await this._agent.send(text);
 *   }
 * }
 * ```
 */
export class AgentController implements ReactiveController {
  private _host: ReactiveControllerHost;
  private _provider: AgentProvider;
  private _streaming: StreamingController;
  private _options: AgentControllerOptions;

  private _state: AgentState = 'idle';
  private _messages: AgentMessage[] = [];
  private _abortController: AbortController | null = null;
  private _currentResponseId: string | null = null;
  private _currentResponse: AgentResponse | null = null;

  constructor(
    host: ReactiveControllerHost,
    provider: AgentProvider,
    options: AgentControllerOptions = {},
  ) {
    this._host = host;
    this._provider = provider;
    this._options = {
      sendTimeout: 60_000,
      maxMessageLength: 100_000,
      maxMessages: 200,
      ...options,
    };

    // Compose StreamingController — delegates stream consumption
    this._streaming = new StreamingController(host, {
      onChunk: (chunk, accumulated) => {
        this._options.onResponseChunk?.(chunk, accumulated);
      },
      onComplete: fullText => {
        this._handleStreamComplete(fullText);
      },
      onError: error => {
        this._setState('error');
        this._options.onError?.(error);
      },
      onStateChange: streamState => {
        // Map streaming controller states → agent states
        if (streamState === 'streaming') {
          this._setState('streaming');
        } else if (streamState === 'paused') {
          this._setState('paused');
        }
        // 'complete' and 'error' are handled in onComplete/onError callbacks
      },
    });

    host.addController(this);
  }

  hostConnected(): void {
    // No-op; conversations are started explicitly via send()
  }

  hostDisconnected(): void {
    this.abort();
  }

  // === Public getters ===

  /** Current controller state */
  get state(): AgentState {
    return this._state;
  }

  /** Full conversation history */
  get messages(): readonly AgentMessage[] {
    return this._messages;
  }

  /** Text accumulated so far in the current response */
  get currentResponseText(): string {
    return this._streaming.text;
  }

  /** Whether the controller is currently streaming a response */
  get isStreaming(): boolean {
    return this._state === 'streaming' || this._state === 'paused';
  }

  // === Public methods ===

  /**
   * Send a user message and start streaming the assistant's response.
   *
   * @param content - User message text
   * @param attachments - Optional file attachments
   * @throws Error if called while already streaming (must abort first)
   */
  async send(content: string, attachments?: AgentMessageAttachment[]): Promise<void> {
    // Guard: cannot send while streaming
    if (this._state === 'sending' || this._state === 'streaming' || this._state === 'paused') {
      throw new Error(
        `AgentController: cannot send() while in "${this._state}" state. Call abort() first.`,
      );
    }

    // Payload limits
    const maxLen = this._options.maxMessageLength ?? 100_000;
    if (content.length > maxLen) {
      throw new Error(
        `AgentController: message content exceeds maxMessageLength (${content.length} > ${maxLen})`,
      );
    }

    // Each send() adds a user message + assistant response = 2 messages.
    // Check that there is room for at least 2 more messages.
    const maxMsgs = this._options.maxMessages ?? 200;
    if (this._messages.length + 2 > maxMsgs) {
      throw new Error(
        `AgentController: conversation would exceed maxMessages (${this._messages.length} + 2 > ${maxMsgs})`,
      );
    }

    // Create and append user message
    const userMessage: AgentMessage = {
      id: generateMessageId(),
      role: 'user',
      content,
      attachments,
    };
    this._messages = [...this._messages, userMessage];
    this._options.onMessagesChange?.(this._messages);
    this._host.requestUpdate();

    // Create abort controller for this send cycle.
    // Capture local signal ref — abort() nulls _abortController, but the catch
    // block still needs to check if abort was the cause.
    this._abortController = new AbortController();
    const localSignal = this._abortController.signal;
    this._setState('sending');

    try {
      // Compose timeout signal with user abort signal
      const signals: AbortSignal[] = [localSignal];
      if (this._options.sendTimeout) {
        signals.push(AbortSignal.timeout(this._options.sendTimeout));
      }
      const composedSignal = AbortSignal.any(signals);

      // Call provider
      const response = await this._provider.send([...this._messages], {
        signal: composedSignal,
        model: this._options.model,
        params: this._options.params,
        systemPrompt: this._options.systemPrompt,
      });

      // If aborted while awaiting send(), bail out
      if (localSignal.aborted) {
        return;
      }

      this._currentResponse = response;
      this._currentResponseId = response.id;

      // Notify response start
      this._options.onResponseStart?.(response.id);

      // Delegate stream consumption to StreamingController
      // Note: connect() is async and runs the read loop, but we don't await it here.
      // StreamingController manages its own lifecycle via callbacks.
      this._streaming.connect(response.stream);
    } catch (error) {
      // If aborted, silently return to idle (abort() already set state)
      if (localSignal.aborted) {
        // abort() already set state to 'idle', so just return
        return;
      }

      this._setState('error');
      this._options.onError?.(error instanceof Error ? error : new Error(String(error)));
    }
  }

  /** Pause the response stream */
  pause(): void {
    this._streaming.pause();
  }

  /** Resume the response stream */
  resume(): void {
    this._streaming.resume();
  }

  /**
   * Abort the current request or stream.
   *
   * - During 'sending': cancels the provider.send() promise
   * - During 'streaming'/'paused': cancels the stream reader
   * - During 'idle'/'complete': no-op
   */
  abort(): void {
    // Signal the abort to cancel provider.send() if still in-flight
    this._abortController?.abort();
    this._abortController = null;

    // Cancel the stream reader if streaming
    if (this._state === 'streaming' || this._state === 'paused') {
      this._streaming.abort();
    }

    this._currentResponseId = null;
    this._currentResponse = null;

    if (this._state !== 'idle' && this._state !== 'complete') {
      this._setState('idle');
    }
  }

  /**
   * Reset: abort, clear messages, return to idle.
   */
  reset(): void {
    this.abort();
    this._messages = [];
    this._streaming.reset();
    this._options.onMessagesChange?.(this._messages);
    this._setState('idle');
    this._host.requestUpdate();
  }

  /**
   * Restore conversation from persistence.
   * Must be called while idle.
   */
  setMessages(messages: AgentMessage[]): void {
    if (this._state === 'sending' || this._state === 'streaming' || this._state === 'paused') {
      throw new Error(
        `AgentController: cannot setMessages() while in "${this._state}" state. Call abort() first.`,
      );
    }
    this._messages = [...messages];
    this._options.onMessagesChange?.(this._messages);
    this._host.requestUpdate();
  }

  /**
   * Swap the agent provider. Aborts in-flight requests if any.
   */
  setProvider(provider: AgentProvider): void {
    if (this._state !== 'idle' && this._state !== 'complete') {
      console.warn(
        `[AgentController] setProvider() called while in "${this._state}" state. Aborting.`,
      );
      this.abort();
    }
    this._provider = provider;
  }

  /**
   * Update options (model, params, systemPrompt, etc.) without swapping provider.
   */
  updateOptions(partial: Partial<AgentControllerOptions>): void {
    this._options = { ...this._options, ...partial };
  }

  // === Private methods ===

  /** Called by StreamingController when the stream completes */
  private _handleStreamComplete(fullText: string): void {
    // Guard: if abort() was called, the reader.cancel() may still resolve with
    // done=true, triggering StreamingController's onComplete. Ignore it.
    if (this._state === 'idle' || this._state === 'error') {
      return;
    }

    const assistantMessage: AgentMessage = {
      id: this._currentResponseId || generateMessageId(),
      role: 'assistant',
      content: fullText,
      metadata: this._currentResponse?.metadata,
    };

    this._messages = [...this._messages, assistantMessage];
    this._currentResponseId = null;
    this._currentResponse = null;
    this._abortController = null;

    this._setState('complete');
    this._options.onResponseComplete?.(assistantMessage);
    this._options.onMessagesChange?.(this._messages);
    this._host.requestUpdate();
  }

  private _setState(state: AgentState): void {
    if (this._state !== state) {
      this._state = state;
      this._options.onStateChange?.(state);
      this._host.requestUpdate();
    }
  }
}
