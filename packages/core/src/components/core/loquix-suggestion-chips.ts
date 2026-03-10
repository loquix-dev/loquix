import { LitElement, html, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import type { Suggestion, SuggestionVariant } from '../../types/index.js';
import { createLoquixEvent } from '../../events/index.js';
import type { LoquixSuggestionSelectDetail } from '../../events/index.js';
import { LocalizeController } from '../../i18n/index.js';
import styles from './loquix-suggestion-chips.styles.js';

/**
 * @tag loquix-suggestion-chips
 * @summary Reusable suggestion chip strip for prompts and follow-ups.
 *
 * @csspart chip - Individual chip button.
 * @csspart more-button - The "+N more" overflow button.
 *
 * @fires {CustomEvent<LoquixSuggestionSelectDetail>} loquix-suggestion-select - When a chip is clicked.
 *
 * @cssprop [--loquix-chip-bg] - Chip background.
 * @cssprop [--loquix-chip-color] - Chip text color.
 * @cssprop [--loquix-chip-border-color] - Chip border color.
 * @cssprop [--loquix-chip-border-radius] - Chip border radius.
 * @cssprop [--loquix-chip-gap] - Gap between chips.
 * @cssprop [--loquix-chip-padding] - Chip padding.
 * @cssprop [--loquix-chip-font-size] - Chip font size.
 * @cssprop [--loquix-chip-hover-bg] - Chip hover background.
 */
export class LoquixSuggestionChips extends LitElement {
  static styles = [styles];

  private _localize = new LocalizeController(this);

  /** Array of suggestion items to render as chips. */
  @property({ type: Array })
  suggestions: Suggestion[] = [];

  /** Visual variant of the chips. */
  @property({ reflect: true })
  variant: SuggestionVariant = 'chip';

  /** Max number of chips to show before "+N more". 0 = show all. */
  @property({ type: Number, attribute: 'max-visible' })
  maxVisible = 0;

  /** Disables all chips. */
  @property({ type: Boolean, reflect: true })
  disabled = false;

  /** Whether chips wrap to new lines (true) or scroll horizontally (false). */
  @property({ type: Boolean })
  wrap = true;

  /** Whether all chips are shown (when maxVisible is set). */
  @state()
  private _expanded = false;

  private _handleChipClick(suggestion: Suggestion): void {
    if (this.disabled) return;
    this.dispatchEvent(
      createLoquixEvent<LoquixSuggestionSelectDetail>('loquix-suggestion-select', {
        suggestion,
      }),
    );
  }

  private _handleMoreClick(): void {
    this._expanded = true;
  }

  private _handleKeyDown = (e: KeyboardEvent): void => {
    const chips = this._getChipElements();
    if (!chips.length) return;

    const currentIndex = chips.indexOf(e.target as HTMLElement);
    if (currentIndex === -1) return;

    let nextIndex = -1;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      nextIndex = (currentIndex + 1) % chips.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      nextIndex = (currentIndex - 1 + chips.length) % chips.length;
    }

    if (nextIndex >= 0) {
      chips[nextIndex].focus();
    }
  };

  private _getChipElements(): HTMLElement[] {
    return Array.from(this.renderRoot.querySelectorAll<HTMLElement>('.chip, .more-btn'));
  }

  private _getVisibleSuggestions(): Suggestion[] {
    if (!this.maxVisible || this._expanded || this.suggestions.length <= this.maxVisible) {
      return this.suggestions;
    }
    return this.suggestions.slice(0, this.maxVisible);
  }

  private _renderChip(suggestion: Suggestion) {
    return html`
      <button
        class="chip"
        part="chip"
        ?disabled=${this.disabled}
        @click=${() => this._handleChipClick(suggestion)}
        @keydown=${this._handleKeyDown}
      >
        ${suggestion.icon ? html`<span class="chip__icon">${suggestion.icon}</span>` : nothing}
        <span class="chip__text">${suggestion.text}</span>
        ${this.variant === 'card' && suggestion.description
          ? html`<span class="chip__description">${suggestion.description}</span>`
          : nothing}
      </button>
    `;
  }

  protected render() {
    const visible = this._getVisibleSuggestions();
    const hiddenCount = this.suggestions.length - visible.length;

    return html`
      <div
        class="chips ${!this.wrap ? 'chips--no-wrap' : ''}"
        role="group"
        aria-label=${this._localize.term('suggestionChips.ariaLabel')}
      >
        ${visible.map(s => this._renderChip(s))}
        ${hiddenCount > 0
          ? html`
              <button
                class="more-btn"
                part="more-button"
                @click=${this._handleMoreClick}
                @keydown=${this._handleKeyDown}
              >
                ${this._localize.term('suggestionChips.moreCount', { count: hiddenCount })}
              </button>
            `
          : nothing}
      </div>
    `;
  }
}
