import { css } from 'lit';

const styles = css`
  :host {
    display: block;
    font-family: var(--loquix-font-family);
  }

  .container {
    background: var(--loquix-thought-bg);
    border: 1px solid var(--loquix-thought-border-color);
    border-radius: 10px;
    overflow: hidden;
  }
  :host([status='thinking']) .container {
    border-color: color-mix(in srgb, var(--loquix-streaming-color) 30%, transparent);
    background: color-mix(in srgb, var(--loquix-ai-color-subtle) 50%, var(--loquix-thought-bg));
  }

  .header {
    appearance: none;
    border: 0;
    background: transparent;
    width: 100%;
    padding: 10px 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    cursor: pointer;
    color: var(--loquix-thought-text-color);
    font: inherit;
    text-align: left;
  }
  .header:hover {
    background: var(--loquix-overlay-subtle);
  }
  .header:focus-visible {
    outline: 2px solid var(--loquix-focus-color, var(--loquix-ai-color));
    outline-offset: -2px;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }
  .label {
    font-size: 13px;
    font-weight: 500;
    color: var(--loquix-text-color);
  }
  :host([status='thinking']) .label {
    color: var(--loquix-streaming-color);
  }
  .meta {
    font-size: 12px;
    color: var(--loquix-text-secondary-color);
    font-variant-numeric: tabular-nums;
  }

  .chevron {
    display: inline-flex;
    transition: transform 200ms var(--loquix-transition-easing);
  }
  .chevron.is-open {
    transform: rotate(180deg);
  }

  .preview {
    padding: 0 12px 10px 34px;
    font-size: 12.5px;
    color: var(--loquix-text-secondary-color);
    line-height: 1.5;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-style: italic;
  }

  .content {
    padding: 0 12px 12px 34px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .rule {
    height: 1px;
    background: var(--loquix-thought-border-color);
    margin-left: -22px;
    margin-right: -4px;
  }
  .text {
    font-size: 13px;
    line-height: 1.65;
    color: var(--loquix-thought-text-color);
    white-space: pre-wrap;
  }

  .cursor {
    display: inline-block;
    width: 7px;
    height: 14px;
    vertical-align: -2px;
    background: var(--loquix-streaming-color);
    margin-left: 2px;
    animation: lq-blink 1s step-end infinite;
  }

  @keyframes lq-blink {
    0%,
    50% {
      opacity: 1;
    }
    50.01%,
    100% {
      opacity: 0;
    }
  }

  /* Spinner used while thinking */
  .spinner {
    width: 14px;
    height: 14px;
    color: var(--loquix-streaming-color);
    animation: lq-spin 0.9s linear infinite;
  }
  @keyframes lq-spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

export default styles;
