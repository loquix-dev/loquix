import { LitElement, html, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import type { CaveatVariant } from '../../types/index.js';
import { LocalizeController } from '../../i18n/index.js';
import styles from './loquix-caveat-notice.styles.js';

/**
 * @tag loquix-caveat-notice
 * @summary Informational notice about AI limitations shown to the user.
 *
 * @csspart notice - The notice container element.
 *
 * @cssprop [--loquix-caveat-text-color] - Text colour.
 * @cssprop [--loquix-caveat-bg] - Background for inline / contextual variants.
 * @cssprop [--loquix-caveat-font-size] - Font size (default 0.6875rem).
 * @cssprop [--loquix-caveat-padding] - Inner padding.
 */
export class LoquixCaveatNotice extends LitElement {
  static styles = [styles];

  private _localize = new LocalizeController(this);

  /** Caveat message text. */
  @property({ type: String })
  message?: string;

  /** Display variant. */
  @property({ type: String, reflect: true })
  variant: CaveatVariant = 'footer';

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  private _renderWarningIcon() {
    return html`
      <span class="icon" aria-hidden="true">
        <svg viewBox="0 0 24 24">
          <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
        </svg>
      </span>
    `;
  }

  protected render() {
    const showIcon = this.variant === 'contextual';

    return html`
      <div
        part="notice"
        class="notice"
        role="note"
        aria-label="${this.message ?? this._localize.term('caveatNotice.message')}"
      >
        ${showIcon ? this._renderWarningIcon() : nothing}
        <span>${this.message ?? this._localize.term('caveatNotice.message')}</span>
      </div>
    `;
  }
}
