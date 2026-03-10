import { css } from 'lit';

const styles = css`
  :host {
    display: block;
    width: 100%;
  }

  :host([disabled]) {
    opacity: 0.6;
  }

  .composer {
    display: flex;
    flex-direction: column;
    gap: var(--loquix-composer-gap, 8px);
    padding: var(--loquix-composer-padding, 12px 16px);
    background: var(--loquix-composer-bg, var(--loquix-surface-color, #ffffff));
    border-top: 1px solid var(--loquix-composer-border-color, var(--loquix-border-color, #e2e8f0));
  }

  .toolbar {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  /* Hide empty toolbars to avoid phantom spacing.
     Note: only hide the toolbar itself when empty, NOT slotted children —
     components like attachment-panel render content in shadow DOM and
     appear :empty to CSS even when they have visible content. */
  .toolbar:empty {
    display: none;
  }

  .input-row {
    display: flex;
    align-items: flex-start;
    gap: 8px;
  }

  .input-row ::slotted(*),
  .input-row loquix-prompt-input {
    flex: 1;
    min-width: 0;
  }

  .send-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    box-sizing: border-box;
    width: 43px;
    height: 43px;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    background: var(--loquix-send-button-bg, var(--loquix-ai-color, #7c3aed));
    color: var(--loquix-send-button-color, #ffffff);
    transition:
      opacity var(--loquix-transition-duration, 200ms)
        var(--loquix-transition-easing, cubic-bezier(0.4, 0, 0.2, 1)),
      transform var(--loquix-transition-duration, 200ms)
        var(--loquix-transition-easing, cubic-bezier(0.4, 0, 0.2, 1)),
      background var(--loquix-transition-duration, 200ms)
        var(--loquix-transition-easing, cubic-bezier(0.4, 0, 0.2, 1));
  }

  .send-button:hover:not(:disabled) {
    opacity: 0.85;
    transform: scale(1.05);
  }

  .send-button:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .send-button--stop {
    background: var(--loquix-gen-stop-bg, var(--loquix-error-color, #dc2626));
  }

  .send-button svg {
    width: 18px;
    height: 18px;
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .send-button--stop svg {
    fill: currentColor;
    stroke: none;
  }

  /* === Contained variant (Claude/ChatGPT style) === */

  .composer--contained {
    border-top: none;
    padding: var(--loquix-composer-padding, 12px 16px);
  }

  .composer--contained .container {
    display: flex;
    flex-direction: column;
    border: 1px solid
      var(--loquix-composer-container-border-color, var(--loquix-border-color, #e2e8f0));
    border-radius: var(--loquix-composer-container-border-radius, 16px);
    background: var(--loquix-composer-container-bg, var(--loquix-surface-color, #ffffff));
    overflow: hidden;
    transition:
      border-color 0.15s ease,
      box-shadow 0.15s ease;
  }

  .composer--contained .container:focus-within {
    border-color: var(
      --loquix-composer-container-focus-border-color,
      var(--loquix-ai-color, #7c3aed)
    );
    box-shadow: 0 0 0 2px var(--loquix-input-focus-ring-color, rgba(124, 58, 237, 0.1));
  }

  .composer--contained .container__input {
    padding: 0;
  }

  /* Strip prompt-input borders inside container */
  .composer--contained .container__input loquix-prompt-input {
    --loquix-input-border-color: transparent;
    --loquix-input-focus-border-color: transparent;
    --loquix-input-focus-ring-color: transparent;
    --loquix-input-bg: transparent;
    --loquix-input-border-radius: 0;
  }

  .composer--contained .container__input ::slotted(*) {
    --loquix-input-border-color: transparent;
    --loquix-input-focus-border-color: transparent;
    --loquix-input-focus-ring-color: transparent;
    --loquix-input-bg: transparent;
    --loquix-input-border-radius: 0;
  }

  .actions-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--loquix-actions-bar-padding, 6px 8px);
    gap: 8px;
  }

  .actions-bar__left {
    display: flex;
    align-items: center;
    gap: 4px;
    flex: 1;
    min-width: 0;
  }

  .actions-bar__right {
    display: flex;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
  }

  /* Smaller send button in contained variant */
  .composer--contained .send-button {
    width: 32px;
    height: 32px;
  }

  .composer--contained .send-button svg {
    width: 16px;
    height: 16px;
  }
`;

export default styles;
