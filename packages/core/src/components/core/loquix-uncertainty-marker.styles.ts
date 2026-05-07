import { css } from 'lit';

const styles = css`
  :host {
    display: inline;
    font-family: var(--loquix-font-family);
  }

  .marker {
    position: relative;
    display: inline;
    cursor: help;
    outline: none;
  }
  .marker:focus-visible .text {
    outline: 2px solid var(--loquix-focus-color, var(--loquix-ai-color));
    outline-offset: 2px;
    border-radius: 2px;
  }

  .text {
    color: inherit;
  }

  /* Underline variant */
  .marker--underline .text {
    text-decoration: underline wavy;
    text-decoration-thickness: 1.5px;
    text-underline-offset: 3px;
  }
  .marker--underline.marker--unsure .text {
    text-decoration-color: var(--loquix-uncert-unsure-color);
  }
  .marker--underline.marker--needs-verification .text {
    text-decoration-color: var(--loquix-uncert-verify-color);
  }
  .marker--underline.marker--speculative .text {
    text-decoration-color: var(--loquix-uncert-spec-color);
  }

  /* Highlight variant */
  .marker--highlight .text {
    padding: 0 3px;
    border-radius: 3px;
  }
  .marker--highlight.marker--unsure .text {
    background: var(--loquix-uncert-unsure-bg);
  }
  .marker--highlight.marker--needs-verification .text {
    background: var(--loquix-uncert-verify-bg);
  }
  .marker--highlight.marker--speculative .text {
    background: var(--loquix-uncert-spec-bg);
  }

  /* Icon variant */
  .icon {
    display: inline-flex;
    align-items: center;
    vertical-align: 1px;
    margin-left: 2px;
  }
  .icon svg {
    display: block;
  }
  .marker--icon.marker--unsure .icon {
    color: var(--loquix-uncert-unsure-color);
  }
  .marker--icon.marker--needs-verification .icon {
    color: var(--loquix-uncert-verify-color);
  }
  .marker--icon.marker--speculative .icon {
    color: var(--loquix-uncert-spec-color);
  }

  /* Tooltip — CSS-only positioning, hidden by default */
  .tooltip {
    position: absolute;
    bottom: calc(100% + 6px);
    left: 50%;
    transform: translateX(-50%);
    background: var(--loquix-text-color);
    color: var(--loquix-surface-bg);
    font-family: var(--loquix-font-family);
    font-size: 11.5px;
    font-weight: 500;
    padding: 5px 9px;
    border-radius: 6px;
    white-space: nowrap;
    z-index: 100;
    pointer-events: none;
    box-shadow: var(--loquix-shadow-md);
    opacity: 0;
    transition: opacity 120ms var(--loquix-transition-easing);
  }
  .tooltip.is-open {
    opacity: 1;
  }
  .tooltip::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 4px solid transparent;
    border-top-color: var(--loquix-text-color);
  }
`;

export default styles;
