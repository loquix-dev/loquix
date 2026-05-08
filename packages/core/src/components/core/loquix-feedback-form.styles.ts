import { css } from 'lit';

const styles = css`
  :host {
    display: inline-flex;
    flex-direction: column;
    gap: 8px;
    font-family: var(--loquix-font-family);
  }

  /* Buttons row */
  .buttons {
    display: inline-flex;
    gap: 2px;
    align-items: center;
    padding: 2px;
    background: var(--loquix-overlay-subtle);
    border-radius: 8px;
    width: fit-content;
  }

  /* Form (chips + textarea) */
  .form {
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 380px;
    padding: 10px;
    background: var(--loquix-surface-bg);
    border: 1px solid var(--loquix-border-color);
    border-radius: 10px;
  }

  .reasons {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
  .chip {
    appearance: none;
    border: 1px solid var(--loquix-border-color);
    background: var(--loquix-surface-secondary-bg);
    color: var(--loquix-text-color);
    font: inherit;
    font-size: 12px;
    padding: 4px 10px;
    border-radius: 999px;
    cursor: pointer;
    transition:
      background 120ms,
      border-color 120ms;
  }
  .chip:hover {
    background: var(--loquix-overlay-subtle);
  }
  .chip[aria-checked='true'] {
    background: var(--loquix-ai-color);
    color: #fff;
    border-color: var(--loquix-ai-color);
  }
  .chip:focus-visible {
    outline: 2px solid var(--loquix-focus-color, var(--loquix-ai-color));
    outline-offset: 2px;
  }

  textarea {
    font: inherit;
    font-size: 13px;
    padding: 8px 10px;
    border: 1px solid var(--loquix-border-color);
    border-radius: 6px;
    resize: vertical;
    background: var(--loquix-surface-secondary-bg);
    color: var(--loquix-text-color);
  }
  textarea:focus {
    outline: 2px solid var(--loquix-ai-color);
    outline-offset: -1px;
    border-color: transparent;
  }

  .actions {
    display: flex;
    gap: 6px;
    justify-content: flex-end;
  }

  .btn {
    appearance: none;
    border: 0;
    font: inherit;
    font-size: 12.5px;
    font-weight: 600;
    padding: 6px 12px;
    border-radius: 6px;
    cursor: pointer;
    transition:
      background 150ms,
      color 150ms;
  }
  .btn--ghost {
    background: transparent;
    color: var(--loquix-text-secondary-color);
  }
  .btn--ghost:hover {
    background: var(--loquix-overlay-subtle);
    color: var(--loquix-text-color);
  }
  .btn--primary {
    background: var(--loquix-ai-color);
    color: #fff;
  }
  .btn--primary:hover {
    filter: brightness(1.05);
  }
  .btn--primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    filter: none;
  }

  .thanks {
    font-size: 12px;
    color: var(--loquix-text-secondary-color);
    padding: 4px 0;
  }
`;

export default styles;
