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
    padding: var(--loquix-dropdown-trigger-padding, 4px 10px);
    border: none;
    border-radius: var(--loquix-dropdown-trigger-radius, 8px);
    background: var(--loquix-dropdown-trigger-bg, transparent);
    color: var(--loquix-dropdown-trigger-color, inherit);
    font-family: inherit;
    font-size: var(--loquix-dropdown-trigger-font-size, 0.8125rem);
    cursor: pointer;
    white-space: nowrap;
    transition: background 0.15s ease, opacity 0.15s ease;
    line-height: 1.4;
  }

  .trigger:hover {
    background: var(--loquix-dropdown-trigger-hover-bg, rgba(128, 128, 128, 0.12));
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
    z-index: var(--loquix-dropdown-z-index, 1000);
    min-width: var(--loquix-dropdown-min-width, 220px);
    max-width: var(--loquix-dropdown-max-width, 320px);
    width: max-content;
    display: flex;
    flex-direction: column;
    border-radius: var(--loquix-dropdown-panel-radius, 12px);
    background: var(--loquix-dropdown-panel-bg, #1e1e2e);
    border: 1px solid var(--loquix-dropdown-panel-border-color, rgba(255, 255, 255, 0.08));
    box-shadow: var(
      --loquix-dropdown-panel-shadow,
      0 4px 24px rgba(0, 0, 0, 0.3),
      0 1px 4px rgba(0, 0, 0, 0.2)
    );
    overflow: hidden;
  }

  .panel[hidden] {
    display: none;
  }

  /* === Search input === */

  .search {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-bottom: 1px solid var(--loquix-dropdown-divider-color, rgba(255, 255, 255, 0.06));
  }

  .search__icon {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
    opacity: 0.4;
    color: var(--loquix-dropdown-option-color, #cdd6f4);
  }

  .search__input {
    flex: 1;
    border: none;
    background: transparent;
    color: var(--loquix-dropdown-option-color, #cdd6f4);
    font-family: inherit;
    font-size: 0.8125rem;
    outline: none;
  }

  .search__input::placeholder {
    color: var(--loquix-dropdown-option-desc-color, rgba(255, 255, 255, 0.5));
  }

  /* === Options list === */

  .options {
    overflow-y: auto;
    padding: 4px;
    scrollbar-width: thin;
  }

  /* === Group header === */

  .group-header {
    padding: 8px 10px 4px;
    font-size: 0.6875rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--loquix-dropdown-group-color, rgba(255, 255, 255, 0.5));
  }

  /* === Separator === */

  .separator {
    margin: 4px 8px;
    border: none;
    border-top: 1px solid var(--loquix-dropdown-divider-color, rgba(255, 255, 255, 0.06));
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
    color: var(--loquix-dropdown-option-color, #cdd6f4);
    font-family: inherit;
    font-size: 0.8125rem;
    text-align: left;
    cursor: pointer;
    transition: background 0.12s ease;
    line-height: 1.4;
  }

  .option:hover:not(.option--disabled) {
    background: var(--loquix-dropdown-option-hover-bg, rgba(255, 255, 255, 0.06));
  }

  .option:focus-visible {
    outline: 2px solid var(--loquix-ai-color, #7c3aed);
    outline-offset: -2px;
  }

  .option--active {
    background: var(--loquix-dropdown-option-active-bg, rgba(255, 255, 255, 0.04));
  }

  .option--disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .option--focused {
    background: var(--loquix-dropdown-option-hover-bg, rgba(255, 255, 255, 0.06));
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
    color: var(--loquix-dropdown-option-label-color, #e0e0e0);
  }

  .option__description {
    margin-top: 2px;
    font-size: 0.75rem;
    color: var(--loquix-dropdown-option-desc-color, rgba(255, 255, 255, 0.55));
  }

  .option__trailing {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;
  }

  .option__badge {
    font-size: 0.6875rem;
    padding: 1px 5px;
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.06);
    color: var(--loquix-dropdown-option-desc-color, rgba(255, 255, 255, 0.5));
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

  .option__external {
    width: 12px;
    height: 12px;
    opacity: 0.4;
  }

  .option__arrow {
    width: 12px;
    height: 12px;
    opacity: 0.4;
    transition: opacity 0.12s ease;
  }

  .option--submenu-open .option__arrow {
    opacity: 0.8;
  }

  .option--submenu-open {
    background: var(--loquix-dropdown-option-hover-bg, rgba(255, 255, 255, 0.06));
  }

  /* === Submenu panel === */

  .submenu {
    position: absolute;
    left: 0;
    top: 0;
    z-index: calc(var(--loquix-dropdown-z-index, 1000) + 1);
    min-width: var(--loquix-dropdown-submenu-min-width, 180px);
    max-width: var(--loquix-dropdown-max-width, 320px);
    width: max-content;
    display: flex;
    flex-direction: column;
    padding: 4px;
    border-radius: var(--loquix-dropdown-panel-radius, 12px);
    background: var(--loquix-dropdown-panel-bg, #1e1e2e);
    border: 1px solid var(--loquix-dropdown-panel-border-color, rgba(255, 255, 255, 0.08));
    box-shadow: var(
      --loquix-dropdown-panel-shadow,
      0 4px 24px rgba(0, 0, 0, 0.3),
      0 1px 4px rgba(0, 0, 0, 0.2)
    );
    overflow-y: auto;
  }

  /* === Footer slot === */

  .footer {
    border-top: 1px solid var(--loquix-dropdown-divider-color, rgba(255, 255, 255, 0.06));
    padding: 4px;
  }

  .footer:empty {
    display: none;
  }

  /* === Hint tooltip === */

  .hint {
    position: absolute;
    right: calc(100% + 8px);
    bottom: calc(100% + 4px);
    padding: 6px 10px;
    border-radius: 8px;
    background: var(--loquix-dropdown-hint-bg, #2a2a3e);
    border: 1px solid var(--loquix-dropdown-hint-border-color, rgba(255, 255, 255, 0.08));
    color: var(--loquix-dropdown-hint-color, #a0a0b0);
    font-size: 0.75rem;
    white-space: nowrap;
    pointer-events: none;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }

  .hint[hidden] {
    display: none;
  }
`;

export default styles;
