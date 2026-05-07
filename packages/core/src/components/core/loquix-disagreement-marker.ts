import { LitElement, html, nothing, svg } from 'lit';
import { property } from 'lit/decorators.js';
import type { DisagreementVariant } from '../../types/index.js';
import { LocalizeController } from '../../i18n/index.js';
import { createLoquixEvent } from '../../events/index.js';
import styles from './loquix-disagreement-marker.styles.js';

const inlineIconSvg = svg`
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 9v4M12 17h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
  </svg>
`;

const bannerIconSvg = svg`
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 9v4M12 17h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
    <path
      d="M10.3 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"
      stroke="currentColor"
      stroke-width="2"
      stroke-linejoin="round"
    />
  </svg>
`;

/**
 * @tag loquix-disagreement-marker
 * @summary Marks an assistant message that the user has disagreed with.
 *
 * Two variants: an inline pill (for trailing references in prose) and a banner
 * attached to the disputed message. The banner can optionally show a "Mark
 * resolved" button when `resolvable` is set.
 *
 * @slot - Banner-only: extra content under the title and reason.
 *
 * @csspart marker - The wrapper element (pill for inline, container for banner).
 * @csspart icon - The leading icon.
 * @csspart body - Banner body (title + reason + slotted content).
 * @csspart title - Banner title.
 * @csspart reason - Banner reason text.
 * @csspart resolve - The "Mark resolved" button (banner only).
 *
 * @fires loquix-disagreement-resolve - When the resolve button is clicked.
 *
 * @cssprop [--loquix-conf-low-bg] - Background colour (shared with low-confidence palette).
 * @cssprop [--loquix-conf-low-color] - Foreground colour.
 * @cssprop [--loquix-conf-low-fill] - Border accent colour.
 */
export class LoquixDisagreementMarker extends LitElement {
  static override styles = [styles];

  private _localize = new LocalizeController(this);

  /** Visual variant. */
  @property({ type: String, reflect: true })
  variant: DisagreementVariant = 'inline';

  /** Optional reason text shown beneath the title (banner) or after the label (inline). */
  @property({ type: String })
  reason?: string;

  /** Banner-only: whether to show the "Mark resolved" button. */
  @property({ type: Boolean, reflect: true })
  resolvable = false;

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  private _onResolve = (): void => {
    this.dispatchEvent(createLoquixEvent('loquix-disagreement-resolve', {}));
  };

  protected override render() {
    if (this.variant === 'banner') {
      return html`
        <div part="marker" class="banner" role="status">
          <span part="icon" class="banner__icon">${bannerIconSvg}</span>
          <div part="body" class="banner__body">
            <div part="title" class="banner__title">
              ${this._localize.term('disagreementMarker.title')}
            </div>
            ${this.reason
              ? html`<div part="reason" class="banner__reason">${this.reason}</div>`
              : nothing}
            <slot></slot>
          </div>
          ${this.resolvable
            ? html`<button
                part="resolve"
                type="button"
                class="banner__resolve"
                @click=${this._onResolve}
              >
                ${this._localize.term('disagreementMarker.markResolvedLabel')}
              </button>`
            : nothing}
        </div>
      `;
    }

    // inline (default)
    const label = this._localize.term('disagreementMarker.inlineLabel');
    return html`
      <span part="marker" class="pill" role="status">
        <span part="icon">${inlineIconSvg}</span>
        <span>${label}${this.reason ? html`: ${this.reason}` : nothing}</span>
      </span>
    `;
  }
}
