import { css } from 'lit';

const styles = css`
  :host {
    display: block;
    font-family: var(--loquix-font-family, system-ui, -apple-system, sans-serif);
  }

  .container {
    display: flex;
    flex-direction: column;
    gap: var(--loquix-search-results-gap, 4px);
  }

  .empty {
    padding: 16px 12px;
    color: var(--loquix-text-secondary-color, #6b7280);
    font-size: 0.8125rem;
    text-align: center;
  }

  .section {
    overflow: hidden;
    border: 1px solid var(--loquix-search-section-border-color, var(--loquix-border-color, #e5e7eb));
    border-radius: var(--loquix-search-section-border-radius, 10px);
    background: var(--loquix-search-section-bg, var(--loquix-surface-bg, #ffffff));
  }

  .section + .section {
    margin-top: 6px;
  }

  .summary {
    display: flex;
    align-items: center;
    gap: 10px;
    box-sizing: border-box;
    width: 100%;
    min-height: 42px;
    padding: 10px 14px;
    border-bottom: 1px solid var(--loquix-search-section-border-color, var(--loquix-border-color, #e5e7eb));
    background: var(--loquix-search-section-header-bg, var(--loquix-surface-secondary-bg, #f9fafb));
    color: var(--loquix-text-color, #111827);
    cursor: pointer;
    font-size: 0.8125rem;
    font-weight: 600;
    list-style: none;
  }

  .summary::-webkit-details-marker {
    display: none;
  }

  .summary:hover {
    background: var(--loquix-search-section-header-hover-bg, var(--loquix-overlay-subtle, rgba(0, 0, 0, 0.04)));
  }

  .summary:focus-visible {
    outline: 2px solid var(--loquix-focus-color, var(--loquix-ai-color, #7c3aed));
    outline-offset: -2px;
  }

  .source-icon {
    flex: 0 0 auto;
    opacity: 0.9;
  }

  .source-name {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .count,
  .duration {
    color: var(--loquix-text-secondary-color, #6b7280);
    font-size: 0.75rem;
    font-weight: 500;
  }

  .duration {
    margin-left: auto;
    color: var(--loquix-text-tertiary-color, #9ca3af);
    font-variant-numeric: tabular-nums;
  }

  .chevron {
    display: inline-flex;
    transition: transform 160ms ease;
  }

  details[open] .chevron {
    transform: rotate(180deg);
  }

  .items {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 6px;
  }
`;

export default styles;
