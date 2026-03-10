import { html } from 'lit';
import { property } from 'lit/decorators.js';
import { LoquixActionButton } from './loquix-action-button.js';
import { LocalizeController } from '../../i18n/index.js';
import baseStyles from './loquix-action-button.styles.js';
import copyStyles from './loquix-action-copy.styles.js';

/**
 * @tag loquix-action-copy
 * @summary Copy action button with clipboard checkmark feedback.
 *
 * Fires `loquix-copy` on click and shows a checkmark icon for 2 seconds.
 *
 * @csspart button - The `<button>` element (inherited).
 *
 * @fires loquix-copy - When the copy button is clicked.
 *
 * @cssprop [--loquix-action-copied-color] - Colour of the checkmark state.
 */
export class LoquixActionCopy extends LoquixActionButton {
  static override styles = [baseStyles, copyStyles];

  private _localize = new LocalizeController(this);

  /** Reflects the copied state to the host for CSS targeting. */
  @property({ type: Boolean, reflect: true })
  copied = false;

  private _copyTimer?: ReturnType<typeof setTimeout>;

  constructor() {
    super();
    this.action = 'loquix-copy';
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    clearTimeout(this._copyTimer);
  }

  protected override _handleClick(): void {
    super._handleClick();
    this.copied = true;
    clearTimeout(this._copyTimer);
    this._copyTimer = setTimeout(() => {
      this.copied = false;
    }, 2000);
  }

  protected override render() {
    return html`
      <button
        part="button"
        class="action"
        aria-label=${this.copied
          ? this._localize.term('actionCopy.copied')
          : this.label || this._localize.term('actionCopy.label')}
        ?disabled=${this.disabled}
        @click=${this._handleClick}
      >
        ${this.copied
          ? html`
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            `
          : html`
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
            `}
      </button>
    `;
  }
}
