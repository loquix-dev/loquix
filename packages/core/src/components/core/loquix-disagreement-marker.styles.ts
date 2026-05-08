import { css } from 'lit';

const styles = css`
  :host {
    display: inline;
    font-family: var(--loquix-font-family);
  }

  :host([variant='banner']) {
    display: block;
  }

  /* Inline pill */
  .pill {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 8px;
    font-size: 11.5px;
    font-weight: 500;
    background: var(--loquix-conf-low-bg);
    color: var(--loquix-conf-low-color);
    border-radius: 999px;
    vertical-align: middle;
  }
  .pill svg {
    flex-shrink: 0;
  }

  /* Banner */
  .banner {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 12px 14px;
    background: var(--loquix-conf-low-bg);
    border: 1px solid color-mix(in srgb, var(--loquix-conf-low-fill) 25%, transparent);
    border-left: 3px solid var(--loquix-conf-low-fill);
    border-radius: 8px;
  }
  .banner__icon {
    color: var(--loquix-conf-low-color);
    flex-shrink: 0;
    margin-top: 1px;
    display: inline-flex;
  }
  .banner__icon svg {
    display: block;
  }
  .banner__body {
    flex: 1;
    min-width: 0;
  }
  .banner__title {
    font-size: 13px;
    font-weight: 600;
    color: var(--loquix-conf-low-color);
  }
  .banner__reason {
    margin-top: 2px;
    font-size: 12.5px;
    color: var(--loquix-text-color);
    line-height: 1.5;
  }
  .banner__resolve {
    appearance: none;
    border: 0;
    background: transparent;
    color: var(--loquix-text-secondary-color);
    font: inherit;
    font-size: 12.5px;
    font-weight: 600;
    padding: 6px 12px;
    border-radius: 6px;
    cursor: pointer;
    transition: background 150ms;
    flex-shrink: 0;
  }
  .banner__resolve:hover {
    background: var(--loquix-overlay-subtle);
    color: var(--loquix-text-color);
  }
`;

export default styles;
