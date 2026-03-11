import { LitElement, html, nothing, svg, type PropertyValues } from 'lit';
import { property, query } from 'lit/decorators.js';
import type { Attachment } from '../../types/index.js';
import { createLoquixEvent } from '../../events/index.js';
import type {
  LoquixAttachmentAddDetail,
  LoquixAttachmentRemoveDetail,
} from '../../events/index.js';
import { LocalizeController } from '../../i18n/index.js';
import styles from './loquix-attachment-panel.styles.js';

/**
 * @tag loquix-attachment-panel
 * @summary Container for managing file attachments with file picker and attachment chips.
 * Drag-and-drop is handled by the parent `loquix-chat-composer` via `loquix-drop-zone`.
 *
 * @csspart panel - The panel container
 * @csspart chips - The chips grid
 * @csspart trigger - The upload trigger button
 *
 * @slot trigger - Custom upload trigger button
 * @slot trigger-icon - Custom icon for the default trigger button
 *
 * @method openFilePicker - Opens the native file picker programmatically
 * @method addFiles - Programmatically add files (e.g. from paste or external drop)
 *
 * @fires loquix-attachment-add - Fired when files are added. Detail: { attachments }
 * @fires loquix-attachment-remove - Re-dispatched from child attachment-chip
 */
export class LoquixAttachmentPanel extends LitElement {
  static styles = [styles];

  private _localize = new LocalizeController(this);

  /** Array of current attachments. */
  @property({ type: Array })
  attachments: Attachment[] = [];

  /** Accepted file types (MIME or extension). */
  @property({ type: String, attribute: 'accepted-types' })
  acceptedTypes = '*';

  /** Maximum number of files allowed. */
  @property({ type: Number, attribute: 'max-files' })
  maxFiles = 10;

  /** Maximum file size in bytes (default: 10 MB). */
  @property({ type: Number, attribute: 'max-size' })
  maxSize = 10485760;

  /** Allow multiple file selection. */
  @property({ type: Boolean })
  multiple = true;

  /** Whether the panel is disabled. */
  @property({ type: Boolean, reflect: true })
  disabled = false;

  /** Hide the default trigger button. Use when providing an external upload button. */
  @property({ type: Boolean, reflect: true, attribute: 'no-trigger' })
  noTrigger = false;

  /** Label text for the default trigger button. */
  @property({ type: String, attribute: 'trigger-label' })
  triggerLabel?: string;

  // === Queries ===

  @query('.file-input')
  private _fileInput?: HTMLInputElement;

  // === Preview blob URLs ===

  /** Map of attachment id → blob URL for image previews. */
  private _previewUrls = new Map<string, string>();

  // === SVGs ===

  private _uploadSvg = svg`<svg class="trigger__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>`;

  // === Getters ===

  private get _isMaxReached(): boolean {
    return this.attachments.length >= this.maxFiles;
  }

  // === Preview helpers ===

  private _isImageFile(attachment: Attachment): boolean {
    const mime = attachment.filetype.toLowerCase();
    if (mime.startsWith('image/')) return true;
    const ext = attachment.filename.toLowerCase().split('.').pop() ?? '';
    return ['png', 'jpg', 'jpeg', 'gif', 'webp', 'avif'].includes(ext);
  }

  /**
   * Returns a blob URL preview for image attachments that have a File object.
   * Lazily creates and caches the URL to avoid re-creating on each render.
   */
  private _getPreviewUrl(attachment: Attachment): string | undefined {
    if (!this._isImageFile(attachment) || !attachment.file) return undefined;

    let url = this._previewUrls.get(attachment.id);
    if (!url) {
      url = URL.createObjectURL(attachment.file);
      this._previewUrls.set(attachment.id, url);
    }
    return url;
  }

  /** Revoke blob URLs for attachments no longer in the list. */
  private _cleanupPreviewUrls(): void {
    const activeIds = new Set(this.attachments.map(a => a.id));
    for (const [id, url] of this._previewUrls) {
      if (!activeIds.has(id)) {
        URL.revokeObjectURL(url);
        this._previewUrls.delete(id);
      }
    }
  }

  // === Lifecycle ===

  protected override updated(changed: PropertyValues): void {
    if (changed.has('attachments')) {
      this._cleanupPreviewUrls();
    }
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    // Revoke all blob URLs
    for (const url of this._previewUrls.values()) {
      URL.revokeObjectURL(url);
    }
    this._previewUrls.clear();
  }

  // === File handling ===

  private _handleTriggerClick(): void {
    this.openFilePicker();
  }

  /**
   * Programmatically opens the native file picker dialog.
   * Respects `disabled` and `maxFiles` constraints.
   */
  public openFilePicker(): void {
    if (this.disabled || this._isMaxReached) return;
    this._fileInput?.click();
  }

  /**
   * Programmatically add files (e.g. from paste or external drop).
   * Respects `disabled`, `acceptedTypes`, `maxSize`, and `maxFiles` constraints.
   */
  public addFiles(files: File[]): void {
    if (this.disabled) return;
    if (files.length === 0) return;
    this._emitValidFiles(files);
  }

  private _handleFileSelect(e: Event): void {
    const input = e.target as HTMLInputElement;
    if (!input.files?.length) return;
    this._emitValidFiles(input.files);
    // Reset input so the same file can be selected again
    input.value = '';
  }

  /**
   * Centralized validation for files from both the file-input and drag-and-drop.
   * Filters by acceptedTypes (MIME type and extension), maxSize, multiple flag,
   * and maxFiles remaining capacity. Returns the validated subset of files.
   */
  private _processFiles(files: FileList | File[]): File[] {
    let candidates = Array.from(files);

    // --- Filter by acceptedTypes ---
    const accepted = this.acceptedTypes?.trim();
    if (accepted && accepted !== '*' && accepted !== '*/*') {
      const tokens = this.acceptedTypes
        .split(',')
        .map(t => t.trim().toLowerCase())
        .filter(Boolean);

      candidates = candidates.filter(file => {
        const mimeType = file.type.toLowerCase();
        const fileName = file.name.toLowerCase();
        const ext = fileName.includes('.') ? `.${fileName.split('.').pop()}` : '';

        return tokens.some(token => {
          // Universal wildcard token, e.g. "*" or "*/*"
          if (token === '*' || token === '*/*') {
            return true;
          }
          // Exact extension match, e.g. ".pdf"
          if (token.startsWith('.')) {
            return ext === token;
          }
          // Wildcard MIME, e.g. "image/*"
          if (token.endsWith('/*')) {
            const prefix = token.slice(0, -1); // "image/"
            return mimeType.startsWith(prefix);
          }
          // Exact MIME match, e.g. "application/pdf"
          return mimeType === token;
        });
      });
    }

    // --- Filter by maxSize ---
    if (this.maxSize > 0) {
      candidates = candidates.filter(file => file.size <= this.maxSize);
    }

    // --- Enforce multiple=false (take only the first file) ---
    if (!this.multiple) {
      candidates = candidates.slice(0, 1);
    }

    // --- Enforce maxFiles (only take up to remaining capacity) ---
    const remaining = this.maxFiles - this.attachments.length;
    candidates = candidates.slice(0, Math.max(0, remaining));

    return candidates;
  }

  /** Run validation then dispatch the attachment-add event. */
  private _emitValidFiles(files: FileList | File[]): void {
    const filesToAdd = this._processFiles(files);

    const attachments: Attachment[] = filesToAdd.map(file => ({
      id: crypto.randomUUID(),
      file,
      filename: file.name,
      filetype: file.type || file.name.split('.').pop() || '',
      size: file.size,
      status: 'pending' as const,
      progress: 0,
    }));

    if (attachments.length > 0) {
      this.dispatchEvent(
        createLoquixEvent<LoquixAttachmentAddDetail>('loquix-attachment-add', {
          attachments,
        }),
      );
    }
  }

  // === Child chip events ===

  private _handleChipRemove(e: Event, attachment: Attachment): void {
    // Stop the child chip's bubbling event so consumers only receive
    // the panel-level re-dispatch, not a duplicate from the chip.
    e.stopPropagation();

    this.dispatchEvent(
      createLoquixEvent<LoquixAttachmentRemoveDetail>('loquix-attachment-remove', {
        attachment,
      }),
    );
  }

  // === Render ===

  protected render() {
    return html`
      <div part="panel" class="panel">
        <input
          class="file-input"
          type="file"
          .accept=${this.acceptedTypes}
          ?multiple=${this.multiple}
          @change=${this._handleFileSelect}
        />

        ${this.attachments.length > 0
          ? html`
              <div part="chips" class="chips">
                ${this.attachments.map(
                  a => html`
                    <loquix-attachment-chip
                      .filename=${a.filename}
                      .filetype=${a.filetype}
                      .size=${a.size}
                      .purpose=${a.purpose}
                      .status=${a.status}
                      .progress=${a.progress ?? 0}
                      .attachmentId=${a.id}
                      .preview=${this._getPreviewUrl(a) ?? ''}
                      @loquix-attachment-remove=${(e: Event) => this._handleChipRemove(e, a)}
                    ></loquix-attachment-chip>
                  `,
                )}
              </div>
            `
          : nothing}
        ${!this.noTrigger && !this._isMaxReached
          ? html`
              <slot name="trigger">
                <button
                  part="trigger"
                  class="trigger"
                  ?disabled=${this.disabled}
                  @click=${this._handleTriggerClick}
                >
                  <slot name="trigger-icon">${this._uploadSvg}</slot>
                  <span
                    >${this.triggerLabel ??
                    this._localize.term('attachmentPanel.triggerLabel')}</span
                  >
                </button>
              </slot>
            `
          : nothing}
      </div>
    `;
  }
}
