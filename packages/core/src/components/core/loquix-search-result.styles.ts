import { css } from 'lit';

const styles = css`
  :host {
    display: block;
    font-family: var(--loquix-font-family, system-ui, -apple-system, sans-serif);
  }

  :host([disabled]) {
    opacity: 0.55;
    pointer-events: none;
  }

  .row {
    width: 100%;
    box-sizing: border-box;
    display: flex;
    gap: 12px;
    padding: var(--loquix-search-result-padding, 10px 12px);
    border: 0;
    border-radius: var(--loquix-search-result-border-radius, 8px);
    background: transparent;
    color: inherit;
    font: inherit;
    text-align: left;
    text-decoration-line: none;
    cursor: pointer;
    transition:
      background 120ms ease,
      box-shadow 120ms ease;
  }

  .row:hover {
    background: var(
      --loquix-search-result-hover-bg,
      var(--loquix-overlay-subtle, rgba(0, 0, 0, 0.04))
    );
  }

  .row:focus-visible {
    outline: 2px solid var(--loquix-focus-color, var(--loquix-ai-color, #7c3aed));
    outline-offset: 2px;
  }

  .rank {
    flex: 0 0 22px;
    padding-top: 3px;
    color: var(--loquix-search-result-rank-color, var(--loquix-text-tertiary-color, #9ca3af));
    font-size: 0.6875rem;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }

  .body {
    display: flex;
    flex: 1;
    min-width: 0;
    flex-direction: column;
    gap: 4px;
  }

  .top {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px;
    color: var(--loquix-search-result-meta-color, var(--loquix-text-secondary-color, #6b7280));
    font-size: 0.6875rem;
    line-height: 1.35;
  }

  .source {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    min-width: 0;
    color: var(--loquix-text-color, #111827);
    font-weight: 500;
  }

  .source-icon {
    flex: 0 0 auto;
    opacity: 0.85;
  }

  .sep {
    opacity: 0.45;
  }

  .url {
    max-width: 260px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-family: var(--loquix-code-font-family, ui-monospace, SFMono-Regular, Menlo, monospace);
    font-size: 0.65625rem;
    opacity: 0.74;
  }

  .citation {
    display: inline-flex;
    align-items: center;
    padding: 1px 6px;
    border-radius: 4px;
    background: var(
      --loquix-search-result-citation-bg,
      color-mix(in srgb, var(--loquix-ai-color-subtle, #ede9fe) 70%, transparent)
    );
    color: var(--loquix-search-result-citation-color, var(--loquix-ai-color, #7c3aed));
    font-size: 0.625rem;
    font-weight: 600;
  }

  .title {
    color: var(--loquix-search-result-title-color, var(--loquix-text-color, #111827));
    font-size: var(--loquix-search-result-title-size, 0.875rem);
    font-weight: 600;
    line-height: 1.35;
  }

  .snippet {
    display: -webkit-box;
    overflow: hidden;
    color: var(--loquix-search-result-snippet-color, var(--loquix-text-secondary-color, #6b7280));
    font-size: var(--loquix-search-result-snippet-size, 0.78125rem);
    line-height: 1.5;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: var(--loquix-search-result-snippet-lines, 2);
  }
`;

export default styles;
