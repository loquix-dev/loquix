import { LitElement, html } from 'lit';
import { property, state } from 'lit/decorators.js';
import type { ComposerVariant } from '../../types/index.js';
import { createLoquixEvent } from '../../events/index.js';
import type {
  LoquixChangeDetail,
  LoquixSubmitDetail,
  LoquixPasteFilesDetail,
} from '../../events/index.js';
import { LocalizeController } from '../../i18n/index.js';
import styles from './loquix-chat-composer.styles.js';

// Auto-register child components
import './define-prompt-input.js';

/**
 * @tag loquix-chat-composer
 * @summary Composite input area with a prompt input, send button, and optional toolbars.
 *
 * @csspart composer - Outer wrapper.
 * @csspart container - The bordered container (contained variant only).
 * @csspart toolbar - Toolbar areas (top and bottom).
 * @csspart actions-bar - The bottom bar with actions and send button (contained variant).
 * @csspart send-button - The send / submit button.
 *
 * @slot toolbar-top - Content above the input area.
 * @slot input - Override the default prompt input.
 * @slot suggestions - Suggestion chips below the input.
 * @slot toolbar-bottom - Content below the input area.
 * @slot actions-left - Left side of actions bar (contained variant): file upload, model selector, etc.
 * @slot actions-right - Right side of actions bar before send button (contained variant).
 * @slot footer - Footer area at the bottom.
 *
 * @fires loquix-submit - Bubbled from the inner prompt input or send button.
 *
 * @cssprop [--loquix-composer-bg] - Background of the composer area.
 * @cssprop [--loquix-composer-border-color] - Top border colour.
 * @cssprop [--loquix-composer-padding] - Inner padding.
 * @cssprop [--loquix-composer-gap] - Gap between sections.
 * @cssprop [--loquix-composer-container-bg] - Container background (contained variant).
 * @cssprop [--loquix-composer-container-border-color] - Container border colour (contained variant).
 * @cssprop [--loquix-composer-container-border-radius] - Container border radius (contained variant).
 * @cssprop [--loquix-send-button-bg] - Send button background.
 * @cssprop [--loquix-send-button-color] - Send button icon colour.
 */
export class LoquixChatComposer extends LitElement {
  static styles = [styles];

  private _localize = new LocalizeController(this);

  /** Layout variant: 'contained' = Claude/ChatGPT style, 'default' = classic side-by-side. */
  @property({ type: String, reflect: true })
  variant: ComposerVariant = 'contained';

  /** Placeholder text passed to the inner prompt input. */
  @property({ type: String })
  placeholder?: string;

  /** Whether the composer is disabled (input + button). */
  @property({ type: Boolean, reflect: true })
  disabled = false;

  /** Whether submission is disabled (button + Enter) while input remains active. */
  @property({ type: Boolean, reflect: true, attribute: 'submit-disabled' })
  submitDisabled = false;

  /** Whether AI generation is currently streaming. */
  @property({ type: Boolean, reflect: true })
  streaming = false;

  /** Maximum character length (0 = unlimited). */
  @property({ type: Number, attribute: 'max-length' })
  maxLength = 0;

  /** Internal tracking of whether the input has content. */
  @state()
  private _hasContent = false;

  @state()
  private _inputValue = '';

  // ---------------------------------------------------------------------------
  // Paste-to-upload auto-wiring
  // ---------------------------------------------------------------------------

  private _boundHandlePasteFiles = this._handlePasteFiles.bind(this);

  override connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('loquix-paste-files', this._boundHandlePasteFiles as EventListener);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener('loquix-paste-files', this._boundHandlePasteFiles as EventListener);
  }

  private _handlePasteFiles(e: CustomEvent<LoquixPasteFilesDetail>): void {
    // Look for slotted loquix-attachment-panel in all slots
    const panels = this.querySelectorAll('loquix-attachment-panel');
    for (const panel of panels) {
      if ('addFiles' in panel && typeof panel.addFiles === 'function') {
        panel.addFiles(e.detail.files);
        // Stop propagation — the panel has handled the files,
        // prevent duplicate handling by ancestor listeners.
        e.stopPropagation();
        return;
      }
    }
    // If no panel found, the event continues bubbling for external handling
  }

  // ---------------------------------------------------------------------------
  // Event handlers
  // ---------------------------------------------------------------------------

  private _handleInputChange(e: CustomEvent<LoquixChangeDetail>): void {
    const value = e.detail.value;
    this._inputValue = value;
    this._hasContent = value.trim().length > 0;
  }

  private _handleSubmitFromInput(e: CustomEvent<LoquixSubmitDetail>): void {
    if (this.submitDisabled) {
      // Block submission while keeping input active
      e.stopPropagation();
      return;
    }
    // The event already bubbles and is composed, so it will propagate up.
    // Reset internal state after submission.
    this._inputValue = '';
    this._hasContent = false;
  }

  private _handleSendClick(): void {
    const content = this._inputValue.trim();
    if (!content || this.submitDisabled) return;
    this.dispatchEvent(createLoquixEvent('loquix-submit', { content }));
    this._inputValue = '';
    this._hasContent = false;
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  private _handleStopClick(): void {
    this.dispatchEvent(createLoquixEvent('loquix-stop', {}));
  }

  private _renderSendButton() {
    return html`
      <button
        part="send-button"
        class="send-button"
        aria-label=${this._localize.term('chatComposer.sendLabel')}
        ?disabled=${!this._hasContent || this.disabled || this.submitDisabled}
        @click=${this._handleSendClick}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <line x1="22" y1="2" x2="11" y2="13"></line>
          <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
        </svg>
      </button>
    `;
  }

  private _renderStopButton() {
    return html`
      <button
        part="send-button"
        class="send-button send-button--stop"
        aria-label=${this._localize.term('chatComposer.stopLabel')}
        @click=${this._handleStopClick}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="6" y="6" width="12" height="12" rx="2" ry="2"></rect>
        </svg>
      </button>
    `;
  }

  private _renderDefaultLayout() {
    return html`
      <div part="composer" class="composer">
        <div part="toolbar" class="toolbar toolbar--top">
          <slot name="toolbar-top"></slot>
        </div>

        <div class="input-row">
          <slot name="input">
            <loquix-prompt-input
              .value=${this._inputValue}
              placeholder=${this.placeholder ?? this._localize.term('chatComposer.placeholder')}
              ?disabled=${this.disabled}
              auto-resize
              submit-on-enter
              @loquix-change=${this._handleInputChange}
              @loquix-submit=${this._handleSubmitFromInput}
            ></loquix-prompt-input>
          </slot>

          ${this.streaming ? this._renderStopButton() : this._renderSendButton()}
        </div>

        <slot name="suggestions"></slot>

        <div part="toolbar" class="toolbar toolbar--bottom">
          <slot name="toolbar-bottom"></slot>
        </div>

        <slot name="footer"></slot>
      </div>
    `;
  }

  private _renderContainedLayout() {
    return html`
      <div part="composer" class="composer composer--contained">
        <div part="toolbar" class="toolbar toolbar--top">
          <slot name="toolbar-top"></slot>
        </div>

        <div part="container" class="container">
          <div class="container__input">
            <slot name="input">
              <loquix-prompt-input
                .value=${this._inputValue}
                placeholder=${this.placeholder ?? this._localize.term('chatComposer.placeholder')}
                ?disabled=${this.disabled}
                variant="panel"
                auto-resize
                submit-on-enter
                @loquix-change=${this._handleInputChange}
                @loquix-submit=${this._handleSubmitFromInput}
              ></loquix-prompt-input>
            </slot>
          </div>

          <div part="actions-bar" class="actions-bar">
            <div class="actions-bar__left">
              <slot name="actions-left"></slot>
            </div>
            <div class="actions-bar__right">
              <slot name="actions-right"></slot>
              ${this.streaming ? this._renderStopButton() : this._renderSendButton()}
            </div>
          </div>
        </div>

        <slot name="suggestions"></slot>

        <div part="toolbar" class="toolbar toolbar--bottom">
          <slot name="toolbar-bottom"></slot>
        </div>

        <slot name="footer"></slot>
      </div>
    `;
  }

  protected render() {
    return this.variant === 'contained'
      ? this._renderContainedLayout()
      : this._renderDefaultLayout();
  }
}
