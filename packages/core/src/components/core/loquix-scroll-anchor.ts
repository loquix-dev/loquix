import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import { LocalizeController } from '../../i18n/index.js';
import styles from './loquix-scroll-anchor.styles.js';

/**
 * @tag loquix-scroll-anchor
 * @summary Floating button that appears when user scrolls away from bottom.
 *          Clicking scrolls back to the newest content.
 *
 * @csspart button - The scroll-down button element.
 *
 * @cssprop [--loquix-scroll-anchor-icon] - Custom icon as mask-image URL (e.g. `url('arrow.png')`). Monochrome — inherits button color.
 * @cssprop [--loquix-scroll-anchor-icon-size=18px] - Icon size.
 * @cssprop [--loquix-scroll-anchor-size=36px] - Button size.
 * @cssprop [--loquix-scroll-anchor-bg] - Button background.
 * @cssprop [--loquix-scroll-anchor-color] - Icon colour.
 * @cssprop [--loquix-scroll-anchor-shadow] - Button shadow.
 * @cssprop [--loquix-scroll-anchor-border-radius=50%] - Button border radius.
 * @cssprop [--loquix-scroll-anchor-bottom=16px] - Distance from bottom.
 * @cssprop [--loquix-scroll-anchor-right=16px] - Distance from right.
 */
export class LoquixScrollAnchor extends LitElement {
  static override styles = [styles];

  private _localize = new LocalizeController(this);

  /** Whether the button is visible. Controlled by parent. */
  @property({ type: Boolean, reflect: true })
  visible = false;

  /** Accessible label for the button. */
  @property({ type: String })
  label?: string;

  private _handleClick(): void {
    this.dispatchEvent(
      new CustomEvent('loquix-scroll-anchor-click', {
        bubbles: true,
        composed: true,
      }),
    );
  }

  protected override render() {
    return html`
      <button
        part="button"
        class="anchor-button"
        aria-label=${this.label ?? this._localize.term('scrollAnchor.label')}
        @click=${this._handleClick}
      ></button>
    `;
  }
}
