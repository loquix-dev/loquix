import { LitElement, html, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import type { Suggestion, SuggestionVariant, WelcomeScreenLayout } from '../../types/index.js';
import { LocalizeController } from '../../i18n/index.js';
import styles from './loquix-welcome-screen.styles.js';
import './define-suggestion-chips.js';

/**
 * @tag loquix-welcome-screen
 * @summary Empty-state welcome screen with heading, suggestions, and branding.
 *
 * Place inside `<loquix-message-list slot="empty-state">` to show when no messages exist.
 *
 * @slot logo - Brand logo/icon above the heading.
 * @slot heading - Custom heading markup (overrides `heading` property).
 * @slot subheading - Custom subheading markup (overrides `subheading` property).
 * @slot suggestions - Override the default suggestion chips.
 * @slot footer - Additional content below suggestions.
 *
 * @cssprop [--loquix-welcome-padding] - Container padding.
 * @cssprop [--loquix-welcome-max-width] - Maximum width.
 * @cssprop [--loquix-welcome-heading-font-size] - Heading font size.
 * @cssprop [--loquix-welcome-heading-font-weight] - Heading font weight.
 * @cssprop [--loquix-welcome-heading-color] - Heading color.
 * @cssprop [--loquix-welcome-subheading-font-size] - Subheading font size.
 * @cssprop [--loquix-welcome-subheading-color] - Subheading color.
 */
export class LoquixWelcomeScreen extends LitElement {
  static styles = [styles];

  private _localize = new LocalizeController(this);

  /** Main heading text. */
  @property()
  heading?: string;

  /** Subheading text below the heading. */
  @property()
  subheading = '';

  /** Layout mode. */
  @property({ reflect: true })
  layout: WelcomeScreenLayout = 'centered';

  /** Suggestion items to render as chips. */
  @property({ type: Array })
  suggestions: Suggestion[] = [];

  /** Visual variant for suggestion chips. */
  @property({ attribute: 'suggestion-variant' })
  suggestionVariant: SuggestionVariant = 'chip';

  protected render() {
    return html`
      <div class="logo">
        <slot name="logo"></slot>
      </div>
      <div class="content">
        <slot name="heading">
          <h2 class="heading">${this.heading ?? this._localize.term('welcomeScreen.heading')}</h2>
        </slot>
        ${this.subheading
          ? html`
              <slot name="subheading">
                <p class="subheading">${this.subheading}</p>
              </slot>
            `
          : html`<slot name="subheading"></slot>`}
        <div class="suggestions">
          <slot name="suggestions">
            ${this.suggestions.length > 0
              ? html`
                  <loquix-suggestion-chips
                    .suggestions=${this.suggestions}
                    .variant=${this.suggestionVariant}
                  ></loquix-suggestion-chips>
                `
              : nothing}
          </slot>
        </div>
        <div class="footer">
          <slot name="footer"></slot>
        </div>
      </div>
    `;
  }
}
