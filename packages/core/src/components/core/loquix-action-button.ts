import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import { createLoquixEvent } from '../../events/index.js';
import styles from './loquix-action-button.styles.js';

/**
 * @tag loquix-action-button
 * @summary Generic action button for chat message toolbars.
 *
 * @csspart button - The `<button>` element.
 *
 * @slot - Icon SVG or any content to render inside the button.
 *
 * @fires {CustomEvent} * - Fires a custom event whose name equals the `action` property.
 *
 * @cssprop [--loquix-action-size] - Width/height of the button.
 * @cssprop [--loquix-action-bg] - Default background.
 * @cssprop [--loquix-action-hover-bg] - Hover background.
 * @cssprop [--loquix-action-color] - Default icon colour.
 * @cssprop [--loquix-action-hover-color] - Hover icon colour.
 */
export class LoquixActionButton extends LitElement {
  static styles = [styles];

  /** Event name dispatched on click (e.g. `loquix-regenerate`). */
  @property()
  action = '';

  /** Accessible label for the button. */
  @property()
  label = '';

  /** Disables the button. */
  @property({ type: Boolean, reflect: true })
  disabled = false;

  protected _handleClick(): void {
    if (!this.action) return;
    this.dispatchEvent(createLoquixEvent(this.action, {}));
  }

  protected render() {
    return html`
      <button
        part="button"
        class="action"
        aria-label=${this.label}
        ?disabled=${this.disabled}
        @click=${this._handleClick}
      >
        <slot></slot>
      </button>
    `;
  }
}
