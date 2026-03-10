import { css } from 'lit';

export default css`
  :host {
    display: block;
  }

  :host([hidden]) {
    display: none;
  }

  .banner {
    display: flex;
    align-items: center;
    gap: var(--loquix-nudge-gap, 10px);
    padding: var(--loquix-nudge-padding, 10px 14px);
    border-radius: var(--loquix-nudge-border-radius, 10px);
    font-size: var(--loquix-nudge-font-size, 0.875rem);
    line-height: 1.5;
  }

  /* info variant — blue */
  :host([variant='info']) .banner {
    background: var(--loquix-nudge-info-bg, var(--loquix-nudge-bg, rgba(59, 130, 246, 0.08)));
    color: var(--loquix-nudge-info-color, var(--loquix-nudge-color, #1e40af));
    border: 1px solid
      var(
        --loquix-nudge-info-border-color,
        var(--loquix-nudge-border-color, rgba(59, 130, 246, 0.2))
      );
  }

  /* tip variant — purple/AI */
  :host([variant='tip']) .banner,
  :host(:not([variant])) .banner {
    background: var(--loquix-nudge-tip-bg, var(--loquix-nudge-bg, rgba(124, 58, 237, 0.08)));
    color: var(--loquix-nudge-tip-color, var(--loquix-nudge-color, #5b21b6));
    border: 1px solid
      var(
        --loquix-nudge-tip-border-color,
        var(--loquix-nudge-border-color, rgba(124, 58, 237, 0.2))
      );
  }

  /* warning variant — amber */
  :host([variant='warning']) .banner {
    background: var(--loquix-nudge-warning-bg, var(--loquix-nudge-bg, rgba(245, 158, 11, 0.08)));
    color: var(--loquix-nudge-warning-color, var(--loquix-nudge-color, #92400e));
    border: 1px solid
      var(
        --loquix-nudge-warning-border-color,
        var(--loquix-nudge-border-color, rgba(245, 158, 11, 0.2))
      );
  }

  .icon {
    flex-shrink: 0;
    font-size: 1.2em;
    display: inline-flex;
    align-items: center;
  }

  .content {
    flex: 1;
    min-width: 0;
  }

  .action-btn {
    flex-shrink: 0;
    padding: 4px 12px;
    border: 1px solid currentColor;
    border-radius: 6px;
    background: transparent;
    color: inherit;
    font-family: inherit;
    font-size: 0.8125rem;
    font-weight: 500;
    cursor: pointer;
    opacity: 0.8;
    transition: opacity 0.15s ease;
    white-space: nowrap;
  }

  .action-btn:hover {
    opacity: 1;
  }

  .action-btn:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 2px;
  }

  .dismiss-btn {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    padding: 0;
    border: none;
    border-radius: 4px;
    background: transparent;
    color: inherit;
    cursor: pointer;
    opacity: 0.5;
    transition:
      opacity 0.15s ease,
      background 0.15s ease;
  }

  .dismiss-btn:hover {
    opacity: 0.8;
    background: var(--loquix-overlay-light);
  }

  .dismiss-btn:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 2px;
  }

  .dismiss-btn svg {
    width: 14px;
    height: 14px;
  }
`;
