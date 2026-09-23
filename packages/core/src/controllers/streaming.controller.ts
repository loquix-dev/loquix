import type { ReactiveController, ReactiveControllerHost } from 'lit';

export type StreamingState = 'idle' | 'connecting' | 'streaming' | 'paused' | 'complete' | 'error';

export interface StreamingControllerOptions {
  /** Called for each chunk of text received */
  onChunk?: (chunk: string, accumulated: string) => void;
  /** Called when streaming completes */
  onComplete?: (fullText: string) => void;
  /** Called on error */
  onError?: (error: Error) => void;
  /** Called when state changes */
  onStateChange?: (state: StreamingState) => void;
}

/** Per-`connect()` call options. */
export interface StreamingConnectOptions {
  /**
   * Abort the stream if no chunk arrives within this many ms. Resets on every
   * chunk. Default: 60_000. Set 0 to disable.
   *
   * Suspended while the stream is `paused` — a consumer that paused is not a
   * stalled server, so idle time spent paused never counts against it.
   */
  idleTimeout?: number;
}

/**
 * Sanitize a millisecond timeout option.
 *
 * - `undefined` → `defaultValue` (the feature is enabled with its default window)
 * - any non-finite or non-positive number (`NaN`, `±Infinity`, negative, or `0`)
 *   → `0`, meaning "disabled". This guarantees a pathological value can never
 *   reach `setTimeout`/`AbortSignal.timeout` and misbehave — notably, negative
 *   values used to make `AbortSignal.timeout(-1)` throw a `RangeError`.
 * - a finite positive number → returned as-is
 */
export function sanitizeTimeoutMs(value: number | undefined, defaultValue: number): number {
  if (value === undefined) return defaultValue;
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) return 0;
  return value;
}

/**
 * StreamingController — manages ReadableStream lifecycle for AI text streaming.
 * Handles connect, pause, resume, abort, and chunk buffering.
 *
 * Used in: loquix-message-content, host applications
 */
export class StreamingController implements ReactiveController {
  private host: ReactiveControllerHost;
  private _reader: ReadableStreamDefaultReader<string> | null = null;
  private _chunks: string[] = [];
  private _state: StreamingState = 'idle';
  private _options: StreamingControllerOptions;
  private _paused = false;
  private _pendingChunks: string[] = [];
  private _generation = 0;
  private _idleTimer: ReturnType<typeof setTimeout> | null = null;
  private _idleTimeoutMs = 0;

  constructor(host: ReactiveControllerHost, options: StreamingControllerOptions = {}) {
    this.host = host;
    this._options = options;
    host.addController(this);
  }

  hostConnected(): void {
    // No-op; streaming is started explicitly
  }

  hostDisconnected(): void {
    this.abort();
  }

  /** Current streaming state */
  get state(): StreamingState {
    return this._state;
  }

  /** Accumulated text so far */
  get text(): string {
    return this._chunks.join('');
  }

  /** All chunks received */
  get chunks(): readonly string[] {
    return this._chunks;
  }

  /** Connect to a ReadableStream and start consuming */
  async connect(stream: ReadableStream<string>, options?: StreamingConnectOptions): Promise<void> {
    this.abort(); // Clean up any previous stream

    const gen = ++this._generation;
    this._chunks = [];
    this._pendingChunks = [];
    this._paused = false;
    this._idleTimeoutMs = sanitizeTimeoutMs(options?.idleTimeout, 60_000);
    this._setState('connecting');

    try {
      const reader = stream.getReader();
      this._reader = reader;
      this._setState('streaming');
      this._armIdleTimer(gen);

      while (true) {
        const { done, value } = await reader.read();

        // Stale generation: a new connect() or abort() was called while we were awaiting
        if (gen !== this._generation) return;

        if (done) {
          this._clearIdleTimer();
          // Flush any pending chunks accumulated while paused
          for (const chunk of this._pendingChunks) {
            this._processChunk(chunk);
          }
          this._pendingChunks = [];
          this._setState('complete');
          this._options.onComplete?.(this.text);
          break;
        }

        // A chunk arrived — the stream is not idle. This is a no-op while
        // paused (arming is suspended for the duration of the pause).
        this._armIdleTimer(gen);

        if (this._paused) {
          this._pendingChunks.push(value);
        } else {
          this._processChunk(value);
        }
      }
    } catch (error) {
      this._clearIdleTimer();

      // Stale generation: ignore errors from superseded streams
      if (gen !== this._generation) return;

      if (this._state !== 'idle') {
        this._setState('error');
        this._options.onError?.(error instanceof Error ? error : new Error(String(error)));
      }
    } finally {
      // Only clean up reader if this is still the active generation
      if (gen === this._generation) {
        this._reader = null;
      }
    }
  }

  /** Pause streaming (chunks are buffered) */
  pause(): void {
    if (this._state === 'streaming') {
      this._paused = true;
      // Suspend the idle timer — a paused consumer is not a stalled server,
      // so time spent paused must never count as idle silence.
      this._clearIdleTimer();
      this._setState('paused');
    }
  }

  /** Resume streaming (flush buffered chunks) */
  resume(): void {
    if (this._state === 'paused') {
      this._paused = false;
      // Flush pending chunks
      for (const chunk of this._pendingChunks) {
        this._processChunk(chunk);
      }
      this._pendingChunks = [];
      this._setState('streaming');
      // Give the stream a fresh idle window now that we're consuming again.
      this._armIdleTimer(this._generation);
    }
  }

  /** Abort the current stream */
  abort(): void {
    ++this._generation; // Invalidate any in-flight read loop
    this._reader?.cancel().catch(() => {});
    this._reader = null;
    this._paused = false;
    this._pendingChunks = [];
    this._clearIdleTimer();

    if (this._state !== 'idle' && this._state !== 'complete') {
      this._setState('idle');
    }
  }

  /** Reset to initial state */
  reset(): void {
    this.abort();
    this._chunks = [];
    this._setState('idle');
  }

  private _processChunk(chunk: string): void {
    this._chunks.push(chunk);
    this._options.onChunk?.(chunk, this.text);
    this.host.requestUpdate();
  }

  private _setState(state: StreamingState): void {
    this._state = state;
    this._options.onStateChange?.(state);
    this.host.requestUpdate();
  }

  /**
   * (Re)arm the idle timer for generation `gen`. A no-op while disabled
   * (`_idleTimeoutMs <= 0`) or paused — pausing suspends idle detection
   * entirely rather than letting it keep counting down.
   */
  private _armIdleTimer(gen: number): void {
    this._clearIdleTimer();
    if (this._idleTimeoutMs <= 0 || this._paused) return;
    this._idleTimer = setTimeout(() => {
      this._handleIdleTimeout(gen);
    }, this._idleTimeoutMs);
  }

  private _clearIdleTimer(): void {
    if (this._idleTimer !== null) {
      clearTimeout(this._idleTimer);
      this._idleTimer = null;
    }
  }

  /** Called when no chunk has arrived within `streamIdleTimeout`. */
  private _handleIdleTimeout(gen: number): void {
    // Stale generation: already superseded by a new connect()/abort().
    if (gen !== this._generation) return;

    ++this._generation; // Invalidate the in-flight read loop
    this._reader?.cancel().catch(() => {});
    this._reader = null;
    this._idleTimer = null;
    this._paused = false;
    this._pendingChunks = [];

    if (this._state !== 'idle' && this._state !== 'complete') {
      this._setState('error');
      this._options.onError?.(
        new DOMException(
          'StreamingController: no chunk received within streamIdleTimeout',
          'TimeoutError',
        ),
      );
    }
  }
}
