import { css } from 'lit';

const styles = css`
  :host {
    display: inline-block;
    position: relative;
    font-family: var(--loquix-font-family, system-ui, -apple-system, sans-serif);
  }

  /* === Trigger button === */

  .trigger {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: var(--loquix-model-trigger-padding, 4px 10px);
    border: none;
    border-radius: var(--loquix-model-trigger-radius, 8px);
    background: var(--loquix-model-trigger-bg, transparent);
    color: var(--loquix-model-trigger-color, inherit);
    font-family: inherit;
    font-size: var(--loquix-model-trigger-font-size, 0.8125rem);
    cursor: pointer;
    white-space: nowrap;
    transition: background 0.15s ease, opacity 0.15s ease;
    line-height: 1.4;
  }

  .trigger:hover:not(:disabled) {
    background: var(--loquix-model-trigger-hover-bg, rgba(128, 128, 128, 0.12));
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

  .trigger__tier {
    font-size: 0.6875rem;
    padding: 1px 5px;
    border-radius: 4px;
    font-weight: 500;
    line-height: 1.3;
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

  /* === Panel === */

  .panel {
    position: absolute;
    left: 0;
    top: 0;
    z-index: var(--loquix-model-z-index, 1000);
    min-width: var(--loquix-model-panel-min-width, 260px);
    max-width: var(--loquix-model-panel-max-width, 380px);
    width: max-content;
    display: flex;
    flex-direction: column;
    border-radius: var(--loquix-model-panel-radius, 12px);
    background: var(--loquix-model-panel-bg, #1e1e2e);
    border: 1px solid var(--loquix-model-panel-border-color, rgba(255, 255, 255, 0.08));
    box-shadow: var(
      --loquix-model-panel-shadow,
      0 4px 24px rgba(0, 0, 0, 0.3),
      0 1px 4px rgba(0, 0, 0, 0.2)
    );
    overflow: hidden;
  }

  .panel[hidden] {
    display: none;
  }

  /* === Search === */

  .search {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-bottom: 1px solid var(--loquix-model-divider-color, rgba(255, 255, 255, 0.06));
  }

  .search__icon {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
    opacity: 0.4;
    color: var(--loquix-model-option-color, #cdd6f4);
  }

  .search__input {
    flex: 1;
    border: none;
    background: transparent;
    color: var(--loquix-model-option-color, #cdd6f4);
    font-family: inherit;
    font-size: 0.8125rem;
    outline: none;
  }

  .search__input::placeholder {
    color: var(--loquix-model-option-desc-color, rgba(255, 255, 255, 0.35));
  }

  /* === Options list === */

  .options {
    overflow-y: auto;
    padding: 4px;
    max-height: var(--loquix-model-max-height, 320px);
    scrollbar-width: thin;
  }

  /* === Group header === */

  .group-header {
    padding: 8px 10px 4px;
    font-size: 0.6875rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--loquix-model-group-color, rgba(255, 255, 255, 0.35));
  }

  /* === Option item === */

  .option {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 8px 10px;
    border: none;
    border-radius: 8px;
    background: transparent;
    color: var(--loquix-model-option-color, #cdd6f4);
    font-family: inherit;
    font-size: 0.8125rem;
    text-align: left;
    cursor: pointer;
    transition: background 0.12s ease;
    line-height: 1.4;
  }

  .option:hover:not(.option--disabled) {
    background: var(--loquix-model-option-hover-bg, rgba(255, 255, 255, 0.06));
  }

  .option--active {
    background: var(--loquix-model-option-active-bg, rgba(255, 255, 255, 0.04));
  }

  .option--focused {
    background: var(--loquix-model-option-hover-bg, rgba(255, 255, 255, 0.06));
  }

  .option--disabled {
    opacity: 0.4;
    cursor: not-allowed;
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

  .option__label-row {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .option__label {
    font-weight: 500;
    color: var(--loquix-model-option-label-color, #e0e0e0);
  }

  .option__tier {
    font-size: 0.6875rem;
    padding: 1px 5px;
    border-radius: 4px;
    font-weight: 500;
    line-height: 1.3;
  }

  /* Tier color variants */
  .tier--pro {
    background: var(--loquix-model-tier-pro-bg, rgba(124, 58, 237, 0.15));
    color: var(--loquix-model-tier-pro-color, #a78bfa);
  }

  .tier--standard {
    background: var(--loquix-model-tier-standard-bg, rgba(59, 130, 246, 0.15));
    color: var(--loquix-model-tier-standard-color, #60a5fa);
  }

  .tier--free {
    background: var(--loquix-model-tier-free-bg, rgba(34, 197, 94, 0.15));
    color: var(--loquix-model-tier-free-color, #4ade80);
  }

  .tier--enterprise {
    background: var(--loquix-model-tier-enterprise-bg, rgba(245, 158, 11, 0.15));
    color: var(--loquix-model-tier-enterprise-color, #fbbf24);
  }

  .option__description {
    margin-top: 2px;
    font-size: 0.75rem;
    color: var(--loquix-model-option-desc-color, rgba(255, 255, 255, 0.45));
  }

  /* === Capabilities === */

  .option__capabilities {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-top: 4px;
  }

  .option__capability {
    font-size: 0.6875rem;
    padding: 1px 6px;
    border-radius: 4px;
    background: var(--loquix-model-capability-bg, rgba(255, 255, 255, 0.06));
    color: var(--loquix-model-capability-color, rgba(255, 255, 255, 0.5));
  }

  /* === Trailing === */

  .option__trailing {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;
  }

  .option__cost {
    font-size: 0.6875rem;
    color: var(--loquix-model-cost-color, rgba(255, 255, 255, 0.45));
    white-space: nowrap;
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

  /* === Empty state === */

  .empty {
    padding: 16px;
    text-align: center;
    font-size: 0.8125rem;
    color: var(--loquix-model-option-desc-color, rgba(255, 255, 255, 0.35));
  }
`;

export default styles;
