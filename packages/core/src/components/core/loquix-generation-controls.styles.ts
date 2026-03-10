import { css } from 'lit';

const styles = css`
  :host {
    display: inline-flex;
  }

  :host([state='idle']) .controls,
  :host([state='complete']) .controls,
  :host([state='error']) .controls {
    display: none;
  }

  .controls {
    display: inline-flex;
    align-items: center;
    gap: var(--loquix-gen-controls-gap, 0.375rem);
  }

  .button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.25rem;
    padding: var(--loquix-gen-button-padding, 0.25rem 0.625rem);
    border: 1px solid var(--loquix-border-color, #e5e7eb);
    border-radius: var(--loquix-gen-button-border-radius, 8px);
    background: var(--loquix-gen-button-bg, var(--loquix-surface-bg, #ffffff));
    color: var(--loquix-gen-button-color, var(--loquix-text-color, #111827));
    font-family: var(--loquix-font-family, sans-serif);
    font-size: var(--loquix-gen-button-font-size, 0.8125rem);
    cursor: pointer;
    transition: background var(--loquix-transition-duration, 200ms)
        var(--loquix-transition-easing, cubic-bezier(0.4, 0, 0.2, 1)),
      border-color var(--loquix-transition-duration, 200ms)
        var(--loquix-transition-easing, cubic-bezier(0.4, 0, 0.2, 1));
  }

  .button:hover {
    background: var(--loquix-gen-button-hover-bg, var(--loquix-surface-secondary-bg, #f9fafb));
    border-color: var(--loquix-gen-button-hover-border, var(--loquix-input-border-color, #d1d5db));
  }

  .button:focus-visible {
    outline: 2px solid var(--loquix-input-focus-color, #7c3aed);
    outline-offset: 1px;
  }

  /* Stop button gets a more prominent style */
  .button--stop {
    background: var(--loquix-gen-stop-bg, var(--loquix-error-color, #dc2626));
    color: var(--loquix-gen-stop-color, #ffffff);
    border-color: var(--loquix-gen-stop-bg, var(--loquix-error-color, #dc2626));
  }

  .button--stop:hover {
    opacity: 0.9;
    background: var(--loquix-gen-stop-bg, var(--loquix-error-color, #dc2626));
  }

  .button svg {
    width: 14px;
    height: 14px;
    fill: currentColor;
    flex-shrink: 0;
  }
`;

export default styles;
