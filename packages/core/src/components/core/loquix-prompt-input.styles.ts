import { css } from 'lit';

const styles = css`
  :host {
    display: block;
    width: 100%;
  }

  :host([disabled]) {
    opacity: 0.5;
    pointer-events: none;
  }

  .container {
    display: flex;
    width: 100%;
  }

  .input {
    width: 100%;
    margin: 0;
    box-sizing: border-box;
    resize: none;
    border: 1px solid var(--loquix-input-border-color, var(--loquix-border-color, #e2e8f0));
    border-radius: var(--loquix-input-border-radius, 8px);
    padding: var(--loquix-input-padding, 10px 12px);
    font-family: var(--loquix-input-font-family, var(--loquix-font-family, sans-serif));
    font-size: var(--loquix-input-font-size, 0.875rem);
    line-height: 1.5;
    color: var(--loquix-input-color, var(--loquix-text-color, #1e293b));
    background: var(--loquix-input-bg, var(--loquix-surface-color, #ffffff));
    outline: none;
    transition:
      border-color var(--loquix-transition-duration, 200ms)
        var(--loquix-transition-easing, cubic-bezier(0.4, 0, 0.2, 1)),
      box-shadow var(--loquix-transition-duration, 200ms)
        var(--loquix-transition-easing, cubic-bezier(0.4, 0, 0.2, 1));
  }

  .input::placeholder {
    color: var(--loquix-input-placeholder-color, #94a3b8);
  }

  .input:focus {
    border-color: var(--loquix-input-focus-border-color, var(--loquix-ai-color, #7c3aed));
    box-shadow: 0 0 0 2px var(--loquix-input-focus-ring-color, rgba(124, 58, 237, 0.15));
  }

  .input:disabled {
    cursor: not-allowed;
    background: var(--loquix-input-disabled-bg, #f1f5f9);
  }

  /* Variant styles */
  :host([variant='inline']) .input {
    border: none;
    border-bottom: 1px solid var(--loquix-input-border-color, var(--loquix-border-color, #e2e8f0));
    border-radius: 0;
    padding: var(--loquix-input-padding, 6px 0);
  }

  :host([variant='inline']) .input:focus {
    box-shadow: none;
    border-bottom-color: var(--loquix-input-focus-border-color, var(--loquix-ai-color, #7c3aed));
  }

  :host([variant='command']) .input {
    font-family: var(--loquix-mono-font-family, 'SF Mono', 'Fira Code', monospace);
    border-radius: var(--loquix-input-border-radius, 4px);
    background: var(--loquix-input-command-bg, #1e293b);
    color: var(--loquix-input-command-color, #e2e8f0);
    padding: var(--loquix-input-padding, 12px);
  }

  :host([variant='panel']) .input {
    border-radius: 0;
    border: none;
    border-top: 1px solid var(--loquix-input-border-color, var(--loquix-border-color, #e2e8f0));
    padding: var(--loquix-input-padding, 12px 16px);
  }

  :host([variant='panel']) .input:focus {
    box-shadow: none;
  }
`;

export default styles;
