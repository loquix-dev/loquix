import { LitElement, html, nothing, type PropertyValues } from 'lit';
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

const isValidSentiment = (v: unknown): v is FeedbackSentiment =>
  v === 'positive' || v === 'negative';

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

  /**
   * Returns the current value if it's a valid `FeedbackSentiment`, else `null`.
   * Guards against `value` being set from an attribute or external mutation
   * to something outside the type union.
   */
  private _validValue(): FeedbackSentiment | null {
    return isValidSentiment(this.value) ? this.value : null;
  }

  /**
   * When `value` changes — by user click, external prop assignment, or attribute
   * change — reset the draft state. This keeps controlled usage clean: a parent
   * that sets `value=null` after the user submits will see the thanks state
   * cleared automatically; flipping sentiment externally doesn't carry stale
   * chip / comment selections from the previous sentiment's chip set.
   *
   * Done in `willUpdate` (not `updated`) to fold the resets into the same
   * render cycle — avoids a second update being scheduled from within
   * `updated`.
   */
  protected override willUpdate(changed: PropertyValues): void {
    if (changed.has('value')) {
      this._reason = null;
      this._comment = '';
      this._submitted = false;
    }
  }

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
    // Setting `value` triggers `updated()` which clears _reason / _comment / _submitted.
    this.value = target.active ? e.detail.sentiment : null;
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
    const v = this._validValue();
    if (!v) return true;
    if (this.requireCommentOnDown && v === 'negative' && this._comment.trim().length === 0) {
      return true;
    }
    return false;
  }

  private _onSend = (): void => {
    const v = this._validValue();
    if (this._isSendDisabled() || !v) return;
    const detail: {
      sentiment: FeedbackSentiment;
      reason?: FeedbackReason;
      comment?: string;
    } = { sentiment: v };
    if (this._reason) detail.reason = this._reason;
    const trimmed = this._comment.trim();
    if (trimmed.length > 0) detail.comment = trimmed;
    this.dispatchEvent(createLoquixEvent('loquix-feedback-submit', detail));
    this._submitted = true;
  };

  private _onCancel = (): void => {
    // Setting `value=null` triggers `updated()` which clears the draft state.
    this.value = null;
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  protected override render() {
    const groupLabel = this._localize.term('feedbackForm.groupLabel');
    const reasonsLabel = this._localize.term('feedbackForm.reasonsGroupLabel');
    const sendLabel = this._localize.term('feedbackForm.sendLabel');
    const cancelLabel = this._localize.term('feedbackForm.cancelLabel');
    const v = this._validValue();
    const placeholder =
      v === 'negative'
        ? this._localize.term('feedbackForm.placeholderDown')
        : this._localize.term('feedbackForm.placeholderUp');

    const reasons = v === 'negative' ? NEG_REASONS : POS_REASONS;
    const showForm = this.allowReason && v !== null && !this._submitted;

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
          ?active=${v === 'positive'}
        ></loquix-action-feedback>
        <loquix-action-feedback
          sentiment="negative"
          ?active=${v === 'negative'}
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
