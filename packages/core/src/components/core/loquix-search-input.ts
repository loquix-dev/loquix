import { LitElement, html, svg, nothing } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import type { SearchInputMode, SearchInputSize, SearchInputState } from '../../types/index.js';
import { createLoquixEvent } from '../../events/index.js';
import { LocalizeController } from '../../i18n/index.js';
import styles from './loquix-search-input.styles.js';

const searchSvg = svg`
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2" />
    <path d="m21 21-4.3-4.3" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
  </svg>
`;

const sparkleSvg = svg`
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2l1.5 5.5L19 9l-5.5 1.5L12 16l-1.5-5.5L5 9l5.5-1.5L12 2z" />
    <path d="M19 14.5l.7 2.3 2.3.7-2.3.7-.7 2.3-.7-2.3-2.3-.7 2.3-.7.7-2.3z" />
  </svg>
`;

const clearSvg = svg`
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" />
  </svg>
`;

/**
 * @tag loquix-search-input
 * @summary Single-line search input that can route plain searches and AI questions.
 *
 * @csspart container - Outer input shell.
 * @csspart prefix - Prefix icon slot container.
 * @csspart input - The native `<input>` element.
 * @csspart clear-button - The clear query button.
 * @csspart ask-button - The smart search affordance.
 * @csspart kbd - Keyboard shortcut hint.
 *
 * @slot prefix - Optional replacement for the search icon.
 * @slot sparkle - Optional replacement for the smart-mode sparkle icon.
 *
 * @fires loquix-change - Fired as the value changes. Detail: `{ value }`.
 * @fires loquix-search-submit - Fired for plain search submit. Detail: `{ query, mode: 'plain' }`.
 * @fires loquix-search-ask - Fired for AI search submit. Detail: `{ query, mode: 'smart' }`.
 */
export class LoquixSearchInput extends LitElement {
  static override styles = [styles];

  private _localize = new LocalizeController(this);

  /** Search routing mode. */
  @property({ type: String, reflect: true })
  mode: SearchInputMode = 'auto';

  /** Visual size preset. */
  @property({ type: String, reflect: true })
  size: SearchInputSize = 'md';

  /** Lifecycle state. */
  @property({ type: String, reflect: true })
  state: SearchInputState = 'idle';

  /** Current search query. */
  @property({ type: String })
  value = '';

  /** Placeholder text. */
  @property({ type: String })
  placeholder?: string;

  /** Keyboard hint shown at the end of the input. */
  @property({ type: String })
  kbd?: string;

  /** Hide inline keyboard hint when the Ask AI affordance is visible. */
  @property({ type: Boolean, attribute: 'hide-kbd-when-ask' })
  hideKbdWhenAsk = true;

  /** Show a compact clear button when the input has a value. */
  @property({ type: Boolean })
  clearable = true;

  /** Label for the smart search button. */
  @property({ type: String, attribute: 'ask-label' })
  askLabel?: string;

  /** Force the smart affordance to be visible. */
  @property({ type: Boolean, attribute: 'show-ask-affordance' })
  showAskAffordance = false;

  /** Whether the input is disabled. */
  @property({ type: Boolean, reflect: true })
  disabled = false;

  @query('input')
  private _input!: HTMLInputElement;

  @state()
  private _focused = false;

  private get _placeholder(): string {
    if (this.placeholder !== undefined) return this.placeholder;
    return this.mode === 'plain'
      ? this._localize.term('searchInput.plainPlaceholder')
      : this._localize.term('searchInput.placeholder');
  }

  private get _shouldShowAsk(): boolean {
    if (this.disabled || this.state === 'searching') return false;
    if (this.showAskAffordance) return true;
    return this.mode === 'auto' && this._looksLikeSmartQuery(this.value);
  }

  private _looksLikeSmartQuery(value: string): boolean {
    const query = value.trim().toLowerCase();
    if (!query) return false;
    return (
      query.length > 12 ||
      query.includes('?') ||
      /\b(what|how|why|when|can|is|are|does|do|show|find)\b/.test(query)
    );
  }

  private _handleInput(e: Event): void {
    const input = e.target as HTMLInputElement;
    this.value = input.value;
    this.dispatchEvent(createLoquixEvent('loquix-change', { value: this.value }));
  }

  private _clearValue(): void {
    if (this.disabled || !this.value) return;
    this.value = '';
    this.dispatchEvent(createLoquixEvent('loquix-change', { value: this.value }));
    this.updateComplete.then(() => this._input?.focus());
  }

  private _handleKeyDown(e: KeyboardEvent): void {
    if (this.disabled || e.key !== 'Enter') return;
    e.preventDefault();
    if (e.metaKey || e.ctrlKey || this.mode === 'smart') {
      this._submitSmart();
      return;
    }
    this._submitPlain();
  }

  private _submitPlain(): void {
    const query = this.value.trim();
    if (!query) return;
    this.dispatchEvent(createLoquixEvent('loquix-search-submit', { query, mode: 'plain' }));
  }

  private _submitSmart(): void {
    const query = this.value.trim();
    if (!query) return;
    this.dispatchEvent(createLoquixEvent('loquix-search-ask', { query, mode: 'smart' }));
  }

  protected override render() {
    const containerClass = [
      'container',
      this._focused && 'is-focused',
      (this.mode === 'smart' || this._shouldShowAsk) && 'is-smart',
    ]
      .filter(Boolean)
      .join(' ');
    const askLabel = this.askLabel ?? this._localize.term('searchInput.askLabel');
    const showKbd = !!this.kbd && !(this.hideKbdWhenAsk && this._shouldShowAsk);

    return html`
      <div part="container" class=${containerClass}>
        <span part="prefix" class="icon" aria-hidden="true">
          ${this.state === 'searching'
            ? html`<span class="spinner"></span>`
            : html`<slot name="prefix">${searchSvg}</slot>`}
        </span>
        <input
          part="input"
          class="input"
          type="search"
          .value=${this.value}
          placeholder=${this._placeholder}
          aria-label=${this._placeholder}
          ?disabled=${this.disabled}
          @input=${this._handleInput}
          @keydown=${this._handleKeyDown}
          @focus=${() => (this._focused = true)}
          @blur=${() => (this._focused = false)}
        />
        ${this.clearable
          ? html`<button
              part="clear-button"
              class=${['clear', !this.value && 'is-hidden'].filter(Boolean).join(' ')}
              type="button"
              aria-label=${this._localize.term('searchInput.clearLabel')}
              aria-hidden=${this.value ? nothing : 'true'}
              tabindex=${this.value ? nothing : -1}
              ?disabled=${this.disabled || !this.value}
              @click=${this._clearValue}
            >
              ${clearSvg}
            </button>`
          : nothing}
        ${this.state !== 'searching' && this.mode === 'smart' && !this._shouldShowAsk
          ? html`<span class="sparkle" aria-hidden="true"><slot name="sparkle">${sparkleSvg}</slot></span>`
          : nothing}
        ${this._shouldShowAsk
          ? html`<button
              part="ask-button"
              class="ask"
              type="button"
              ?disabled=${this.disabled}
              @click=${this._submitSmart}
            >
              <span>${askLabel}</span>
            </button>`
          : nothing}
        ${showKbd ? html`<kbd part="kbd" class="kbd">${this.kbd}</kbd>` : nothing}
      </div>
    `;
  }
}
