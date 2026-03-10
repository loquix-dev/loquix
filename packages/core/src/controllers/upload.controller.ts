import type { ReactiveController, ReactiveControllerHost } from 'lit';
import type { Attachment } from '../types/index.js';
import type { UploadProvider, UploadResult } from '../providers/upload-provider.js';

export type UploadState = 'idle' | 'uploading' | 'complete' | 'error';

export interface UploadControllerOptions {
  /** Maximum number of concurrent uploads. Default: 3 */
  concurrency?: number;
  /** Maximum retry attempts per file. Default: 2 */
  maxRetries?: number;
  /** Delay between retries in ms. Default: 1000 */
  retryDelay?: number;
  /** Per-file upload timeout in ms. Default: 300_000 (5 min) */
  uploadTimeout?: number;

  // --- Callbacks ---

  /** Called when an attachment's status or progress changes */
  onAttachmentUpdate?: (attachment: Attachment) => void;
  /** Called when a single file upload completes */
  onUploadComplete?: (attachment: Attachment, result: UploadResult) => void;
  /** Called when a single file upload fails (all retries exhausted) */
  onUploadError?: (attachment: Attachment, error: Error) => void;
  /**
   * Called when the entire queue is drained with zero errors.
   * Only fires when ALL queued files complete successfully.
   * If any file errored, this callback is NOT fired.
   */
  onAllComplete?: (results: ReadonlyMap<string, UploadResult>) => void;
  /** Called when the controller state changes */
  onStateChange?: (state: UploadState) => void;
}

/** Internal item in the upload queue */
interface QueueItem {
  attachment: Attachment;
  retryCount: number;
  abortController: AbortController;
}

/**
 * Sanitize a numeric option: return the value (floored to integer) if it's a
 * finite number >= min, otherwise return the default.
 * Prevents NaN/undefined/Infinity/fractional values from sneaking in.
 */
function _sanitizeInt(value: number | undefined, defaultValue: number, min: number): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.max(min, Math.floor(value));
  }
  return defaultValue;
}

/**
 * UploadController — orchestrates file uploads via an UploadProvider.
 *
 * Manages queue, concurrency, retry, abort, progress tracking, and URL validation.
 * Follows the same ReactiveController pattern as StreamingController.
 *
 * @example
 * ```ts
 * import { UploadController } from '@loquix/core/controllers/upload.controller';
 * import { MyUploadProvider } from './my-upload-provider';
 *
 * class MyHost extends LitElement {
 *   private _upload = new UploadController(this, new MyUploadProvider(), {
 *     concurrency: 3,
 *     onUploadComplete: (attachment, result) => { ... },
 *   });
 * }
 * ```
 */
export class UploadController implements ReactiveController {
  private _host: ReactiveControllerHost;
  private _provider: UploadProvider;
  private _options: Required<
    Pick<UploadControllerOptions, 'concurrency' | 'maxRetries' | 'retryDelay' | 'uploadTimeout'>
  > &
    UploadControllerOptions;

  private _state: UploadState = 'idle';
  private _queue: QueueItem[] = [];
  private _active: Map<string, QueueItem> = new Map();
  private _results: Map<string, UploadResult> = new Map();
  /** Retry timers keyed by attachment ID for per-attachment cancellation */
  private _retryTimers: Map<string, ReturnType<typeof setTimeout>> = new Map();
  private _erroredIds: Set<string> = new Set();
  /** Tracks the latest known state of every attachment that passed through the controller */
  private _trackedAttachments: Map<string, Attachment> = new Map();

  constructor(
    host: ReactiveControllerHost,
    provider: UploadProvider,
    options: UploadControllerOptions = {},
  ) {
    this._host = host;
    this._provider = provider;
    this._options = {
      ...options,
      // Sanitize numeric options: use finite values or defaults.
      // Must come AFTER spread so sanitized values overwrite any raw options.
      concurrency: _sanitizeInt(options.concurrency, 3, 1),
      maxRetries: _sanitizeInt(options.maxRetries, 2, 0),
      retryDelay: _sanitizeInt(options.retryDelay, 1000, 0),
      uploadTimeout: _sanitizeInt(options.uploadTimeout, 300_000, 1000),
    };

    host.addController(this);
  }

  hostConnected(): void {
    // No-op; uploads are started explicitly via add()
  }

  hostDisconnected(): void {
    this.abortAll();
  }

  // === Public getters ===

  /** Current controller state */
  get state(): UploadState {
    return this._state;
  }

  /** Completed upload results keyed by attachment ID */
  get results(): ReadonlyMap<string, UploadResult> {
    return this._results;
  }

  /** Number of currently in-flight uploads */
  get activeCount(): number {
    return this._active.size;
  }

  /** Number of items waiting in the queue */
  get queuedCount(): number {
    return this._queue.length;
  }

  // === Public methods ===

  /**
   * Queue attachments for upload.
   *
   * Each attachment is validated synchronously via `provider.validate()`.
   * Invalid files get `status: 'error'` immediately and are not queued.
   * Valid files are queued and processing begins immediately.
   */
  add(attachments: Attachment[]): void {
    for (const attachment of attachments) {
      // Track every attachment that passes through the controller
      this._trackedAttachments.set(attachment.id, attachment);

      // Skip if no File object
      if (!attachment.file) {
        const updated = { ...attachment, status: 'error' as const, error: 'No file provided' };
        this._trackedAttachments.set(attachment.id, updated);
        this._options.onAttachmentUpdate?.(updated);
        this._options.onUploadError?.(updated, new Error('No file provided'));
        this._erroredIds.add(attachment.id);
        continue;
      }

      // Synchronous validation via provider
      if (this._provider.validate) {
        const validationError = this._provider.validate(attachment.file);
        if (validationError) {
          const updated = { ...attachment, status: 'error' as const, error: validationError };
          this._trackedAttachments.set(attachment.id, updated);
          this._options.onAttachmentUpdate?.(updated);
          this._options.onUploadError?.(updated, new Error(validationError));
          this._erroredIds.add(attachment.id);
          continue;
        }
      }

      const item: QueueItem = {
        attachment: { ...attachment, status: 'pending', progress: 0 },
        retryCount: 0,
        abortController: new AbortController(),
      };

      this._queue.push(item);
    }

    this._drain();
  }

  /**
   * Retry a failed attachment by re-queuing it.
   * Resets its retry count and status.
   *
   * Only errored attachments can be retried. Retrying an active, queued,
   * or already-completed attachment is a no-op to prevent duplicate uploads.
   *
   * @throws Error if attachmentId is unknown (never passed through the controller)
   */
  retry(attachmentId: string): void {
    const existing = this._findAttachmentById(attachmentId);
    if (!existing) {
      throw new Error(
        `UploadController: cannot retry unknown attachment "${attachmentId}". ` +
          `Only attachments previously passed to add() can be retried.`,
      );
    }

    // Only allow retrying errored attachments — prevent duplicate uploads
    if (!this._erroredIds.has(attachmentId)) {
      return; // No-op for active, queued, or completed attachments
    }

    // Don't retry if the attachment has no file (e.g., no-file or validation error)
    if (!existing.file) {
      return; // Keep errored state — file-less attachments can't be uploaded
    }

    // Re-run provider validation if available
    if (this._provider.validate) {
      const validationError = this._provider.validate(existing.file);
      if (validationError) {
        return; // Keep errored state — still fails validation
      }
    }

    const item: QueueItem = {
      attachment: {
        ...existing,
        status: 'pending',
        progress: 0,
        error: undefined,
      },
      retryCount: 0,
      abortController: new AbortController(),
    };

    // Remove from results and error tracking
    this._results.delete(attachmentId);
    this._erroredIds.delete(attachmentId);
    this._queue.push(item);
    this._drain();
  }

  /**
   * Cancel a specific in-flight or queued upload.
   * Also clears any pending retry timer for this attachment.
   */
  cancel(attachmentId: string): void {
    // Remove from queue
    const queueIdx = this._queue.findIndex(item => item.attachment.id === attachmentId);
    if (queueIdx !== -1) {
      this._queue.splice(queueIdx, 1);
    }

    // Clear pending retry timer for this attachment
    const retryTimer = this._retryTimers.get(attachmentId);
    if (retryTimer !== undefined) {
      clearTimeout(retryTimer);
      this._retryTimers.delete(attachmentId);
    }

    // Abort if active
    const activeItem = this._active.get(attachmentId);
    if (activeItem) {
      activeItem.abortController.abort();
      this._active.delete(attachmentId);
    }

    this._updateState();
    // Drain queue in case cancellation freed a concurrency slot
    this._drain();
    this._host.requestUpdate();
  }

  /**
   * Abort all in-flight and queued uploads.
   * Clears retry timers. Does NOT clear results.
   */
  abortAll(): void {
    // Clear retry timers
    for (const [, timer] of this._retryTimers) {
      clearTimeout(timer);
    }
    this._retryTimers.clear();

    // Clear queue
    this._queue = [];

    // Abort all active
    for (const [, item] of this._active) {
      item.abortController.abort();
    }
    this._active.clear();

    this._updateState();
    this._host.requestUpdate();
  }

  /**
   * Abort all uploads, clear results, and reset to idle.
   */
  reset(): void {
    this.abortAll();
    this._results.clear();
    this._erroredIds.clear();
    this._trackedAttachments.clear();
    this._setState('idle');
  }

  /**
   * Swap the upload provider. Aborts in-flight uploads if any.
   */
  setProvider(provider: UploadProvider): void {
    if (this._state === 'uploading') {
      console.warn(
        `[UploadController] setProvider() called while uploading. ` +
          `Aborting ${this._active.size} active upload(s).`,
      );
      this.abortAll();
    }
    this._provider = provider;
  }

  // === Private methods ===

  /** Start uploading queued items up to concurrency limit */
  private _drain(): void {
    while (this._queue.length > 0 && this._active.size < this._options.concurrency) {
      const item = this._queue.shift()!;
      this._startUpload(item);
    }
    this._updateState();
  }

  /** Execute a single upload */
  private async _startUpload(item: QueueItem): Promise<void> {
    const { attachment, abortController } = item;
    const id = attachment.id;

    this._active.set(id, item);

    // Update attachment status
    const uploading: Attachment = { ...attachment, status: 'uploading', progress: 0 };
    item.attachment = uploading;
    this._trackedAttachments.set(id, uploading);
    this._options.onAttachmentUpdate?.(uploading);
    this._host.requestUpdate();

    try {
      // Compose timeout signal with the per-file abort signal
      const timeoutSignal = AbortSignal.timeout(this._options.uploadTimeout);
      const composedSignal = AbortSignal.any([abortController.signal, timeoutSignal]);

      const result = await this._provider.upload(attachment.file!, {
        signal: composedSignal,
        onProgress: progress => {
          // Guard: skip progress updates if upload was cancelled
          if (abortController.signal.aborted) return;
          const updated: Attachment = { ...item.attachment, progress };
          item.attachment = updated;
          this._options.onAttachmentUpdate?.(updated);
          this._host.requestUpdate();
        },
      });

      // Guard: if cancelled while awaiting upload, discard the result
      if (abortController.signal.aborted) {
        this._active.delete(id);
        this._drain();
        return;
      }

      // URL validation: parse and check protocol
      this._validateUrl(result.url);

      // Success
      this._active.delete(id);
      this._results.set(id, result);

      const completed: Attachment = {
        ...item.attachment,
        status: 'complete',
        progress: 100,
        url: result.url,
      };
      item.attachment = completed;
      this._trackedAttachments.set(id, completed);
      this._options.onAttachmentUpdate?.(completed);
      this._options.onUploadComplete?.(completed, result);
      this._host.requestUpdate();
    } catch (error) {
      this._active.delete(id);
      const err = error instanceof Error ? error : new Error(String(error));

      // Don't retry if aborted
      if (abortController.signal.aborted) {
        this._updateState();
        return;
      }

      // Retry if attempts remaining
      if (item.retryCount < this._options.maxRetries) {
        item.retryCount++;
        item.abortController = new AbortController(); // Fresh controller for retry

        const timer = setTimeout(() => {
          this._retryTimers.delete(id);
          this._queue.unshift(item); // Re-queue to front
          this._drain();
        }, this._options.retryDelay);

        this._retryTimers.set(id, timer);
        return;
      }

      // All retries exhausted
      this._erroredIds.add(id);
      const errored: Attachment = {
        ...item.attachment,
        status: 'error',
        error: err.message,
      };
      item.attachment = errored;
      this._trackedAttachments.set(id, errored);
      this._options.onAttachmentUpdate?.(errored);
      this._options.onUploadError?.(errored, err);
      this._host.requestUpdate();
    }

    // After each upload completes (success or error), try to drain more
    this._drain();

    // Check if everything is done
    if (this._active.size === 0 && this._queue.length === 0 && this._retryTimers.size === 0) {
      // Only fire onAllComplete when there are zero errors
      if (this._erroredIds.size === 0) {
        this._options.onAllComplete?.(this._results);
      }
    }
  }

  /**
   * Validate a URL returned by the provider.
   * Throws if the URL is malformed or not HTTPS.
   */
  private _validateUrl(url: string): void {
    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      throw new Error(`Invalid upload URL: ${url}`);
    }

    if (parsed.protocol !== 'https:') {
      throw new Error(`Upload URL must use HTTPS, got: ${parsed.protocol}`);
    }
  }

  /** Derive controller state from current queue/active state */
  private _updateState(): void {
    if (this._active.size > 0 || this._queue.length > 0 || this._retryTimers.size > 0) {
      this._setState('uploading');
    } else if (this._erroredIds.size > 0) {
      this._setState('error');
    } else if (this._results.size > 0) {
      this._setState('complete');
    } else {
      this._setState('idle');
    }
  }

  private _setState(state: UploadState): void {
    if (this._state !== state) {
      this._state = state;
      this._options.onStateChange?.(state);
      this._host.requestUpdate();
    }
  }

  /** Find an attachment by ID across queue, active, and tracked history */
  private _findAttachmentById(id: string): Attachment | undefined {
    const queued = this._queue.find(item => item.attachment.id === id);
    if (queued) return queued.attachment;

    const active = this._active.get(id);
    if (active) return active.attachment;

    // Check tracked attachments (includes errored/completed items)
    return this._trackedAttachments.get(id);
  }
}
