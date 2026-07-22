import { LitElement, html, nothing, svg, type PropertyValues } from 'lit';
import { property, state } from 'lit/decorators.js';
import type { ToolCallStatus } from '../../types/index.js';
import { LocalizeController } from '../../i18n/index.js';
import type { LoquixTranslations } from '../../i18n/index.js';
import { createLoquixEvent } from '../../events/index.js';
import styles from './loquix-tool-call.styles.js';

const STATUS_LABEL_KEYS: Record<ToolCallStatus, keyof LoquixTranslations> = {
  pending: 'toolCall.statusQueued',
  running: 'toolCall.statusRunning',
  success: 'toolCall.statusDone',
  error: 'toolCall.statusFailed',
};

const toolSvg = svg`
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"
      stroke="currentColor"
      stroke-width="1.5"
      fill="none"
      stroke-linejoin="round"
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

const checkSvg = svg`
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M5 12l5 5L20 7"
      stroke="currentColor"
      stroke-width="2.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
`;

const xSvg = svg`
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
  </svg>
`;

const chevronSvg = svg`
  <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true">
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

/** Pretty-print args; guards against cyclic refs by falling back to "[unserializable]". */
function safeStringify(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2) ?? '';
  } catch {
    return '[unserializable]';
  }
}

function formatArgValue(v: unknown): string {
  if (typeof v === 'string') {
    return v.length > 28 ? `"${v.slice(0, 28)}…"` : JSON.stringify(v);
  }
  try {
    return JSON.stringify(v) ?? String(v);
  } catch {
    return String(v);
  }
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

/**
 * @tag loquix-tool-call
 * @summary Renders a single tool call (pending / running / success / error)
 *   with a name, args summary, and an expandable body for the full args + result/error.
 *
 * `args` is property-only (no JSON-attribute parsing) — set it via JS or via
 * the React wrapper's prop. JSON serialization for display is guarded against
 * cyclic objects.
 *
 * Initial open state derives from `defaultOpen` (when explicitly set) or from
 * `status` (running / error open by default; pending / success closed).
 * Once the user toggles the panel, status changes don't re-derive `_open` —
 * an explicit `defaultOpen` write does.
 *
 * @csspart container - The outer wrapper.
 * @csspart header - The clickable header `<button>`.
 * @csspart icon - The leading tool icon (or spinner while running).
 * @csspart name - The tool name + inline args summary.
 * @csspart arg-summary - The inline args summary span.
 * @csspart status - The status pill on the right.
 * @csspart chevron - Expand/collapse chevron.
 * @csspart body - The expanded body with args / result / error sections.
 * @csspart args - The args block.
 * @csspart result - The result block.
 * @csspart error - The error block.
 *
 * @fires loquix-tool-call-toggle - When the user expands or collapses.
 *   Detail: `{ name, toolId?, open }`.
 *
 * @cssprop [--loquix-tool-bg] - Background colour.
 * @cssprop [--loquix-tool-success-bg] - Status pill background when success.
 * @cssprop [--loquix-tool-error-bg] - Status pill / icon background when error.
 * @cssprop [--loquix-tool-result-bg] - Result block background.
 * @cssprop [--loquix-tool-result-border] - Result block border.
 * @cssprop [--loquix-tool-error-border] - Error block border.
 */
export class LoquixToolCall extends LitElement {
  static override styles = [styles];

  private _localize = new LocalizeController(this);

  /** Tool name rendered in monospace. */
  @property({ type: String })
  name = '';

  /** Optional stable id (analytics). Reflected as kebab attribute `tool-id`. */
  @property({ type: String, attribute: 'tool-id', reflect: true })
  toolId?: string;

  /** Lifecycle state. */
  @property({ type: String, reflect: true })
  status: ToolCallStatus = 'pending';

  /** Tool arguments. Property-only (no JSON-attribute parsing). */
  @property({ attribute: false })
  args?: Record<string, unknown>;

  /** Multi-line result text. Pre-formatted (CSS preserves whitespace). */
  @property({ type: String })
  result?: string;

  /** Error text (shown when `status='error'`). */
  @property({ type: String })
  error?: string;

  /** Duration in ms. Shown only when `status='success'`. */
  @property({ type: Number })
  duration?: number;

  /** Initial open state. Used only on first render; user toggles win after. */
  @property({ type: Boolean, attribute: 'default-open' })
  defaultOpen = false;

  /** Smaller padding when set. */
  @property({ type: Boolean, reflect: true })
  compact = false;

  @state()
  private _open = false;

  /** Once `true`, status changes don't re-derive `_open`. */
  private _userToggled = false;

  // ---------------------------------------------------------------------------
  // State derivation
  // ---------------------------------------------------------------------------

  protected override willUpdate(changed: PropertyValues<this>): void {
    if (!this.hasUpdated) {
      // First render — pick initial open state.
      this._open = this.defaultOpen || this.status === 'running' || this.status === 'error';
      return;
    }

    if (changed.has('defaultOpen')) {
      // Explicit consumer write resets user toggle.
      this._userToggled = false;
      this._open = this.defaultOpen;
      return;
    }

    if (this._userToggled) return;

    if (changed.has('status')) {
      this._open = this.status === 'running' || this.status === 'error';
    }
  }

  // ---------------------------------------------------------------------------
  // Header
  // ---------------------------------------------------------------------------

  private _onToggle = (): void => {
    this._open = !this._open;
    this._userToggled = true;
    this.dispatchEvent(
      createLoquixEvent('loquix-tool-call-toggle', {
        name: this.name,
        ...(this.toolId ? { toolId: this.toolId } : {}),
        open: this._open,
      }),
    );
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  private _renderIcon() {
    if (this.status === 'running') return spinnerSvg;
    return toolSvg;
  }

  private _renderArgSummary() {
    if (!this.args || this.status === 'pending') return nothing;
    const entries = Object.entries(this.args);
    const head = entries.slice(0, 2);
    const more = entries.length - head.length;
    return html`<span part="arg-summary" class="arg-summary">
      ${head.map(
        ([k, v]) =>
          html`<span class="arg"
            ><span class="arg-key">${k}:</span
            ><span class="arg-val">${formatArgValue(v)}</span></span
          >`,
      )}
      ${more > 0 ? html`<span class="arg-more">+${more}</span>` : nothing}
    </span>`;
  }

  protected override render() {
    const statusKey = STATUS_LABEL_KEYS[this.status] ?? STATUS_LABEL_KEYS.pending;
    const statusLabel = this._localize.term(statusKey);
    const expandLabel = this._open
      ? this._localize.term('toolCall.collapseLabel')
      : this._localize.term('toolCall.expandLabel');

    return html`
      <div part="container" class="container">
        <button
          part="header"
          class="header"
          type="button"
          aria-expanded=${this._open ? 'true' : 'false'}
          aria-label=${expandLabel}
          @click=${this._onToggle}
        >
          <span part="icon" class="icon-wrap">${this._renderIcon()}</span>
          <span part="name" class="name-wrap">
            <span class="name-text">${this.name}</span>
            ${this._renderArgSummary()}
          </span>
          <span class="right">
            ${this.status === 'success' &&
            typeof this.duration === 'number' &&
            Number.isFinite(this.duration)
              ? html`<span class="duration">${formatDuration(this.duration)}</span>`
              : nothing}
            <span
              part="status"
              class="status status--${this.status}"
              role=${this.status === 'running' ? 'status' : nothing}
            >
              ${this.status === 'success' ? checkSvg : nothing}
              ${this.status === 'error' ? xSvg : nothing} ${statusLabel}
            </span>
            <span part="chevron" class="chevron ${this._open ? 'is-open' : ''}">${chevronSvg}</span>
          </span>
        </button>

        <div part="body" class="body" ?hidden=${!this._open}>
          ${this.args
            ? html`<div part="args" class="section">
                <div class="section-label">${this._localize.term('toolCall.argumentsLabel')}</div>
                <pre class="code"><code>${safeStringify(this.args)}</code></pre>
              </div>`
            : nothing}
          ${this.status === 'success' && this.result
            ? html`<div part="result" class="section">
                <div class="section-label">${this._localize.term('toolCall.resultLabel')}</div>
                <pre class="code code--result"><code>${this.result}</code></pre>
              </div>`
            : nothing}
          ${this.status === 'error' && this.error
            ? html`<div part="error" class="section">
                <div class="section-label section-label--error">
                  ${this._localize.term('toolCall.errorLabel')}
                </div>
                <pre class="code code--error"><code>${this.error}</code></pre>
              </div>`
            : nothing}
        </div>
      </div>
    `;
  }
}
