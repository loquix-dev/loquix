import { css } from 'lit';

const styles = css`
  :host {
    display: block;
    width: 100%;
    font-family: var(--loquix-font-family, system-ui, -apple-system, sans-serif);
  }

  .container {
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
    box-sizing: border-box;
    color: var(--loquix-search-sources-color, var(--loquix-text-secondary-color, #4b5563));
  }

  .header {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
    font-size: var(--loquix-search-sources-header-font-size, 0.8125rem);
    line-height: 1.4;
  }

  .headline {
    min-width: 0;
    overflow: hidden;
    color: var(--loquix-search-sources-headline-color, var(--loquix-text-color, #111827));
    font-weight: 600;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .running-count {
    flex: 0 0 auto;
    margin-inline-start: auto;
    color: var(--loquix-search-sources-count-color, var(--loquix-text-secondary-color, #4b5563));
    font-size: 0.75rem;
  }

  .search-icon,
  .spinner,
  .mini-spinner {
    display: inline-flex;
    box-sizing: border-box;
    flex: 0 0 auto;
  }

  .search-icon {
    width: 15px;
    height: 15px;
    color: var(--loquix-search-sources-icon-color, var(--loquix-ai-color, #7c3aed));
  }

  .spinner {
    width: 13px;
    height: 13px;
    border: 2px solid color-mix(in srgb, var(--loquix-ai-color, #7c3aed) 22%, transparent);
    border-top-color: var(--loquix-ai-color, #7c3aed);
    border-radius: 999px;
    animation: spin 800ms linear infinite;
  }

  .list {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 7px;
    min-width: 0;
  }

  .pill {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    flex: 0 0 auto;
    min-height: 26px;
    max-width: 100%;
    box-sizing: border-box;
    padding: 4px 8px;
    border: 1px solid
      var(--loquix-search-sources-pill-border-color, var(--loquix-border-color, #e5e7eb));
    border-radius: var(--loquix-search-sources-pill-radius, 999px);
    background: var(--loquix-search-sources-pill-bg, var(--loquix-surface-bg, #ffffff));
    color: var(--loquix-search-sources-pill-color, var(--loquix-text-secondary-color, #4b5563));
    font: inherit;
    font-size: var(--loquix-search-sources-pill-font-size, 0.75rem);
    line-height: 1;
  }

  button.pill {
    cursor: pointer;
  }

  button.pill:hover {
    border-color: var(
      --loquix-search-sources-pill-hover-border-color,
      color-mix(in srgb, var(--loquix-ai-color, #7c3aed) 26%, var(--loquix-border-color, #e5e7eb))
    );
    background: var(
      --loquix-search-sources-pill-hover-bg,
      color-mix(
        in srgb,
        var(--loquix-ai-color-subtle, #ede9fe) 34%,
        var(--loquix-surface-bg, #ffffff)
      )
    );
  }

  button.pill:focus-visible {
    outline: 2px solid var(--loquix-focus-color, var(--loquix-ai-color, #7c3aed));
    outline-offset: 2px;
  }

  .pill.is-active {
    border-color: var(--loquix-search-sources-active-border-color, var(--loquix-ai-color, #7c3aed));
    background: var(--loquix-search-sources-active-bg, var(--loquix-ai-color, #7c3aed));
    color: var(--loquix-search-sources-active-color, #ffffff);
  }

  button.pill.is-active:hover {
    border-color: var(--loquix-search-sources-active-border-color, var(--loquix-ai-color, #7c3aed));
    background: var(
      --loquix-search-sources-active-hover-bg,
      var(--loquix-search-sources-active-bg, var(--loquix-ai-color, #7c3aed))
    );
    color: var(--loquix-search-sources-active-color, #ffffff);
  }

  .pill.is-running {
    border-color: var(
      --loquix-search-sources-running-border-color,
      color-mix(in srgb, var(--loquix-ai-color, #7c3aed) 24%, var(--loquix-border-color, #e5e7eb))
    );
  }

  .pill.is-error {
    border-color: var(--loquix-search-sources-error-border-color, #fecaca);
    background: var(--loquix-search-sources-error-bg, #fff7f7);
    color: var(--loquix-search-sources-error-color, #991b1b);
  }

  .icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    width: 17px;
    height: 17px;
    border-radius: 5px;
    background: var(
      --loquix-search-sources-icon-bg,
      color-mix(in srgb, currentColor 10%, transparent)
    );
    font-size: 0.6875rem;
    font-weight: 700;
    line-height: 1;
  }

  .name {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .count,
  .status {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    min-width: 17px;
    height: 17px;
    padding: 0 5px;
    border-radius: 999px;
    background: var(--loquix-search-sources-count-bg, rgba(17, 24, 39, 0.08));
    color: inherit;
    font-size: 0.6875rem;
    font-weight: 700;
    line-height: 1;
  }

  .pill.is-active .count {
    background: rgba(17, 24, 39, 0.2);
  }

  .mini-spinner {
    width: 11px;
    height: 11px;
    border: 2px solid color-mix(in srgb, currentColor 22%, transparent);
    border-top-color: currentColor;
    border-radius: 999px;
    animation: spin 800ms linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

export default styles;
