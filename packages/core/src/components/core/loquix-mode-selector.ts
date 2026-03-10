import { LitElement, html, nothing, svg, type PropertyValues } from 'lit';
import { property, state } from 'lit/decorators.js';
import { computePosition, flip, shift, offset } from '@floating-ui/dom';
import type { ModeOption, ModeSelectorVariant } from '../../types/index.js';
import { createLoquixEvent } from '../../events/index.js';
import type { LoquixModeChangeDetail } from '../../events/index.js';
import { LocalizeController } from '../../i18n/index.js';
import styles from './loquix-mode-selector.styles.js';

/**
 * @tag loquix-mode-selector
 * @summary Switches between AI operating modes with four rendering variants.
 *
 * @csspart tabs - The tabs container (tabs/pills variant)
 * @csspart tab - A tab/pill button
 * @csspart toggle - The toggle container
 * @csspart toggle-option - A toggle option button
 * @csspart trigger - The dropdown trigger button
 * @csspart panel - The dropdown panel
 * @csspart option - A dropdown option
 *
 * @fires loquix-mode-change - Fired when the selected mode changes. Detail: { from, to }
 */
export class LoquixModeSelector extends LitElement {
  static styles = [styles];

  private _localize = new LocalizeController(this);

  /** Array of mode options. */
  @property({ type: Array })
  modes: ModeOption[] = [];

  /** Currently selected mode value. */
  @property({ type: String, reflect: true })
  value = '';

  /** Rendering variant. */
  @property({ type: String, reflect: true })
  variant: ModeSelectorVariant = 'tabs';

  /** Show mode descriptions (tabs/pills variants and dropdown options). */
  @property({ type: Boolean, attribute: 'show-description' })
  showDescription = false;

  /** Stack description below label instead of inline (tabs/pills variants). */
  @property({ type: Boolean, reflect: true })
  stacked = false;

  /** Whether the selector is disabled. */
  @property({ type: Boolean, reflect: true })
  disabled = false;

  /** Whether the dropdown panel is open (dropdown variant only). */
  @property({ type: Boolean, reflect: true })
  open = false;

  // === Private state ===

  @state()
  private _focusedIndex = -1;

  private _outsideClickHandler = this._handleOutsideClick.bind(this);
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
    document.addEventListener('keydown', this._handleDropdownKeydown);
    this._listenersAttached = true;
  }

  private _removeDocumentListeners(): void {
    if (!this._listenersAttached) return;
    document.removeEventListener('click', this._outsideClickHandler, true);
    document.removeEventListener('keydown', this._handleDropdownKeydown);
    this._listenersAttached = false;
  }

  // === SVGs ===

  private _chevronSvg = svg`<svg class="trigger__chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`;

  private _checkSvg = svg`<svg class="option__check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;

  // === Public methods ===

  toggle(): void {
    if (this.open) this.hide();
    else this.show();
  }

  show(): void {
    if (this.disabled) return;
    this.open = true;
    this._focusedIndex = this.modes.findIndex(m => m.value === this.value);
    this.updateComplete.then(() => this._positionPanel());
    // Listeners are added in updated() when open becomes true
  }

  hide(): void {
    this.open = false;
    this._focusedIndex = -1;
    // Listeners are removed in updated() when open becomes false
  }

  // === Selection ===

  private _handleSelect(mode: ModeOption): void {
    if (this.disabled || mode.value === this.value) return;
    const from = this.value;
    this.value = mode.value;
    this.dispatchEvent(
      createLoquixEvent<LoquixModeChangeDetail>('loquix-mode-change', {
        from,
        to: mode.value,
      }),
    );
  }

  // === Getters ===

  private get _selectedMode(): ModeOption | undefined {
    return this.modes.find(m => m.value === this.value);
  }

  // === Dropdown positioning ===

  private async _positionPanel(): Promise<void> {
    const trigger = this.shadowRoot?.querySelector('.trigger') as HTMLElement | null;
    const panel = this.shadowRoot?.querySelector('.panel') as HTMLElement | null;
    if (!trigger || !panel) return;

    const { x, y } = await computePosition(trigger, panel, {
      placement: 'bottom-start',
      middleware: [offset(4), flip({ padding: 8 }), shift({ padding: 8 })],
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

  private _handleTabsKeydown = (e: KeyboardEvent): void => {
    const count = this.modes.length;
    if (!count) return;

    const currentIdx = this.modes.findIndex(m => m.value === this.value);
    let newIdx = currentIdx;

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      newIdx = (currentIdx + 1) % count;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      newIdx = (currentIdx - 1 + count) % count;
    } else {
      return;
    }

    this._handleSelect(this.modes[newIdx]);
    // Focus the new button
    this.updateComplete.then(() => {
      const buttons = this.shadowRoot?.querySelectorAll(
        '.tab, .toggle__option',
      ) as NodeListOf<HTMLButtonElement>;
      buttons?.[newIdx]?.focus();
    });
  };

  private _handleDropdownKeydown = (e: KeyboardEvent): void => {
    if (!this.open) return;
    const count = this.modes.length;
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
      case ' ':
        e.preventDefault();
        if (this._focusedIndex >= 0 && this._focusedIndex < count) {
          this._handleSelect(this.modes[this._focusedIndex]);
          this.hide();
        }
        break;
      case 'Escape':
        e.preventDefault();
        this.hide();
        break;
    }
  };

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

  private _renderTabs() {
    return html`
      <div
        part="tabs"
        class="tabs"
        role="tablist"
        aria-label=${this._localize.term('modeSelector.ariaLabel')}
      >
        ${this.modes.map(
          mode => html`
            <button
              part="tab"
              class="tab ${mode.value === this.value ? 'tab--active' : ''}"
              role="tab"
              aria-selected=${mode.value === this.value}
              ?disabled=${this.disabled}
              @click=${() => this._handleSelect(mode)}
              @keydown=${this._handleTabsKeydown}
            >
              ${mode.icon ? html`<span class="tab__icon">${mode.icon}</span>` : nothing}
              <div class="tab__text">
                <span class="tab__label">${mode.label}</span>
                ${this.showDescription && mode.description
                  ? html`<span class="tab__description">${mode.description}</span>`
                  : nothing}
              </div>
            </button>
          `,
        )}
      </div>
    `;
  }

  private _renderToggle() {
    return html`
      <div
        part="toggle"
        class="toggle"
        role="radiogroup"
        aria-label=${this._localize.term('modeSelector.ariaLabel')}
      >
        ${this.modes.slice(0, 2).map(
          mode => html`
            <button
              part="toggle-option"
              class="toggle__option ${mode.value === this.value ? 'toggle__option--active' : ''}"
              role="radio"
              aria-checked=${mode.value === this.value}
              ?disabled=${this.disabled}
              @click=${() => this._handleSelect(mode)}
              @keydown=${this._handleTabsKeydown}
            >
              ${mode.icon ? html`<span class="toggle__icon">${mode.icon}</span>` : nothing}
              <span class="toggle__label">${mode.label}</span>
            </button>
          `,
        )}
      </div>
    `;
  }

  private _renderDropdown() {
    const selected = this._selectedMode;
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
          >${selected?.label ?? this._localize.term('modeSelector.selectLabel')}</span
        >
        ${this._chevronSvg}
      </button>

      <div part="panel" class="panel" ?hidden=${!this.open} role="listbox">
        ${this.modes.map(
          (mode, idx) => html`
            <button
              part="option"
              class="option ${mode.value === this.value ? 'option--active' : ''} ${idx ===
              this._focusedIndex
                ? 'option--focused'
                : ''}"
              role="option"
              aria-selected=${mode.value === this.value}
              @click=${() => {
                this._handleSelect(mode);
                this.hide();
              }}
              @mouseenter=${() => {
                this._focusedIndex = idx;
              }}
            >
              ${mode.icon ? html`<span class="option__icon">${mode.icon}</span>` : nothing}
              <div class="option__content">
                <div class="option__label">${mode.label}</div>
                ${this.showDescription && mode.description
                  ? html`<div class="option__description">${mode.description}</div>`
                  : nothing}
              </div>
              ${this._checkSvg}
            </button>
          `,
        )}
      </div>
    `;
  }

  // === Main render ===

  protected render() {
    switch (this.variant) {
      case 'pills':
      case 'tabs':
        return this._renderTabs();
      case 'toggle':
        return this._renderToggle();
      case 'dropdown':
        return this._renderDropdown();
      default:
        return this._renderTabs();
    }
  }
}
