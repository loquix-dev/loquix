/**
 * Upload Provider — interface for file upload integrations.
 *
 * Implementations live in separate packages (e.g., @loquix/uploadcare, @loquix/supabase).
 * The UploadController consumes this interface to orchestrate uploads.
 *
 * @example
 * ```ts
 * import type { UploadProvider } from '@loquix/core/providers/upload-provider';
 *
 * class MyProvider implements UploadProvider {
 *   readonly name = 'my-storage';
 *   async upload(file, options) { ... }
 * }
 * ```
 *
 * Security: Provider implementations MUST NOT embed secret keys client-side.
 * Operations requiring secrets (delete, signed uploads) must use a server-side proxy.
 */

/** Result returned after a successful upload */
export interface UploadResult {
  /** Public or signed URL of the uploaded file */
  url: string;

  /**
   * Provider-specific asset identifier for deletion/management.
   * E.g., Uploadcare UUID, S3 key, Supabase path.
   * Used by `delete()` to identify the asset without parsing the URL.
   */
  assetId?: string;

  /**
   * Optional CDN/transformed URL variants.
   * E.g., `{ thumbnail: 'https://...', webp: 'https://...' }`
   */
  variants?: Record<string, string>;

  /**
   * Provider-specific metadata.
   * E.g., `{ uuid: '...', isImage: true, imageInfo: { width: 800, height: 600 } }`
   */
  metadata?: Record<string, unknown>;
}

/** Options passed to each upload call */
export interface UploadOptions {
  /** AbortSignal for cancellation */
  signal?: AbortSignal;

  /** Progress callback: 0–100 */
  onProgress?: (progress: number) => void;
}

/**
 * Contract for file upload providers.
 *
 * Providers handle all integration-specific logic: authentication, multipart uploads,
 * presigned URLs, CDN configuration, etc. The UploadController handles queue management,
 * retry logic, concurrency, and host updates.
 */
export interface UploadProvider {
  /** Human-readable name for debugging/logging (e.g., "Uploadcare", "S3") */
  readonly name: string;

  /**
   * Upload a single file.
   *
   * The implementation handles all provider-specific logic (auth, multipart,
   * presigned URLs, etc.). The UploadController manages retries on failure.
   *
   * @param file - The File object to upload
   * @param options - Abort signal and progress callback
   * @returns The upload result with URL and optional metadata
   * @throws Error on failure (UploadController handles retries)
   */
  upload(file: File, options: UploadOptions): Promise<UploadResult>;

  /**
   * Delete a previously uploaded asset.
   *
   * Receives the full `UploadResult` so the provider can extract its native
   * asset identifier from `result.assetId` or `result.metadata`, rather than
   * parsing a potentially-transformed URL.
   *
   * Note: Many providers require a secret key for deletion. This should be
   * handled via a server-side proxy, never by embedding secrets client-side.
   */
  delete?(result: UploadResult): Promise<void>;

  /**
   * Synchronous pre-upload validation.
   *
   * Called before the file enters the upload queue. Return an error message
   * string if the file is invalid, or `undefined` if valid.
   *
   * Use for checks that don't require network: file size, MIME type, extension.
   *
   * @param file - The File object to validate
   * @returns Error message string, or undefined if valid
   */
  validate?(file: File): string | undefined;
}
