import { css } from 'lit';

const styles = css`
  :host {
    display: block;
    font-family: var(--loquix-font-family);
  }

  .container {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 14px;
    background: var(--loquix-surface-bg);
    border: 1px solid var(--loquix-border-color);
    border-radius: 10px;
    width: 100%;
    max-width: 520px;
  }

  .lbl {
    font-size: 10.5px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--loquix-text-secondary-color);
    display: block;
    margin-bottom: 4px;
  }
  .lbl__req {
    color: var(--loquix-error-color);
    margin-left: 2px;
  }

  .original {
    padding: 8px 10px;
    background: var(--loquix-surface-secondary-bg);
    border: 1px solid var(--loquix-border-color);
    border-radius: 6px;
    font-size: 13px;
    line-height: 1.5;
    color: var(--loquix-text-secondary-color);
    text-decoration: line-through;
    text-decoration-color: var(--loquix-error-color);
    text-decoration-thickness: 1.5px;
  }

  .field {
    display: flex;
    flex-direction: column;
  }

  textarea,
  input {
    font: inherit;
    font-size: 13px;
    padding: 8px 10px;
    border: 1px solid var(--loquix-border-color);
    border-radius: 6px;
    background: var(--loquix-surface-bg);
    color: var(--loquix-text-color);
    resize: vertical;
  }
  textarea:focus,
  input:focus {
    outline: 2px solid var(--loquix-ai-color);
    outline-offset: -1px;
    border-color: transparent;
  }

  .actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
    padding-top: 4px;
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
`;

export default styles;
