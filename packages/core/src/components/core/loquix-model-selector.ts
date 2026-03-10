import { LitElement, html, nothing, svg, type PropertyValues } from 'lit';
import { property, state, query } from 'lit/decorators.js';
import { computePosition, flip, shift, offset, size } from '@floating-ui/dom';
import type { ModelOption } from '../../types/index.js';
import { createLoquixEvent } from '../../events/index.js';
import type { LoquixModelChangeDetail } from '../../events/index.js';
import { LocalizeController } from '../../i18n/index.js';
import styles from './loquix-model-selector.styles.js';

/**
 * @tag loquix-model-selector
 * @summary Dropdown selector for LLM models with tier badges, costs, and capability indicators.
 *
 * @csspart trigger - The trigger button
 * @csspart panel - The dropdown panel
 * @csspart search - The search input wrapper
 * @csspart option - An option item
 *
 * @fires loquix-model-change - Fired when a model is selected. Detail: { from, to }
 */
export class LoquixModelSelector extends LitElement {
  static styles = [styles];

  private _localize = new LocalizeController(this);

  /** Array of model options. */
  @property({ type: Array })
  models: ModelOption[] = [];

  /** Currently selected model value. */
  @property({ type: String, reflect: true })
  value = '';

  /** Placeholder text when no model is selected. */
  @property({ type: String })
  placeholder?: string;

  /** Show cost indicator for each model. */
  @property({ type: Boolean, attribute: 'show-cost' })
  showCost = false;

  /** Show capability badges for each model. */
  @property({ type: Boolean, attribute: 'show-capabilities' })
  showCapabilities = false;

  /** Group models by their group field. */
  @property({ type: Boolean, reflect: true })
  grouped = false;

  /** Show search input in dropdown. */
  @property({ type: Boolean, reflect: true })
  searchable = false;

  /** Whether the selector is disabled. */
  @property({ type: Boolean, reflect: true })
  disabled = false;

  /** Preferred panel placement. */
  @property({ type: String })
  placement: 'top' | 'bottom' = 'top';

  /** Whether the panel is open. */
  @property({ type: Boolean, reflect: true })
  open = false;

  // === State ===

  @state()
  private _searchQuery = '';

  @state()
  private _focusedIndex = -1;

  // === Queries ===

  @query('.search__input')
  private _searchInput?: HTMLInputElement;

  // === SVGs ===

  private _chevronSvg = svg`<svg class="trigger__chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`;

  private _checkSvg = svg`<svg class="option__check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;

  private _searchSvg = svg`<svg class="search__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`;

  // === Event handlers ref ===

  private _outsideClickHandler = this._handleOutsideClick.bind(this);
  private _keydownHandler = this._handleKeydown.bind(this);
  private _listenersAttached = false;

  // === Lifecycle ===

  protected updated(changed: PropertyValues): void {
    if (changed.has('open')) {
      if (this.open && !this._listenersAttached) {
        this._addDocumentListeners();
      } else if (!this.open && this._listenersAttached) {
        this._removeDocumentListeners();
      }
    }
  }

  private _addDocumentListeners(): void {
    if (this._listenersAttached) return;
    document.addEventListener('click', this._outsideClickHandler, true);
    document.addEventListener('keydown', this._keydownHandler);
    this._listenersAttached = true;
  }

  private _removeDocumentListeners(): void {
    if (!this._listenersAttached) return;
    document.removeEventListener('click', this._outsideClickHandler, true);
    document.removeEventListener('keydown', this._keydownHandler);
    this._listenersAttached = false;
  }

  // === Public methods ===

  toggle(): void {
    if (this.open) this.hide();
    else this.show();
  }

  show(): void {
    if (this.disabled) return;
    this.open = true;
    this._searchQuery = '';
    this._focusedIndex = this._selectableModels.findIndex(m => m.value === this.value);
    this.updateComplete.then(() => {
      this._positionPanel();
      if (this.searchable) this._searchInput?.focus();
    });
    // Listeners are added in updated() when open becomes true
  }

  hide(): void {
    this.open = false;
    this._focusedIndex = -1;
    this._searchQuery = '';
    // Listeners are removed in updated() when open becomes false
  }

  // === Getters ===

  private get _selectedModel(): ModelOption | undefined {
    return this.models.find(m => m.value === this.value);
  }

  private get _filteredModels(): ModelOption[] {
    if (!this._searchQuery) return this.models;
    const q = this._searchQuery.toLowerCase();
    return this.models.filter(
      m =>
        m.label.toLowerCase().includes(q) ||
        m.description?.toLowerCase().includes(q) ||
        m.tier?.toLowerCase().includes(q) ||
        m.capabilities?.some(c => c.toLowerCase().includes(q)) ||
        m.group?.toLowerCase().includes(q),
    );
  }

  private get _selectableModels(): ModelOption[] {
    return this._filteredModels.filter(m => !m.disabled);
  }

  // === Panel positioning ===

  private async _positionPanel(): Promise<void> {
    const trigger = this.shadowRoot?.querySelector('.trigger') as HTMLElement | null;
    const panel = this.shadowRoot?.querySelector('.panel') as HTMLElement | null;
    if (!trigger || !panel) return;

    const { x, y } = await computePosition(trigger, panel, {
      placement: this.placement === 'top' ? 'top-start' : 'bottom-start',
      middleware: [
        offset(4),
        flip({ padding: 8 }),
        shift({ padding: 8 }),
        size({
          padding: 8,
          apply({ availableHeight, elements }) {
            Object.assign(elements.floating.style, {
              maxHeight: `${Math.min(availableHeight, 400)}px`,
            });
          },
        }),
      ],
    });
    Object.assign(panel.style, { left: `${x}px`, top: `${y}px` });
  }

  private _handleOutsideClick(e: MouseEvent): void {
    const path = e.composedPath();
    if (!path.includes(this)) {
      this.hide();
    }
  }

  // === Keyboard nav ===

  private _handleKeydown(e: KeyboardEvent): void {
    if (!this.open) return;
    const selectable = this._selectableModels;
    const count = selectable.length;
    if (!count) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        this._focusedIndex = this._focusedIndex === -1 ? 0 : (this._focusedIndex + 1) % count;
        break;
      case 'ArrowUp':
        e.preventDefault();
        this._focusedIndex =
          this._focusedIndex === -1 ? count - 1 : (this._focusedIndex - 1 + count) % count;
        break;
      case 'Enter':
        e.preventDefault();
        if (this._focusedIndex >= 0 && this._focusedIndex < count) {
          this._selectModel(selectable[this._focusedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        this.hide();
        break;
    }
  }

  // === Selection ===

  private _selectModel(model: ModelOption): void {
    if (model.disabled) return;
    const from = this.value;
    this.value = model.value;
    this.dispatchEvent(
      createLoquixEvent<LoquixModelChangeDetail>('loquix-model-change', {
        from,
        to: model.value,
      }),
    );
    this.hide();
  }

  // === Search ===

  private _handleSearchInput(e: Event): void {
    this._searchQuery = (e.target as HTMLInputElement).value;
    this._focusedIndex = 0;
  }

  // === Connected / Disconnected callbacks ===

  connectedCallback(): void {
    super.connectedCallback();
    // Reattach listeners on reconnect if open was true before disconnect
    if (this.open) this._addDocumentListeners();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this._removeDocumentListeners();
  }

  // === Render helpers ===

  private _renderTierBadge(tier?: string) {
    if (!tier) return nothing;
    return html`<span class="option__tier tier--${tier}">${tier}</span>`;
  }

  private _renderOption(model: ModelOption, _globalIdx: number) {
    const isActive = model.value === this.value;
    // Compute focused index against the filtered (selectable) list
    const selectableIdx = this._selectableModels.indexOf(model);
    const isFocused = selectableIdx === this._focusedIndex;

    return html`
      <button
        part="option"
        class="option ${isActive ? 'option--active' : ''} ${model.disabled
          ? 'option--disabled'
          : ''} ${isFocused ? 'option--focused' : ''}"
        role="option"
        aria-selected=${isActive}
        ?disabled=${model.disabled}
        @click=${() => this._selectModel(model)}
        @mouseenter=${() => {
          this._focusedIndex = selectableIdx;
        }}
      >
        ${model.icon ? html`<span class="option__icon">${model.icon}</span>` : nothing}

        <div class="option__content">
          <div class="option__label-row">
            <span class="option__label">${model.label}</span>
            ${this._renderTierBadge(model.tier)}
          </div>
          ${model.description
            ? html`<div class="option__description">${model.description}</div>`
            : nothing}
          ${this.showCapabilities && model.capabilities?.length
            ? html`
                <div class="option__capabilities">
                  ${model.capabilities.map(
                    cap => html`<span class="option__capability">${cap}</span>`,
                  )}
                </div>
              `
            : nothing}
        </div>

        <div class="option__trailing">
          ${this.showCost && model.cost
            ? html`<span class="option__cost">${model.cost}</span>`
            : nothing}
          ${this._checkSvg}
        </div>
      </button>
    `;
  }

  private _renderGrouped() {
    const filtered = this._filteredModels;
    const groups = new Map<string, ModelOption[]>();

    for (const model of filtered) {
      const group = model.group || '';
      if (!groups.has(group)) groups.set(group, []);
      groups.get(group)!.push(model);
    }

    let globalIdx = 0;
    return html`${Array.from(groups.entries()).map(
      ([group, models]) => html`
        ${group ? html`<div class="group-header">${group}</div>` : nothing}
        ${models.map(m => this._renderOption(m, globalIdx++))}
      `,
    )}`;
  }

  private _renderFlat() {
    return html`${this._filteredModels.map((m, idx) => this._renderOption(m, idx))}`;
  }

  // === Main render ===

  protected render() {
    const selected = this._selectedModel;
    const hasResults = this._filteredModels.length > 0;

    return html`
      <button
        part="trigger"
        class="trigger"
        ?disabled=${this.disabled}
        aria-haspopup="listbox"
        aria-expanded=${this.open}
        @click=${this.toggle}
      >
        ${selected?.icon ? html`<span class="trigger__icon">${selected.icon}</span>` : nothing}
        <span class="trigger__label"
          >${selected?.label ??
          this.placeholder ??
          this._localize.term('modelSelector.placeholder')}</span
        >
        ${selected?.tier
          ? html`<span class="trigger__tier tier--${selected.tier}">${selected.tier}</span>`
          : nothing}
        ${this._chevronSvg}
      </button>

      <div part="panel" class="panel" ?hidden=${!this.open} role="listbox">
        ${this.searchable
          ? html`
              <div part="search" class="search">
                ${this._searchSvg}
                <input
                  class="search__input"
                  type="text"
                  placeholder=${this._localize.term('modelSelector.searchPlaceholder')}
                  aria-label=${this._localize.term('modelSelector.searchLabel')}
                  .value=${this._searchQuery}
                  @input=${this._handleSearchInput}
                />
              </div>
            `
          : nothing}

        <div class="options">
          ${hasResults
            ? this.grouped
              ? this._renderGrouped()
              : this._renderFlat()
            : html`<div class="empty">${this._localize.term('modelSelector.emptyText')}</div>`}
        </div>
      </div>
    `;
  }
}
