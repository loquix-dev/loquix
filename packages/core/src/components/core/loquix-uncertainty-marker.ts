import { LitElement, html, nothing, svg } from 'lit';
import { property, state } from 'lit/decorators.js';
import type { UncertaintyKind, UncertaintyVariant } from '../../types/index.js';
import { LocalizeController } from '../../i18n/index.js';
import type { LoquixTranslations } from '../../i18n/index.js';
import { createLoquixEvent } from '../../events/index.js';
import styles from './loquix-uncertainty-marker.styles.js';

const TIP_KEYS: Record<UncertaintyKind, keyof LoquixTranslations> = {
  unsure: 'uncertaintyMarker.tipUnsure',
  'needs-verification': 'uncertaintyMarker.tipNeedsVerification',
  speculative: 'uncertaintyMarker.tipSpeculative',
};

const TOOLTIP_ID = 'lq-uncert-tip';

const warningSvg = svg`
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
    <path d="M12 8v5M12 16.5h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
  </svg>
`;

/**
 * @tag loquix-uncertainty-marker
 * @summary Wraps an inline phrase to flag it as unsure, needing verification, or speculative.
 *
 * The slotted text remains the control's accessible name; the kind/reason is exposed via
 * `aria-describedby` so screen readers announce the uncertainty as a description rather
 * than overriding the phrase. Tooltip opens on hover or focus and closes on
 * mouseleave/blur/Escape.
 *
 * @slot - The inline text to mark.
 *
 * @csspart marker - The marker wrapper.
 * @csspart text - The slotted-text container.
 * @csspart icon - The trailing icon (icon variant only).
 * @csspart tooltip - The tooltip element.
 *
 * @fires loquix-uncertainty-click - When the marker is activated by click, Enter, or Space.
 *   Detail: `{ kind, reason? }`.
 *
 * @cssprop [--loquix-uncert-unsure-color] - Foreground for `unsure` kind.
 * @cssprop [--loquix-uncert-unsure-bg] - Highlight background for `unsure` kind.
 * @cssprop [--loquix-uncert-verify-color] - Foreground for `needs-verification` kind.
 * @cssprop [--loquix-uncert-verify-bg] - Highlight background for `needs-verification` kind.
 * @cssprop [--loquix-uncert-spec-color] - Foreground for `speculative` kind.
 * @cssprop [--loquix-uncert-spec-bg] - Highlight background for `speculative` kind.
 */
export class LoquixUncertaintyMarker extends LitElement {
  static override styles = [styles];

  private _localize = new LocalizeController(this);

  /** What kind of uncertainty applies to the wrapped phrase. */
  @property({ type: String, reflect: true })
  kind: UncertaintyKind = 'unsure';

  /** How the phrase is visually marked. */
  @property({ type: String, reflect: true })
  variant: UncertaintyVariant = 'underline';

  /** Optional explicit reason text. Overrides the localised default for the kind. */
  @property({ type: String })
  reason?: string;

  @state()
  private _open = false;

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  private _tipText(): string {
    if (this.reason && this.reason.length > 0) return this.reason;
    return this._localize.term(TIP_KEYS[this.kind] ?? TIP_KEYS.unsure);
  }

  private _show = (): void => {
    this._open = true;
  };

  private _hide = (): void => {
    this._open = false;
  };

  private _activate(): void {
    this.dispatchEvent(
      createLoquixEvent('loquix-uncertainty-click', {
        kind: this.kind,
        ...(this.reason ? { reason: this.reason } : {}),
      }),
    );
  }

  private _onKeyDown = (e: KeyboardEvent): void => {
    if (e.key === 'Enter') {
      e.preventDefault();
      this._activate();
    } else if (e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      this._activate();
    } else if (e.key === 'Escape') {
      this._hide();
    }
  };

  private _onClick = (): void => {
    this._activate();
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  protected override render() {
    const tip = this._tipText();

    // Tooltip is rendered as a SIBLING of role="button", not a descendant —
    // this keeps the slotted text as the button's accessible name and exposes
    // the tooltip text purely via aria-describedby (description), not via
    // the descendants-name-from-content algorithm.
    return html`
      <span class="wrapper">
        <span
          part="marker"
          class="marker marker--${this.variant} marker--${this.kind}"
          tabindex="0"
          role="button"
          aria-describedby=${TOOLTIP_ID}
          @mouseenter=${this._show}
          @mouseleave=${this._hide}
          @focus=${this._show}
          @blur=${this._hide}
          @keydown=${this._onKeyDown}
          @click=${this._onClick}
        >
          <span part="text" class="text"><slot></slot></span>
          ${this.variant === 'icon'
            ? html`<span part="icon" class="icon" aria-hidden="true">${warningSvg}</span>`
            : nothing}
        </span>
        <span
          part="tooltip"
          id=${TOOLTIP_ID}
          class="tooltip ${this._open ? 'is-open' : ''}"
          role="tooltip"
          >${tip}</span
        >
      </span>
    `;
  }
}
