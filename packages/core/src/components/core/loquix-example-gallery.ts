import { LitElement, html, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import type { GalleryItem, GalleryVariant } from '../../types/index.js';
import { createLoquixEvent } from '../../events/index.js';
import type { LoquixGallerySelectDetail } from '../../events/index.js';
import styles from './loquix-example-gallery.styles.js';

/**
 * @tag loquix-example-gallery
 * @summary Categorized grid/list of example prompts.
 *
 * @csspart item - Individual gallery item button.
 *
 * @fires {CustomEvent<LoquixGallerySelectDetail>} loquix-gallery-select - When an item is clicked.
 *
 * @cssprop [--loquix-gallery-gap] - Gap between items.
 * @cssprop [--loquix-gallery-columns] - Number of grid columns (grid variant).
 * @cssprop [--loquix-gallery-heading-font-size] - Heading font size.
 * @cssprop [--loquix-gallery-item-padding] - Item padding.
 * @cssprop [--loquix-gallery-item-border-color] - Item border color.
 * @cssprop [--loquix-gallery-item-border-radius] - Item border radius.
 * @cssprop [--loquix-gallery-item-bg] - Item background.
 */
export class LoquixExampleGallery extends LitElement {
  static styles = [styles];

  /** Gallery items to display. */
  @property({ type: Array })
  items: GalleryItem[] = [];

  /** Display variant. */
  @property({ reflect: true })
  variant: GalleryVariant = 'grid';

  /** Number of grid columns (CSS custom property). */
  @property({ type: Number })
  columns = 3;

  /** Explicit category order. If omitted, derived from items. */
  @property({ type: Array })
  categories: string[] = [];

  /** Optional heading above the gallery. */
  @property()
  heading = '';

  @state()
  private _activeCategory = '';

  private _getCategories(): string[] {
    if (this.categories.length > 0) return this.categories;
    const cats = new Set<string>();
    for (const item of this.items) {
      if (item.category) cats.add(item.category);
    }
    return Array.from(cats);
  }

  private _getFilteredItems(): GalleryItem[] {
    if (!this._activeCategory) return this.items;
    return this.items.filter(i => i.category === this._activeCategory);
  }

  private _handleItemClick(item: GalleryItem): void {
    this.dispatchEvent(
      createLoquixEvent<LoquixGallerySelectDetail>('loquix-gallery-select', { item }),
    );
  }

  private _handleCategoryClick(cat: string): void {
    this._activeCategory = this._activeCategory === cat ? '' : cat;
  }

  protected render() {
    const categories = this._getCategories();
    const filtered = this._getFilteredItems();

    return html`
      ${this.heading ? html`<h3 class="heading">${this.heading}</h3>` : nothing}
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

      <div
        class="gallery--${this.variant}"
        style=${this.variant === 'grid' ? `--loquix-gallery-columns: ${this.columns}` : ''}
      >
        ${filtered.map(
          item => html`
            <button class="item" part="item" @click=${() => this._handleItemClick(item)}>
              <div class="item__header">
                ${item.icon ? html`<span class="item__icon">${item.icon}</span>` : nothing}
                <span class="item__title">${item.title}</span>
              </div>
              ${item.description
                ? html`<div class="item__description">${item.description}</div>`
                : nothing}
            </button>
          `,
        )}
      </div>
    `;
  }
}
