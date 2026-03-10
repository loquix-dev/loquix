import { LitElement, html, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import type { Suggestion, FollowUpVariant } from '../../types/index.js';
import styles from './loquix-follow-up-suggestions.styles.js';
import './define-suggestion-chips.js';

/**
 * @tag loquix-follow-up-suggestions
 * @summary Follow-up suggestion chips shown below an assistant message.
 *
 * @fires {CustomEvent} loquix-suggestion-select - When a suggestion is clicked.
 *
 * @cssprop [--loquix-followup-gap] - Gap between chips.
 * @cssprop [--loquix-followup-font-size] - Chip font size.
 * @cssprop [--loquix-followup-margin-top] - Top margin from parent message.
 * @cssprop [--loquix-followup-label-font-size] - Label font size.
 * @cssprop [--loquix-followup-label-color] - Label color.
 */
export class LoquixFollowUpSuggestions extends LitElement {
  static styles = [styles];

  /** Suggestion items. */
  @property({ type: Array })
  suggestions: Suggestion[] = [];

  /** Layout variant. */
  @property({ reflect: true })
  variant: FollowUpVariant = 'inline';

  /** Associated message ID. */
  @property({ attribute: 'message-id' })
  messageId = '';

  /** Max visible chips before "+N more". */
  @property({ type: Number, attribute: 'max-visible' })
  maxVisible = 3;

  /** Optional label above chips. */
  @property()
  label = '';

  protected render() {
    if (this.suggestions.length === 0) return nothing;

    const isCarousel = this.variant === 'carousel';
    const chipVariant = this.variant === 'stacked' ? 'pill' : 'chip';

    return html`
      ${this.label ? html`<div class="label">${this.label}</div>` : nothing}
      <loquix-suggestion-chips
        .suggestions=${this.suggestions}
        .variant=${chipVariant}
        .maxVisible=${this.maxVisible}
        .wrap=${!isCarousel}
      ></loquix-suggestion-chips>
    `;
  }
}
