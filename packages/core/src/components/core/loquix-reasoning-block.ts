import { LitElement, html, nothing, svg, type PropertyValues } from 'lit';
import { property, state, query } from 'lit/decorators.js';
import type { ReasoningStatus } from '../../types/index.js';
import { LocalizeController } from '../../i18n/index.js';
import { createLoquixEvent } from '../../events/index.js';
import styles from './loquix-reasoning-block.styles.js';

let _idCounter = 0;
const nextId = (): number => ++_idCounter;

const brainSvg = svg`
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M12 4a4 4 0 0 0-4 4v1a3 3 0 0 0-2 5.5A3 3 0 0 0 8 19a3 3 0 0 0 4 1 3 3 0 0 0 4-1 3 3 0 0 0 2-4.5A3 3 0 0 0 16 9V8a4 4 0 0 0-4-4z"
      stroke="currentColor"
      stroke-width="1.5"
    />
    <path
      d="M12 8v12M8 12h.01M16 12h.01"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
    />
  </svg>
`;

const spinnerSvg = svg`
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" class="spinner">
    <circle
      cx="12"
      cy="12"
      r="9"
      stroke="currentColor"
      stroke-width="2.5"
      fill="none"
      stroke-dasharray="42 18"
      stroke-linecap="round"
    />
  </svg>
`;

const chevronSvg = svg`
  <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M6 9l6 6 6-6"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      fill="none"
    />
  </svg>
`;

/**
 * @tag loquix-reasoning-block
 * @summary Collapsible "thinking" panel; streams reasoning content live and
 *   shows duration / token count when done.
 *
 * Once the user toggles the panel manually, subsequent `status` or `defaultOpen`
 * changes do not re-derive `_open` — the user's choice wins. This avoids
 * clobbering when streaming finishes (`thinking` → `done`) or when an external
 * controller mutates `defaultOpen`.
 *
 * @slot - Optional reasoning body. When the slot has any non-whitespace
 *   content, it wins over the `content` prop.
 *
 * @csspart container - The outer wrapper.
 * @csspart header - The clickable header `<button>`.
 * @csspart label - The status label text.
 * @csspart meta - Duration + token meta string.
 * @csspart chevron - The expand/collapse chevron.
 * @csspart preview - The collapsed preview text (when applicable).
 * @csspart content - The expanded content region.
 * @csspart cursor - The streaming caret (only while `status='thinking'`).
 *
 * @fires loquix-reasoning-toggle - When the user expands or collapses the panel.
 *   Detail: `{ open }`.
 *
 * @cssprop [--loquix-thought-bg] - Background colour.
 * @cssprop [--loquix-thought-border-color] - Border colour.
 * @cssprop [--loquix-thought-text-color] - Body text colour.
 * @cssprop [--loquix-streaming-color] - Caret + thinking-state accent.
 */
export class LoquixReasoningBlock extends LitElement {
  static override styles = [styles];

  private _localize = new LocalizeController(this);
  private _uid = nextId();

  /** Current lifecycle: streaming or done. */
  @property({ type: String, reflect: true })
  status: ReasoningStatus = 'done';

  /** Optional duration in seconds (shown in the header when `status='done'`). */
  @property({ type: Number })
  duration?: number;

  /** Optional token count (shown alongside duration). */
  @property({ type: Number })
  tokens?: number;

  /**
   * One-line preview shown when collapsed and `status='done'`.
   * Falls back to truncating `content` if not provided.
   */
  @property({ type: String })
  preview?: string;

  /** Full thinking text. Rendered as a text node — never as HTML. */
  @property({ type: String })
  content = '';

  /**
   * Initial open state. Used only on first render; user toggles win after that.
   * Default: `true` while thinking, `false` when done.
   */
  @property({ type: Boolean, attribute: 'default-open' })
  defaultOpen = false;

  @state()
  private _open = false;

  @state()
  private _hasSlotContent = false;

  /** Once `true`, status/defaultOpen changes don't re-derive `_open`. */
  private _userToggled = false;

  @query('slot')
  private _slot?: HTMLSlotElement;

  // ---------------------------------------------------------------------------
  // State derivation
  // ---------------------------------------------------------------------------

  protected override willUpdate(changed: PropertyValues<this>): void {
    if (!this.hasUpdated) {
      // First render — pick initial open state from defaultOpen, or fall back
      // to status-driven default (thinking → open, done → closed).
      this._open = this.defaultOpen || this.status === 'thinking';
      return;
    }

    // Explicit defaultOpen change clears any user toggle and re-asserts intent.
    if (changed.has('defaultOpen')) {
      this._userToggled = false;
      this._open = this.defaultOpen;
      return;
    }

    if (this._userToggled) return;

    // Status changes only re-derive when the user hasn't taken control.
    if (changed.has('status')) {
      this._open = this.status === 'thinking';
    }
  }

  // ---------------------------------------------------------------------------
  // Slot
  // ---------------------------------------------------------------------------

  private _onSlotChange = (): void => {
    const nodes = this._slot?.assignedNodes({ flatten: true }) ?? [];
    this._hasSlotContent = nodes.some(n => {
      if (n.nodeType === Node.ELEMENT_NODE) return true;
      if (n.nodeType === Node.TEXT_NODE) {
        return (n.textContent ?? '').trim().length > 0;
      }
      return false;
    });
  };

  // ---------------------------------------------------------------------------
  // Header
  // ---------------------------------------------------------------------------

  private _onToggle = (): void => {
    this._open = !this._open;
    this._userToggled = true;
    this.dispatchEvent(createLoquixEvent('loquix-reasoning-toggle', { open: this._open }));
  };

  private _formatDuration(): string | null {
    if (typeof this.duration !== 'number' || !Number.isFinite(this.duration)) return null;
    const total = Math.max(0, Math.round(this.duration));
    if (total < 60) {
      return this._localize.term('reasoningBlock.thoughtFor', { seconds: total });
    }
    const minutes = Math.floor(total / 60);
    const seconds = total % 60;
    return this._localize.term('reasoningBlock.thoughtForMinutes', { minutes, seconds });
  }

  private _previewText(): string {
    if (this.preview && this.preview.length > 0) return this.preview;
    const trimmed = (this.content ?? '').trim();
    if (trimmed.length === 0) return '';
    return trimmed.length > 80 ? trimmed.slice(0, 80) + '…' : trimmed;
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  protected override render() {
    const isStreaming = this.status === 'thinking';
    const headerText = isStreaming
      ? this._localize.term('reasoningBlock.thinking')
      : (this._formatDuration() ?? this._localize.term('reasoningBlock.thinking'));

    const tokensText =
      typeof this.tokens === 'number' && Number.isFinite(this.tokens) && !isStreaming
        ? this._localize.term('reasoningBlock.tokensSuffix', {
            count: this.tokens.toLocaleString(),
          })
        : null;

    const previewText = this._previewText();
    const showPreview = !this._open && !isStreaming && previewText.length > 0;

    const contentRegionId = `lq-reason-content-${this._uid}`;
    const ariaLabel = this._open
      ? this._localize.term('reasoningBlock.collapseLabel')
      : this._localize.term('reasoningBlock.expandLabel');

    return html`
      <div part="container" class="container">
        <button
          part="header"
          class="header"
          type="button"
          aria-expanded=${this._open ? 'true' : 'false'}
          aria-controls=${contentRegionId}
          aria-label=${ariaLabel}
          @click=${this._onToggle}
        >
          <span class="header-left">
            ${isStreaming ? spinnerSvg : brainSvg}
            <span part="label" class="label">${headerText}</span>
            ${tokensText ? html`<span part="meta" class="meta">${tokensText}</span>` : nothing}
          </span>
          <span part="chevron" class="chevron ${this._open ? 'is-open' : ''}">${chevronSvg}</span>
        </button>

        ${showPreview ? html`<div part="preview" class="preview">${previewText}</div>` : nothing}

        <div
          part="content"
          class="content"
          id=${contentRegionId}
          role="region"
          ?hidden=${!this._open}
        >
          <div class="rule"></div>
          <div class="text">
            <slot @slotchange=${this._onSlotChange}
              >${this._hasSlotContent ? nothing : this.content}</slot
            >
            ${isStreaming
              ? html`<span part="cursor" class="cursor" aria-hidden="true"></span>`
              : nothing}
          </div>
        </div>
      </div>
    `;
  }
}
