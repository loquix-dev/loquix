import { LitElement, html, svg, nothing } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import type {
  SearchInputMode,
  SearchInputSize,
  SearchInputState,
  SearchAnswerState,
  SearchResult,
  SearchResultsLayout,
  SearchShortcut,
  SearchSource,
  Source,
} from '../../types/index.js';
import { createLoquixEvent } from '../../events/index.js';
import type {
  LoquixSearchDialogCloseDetail,
  LoquixSearchDialogOpenDetail,
} from '../../events/index.js';
import { LocalizeController } from '../../i18n/index.js';
import styles from './loquix-search-dialog.styles.js';
import './define-search-input.js';
import './define-search-footer.js';
import './define-search-answer.js';
import './define-search-sources.js';
import './define-search-results.js';

const closeSvg = svg`
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
  </svg>
`;

const CLOSE_ANIMATION_MS = 140;
const TRIGGER_FOCUS_SUPPRESS_MS = CLOSE_ANIMATION_MS + 160;

/**
 * @tag loquix-search-dialog
 * @summary Drop-in smart search input that opens a modal with AI answer, sources, and results.
 *
 * @csspart trigger - The search input shown inline on the page.
 * @csspart dialog - The native `<dialog>` element.
 * @csspart header - Dialog header row.
 * @csspart heading - Dialog heading text.
 * @csspart close-button - Dialog close button.
 * @csspart query - Dialog search input area.
 * @csspart sources - Dialog source progress/filter area.
 * @csspart body - Scrollable answer/results area.
 * @csspart footer - Dialog footer area.
 *
 * @slot trigger-prefix - Prefix content for the page-level trigger input.
 * @slot dialog-prefix - Prefix content for the dialog search input.
 * @slot answer - Optional custom answer content replacing the built-in `loquix-search-answer`.
 * @slot footer-actions - Optional trailing footer actions.
 *
 * @fires loquix-search-dialog-open - When the modal opens. Detail: `{ value }`.
 * @fires loquix-search-dialog-close - When the modal closes. Detail: `{ value }`.
 */
export class LoquixSearchDialog extends LitElement {
  static override styles = [styles];

  private _localize = new LocalizeController(this);

  /** Whether the search modal is open. */
  @property({ type: Boolean, reflect: true })
  open = false;

  /** Current search query. */
  @property({ type: String })
  value = '';

  /** Search routing mode for both inputs. */
  @property({ type: String, reflect: true })
  mode: SearchInputMode = 'auto';

  /** Size of the page-level trigger input. */
  @property({ type: String, reflect: true })
  size: SearchInputSize = 'md';

  /** Lifecycle state shown in the dialog input and source strip. */
  @property({ type: String, reflect: true })
  state: SearchInputState = 'idle';

  /** Placeholder text for both inputs. */
  @property({ type: String })
  placeholder?: string;

  /** Keyboard hint shown in the trigger and footer examples. */
  @property({ type: String })
  kbd?: string;

  /** Dialog heading text. */
  @property({ type: String })
  heading?: string;

  /** Smart ask button label. */
  @property({ type: String, attribute: 'ask-label' })
  askLabel?: string;

  /** Whether clicking the backdrop closes the dialog. */
  @property({ type: Boolean, attribute: 'close-on-outside-click' })
  closeOnOutsideClick = true;

  /** Hide the built-in AI answer region. */
  @property({ type: Boolean, attribute: 'hide-answer' })
  hideAnswer = false;

  /** Hide the built-in search results region. */
  @property({ type: Boolean, attribute: 'hide-results' })
  hideResults = false;

  /** Hide the built-in footer. */
  @property({ type: Boolean, attribute: 'hide-footer' })
  hideFooter = false;

  /** AI answer plain-text content. Ignored when the `answer` slot is provided. */
  @property({ type: String, attribute: 'answer-content' })
  answerContent = '';

  /** AI answer heading override. */
  @property({ type: String, attribute: 'answer-heading' })
  answerHeading?: string;

  /** AI answer lifecycle state. */
  @property({ type: String, attribute: 'answer-state', reflect: true })
  answerState: SearchAnswerState = 'complete';

  /** Model label shown in the answer footer. */
  @property({ type: String })
  model?: string;

  /** Generation timing label shown in the answer footer. */
  @property({ type: String, attribute: 'generated-in' })
  generatedIn?: string;

  /** Sources cited by the built-in answer. Property-only; no JSON attribute parsing. */
  @property({ attribute: false })
  answerSources: Source[] = [];

  /** Connected search sources. Property-only; no JSON attribute parsing. */
  @property({ attribute: false })
  sources: SearchSource[] = [];

  /** Active source filter id. Use `all` for all sources. */
  @property({ type: String, attribute: 'active-source' })
  activeSource = 'all';

  /** Result count shown in progress mode. */
  @property({ type: Number, attribute: 'running-total' })
  runningTotal?: number;

  /** Search results rendered by the built-in result list. Property-only; no JSON attribute parsing. */
  @property({ attribute: false })
  results: SearchResult[] = [];

  /** Built-in results layout. */
  @property({ type: String, attribute: 'results-layout' })
  resultsLayout: SearchResultsLayout = 'blended';

  /** Keyboard shortcuts rendered in the built-in footer. */
  @property({ attribute: false })
  shortcuts: SearchShortcut[] = [];

  @query('dialog')
  private _dialog!: HTMLDialogElement;

  @query('.dialog-input')
  private _dialogInput?: HTMLElement;

  @state()
  private _hasAnswerSlotContent = false;

  private _ignoreNextTriggerFocus = false;
  private _ignoreTriggerFocusTimer?: number;
  private _closeTimer?: number;

  @state()
  private _closing = false;

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    window.clearTimeout(this._ignoreTriggerFocusTimer);
    window.clearTimeout(this._closeTimer);
  }

  protected override updated(changed: Map<PropertyKey, unknown>): void {
    if (changed.has('open')) {
      if (this.open && this._dialog) {
        const wasDialogOpen = this._dialog.open;
        this._cancelPendingClose();
        if (!wasDialogOpen) {
          this._dialog.showModal();
        }
        this.dispatchEvent(
          createLoquixEvent<LoquixSearchDialogOpenDetail>('loquix-search-dialog-open', {
            value: this.value,
          }),
        );
        void this.updateComplete.then(() => this._focusDialogInput());
      } else if (!this.open && this._dialog?.open && !this._closing) {
        this._startCloseAnimation();
      }
    }
  }

  /** Open the search modal. */
  show(): void {
    if (this.open) return;
    this.open = true;
  }

  /** Close the search modal. */
  hide(): void {
    if (!this.open) return;
    this._startCloseAnimation();
    this.open = false;
    this.dispatchEvent(
      createLoquixEvent<LoquixSearchDialogCloseDetail>('loquix-search-dialog-close', {
        value: this.value,
      }),
    );
  }

  private _focusDialogInput(): void {
    const input = this._dialogInput?.shadowRoot?.querySelector('input') as HTMLInputElement | null;
    input?.focus();
    input?.select();
  }

  private _handleChange(event: CustomEvent<{ value: string }>): void {
    this.value = event.detail.value;
  }

  private _suppressNextTriggerFocus(): void {
    this._ignoreNextTriggerFocus = true;
    window.clearTimeout(this._ignoreTriggerFocusTimer);
    this._ignoreTriggerFocusTimer = window.setTimeout(() => {
      this._ignoreNextTriggerFocus = false;
      this._ignoreTriggerFocusTimer = undefined;
    }, TRIGGER_FOCUS_SUPPRESS_MS);
  }

  private _cancelPendingClose(): void {
    window.clearTimeout(this._closeTimer);
    this._closeTimer = undefined;
    this._closing = false;
  }

  private _startCloseAnimation(): void {
    this._suppressNextTriggerFocus();
    this._closing = true;
    window.clearTimeout(this._closeTimer);

    const duration = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ? 0
      : CLOSE_ANIMATION_MS;

    this._closeTimer = window.setTimeout(() => {
      this._closeTimer = undefined;
      this._closing = false;
      if (!this.open && this._dialog?.open) {
        this._dialog.close();
      }
    }, duration);
  }

  private _handleTriggerOpen(event: Event): void {
    if (event.type === 'focusin' && this._ignoreNextTriggerFocus) {
      this._ignoreNextTriggerFocus = false;
      window.clearTimeout(this._ignoreTriggerFocusTimer);
      this._ignoreTriggerFocusTimer = undefined;
      return;
    }

    if (!this.open) {
      this.show();
    }
  }

  private _handleDialogClick(event: MouseEvent): void {
    if (!this.closeOnOutsideClick || event.target !== this._dialog) return;
    const rect = this._dialog.getBoundingClientRect();
    if (
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom
    ) {
      this.hide();
    }
  }

  private _handleDialogClose(): void {
    if (this.open) {
      this.hide();
    }
  }

  private _handleDialogCancel(event: Event): void {
    event.preventDefault();
    this.hide();
  }

  private _sourceVariant(): 'progress' | 'filters' {
    return this.state === 'searching' ? 'progress' : 'filters';
  }

  private _renderTrigger() {
    return html`
      <loquix-search-input
        part="trigger"
        mode=${this.mode}
        size=${this.size}
        state=${this.state}
        .value=${this.value}
        placeholder=${this.placeholder ?? nothing}
        kbd=${this.kbd ?? nothing}
        ask-label=${this.askLabel ?? nothing}
        @click=${this._handleTriggerOpen}
        @focusin=${this._handleTriggerOpen}
        @loquix-change=${this._handleChange}
      >
        <slot name="trigger-prefix" slot="prefix"></slot>
      </loquix-search-input>
    `;
  }

  private _renderAnswer() {
    if (this.hideAnswer) return nothing;
    const hasBuiltInAnswer =
      this.answerState === 'generating' ||
      this.answerContent ||
      this.answerSources.length > 0 ||
      this.model;

    return html`
      <div part="answer" class="answer" ?hidden=${!hasBuiltInAnswer && !this._hasAnswerSlotContent}>
        <slot name="answer" @slotchange=${this._handleAnswerSlotChange}>
          <loquix-search-answer
            content=${this.answerContent}
            state=${this.answerState}
            heading=${this.answerHeading ?? nothing}
            model=${this.model ?? nothing}
            generated-in=${this.generatedIn ?? nothing}
            .sources=${this.answerSources}
          ></loquix-search-answer>
        </slot>
      </div>
    `;
  }

  private _handleAnswerSlotChange(event: Event): void {
    const slot = event.target as HTMLSlotElement;
    this._hasAnswerSlotContent = slot
      .assignedNodes({ flatten: true })
      .some(node => node.nodeType === Node.ELEMENT_NODE || !!node.textContent?.trim());
  }

  private _renderResults() {
    if (this.hideResults) return nothing;

    return html`
      <div part="results" class="results" ?hidden=${this.results.length === 0}>
        <loquix-search-results
          layout=${this.resultsLayout}
          .results=${this.results}
        ></loquix-search-results>
      </div>
    `;
  }

  protected override render() {
    const heading = this.heading ?? this._localize.term('searchDialog.heading');

    return html`
      ${this._renderTrigger()}

      <dialog
        part="dialog"
        class=${this._closing ? 'is-closing' : ''}
        aria-label=${heading}
        @cancel=${this._handleDialogCancel}
        @close=${this._handleDialogClose}
        @click=${this._handleDialogClick}
      >
        <div part="header" class="header">
          <h2 part="heading" class="heading">${heading}</h2>
          <button
            part="close-button"
            class="close"
            type="button"
            aria-label=${this._localize.term('searchDialog.closeLabel')}
            @click=${() => this.hide()}
          >
            ${closeSvg}
          </button>
        </div>

        <div part="query" class="query">
          <loquix-search-input
            class="dialog-input"
            mode=${this.mode}
            state=${this.state}
            .value=${this.value}
            placeholder=${this.placeholder ?? nothing}
            kbd=${this.kbd ?? nothing}
            ask-label=${this.askLabel ?? nothing}
            show-ask-affordance
            @loquix-change=${this._handleChange}
          >
            <slot name="dialog-prefix" slot="prefix"></slot>
          </loquix-search-input>
        </div>

        ${this.sources.length > 0
          ? html`
              <div part="sources" class="sources">
                <loquix-search-sources
                  variant=${this._sourceVariant()}
                  active-source=${this.activeSource}
                  running-total=${this.runningTotal ?? nothing}
                  .sources=${this.sources}
                ></loquix-search-sources>
              </div>
            `
          : nothing}

        <div part="body" class="body">${this._renderAnswer()} ${this._renderResults()}</div>

        ${this.hideFooter
          ? nothing
          : html`
              <div part="footer" class="footer">
                <loquix-search-footer .shortcuts=${this.shortcuts}>
                  <slot name="footer-actions" slot="actions"></slot>
                </loquix-search-footer>
              </div>
            `}
      </dialog>
    `;
  }
}
