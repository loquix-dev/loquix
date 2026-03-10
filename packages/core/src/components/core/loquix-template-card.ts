import { LitElement, html, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import type { Template } from '../../types/index.js';
import { createLoquixEvent } from '../../events/index.js';
import type { LoquixTemplateSelectDetail } from '../../events/index.js';
import styles from './loquix-template-card.styles.js';

/**
 * @tag loquix-template-card
 * @summary A single template preview card. Used standalone or inside template-picker.
 *
 * @slot icon - Custom icon for the card.
 * @slot footer - Extra content below the description.
 *
 * @csspart card - The card container button.
 *
 * @fires {CustomEvent<LoquixTemplateSelectDetail>} loquix-template-select - When the card is clicked.
 *
 * @cssprop [--loquix-template-card-padding] - Card padding.
 * @cssprop [--loquix-template-card-border-color] - Border color.
 * @cssprop [--loquix-template-card-border-radius] - Border radius.
 * @cssprop [--loquix-template-card-bg] - Background.
 * @cssprop [--loquix-template-card-hover-border-color] - Hover border color.
 * @cssprop [--loquix-template-card-selected-bg] - Selected background.
 * @cssprop [--loquix-template-card-title-font-size] - Title font size.
 * @cssprop [--loquix-template-card-desc-font-size] - Description font size.
 * @cssprop [--loquix-template-card-desc-color] - Description color.
 */
export class LoquixTemplateCard extends LitElement {
  static styles = [styles];

  /** Template data to display. */
  @property({ type: Object })
  template: Template = { id: '', title: '', prompt: '' };

  /** Whether this card is selected. */
  @property({ type: Boolean, reflect: true })
  selected = false;

  private _handleClick(): void {
    this.dispatchEvent(
      createLoquixEvent<LoquixTemplateSelectDetail>('loquix-template-select', {
        template: this.template,
      }),
    );
  }

  protected render() {
    const { title, description, icon } = this.template;

    return html`
      <button class="card" part="card" @click=${this._handleClick}>
        <div class="header">
          ${icon
            ? html`<span class="icon"><slot name="icon">${icon}</slot></span>`
            : html`<slot name="icon"></slot>`}
          <span class="title">${title}</span>
        </div>
        ${description ? html`<div class="description">${description}</div>` : nothing}
        <div class="footer">
          <slot name="footer"></slot>
        </div>
      </button>
    `;
  }
}
