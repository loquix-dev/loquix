import { LitElement, html, nothing } from 'lit';
import { property, state, query } from 'lit/decorators.js';
import type { Template } from '../../types/index.js';
import { createLoquixEvent } from '../../events/index.js';
import type {
  LoquixTemplateSelectDetail,
  LoquixTemplatePickerOpenDetail,
  LoquixTemplatePickerCloseDetail,
} from '../../events/index.js';
import { LocalizeController } from '../../i18n/index.js';
import styles from './loquix-template-picker.styles.js';
import './define-template-card.js';

/**
 * @tag loquix-template-picker
 * @summary Modal dialog with a searchable, categorized grid of template cards.
 *
 * Uses native `<dialog>` element — no Shoelace dependency.
 *
 * @csspart dialog - The `<dialog>` element.
 * @csspart search - The search input.
 *
 * @fires {CustomEvent<LoquixTemplatePickerOpenDetail>} loquix-template-picker-open - When the dialog opens.
 * @fires {CustomEvent<LoquixTemplatePickerCloseDetail>} loquix-template-picker-close - When the dialog closes.
 * @fires {CustomEvent<LoquixTemplateSelectDetail>} loquix-template-select - When a template is selected.
 *
 * @cssprop [--loquix-picker-max-width] - Dialog max width.
 * @cssprop [--loquix-picker-border-color] - Dialog border color.
 * @cssprop [--loquix-picker-border-radius] - Dialog border radius.
 * @cssprop [--loquix-picker-bg] - Dialog background.
 * @cssprop [--loquix-picker-backdrop] - Backdrop overlay color.
 * @cssprop [--loquix-picker-gap] - Grid gap.
 * @cssprop [--loquix-picker-card-min-width] - Minimum card width in the grid.
 */
export class LoquixTemplatePicker extends LitElement {
  static styles = [styles];

  private _localize = new LocalizeController(this);

  /** Array of templates to display. */
  @property({ type: Array })
  templates: Template[] = [];

  /** Whether the picker dialog is open. */
  @property({ type: Boolean, reflect: true })
  open = false;

  /** Dialog heading text. */
  @property()
  heading?: string;

  /** Whether to show the search input. */
  @property({ type: Boolean })
  searchable = true;

  /** Whether clicking the backdrop closes the dialog. */
  @property({ type: Boolean, attribute: 'close-on-outside-click' })
  closeOnOutsideClick = false;

  /** Explicit category order. If omitted, derived from templates. */
  @property({ type: Array })
  categories: string[] = [];

  @state()
  private _search = '';

  @state()
  private _activeCategory = '';

  @query('dialog')
  private _dialog!: HTMLDialogElement;

  // ---------------------------------------------------------------------------
  // Sync `open` property with native <dialog>
  // ---------------------------------------------------------------------------

  protected override updated(changed: Map<PropertyKey, unknown>): void {
    if (changed.has('open')) {
      if (this.open && this._dialog && !this._dialog.open) {
        this._dialog.showModal();
        this.dispatchEvent(
          createLoquixEvent<LoquixTemplatePickerOpenDetail>('loquix-template-picker-open', {}),
        );
      } else if (!this.open && this._dialog?.open) {
        this._dialog.close();
      }
    }
  }

  /** Open the picker dialog. */
  show(): void {
    this.open = true;
  }

  /** Close the picker dialog. */
  hide(): void {
    this.open = false;
    this._search = '';
    this._activeCategory = '';
    this.dispatchEvent(
      createLoquixEvent<LoquixTemplatePickerCloseDetail>('loquix-template-picker-close', {}),
    );
  }

  private _getCategories(): string[] {
    if (this.categories.length > 0) return this.categories;
    const cats = new Set<string>();
    for (const t of this.templates) {
      if (t.category) cats.add(t.category);
    }
    return Array.from(cats);
  }

  private _getFilteredTemplates(): Template[] {
    let result = this.templates;

    if (this._activeCategory) {
      result = result.filter(t => t.category === this._activeCategory);
    }

    if (this._search) {
      const q = this._search.toLowerCase();
      result = result.filter(
        t =>
          t.title.toLowerCase().includes(q) || (t.description?.toLowerCase().includes(q) ?? false),
      );
    }

    return result;
  }

  private _handleSearch(e: Event): void {
    this._search = (e.target as HTMLInputElement).value;
  }

  private _handleCategoryClick(cat: string): void {
    this._activeCategory = this._activeCategory === cat ? '' : cat;
  }

  private _handleTemplateSelect = (e: Event): void => {
    // Re-dispatch the event from the template card and close
    const detail = (e as CustomEvent<LoquixTemplateSelectDetail>).detail;
    if (detail) {
      e.stopPropagation();
      this.dispatchEvent(
        createLoquixEvent<LoquixTemplateSelectDetail>('loquix-template-select', detail),
      );
      this.hide();
    }
  };

  private _handleDialogClick = (e: MouseEvent): void => {
    if (!this.closeOnOutsideClick) return;
    // Native <dialog> backdrop click: the click target is the dialog itself,
    // not any child element. Check if click landed on the dialog padding (backdrop).
    const dialog = this._dialog;
    if (e.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (
      e.clientX < rect.left ||
      e.clientX > rect.right ||
      e.clientY < rect.top ||
      e.clientY > rect.bottom
    ) {
      this.hide();
    }
  };

  private _handleDialogClose = (): void => {
    if (this.open) {
      this.hide();
    }
  };

  protected render() {
    const categories = this._getCategories();
    const filtered = this._getFilteredTemplates();

    return html`
      <dialog
        part="dialog"
        @close=${this._handleDialogClose}
        @click=${this._handleDialogClick}
        @loquix-template-select=${this._handleTemplateSelect}
      >
        <div class="header">
          <h2 class="heading">${this.heading ?? this._localize.term('templatePicker.heading')}</h2>
          <button
            class="close-btn"
            aria-label=${this._localize.term('templatePicker.closeLabel')}
            @click=${() => this.hide()}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M18 6 6 18"></path>
              <path d="m6 6 12 12"></path>
            </svg>
          </button>
        </div>

        ${this.searchable || categories.length > 1
          ? html`
              <div class="controls">
                ${this.searchable
                  ? html`
                      <input
                        class="search-input"
                        part="search"
                        type="search"
                        placeholder=${this._localize.term('templatePicker.searchPlaceholder')}
                        aria-label=${this._localize.term('templatePicker.searchLabel')}
                        .value=${this._search}
                        @input=${this._handleSearch}
                      />
                    `
                  : nothing}
                ${categories.length > 1
                  ? html`
                      <div class="categories" role="tablist">
                        ${categories.map(
                          cat => html`
                            <button
                              class="category-btn ${this._activeCategory === cat
                                ? 'category-btn--active'
                                : ''}"
                              role="tab"
                              aria-selected=${this._activeCategory === cat}
                              @click=${() => this._handleCategoryClick(cat)}
                            >
                              ${cat}
                            </button>
                          `,
                        )}
                      </div>
                    `
                  : nothing}
              </div>
            `
          : nothing}

        <div class="body">
          ${filtered.length > 0
            ? html`
                <div class="grid">
                  ${filtered.map(
                    t => html`<loquix-template-card .template=${t}></loquix-template-card>`,
                  )}
                </div>
              `
            : html`<div class="empty">${this._localize.term('templatePicker.emptyText')}</div>`}
        </div>
      </dialog>
    `;
  }
}
