import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import type { ChatLayout, ChatMode } from '../../types/index.js';
import { KeyboardController } from '../../controllers/keyboard.controller.js';
import styles from './loquix-chat-container.styles.js';

/**
 * @tag loquix-chat-container
 * @summary Root container that organises the chat UI layout.
 *
 * @csspart container - The outermost wrapper.
 * @csspart main - The main content area (header + messages + composer).
 * @csspart sidebar - Optional sidebar region.
 *
 * @slot header - Chat header area.
 * @slot sidebar - Optional sidebar content.
 * @slot messages - Message list area.
 * @slot composer - Composer / input area.
 * @slot footer - Footer area.
 *
 * @cssprop [--loquix-container-bg] - Background colour.
 * @cssprop [--loquix-container-max-width] - Max width for the full layout.
 * @cssprop [--loquix-container-border-radius] - Border radius (floating layout).
 * @cssprop [--loquix-container-shadow] - Box shadow (floating layout).
 * @cssprop [--loquix-sidebar-width] - Width of the sidebar.
 * @cssprop [--loquix-border-color] - General border colour.
 */
export class LoquixChatContainer extends LitElement {
  static styles = [styles];

  /** Layout mode. Reflected as a host attribute for CSS targeting. */
  @property({ type: String, reflect: true })
  layout: ChatLayout = 'full';

  /** Functional mode of the chat. */
  @property({ type: String, reflect: true })
  mode: ChatMode = 'chat';

  /** Current model identifier. */
  @property({ type: String })
  model = '';

  /** Whether memory / conversation history is enabled. */
  @property({ type: Boolean, attribute: 'memory-enabled' })
  memoryEnabled = false;

  /** Whether private mode hides model information. */
  @property({ type: Boolean, attribute: 'private-mode', reflect: true })
  privateMode = false;

  /** Whether AI is currently streaming. */
  @property({ type: Boolean, reflect: true })
  streaming = false;

  private _keyboard = new KeyboardController(this);

  // ---------------------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------------------

  protected firstUpdated(): void {
    // Escape to blur focused elements
    this._keyboard.addBinding({
      key: 'Escape',
      handler: () => {
        const active = this.shadowRoot?.activeElement ?? document.activeElement;
        if (active instanceof HTMLElement) {
          active.blur();
        }
      },
    });
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  protected render() {
    return html`
      <div part="container" class="container">
        <div part="sidebar" class="sidebar">
          <slot name="sidebar"></slot>
        </div>

        <div part="main" class="main">
          <slot name="header"></slot>
          <slot name="messages"></slot>
          <slot name="composer"></slot>
          <slot name="footer"></slot>
        </div>
      </div>
    `;
  }
}
