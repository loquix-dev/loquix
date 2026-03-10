import { LitElement, html, svg } from 'lit';
import { property } from 'lit/decorators.js';
import { createLoquixEvent } from '../../events/index.js';
import type { LoquixDropDetail } from '../../events/index.js';
import { LocalizeController } from '../../i18n/index.js';
import styles from './loquix-drop-zone.styles.js';

/**
 * @tag loquix-drop-zone
 * @summary Generic drag-and-drop zone that wraps any content, shows an overlay on file drag, and emits dropped files.
 *
 * @csspart overlay - The drag overlay container.
 * @csspart icon - The overlay icon.
 * @csspart label - The overlay label text.
 *
 * @slot - Default slot for content to wrap.
 *
 * @fires loquix-drop - Fired when files are dropped. Detail: { files: File[] }
 *
 * @cssprop [--loquix-drop-zone-overlay-inset=0] - Overlay inset (CSS inset shorthand).
 * @cssprop [--loquix-drop-zone-border-radius=16px] - Overlay border radius.
 * @cssprop [--loquix-drop-zone-border-color] - Overlay dashed border colour.
 * @cssprop [--loquix-drop-zone-bg] - Overlay background colour.
 * @cssprop [--loquix-drop-zone-overlay-blur=2px] - Overlay backdrop blur.
 * @cssprop [--loquix-drop-zone-content-blur=1.5px] - Blur applied to slotted content during drag.
 * @cssprop [--loquix-drop-zone-content-opacity=0.5] - Opacity of slotted content during drag.
 * @cssprop [--loquix-drop-zone-icon-size=40px] - Overlay icon size.
 * @cssprop [--loquix-drop-zone-color] - Overlay icon and label colour.
 */
export class LoquixDropZone extends LitElement {
  static styles = [styles];

  private _localize = new LocalizeController(this);

  /** Whether drag-and-drop is disabled. */
  @property({ type: Boolean, reflect: true })
  disabled = false;

  /** Overlay label text. */
  @property({ type: String })
  label?: string;

  /** Accepted file types (comma-separated MIME types, wildcards, or extensions). Use '*' or a wildcard MIME to allow all. */
  @property({ type: String })
  accept = '';

  /** Whether multiple files are allowed. */
  @property({ type: Boolean })
  multiple = true;

  /** CSS inset value for the overlay. When set, overrides `--loquix-drop-zone-overlay-inset`. */
  @property({ type: String, attribute: 'overlay-inset' })
  overlayInset: string | undefined;

  // === Internal state ===

  private _dragCounter = 0;

  /** Bound global dragend handler for cleanup. */
  private _boundGlobalDragEnd = this._handleGlobalDragEnd.bind(this);

  // === Lifecycle ===

  override connectedCallback(): void {
    super.connectedCallback();
    document.addEventListener('dragend', this._boundGlobalDragEnd);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    document.removeEventListener('dragend', this._boundGlobalDragEnd);
  }

  override willUpdate(changed: Map<string, unknown>): void {
    if (changed.has('disabled') && this.disabled) {
      this._dragCounter = 0;
    }
  }

  override updated(changed: Map<string, unknown>): void {
    const isDragOver = this._dragCounter > 0 && !this.disabled;

    // Reflect drag-over attribute for CSS
    if (isDragOver) {
      this.setAttribute('drag-over', '');
    } else {
      this.removeAttribute('drag-over');
    }

    // [Fix #1] Only set inline CSS var when overlay-inset attr is explicitly provided;
    // otherwise rely on the CSS fallback default in styles.
    if (changed.has('overlayInset')) {
      if (this.overlayInset != null) {
        this.style.setProperty('--loquix-drop-zone-overlay-inset', this.overlayInset);
      } else {
        this.style.removeProperty('--loquix-drop-zone-overlay-inset');
      }
    }
  }

  // === Drag handlers ===

  /** Check if the drag contains files (not text/urls). */
  private _hasFiles(e: DragEvent): boolean {
    const types = e.dataTransfer?.types;
    if (!types) return false;
    // [Fix #6] DOMStringList may lack .includes — use .contains fallback
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (typeof (types as any).contains === 'function') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (types as any).contains('Files');
    }
    return Array.prototype.includes.call(types, 'Files');
  }

  private _handleDragEnter(e: DragEvent): void {
    e.preventDefault();
    if (!this._hasFiles(e)) return;
    if (this.disabled) return;
    const prev = this._dragCounter;
    this._dragCounter++;
    // [Fix #5] Only trigger update on boundary transition 0→1
    if (prev === 0) this.requestUpdate();
  }

  private _handleDragOver(e: DragEvent): void {
    // [Fix #3] Only preventDefault for file drags or when overlay is active
    // to avoid blocking text/URL drops to slotted child controls.
    if (this._hasFiles(e) || this._dragCounter > 0) {
      e.preventDefault();
      if (!this.disabled && e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
    }
  }

  private _handleDragLeave(e: DragEvent): void {
    e.preventDefault();
    if (!this._hasFiles(e)) return;
    if (this.disabled) return;
    const prev = this._dragCounter;
    this._dragCounter = Math.max(0, this._dragCounter - 1);
    // [Fix #5] Only trigger update on boundary transition 1→0
    if (prev === 1) this.requestUpdate();
  }

  private _handleDrop(e: DragEvent): void {
    // [Fix #3] Only preventDefault for file drags to avoid blocking non-file drops
    if (this._hasFiles(e) || this._dragCounter > 0) {
      e.preventDefault();
    }

    const wasDragging = this._dragCounter > 0;
    this._dragCounter = 0;
    if (wasDragging) this.requestUpdate();

    if (this.disabled) return;

    const files = e.dataTransfer?.files;
    if (!files?.length) return;

    const filtered = this._filterFiles(files);
    if (filtered.length === 0) return;

    this.dispatchEvent(createLoquixEvent<LoquixDropDetail>('loquix-drop', { files: filtered }));
  }

  /** [Fix #2] Global dragend resets stuck drag state (e.g., drag exits viewport). */
  private _handleGlobalDragEnd(): void {
    if (this._dragCounter > 0) {
      this._dragCounter = 0;
      this.requestUpdate();
    }
  }

  // === Accept filter (matches loquix-attachment-panel._processFiles pattern) ===

  private _filterFiles(fileList: FileList): File[] {
    let candidates = Array.from(fileList);

    // Filter by accept
    if (this.accept) {
      const tokens = this.accept
        .split(',')
        .map(t => t.trim().toLowerCase())
        .filter(Boolean);

      // [Fix #7] Treat * or */* as allow-all
      const isAllowAll = tokens.length === 0 || tokens.includes('*') || tokens.includes('*/*');

      if (tokens.length > 0 && !isAllowAll) {
        candidates = candidates.filter(file => {
          const mimeType = (file.type || '').toLowerCase();
          const fileName = file.name.toLowerCase();
          const ext = fileName.includes('.') ? `.${fileName.split('.').pop()}` : '';

          return tokens.some(token => {
            // Extension match, e.g. ".pdf"
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
    }

    // Enforce multiple=false
    if (!this.multiple) {
      candidates = candidates.slice(0, 1);
    }

    return candidates;
  }

  // === Render ===

  private _plusSvg = svg`<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
    <circle cx="24" cy="24" r="20"/>
    <line x1="24" y1="14" x2="24" y2="34"/>
    <line x1="14" y1="24" x2="34" y2="24"/>
  </svg>`;

  protected render() {
    const isDragOver = this._dragCounter > 0 && !this.disabled;

    return html`
      <div
        class="content"
        @dragenter=${this._handleDragEnter}
        @dragover=${this._handleDragOver}
        @dragleave=${this._handleDragLeave}
        @drop=${this._handleDrop}
      >
        <slot></slot>
      </div>
      <div
        part="overlay"
        class="overlay"
        aria-hidden=${isDragOver ? 'false' : 'true'}
        role="status"
      >
        <span part="icon" class="overlay__icon" aria-hidden="true">${this._plusSvg}</span>
        <span part="label" class="overlay__label"
          >${this.label ?? this._localize.term('dropZone.label')}</span
        >
      </div>
    `;
  }
}
