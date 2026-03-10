import { css } from 'lit';

const styles = css`
  :host {
    display: block;
    font-size: var(--loquix-message-font-size, 0.9375rem);
    line-height: var(--loquix-message-line-height, 1.6);
    font-family: var(--loquix-font-family, sans-serif);
    color: var(--loquix-text-color, #111827);
    word-break: break-word;
  }

  /* ── Text content ── */

  .content {
    position: relative;
  }

  /* ── Code block ── */

  .code-block {
    font-family: var(--loquix-code-font-family, 'Fira Code', 'Cascadia Code', monospace);
    font-size: var(--loquix-code-font-size, 0.875em);
    line-height: var(--loquix-code-line-height, 1.5);
    background: var(--loquix-surface-secondary-bg, #f4f4f8);
    border-radius: var(--loquix-code-border-radius, 8px);
    padding: var(--loquix-code-padding, 12px 16px);
    overflow-x: auto;
    margin: 0;
    white-space: pre;
    tab-size: 2;
  }

  .code-block code {
    font-family: inherit;
    background: none;
    padding: 0;
    border-radius: 0;
  }

  /* ── Streaming: inline last slotted element only when cursor is visible ── */

  :host([streaming][streaming-cursor]:not([streaming-cursor='none'])) ::slotted(*:last-child) {
    display: inline;
  }

  /* ── Streaming cursor variants ── */

  .streaming-cursor {
    display: inline-block;
    margin-left: 2px;
    vertical-align: text-bottom;
  }

  /* Caret: thin blinking line (|) */
  .streaming-cursor.caret {
    width: 2px;
    height: 1lh;
    background: var(--loquix-cursor-color, currentColor);
    animation: loquix-blink 1s step-end infinite;
  }

  /* Block: solid pulsing rectangle — ChatGPT-style */
  .streaming-cursor.block {
    width: 0.5em;
    height: 1lh;
    background: var(--loquix-cursor-color, currentColor);
    border-radius: 1px;
    animation: loquix-pulse 1.2s ease-in-out infinite;
  }

  @keyframes loquix-blink {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0;
    }
  }

  @keyframes loquix-pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.3;
    }
  }

  /* ── Accessibility: reduce motion ── */
  @media (prefers-reduced-motion: reduce) {
    .streaming-cursor {
      animation: none;
      opacity: 0.7;
    }
  }
`;

export default styles;
