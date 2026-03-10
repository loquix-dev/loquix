import { css } from 'lit';

const styles = css`
  :host {
    display: inline-flex;
  }

  :host([disabled]) {
    pointer-events: none;
    opacity: 0.4;
  }

  :host([editing]) {
    display: block;
    width: 100%;
  }

  /* ── Trigger button ── */

  .trigger {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: var(--loquix-action-size, 28px);
    height: var(--loquix-action-size, 28px);
    padding: 0;
    border: none;
    border-radius: var(--loquix-action-border-radius, 6px);
    background: var(--loquix-action-bg, transparent);
    color: var(
      --loquix-edit-icon-color,
      var(--loquix-action-color, var(--loquix-text-secondary-color, #6b7280))
    );
    cursor: pointer;
    transition:
      background var(--loquix-transition-duration, 200ms)
        var(--loquix-transition-easing, cubic-bezier(0.4, 0, 0.2, 1)),
      color var(--loquix-transition-duration, 200ms)
        var(--loquix-transition-easing, cubic-bezier(0.4, 0, 0.2, 1));
  }

  .trigger:hover {
    background: var(--loquix-action-hover-bg, var(--loquix-surface-secondary-bg, #f9fafb));
    color: var(
      --loquix-edit-icon-color-hover,
      var(--loquix-action-hover-color, var(--loquix-text-color, #111827))
    );
  }

  .trigger:focus-visible {
    outline: 2px solid var(--loquix-input-focus-color, #7c3aed);
    outline-offset: 1px;
  }

  .trigger svg,
  .trigger ::slotted(svg) {
    width: var(--loquix-edit-icon-size, 16px);
    height: var(--loquix-edit-icon-size, 16px);
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  /* ── Inline editor ── */

  .editor {
    display: flex;
    flex-direction: column;
  }

  .textarea {
    display: block;
    width: 100%;
    min-height: var(--loquix-edit-textarea-min-height, 60px);
    max-height: var(--loquix-edit-textarea-max-height, 300px);
    padding: var(--loquix-edit-padding, 8px 10px);
    border: 1px solid var(--loquix-edit-border-color, var(--loquix-border-color, #d1d5db));
    border-radius: var(--loquix-edit-border-radius, 8px);
    background: var(--loquix-edit-textarea-bg, var(--loquix-surface-color, #fff));
    color: var(--loquix-text-color, #1e293b);
    font-family: inherit;
    font-size: inherit;
    line-height: 1.5;
    resize: none;
    overflow-y: auto;
    box-sizing: border-box;
    transition: border-color var(--loquix-transition-duration, 200ms)
      var(--loquix-transition-easing, cubic-bezier(0.4, 0, 0.2, 1));
  }

  .textarea:focus {
    outline: none;
    border-color: var(
      --loquix-edit-focus-color,
      var(--loquix-input-focus-color, var(--loquix-ai-color, #7c3aed))
    );
  }

  .textarea::placeholder {
    color: var(--loquix-text-muted-color, #94a3b8);
  }

  ::slotted([slot='editor-footer']) {
    margin-top: 6px;
    font-size: 0.75rem;
    color: var(--loquix-text-muted-color, #94a3b8);
  }

  .editor-actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: var(--loquix-edit-button-gap, 8px);
    margin-top: 8px;
  }

  .cancel-btn {
    padding: 6px 14px;
    border: 1px solid var(--loquix-border-color, #e2e8f0);
    border-radius: 6px;
    background: var(--loquix-surface-color, #fff);
    color: var(--loquix-text-color, #374151);
    font-family: inherit;
    font-size: 0.8125rem;
    font-weight: 500;
    cursor: pointer;
    transition:
      background var(--loquix-transition-duration, 200ms)
        var(--loquix-transition-easing, cubic-bezier(0.4, 0, 0.2, 1)),
      border-color var(--loquix-transition-duration, 200ms)
        var(--loquix-transition-easing, cubic-bezier(0.4, 0, 0.2, 1));
  }

  .cancel-btn:hover {
    background: var(--loquix-surface-secondary-bg, #f3f4f6);
    border-color: var(--loquix-border-color-hover, #d1d5db);
  }

  .submit-btn {
    padding: 6px 16px;
    border: none;
    border-radius: 6px;
    background: var(--loquix-ai-color, #7c3aed);
    color: #fff;
    font-family: inherit;
    font-size: 0.8125rem;
    font-weight: 500;
    cursor: pointer;
    transition:
      background var(--loquix-transition-duration, 200ms)
        var(--loquix-transition-easing, cubic-bezier(0.4, 0, 0.2, 1)),
      opacity var(--loquix-transition-duration, 200ms)
        var(--loquix-transition-easing, cubic-bezier(0.4, 0, 0.2, 1));
  }

  .submit-btn:hover:not(:disabled) {
    background: var(--loquix-ai-color-hover, #6d28d9);
  }

  .submit-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* ── Composer editing badge ── */

  .editing-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 12px;
    border-radius: 9999px;
    background: var(--loquix-edit-highlight-color, var(--loquix-ai-color, #7c3aed));
    color: #fff;
    font-size: 0.75rem;
    font-weight: 500;
  }

  .editing-badge svg {
    width: 12px;
    height: 12px;
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
`;

export default styles;
