import { css } from 'lit';

const styles = css`
  :host {
    display: block;
    font-family: var(--loquix-font-family, system-ui, -apple-system, sans-serif);
  }

  /* === Bar container === */

  .bar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--loquix-filter-bar-gap, 6px);
    padding: var(--loquix-filter-bar-padding, 4px 0);
  }

  /* === Group label === */

  .group-label {
    font-size: 0.6875rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--loquix-filter-group-color, var(--loquix-text-secondary-color, #9ca3af));
    padding: 0 4px;
  }

  /* === Divider === */

  .divider {
    width: 1px;
    height: 16px;
    background: var(--loquix-filter-divider-color, rgba(0, 0, 0, 0.1));
    margin: 0 4px;
  }

  /* === Filter button === */

  .filter {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: var(--loquix-filter-padding, 4px 12px);
    border: 1px solid var(--loquix-filter-border-color, var(--loquix-border-color, #e5e7eb));
    border-radius: var(--loquix-filter-border-radius, 9999px);
    background: var(--loquix-filter-bg, transparent);
    color: var(--loquix-filter-color, var(--loquix-text-secondary-color, #6b7280));
    font-family: inherit;
    font-size: var(--loquix-filter-font-size, 0.8125rem);
    font-weight: 500;
    cursor: pointer;
    white-space: nowrap;
    transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
    line-height: 1.4;
  }

  .filter:hover:not(:disabled):not(.filter--active) {
    background: var(--loquix-filter-hover-bg, rgba(0, 0, 0, 0.04));
  }

  .filter--active {
    background: var(--loquix-filter-active-bg, var(--loquix-ai-color-subtle, #ede9fe));
    color: var(--loquix-filter-active-color, var(--loquix-ai-color, #7c3aed));
    border-color: var(--loquix-filter-active-border-color, var(--loquix-ai-color, #7c3aed));
  }

  .filter:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .filter:focus-visible {
    outline: 2px solid var(--loquix-ai-color, #7c3aed);
    outline-offset: 2px;
  }

  .filter__icon {
    flex-shrink: 0;
    font-size: 0.875rem;
    line-height: 1;
  }

  .filter__label {
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* === Negative prompt === */

  .negative-prompt {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 8px;
  }

  .negative-prompt__label {
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--loquix-filter-negative-label-color, var(--loquix-text-secondary-color, #6b7280));
    white-space: nowrap;
  }

  .negative-prompt__input {
    flex: 1;
    padding: 4px 10px;
    border: 1px solid
      var(--loquix-filter-negative-input-border-color, var(--loquix-input-border-color, #d1d5db));
    border-radius: 8px;
    background: var(--loquix-filter-negative-input-bg, var(--loquix-input-bg, #ffffff));
    color: inherit;
    font-family: inherit;
    font-size: 0.8125rem;
    outline: none;
    transition: border-color 0.15s ease;
  }

  .negative-prompt__input:focus {
    border-color: var(--loquix-ai-color, #7c3aed);
  }

  .negative-prompt__input::placeholder {
    color: var(
      --loquix-filter-negative-placeholder-color,
      var(--loquix-text-secondary-color, #9ca3af)
    );
  }

  .negative-prompt__input:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

export default styles;
