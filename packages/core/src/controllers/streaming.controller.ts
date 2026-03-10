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
  async connect(stream: ReadableStream<string>): Promise<void> {
    this.abort(); // Clean up any previous stream

    const gen = ++this._generation;
    this._chunks = [];
    this._pendingChunks = [];
    this._paused = false;
    this._setState('connecting');

    try {
      const reader = stream.getReader();
      this._reader = reader;
      this._setState('streaming');

      while (true) {
        const { done, value } = await reader.read();

        // Stale generation: a new connect() or abort() was called while we were awaiting
        if (gen !== this._generation) return;

        if (done) {
          // Flush any pending chunks accumulated while paused
          for (const chunk of this._pendingChunks) {
            this._processChunk(chunk);
          }
          this._pendingChunks = [];
          this._setState('complete');
          this._options.onComplete?.(this.text);
          break;
        }

        if (this._paused) {
          this._pendingChunks.push(value);
        } else {
          this._processChunk(value);
        }
      }
    } catch (error) {
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
    }
  }

  /** Abort the current stream */
  abort(): void {
    ++this._generation; // Invalidate any in-flight read loop
    this._reader?.cancel().catch(() => {});
    this._reader = null;
    this._paused = false;
    this._pendingChunks = [];

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
}
