import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import type { AvatarState, AvatarVariant, Size } from '../../types/index.js';
import { LocalizeController } from '../../i18n/index.js';
import styles from './loquix-message-avatar.styles.js';

/**
 * @tag loquix-message-avatar
 * @summary Displays an avatar for a chat message participant.
 *
 * @csspart container - Outer wrapper of the avatar.
 * @csspart image - The `<img>` element when `src` is provided.
 * @csspart initials - The initials text element when `name` is provided without `src`.
 *
 * @cssprop [--loquix-avatar-bg] - Background colour of the avatar circle.
 * @cssprop [--loquix-avatar-color] - Foreground / icon colour.
 * @cssprop [--loquix-avatar-pulse-color] - Colour of the pulsing ring animation.
 * @cssprop [--loquix-avatar-size-sm] - Size override for the `sm` preset (default 24px).
 * @cssprop [--loquix-avatar-size-md] - Size override for the `md` preset (default 32px).
 * @cssprop [--loquix-avatar-size-lg] - Size override for the `lg` preset (default 40px).
 */
export class LoquixMessageAvatar extends LitElement {
  static styles = [styles];

  private _localize = new LocalizeController(this);

  /** Image source URL. When provided the avatar renders an `<img>`. */
  @property({ type: String, reflect: true })
  src?: string;

  /** Display name. Used to derive initials when no `src` is set. */
  @property({ type: String, reflect: true })
  name?: string;

  /** Activity state of the avatar. `thinking` and `streaming` trigger a pulse animation. */
  @property({ type: String, reflect: true })
  state: AvatarState = 'idle';

  /** Size preset. */
  @property({ type: String, reflect: true })
  size: Size = 'md';

  /** Visual variant hint. */
  @property({ type: String, reflect: true })
  variant: AvatarVariant = 'icon';

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  private _getInitials(): string {
    if (!this.name) return '';
    const parts = this.name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0);
    return parts[0].charAt(0) + parts[parts.length - 1].charAt(0);
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  private _renderContent() {
    // 1. Image
    if (this.src) {
      return html`<img
        part="image"
        class="image"
        src="${this.src}"
        alt="${this.name ?? this._localize.term('messageAvatar.altFallback')}"
      />`;
    }

    // 2. Initials
    if (this.name) {
      return html`<span part="initials" class="initials">${this._getInitials()}</span>`;
    }

    // 3. Default generic AI icon (sparkle / bot)
    return html`
      <span class="icon">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48
               10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34
               3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2a7.2 7.2 0 0
               1-6-3.22c.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09
               6 3.08a7.2 7.2 0 0 1-6 3.22z"
          />
        </svg>
      </span>
    `;
  }

  protected render() {
    return html`
      <div
        part="container"
        class="container"
        role="img"
        aria-label="${this.name
          ? this._localize.term('messageAvatar.namedAlt', { name: this.name })
          : this._localize.term('messageAvatar.aiAlt')}"
      >
        ${this._renderContent()}
      </div>
    `;
  }
}
