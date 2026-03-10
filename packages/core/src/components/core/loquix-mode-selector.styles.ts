import { css } from 'lit';

const styles = css`
  :host {
    display: inline-flex;
    max-width: 100%;
    font-family: var(--loquix-font-family, system-ui, -apple-system, sans-serif);
    position: relative;
  }

  /* =========================================
   * Tabs variant
   * ========================================= */

  .tabs {
    display: inline-flex;
    align-items: stretch;
    gap: var(--loquix-mode-tab-gap, 4px);
    padding: 2px;
    border-radius: var(--loquix-mode-tab-radius, 8px);
    background: var(--loquix-mode-tabs-bg, transparent);
    max-width: 100%;
    overflow-x: auto;
    scrollbar-width: none;
  }

  .tabs::-webkit-scrollbar {
    display: none;
  }

  .tab {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: var(--loquix-mode-tab-padding, 6px 14px);
    border: none;
    border-radius: var(--loquix-mode-tab-radius, 8px);
    background: var(--loquix-mode-tab-bg, transparent);
    color: var(--loquix-mode-tab-color, var(--loquix-text-secondary-color, #6b7280));
    font-family: inherit;
    font-size: var(--loquix-mode-tab-font-size, 0.8125rem);
    font-weight: 500;
    cursor: pointer;
    white-space: nowrap;
    transition: background 0.15s ease, color 0.15s ease;
    line-height: 1.4;
  }

  .tab:hover:not(:disabled) {
    background: var(--loquix-mode-tab-hover-bg, rgba(0, 0, 0, 0.04));
  }

  .tab--active {
    background: var(--loquix-mode-tab-active-bg, var(--loquix-ai-color-subtle, #ede9fe));
    color: var(--loquix-mode-tab-active-color, var(--loquix-ai-color, #7c3aed));
  }

  .tab--active:hover:not(:disabled) {
    background: var(--loquix-mode-tab-active-bg, var(--loquix-ai-color-subtle, #ede9fe));
  }

  .tab:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .tab:focus-visible {
    outline: 2px solid var(--loquix-ai-color, #7c3aed);
    outline-offset: -2px;
  }

  .tab__icon {
    flex-shrink: 0;
    font-size: 1rem;
    line-height: 1;
  }

  .tab__label {
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .tab__text {
    display: contents;
  }

  .tab__description {
    font-size: 0.6875rem;
    font-weight: 400;
    color: var(--loquix-mode-tab-description-color, rgba(0, 0, 0, 0.65));
  }

  /* =========================================
   * Stacked variant (description below label)
   * ========================================= */

  :host([stacked]) .tab__text {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 1px;
  }

  :host([stacked]) .tab {
    text-align: left;
  }

  :host([stacked]) .tab__description {
    line-height: 1.3;
  }

  /* =========================================
   * Pills variant (extends tabs)
   * ========================================= */

  :host([variant='pills']) .tabs {
    gap: var(--loquix-mode-tab-gap, 6px);
  }

  :host([variant='pills']) .tab {
    border-radius: var(--loquix-mode-pill-radius, 9999px);
    padding: var(--loquix-mode-tab-padding, 5px 14px);
    border: 1px solid var(--loquix-mode-pill-border-color, rgba(0, 0, 0, 0.08));
    background: var(--loquix-mode-tab-bg, transparent);
  }

  :host([variant='pills']) .tab--active {
    border-color: var(--loquix-mode-tab-active-color, var(--loquix-ai-color, #7c3aed));
  }

  /* =========================================
   * Toggle variant
   * ========================================= */

  .toggle {
    display: inline-flex;
    align-items: center;
    padding: var(--loquix-mode-toggle-padding, 3px);
    border-radius: var(--loquix-mode-toggle-radius, 10px);
    background: var(--loquix-mode-toggle-bg, var(--loquix-surface-secondary-bg, #f3f4f6));
  }

  .toggle__option {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: var(--loquix-mode-tab-padding, 6px 14px);
    border: none;
    border-radius: calc(var(--loquix-mode-toggle-radius, 10px) - 2px);
    background: transparent;
    color: var(--loquix-mode-tab-color, var(--loquix-text-secondary-color, #4b5563));
    font-family: inherit;
    font-size: var(--loquix-mode-tab-font-size, 0.8125rem);
    font-weight: 500;
    cursor: pointer;
    white-space: nowrap;
    transition: background 0.15s ease, color 0.15s ease, box-shadow 0.15s ease;
    line-height: 1.4;
  }

  .toggle__option--active {
    background: var(--loquix-mode-toggle-active-bg, #ffffff);
    color: var(--loquix-mode-tab-active-color, var(--loquix-ai-color, #7c3aed));
    box-shadow: var(--loquix-shadow-sm);
  }

  .toggle__option:hover:not(:disabled):not(.toggle__option--active) {
    background: var(--loquix-overlay-subtle);
  }

  .toggle__option:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .toggle__option:focus-visible {
    outline: 2px solid var(--loquix-ai-color, #7c3aed);
    outline-offset: -2px;
  }

  .toggle__icon {
    flex-shrink: 0;
    font-size: 1rem;
    line-height: 1;
  }

  .toggle__label {
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* =========================================
   * Dropdown variant
   * ========================================= */

  .trigger {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: var(--loquix-mode-dropdown-trigger-padding, 4px 10px);
    border: none;
    border-radius: var(--loquix-mode-dropdown-trigger-radius, 8px);
    background: var(--loquix-mode-dropdown-trigger-bg, transparent);
    color: var(--loquix-mode-dropdown-trigger-color, inherit);
    font-family: inherit;
    font-size: var(--loquix-mode-tab-font-size, 0.8125rem);
    font-weight: 500;
    cursor: pointer;
    white-space: nowrap;
    transition: background 0.15s ease, opacity 0.15s ease;
    line-height: 1.4;
  }

  .trigger:hover:not(:disabled) {
    background: var(--loquix-mode-dropdown-trigger-hover-bg, rgba(128, 128, 128, 0.12));
  }

  .trigger:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .trigger__icon {
    flex-shrink: 0;
  }

  .trigger__label {
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .trigger__chevron {
    width: 12px;
    height: 12px;
    flex-shrink: 0;
    opacity: 0.5;
    transition: transform 0.2s ease;
  }

  :host([open]) .trigger__chevron {
    transform: rotate(180deg);
  }

  /* === Dropdown panel === */

  .panel {
    position: absolute;
    left: 0;
    top: 0;
    z-index: var(--loquix-mode-dropdown-z-index, 1000);
    min-width: var(--loquix-mode-dropdown-min-width, 200px);
    max-width: var(--loquix-mode-dropdown-max-width, 300px);
    width: max-content;
    display: flex;
    flex-direction: column;
    padding: 4px;
    border-radius: var(--loquix-mode-dropdown-panel-radius, 12px);
    background: var(--loquix-mode-dropdown-panel-bg, var(--loquix-dropdown-panel-bg, #1e1e2e));
    border: 1px solid var(--loquix-mode-dropdown-panel-border-color, rgba(255, 255, 255, 0.08));
    box-shadow: var(
      --loquix-mode-dropdown-panel-shadow,
      0 4px 24px rgba(0, 0, 0, 0.3),
      0 1px 4px rgba(0, 0, 0, 0.2)
    );
    overflow: hidden;
  }

  .panel[hidden] {
    display: none;
  }

  /* === Dropdown option === */

  .option {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 8px 10px;
    border: none;
    border-radius: 8px;
    background: transparent;
    color: var(--loquix-mode-dropdown-option-color, var(--loquix-dropdown-option-color, #cdd6f4));
    font-family: inherit;
    font-size: 0.8125rem;
    text-align: left;
    cursor: pointer;
    transition: background 0.12s ease;
    line-height: 1.4;
  }

  .option:hover {
    background: var(--loquix-mode-dropdown-option-hover-bg, rgba(255, 255, 255, 0.06));
  }

  .option--active {
    background: var(--loquix-mode-dropdown-option-active-bg, rgba(255, 255, 255, 0.04));
  }

  .option:focus-visible {
    outline: 2px solid var(--loquix-ai-color, #7c3aed);
    outline-offset: -2px;
  }

  .option__icon {
    flex-shrink: 0;
    font-size: 1rem;
    line-height: 1;
  }

  .option__content {
    flex: 1;
    min-width: 0;
  }

  .option__label {
    font-weight: 500;
    color: var(--loquix-mode-dropdown-option-label-color, #e0e0e0);
  }

  .option__description {
    margin-top: 2px;
    font-size: 0.75rem;
    color: var(--loquix-mode-dropdown-option-desc-color, rgba(255, 255, 255, 0.55));
  }

  .option__check {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    color: var(--loquix-ai-color, #7c3aed);
    opacity: 0;
  }

  .option--active .option__check {
    opacity: 1;
  }
`;

export default styles;
