import { html } from 'lit';
import { property } from 'lit/decorators.js';
import type { FeedbackSentiment } from '../../types/index.js';
import { createLoquixEvent } from '../../events/index.js';
import { LocalizeController } from '../../i18n/index.js';
import { LoquixActionButton } from './loquix-action-button.js';
import baseStyles from './loquix-action-button.styles.js';
import feedbackStyles from './loquix-action-feedback.styles.js';

/**
 * @tag loquix-action-feedback
 * @summary Feedback action button (thumbs up/down) with toggle state.
 *
 * @csspart button - The `<button>` element (inherited).
 *
 * @fires loquix-feedback - When the button is clicked. Detail: `{ sentiment }`.
 *
 * @cssprop [--loquix-action-active-color] - Colour when `active` is true.
 */
export class LoquixActionFeedback extends LoquixActionButton {
  static override styles = [baseStyles, feedbackStyles];

  private _localize = new LocalizeController(this);

  /** Feedback sentiment: `positive` (thumbs up) or `negative` (thumbs down). */
  @property({ reflect: true })
  sentiment: FeedbackSentiment = 'positive';

  /** Whether the feedback is currently selected/active. */
  @property({ type: Boolean, reflect: true })
  active = false;

  constructor() {
    super();
    this.action = 'loquix-feedback';
  }

  protected override _handleClick(): void {
    this.active = !this.active;

    // Mutual exclusion: deactivate sibling feedback buttons with different sentiment
    if (this.active) {
      const parent = this.parentElement ?? this.getRootNode();
      const siblings = (parent as Element).querySelectorAll?.<LoquixActionFeedback>(
        'loquix-action-feedback',
      );
      siblings?.forEach(el => {
        if (el !== this && el.sentiment !== this.sentiment) {
          el.active = false;
        }
      });
    }

    this.dispatchEvent(createLoquixEvent('loquix-feedback', { sentiment: this.sentiment }));
  }

  protected override render() {
    const label =
      this.sentiment === 'positive'
        ? this._localize.term('actionFeedback.positiveLabel')
        : this._localize.term('actionFeedback.negativeLabel');

    return html`
      <button
        part="button"
        class="action"
        aria-label=${label}
        aria-pressed=${this.active}
        ?disabled=${this.disabled}
        @click=${this._handleClick}
      >
        ${this.sentiment === 'positive'
          ? html`
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"
                ></path>
              </svg>
            `
          : html`
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"
                ></path>
              </svg>
            `}
      </button>
    `;
  }
}
