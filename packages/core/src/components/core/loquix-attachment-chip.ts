import { LitElement, html, nothing, svg, type PropertyValues } from 'lit';
import { property, query } from 'lit/decorators.js';
import type { AttachmentStatus, AttachmentPurpose, Attachment } from '../../types/index.js';
import { createLoquixEvent } from '../../events/index.js';
import type {
  LoquixAttachmentRemoveDetail,
  LoquixAttachmentRetryDetail,
} from '../../events/index.js';
import { LocalizeController } from '../../i18n/index.js';
import styles from './loquix-attachment-chip.styles.js';

/**
 * @tag loquix-attachment-chip
 * @summary Displays a single file attachment with icon, name, size, remove/retry actions, and error tooltip.
 *
 * @slot icon - Custom icon/preview content. Overrides both `preview` URL and auto-detected emoji icon.
 *
 * @csspart chip - The chip container
 * @csspart icon - The icon/preview area
 * @csspart remove - The remove button
 * @csspart retry - The retry button
 * @csspart error-tooltip - The error tooltip popover
 *
 * @cssprop [--loquix-attachment-chip-bg=rgba(0,0,0,0.04)] - Chip background
 * @cssprop [--loquix-attachment-chip-border-color=rgba(0,0,0,0.08)] - Chip border color
 * @cssprop [--loquix-attachment-chip-border-radius=8px] - Chip border radius
 * @cssprop [--loquix-attachment-chip-color=inherit] - Chip text color
 * @cssprop [--loquix-attachment-chip-padding=6px 10px] - Chip padding
 * @cssprop [--loquix-attachment-chip-font-size=0.8125rem] - Chip font size
 * @cssprop [--loquix-attachment-chip-progress-color] - Upload progress bar color
 * @cssprop [--loquix-attachment-chip-progress-sweep-bg] - Sweep highlight gradient (set to `none` to disable)
 * @cssprop [--loquix-attachment-chip-progress-sweep] - Sweep animation shorthand (set to `none` to disable)
 * @cssprop [--loquix-attachment-chip-error-color] - Error state color
 * @cssprop [--loquix-attachment-chip-filename-max-width] - Max width for filename (CSS, overridden by max-filename-length)
 * @cssprop [--loquix-attachment-chip-preview-size=28px] - Preview thumbnail size
 * @cssprop [--loquix-attachment-chip-preview-radius=4px] - Preview thumbnail border radius
 *
 * @fires loquix-attachment-remove - Fired when the remove button is clicked. Detail: { attachment }
 * @fires loquix-attachment-retry - Fired when the retry button is clicked on an errored chip. Detail: { attachment }
 */
export class LoquixAttachmentChip extends LitElement {
  static styles = [styles];

  private _localize = new LocalizeController(this);

  /** Display filename */
  @property({ type: String })
  filename = '';

  /** MIME type or extension shorthand (e.g. 'image/png', 'pdf', 'ts') */
  @property({ type: String })
  filetype = '';

  /** File size in bytes */
  @property({ type: Number })
  size = 0;

  /** Semantic purpose of this attachment */
  @property({ type: String, reflect: true })
  purpose: AttachmentPurpose | undefined;

  /** Whether the chip can be removed */
  @property({ type: Boolean, reflect: true })
  removable = true;

  /** Upload/processing status */
  @property({ type: String, reflect: true })
  status: AttachmentStatus = 'complete';

  /** Upload progress 0-100 */
  @property({ type: Number })
  progress = 0;

  /** Unique attachment id (used in events) */
  @property({ type: String, attribute: 'attachment-id' })
  attachmentId = '';

  /** Error message (shown in tooltip when status is 'error') */
  @property({ type: String })
  error = '';

  /** Max filename length before truncation (0 = no limit, uses CSS text-overflow) */
  @property({ type: Number, attribute: 'max-filename-length' })
  maxFilenameLength = 0;

  /** Hides the retry button on error state */
  @property({ type: Boolean, reflect: true, attribute: 'no-retry' })
  noRetry = false;

  /** URL for a thumbnail preview image (shown instead of the auto emoji icon) */
  @property({ type: String })
  preview = '';

  @query('#error-tooltip')
  private _tooltipEl!: HTMLElement | null;

  /**
   * Sanitised preview URL — allows blob:, https:, http: protocols.
   * For data: URLs, only `data:image/*` is permitted (excluding `data:image/svg+xml`
   * which can contain executable scripts).
   */
  private get _safePreviewUrl(): string {
    if (!this.preview) return '';
    try {
      const parsed = new URL(this.preview, window.location.href);
      if (['https:', 'http:', 'blob:'].includes(parsed.protocol)) return this.preview;
      if (parsed.protocol === 'data:') {
        const lower = this.preview.toLowerCase();
        if (lower.startsWith('data:image/') && !lower.startsWith('data:image/svg+xml')) {
          return this.preview;
        }
        return '';
      }
      return '';
    } catch {
      return '';
    }
  }

  /** Captured chip width before a status change re-render */
  private _prevWidth = 0;

  /** Timer id for deferred cleanup after width transition */
  private _widthTimer = 0;

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    window.clearTimeout(this._widthTimer);
  }

  // === Smooth width transition on status change ===
  //
  // Two concerns:
  //  1. When *status* changes (e.g. error → uploading), elements appear/disappear
  //     and the chip width can jump.  We animate width between old & new values.
  //  2. While status is "uploading" or "pending", the status label text keeps
  //     changing ("Connecting…" → "3%" → "15%" …) causing micro-shifts.
  //     We lock `min-width` for the duration of that status to prevent jitter.
  //
  // The lock is applied *synchronously* — in the same JS task that clears the
  // animation's inline `width` — so the browser never paints an unlocked frame.

  protected willUpdate(changed: PropertyValues): void {
    if (changed.has('status') && this.renderRoot) {
      const chip = this.renderRoot.querySelector('.chip') as HTMLElement | null;
      if (chip) {
        // Capture width the user currently sees (including any min-width lock)
        this._prevWidth = chip.offsetWidth;
        // Clear the lock so updated() can measure the natural new width
        chip.style.minWidth = '';
      }
    }
  }

  protected firstUpdated(): void {
    // If the chip starts in an in-progress status, lock width immediately
    if (this.status === 'uploading' || this.status === 'pending') {
      const chip = this.renderRoot.querySelector('.chip') as HTMLElement | null;
      if (chip) chip.style.minWidth = `${chip.offsetWidth}px`;
    }
  }

  protected updated(changed: PropertyValues): void {
    if (!changed.has('status') || this._prevWidth <= 0) return;

    const chip = this.renderRoot.querySelector('.chip') as HTMLElement | null;
    if (!chip) {
      this._prevWidth = 0;
      return;
    }

    const newWidth = chip.offsetWidth;
    const needsTransition = Math.abs(newWidth - this._prevWidth) > 1;
    const isInProgress = this.status === 'uploading' || this.status === 'pending';

    if (needsTransition) {
      // Animate from old width → new width
      window.clearTimeout(this._widthTimer);
      chip.style.width = `${this._prevWidth}px`;
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions -- force reflow
      chip.offsetWidth;
      chip.style.transition = 'width 0.2s ease, border-color 0.15s ease, background 0.15s ease';
      chip.style.width = `${newWidth}px`;

      this._widthTimer = window.setTimeout(() => {
        // Clear animation styles and lock min-width in the SAME synchronous
        // block so the browser never paints an intermediate unlocked frame.
        chip.style.transition = '';
        if (isInProgress) {
          chip.style.minWidth = `${newWidth}px`;
        }
        chip.style.width = '';
      }, 220);
    } else {
      // No visible jump, but still lock if in-progress
      if (isInProgress) chip.style.minWidth = `${newWidth}px`;
    }

    this._prevWidth = 0;
  }

  // === Attachment object builder ===

  private get _attachment(): Attachment {
    return {
      id: this.attachmentId,
      filename: this.filename,
      filetype: this.filetype,
      size: this.size,
      purpose: this.purpose,
      status: this.status,
      progress: this.progress,
      error: this.error || undefined,
    };
  }

  // === Private helpers ===

  private _formatSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    const k = 1024;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const val = bytes / Math.pow(k, i);
    return `${val < 10 ? val.toFixed(1) : Math.round(val)} ${units[i]}`;
  }

  private _getFileIcon(): string {
    const ft = this.filetype.toLowerCase();
    if (ft.startsWith('image') || ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ft))
      return '🖼️';
    if (ft === 'application/pdf' || ft === 'pdf') return '📄';
    if (
      ['ts', 'js', 'tsx', 'jsx', 'py', 'rs', 'go', 'java', 'cpp', 'c', 'html', 'css'].includes(ft)
    )
      return '💻';
    if (ft.startsWith('video') || ['mp4', 'mov', 'webm'].includes(ft)) return '🎬';
    if (ft.startsWith('audio') || ['mp3', 'wav', 'ogg'].includes(ft)) return '🎵';
    if (['zip', 'tar', 'gz', 'rar', '7z'].includes(ft)) return '📦';
    if (['doc', 'docx', 'txt', 'md', 'rtf'].includes(ft)) return '📝';
    if (['xls', 'xlsx', 'csv'].includes(ft)) return '📊';
    return '📎';
  }

  /** Truncate filename preserving extension: "very-long-name.pdf" → "very-lo…me.pdf" */
  private _truncateFilename(name: string, max: number): string {
    if (max <= 0 || name.length <= max) return name;
    const dotIdx = name.lastIndexOf('.');
    // No extension or extension is the whole name
    if (dotIdx <= 0) {
      return name.slice(0, max - 1) + '…';
    }
    const ext = name.slice(dotIdx); // ".pdf"
    const base = name.slice(0, dotIdx); // "very-long-name"
    const availableForBase = max - ext.length - 1; // -1 for ellipsis
    if (availableForBase <= 2) {
      // Too tight — just hard truncate
      return name.slice(0, max - 1) + '…';
    }
    // Keep start and end of base name
    const headLen = Math.ceil(availableForBase / 2);
    const tailLen = Math.floor(availableForBase / 2);
    return base.slice(0, headLen) + '…' + base.slice(-tailLen) + ext;
  }

  // === Event handlers ===

  private _handleRemove(): void {
    this.dispatchEvent(
      createLoquixEvent<LoquixAttachmentRemoveDetail>('loquix-attachment-remove', {
        attachment: this._attachment,
      }),
    );
  }

  private _handleRetry(): void {
    this.dispatchEvent(
      createLoquixEvent<LoquixAttachmentRetryDetail>('loquix-attachment-retry', {
        attachment: this._attachment,
      }),
    );
  }

  // === Tooltip via Popover API ===

  private _showErrorTooltip(e: MouseEvent): void {
    const tooltip = this._tooltipEl;
    if (!tooltip || !this.error) return;

    // Position tooltip above the error icon
    const icon = e.currentTarget as HTMLElement;
    const rect = icon.getBoundingClientRect();
    tooltip.style.left = `${rect.left + rect.width / 2}px`;
    tooltip.style.top = `${rect.top - 6}px`;

    try {
      tooltip.showPopover();
    } catch {
      // Popover API not supported — no-op, tooltip stays hidden
    }
  }

  private _hideErrorTooltip(): void {
    try {
      this._tooltipEl?.hidePopover();
    } catch {
      // no-op
    }
  }

  // === SVGs ===

  private _closeSvg = svg`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;

  private _errorSvg = svg`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;

  private _retrySvg = svg`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>`;

  // === Render ===

  private _getStatusLabel(): string {
    switch (this.status) {
      case 'pending':
        return this._localize.term('attachmentChip.pending');
      case 'uploading':
        return this.progress > 0
          ? `${this.progress}%`
          : this._localize.term('attachmentChip.connecting');
      case 'error':
        return this._localize.term('attachmentChip.error');
      default:
        return '';
    }
  }

  protected render() {
    const meta = [this._formatSize(this.size)];
    if (this.purpose) meta.push(this.purpose);
    const statusLabel = this._getStatusLabel();
    const displayName = this._truncateFilename(this.filename, this.maxFilenameLength);

    return html`
      <div part="chip" class="chip chip--${this.status}">
        <span class="chip__icon" part="icon">
          <slot name="icon"
            >${this._safePreviewUrl
              ? html`<img
                  class="chip__preview"
                  src="${this._safePreviewUrl}"
                  alt=""
                  loading="lazy"
                  referrerpolicy="no-referrer"
                />`
              : this._getFileIcon()}</slot
          >
        </span>

        <div class="chip__content">
          <span
            class="chip__filename"
            title="${displayName !== this.filename ? this.filename : nothing}"
            >${displayName}</span
          >
          <span class="chip__meta"
            >${meta.join(' · ')}${statusLabel
              ? html` · <span class="chip__status">${statusLabel}</span>`
              : nothing}</span
          >
        </div>

        ${this.status === 'uploading'
          ? html`<div
              class="chip__progress ${this.progress === 0 ? 'chip__progress--indeterminate' : ''}"
              style="--progress: ${this.progress}%"
            ></div>`
          : nothing}
        ${this.status === 'error'
          ? html`
              <span
                class="chip__error-icon"
                role="img"
                aria-label="${this.error || this._localize.term('attachmentChip.uploadError')}"
                @mouseenter=${this._showErrorTooltip}
                @mouseleave=${this._hideErrorTooltip}
                @focus=${this._showErrorTooltip}
                @blur=${this._hideErrorTooltip}
                tabindex="0"
                >${this._errorSvg}</span
              >

              ${this.error
                ? html`
                    <div
                      id="error-tooltip"
                      part="error-tooltip"
                      popover
                      class="chip__error-tooltip"
                      role="tooltip"
                    >
                      ${this.error}
                    </div>
                  `
                : nothing}
              ${!this.noRetry
                ? html`
                    <button
                      part="retry"
                      class="chip__retry"
                      aria-label=${this._localize.term('attachmentChip.retryLabel', {
                        filename: this.filename,
                      })}
                      @click=${this._handleRetry}
                    >
                      ${this._retrySvg}
                    </button>
                  `
                : nothing}
            `
          : nothing}
        ${this.removable
          ? html`
              <button
                part="remove"
                class="chip__remove"
                aria-label=${this._localize.term('attachmentChip.removeLabel', {
                  filename: this.filename,
                })}
                @click=${this._handleRemove}
              >
                ${this._closeSvg}
              </button>
            `
          : nothing}
      </div>
    `;
  }
}
