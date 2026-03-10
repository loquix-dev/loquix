import { css } from 'lit';

const styles = css`
  :host {
    display: block;
    font-family: var(--loquix-font-family, system-ui, -apple-system, sans-serif);
  }

  /* === Panel container === */

  .panel {
    padding: var(--loquix-param-panel-padding, 16px);
    border-radius: var(--loquix-param-panel-radius, 12px);
    background: var(--loquix-param-panel-bg, var(--loquix-surface-bg, #ffffff));
  }

  /* === Presets row === */

  .presets {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 16px;
  }

  .preset {
    display: inline-flex;
    align-items: center;
    padding: 5px 12px;
    border: 1px solid var(--loquix-param-preset-border-color, rgba(0, 0, 0, 0.1));
    border-radius: 9999px;
    background: var(--loquix-param-preset-bg, var(--loquix-surface-secondary-bg, #f9fafb));
    color: var(--loquix-param-preset-color, var(--loquix-text-secondary-color, #6b7280));
    font-family: inherit;
    font-size: 0.8125rem;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
  }

  .preset:hover:not(:disabled) {
    background: var(--loquix-param-preset-hover-bg, rgba(0, 0, 0, 0.04));
  }

  .preset--active {
    background: var(--loquix-param-preset-active-bg, var(--loquix-ai-color-subtle, #ede9fe));
    color: var(--loquix-param-preset-active-color, var(--loquix-ai-color, #7c3aed));
    border-color: var(--loquix-param-preset-active-border-color, var(--loquix-ai-color, #7c3aed));
  }

  .preset:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  /* === Params list === */

  .params {
    display: flex;
    flex-direction: column;
    gap: var(--loquix-param-panel-gap, 16px);
  }

  /* === Single parameter === */

  .param {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .param__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .param__label {
    font-size: var(--loquix-param-label-font-size, 0.8125rem);
    font-weight: 500;
    color: var(--loquix-param-label-color, var(--loquix-text-color, #111827));
  }

  .param__value {
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--loquix-param-value-color, var(--loquix-ai-color, #7c3aed));
    font-variant-numeric: tabular-nums;
  }

  .param__description {
    font-size: 0.75rem;
    color: var(--loquix-param-description-color, var(--loquix-text-secondary-color, #6b7280));
    margin-top: -2px;
  }

  /* === Range input === */

  .param__range {
    width: 100%;
    height: 20px;
    cursor: pointer;
    -webkit-appearance: none;
    appearance: none;
    background: transparent;
  }

  .param__range:focus-visible {
    outline: 2px solid var(--loquix-ai-color, #7c3aed);
    outline-offset: 2px;
    border-radius: 2px;
  }

  /* WebKit track */
  .param__range::-webkit-slider-runnable-track {
    height: var(--loquix-param-range-track-height, 4px);
    border-radius: 9999px;
    background: linear-gradient(
      to right,
      var(--loquix-param-range-fill-bg, var(--loquix-ai-color, #7c3aed)) var(--range-pct, 0%),
      var(--loquix-param-range-track-bg, var(--loquix-border-color, #e5e7eb)) var(--range-pct, 0%)
    );
  }

  .param__range::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: var(--loquix-param-range-thumb-size, 16px);
    height: var(--loquix-param-range-thumb-size, 16px);
    border-radius: 50%;
    background: var(--loquix-param-range-thumb-bg, var(--loquix-ai-color, #7c3aed));
    border: 2px solid var(--loquix-param-range-thumb-border-color, #ffffff);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    margin-top: calc(
      (var(--loquix-param-range-thumb-size, 16px) - var(--loquix-param-range-track-height, 4px)) /
        -2
    );
    cursor: pointer;
    transition: transform 0.1s ease;
  }

  .param__range::-webkit-slider-thumb:hover {
    transform: scale(1.15);
  }

  /* Firefox track */
  .param__range::-moz-range-track {
    height: var(--loquix-param-range-track-height, 4px);
    border-radius: 9999px;
    background: var(--loquix-param-range-track-bg, var(--loquix-border-color, #e5e7eb));
  }

  .param__range::-moz-range-progress {
    height: var(--loquix-param-range-track-height, 4px);
    border-radius: 9999px;
    background: var(--loquix-param-range-fill-bg, var(--loquix-ai-color, #7c3aed));
  }

  .param__range::-moz-range-thumb {
    width: var(--loquix-param-range-thumb-size, 16px);
    height: var(--loquix-param-range-thumb-size, 16px);
    border-radius: 50%;
    background: var(--loquix-param-range-thumb-bg, var(--loquix-ai-color, #7c3aed));
    border: 2px solid var(--loquix-param-range-thumb-border-color, #ffffff);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    cursor: pointer;
  }

  .param__range:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .param__limits {
    display: flex;
    justify-content: space-between;
    font-size: 0.6875rem;
    color: var(--loquix-param-description-color, var(--loquix-text-secondary-color, #6b7280));
    margin-top: -2px;
  }

  /* === Toggle switch === */

  .param--toggle .param__header {
    cursor: pointer;
  }

  .toggle-btn {
    position: relative;
    width: 36px;
    height: 20px;
    padding: 0;
    border: none;
    border-radius: 10px;
    background: var(--loquix-param-toggle-bg, var(--loquix-border-color, #d1d5db));
    cursor: pointer;
    transition: background 0.2s ease;
    flex-shrink: 0;
  }

  .toggle-btn--on {
    background: var(--loquix-param-toggle-on-bg, var(--loquix-ai-color, #7c3aed));
  }

  .toggle-btn__thumb {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--loquix-param-toggle-thumb-bg, #ffffff);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
    transition: transform 0.2s ease;
  }

  .toggle-btn--on .toggle-btn__thumb {
    transform: translateX(16px);
  }

  .toggle-btn:focus-visible {
    outline: 2px solid var(--loquix-ai-color, #7c3aed);
    outline-offset: 2px;
  }

  .toggle-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  /* === Number input === */

  .param__number {
    width: 100%;
    box-sizing: border-box;
    padding: 6px 10px;
    border: 1px solid
      var(--loquix-param-input-border-color, var(--loquix-input-border-color, #d1d5db));
    border-radius: 8px;
    background: var(--loquix-param-input-bg, var(--loquix-input-bg, #ffffff));
    color: inherit;
    font-family: inherit;
    font-size: 0.8125rem;
    outline: none;
    transition: border-color 0.15s ease;
  }

  .param__number:focus {
    border-color: var(--loquix-ai-color, #7c3aed);
  }

  .param__number:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  /* === Select input === */

  .param__select {
    width: 100%;
    box-sizing: border-box;
    padding: 6px 10px;
    border: 1px solid
      var(--loquix-param-input-border-color, var(--loquix-input-border-color, #d1d5db));
    border-radius: 8px;
    background: var(--loquix-param-input-bg, var(--loquix-input-bg, #ffffff));
    color: inherit;
    font-family: inherit;
    font-size: 0.8125rem;
    outline: none;
    cursor: pointer;
    transition: border-color 0.15s ease;
  }

  .param__select:focus {
    border-color: var(--loquix-ai-color, #7c3aed);
  }

  .param__select:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  /* === Advanced toggle === */

  .advanced-toggle {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-top: 12px;
    padding: 4px 0;
    border: none;
    background: transparent;
    color: var(--loquix-param-description-color, var(--loquix-text-secondary-color, #6b7280));
    font-family: inherit;
    font-size: 0.75rem;
    cursor: pointer;
    transition: color 0.15s ease;
  }

  .advanced-toggle:hover {
    color: var(--loquix-ai-color, #7c3aed);
  }

  .advanced-toggle__chevron {
    width: 12px;
    height: 12px;
    transition: transform 0.2s ease;
  }

  :host([show-advanced]) .advanced-toggle__chevron {
    transform: rotate(180deg);
  }

  /* === Compact mode === */

  :host([compact]) .params {
    gap: 10px;
  }

  :host([compact]) .param__description {
    display: none;
  }

  :host([compact]) .panel {
    padding: 12px;
  }
`;

export default styles;
