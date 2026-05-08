import { css } from 'lit';

const styles = css`
  :host {
    display: block;
    font-family: var(--loquix-font-family);
  }

  .container {
    margin: 12px 0;
  }

  .header {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 8px;
    font-size: 12px;
    font-weight: 600;
    color: var(--loquix-text-secondary-color);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
  .header svg {
    width: 13px;
    height: 13px;
  }

  .items {
    display: grid;
    gap: 8px;
  }
  :host([layout='grid']) .items {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }
  :host([layout='list']) .items {
    grid-template-columns: 1fr;
    gap: 6px;
  }

  .source {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 10px 12px;
    border: 1px solid var(--loquix-border-color);
    border-radius: 8px;
    background: var(--loquix-surface-bg);
    text-decoration: none;
    color: inherit;
    transition: all 150ms;
  }
  a.source:hover {
    border-color: var(--loquix-ai-color);
    background: color-mix(in srgb, var(--loquix-ai-color-subtle) 30%, var(--loquix-surface-bg));
    transform: translateY(-1px);
    box-shadow: var(--loquix-shadow-sm);
  }
  a.source:focus-visible {
    outline: 2px solid var(--loquix-focus-color, var(--loquix-ai-color));
    outline-offset: 2px;
  }

  .source-top {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    color: var(--loquix-text-secondary-color);
  }
  .source-index {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    padding: 0 4px;
    background: var(--loquix-ai-color-subtle);
    color: var(--loquix-ai-color);
    font-weight: 600;
    border-radius: 4px;
    font-variant-numeric: tabular-nums;
  }
  .source-host {
    flex: 1;
    font-size: 11.5px;
  }
  .source-title {
    font-size: 13px;
    font-weight: 600;
    color: var(--loquix-text-color);
    line-height: 1.35;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .source-snippet {
    font-size: 12px;
    color: var(--loquix-text-secondary-color);
    line-height: 1.45;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`;

export default styles;
