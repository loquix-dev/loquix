import { LitElement, html, nothing, svg, type PropertyValues } from 'lit';
import { property, state, query } from 'lit/decorators.js';
import { LocalizeController } from '../../i18n/index.js';
import { createLoquixEvent } from '../../events/index.js';
import styles from './loquix-tool-call-list.styles.js';

let _idCounter = 0;
const nextId = (): number => ++_idCounter;

const toolSvg = svg`
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"
      stroke="currentColor"
      stroke-width="1.5"
      fill="none"
      stroke-linejoin="round"
    />
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

/**
 * @tag loquix-tool-call-list
 * @summary Group container for parallel `loquix-tool-call` children.
 *
 * Header shows a localised "Used N tools" summary (override via `summary`
 * attribute). Body collapses on click. Initial collapsed state derives from
 * `default-collapsed`; user toggles win after that.
 *
 * Slotted child counting uses `slot.assignedElements({ flatten: true })`
 * filtered by `localName === 'loquix-tool-call'` — whitespace text and
 * stray wrapper elements don't inflate the count.
 *
 * @slot - Default slot for `<loquix-tool-call>` children.
 *
 * @csspart container - The outer wrapper.
 * @csspart header - The clickable header `<button>`.
 * @csspart summary - The summary text span.
 * @csspart chevron - Expand/collapse chevron.
 * @csspart items - The slotted-children container.
 *
 * @fires loquix-tool-group-toggle - When the user expands or collapses.
 *   Detail: `{ open }`.
 */
export class LoquixToolCallList extends LitElement {
  static override styles = [styles];

  private _localize = new LocalizeController(this);
  private _uid = nextId();

  /** Optional explicit summary text (overrides the localised count). */
  @property({ type: String })
  summary?: string;

  /** Initial collapsed state. User toggles win after first render. */
  @property({ type: Boolean, attribute: 'default-collapsed' })
  defaultCollapsed = false;

  @state()
  private _collapsed = false;

  @state()
  private _count = 0;

  /** Once `true`, defaultCollapsed prop changes still re-derive (consumer override), but no other state does. */
  private _userToggled = false;

  @query('slot')
  private _slot?: HTMLSlotElement;

  // ---------------------------------------------------------------------------
  // State derivation
  // ---------------------------------------------------------------------------

  protected override willUpdate(changed: PropertyValues<this>): void {
    if (!this.hasUpdated) {
      this._collapsed = this.defaultCollapsed;
      return;
    }

    if (changed.has('defaultCollapsed')) {
      this._userToggled = false;
      this._collapsed = this.defaultCollapsed;
    }
  }

  // ---------------------------------------------------------------------------
  // Slot
  // ---------------------------------------------------------------------------

  private _onSlotChange = (): void => {
    const els = this._slot?.assignedElements({ flatten: true }) ?? [];
    this._count = els.filter(el => el.localName === 'loquix-tool-call').length;
  };

  // ---------------------------------------------------------------------------
  // Header
  // ---------------------------------------------------------------------------

  private _onToggle = (): void => {
    this._collapsed = !this._collapsed;
    this._userToggled = true;
    this.dispatchEvent(createLoquixEvent('loquix-tool-group-toggle', { open: !this._collapsed }));
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  protected override render() {
    const isOpen = !this._collapsed;
    const summaryText = this.summary
      ? this.summary
      : this._count === 1
        ? this._localize.term('toolCallList.summaryFallbackOne')
        : this._localize.term('toolCallList.summaryFallback', { count: this._count });

    const expandLabel = isOpen
      ? this._localize.term('toolCallList.collapseLabel')
      : this._localize.term('toolCallList.expandLabel');

    const itemsId = `lq-tool-list-items-${this._uid}`;

    return html`
      <div part="container" class="container">
        <button
          part="header"
          class="header"
          type="button"
          aria-expanded=${isOpen ? 'true' : 'false'}
          aria-controls=${itemsId}
          aria-label=${expandLabel}
          @click=${this._onToggle}
        >
          ${toolSvg}
          <span part="summary" class="summary">${summaryText}</span>
          <span part="chevron" class="chevron ${isOpen ? 'is-open' : ''}">${chevronSvg}</span>
        </button>
        <div part="items" class="items" id=${itemsId} ?hidden=${this._collapsed}>
          <slot @slotchange=${this._onSlotChange}></slot>
        </div>
        ${
          // Hidden div after slot just to keep the slot live even when items hidden.
          nothing
        }
      </div>
    `;
  }
}
