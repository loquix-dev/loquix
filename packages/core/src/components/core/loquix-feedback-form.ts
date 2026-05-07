import { LitElement, html, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import type { FeedbackReason, FeedbackSentiment } from '../../types/index.js';
import { LocalizeController } from '../../i18n/index.js';
import type { LoquixTranslations } from '../../i18n/index.js';
import { createLoquixEvent, type LoquixFeedbackDetail } from '../../events/index.js';
import './define-action-feedback.js';
import type { LoquixActionFeedback } from './loquix-action-feedback.js';
import styles from './loquix-feedback-form.styles.js';

const POS_REASONS: readonly FeedbackReason[] = ['accurate', 'well-written', 'helpful', 'other'];
const NEG_REASONS: readonly FeedbackReason[] = ['inaccurate', 'off-topic', 'unsafe', 'other'];

const REASON_KEYS: Record<FeedbackReason, keyof LoquixTranslations> = {
  accurate: 'feedbackForm.reasonAccurate',
  'well-written': 'feedbackForm.reasonWellWritten',
  helpful: 'feedbackForm.reasonHelpful',
  inaccurate: 'feedbackForm.reasonInaccurate',
  'off-topic': 'feedbackForm.reasonOffTopic',
  unsafe: 'feedbackForm.reasonUnsafe',
  other: 'feedbackForm.reasonOther',
};

/**
 * @tag loquix-feedback-form
 * @summary Higher-order feedback flow: thumbs up/down + reason chips + optional comment.
 *
 * Composes two `loquix-action-feedback` buttons into a single flow, then opens a
 * reasons + comment card once a sentiment is picked. The inner `loquix-feedback`
 * events are intercepted (stopPropagation) so consumers only ever see the
 * higher-level `loquix-feedback-submit`.
 *
 * The reason payload carries a stable `FeedbackReason` ID, never the localised
 * chip label.
 *
 * @csspart buttons - The thumbs row.
 * @csspart form - The reasons + comment card shown after a sentiment is picked.
 * @csspart reasons - The radiogroup of reason chips.
 * @csspart chip - A single reason chip.
 * @csspart textarea - The comment textarea.
 * @csspart submit - Submit button.
 * @csspart cancel - Cancel button.
 * @csspart thanks - Thanks message shown after submit.
 *
 * @fires loquix-feedback-submit - When the user clicks Send.
 *   Detail: `{ sentiment, reason?, comment? }`.
 *
 * @cssprop [--loquix-ai-color] - Active chip background and primary button colour.
 */
export class LoquixFeedbackForm extends LitElement {
  static override styles = [styles];

  private _localize = new LocalizeController(this);

  /** Whether to open the reasons + comment card after a sentiment is picked. */
  @property({ type: Boolean, attribute: 'allow-reason' })
  allowReason = true;

  /** Currently selected sentiment, or null if neither is picked. */
  @property({ type: String, reflect: true })
  value: FeedbackSentiment | null = null;

  /** When true, requires a non-empty comment before Send is enabled on negative feedback. */
  @property({ type: Boolean, attribute: 'require-comment-on-down' })
  requireCommentOnDown = false;

  @state()
  private _reason: FeedbackReason | null = null;

  @state()
  private _comment = '';

  @state()
  private _submitted = false;

  // ---------------------------------------------------------------------------
  // Composition with loquix-action-feedback
  // ---------------------------------------------------------------------------

  /**
   * Intercepts the inner `loquix-feedback` and reads the post-toggle `.active`
   * state from the child to update parent state. Stops propagation so the
   * inner event never escapes the form — only `loquix-feedback-submit` is the
   * public surface.
   */
  private _onChildFeedback = (e: CustomEvent<LoquixFeedbackDetail>): void => {
    e.stopPropagation();
    const target = e.target as LoquixActionFeedback | null;
    if (!target) return;
    if (target.active) {
      this.value = e.detail.sentiment;
    } else {
      this.value = null;
    }
    this._reason = null;
    this._comment = '';
    this._submitted = false;
  };

  // ---------------------------------------------------------------------------
  // Form
  // ---------------------------------------------------------------------------

  private _onChipClick(reason: FeedbackReason): void {
    this._reason = this._reason === reason ? null : reason;
  }

  private _onCommentInput = (e: Event): void => {
    this._comment = (e.target as HTMLTextAreaElement).value;
  };

  private _isSendDisabled(): boolean {
    if (!this.value) return true;
    if (
      this.requireCommentOnDown &&
      this.value === 'negative' &&
      this._comment.trim().length === 0
    ) {
      return true;
    }
    return false;
  }

  private _onSend = (): void => {
    if (this._isSendDisabled() || !this.value) return;
    const detail: {
      sentiment: FeedbackSentiment;
      reason?: FeedbackReason;
      comment?: string;
    } = { sentiment: this.value };
    if (this._reason) detail.reason = this._reason;
    const trimmed = this._comment.trim();
    if (trimmed.length > 0) detail.comment = trimmed;
    this.dispatchEvent(createLoquixEvent('loquix-feedback-submit', detail));
    this._submitted = true;
  };

  private _onCancel = (): void => {
    this.value = null;
    this._reason = null;
    this._comment = '';
    this._submitted = false;
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  protected override render() {
    const groupLabel = this._localize.term('feedbackForm.groupLabel');
    const reasonsLabel = this._localize.term('feedbackForm.reasonsGroupLabel');
    const sendLabel = this._localize.term('feedbackForm.sendLabel');
    const cancelLabel = this._localize.term('feedbackForm.cancelLabel');
    const placeholder =
      this.value === 'negative'
        ? this._localize.term('feedbackForm.placeholderDown')
        : this._localize.term('feedbackForm.placeholderUp');

    const reasons = this.value === 'negative' ? NEG_REASONS : POS_REASONS;
    const showForm = this.allowReason && this.value !== null && !this._submitted;

    return html`
      <div
        part="buttons"
        class="buttons"
        role="group"
        aria-label=${groupLabel}
        @loquix-feedback=${this._onChildFeedback}
      >
        <loquix-action-feedback
          sentiment="positive"
          ?active=${this.value === 'positive'}
        ></loquix-action-feedback>
        <loquix-action-feedback
          sentiment="negative"
          ?active=${this.value === 'negative'}
        ></loquix-action-feedback>
      </div>

      ${showForm
        ? html`
            <div part="form" class="form">
              <div part="reasons" class="reasons" role="radiogroup" aria-label=${reasonsLabel}>
                ${reasons.map(
                  r => html`
                    <button
                      part="chip"
                      type="button"
                      class="chip"
                      role="radio"
                      aria-checked=${this._reason === r ? 'true' : 'false'}
                      @click=${() => this._onChipClick(r)}
                    >
                      ${this._localize.term(REASON_KEYS[r])}
                    </button>
                  `,
                )}
              </div>
              <textarea
                part="textarea"
                rows="2"
                placeholder=${placeholder}
                .value=${this._comment}
                @input=${this._onCommentInput}
              ></textarea>
              <div class="actions">
                <button part="cancel" type="button" class="btn btn--ghost" @click=${this._onCancel}>
                  ${cancelLabel}
                </button>
                <button
                  part="submit"
                  type="button"
                  class="btn btn--primary"
                  ?disabled=${this._isSendDisabled()}
                  @click=${this._onSend}
                >
                  ${sendLabel}
                </button>
              </div>
            </div>
          `
        : nothing}
      ${this._submitted
        ? html`<div part="thanks" class="thanks">
            ${this._localize.term('feedbackForm.thanksMessage')}
          </div>`
        : nothing}
    `;
  }
}
