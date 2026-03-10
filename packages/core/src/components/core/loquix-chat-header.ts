import { LitElement, html, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { LocalizeController } from '../../i18n/index.js';
import styles from './loquix-chat-header.styles.js';

/**
 * @tag loquix-chat-header
 * @summary Horizontal header bar at the top of a chat interface.
 *
 * @csspart header - Outer wrapper.
 * @csspart title - The title text element.
 *
 * @slot avatar - Avatar or icon to the left of the title.
 * @slot title - Override the agent name / title.
 * @slot controls - Right-side controls (model badge, settings, etc.).
 * @slot mode-switcher - Mode-switching UI.
 *
 * @cssprop [--loquix-header-bg] - Background colour of the header.
 * @cssprop [--loquix-header-color] - Text colour.
 * @cssprop [--loquix-header-height] - Height of the header bar.
 * @cssprop [--loquix-header-padding] - Horizontal padding.
 * @cssprop [--loquix-border-color] - Bottom border colour.
 */
export class LoquixChatHeader extends LitElement {
  static styles = [styles];

  private _localize = new LocalizeController(this);

  /** Display name of the AI agent. */
  @property({ type: String, attribute: 'agent-name' })
  agentName?: string;

  /** Whether to show a model badge in the controls area. */
  @property({ type: Boolean, attribute: 'show-model-badge' })
  showModelBadge = false;

  /** Whether private mode is on (hides model info). */
  @property({ type: Boolean, attribute: 'private-mode', reflect: true })
  privateMode = false;

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  protected render() {
    return html`
      <header part="header" class="header" role="banner">
        <div class="header-left">
          <slot name="avatar"></slot>

          <slot name="title">
            <span part="title" class="title"
              >${this.agentName ?? this._localize.term('chatHeader.agentName')}</span
            >
          </slot>
        </div>

        <div class="header-right">
          <slot name="mode-switcher"></slot>

          ${this.showModelBadge && !this.privateMode
            ? html`<slot name="controls"></slot>`
            : nothing}
        </div>
      </header>
    `;
  }
}
