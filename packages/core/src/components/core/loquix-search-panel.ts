import { LitElement, html, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import type {
  SearchInputMode,
  SearchInputSize,
  SearchInputState,
  SearchAnswerState,
  SearchPanelVariant,
  SearchResult,
  SearchResultsLayout,
  SearchShortcut,
  SearchSource,
  Source,
} from '../../types/index.js';
import { createLoquixEvent } from '../../events/index.js';
import type {
  LoquixSearchPanelCloseDetail,
  LoquixSearchPanelOpenDetail,
} from '../../events/index.js';
import { LocalizeController } from '../../i18n/index.js';
import styles from './loquix-search-panel.styles.js';
import './define-search-input.js';
import './define-search-footer.js';
import './define-search-answer.js';
import './define-search-sources.js';
import './define-search-results.js';

/**
 * @tag loquix-search-panel
 * @summary Inline smart search input that opens an anchored answer/results overlay.
 *
 * @csspart container - Outer anchored search surface.
 * @csspart query - Search input area.
 * @csspart input - The inline search input.
 * @csspart panel - Expandable panel region.
 * @csspart sources - Source progress/filter area.
 * @csspart body - Answer/results area.
 * @csspart suggestions - Query suggestion area.
 * @csspart footer - Footer area.
 *
 * @slot prefix - Prefix content for the inline search input.
 * @slot suggestions - Optional pre-search suggestions, commonly `loquix-suggestion-chips`.
 * @slot answer - Optional custom answer content replacing the built-in `loquix-search-answer`.
 * @slot footer-actions - Optional trailing footer actions.
 *
 * @fires loquix-search-panel-open - When the anchored panel opens. Detail: `{ value }`.
 * @fires loquix-search-panel-close - When the anchored panel closes. Detail: `{ value }`.
 */
export class LoquixSearchPanel extends LitElement {
  static override styles = [styles];

  private _localize = new LocalizeController(this);

  /** Whether the anchored panel is open. */
  @property({ type: Boolean, reflect: true })
  open = false;

  /** Current search query. */
  @property({ type: String })
  value = '';

  /** Search routing mode. */
  @property({ type: String, reflect: true })
  mode: SearchInputMode = 'auto';

  /** Size of the inline input. */
  @property({ type: String, reflect: true })
  size: SearchInputSize = 'md';

  /** Overlay composition. `integrated` draws the expanded surface around the input. */
  @property({ type: String, reflect: true })
  variant: SearchPanelVariant = 'detached';

  /** Lifecycle state shown in the input and source strip. */
  @property({ type: String, reflect: true })
  state: SearchInputState = 'idle';

  /** Placeholder text for the input. */
  @property({ type: String })
  placeholder?: string;

  /** Keyboard hint shown in the input. */
  @property({ type: String })
  kbd?: string;

  /** Accessible label for the expanded panel region. */
  @property({ type: String })
  heading?: string;

  /** Smart ask button label. */
  @property({ type: String, attribute: 'ask-label' })
  askLabel?: string;

  /** Whether clicking outside the component closes the panel. */
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

  @state()
  private _hasAnswerSlotContent = false;

  @state()
  private _hasSuggestionsSlotContent = false;

  private _outsideClickTimer?: number;

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this._teardownOutsidePointerDown();
  }

  protected override updated(changed: Map<PropertyKey, unknown>): void {
    if (changed.has('closeOnOutsideClick') && this.open) {
      this._setupOutsidePointerDown();
    }

    if (!changed.has('open')) return;

    if (this.open) {
      this._setupOutsidePointerDown();
      this.dispatchEvent(
        createLoquixEvent<LoquixSearchPanelOpenDetail>('loquix-search-panel-open', {
          value: this.value,
        }),
      );
      return;
    }

    this._teardownOutsidePointerDown();
    if (changed.get('open') === true) {
      this.dispatchEvent(
        createLoquixEvent<LoquixSearchPanelCloseDetail>('loquix-search-panel-close', {
          value: this.value,
        }),
      );
    }
  }

  /** Open the anchored search panel. */
  show(): void {
    if (this.open) return;
    this.open = true;
  }

  /** Close the anchored search panel. */
  hide(): void {
    if (!this.open) return;
    this.open = false;
  }

  private _handleActivation(): void {
    if (!this.open) {
      this.show();
    }
  }

  private _handleChange(event: CustomEvent<{ value: string }>): void {
    this.value = event.detail.value;
  }

  private _handleKeyDown(event: KeyboardEvent): void {
    if (event.key !== 'Escape' || !this.open) return;
    event.stopPropagation();
    this.hide();
  }

  private _handleDocumentPointerDown = (event: PointerEvent): void => {
    if (!this.open || !this.closeOnOutsideClick) return;
    if (event.composedPath().includes(this)) return;
    this.hide();
  };

  private _setupOutsidePointerDown(): void {
    this._teardownOutsidePointerDown();
    if (!this.closeOnOutsideClick) return;

    this._outsideClickTimer = window.setTimeout(() => {
      this._outsideClickTimer = undefined;
      document.addEventListener('pointerdown', this._handleDocumentPointerDown, true);
    }, 0);
  }

  private _teardownOutsidePointerDown(): void {
    window.clearTimeout(this._outsideClickTimer);
    this._outsideClickTimer = undefined;
    document.removeEventListener('pointerdown', this._handleDocumentPointerDown, true);
  }

  private _sourceVariant(): 'progress' | 'filters' {
    return this.state === 'searching' ? 'progress' : 'filters';
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

  private _handleSuggestionsSlotChange(event: Event): void {
    const slot = event.target as HTMLSlotElement;
    this._hasSuggestionsSlotContent = slot
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
    const heading = this.heading ?? this._localize.term('searchPanel.heading');

    return html`
      <div part="container" class="container" @keydown=${this._handleKeyDown}>
        <div part="query" class="query">
          <loquix-search-input
            part="input"
            mode=${this.mode}
            size=${this.size}
            state=${this.state}
            .value=${this.value}
            placeholder=${this.placeholder ?? nothing}
            kbd=${this.kbd ?? nothing}
            ask-label=${this.askLabel ?? nothing}
            show-ask-affordance
            @click=${this._handleActivation}
            @focusin=${this._handleActivation}
            @loquix-change=${this._handleChange}
          >
            <slot name="prefix" slot="prefix"></slot>
          </loquix-search-input>
        </div>

        <div class="panel-shell" @keydown=${this._handleKeyDown}>
          <div
            part="panel"
            class="panel"
            role="region"
            aria-label=${heading}
            aria-hidden=${this.open ? 'false' : 'true'}
            ?inert=${!this.open}
          >
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

            <div part="body" class="body">
              <div
                part="suggestions"
                class="suggestions"
                ?hidden=${!this._hasSuggestionsSlotContent}
              >
                <slot name="suggestions" @slotchange=${this._handleSuggestionsSlotChange}></slot>
              </div>
              ${this._renderAnswer()} ${this._renderResults()}
            </div>

            ${this.hideFooter
              ? nothing
              : html`
                  <div part="footer" class="footer">
                    <loquix-search-footer .shortcuts=${this.shortcuts}>
                      <slot name="footer-actions" slot="actions"></slot>
                    </loquix-search-footer>
                  </div>
                `}
          </div>
        </div>
      </div>
    `;
  }
}
