import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import type { ActionsPosition, MessageRole } from '../../types/index.js';
import { LocalizeController } from '../../i18n/index.js';
import styles from './loquix-message-actions.styles.js';

// Auto-register child action components
import './define-action-button.js';
import './define-action-copy.js';
import './define-action-feedback.js';
import './define-action-edit.js';

/**
 * @tag loquix-message-actions
 * @summary Row of contextual action buttons for a chat message.
 *
 * Renders default action buttons based on `message-role`, but accepts any
 * slotted content to allow full customisation of the toolbar.
 *
 * @csspart toolbar - The action-bar wrapper.
 *
 * @slot - Override the default action buttons with custom content.
 *
 * @fires loquix-copy - When the copy button is clicked (from child).
 * @fires loquix-regenerate - When the regenerate button is clicked (from child).
 * @fires loquix-feedback - When a thumbs up/down button is clicked (from child).
 * @fires loquix-edit - When the edit button is clicked (from child).
 *
 * @cssprop [--loquix-actions-gap] - Gap between action buttons.
 */
export class LoquixMessageActions extends LitElement {
  static styles = [styles];

  private _localize = new LocalizeController(this);

  /** Layout direction of the toolbar. */
  @property({ reflect: true })
  direction: 'horizontal' | 'vertical' = 'horizontal';

  /** Visibility behaviour of the toolbar. */
  @property({ type: String, reflect: true })
  position: ActionsPosition = 'hover';

  /** Role of the message this toolbar is attached to. Determines which default buttons are shown. */
  @property({ type: String, attribute: 'message-role', reflect: true })
  messageRole?: MessageRole;

  // ---------------------------------------------------------------------------
  // Default button sets
  // ---------------------------------------------------------------------------

  private _renderUserDefaults() {
    return html` <loquix-action-edit></loquix-action-edit> `;
  }

  private _renderAssistantDefaults() {
    return html`
      <loquix-action-copy></loquix-action-copy>
      <loquix-action-button
        action="loquix-regenerate"
        label=${this._localize.term('messageActions.regenerate')}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <polyline points="23 4 23 10 17 10"></polyline>
          <polyline points="1 20 1 14 7 14"></polyline>
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
        </svg>
      </loquix-action-button>
      <loquix-action-feedback sentiment="positive"></loquix-action-feedback>
      <loquix-action-feedback sentiment="negative"></loquix-action-feedback>
    `;
  }

  private _renderSystemDefaults() {
    return html`<loquix-action-copy></loquix-action-copy>`;
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  protected render() {
    const isUser = this.messageRole === 'user';
    const isAssistant = this.messageRole === 'assistant';

    const defaults = isUser
      ? this._renderUserDefaults()
      : isAssistant
        ? this._renderAssistantDefaults()
        : this._renderSystemDefaults();

    return html`
      <div
        part="toolbar"
        class="toolbar"
        role="toolbar"
        aria-label=${this._localize.term('messageActions.toolbarLabel')}
      >
        <slot>${defaults}</slot>
      </div>
    `;
  }
}
