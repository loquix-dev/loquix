import { css } from 'lit';

const styles = css`
  :host {
    display: block;
    font-family: var(--loquix-font-family, system-ui, -apple-system, sans-serif);
  }

  .footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    box-sizing: border-box;
    width: 100%;
    padding: var(--loquix-search-footer-padding, 8px 10px);
    border-top: 1px solid var(--loquix-search-footer-border-color, var(--loquix-border-color, #e5e7eb));
    color: var(--loquix-search-footer-color, var(--loquix-text-tertiary-color, #9ca3af));
    font-size: var(--loquix-search-footer-font-size, 0.6875rem);
  }

  .shortcuts {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
    min-width: 0;
  }

  .shortcut {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    white-space: nowrap;
  }

  .key {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 22px;
    height: 22px;
    padding: 0 6px;
    border: 1px solid var(--loquix-search-footer-key-border-color, var(--loquix-border-color, #e5e7eb));
    border-radius: 5px;
    background: var(--loquix-search-footer-key-bg, var(--loquix-surface-bg, #ffffff));
    color: var(--loquix-search-footer-key-color, var(--loquix-text-secondary-color, #6b7280));
    font-family: var(--loquix-code-font-family, ui-monospace, SFMono-Regular, Menlo, monospace);
    font-size: 0.6875rem;
    font-weight: 500;
    line-height: 1;
  }

  .label {
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .actions {
    display: inline-flex;
    align-items: center;
    flex: 0 0 auto;
    gap: 8px;
  }

  .actions ::slotted(*) {
    color: inherit;
  }
`;

export default styles;
