import { LitElement, html } from 'lit';
import { property, state, query } from 'lit/decorators.js';
import { createLoquixEvent } from '../../events/index.js';
import { LocalizeController } from '../../i18n/index.js';
import styles from './loquix-action-edit.styles.js';

/**
 * @tag loquix-action-edit
 * @summary Action button for editing user messages. Supports inline and composer modes.
 *
 * In **inline** mode, clicking the trigger replaces the message content with an
 * editable textarea plus Save & Cancel buttons.
 *
 * In **composer** mode, clicking the trigger dispatches `loquix-edit-start` so the
 * host application (or `<loquix-chat-container>`) can transfer the text to the main
 * composer input. The component shows an "Editing…" badge until editing completes.
 *
 * @csspart trigger - The pencil-icon trigger button.
 * @csspart textarea - The `<textarea>` in inline mode.
 * @csspart actions - Container for Submit / Cancel buttons.
 * @csspart submit-button - The "Save & Submit" button.
 * @csspart cancel-button - The "Cancel" button.
 * @csspart editing-badge - The "Editing…" badge in composer mode.
 *
 * @slot icon - Custom trigger icon (replaces default pencil).
 * @slot editor-footer - Content between textarea and buttons (e.g. warning text, branch info).
 * @slot editing-indicator - Custom editing indicator (replaces default badge in composer mode).
 *
 * @fires loquix-edit-start  - When editing begins. Detail: `{ messageId, content }`.
 * @fires loquix-edit-submit - When the user confirms the edit. Detail: `{ messageId, oldContent, newContent }`.
 * @fires loquix-edit-cancel - When the user cancels the edit. Detail: `{ messageId }`.
 *
 * @cssprop [--loquix-edit-icon-size]            - Trigger icon size.
 * @cssprop [--loquix-edit-icon-color]           - Trigger icon colour.
 * @cssprop [--loquix-edit-icon-color-hover]     - Trigger icon hover colour.
 * @cssprop [--loquix-edit-highlight-color]      - Badge / bubble highlight colour.
 * @cssprop [--loquix-edit-border-color]         - Textarea border colour.
 * @cssprop [--loquix-edit-textarea-bg]          - Textarea background.
 * @cssprop [--loquix-edit-textarea-min-height]  - Textarea minimum height.
 * @cssprop [--loquix-edit-textarea-max-height]  - Textarea maximum height.
 * @cssprop [--loquix-edit-button-gap]           - Gap between Submit/Cancel.
 */
export class LoquixActionEdit extends LitElement {
  static styles = [styles];

  private _localize = new LocalizeController(this);

  /** Editing mode: `inline` (textarea in bubble) or `composer` (text to main input). */
  @property({ reflect: true })
  mode: 'inline' | 'composer' = 'inline';

  /** Message identifier. */
  @property({ attribute: 'message-id' })
  messageId = '';

  /** Current message text. Passed as a JS property (not attribute). */
  @property()
  content = '';

  /** Whether the component is currently in editing state. */
  @property({ type: Boolean, reflect: true })
  editing = false;

  /** Disables the trigger button. */
  @property({ type: Boolean, reflect: true })
  disabled = false;

  /** Label for the submit button (inline mode). */
  @property({ attribute: 'submit-label' })
  submitLabel?: string;

  /** Label for the cancel button. */
  @property({ attribute: 'cancel-label' })
  cancelLabel?: string;

  /** Placeholder text for the textarea. */
  @property()
  placeholder = '';

  // ---------------------------------------------------------------------------
  // Internal state
  // ---------------------------------------------------------------------------

  @state() private _editText = '';
  private _originalContent = '';

  @query('.textarea')
  private _textareaEl!: HTMLTextAreaElement;

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  /** Programmatically enter editing mode. */
  startEditing(): void {
    if (this.editing) return;
    this._originalContent = this.content;
    this._editText = this.content;
    this.editing = true;

    this.dispatchEvent(
      createLoquixEvent('loquix-edit-start', {
        messageId: this.messageId,
        content: this.content,
      }),
    );

    if (this.mode === 'inline') {
      this.updateComplete.then(() => this._focusTextarea());
    }
  }

  /** Programmatically cancel editing. */
  cancelEditing(): void {
    if (!this.editing) return;
    this.editing = false;
    this._editText = '';

    this.dispatchEvent(
      createLoquixEvent('loquix-edit-cancel', {
        messageId: this.messageId,
      }),
    );
  }

  /** Programmatically complete editing with new content (used by composer mode). */
  completeEdit(newContent: string): void {
    const oldContent = this._originalContent;
    this.editing = false;
    this._editText = '';

    this.dispatchEvent(
      createLoquixEvent('loquix-edit-submit', {
        messageId: this.messageId,
        oldContent,
        newContent,
      }),
    );
  }

  // ---------------------------------------------------------------------------
  // Private handlers
  // ---------------------------------------------------------------------------

  private _handleTriggerClick(): void {
    this.startEditing();
  }

  private _handleSubmit(): void {
    if (!this._canSubmit) return;
    this.completeEdit(this._editText);
  }

  private _handleCancel(): void {
    this.cancelEditing();
  }

  private _handleInput(e: Event): void {
    const textarea = e.target as HTMLTextAreaElement;
    this._editText = textarea.value;
    this._autoResize(textarea);
  }

  private _handleKeydown(e: KeyboardEvent): void {
    if (e.key === 'Escape') {
      e.preventDefault();
      this._handleCancel();
      return;
    }

    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      this._handleSubmit();
    }
  }

  private _autoResize(textarea: HTMLTextAreaElement): void {
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }

  private _focusTextarea(): void {
    const el = this._textareaEl;
    if (!el) return;
    el.focus();
    // Place cursor at end
    el.selectionStart = el.selectionEnd = el.value.length;
    this._autoResize(el);
  }

  private get _canSubmit(): boolean {
    const text = this._editText.trim();
    return text.length > 0 && text !== this._originalContent.trim();
  }

  // ---------------------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------------------

  override updated(changed: Map<string, unknown>): void {
    // When editing is set externally (e.g. by message-item), snapshot content
    if (changed.has('editing') && this.editing && !this._originalContent) {
      this._originalContent = this.content;
      this._editText = this.content;
      if (this.mode === 'inline') {
        this.updateComplete.then(() => this._focusTextarea());
      }
    }

    // Reset when editing turns off
    if (changed.has('editing') && !this.editing) {
      this._originalContent = '';
    }
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  private _renderTrigger() {
    return html`
      <button
        part="trigger"
        class="trigger"
        aria-label=${this._localize.term('actionEdit.triggerLabel')}
        ?disabled=${this.disabled}
        @click=${this._handleTriggerClick}
      >
        <slot name="icon">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
            <path d="m15 5 4 4"></path>
          </svg>
        </slot>
      </button>
    `;
  }

  private _renderInlineEditor() {
    return html`
      <div class="editor">
        <textarea
          part="textarea"
          class="textarea"
          aria-label=${this._localize.term('actionEdit.textareaLabel')}
          .value=${this._editText}
          placeholder=${this.placeholder}
          @input=${this._handleInput}
          @keydown=${this._handleKeydown}
        ></textarea>
        <slot name="editor-footer"></slot>
        <div part="actions" class="editor-actions">
          <button part="cancel-button" class="cancel-btn" @click=${this._handleCancel}>
            ${this.cancelLabel ?? this._localize.term('actionEdit.cancelLabel')}
          </button>
          <button
            part="submit-button"
            class="submit-btn"
            ?disabled=${!this._canSubmit}
            @click=${this._handleSubmit}
          >
            ${this.submitLabel ?? this._localize.term('actionEdit.submitLabel')}
          </button>
        </div>
      </div>
    `;
  }

  private _renderComposerBadge() {
    return html`
      <slot name="editing-indicator">
        <span part="editing-badge" class="editing-badge">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
            <path d="m15 5 4 4"></path>
          </svg>
          ${this._localize.term('actionEdit.editingBadge')}
        </span>
      </slot>
    `;
  }

  protected render() {
    if (!this.editing) {
      return this._renderTrigger();
    }

    if (this.mode === 'inline') {
      return this._renderInlineEditor();
    }

    return this._renderComposerBadge();
  }
}
