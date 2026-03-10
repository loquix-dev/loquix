import { LitElement, html, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import type { NudgeVariant } from '../../types/index.js';
import { createLoquixEvent } from '../../events/index.js';
import type { LoquixNudgeDismissDetail, LoquixNudgeActionDetail } from '../../events/index.js';
import { LocalizeController } from '../../i18n/index.js';
import styles from './loquix-nudge-banner.styles.js';

/**
 * @tag loquix-nudge-banner
 * @summary Contextual tip/info banner with optional dismiss and action buttons.
 *
 * @slot - Banner content text.
 * @slot icon - Custom icon (overrides `icon` property).
 * @slot action - Custom action button (overrides `actionLabel` property).
 *
 * @csspart banner - The banner container.
 * @csspart dismiss - The dismiss button.
 * @csspart action-button - The action CTA button.
 *
 * @fires {CustomEvent<LoquixNudgeDismissDetail>} loquix-nudge-dismiss - When dismissed.
 * @fires {CustomEvent<LoquixNudgeActionDetail>} loquix-nudge-action - When action CTA is clicked.
 *
 * @cssprop [--loquix-nudge-bg] - Background color.
 * @cssprop [--loquix-nudge-color] - Text color.
 * @cssprop [--loquix-nudge-border-color] - Border color.
 * @cssprop [--loquix-nudge-border-radius] - Border radius.
 * @cssprop [--loquix-nudge-padding] - Padding.
 * @cssprop [--loquix-nudge-gap] - Gap between elements.
 * @cssprop [--loquix-nudge-font-size] - Font size.
 */
export class LoquixNudgeBanner extends LitElement {
  static styles = [styles];

  private _localize = new LocalizeController(this);

  /** Unique ID for this nudge. */
  @property({ attribute: 'nudge-id' })
  nudgeId = '';

  /** Visual variant. */
  @property({ reflect: true })
  variant: NudgeVariant = 'tip';

  /** Whether the banner can be dismissed. */
  @property({ type: Boolean })
  dismissible = true;

  /** Label for the action CTA button. Empty = no button. */
  @property({ attribute: 'action-label' })
  actionLabel = '';

  /** Emoji or text icon. */
  @property()
  icon = '';

  private _handleDismiss(): void {
    this.dispatchEvent(
      createLoquixEvent<LoquixNudgeDismissDetail>('loquix-nudge-dismiss', {
        nudgeId: this.nudgeId,
      }),
    );
    this.hidden = true;
  }

  private _handleAction(): void {
    this.dispatchEvent(
      createLoquixEvent<LoquixNudgeActionDetail>('loquix-nudge-action', {
        nudgeId: this.nudgeId,
        action: this.actionLabel,
      }),
    );
  }

  protected render() {
    return html`
      <div class="banner" part="banner" role="status">
        ${this.icon
          ? html`<span class="icon"><slot name="icon">${this.icon}</slot></span>`
          : html`<slot name="icon"></slot>`}
        <div class="content">
          <slot></slot>
        </div>
        <slot name="action">
          ${this.actionLabel
            ? html`
                <button class="action-btn" part="action-button" @click=${this._handleAction}>
                  ${this.actionLabel}
                </button>
              `
            : nothing}
        </slot>
        ${this.dismissible
          ? html`
              <button
                class="dismiss-btn"
                part="dismiss"
                aria-label=${this._localize.term('nudgeBanner.dismissLabel')}
                @click=${this._handleDismiss}
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
            `
          : nothing}
      </div>
    `;
  }
}
