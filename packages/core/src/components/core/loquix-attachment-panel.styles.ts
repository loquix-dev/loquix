import { css } from 'lit';

const styles = css`
  :host {
    display: block;
    font-family: var(--loquix-font-family, system-ui, -apple-system, sans-serif);
  }

  /* === Panel container === */

  .panel {
    position: relative;
    border-radius: var(--loquix-attachment-panel-border-radius, 12px);
    background: var(--loquix-attachment-panel-bg, transparent);
    transition:
      border-color 0.15s ease,
      background 0.15s ease;
  }

  .panel--drag-over {
    background: var(--loquix-attachment-panel-drop-bg, rgba(124, 58, 237, 0.06));
    border-color: var(--loquix-attachment-panel-drop-border-color, var(--loquix-ai-color, #7c3aed));
  }

  /* === Chips grid === */

  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: var(--loquix-attachment-panel-gap, 8px);
    padding: var(--loquix-attachment-panel-padding, 8px);
  }

  /* === Trigger button === */

  .trigger {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: var(--loquix-attachment-trigger-padding, 6px 12px);
    border: 1px dashed var(--loquix-attachment-trigger-border-color, rgba(0, 0, 0, 0.15));
    border-radius: 8px;
    background: var(--loquix-attachment-trigger-bg, transparent);
    color: var(--loquix-attachment-trigger-color, var(--loquix-text-secondary-color, #4b5563));
    font-family: inherit;
    font-size: 0.8125rem;
    cursor: pointer;
    transition:
      background 0.15s ease,
      border-color 0.15s ease;
    margin: var(--loquix-attachment-panel-padding, 8px);
  }

  .trigger:hover:not(:disabled) {
    background: var(--loquix-attachment-trigger-hover-bg, rgba(0, 0, 0, 0.04));
    border-color: var(--loquix-attachment-trigger-hover-border-color, rgba(0, 0, 0, 0.25));
  }

  .trigger:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .trigger__icon {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }

  /* === Drop overlay === */

  .drop-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--loquix-attachment-panel-border-radius, 12px);
    background: var(--loquix-attachment-panel-drop-bg, rgba(124, 58, 237, 0.08));
    border: 2px dashed
      var(--loquix-attachment-panel-drop-border-color, var(--loquix-ai-color, #7c3aed));
    color: var(--loquix-ai-color, #7c3aed);
    font-size: 0.875rem;
    font-weight: 500;
    pointer-events: none;
    z-index: 1;
  }

  /* === Hidden file input === */

  .file-input {
    display: none;
  }
`;

export default styles;
