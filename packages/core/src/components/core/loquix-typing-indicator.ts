import { LitElement, html, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import type { TypingVariant } from '../../types/index.js';
import { LocalizeController } from '../../i18n/index.js';
import styles from './loquix-typing-indicator.styles.js';

/**
 * @tag loquix-typing-indicator
 * @summary Animated indicator shown while the AI is generating a response.
 *
 * @csspart container - Outer wrapper.
 * @csspart dot - Each individual bouncing dot (variant = "dots").
 *
 * @cssprop [--loquix-typing-bg] - Background of the indicator container.
 * @cssprop [--loquix-typing-text-color] - Text colour for text / steps variants.
 * @cssprop [--loquix-typing-dot-size] - Diameter of each dot (default 6px).
 * @cssprop [--loquix-typing-dot-color] - Colour of the dots.
 */
export class LoquixTypingIndicator extends LitElement {
  static styles = [styles];

  private _localize = new LocalizeController(this);

  /** Visual variant of the indicator. */
  @property({ type: String, reflect: true })
  variant: TypingVariant = 'dots';

  /** Optional text message displayed with the `text` and `steps` variants. */
  @property({ type: String })
  message?: string;

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  private _renderDots() {
    return html`
      <span class="dots" aria-hidden="true">
        <span part="dot" class="dot"></span>
        <span part="dot" class="dot"></span>
        <span part="dot" class="dot"></span>
      </span>
    `;
  }

  protected render() {
    const showDots = this.variant === 'dots';
    const displayMessage =
      this.variant === 'text'
        ? this.message ?? this._localize.term('typingIndicator.thinkingMessage')
        : this.variant === 'steps'
        ? this.message ?? this._localize.term('typingIndicator.workingMessage')
        : nothing;

    return html`
      <div
        part="container"
        class="container"
        role="status"
        aria-label="${showDots ? this._localize.term('typingIndicator.ariaLabel') : ''}"
      >
        ${showDots ? this._renderDots() : nothing}
        ${displayMessage !== nothing ? html`<span class="text">${displayMessage}</span>` : nothing}
      </div>
    `;
  }
}
