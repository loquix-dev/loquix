import { LitElement, html, nothing, type PropertyValues } from 'lit';
import { property, state, query } from 'lit/decorators.js';
import { computePosition, flip, shift, offset, size, type Placement } from '@floating-ui/dom';
import type { SelectOption } from '../../types/index.js';
import { createLoquixEvent } from '../../events/index.js';
import { LocalizeController } from '../../i18n/index.js';
import styles from './loquix-dropdown-select.styles.js';

/**
 * @tag loquix-dropdown-select
 * @summary A rich dropdown select with search, groups, descriptions, icons, and keyboard nav.
 *
 * @csspart trigger - The trigger button.
 * @csspart panel - The dropdown panel.
 * @csspart search - The search input wrapper.
 * @csspart option - An option item.
 * @csspart footer - The footer slot area.
 *
 * @slot footer - Custom content at the bottom of the dropdown (e.g. "Create new branch").
 * @slot trigger-icon - Custom icon for the trigger button (replaces the selected option icon).
 *
 * @fires loquix-select-change - When a value is selected.
 *
 * @cssprop [--loquix-dropdown-trigger-padding] - Trigger padding.
 * @cssprop [--loquix-dropdown-trigger-radius] - Trigger border radius.
 * @cssprop [--loquix-dropdown-trigger-bg] - Trigger background.
 * @cssprop [--loquix-dropdown-trigger-color] - Trigger text color.
 * @cssprop [--loquix-dropdown-panel-bg] - Panel background.
 * @cssprop [--loquix-dropdown-panel-radius] - Panel border radius.
 * @cssprop [--loquix-dropdown-panel-border-color] - Panel border color.
 * @cssprop [--loquix-dropdown-min-width] - Minimum panel width.
 * @cssprop [--loquix-dropdown-max-height] - Max options list height.
 * @cssprop [--loquix-dropdown-option-color] - Option text color.
 * @cssprop [--loquix-dropdown-option-label-color] - Option label color.
 * @cssprop [--loquix-dropdown-option-desc-color] - Option description color.
 */
export class LoquixDropdownSelect extends LitElement {
  static styles = [styles];

  private _localize = new LocalizeController(this);

  /** Array of options to display. */
  @property({ type: Array })
  options: SelectOption[] = [];

  /** Currently selected value. */
  @property({ type: String, reflect: true })
  value = '';

  /** Placeholder when no value selected. */
  @property({ type: String })
  placeholder?: string;

  /** Whether to show a search input. */
  @property({ type: Boolean, reflect: true })
  searchable = false;

  /** Search placeholder text. */
  @property({ type: String, attribute: 'search-placeholder' })
  searchPlaceholder?: string;

  /** Whether the dropdown is disabled. */
  @property({ type: Boolean, reflect: true })
  disabled = false;

  /** Preferred panel placement. Floating UI will auto-flip if not enough space. */
  @property({ type: String })
  placement: 'top' | 'bottom' = 'top';

  /** Hide the chevron arrow on the trigger button. */
  @property({ type: Boolean, attribute: 'no-chevron', reflect: true })
  noChevron = false;

  /** Whether the panel is open. */
  @property({ type: Boolean, reflect: true })
  open = false;

  @state()
  private _searchQuery = '';

  @state()
  private _focusedIndex = -1;

  @state()
  private _hoveredHint = '';

  @state()
  private _activeSubmenu: SelectOption | null = null;

  private _submenuTimeout: ReturnType<typeof setTimeout> | null = null;

  @query('.search__input')
  private _searchInput?: HTMLInputElement;

  @query('.trigger')
  private _triggerEl?: HTMLButtonElement;

  @query('.panel')
  private _panelEl?: HTMLElement;

  // ---------------------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------------------

  private _listenersAttached = false;

  connectedCallback(): void {
    super.connectedCallback();
    this._handleOutsideClick = this._handleOutsideClick.bind(this);
    this._handleKeydown = this._handleKeydown.bind(this);
    // Reattach listeners on reconnect if open was true before disconnect
    if (this.open) this._addDocumentListeners();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this._removeDocumentListeners();
    this._clearSubmenuTimeout();
  }

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
    document.addEventListener('click', this._handleOutsideClick);
    document.addEventListener('keydown', this._handleKeydown);
    this._listenersAttached = true;
  }

  private _removeDocumentListeners(): void {
    if (!this._listenersAttached) return;
    document.removeEventListener('click', this._handleOutsideClick);
    document.removeEventListener('keydown', this._handleKeydown);
    this._listenersAttached = false;
  }

  // ---------------------------------------------------------------------------
  // Getters
  // ---------------------------------------------------------------------------

  private get _selectedOption(): SelectOption | undefined {
    return this._findOption(this.options, this.value);
  }

  /** Recursively find an option by value, searching through children. */
  private _findOption(options: SelectOption[], value: string): SelectOption | undefined {
    for (const opt of options) {
      if (opt.value === value) return opt;
      if (opt.children) {
        const found = this._findOption(opt.children, value);
        if (found) return found;
      }
    }
    return undefined;
  }

  private get _filteredOptions(): SelectOption[] {
    if (!this._searchQuery) return this.options;
    const q = this._searchQuery.toLowerCase();
    return this.options.filter(
      o =>
        o.type === 'separator' ||
        o.label.toLowerCase().includes(q) ||
        o.description?.toLowerCase().includes(q),
    );
  }

  /** Group options by their `group` property, preserving insertion order. */
  private get _groupedOptions(): Array<{ group: string; options: SelectOption[] }> {
    const filtered = this._filteredOptions;
    const groups: Map<string, SelectOption[]> = new Map();
    for (const opt of filtered) {
      if (opt.type === 'separator') continue;
      const key = opt.group ?? '';
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(opt);
    }
    return Array.from(groups.entries()).map(([group, options]) => ({ group, options }));
  }

  /** Flat list of selectable (non-separator, non-disabled) options for keyboard nav. */
  private get _selectableOptions(): SelectOption[] {
    return this._filteredOptions.filter(o => o.type !== 'separator' && !o.disabled);
  }

  // ---------------------------------------------------------------------------
  // Open / Close
  // ---------------------------------------------------------------------------

  toggle(): void {
    if (this.open) {
      this.hide();
    } else {
      this.show();
    }
  }

  show(): void {
    if (this.disabled || this.open) return;
    this.open = true;
    this._searchQuery = '';
    this._focusedIndex = -1;
    // Listeners are added in updated() when open becomes true
    this.updateComplete.then(() => {
      this._positionPanel();
      this._searchInput?.focus();
    });
  }

  hide(): void {
    if (!this.open) return;
    this.open = false;
    this._hoveredHint = '';
    this._activeSubmenu = null;
    this._clearSubmenuTimeout();
    // Listeners are removed in updated() when open becomes false
  }

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  private _handleOutsideClick(e: MouseEvent): void {
    if (!this.open) return;
    const path = e.composedPath();
    if (!path.includes(this)) this.hide();
  }

  private _handleKeydown(e: KeyboardEvent): void {
    if (!this.open) return;
    const selectable = this._selectableOptions;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        this._focusedIndex = Math.min(this._focusedIndex + 1, selectable.length - 1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        this._focusedIndex = Math.max(this._focusedIndex - 1, 0);
        break;
      case 'Enter':
        e.preventDefault();
        if (this._focusedIndex >= 0 && this._focusedIndex < selectable.length) {
          this._selectOption(selectable[this._focusedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        this.hide();
        break;
    }
  }

  private _handleSearchInput(e: Event): void {
    this._searchQuery = (e.target as HTMLInputElement).value;
    this._focusedIndex = -1;
  }

  private _selectOption(opt: SelectOption): void {
    if (opt.disabled) return;

    // Options with children toggle submenu on click instead of selecting
    if (this._hasChildren(opt)) {
      if (this._activeSubmenu === opt) {
        this._activeSubmenu = null;
      } else {
        this._activeSubmenu = opt;
        this.updateComplete.then(() => this._positionSubmenu(opt));
      }
      return;
    }

    if (opt.type === 'action') {
      this.dispatchEvent(
        createLoquixEvent('loquix-select-change', { value: opt.value, option: opt }),
      );
      this.hide();
      return;
    }

    this.value = opt.value;
    this.dispatchEvent(
      createLoquixEvent('loquix-select-change', { value: opt.value, option: opt }),
    );
    this.hide();
  }

  private _selectSubmenuOption(opt: SelectOption): void {
    if (opt.disabled) return;

    if (opt.type === 'action') {
      this.dispatchEvent(
        createLoquixEvent('loquix-select-change', { value: opt.value, option: opt }),
      );
    } else {
      this.value = opt.value;
      this.dispatchEvent(
        createLoquixEvent('loquix-select-change', { value: opt.value, option: opt }),
      );
    }
    this.hide();
  }

  private _handleOptionHover(opt: SelectOption): void {
    this._hoveredHint = opt.hint ?? '';

    // Submenu logic: open on hover if option has children
    if (this._hasChildren(opt)) {
      this._clearSubmenuTimeout();
      if (this._activeSubmenu !== opt) {
        this._activeSubmenu = opt;
        this.updateComplete.then(() => this._positionSubmenu(opt));
      }
    } else {
      // Delay close so user can move mouse to submenu panel
      this._scheduleSubmenuClose();
    }
  }

  private _handleOptionLeave(): void {
    this._hoveredHint = '';
    this._scheduleSubmenuClose();
  }

  private _handleSubmenuEnter(): void {
    this._clearSubmenuTimeout();
  }

  private _handleSubmenuLeave(): void {
    this._scheduleSubmenuClose();
  }

  private _scheduleSubmenuClose(): void {
    this._clearSubmenuTimeout();
    this._submenuTimeout = setTimeout(() => {
      this._activeSubmenu = null;
    }, 150);
  }

  private _clearSubmenuTimeout(): void {
    if (this._submenuTimeout !== null) {
      clearTimeout(this._submenuTimeout);
      this._submenuTimeout = null;
    }
  }

  private _hasChildren(opt: SelectOption): boolean {
    return !!(opt.children && opt.children.length > 0);
  }

  // ---------------------------------------------------------------------------
  // Floating UI positioning
  // ---------------------------------------------------------------------------

  /** Position the panel using Floating UI with flip + shift + offset. */
  private async _positionPanel(): Promise<void> {
    const trigger = this._triggerEl;
    const panel = this._panelEl;
    if (!trigger || !panel) return;

    const preferredPlacement: Placement = this.placement === 'top' ? 'top-start' : 'bottom-start';

    const { x, y } = await computePosition(trigger, panel, {
      placement: preferredPlacement,
      middleware: [
        offset(4),
        flip({ padding: 8 }),
        shift({ padding: 8 }),
        size({
          padding: 8,
          apply({ availableHeight, elements }) {
            Object.assign(elements.floating.style, {
              maxHeight: `${Math.min(availableHeight, 320)}px`,
            });
          },
        }),
      ],
    });

    Object.assign(panel.style, {
      left: `${x}px`,
      top: `${y}px`,
    });
  }

  /** Position a submenu panel relative to its parent option button. */
  private async _positionSubmenu(opt: SelectOption): Promise<void> {
    const shadowRoot = this.shadowRoot;
    if (!shadowRoot) return;

    // Find the parent option button by matching data-value
    const optionEl = shadowRoot.querySelector(
      `.option[data-value="${CSS.escape(opt.value)}"]`,
    ) as HTMLElement | null;
    const submenuEl = shadowRoot.querySelector('.submenu') as HTMLElement | null;
    if (!optionEl || !submenuEl) return;

    const { x, y } = await computePosition(optionEl, submenuEl, {
      placement: 'right-start',
      middleware: [
        offset(4),
        flip({
          padding: 8,
          fallbackPlacements: ['left-start', 'right-end', 'left-end'],
        }),
        shift({ padding: 8 }),
        size({
          padding: 8,
          apply({ availableHeight, elements }) {
            Object.assign(elements.floating.style, {
              maxHeight: `${Math.min(availableHeight, 280)}px`,
            });
          },
        }),
      ],
    });

    Object.assign(submenuEl.style, {
      left: `${x}px`,
      top: `${y}px`,
    });
  }

  // ---------------------------------------------------------------------------
  // SVG helpers
  // ---------------------------------------------------------------------------

  private _chevronSvg() {
    return html`<svg
      class="trigger__chevron"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>`;
  }

  private _checkSvg() {
    return html`<svg
      class="option__check"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>`;
  }

  private _searchSvg() {
    return html`<svg
      class="search__icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>`;
  }

  private _externalSvg() {
    return html`<svg
      class="option__external"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
      <polyline points="15 3 21 3 21 9"></polyline>
      <line x1="10" y1="14" x2="21" y2="3"></line>
    </svg>`;
  }

  private _arrowSvg() {
    return html`<svg
      class="option__arrow"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <polyline points="9 18 15 12 9 6"></polyline>
    </svg>`;
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  private _renderOption(opt: SelectOption) {
    const isActive = opt.value === this.value && opt.type !== 'action';
    const selectable = this._selectableOptions;
    const isFocused = selectable[this._focusedIndex] === opt;
    const showSubmenuArrow = opt.hasSubmenu || this._hasChildren(opt);
    const isSubmenuOpen = this._activeSubmenu === opt;

    return html`
      <button
        part="option"
        class="option ${isActive ? 'option--active' : ''} ${opt.disabled
          ? 'option--disabled'
          : ''} ${isFocused ? 'option--focused' : ''} ${isSubmenuOpen
          ? 'option--submenu-open'
          : ''}"
        role="option"
        aria-selected=${isActive}
        aria-expanded=${showSubmenuArrow ? isSubmenuOpen : nothing}
        data-value=${opt.value}
        @click=${() => this._selectOption(opt)}
        @mouseenter=${() => this._handleOptionHover(opt)}
        @mouseleave=${this._handleOptionLeave}
      >
        ${opt.icon ? html`<span class="option__icon">${opt.icon}</span>` : nothing}
        <div class="option__content">
          <div class="option__label">${opt.label}</div>
          ${opt.description
            ? html`<div class="option__description">${opt.description}</div>`
            : nothing}
        </div>
        <div class="option__trailing">
          ${opt.badge ? html`<span class="option__badge">${opt.badge}</span>` : nothing}
          ${opt.external ? this._externalSvg() : nothing}
          ${showSubmenuArrow
            ? this._arrowSvg()
            : opt.type !== 'action'
              ? this._checkSvg()
              : nothing}
        </div>
      </button>
    `;
  }

  protected render() {
    const selected = this._selectedOption;
    const grouped = this._groupedOptions;

    return html`
      ${this._hoveredHint ? html`<div class="hint">${this._hoveredHint}</div>` : nothing}

      <button
        part="trigger"
        class="trigger"
        ?disabled=${this.disabled}
        @click=${this.toggle}
        aria-haspopup="listbox"
        aria-expanded=${this.open}
      >
        <slot name="trigger-icon">
          ${selected?.icon ? html`<span class="trigger__icon">${selected.icon}</span>` : nothing}
        </slot>
        ${selected?.label || this.placeholder || this._localize.term('dropdownSelect.placeholder')
          ? html`<span class="trigger__label"
              >${selected?.label ||
              (this.placeholder ?? this._localize.term('dropdownSelect.placeholder'))}</span
            >`
          : nothing}
        ${this.noChevron ? nothing : this._chevronSvg()}
      </button>

      <div part="panel" class="panel" ?hidden=${!this.open} role="listbox">
        ${this.searchable
          ? html`
              <div part="search" class="search">
                ${this._searchSvg()}
                <input
                  class="search__input"
                  type="text"
                  placeholder=${this.searchPlaceholder ??
                  this._localize.term('dropdownSelect.searchPlaceholder')}
                  aria-label=${this.searchPlaceholder ??
                  this._localize.term('dropdownSelect.searchPlaceholder')}
                  .value=${this._searchQuery}
                  @input=${this._handleSearchInput}
                />
              </div>
            `
          : nothing}

        <div class="options">
          ${grouped.map(
            ({ group, options }) => html`
              ${group ? html`<div class="group-header">${group}</div>` : nothing}
              ${options.map(opt => this._renderOption(opt))}
            `,
          )}
        </div>

        <div part="footer" class="footer">
          <slot name="footer"></slot>
        </div>
      </div>

      ${this._activeSubmenu && this._hasChildren(this._activeSubmenu)
        ? html`
            <div
              class="submenu"
              @mouseenter=${this._handleSubmenuEnter}
              @mouseleave=${this._handleSubmenuLeave}
            >
              ${this._activeSubmenu.children!.map(
                child => html`
                  <button
                    class="option ${child.value === this.value
                      ? 'option--active'
                      : ''} ${child.disabled ? 'option--disabled' : ''}"
                    role="option"
                    aria-selected=${child.value === this.value}
                    @click=${() => {
                      this._selectSubmenuOption(child);
                    }}
                  >
                    ${child.icon ? html`<span class="option__icon">${child.icon}</span>` : nothing}
                    <div class="option__content">
                      <div class="option__label">${child.label}</div>
                      ${child.description
                        ? html`<div class="option__description">${child.description}</div>`
                        : nothing}
                    </div>
                  </button>
                `,
              )}
            </div>
          `
        : nothing}
    `;
  }
}
