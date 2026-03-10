import { css } from 'lit';

export default css`
  :host {
    display: block;
  }

  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: var(--loquix-chip-gap, 8px);
    list-style: none;
    margin: 0;
    padding: 0;
  }

  :host([wrap='false']) .chips,
  .chips--no-wrap {
    flex-wrap: nowrap;
    overflow-x: auto;
    scrollbar-width: thin;
    -webkit-overflow-scrolling: touch;
  }

  .chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: var(--loquix-chip-padding, 8px 16px);
    border: 1px solid var(--loquix-chip-border-color, rgba(0, 0, 0, 0.12));
    border-radius: var(--loquix-chip-border-radius, 9999px);
    background: var(--loquix-chip-bg, transparent);
    color: var(--loquix-chip-color, inherit);
    font-family: inherit;
    font-size: var(--loquix-chip-font-size, 0.875rem);
    line-height: 1.4;
    cursor: pointer;
    white-space: nowrap;
    transition:
      background 0.15s ease,
      border-color 0.15s ease,
      box-shadow 0.15s ease;
    user-select: none;
  }

  .chip:hover {
    background: var(--loquix-chip-hover-bg, rgba(0, 0, 0, 0.04));
    border-color: var(--loquix-chip-hover-border-color, rgba(0, 0, 0, 0.24));
  }

  .chip:focus-visible {
    outline: 2px solid var(--loquix-ai-color, #7c3aed);
    outline-offset: 2px;
  }

  .chip:active {
    background: var(--loquix-chip-active-bg, rgba(0, 0, 0, 0.08));
  }

  .chip:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }

  .chip__icon {
    display: inline-flex;
    align-items: center;
    flex-shrink: 0;
    font-size: 1.1em;
  }

  /* Pill variant — smaller */
  :host([variant='pill']) .chip {
    padding: var(--loquix-chip-padding, 4px 12px);
    font-size: var(--loquix-chip-font-size, 0.8125rem);
  }

  /* Card variant — grid layout with equal-width cards */
  :host([variant='card']) .chips {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(var(--loquix-chip-card-min-width, 180px), 1fr));
  }

  :host([variant='card']) .chip {
    padding: var(--loquix-chip-padding, 12px 16px);
    border-radius: var(--loquix-chip-border-radius, 12px);
    flex-direction: column;
    align-items: flex-start;
    white-space: normal;
    text-align: left;
    box-shadow: var(--loquix-shadow-sm);
  }

  :host([variant='card']) .chip:hover {
    box-shadow: var(--loquix-shadow-md);
  }

  .chip__description {
    font-size: 0.8em;
    color: var(--loquix-chip-description-color, rgba(0, 0, 0, 0.65));
    margin-top: 2px;
  }

  /* "+N more" button */
  .more-btn {
    display: inline-flex;
    align-items: center;
    padding: 8px 16px;
    border: 1px dashed var(--loquix-chip-border-color, rgba(0, 0, 0, 0.12));
    border-radius: var(--loquix-chip-border-radius, 9999px);
    background: none;
    color: var(--loquix-chip-color, var(--loquix-text-secondary-color, #6b7280));
    font-family: inherit;
    font-size: var(--loquix-chip-font-size, 0.875rem);
    cursor: pointer;
    transition: color 0.15s ease;
  }

  .more-btn:hover {
    color: var(--loquix-chip-color, inherit);
  }

  .more-btn:focus-visible {
    outline: 2px solid var(--loquix-ai-color, #7c3aed);
    outline-offset: 2px;
  }
`;
