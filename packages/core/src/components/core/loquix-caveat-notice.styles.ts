import { css } from 'lit';

const styles = css`
  :host {
    display: block;
  }

  .notice {
    display: flex;
    align-items: flex-start;
    gap: 0.375rem;
    font-family: var(--loquix-font-family, sans-serif);
    font-size: var(--loquix-caveat-font-size, 0.6875rem);
    line-height: 1.4;
    color: var(--loquix-caveat-text-color, #6b7280);
  }

  /* Footer variant — centred, full-width */
  :host([variant='footer']) .notice {
    justify-content: center;
    text-align: center;
    padding: var(--loquix-caveat-padding, 0.5rem 0);
  }

  /* Inline variant — sits within message flow */
  :host([variant='inline']) .notice {
    background: var(--loquix-caveat-bg, #fefce8);
    border-radius: var(--loquix-border-radius, 12px);
    padding: var(--loquix-caveat-padding, 0.375rem 0.625rem);
  }

  /* Contextual variant — warning-style with icon */
  :host([variant='contextual']) .notice {
    background: var(--loquix-caveat-bg, #fefce8);
    border-radius: var(--loquix-border-radius, 12px);
    padding: var(--loquix-caveat-padding, 0.5rem 0.75rem);
    border-left: 3px solid var(--loquix-warning-color, #d97706);
  }

  .icon {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
  }

  .icon svg {
    width: 14px;
    height: 14px;
    fill: var(--loquix-warning-color, #d97706);
  }
`;

export default styles;
