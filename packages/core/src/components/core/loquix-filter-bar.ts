import { LitElement, html, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import type { FilterOption } from '../../types/index.js';
import { createLoquixEvent } from '../../events/index.js';
import type { LoquixFilterChangeDetail } from '../../events/index.js';
import { LocalizeController } from '../../i18n/index.js';
import styles from './loquix-filter-bar.styles.js';

/**
 * @tag loquix-filter-bar
 * @summary Horizontal bar of toggleable filter chips with optional negative prompt input.
 *
 * @csspart bar - The filter buttons container
 * @csspart filter - A filter button
 * @csspart negative-prompt - The negative prompt section
 *
 * @fires loquix-filter-change - Fired when filters or negative prompt change. Detail: { values, negativePrompt? }
 */
export class LoquixFilterBar extends LitElement {
  static styles = [styles];

  private _localize = new LocalizeController(this);

  /** Array of filter options. */
  @property({ type: Array })
  filters: FilterOption[] = [];

  /** Currently active filter ids. */
  @property({ type: Array })
  values: string[] = [];

  /** Show negative prompt input. */
  @property({ type: Boolean, attribute: 'show-negative-prompt' })
  showNegativePrompt = false;

  /** Negative prompt text. */
  @property({ type: String, attribute: 'negative-prompt' })
  negativePrompt = '';

  /** Whether all controls are disabled. */
  @property({ type: Boolean, reflect: true })
  disabled = false;

  /** Debounce timer for negative prompt input */
  private _debounceTimer = 0;

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    window.clearTimeout(this._debounceTimer);
  }

  // === Helpers ===

  private _isActive(filterId: string): boolean {
    return this.values.includes(filterId);
  }

  private _dispatchChange(newValues: string[], negativePrompt?: string): void {
    this.dispatchEvent(
      createLoquixEvent<LoquixFilterChangeDetail>('loquix-filter-change', {
        values: newValues,
        negativePrompt: negativePrompt ?? this.negativePrompt,
      }),
    );
  }

  // === Event handlers ===

  private _handleFilterToggle(filter: FilterOption): void {
    if (this.disabled) return;
    const newValues = this._isActive(filter.id)
      ? this.values.filter(v => v !== filter.id)
      : [...this.values, filter.id];
    this.values = newValues;
    this._dispatchChange(newValues);
  }

  private _handleNegativePromptInput(e: Event): void {
    const val = (e.target as HTMLInputElement).value;
    this.negativePrompt = val;
    window.clearTimeout(this._debounceTimer);
    this._debounceTimer = window.setTimeout(() => {
      this._dispatchChange(this.values, val);
    }, 200);
  }

  // === Keyboard nav ===

  private _handleKeyDown = (e: KeyboardEvent): void => {
    const buttons = this.shadowRoot?.querySelectorAll('.filter') as NodeListOf<HTMLButtonElement>;
    if (!buttons?.length) return;
    const currentIdx = Array.from(buttons).indexOf(e.target as HTMLButtonElement);
    let newIdx;

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      newIdx = (currentIdx + 1) % buttons.length;
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      newIdx = (currentIdx - 1 + buttons.length) % buttons.length;
    } else {
      return;
    }

    buttons[newIdx]?.focus();
  };

  // === Grouping ===

  private _getGroupedFilters(): Map<string, FilterOption[]> {
    const groups = new Map<string, FilterOption[]>();
    for (const filter of this.filters) {
      const group = filter.group || '';
      if (!groups.has(group)) groups.set(group, []);
      groups.get(group)!.push(filter);
    }
    return groups;
  }

  // === Render helpers ===

  private _renderFilterChip(filter: FilterOption) {
    return html`
      <button
        part="filter"
        class="filter ${this._isActive(filter.id) ? 'filter--active' : ''}"
        role="checkbox"
        aria-checked=${this._isActive(filter.id)}
        ?disabled=${this.disabled}
        @click=${() => this._handleFilterToggle(filter)}
        @keydown=${this._handleKeyDown}
      >
        ${filter.icon ? html`<span class="filter__icon">${filter.icon}</span>` : nothing}
        <span class="filter__label">${filter.label}</span>
      </button>
    `;
  }

  // === Main render ===

  protected render() {
    const groups = this._getGroupedFilters();
    const hasGroups = groups.size > 1 || (groups.size === 1 && !groups.has(''));
    const groupEntries = Array.from(groups.entries());

    return html`
      <div
        part="bar"
        class="bar"
        role="toolbar"
        aria-label=${this._localize.term('filterBar.ariaLabel')}
      >
        ${hasGroups
          ? html`
              ${groupEntries.map(
                ([group, items], gIdx) => html`
                  ${group ? html`<span class="group-label">${group}</span>` : nothing}
                  ${items.map(filter => this._renderFilterChip(filter))}
                  ${gIdx < groupEntries.length - 1 ? html`<span class="divider"></span>` : nothing}
                `,
              )}
            `
          : html` ${this.filters.map(filter => this._renderFilterChip(filter))} `}
      </div>

      ${this.showNegativePrompt
        ? html`
            <div part="negative-prompt" class="negative-prompt">
              <label class="negative-prompt__label"
                >${this._localize.term('filterBar.excludeLabel')}</label
              >
              <input
                class="negative-prompt__input"
                type="text"
                placeholder=${this._localize.term('filterBar.excludePlaceholder')}
                .value=${this.negativePrompt}
                ?disabled=${this.disabled}
                @input=${this._handleNegativePromptInput}
              />
            </div>
          `
        : nothing}
    `;
  }
}
