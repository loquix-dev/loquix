import { css } from 'lit';

const styles = css`
  :host {
    display: inline-flex;
  }

  .container {
    display: inline-flex;
    align-items: center;
    gap: var(--loquix-typing-gap, 0.5rem);
    padding: var(--loquix-typing-padding, 0.5rem 0.75rem);
    background: var(--loquix-typing-bg, var(--loquix-surface-secondary-bg, #f9fafb));
    border-radius: var(--loquix-typing-border-radius, var(--loquix-border-radius, 12px));
    font-family: var(--loquix-font-family, sans-serif);
    font-size: var(--loquix-typing-font-size, 0.8125rem);
    color: var(--loquix-typing-text-color, var(--loquix-text-secondary-color, #6b7280));
    line-height: 1.4;
  }

  /* --- Dots variant --- */
  .dots {
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }

  .dot {
    width: var(--loquix-typing-dot-size, 6px);
    height: var(--loquix-typing-dot-size, 6px);
    border-radius: 50%;
    background: var(--loquix-typing-dot-color, var(--loquix-ai-color, #7c3aed));
    animation: loquix-bounce 1.4s ease-in-out infinite both;
  }

  .dot:nth-child(1) {
    animation-delay: 0s;
  }

  .dot:nth-child(2) {
    animation-delay: 0.16s;
  }

  .dot:nth-child(3) {
    animation-delay: 0.32s;
  }

  @keyframes loquix-bounce {
    0%,
    80%,
    100% {
      transform: scale(0);
      opacity: 0.4;
    }
    40% {
      transform: scale(1);
      opacity: 1;
    }
  }

  /* --- Text / Steps variants --- */
  .text {
    color: inherit;
  }
`;

export default styles;
