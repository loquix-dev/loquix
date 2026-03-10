import { css } from 'lit';

const styles = css`
  :host {
    display: inline-block;
    font-family: var(--loquix-font-family, system-ui, -apple-system, sans-serif);
  }

  .chip {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    box-sizing: border-box;
    padding: var(--loquix-attachment-chip-padding, 6px 10px);
    border: 1px solid var(--loquix-attachment-chip-border-color, rgba(0, 0, 0, 0.08));
    border-radius: var(--loquix-attachment-chip-border-radius, 8px);
    background: var(--loquix-attachment-chip-bg, rgba(0, 0, 0, 0.04));
    color: var(--loquix-attachment-chip-color, inherit);
    font-size: var(--loquix-attachment-chip-font-size, 0.8125rem);
    line-height: 1.4;
    position: relative;
    overflow: hidden;
    max-width: 280px;
    transition:
      border-color 0.15s ease,
      background 0.15s ease;
  }

  .chip--pending {
    border-style: dashed;
  }

  .chip--error {
    border-color: var(--loquix-attachment-chip-error-color, var(--loquix-error-color, #dc2626));
  }

  /* === Icon / Preview === */

  .chip__icon {
    flex-shrink: 0;
    font-size: 1rem;
    line-height: 1;
  }

  .chip__icon ::slotted(*) {
    display: block;
    width: var(--loquix-attachment-chip-preview-size, 28px);
    height: var(--loquix-attachment-chip-preview-size, 28px);
    object-fit: cover;
    border-radius: var(--loquix-attachment-chip-preview-radius, 4px);
  }

  .chip__preview {
    display: block;
    width: var(--loquix-attachment-chip-preview-size, 28px);
    height: var(--loquix-attachment-chip-preview-size, 28px);
    object-fit: cover;
    border-radius: var(--loquix-attachment-chip-preview-radius, 4px);
  }

  /* === Content === */

  .chip__content {
    flex: 1;
    min-width: 0;
  }

  .chip__filename {
    display: block;
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .chip__meta {
    display: block;
    font-size: 0.6875rem;
    color: var(--loquix-attachment-chip-meta-color, rgba(0, 0, 0, 0.62));
    white-space: nowrap;
  }

  /* === Status badge in meta === */

  .chip__status {
    font-weight: 500;
    color: var(--loquix-attachment-chip-status-color, rgba(0, 0, 0, 0.62));
  }

  /* === Progress bar === */

  .chip__progress {
    position: absolute;
    bottom: 1px;
    left: 1px;
    right: 1px;
    height: var(--loquix-attachment-chip-progress-height, 2px);
    background: var(--loquix-attachment-chip-progress-color, var(--loquix-ai-color, #7c3aed));
    width: var(--progress, 0%);
    transition: width 0.2s ease;
    border-radius: 0 var(--loquix-attachment-chip-progress-height, 2px)
      var(--loquix-attachment-chip-progress-height, 2px) 0;
    overflow: hidden;
  }

  /* Sweep highlight moving left→right across the determinate progress bar */
  .chip__progress::after {
    content: '';
    position: absolute;
    inset: 0;
    background: var(
      --loquix-attachment-chip-progress-sweep-bg,
      linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.35) 50%, transparent 100%)
    );
    animation: var(--loquix-attachment-chip-progress-sweep, chip-sweep 1.6s ease-in-out infinite);
  }

  @keyframes chip-sweep {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(100%);
    }
  }

  /* Indeterminate shimmer when uploading at 0% — neutral color to avoid jarring jump */
  .chip__progress--indeterminate {
    width: auto;
    background: var(--loquix-attachment-chip-shimmer-bg, rgba(0, 0, 0, 0.12));
    border-radius: 0;
    animation: chip-shimmer 1.8s ease-in-out infinite;
  }

  /* No sweep on indeterminate — it already pulses */
  .chip__progress--indeterminate::after {
    animation: none;
    background: none;
  }

  @keyframes chip-shimmer {
    0%,
    100% {
      opacity: 0.3;
    }
    50% {
      opacity: 1;
    }
  }

  /* === Error icon (tooltip trigger) === */

  .chip__error-icon {
    flex-shrink: 0;
    width: 14px;
    height: 14px;
    color: var(--loquix-attachment-chip-error-color, var(--loquix-error-color, #dc2626));
    cursor: help;
    outline: none;
    border-radius: 50%;
  }

  .chip__error-icon:focus-visible {
    outline: 2px solid var(--loquix-attachment-chip-error-color, var(--loquix-error-color, #dc2626));
    outline-offset: 2px;
  }

  /* === Error tooltip (Popover API) === */

  .chip__error-tooltip {
    position: fixed;
    transform: translateX(-50%) translateY(-100%);
    margin: 0;
    padding: 4px 10px;
    border: none;
    border-radius: 6px;
    background: var(--loquix-attachment-chip-error-color, var(--loquix-error-color, #dc2626));
    color: #fff;
    font-family: inherit;
    font-size: 0.6875rem;
    font-weight: 500;
    line-height: 1.4;
    white-space: nowrap;
    max-width: 260px;
    overflow: hidden;
    text-overflow: ellipsis;
    pointer-events: none;
    z-index: 1;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }

  /* Arrow */
  .chip__error-tooltip::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 5px solid transparent;
    border-top-color: var(--loquix-attachment-chip-error-color, var(--loquix-error-color, #dc2626));
  }

  /* === Retry button === */

  .chip__retry {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    padding: 0;
    border: none;
    border-radius: 4px;
    background: transparent;
    color: var(--loquix-attachment-chip-error-color, var(--loquix-error-color, #dc2626));
    cursor: pointer;
    flex-shrink: 0;
    opacity: 0.8;
    transition:
      opacity 0.15s ease,
      background 0.15s ease;
  }

  .chip__retry:hover {
    opacity: 1;
    background: rgba(220, 38, 38, 0.1);
  }

  .chip__retry:focus-visible {
    outline: 2px solid var(--loquix-attachment-chip-error-color, var(--loquix-error-color, #dc2626));
    outline-offset: 2px;
  }

  .chip__retry svg {
    width: 12px;
    height: 12px;
  }

  /* === Remove button === */

  .chip__remove {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    padding: 0;
    border: none;
    border-radius: 4px;
    background: transparent;
    color: inherit;
    cursor: pointer;
    flex-shrink: 0;
    opacity: 0.65;
    transition:
      opacity 0.15s ease,
      background 0.15s ease;
  }

  .chip__remove:hover {
    opacity: 1;
    background: rgba(128, 128, 128, 0.15);
  }

  .chip__remove:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 2px;
  }

  .chip__remove svg {
    width: 12px;
    height: 12px;
  }
`;

export default styles;
