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
    gap: 10px;
    width: 100%;
    box-sizing: border-box;
    padding: var(--loquix-search-answer-padding, 14px);
    border: 1px solid
      var(
        --loquix-search-answer-border-color,
        color-mix(in srgb, var(--loquix-ai-color, #7c3aed) 18%, var(--loquix-border-color, #e5e7eb))
      );
    border-radius: var(--loquix-search-answer-radius, 10px);
    background: var(
      --loquix-search-answer-bg,
      color-mix(
        in srgb,
        var(--loquix-ai-color-subtle, #ede9fe) 30%,
        var(--loquix-surface-bg, #ffffff)
      )
    );
    color: var(--loquix-search-answer-color, var(--loquix-text-color, #111827));
  }

  .header {
    display: flex;
    align-items: center;
    gap: 7px;
    min-width: 0;
  }

  .icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    width: 21px;
    height: 21px;
    border-radius: 7px;
    background: var(--loquix-search-answer-icon-bg, var(--loquix-ai-color, #7c3aed));
    color: var(--loquix-search-answer-icon-color, #ffffff);
  }

  .title {
    min-width: 0;
    overflow: hidden;
    color: var(--loquix-search-answer-title-color, var(--loquix-text-color, #111827));
    font-size: var(--loquix-search-answer-title-font-size, 0.8125rem);
    font-weight: 700;
    line-height: 1.3;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .body {
    display: flex;
    flex-direction: column;
    gap: 8px;
    color: var(--loquix-search-answer-body-color, var(--loquix-text-secondary-color, #374151));
    font-size: var(--loquix-search-answer-body-font-size, 0.875rem);
    line-height: 1.55;
  }

  .generating {
    display: inline-flex;
    align-items: center;
    min-height: 24px;
  }

  .generating loquix-typing-indicator {
    --loquix-typing-bg: transparent;
    --loquix-typing-padding: 0;
    --loquix-typing-dot-size: 5px;
  }

  .body ::slotted(p) {
    margin: 0 0 0.65em;
  }

  .body ::slotted(p:last-child) {
    margin-bottom: 0;
  }

  .footer {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 12px;
    min-width: 0;
    padding-top: 2px;
  }

  .footer-left {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    min-width: 0;
  }

  .meta {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    flex: 0 1 auto;
    min-width: 0;
    overflow: hidden;
    color: var(--loquix-search-answer-meta-color, var(--loquix-text-tertiary-color, #6b7280));
    font-size: 0.75rem;
    line-height: 1.3;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .dot {
    color: var(--loquix-search-answer-separator-color, var(--loquix-border-strong-color, #d1d5db));
  }

  .sources {
    display: inline-flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px;
    min-width: 0;
  }

  .source {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    flex: 0 1 auto;
    min-width: 0;
    max-width: 180px;
    box-sizing: border-box;
    padding: 2px 6px 2px 3px;
    border: 1px solid
      var(--loquix-search-answer-source-border-color, var(--loquix-border-color, #e5e7eb));
    border-radius: 999px;
    background: var(--loquix-search-answer-source-bg, rgba(255, 255, 255, 0.72));
    color: var(--loquix-search-answer-source-color, var(--loquix-text-secondary-color, #4b5563));
    font-size: 0.75rem;
    line-height: 1;
  }

  .source-title {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .actions {
    display: inline-flex;
    align-items: center;
    justify-content: flex-end;
    flex: 0 0 auto;
    gap: 6px;
  }

  .action {
    appearance: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    min-height: 26px;
    padding: 0 8px;
    border: 1px solid
      var(--loquix-search-answer-action-border-color, var(--loquix-border-color, #e5e7eb));
    border-radius: 7px;
    background: var(--loquix-search-answer-action-bg, rgba(255, 255, 255, 0.78));
    color: var(--loquix-search-answer-action-color, var(--loquix-text-secondary-color, #4b5563));
    font: inherit;
    font-size: 0.75rem;
    font-weight: 600;
    line-height: 1;
    cursor: pointer;
  }

  .action:hover {
    border-color: var(
      --loquix-search-answer-action-hover-border-color,
      color-mix(in srgb, var(--loquix-ai-color, #7c3aed) 22%, var(--loquix-border-color, #e5e7eb))
    );
    color: var(--loquix-search-answer-action-hover-color, var(--loquix-ai-color, #7c3aed));
  }

  .action:focus-visible {
    outline: 2px solid var(--loquix-focus-color, var(--loquix-ai-color, #7c3aed));
    outline-offset: 2px;
  }

  .action svg {
    display: block;
    flex: 0 0 auto;
  }

  @media (max-width: 520px) {
    .footer {
      align-items: flex-start;
      flex-direction: column;
    }

    .actions {
      justify-content: flex-start;
    }
  }
`;

export default styles;
