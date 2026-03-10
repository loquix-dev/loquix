import { LitElement, html, nothing, type PropertyValues } from 'lit';
import { property, state } from 'lit/decorators.js';
import type { Size, Attachment } from '../../types/index.js';
import { createLoquixEvent } from '../../events/index.js';
import type {
  LoquixAttachmentRemoveDetail,
  LoquixAttachmentClickDetail,
} from '../../events/index.js';
import { LocalizeController } from '../../i18n/index.js';
import styles from './loquix-message-attachments.styles.js';

/**
 * @tag loquix-message-attachments
 * @summary Displays file attachments inside a message as a grid of visual cards
 * with image previews, file icons, and optional remove buttons.
 *
 * @csspart grid - Outer wrapper containing the list and overflow button.
 * @csspart card - Individual attachment card wrapper.
 * @csspart thumbnail - Thumbnail area (image preview or file icon).
 * @csspart filename - Filename text.
 * @csspart filesize - File size text.
 * @csspart remove - Remove button on each card.
 * @csspart overflow - "+N more" expand button.
 *
 * @cssprop [--loquix-message-attachments-gap=8px] - Gap between cards.
 * @cssprop [--loquix-message-attachments-card-bg=rgba(0,0,0,0.03)] - Card background.
 * @cssprop [--loquix-message-attachments-card-border-color=rgba(0,0,0,0.08)] - Card border color.
 * @cssprop [--loquix-message-attachments-card-border-radius=8px] - Card border radius.
 * @cssprop [--loquix-message-attachments-card-hover-shadow=0 1px 4px rgba(0,0,0,0.1)] - Card hover shadow.
 * @cssprop [--loquix-message-attachments-sm-size=48px] - Card width at `sm` size.
 * @cssprop [--loquix-message-attachments-md-size=80px] - Card width at `md` size.
 * @cssprop [--loquix-message-attachments-lg-size=120px] - Card width at `lg` size.
 * @cssprop [--loquix-message-attachments-xs-size=28px] - Thumbnail size at `xs` size.
 *
 * @fires loquix-attachment-click - Fired when a card is clicked. Detail: { attachment }
 * @fires loquix-attachment-remove - Fired when the remove button is clicked. Detail: { attachment }
 */
export class LoquixMessageAttachments extends LitElement {
  static styles = [styles];

  private _localize = new LocalizeController(this);

  /** Array of attachment objects to display. */
  @property({ attribute: false })
  attachments: Attachment[] = [];

  /** Card size variant. */
  @property({ type: String, reflect: true })
  size: Size = 'md';

  /** Whether to show remove buttons on each card. */
  @property({ type: Boolean, reflect: true })
  removable = false;

  /** Maximum number of visible cards. 0 means show all. */
  @property({ type: Number, attribute: 'max-visible' })
  maxVisible = 0;

  /** Whether the overflow is expanded (show all). */
  @state()
  private _expanded = false;

  // ---------------------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------------------

  protected override willUpdate(changed: PropertyValues): void {
    // Reset expansion when attachments change
    if (changed.has('attachments')) {
      this._expanded = false;
    }
  }

  // ---------------------------------------------------------------------------
  // Private helpers — utilities extracted from loquix-attachment-chip.ts
  // ---------------------------------------------------------------------------

  /** Check if a filetype represents an image. */
  private _isImageType(filetype: string): boolean {
    const ft = filetype.toLowerCase();
    return ft.startsWith('image') || ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ft);
  }

  /** Return an emoji icon based on file type. */
  private _getFileIcon(filetype: string): string {
    const ft = filetype.toLowerCase();
    if (this._isImageType(ft)) return '\u{1F5BC}\uFE0F'; // 🖼️
    if (ft === 'application/pdf' || ft === 'pdf') return '\u{1F4C4}'; // 📄
    if (
      ['ts', 'js', 'tsx', 'jsx', 'py', 'rs', 'go', 'java', 'cpp', 'c', 'html', 'css'].includes(ft)
    )
      return '\u{1F4BB}'; // 💻
    if (ft.startsWith('video') || ['mp4', 'mov', 'webm'].includes(ft)) return '\u{1F3AC}'; // 🎬
    if (ft.startsWith('audio') || ['mp3', 'wav', 'ogg'].includes(ft)) return '\u{1F3B5}'; // 🎵
    if (['zip', 'tar', 'gz', 'rar', '7z'].includes(ft)) return '\u{1F4E6}'; // 📦
    if (['doc', 'docx', 'txt', 'md', 'rtf'].includes(ft)) return '\u{1F4DD}'; // 📝
    if (['xls', 'xlsx', 'csv'].includes(ft)) return '\u{1F4CA}'; // 📊
    return '\u{1F4CE}'; // 📎
  }

  /** Format bytes into human-readable string. */
  private _formatSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    const k = 1024;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const val = bytes / Math.pow(k, i);
    return `${val < 10 ? val.toFixed(1) : Math.round(val)} ${units[i]}`;
  }

  /** Truncate filename preserving extension. */
  private _truncateFilename(name: string, max: number): string {
    if (max <= 0 || name.length <= max) return name;
    const dotIdx = name.lastIndexOf('.');
    if (dotIdx <= 0) {
      return name.slice(0, max - 1) + '\u2026';
    }
    const ext = name.slice(dotIdx);
    const base = name.slice(0, dotIdx);
    const availableForBase = max - ext.length - 1;
    if (availableForBase <= 2) {
      return name.slice(0, max - 1) + '\u2026';
    }
    const headLen = Math.ceil(availableForBase / 2);
    const tailLen = Math.floor(availableForBase / 2);
    return base.slice(0, headLen) + '\u2026' + base.slice(-tailLen) + ext;
  }

  /**
   * Sanitise URL for `<img src>`.
   * Allows https, http, blob. For data: URLs, only `data:image/*` (case-insensitive)
   * is permitted, excluding `data:image/svg+xml` (defense-in-depth: SVG can contain scripts).
   */
  private _safeImageSrc(url: string | undefined): string {
    if (!url) return '';
    try {
      const parsed = new URL(url, window.location.href);
      if (['https:', 'http:', 'blob:'].includes(parsed.protocol)) return url;
      if (parsed.protocol === 'data:') {
        const lower = url.toLowerCase();
        if (lower.startsWith('data:image/') && !lower.startsWith('data:image/svg+xml')) {
          return url;
        }
        return '';
      }
      return '';
    } catch {
      return '';
    }
  }

  // ---------------------------------------------------------------------------
  // Event handlers
  // ---------------------------------------------------------------------------

  private _onClick(attachment: Attachment): void {
    this.dispatchEvent(
      createLoquixEvent<LoquixAttachmentClickDetail>(
        'loquix-attachment-click',
        { attachment },
        { cancelable: true },
      ),
    );
  }

  private _onRemove(e: Event, attachment: Attachment): void {
    e.stopPropagation();
    this.dispatchEvent(
      createLoquixEvent<LoquixAttachmentRemoveDetail>('loquix-attachment-remove', { attachment }),
    );
  }

  private _handleExpand(): void {
    this._expanded = true;
  }

  // ---------------------------------------------------------------------------
  // Render helpers
  // ---------------------------------------------------------------------------

  /** Build the card title tooltip string. */
  private _cardTitle(att: Attachment): string {
    return att.size > 0 ? `${att.filename} (${this._formatSize(att.size)})` : att.filename;
  }

  /** Build the aria-label for a card. */
  private _cardAriaLabel(att: Attachment): string {
    return this._cardTitle(att);
  }

  /** Render a single attachment card. */
  private _renderCard(att: Attachment) {
    const safeSrc = this._isImageType(att.filetype) ? this._safeImageSrc(att.url) : '';
    const sizeClass = `card--${this.size}`;
    const title = this._cardTitle(att);
    const ariaLabel = this._cardAriaLabel(att);

    // Determine max filename chars based on size
    const maxChars =
      this.size === 'xs' ? 18 : this.size === 'sm' ? 0 : this.size === 'md' ? 12 : 18;
    const displayName =
      maxChars > 0 ? this._truncateFilename(att.filename, maxChars) : att.filename;

    const thumbnail = safeSrc
      ? html`<div part="thumbnail" class="card__thumbnail">
          <img src="${safeSrc}" alt="${att.filename}" loading="lazy" referrerpolicy="no-referrer" />
        </div>`
      : html`<div part="thumbnail" class="card__thumbnail">
          <span class="card__icon">${this._getFileIcon(att.filetype)}</span>
        </div>`;

    const showFilesize = (this.size === 'lg' || this.size === 'xs') && att.size > 0;

    const info =
      this.size === 'sm'
        ? nothing
        : html`<div class="card__info">
            <span part="filename" class="card__filename">${displayName}</span>
            ${showFilesize
              ? html`<span part="filesize" class="card__filesize"
                  >${this._formatSize(att.size)}</span
                >`
              : nothing}
          </div>`;

    // Remove button always in DOM, shown/hidden via CSS :host([removable])
    const removeBtn = html`<button
      part="remove"
      class="card__remove"
      aria-label=${this._localize.term('messageAttachments.removeLabel', {
        filename: att.filename,
      })}
      @click=${(e: Event) => this._onRemove(e, att)}
    >
      <span aria-hidden="true">×</span>
    </button>`;

    return html`
      <div part="card" class="card ${sizeClass}" role="listitem" title="${title}">
        <button
          type="button"
          class="card__action"
          aria-label="${ariaLabel}"
          @click=${() => this._onClick(att)}
        >
          ${thumbnail}${info}
        </button>
        ${removeBtn}
      </div>
    `;
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  protected render() {
    if (this.attachments.length === 0) return nothing;

    const shouldLimit = this.maxVisible > 0 && !this._expanded;
    const visible = shouldLimit ? this.attachments.slice(0, this.maxVisible) : this.attachments;
    const hiddenCount = shouldLimit ? this.attachments.length - this.maxVisible : 0;

    return html`
      <div part="grid" class="grid">
        <div role="list" class="list">${visible.map(att => this._renderCard(att))}</div>
        ${hiddenCount > 0
          ? html`<button part="overflow" class="overflow" @click=${this._handleExpand}>
              ${this._localize.term('messageAttachments.moreCount', { count: hiddenCount })}
            </button>`
          : nothing}
      </div>
    `;
  }
}
