import { css } from 'lit';

const styles = css`
  :host {
    display: block;
    font-family: var(--loquix-font-family);
  }

  .container {
    border: 1px solid var(--loquix-border-color);
    border-radius: 10px;
    background: var(--loquix-surface-secondary-bg);
    overflow: hidden;
  }

  .header {
    appearance: none;
    border: 0;
    background: transparent;
    width: 100%;
    padding: 10px 12px;
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    color: var(--loquix-text-secondary-color);
    font: inherit;
    font-size: 13px;
    font-weight: 500;
    text-align: left;
  }
  .header:hover {
    background: var(--loquix-overlay-subtle);
  }
  .header:focus-visible {
    outline: 2px solid var(--loquix-focus-color, var(--loquix-ai-color));
    outline-offset: -2px;
  }

  .summary {
    flex: 1;
    min-width: 0;
  }

  .chevron {
    display: flex;
    transition: transform 200ms var(--loquix-transition-easing);
    opacity: 0.6;
  }
  .chevron.is-open {
    transform: rotate(180deg);
  }

  .items {
    padding: 0 8px 8px 8px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  ::slotted(loquix-tool-call) {
    background: var(--loquix-surface-bg);
  }
`;

export default styles;
