import { css } from 'lit';

const styles = css`
  :host {
    display: block;
    font-family: var(--loquix-font-family);
  }

  .container {
    background: var(--loquix-tool-bg);
    border: 1px solid var(--loquix-border-color);
    border-radius: 10px;
    overflow: hidden;
    transition: border-color 200ms;
  }
  :host([status='running']) .container {
    border-color: color-mix(in srgb, var(--loquix-streaming-color) 35%, transparent);
  }
  :host([status='error']) .container {
    border-color: color-mix(in srgb, var(--loquix-error-color) 35%, transparent);
  }

  .header {
    appearance: none;
    border: 0;
    background: transparent;
    width: 100%;
    padding: 10px 12px;
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 10px;
    align-items: center;
    cursor: pointer;
    color: var(--loquix-text-color);
    font: inherit;
    text-align: left;
  }
  :host([compact]) .header {
    padding: 6px 10px;
  }
  .header:hover {
    background: var(--loquix-overlay-subtle);
  }
  .header:focus-visible {
    outline: 2px solid var(--loquix-focus-color, var(--loquix-ai-color));
    outline-offset: -2px;
  }

  .icon-wrap {
    width: 26px;
    height: 26px;
    border-radius: 6px;
    background: var(--loquix-overlay-subtle);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--loquix-text-secondary-color);
  }
  :host([status='running']) .icon-wrap {
    background: var(--loquix-ai-color-subtle);
  }
  :host([status='error']) .icon-wrap {
    background: var(--loquix-tool-error-bg);
    color: var(--loquix-error-color);
  }
  .icon-wrap svg {
    width: 14px;
    height: 14px;
  }

  .name-wrap {
    display: flex;
    align-items: baseline;
    gap: 8px;
    min-width: 0;
  }
  .name-text {
    font-family: var(--loquix-code-font-family);
    font-size: 13px;
    font-weight: 600;
    color: var(--loquix-text-color);
    white-space: nowrap;
  }
  .arg-summary {
    display: flex;
    align-items: baseline;
    gap: 8px;
    min-width: 0;
    overflow: hidden;
    font-size: 12px;
    color: var(--loquix-text-secondary-color);
    font-family: var(--loquix-code-font-family);
  }
  .arg {
    display: inline-flex;
    gap: 3px;
    min-width: 0;
  }
  .arg-key {
    color: var(--loquix-text-secondary-color);
  }
  .arg-val {
    color: var(--loquix-text-color);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 200px;
  }
  .arg-more {
    font-size: 11px;
    opacity: 0.7;
  }

  .right {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }
  .duration {
    font-size: 11.5px;
    color: var(--loquix-text-secondary-color);
    font-variant-numeric: tabular-nums;
  }

  .status {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    font-size: 11px;
    font-weight: 600;
    padding: 2px 7px;
    border-radius: 999px;
    letter-spacing: 0.02em;
  }
  .status--pending {
    color: var(--loquix-text-secondary-color);
    background: var(--loquix-overlay-subtle);
  }
  .status--running {
    color: var(--loquix-streaming-color);
    background: var(--loquix-ai-color-subtle);
  }
  .status--success {
    color: var(--loquix-success-color);
    background: var(--loquix-tool-success-bg);
  }
  .status--error {
    color: var(--loquix-error-color);
    background: var(--loquix-tool-error-bg);
  }

  .chevron {
    display: flex;
    transition: transform 200ms var(--loquix-transition-easing);
    opacity: 0.6;
  }
  .chevron.is-open {
    transform: rotate(180deg);
  }

  .body {
    padding: 0 12px 12px 12px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    border-top: 1px solid var(--loquix-border-color);
    margin-top: -1px;
  }
  .section {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding-top: 10px;
  }
  .section-label {
    font-size: 10.5px;
    font-weight: 600;
    letter-spacing: 0.06em;
    color: var(--loquix-text-secondary-color);
    text-transform: uppercase;
  }
  .section-label--error {
    color: var(--loquix-error-color);
  }
  pre.code {
    font-family: var(--loquix-code-font-family);
    font-size: 12px;
    line-height: 1.5;
    background: var(--loquix-surface-secondary-bg);
    border: 1px solid var(--loquix-border-color);
    border-radius: 6px;
    padding: 8px 10px;
    margin: 0;
    white-space: pre-wrap;
    word-break: break-word;
    color: var(--loquix-text-color);
    max-height: 280px;
    overflow: auto;
  }
  pre.code--result {
    background: var(--loquix-tool-result-bg);
    border-color: var(--loquix-tool-result-border);
  }
  pre.code--error {
    background: var(--loquix-tool-error-bg);
    border-color: var(--loquix-tool-error-border);
    color: var(--loquix-error-color);
  }

  .spinner {
    animation: lq-spin 0.9s linear infinite;
  }
  @keyframes lq-spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

export default styles;
