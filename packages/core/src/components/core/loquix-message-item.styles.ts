import { css } from 'lit';

const styles = css`
  :host {
    display: block;
    width: 100%;
  }

  .container {
    display: flex;
    align-items: flex-start;
    gap: var(--loquix-message-gap, 12px);
    max-width: var(--loquix-message-max-width, 100%);
    padding: 4px 0;
  }

  /* User messages: align to the right */
  :host([sender='user']) .container {
    flex-direction: row-reverse;
  }

  /* ── Avatar column ── */

  .avatar-column {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex-shrink: 0;
  }

  /* ── Message area ── */

  .message-area {
    flex: 1;
    min-width: 0;
  }

  /* ── Bubble group: constrains bubble + bottom-actions to same width ── */

  .bubble-group {
    display: flex;
    flex-direction: column;
    width: fit-content;
    max-width: 80%;
  }

  /* Expand bubble-group when editing for comfortable text input */
  .bubble-group:has(.bubble--editing) {
    width: 100%;
  }

  /* ── Bubble column: wraps above-bubble slot, bubble, and below-bubble slot ── */

  .bubble-column {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  /* Spacing between slotted attachments and the bubble */
  .bubble-column > ::slotted([slot='above-bubble']) {
    margin-bottom: var(--loquix-message-attachments-spacing, 8px);
  }

  .bubble-column > ::slotted([slot='below-bubble']) {
    margin-top: var(--loquix-message-attachments-spacing, 8px);
  }

  .bubble-group:has(.bubble--editing) .bubble-column {
    width: 100%;
  }

  :host([sender='user']) .bubble-group {
    margin-left: auto;
  }

  .bubble {
    border-radius: var(--loquix-message-bubble-radius, 12px);
    padding: var(--loquix-message-bubble-padding, 10px 14px);
    background: var(--loquix-message-assistant-bg, transparent);
    color: var(--loquix-text-color, #1e293b);
    word-wrap: break-word;
    overflow-wrap: break-word;
  }

  :host([sender='user']) .bubble {
    background: var(--loquix-message-user-bg, #f8fafc);
  }

  /* Editing state — expand bubble to fill bubble-group width for comfortable editing */
  .bubble--editing {
    width: 100%;
    box-sizing: border-box;
  }

  /* Error state */
  :host([status='error']) .bubble {
    border: 1px solid var(--loquix-message-error-border-color, #ef4444);
  }

  .header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
    font-size: 0.75rem;
    color: var(--loquix-text-muted-color, #64748b);
  }

  .model {
    font-weight: 500;
  }

  .timestamp {
    font-size: 0.6875rem;
  }

  .content {
    position: relative;
    line-height: 1.5;
    font-size: var(--loquix-message-font-size, 0.875rem);
    overflow: hidden;
    transition: max-height 300ms var(--loquix-transition-easing, cubic-bezier(0.4, 0, 0.2, 1));
  }

  /* Remove top/bottom margin on standard HTML elements (which have
     user-agent margins) to avoid extra spacing alongside bubble padding.
     Uses :where() so custom elements (e.g. loquix-follow-up-suggestions)
     keep their own :host margins intact. */
  .content
    ::slotted(
      :where(p, div, ul, ol, dl, h1, h2, h3, h4, h5, h6, blockquote, pre, figure, hr, table)
    ) {
    margin-top: 0;
    margin-bottom: 0;
  }

  .content--collapsed {
    overflow: hidden;
  }

  .content-fade {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 48px;
    pointer-events: none;
    background: linear-gradient(to bottom, transparent, var(--loquix-message-user-bg, #f8fafc));
  }

  .show-more {
    position: relative;
    z-index: 1;
    display: inline-block;
    margin-top: 4px;
    padding: 0;
    border: none;
    background-color: var(--loquix-message-show-more-bg, var(--loquix-message-user-bg, #f8fafc));
    color: var(--loquix-message-show-more-color, var(--loquix-ai-color, #7c3aed));
    font-size: 0.8125rem;
    font-family: inherit;
    cursor: pointer;
  }

  .show-more:hover {
    text-decoration: underline;
  }

  /* ── Actions toolbar (outside bubble) ── */

  .actions {
    margin-top: 4px;
    opacity: 0;
    pointer-events: none;
    transition: opacity var(--loquix-transition-duration, 200ms)
      var(--loquix-transition-easing, cubic-bezier(0.4, 0, 0.2, 1));
  }

  :host(:hover) .actions,
  :host(:focus-within) .actions {
    opacity: 1;
    pointer-events: auto;
  }

  /* Hide actions when not complete */
  :host(:not([status='complete'])) .actions {
    display: none;
  }

  /* ── Bottom positions: actions inside bubble-group ── */

  :host([actions-position='bottom-start']) .bubble-group .actions,
  :host(:not([actions-position])) .bubble-group .actions {
    align-self: flex-start;
  }

  :host([actions-position='bottom-end']) .bubble-group .actions {
    align-self: flex-end;
  }

  /* ── Inline positions ── */

  /* Inline-opposite: bubble-group becomes a row so actions sit next to bubble */
  .bubble-group--inline {
    flex-direction: row;
    align-items: flex-start;
    gap: 4px;
  }

  .bubble-group--inline > .bubble-column {
    flex: 1;
    min-width: 0;
  }

  .bubble-group--inline .actions {
    margin-top: 0;
  }

  /* Avatar-side inline: actions stacked under avatar */
  .avatar-column .actions {
    margin-top: 8px;
  }

  /* Error bar */
  .error-bar {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 8px;
    font-size: 0.75rem;
  }

  .error-message {
    color: var(--loquix-message-error-text-color, #dc2626);
  }

  .retry-button {
    border: 1px solid var(--loquix-message-error-border-color, #ef4444);
    background: transparent;
    color: var(--loquix-message-error-text-color, #dc2626);
    border-radius: 4px;
    padding: 2px 8px;
    font-size: 0.75rem;
    cursor: pointer;
    transition: background var(--loquix-transition-duration, 200ms)
      var(--loquix-transition-easing, cubic-bezier(0.4, 0, 0.2, 1));
  }

  .retry-button:hover {
    background: var(--loquix-message-retry-hover-bg, rgba(239, 68, 68, 0.08));
  }
`;

export default styles;
