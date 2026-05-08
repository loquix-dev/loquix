import { LitElement, html, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { LocalizeController } from '../../i18n/index.js';
import { createLoquixEvent } from '../../events/index.js';
import styles from './loquix-correction-input.styles.js';

let _idCounter = 0;
const nextId = (): number => ++_idCounter;

/**
 * @tag loquix-correction-input
 * @summary Inline form for proposing a correction to an assistant message.
 *
 * Shows the original answer (strikethrough) when provided, plus a textarea for
 * the correction and an optional reason input. Submit is disabled until the
 * correction is non-empty (and reason is non-empty when `reason-required`).
 *
 * All values are rendered as text — no `unsafeHTML` — so user-supplied content
 * cannot inject markup.
 *
 * @csspart container - The outer wrapper.
 * @csspart original - The strikethrough block showing the original text.
 * @csspart field - One labelled field (correction or reason).
 * @csspart textarea - The correction textarea.
 * @csspart input - The reason input.
 * @csspart submit - Submit button.
 * @csspart cancel - Cancel button.
 *
 * @fires loquix-correction-submit - When Submit is clicked.
 *   Detail: `{ correction, reason?, original? }`.
 * @fires loquix-correction-cancel - When Cancel is clicked.
 */
export class LoquixCorrectionInput extends LitElement {
  static override styles = [styles];

  private _localize = new LocalizeController(this);
  private _uid = nextId();

  /** The original assistant text that the user wants to correct. */
  @property({ type: String })
  original = '';

  /** The current correction text. Two-way: updates internally on input. */
  @property({ type: String })
  value = '';

  /** The reason text. Two-way: updates internally on input. */
  @property({ type: String })
  reason = '';

  /** When true, requires a non-empty reason before Submit is enabled. */
  @property({ type: Boolean, attribute: 'reason-required', reflect: true })
  reasonRequired = false;

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  private _onValueInput = (e: Event): void => {
    this.value = (e.target as HTMLTextAreaElement).value;
  };

  private _onReasonInput = (e: Event): void => {
    this.reason = (e.target as HTMLInputElement).value;
  };

  private _isSubmitDisabled(): boolean {
    if (!this.value.trim()) return true;
    if (this.reasonRequired && !this.reason.trim()) return true;
    return false;
  }

  private _onSubmit = (): void => {
    if (this._isSubmitDisabled()) return;
    const detail: { correction: string; reason?: string; original?: string } = {
      correction: this.value,
    };
    if (this.reason.trim()) detail.reason = this.reason;
    if (this.original) detail.original = this.original;
    this.dispatchEvent(createLoquixEvent('loquix-correction-submit', detail));
  };

  private _onCancel = (): void => {
    this.dispatchEvent(createLoquixEvent('loquix-correction-cancel', {}));
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  protected override render() {
    const correctionId = `lq-correction-${this._uid}`;
    const reasonId = `lq-correction-reason-${this._uid}`;

    return html`
      <div part="container" class="container">
        ${this.original
          ? html`
              <div part="field" class="field">
                <span class="lbl">${this._localize.term('correctionInput.originalLabel')}</span>
                <div part="original" class="original">${this.original}</div>
              </div>
            `
          : nothing}

        <div part="field" class="field">
          <label class="lbl" for=${correctionId}>
            ${this._localize.term('correctionInput.correctionLabel')}
          </label>
          <textarea
            part="textarea"
            id=${correctionId}
            rows="3"
            placeholder=${this._localize.term('correctionInput.correctionPlaceholder')}
            .value=${this.value}
            @input=${this._onValueInput}
          ></textarea>
        </div>

        <div part="field" class="field">
          <label class="lbl" for=${reasonId}>
            ${this._localize.term('correctionInput.reasonLabel')}
            ${this.reasonRequired
              ? html`<span class="lbl__req"
                  >${this._localize.term('correctionInput.reasonRequiredMark')}</span
                >`
              : nothing}
          </label>
          <input
            part="input"
            type="text"
            id=${reasonId}
            placeholder=${this._localize.term('correctionInput.reasonPlaceholder')}
            ?required=${this.reasonRequired}
            aria-required=${this.reasonRequired ? 'true' : 'false'}
            .value=${this.reason}
            @input=${this._onReasonInput}
          />
        </div>

        <div class="actions">
          <button part="cancel" type="button" class="btn btn--ghost" @click=${this._onCancel}>
            ${this._localize.term('correctionInput.cancelLabel')}
          </button>
          <button
            part="submit"
            type="button"
            class="btn btn--primary"
            ?disabled=${this._isSubmitDisabled()}
            @click=${this._onSubmit}
          >
            ${this._localize.term('correctionInput.submitLabel')}
          </button>
        </div>
      </div>
    `;
  }
}
