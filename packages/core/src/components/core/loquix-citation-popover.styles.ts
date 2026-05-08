import { css } from 'lit';

const styles = css`
  /* No font-family on :host — citation chip blends with surrounding prose
     (see uncertainty-marker for the same rationale). Tooltip below sets its
     own font since it's a separate positioned popover, not slotted text. */
  :host {
    display: inline;
  }

  .chip {
    position: relative;
    display: inline-flex;
    align-items: baseline;
    margin: 0 1px;
    cursor: pointer;
    vertical-align: baseline;
    border: 0;
    padding: 0;
    background: transparent;
    font: inherit;
  }
  .chip:focus-visible {
    outline: 2px solid var(--loquix-focus-color, var(--loquix-ai-color));
    outline-offset: 2px;
    border-radius: 4px;
  }

  .index {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 18px;
    height: 18px;
    padding: 0 5px;
    border-radius: 4px;
    background: var(--loquix-ai-color-subtle);
    color: var(--loquix-ai-color);
    font-size: 11px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    transition: background 150ms;
    vertical-align: 1px;
  }
  .chip:hover .index,
  .chip[aria-expanded='true'] .index {
    background: var(--loquix-ai-color);
    color: #ffffff;
  }

  .popover {
    position: fixed;
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 10px;
    align-items: start;
    width: 320px;
    padding: 12px;
    background: var(--loquix-surface-bg);
    border: 1px solid var(--loquix-border-color);
    border-radius: 10px;
    box-shadow: var(--loquix-shadow-lg);
    z-index: 9999;
    font-family: var(--loquix-font-family);
    font-size: 13px;
    color: var(--loquix-text-color);
    text-align: left;
    pointer-events: auto;
  }
  .popover[hidden] {
    display: none !important;
  }

  .pop-favicon {
    width: 24px;
    height: 24px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--loquix-overlay-subtle);
    border-radius: 5px;
    overflow: hidden;
  }
  .pop-favicon img {
    width: 16px;
    height: 16px;
    border-radius: 3px;
  }

  .pop-body {
    display: flex;
    flex-direction: column;
    gap: 3px;
    min-width: 0;
  }
  .pop-title {
    font-size: 13px;
    font-weight: 600;
    color: var(--loquix-text-color);
    line-height: 1.3;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .pop-host {
    font-size: 11.5px;
    color: var(--loquix-text-secondary-color);
  }
  .pop-snippet {
    margin-top: 4px;
    font-size: 12px;
    color: var(--loquix-text-secondary-color);
    line-height: 1.45;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .pop-arrow {
    padding-top: 2px;
    opacity: 0.6;
  }
`;

export default styles;
