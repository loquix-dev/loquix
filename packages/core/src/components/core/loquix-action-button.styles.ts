import { css } from 'lit';

const styles = css`
  :host {
    display: inline-flex;
  }

  :host([disabled]) {
    pointer-events: none;
    opacity: 0.4;
  }

  .action {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: var(--loquix-action-size, 28px);
    height: var(--loquix-action-size, 28px);
    padding: 0;
    border: none;
    border-radius: var(--loquix-action-border-radius, 6px);
    background: var(--loquix-action-bg, transparent);
    color: var(--loquix-action-color, var(--loquix-text-secondary-color, #6b7280));
    cursor: pointer;
    transition:
      background var(--loquix-transition-duration, 200ms)
        var(--loquix-transition-easing, cubic-bezier(0.4, 0, 0.2, 1)),
      color var(--loquix-transition-duration, 200ms)
        var(--loquix-transition-easing, cubic-bezier(0.4, 0, 0.2, 1));
  }

  .action:hover {
    background: var(--loquix-action-hover-bg, var(--loquix-surface-secondary-bg, #f9fafb));
    color: var(--loquix-action-hover-color, var(--loquix-text-color, #111827));
  }

  .action:focus-visible {
    outline: 2px solid var(--loquix-input-focus-color, #7c3aed);
    outline-offset: 1px;
  }

  .action svg,
  .action ::slotted(svg) {
    width: 16px;
    height: 16px;
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
`;

export default styles;
