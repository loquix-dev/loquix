import { css } from 'lit';

const styles = css`
  :host {
    display: inline-flex;
  }

  .badge {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: var(--loquix-disclosure-padding, 0.125rem 0.5rem);
    background: var(--loquix-disclosure-bg, #f3f4f6);
    color: var(--loquix-disclosure-text-color, #4b5563);
    border-radius: var(--loquix-disclosure-border-radius, 999px);
    font-family: var(--loquix-font-family, sans-serif);
    font-size: var(--loquix-disclosure-font-size, 0.6875rem);
    font-weight: 500;
    line-height: 1.4;
    white-space: nowrap;
    user-select: none;
  }

  /* Icon variant: show only an icon + tooltip */
  :host([variant='icon']) .badge {
    padding: 0.25rem;
    border-radius: 50%;
  }

  :host([variant='icon']) .label {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  /* Banner variant */
  :host([variant='banner']) .badge {
    border-radius: var(--loquix-border-radius, 12px);
    padding: 0.375rem 0.75rem;
    width: 100%;
    justify-content: center;
  }

  .icon {
    display: inline-flex;
    align-items: center;
    flex-shrink: 0;
  }

  .icon svg {
    width: 12px;
    height: 12px;
    fill: currentColor;
  }
`;

export default styles;
